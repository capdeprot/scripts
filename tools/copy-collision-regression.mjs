import { createServer } from 'node:http';
import { readFile, rm } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = '/home/ubuntu/work_scriptz/scriptz-v86-clipboard';
const port = 4192;
const debugPort = 9282;
const profile = '/tmp/scriptz-copy-collision-regression';
const mime = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url || '/', `http://127.0.0.1:${port}`).pathname;
    const file = resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`);
    if (!file.startsWith(root)) throw new Error('invalid path');
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(await readFile(file));
  } catch { response.writeHead(404).end('Not found'); }
});
const pause = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
let socket;
let requestId = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((resolvePromise, reject) => {
  const id = ++requestId;
  pending.set(id, { resolve: resolvePromise, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text || 'Evaluation failed');
  return response.result?.value;
};

let chrome;
try {
  await new Promise(resolvePromise => server.listen(port, '127.0.0.1', resolvePromise));
  await rm(profile, { recursive: true, force: true });
  chrome = spawn('chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  let websocketUrl;
  for (let attempt = 0; attempt < 50 && !websocketUrl; attempt += 1) {
    try { websocketUrl = (await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json())[0]?.webSocketDebuggerUrl; } catch {}
    await pause(100);
  }
  if (!websocketUrl) throw new Error('DevTools unavailable');
  socket = new WebSocket(websocketUrl);
  await new Promise((resolvePromise, reject) => {
    socket.addEventListener('open', resolvePromise, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const handler = pending.get(message.id);
      pending.delete(message.id);
      message.error ? handler.reject(new Error(message.error.message)) : handler.resolve(message.result);
    }
  });
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('scriptz_workspace', JSON.stringify({mode:'standard',division:'DEPROT'})); localStorage.setItem('scriptz_daily_welcome_date', new Date().toISOString().slice(0,10)); localStorage.setItem('user_signature','Nome Teste');` });
  await send('Page.navigate', { url: `http://127.0.0.1:${port}/?test=copy-collision` });
  await pause(1200);

  const result = await evaluate(`(async () => {
    activeLibrary = 'personal';
    activeCat = 'all';
    isInitialLanding = false;
    const standard = standardScripts[0];
    const duplicateId = standard.id;
    const personal = normalizeScript({ id: duplicateId, cat: 'Teste pessoal', cats: ['Teste pessoal'], title: 'PESSOAL — referência correta', html: '<p>Conteúdo pessoal correto.</p>', hasSignature: false }, 'user');
    personal.id = duplicateId;
    categoryRegistry = ['Teste pessoal'];
    scripts = [standard, personal];
    reconcileCategoryHierarchy();
    let copied = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { write: async items => { copied = await items[0].getType('text/plain').then(blob => blob.text()); }, writeText: async text => { copied = text; } } });
    render();
    const card = document.querySelector('#cards .card[data-source="user"]');
    const oldResolutionTitle = scripts.find(script => script.id === duplicateId)?.title || '';
    await copyScript(duplicateId, 'user');
    return { duplicateId, oldResolutionTitle, expectedTitle: personal.title, copiedIncludesPersonal: copied.includes('Conteúdo pessoal correto.'), copiedIncludesStandard: copied.includes(standard.html.replace(/<[^>]*>/g, '')), cardSource: card?.dataset.source || '' };
  })()`);
  console.log(JSON.stringify(result, null, 2));
  const reproducedPreviousBug = result.oldResolutionTitle !== result.expectedTitle;
  const fixed = reproducedPreviousBug && result.copiedIncludesPersonal && !result.copiedIncludesStandard && result.cardSource === 'user';
  console.log(JSON.stringify({ reproducedPreviousBug, fixed }, null, 2));
  if (!fixed) process.exitCode = 1;
} finally {
  socket?.close();
  chrome?.kill('SIGTERM');
  server.close();
}

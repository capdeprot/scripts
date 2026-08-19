import { spawn } from 'node:child_process';
import { writeFile, rm } from 'node:fs/promises';

const outputPath = '/home/ubuntu/screenshots/deprot-v50-results.json';
const url = 'http://localhost:4175/?test=deprot-v50';
const port = 9280;
const profile = '/tmp/scriptz-deprot-v50';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

await rm(profile, { recursive: true, force: true });
const chrome = spawn('chromium', [
  '--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore' });
let socket;
let requestId = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++requestId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result?.value;
};

try {
  let websocketUrl;
  for (let attempt = 0; attempt < 40 && !websocketUrl; attempt += 1) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      websocketUrl = pages[0]?.webSocketDebuggerUrl;
    } catch {}
    await pause(120);
  }
  if (!websocketUrl) throw new Error('Depurador indisponível');
  socket = new WebSocket(websocketUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
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
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `const now=new Date();const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');localStorage.setItem('scriptz_workspace',JSON.stringify({mode:'standard',division:'DEPROT'}));localStorage.setItem('scriptz_daily_welcome_date',today);localStorage.setItem('theme','midnight');`
  });
  await send('Page.navigate', { url });
  await pause(1400);
  const result = await evaluate(`(() => {
    const dual = scripts.find(script => script.cats.length === 2);
    const beforeEdit = activeEditId;
    startEdit(scripts[0].id);
    const afterEdit = activeEditId;
    const standardLock = document.querySelector('.standard-lock');
    return {
      mode: workspace.mode,
      division: workspace.division,
      scriptCount: scripts.length,
      categoryCount: categoryRegistry.length,
      protectedCount: scripts.filter(script => script.isStandard).length,
      dualCategories: dual?.cats || [],
      dualVisibleInBoth: dual ? dual.cats.every(category => getCategories().includes(category)) : false,
      editBlocked: beforeEdit === null && afterEdit === null,
      exportLabel: document.getElementById('exportScriptsBtn').textContent.trim(),
      baseLabel: document.getElementById('loadTemplateBaseBtn').textContent.trim(),
      textLabel: document.getElementById('newText')?.closest('.field')?.querySelector('label')?.textContent.trim(),
      standardLockCount: document.querySelectorAll('.standard-lock').length,
      legacyBadgeCount: document.querySelectorAll('.standard-badge').length,
      lockTitle: standardLock?.getAttribute('title') || '',
      lockLabel: standardLock?.getAttribute('aria-label') || '',
      lockUsesSvg: Boolean(standardLock?.querySelector('svg'))
    };
  })()`);
  const valid = result.mode === 'standard' && result.division === 'DEPROT' && result.scriptCount === 10 && result.categoryCount === 5
    && result.protectedCount === 10 && result.dualCategories.length === 2 && result.dualVisibleInBoth && result.editBlocked
    && result.exportLabel === '📤 Exportar meus scriptz' && result.baseLabel === '📂 Usar script padrão como base' && result.textLabel === 'Texto'
    && result.standardLockCount === 10 && result.legacyBadgeCount === 0 && result.lockTitle === 'Script padrão protegido'
    && result.lockLabel === 'Script padrão protegido' && result.lockUsesSvg;
  if (!valid) throw new Error(`Integração DEPROT v50 inválida: ${JSON.stringify(result)}`);
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile('/home/ubuntu/screenshots/deprot-v51-standard-lock.png', Buffer.from(screenshot.data, 'base64'));
  await writeFile(outputPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  socket?.close();
  chrome.kill('SIGTERM');
}

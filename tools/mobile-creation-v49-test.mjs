import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';

const outputDir = '/home/ubuntu/screenshots/mobile-creation-v49';
const url = 'http://localhost:4175/?test=mobile-creation-v49';
const port = 9271;
const profile = '/tmp/scriptz-mobile-creation-v49';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
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
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `const now=new Date();const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');localStorage.setItem('scriptz_workspace',JSON.stringify({mode:'free',division:null}));localStorage.setItem('scriptz_daily_welcome_date',today);localStorage.setItem('theme','midnight');`
  });
  await send('Page.navigate', { url });
  await pause(900);
  const state = await evaluate(`(() => {
    categoryRegistry = ['Atendimento', 'Fiscalização'];
    customCategoryOrder = [...categoryRegistry];
    openModal();
    const modal = document.querySelector('.new-script-modal');
    const stack = document.querySelector('.category-select-stack');
    const editor = document.getElementById('newText');
    const actions = modal.querySelector('.modal-btns');
    return {
      modalOverflow: getComputedStyle(modal).overflowY,
      stackColumns: getComputedStyle(stack).gridTemplateColumns,
      editorOverflow: getComputedStyle(editor).overflowY,
      primaryVisible: Boolean(document.getElementById('newCategoryPrimary')),
      secondaryVisible: Boolean(document.getElementById('newCategorySecondary')),
      actionsVisible: getComputedStyle(actions).display !== 'none'
    };
  })()`);
  const valid = state.modalOverflow === 'auto' && state.editorOverflow === 'auto' && state.primaryVisible && state.secondaryVisible && state.actionsVisible;
  if (!valid) throw new Error(`Validação mobile v49 inválida: ${JSON.stringify(state)}`);
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(`${outputDir}/form-open.png`, Buffer.from(screenshot.data, 'base64'));
  await writeFile(`${outputDir}/results.json`, JSON.stringify(state, null, 2));
  console.log(JSON.stringify(state, null, 2));
} finally {
  socket?.close();
  chrome.kill('SIGTERM');
}

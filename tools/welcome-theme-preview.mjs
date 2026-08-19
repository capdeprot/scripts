import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';

const outputDir = '/home/ubuntu/screenshots/welcome-themes-v48';
const url = 'http://localhost:4175/?welcome=themes-v48';
const themes = [
  { name: 'claro', value: 'light' },
  { name: 'escuro', value: 'black' },
  { name: 'blue-midnight', value: 'midnight' },
  { name: 'dark-purple', value: 'purple' }
];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
const results = [];

for (const [index, theme] of themes.entries()) {
  const port = 9260 + index;
  const profile = `/tmp/scriptz-welcome-preview-${theme.value}`;
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
    if (!websocketUrl) throw new Error(`Depurador indisponível: ${theme.name}`);
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
      source: `localStorage.setItem('scriptz_workspace', JSON.stringify({mode:'free',division:null}));localStorage.setItem('theme','${theme.value}');localStorage.removeItem('scriptz_daily_welcome_date');`
    });
    await send('Page.navigate', { url });
    await pause(820);
    const state = await evaluate(`(() => ({
      theme: document.documentElement.getAttribute('data-theme'),
      gate: document.documentElement.classList.contains('scriptz-awaiting-daily-welcome'),
      splashVisible: document.getElementById('welcomeSplash').classList.contains('visible')
    }))()`);
    if (state.theme !== theme.value || !state.gate || !state.splashVisible) throw new Error(`Prévia inválida: ${theme.name}`);
    const image = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(`${outputDir}/${theme.name}.png`, Buffer.from(image.data, 'base64'));
    results.push({ theme: theme.name, ...state });
  } finally {
    socket?.close();
    chrome.kill('SIGTERM');
  }
}

await writeFile(`${outputDir}/results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));

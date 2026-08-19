import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';

const outputDir = '/home/ubuntu/screenshots/daily-welcome-v48';
const url = 'http://localhost:4175/?daily=validation-v48';
const variants = [
  { name: 'desktop-purple', width: 1280, height: 720, mobile: false, theme: 'purple' },
  { name: 'mobile-midnight', width: 375, height: 812, mobile: true, theme: 'midnight' }
];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
const results = [];

for (const variant of variants) {
  const port = variant.mobile ? 9251 : 9250;
  const profile = `/tmp/scriptz-daily-${variant.name}`;
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
    if (!websocketUrl) throw new Error(`Depurador indisponível: ${variant.name}`);
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
    await send('Emulation.setDeviceMetricsOverride', {
      width: variant.width, height: variant.height, deviceScaleFactor: variant.mobile ? 2 : 1, mobile: variant.mobile
    });
    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `localStorage.setItem('scriptz_workspace', JSON.stringify({mode:'free',division:null}));localStorage.setItem('user_signature','Maria Silva');localStorage.setItem('theme','${variant.theme}');localStorage.removeItem('scriptz_daily_welcome_date');`
    });
    await send('Page.navigate', { url });
    await pause(820);
    const active = await evaluate(`(() => ({
      gate: document.documentElement.classList.contains('scriptz-awaiting-daily-welcome'),
      theme: document.documentElement.getAttribute('data-theme'),
      layoutVisibility: getComputedStyle(document.querySelector('.layout')).visibility,
      splashVisible: document.getElementById('welcomeSplash').classList.contains('visible'),
      splashLabel: document.querySelector('#welcomeSplash p').textContent,
      splashWordmark: document.querySelector('#welcomeSplash strong').textContent,
      menuHidden: document.getElementById('welcomeMenu').hidden
    }))()`);
    const image = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(`${outputDir}/${variant.name}-active.png`, Buffer.from(image.data, 'base64'));
    await pause(3500);
    const closed = await evaluate(`(() => ({
      gate: document.documentElement.classList.contains('scriptz-awaiting-daily-welcome'),
      screenHidden: document.getElementById('welcomeScreen').hidden,
      layoutVisibility: getComputedStyle(document.querySelector('.layout')).visibility,
      storedDate: localStorage.getItem('scriptz_daily_welcome_date')
    }))()`);
    const validActive = active.gate && active.theme === variant.theme && active.layoutVisibility === 'hidden'
      && active.splashVisible && active.splashLabel === 'Bem-vindo(a) ao' && active.splashWordmark === 'scriptz' && active.menuHidden;
    const validClosed = !closed.gate && closed.screenHidden && closed.layoutVisibility === 'visible' && Boolean(closed.storedDate);
    if (!validActive || !validClosed) throw new Error(`Resultado inválido para ${variant.name}: ${JSON.stringify({ active, closed })}`);
    results.push({ device: variant.name, active, closed });
  } finally {
    socket?.close();
    chrome.kill('SIGTERM');
  }
}

await writeFile(`${outputDir}/daily-welcome-results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));

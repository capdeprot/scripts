import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';

const outputDir = '/home/ubuntu/screenshots/onboarding-v44';
const url = 'http://localhost:4175/?onboarding=first-paint-v44';
const variants = [
  { name: 'desktop', width: 1280, height: 720, mobile: false },
  { name: 'mobile', width: 375, height: 812, mobile: true }
];

const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
const results = [];

for (const variant of variants) {
  const port = variant.mobile ? 9236 : 9235;
  const profile = `/tmp/scriptz-onboarding-${variant.name}`;
  await rm(profile, { recursive: true, force: true });
  const chrome = spawn('chromium', [
    '--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio: 'ignore' });
  let socket;
  let requestId = 0;
  const pending = new Map();

  const connect = async () => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
        if (pages[0]?.webSocketDebuggerUrl) return pages[0].webSocketDebuggerUrl;
      } catch {}
      await pause(150);
    }
    throw new Error(`Depurador indisponível para ${variant.name}`);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++requestId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result?.value;
  };

  try {
    socket = new WebSocket(await connect());
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
    await send('Page.navigate', { url });
    await pause(120);
    const early = await evaluate(`(() => {
      const root = document.documentElement;
      const layout = document.querySelector('.layout');
      const screen = document.getElementById('welcomeScreen');
      const styles = layout ? getComputedStyle(layout) : null;
      return {
        gate: root.classList.contains('scriptz-awaiting-onboarding'),
        layoutVisibility: styles?.visibility,
        screenHidden: screen?.hidden,
        screenDisplay: screen ? getComputedStyle(screen).display : null,
        screenZIndex: screen ? getComputedStyle(screen).zIndex : null
      };
    })()`);
    const earlyImage = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(`${outputDir}/${variant.name}-early.png`, Buffer.from(earlyImage.data, 'base64'));
    await pause(700);
    const stable = await evaluate(`(() => ({
      gate: document.documentElement.classList.contains('scriptz-awaiting-onboarding'),
      layoutVisibility: getComputedStyle(document.querySelector('.layout')).visibility,
      screenHidden: document.getElementById('welcomeScreen').hidden,
      splashVisible: document.getElementById('welcomeSplash').classList.contains('visible')
    }))()`);
    results.push({ device: variant.name, early, stable });
  } finally {
    socket?.close();
    chrome.kill('SIGTERM');
  }
}

await writeFile(`${outputDir}/first-paint-results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));

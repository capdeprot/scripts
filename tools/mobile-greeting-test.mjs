import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';

const port = 9234;
const profile = '/tmp/scriptz-mobile-functional-profile';
const outputDir = '/home/ubuntu/screenshots/mobile-v42';
const pageUrl = 'http://localhost:4175/?mobile=functional-v46';
const width = Number(process.env.MOBILE_WIDTH || 375);
const height = Number(process.env.MOBILE_HEIGHT || 812);

await rm(profile, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const chrome = spawn('chromium', [
  '--headless=new', '--no-sandbox', '--disable-gpu',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  'about:blank'
], { stdio: 'ignore' });

const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let ws;
let requestId = 0;
const pending = new Map();

async function waitForDebugger() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      if (pages[0]?.webSocketDebuggerUrl) return pages[0].webSocketDebuggerUrl;
    } catch {}
    await pause(150);
  }
  throw new Error('Não foi possível iniciar o depurador do Chromium.');
}

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result?.value;
}

try {
  const wsUrl = await waitForDebugger();
  ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 2, mobile: true
  });
  await send('Page.navigate', { url: pageUrl });
  await pause(800);
  await pause(4200);

  await evaluate("document.querySelector('.welcome-editor-link button')?.click()");
  await pause(400);
  const homeState = await evaluate(`(() => ({
    sortLabels: [...document.getElementById('sortSelect').options].map(option => option.textContent),
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }))()`);
  const homeImage = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(`${outputDir}/greeting-home-${width}.png`, Buffer.from(homeImage.data, 'base64'));
  await evaluate('openModal()');
  await pause(150);

  const formState = await evaluate(`(() => {
    const greeting = document.getElementById('newGreeting');
    const rect = greeting.getBoundingClientRect();
    return {
      options: [...greeting.options].map(option => option.textContent),
      control: { width: rect.width, height: rect.height },
      viewport: { width: window.innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth },
      modalVisible: document.getElementById('overlay').classList.contains('show')
    };
  })()`);
  const formImage = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(`${outputDir}/greeting-form-${width}.png`, Buffer.from(formImage.data, 'base64'));

  await evaluate(`(() => {
    document.getElementById('newTitle').value = 'Teste mobile de saudação';
    document.getElementById('newText').innerHTML = '<p><strong>Corpo em negrito</strong> e <em>texto em itálico</em>.</p>';
    syncNewScriptEditorState();
    document.getElementById('newGreeting').value = 'formal';
    syncGreetingSelectState(document.getElementById('newGreeting'));
    addScript();
  })()`);
  await pause(250);
  const scriptId = await evaluate('scripts[0].id');
  await evaluate(`startEdit(${scriptId})`);
  await pause(180);
  const editorState = await evaluate(`(() => {
    const greeting = document.getElementById('greeting${scriptId}');
    const rect = greeting.getBoundingClientRect();
    return {
      selected: greeting.value,
      control: { width: rect.width, height: rect.height },
      preview: document.getElementById('pv${scriptId}').innerText.trim(),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  })()`);
  const editorImage = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(`${outputDir}/greeting-editor-${width}.png`, Buffer.from(editorImage.data, 'base64'));

  await evaluate(`(() => {
    const greeting = document.getElementById('greeting${scriptId}');
    greeting.value = 'off';
    greeting.dispatchEvent(new Event('change', { bubbles: true }));
    saveEdit(${scriptId});
  })()`);
  await pause(180);
  await send('Page.reload');
  await pause(600);
  const persistence = await evaluate(`(() => {
    const saved = JSON.parse(localStorage.getItem('scriptz_workspace_free'));
    const item = saved.scripts[0];
    return {
      greetingMode: item.greetingMode,
      hasGreeting: item.hasGreeting,
      previewContainsGreeting: buildFullText(item).includes('Prezado(a),') || buildFullText(item).includes('Bom dia') || buildFullText(item).includes('Boa tarde') || buildFullText(item).includes('Boa noite')
    };
  })()`);

  await writeFile(`${outputDir}/mobile-functional-result-${width}.json`, JSON.stringify({ homeState, formState, editorState, persistence }, null, 2));
  console.log(JSON.stringify({ homeState, formState, editorState, persistence }, null, 2));
} finally {
  ws?.close();
  chrome.kill('SIGTERM');
}

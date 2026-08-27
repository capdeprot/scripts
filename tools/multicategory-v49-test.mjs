import { spawn } from 'node:child_process';
import { rm, writeFile } from 'node:fs/promises';

const outputPath = '/home/ubuntu/screenshots/multicategory-v49-results.json';
const url = 'http://localhost:4187/?test=multicategory-v49';
const port = 9270;
const profile = '/tmp/scriptz-multicategory-v49';
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
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
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
    source: `const now=new Date();const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');localStorage.setItem('scriptz_workspace',JSON.stringify({mode:'free',division:null}));localStorage.setItem('scriptz_daily_welcome_date',today);localStorage.setItem('theme','midnight');`
  });
  await send('Page.navigate', { url });
  await pause(900);
  const result = await evaluate(`(() => {
    categoryRegistry = ['Atendimento', 'Fiscalização', 'Geral'];
    customCategoryOrder = [...categoryRegistry];
    openModal();
    document.getElementById('newTitle').value = 'Resposta dupla';
    document.getElementById('newText').innerHTML = '<p>Conteúdo de teste.</p>';
    document.getElementById('newCategoryPrimary').value = 'Atendimento';
    onNewPrimaryCategoryChange();
    document.getElementById('newCategoryAdditional0').value = 'Fiscalização';
    onNewCategorySelectChange(0);
    addScript();
    const created = scripts[0];
    const createdCats = [...created.cats];
    setCat(created.cat);
    startEdit(created.id);
    const sort = document.getElementById('sortSelect');
    const lockedBefore = sort.disabled;
    openCategoryModal();
    const categoryOrderingBlocked = !document.getElementById('categoryModal').classList.contains('show');
    sort.value = 'title';
    applySort();
    const sortStayedCustom = sortBy === 'custom';
    document.getElementById('catCategory' + created.id + '_1').value = 'Geral';
    onEditCategoryChange(created.id, 1);
    saveEdit(created.id);
    const saved = scripts[0];
    const persisted = JSON.parse(localStorage.getItem('scriptz_workspace_free'));
    importProjectData(persisted);
    const importedCats = [...scripts[0].cats];
    openModal();
    const modal = document.querySelector('.new-script-modal');
    const editor = document.getElementById('newText');
    return {
      createdCats,
      savedCats: saved.cats,
      legacyPrimary: saved.cat,
      persistedCats: persisted.scripts[0].cats,
      importedCats,
      sidebarHasPrimary: document.getElementById('sidebarNav').textContent.includes('Atendimento'),
      sidebarHasSecondary: document.getElementById('sidebarNav').textContent.includes('Geral'),
      lockedBefore,
      categoryOrderingBlocked,
      sortStayedCustom,
      visibleSortOptions: [...sort.options].map(option => option.value),
      modalOverflow: getComputedStyle(modal).overflowY,
      editorOverflow: getComputedStyle(editor).overflowY
    };
  })()`);
  const valid = result.createdCats.length === 2 && result.createdCats.includes('Atendimento') && result.createdCats.includes('Fiscalização')
    && result.savedCats.length === 2 && result.savedCats.includes('Atendimento') && result.savedCats.includes('Geral')
    && result.legacyPrimary === 'Atendimento' && result.persistedCats.length === 2 && result.importedCats.length === 2 && result.importedCats.includes('Geral') && result.sidebarHasPrimary && result.sidebarHasSecondary
    && result.lockedBefore && result.categoryOrderingBlocked && result.sortStayedCustom && JSON.stringify(result.visibleSortOptions) === JSON.stringify(['custom', 'title'])
    && result.modalOverflow === 'auto' && result.editorOverflow === 'auto';
  if (!valid) throw new Error(`Validação v49 inválida: ${JSON.stringify(result)}`);
  await writeFile(outputPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  socket?.close();
  chrome.kill('SIGTERM');
}

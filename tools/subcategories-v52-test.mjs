import { createServer } from 'node:http';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = '/home/ubuntu/work_scriptz/scriptz-main-updated';
const outputPath = '/home/ubuntu/screenshots/subcategories-v52-results.json';
const webPort = 4186;
const debugPort = 9272;
const profile = '/tmp/scriptz-subcategories-v52';
const pause = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const mime = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

const server = createServer(async (request, response) => {
  try {
    const requested = new URL(request.url || '/', `http://127.0.0.1:${webPort}`).pathname;
    const file = resolve(root, requested === '/' ? 'index.html' : `.${requested}`);
    if (!file.startsWith(root)) throw new Error('Caminho inválido');
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(content);
  } catch {
    response.writeHead(404).end('Não encontrado');
  }
});

let socket;
let chrome;
let requestId = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((resolvePromise, reject) => {
  const id = ++requestId;
  pending.set(id, { resolve: resolvePromise, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || 'Falha ao avaliar página');
  return response.result?.value;
};

try {
  await new Promise(resolvePromise => server.listen(webPort, '127.0.0.1', resolvePromise));
  await rm(profile, { recursive: true, force: true });
  chrome = spawn('chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

  let websocketUrl;
  for (let attempt = 0; attempt < 50 && !websocketUrl; attempt += 1) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
      websocketUrl = pages[0]?.webSocketDebuggerUrl;
    } catch {}
    await pause(100);
  }
  if (!websocketUrl) throw new Error('Depurador do navegador indisponível');

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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await send('Page.addScriptToEvaluateOnNewDocument', {
    source: `const now=new Date();const today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');if(!sessionStorage.getItem('scriptz_test_new_user')){localStorage.setItem('scriptz_workspace',JSON.stringify({mode:'free',division:null}));localStorage.setItem('scriptz_daily_welcome_date',today);}localStorage.setItem('theme','midnight');`
  });
  await send('Page.navigate', { url: `http://127.0.0.1:${webPort}/?test=subcategories-v52` });
  await pause(1000);
  const initialDesktopScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/scriptz-v53-initial-desktop.png', Buffer.from(initialDesktopScreenshot.data, 'base64'));

  const desktop = await evaluate(`(() => {
    const isNewScriptButtonVisible = () => {
      const button = document.getElementById('newScriptBtn');
      return Boolean(button && !button.hidden && getComputedStyle(button).display !== 'none');
    };
    categoryRegistry = ['Atendimento', 'Fiscalização', 'Geral', 'Protocolos', 'Prazos', 'Serviços', 'Solicitações'];
    categoryParents = { Protocolos: 'Atendimento', Prazos: 'Atendimento', Solicitações: 'Serviços' };
    customCategoryOrder = ['Atendimento', 'Fiscalização', 'Geral', 'Serviços', 'Protocolos', 'Prazos', 'Solicitações'];
    expandedCategories = new Set();
    scripts = [
      normalizeScript({ id: 1, cat: 'Protocolos', cats: ['Protocolos'], title: 'Protocolo recebido', html: '<p>Teste 1</p>' }),
      normalizeScript({ id: 2, cat: 'Prazos', cats: ['Prazos'], title: 'Prazo de atendimento', html: '<p>Teste 2</p>' }),
      normalizeScript({ id: 3, cat: 'Fiscalização', cats: ['Fiscalização'], title: 'Vistoria agendada', html: '<p>Teste 3</p>' }),
      normalizeScript({ id: 4, cat: 'Solicitações', cats: ['Solicitações'], title: 'Solicitação recebida', html: '<p>Teste 4</p>' })
    ];
    reconcileCategoryHierarchy();
    saveToLocal();
    buildSidebar();
    activeCat = 'all';
    isInitialLanding = true;
    render();
    const initialLandingVisible = Boolean(document.querySelector('.scriptz-initial-landing img[src="assets/scriptz_icone_branco_transparente.png"]')) && document.querySelectorAll('#cards .card').length === 0;
    const initialListControlsHidden = getComputedStyle(document.querySelector('main .top-bar')).display === 'none';
    const newScriptHiddenOnAll = !isNewScriptButtonVisible();
    const sidebarOnlyRoots = !document.getElementById('sidebarNav').textContent.includes('Protocolos') && !document.getElementById('sidebarNav').textContent.includes('Prazos');
    setCat('Atendimento');
    const parentTitles = getFilteredScripts().map(script => script.title).sort();
    const mainShowsChildChoices = document.querySelector('.subcategory-navigator')?.textContent.includes('Protocolos') && document.querySelector('.subcategory-navigator')?.textContent.includes('Prazos');
    const newScriptHiddenOnParent = !isNewScriptButtonVisible();
    document.getElementById('newSubcategoryName').value = 'Documentos';
    createSubcategoryFromMain();
    const createdSubcategory = categoryParents.Documentos === 'Atendimento' && getChildCategories('Atendimento').includes('Documentos');
    const choiceGridColumns = getComputedStyle(document.querySelector('.subcategory-choice-list')).gridTemplateColumns.split(' ').length;
    setCat('Protocolos');
    const childTitles = getFilteredScripts().map(script => script.title);
    const newScriptVisibleOnLeaf = isNewScriptButtonVisible();
    const backButton = document.querySelector('.subcategory-return button');
    const hasBackButton = Boolean(backButton);
    backButton?.click();
    const backReturnsToRoot = activeCat === 'Atendimento';
    openCategoryModal();
    const modalOnlyRoots = !document.getElementById('categoryListContainer').textContent.includes('Protocolos') && !document.getElementById('categoryListContainer').textContent.includes('Documentos');
    document.getElementById('newCategoryName').value = 'Retornos';
    createCategoryFromModal();
    closeCategoryModal();
    setCat('Protocolos');
    openModal();
    const optionValues = [...document.getElementById('newCategorySecondary').options].map(option => option.value);
    const contextualPrimaryHidden = document.getElementById('newCategoryPrimary').type === 'hidden';
    const contextualPrimary = document.getElementById('newCategoryPrimary').value === 'Protocolos';
    const contextualText = document.getElementById('newCategoryContext').textContent.includes('Atendimento › Protocolos');
    document.getElementById('newTitle').value = 'Classificação fora do contexto';
    document.getElementById('newText').innerHTML = '<p>Não deve ser salvo.</p>';
    document.getElementById('newCategoryPrimary').value = 'Fiscalização';
    const scriptCountBeforeContextMismatch = scripts.length;
    addScript();
    const rejectsContextMismatch = scripts.length === scriptCountBeforeContextMismatch;
    closeModal();
    const persisted = JSON.parse(localStorage.getItem('scriptz_workspace_free'));
    importProjectData(persisted);
    const importedParents = categoryParents.Documentos === 'Atendimento' && categoryParents.Protocolos === 'Atendimento';
    let rejectsUnclassifiedImport = false;
    try {
      importProjectData({ schema: 'scriptz-free-project', scripts: [{ id: 777, title: 'Sem categoria', html: '<p>Teste</p>' }], categories: [] });
    } catch (_) {
      rejectsUnclassifiedImport = true;
    }
    setCat('Protocolos');
    openModal();
    document.getElementById('newTitle').value = 'Classificação dupla preservada';
    document.getElementById('newText').innerHTML = '<p>Conteúdo com duas classificações.</p>';
    document.getElementById('newCategorySecondary').value = 'Fiscalização';
    onNewCategorySelectChange(1);
    addScript();
    const doubleCategoryScript = scripts.find(script => script.title === 'Classificação dupla preservada');
    startEdit(doubleCategoryScript.id);
    const editorLoadedOnDemand = Boolean(document.getElementById('ce' + doubleCategoryScript.id));
    const orderingBlockedDuringEdit = document.getElementById('sortSelect').disabled;
    saveEdit(doubleCategoryScript.id);
    const doubleCategoryPreserved = doubleCategoryScript.cats.length === 2 && doubleCategoryScript.cats.includes('Protocolos') && doubleCategoryScript.cats.includes('Fiscalização');
    const disallowedSubcategory = registerCategory('Vistorias', 'Fiscalização');
    const directScriptBlocksSubcategory = !disallowedSubcategory && !getCategories().includes('Vistorias');
    const parentIsNotAssignable = !getAssignableCategories().includes('Atendimento');
    setCat('Retornos');
    const newScriptHiddenOnEmptyRoot = !isNewScriptButtonVisible();
    const emptyCategoryActions = Boolean(document.querySelector('.category-empty-primary')) && Boolean(document.querySelector('.category-empty-secondary'));
    document.querySelector('.category-empty-primary')?.click();
    const directScriptPreselected = document.getElementById('newCategoryPrimary')?.value === 'Retornos';
    document.getElementById('newTitle').value = 'Retorno criado diretamente';
    document.getElementById('newText').innerHTML = '<p>Conteúdo direto.</p>';
    addScript();
    const directScriptCreated = scripts.some(script => script.title === 'Retorno criado diretamente' && scriptHasCategory(script, 'Retornos'));
    const newScriptVisibleOnRootWithScripts = isNewScriptButtonVisible();
    registerCategory('Arquivamento');
    setCat('Arquivamento');
    const emptySubcategoryActions = Boolean(document.querySelector('.category-empty-primary')) && Boolean(document.querySelector('.category-empty-secondary'));
    showSubcategoryCreator();
    document.getElementById('newSubcategoryName').value = 'Ofícios';
    createSubcategoryFromMain();
    const subcategoryPathCreated = getCategoryParent('Ofícios') === 'Arquivamento' && !getAssignableCategories().includes('Arquivamento');
    setCat('Ofícios');
    const newScriptHiddenOnEmptySubcategory = !isNewScriptButtonVisible();
    const emptySubcategoryPrimaryAction = Boolean(document.querySelector('.category-empty-primary')) && !document.querySelector('.category-empty-secondary');
    const emptySubcategoryHasReturn = Boolean(document.querySelector('.subcategory-return button'));
    document.querySelector('.category-empty-primary')?.click();
    const emptySubcategoryPreselected = document.getElementById('newCategoryPrimary')?.value === 'Ofícios';
    closeModal();
    registerCategory('Externo');
    registerCategory('Retornos', 'Externo');
    const externalScript = normalizeScript({ id: 9900, cat: 'Externo', cats: ['Externo'], title: 'Contato externo', html: '<p>Teste 5</p>' });
    scripts.push(externalScript);
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    deleteCategory('Externo');
    window.confirm = originalConfirm;
    const deleteReparentsChildren = !categoryParents.Retornos && getRootCategories().includes('Retornos');
    const deleteMovesDirectScripts = scripts.find(script => script.id === 9900)?.cat === 'Geral';
    const started = performance.now();
    for (let index = 0; index < 495; index += 1) {
      const category = index % 2 ? 'Protocolos' : 'Fiscalização';
      scripts.push(normalizeScript({ id: 100 + index, cat: category, cats: [category], title: 'Carga ' + index, html: '<p>Teste</p>' }));
    }
    buildSidebar();
    render();
    const renderMilliseconds = performance.now() - started;
    const editorSidebarCategoryCount = document.querySelectorAll('#sidebarNav .category-root-list > li[data-category]').length;
    const editorNavigationHealthy = document.getElementById('sidebarNav').textContent.includes('Atendimento');
    workspace = { mode: 'standard', division: 'DEPROT' };
    activeLibrary = 'standard';
    standardCategories = ['Institucional', 'Padronizado filho'];
    standardCategoryParents = { 'Padronizado filho': 'Institucional' };
    standardScripts = [
      normalizeScript({ id: 8001, cat: 'Padronizado filho', cats: ['Padronizado filho'], title: 'Modelo institucional', html: '<p>Modelo</p>', isStandard: true }, 'standard')
    ];
    categoryRegistry = ['Pessoal'];
    categoryParents = {};
    customCategoryOrder = ['Pessoal'];
    standardCategoryOrder = ['Institucional', 'Padronizado filho'];
    standardScriptOrderByCategory = {};
    scripts = [...standardScripts, normalizeScript({ id: 8002, cat: 'Pessoal', cats: ['Pessoal'], title: 'Script pessoal', html: '<p>Pessoal</p>' })];
    reconcileCategoryHierarchy();
    configureWorkspaceControls();
    buildSidebar();
    const standardSectionVisible = document.getElementById('sidebarNav').textContent.includes('Modelos Padronizados') && document.getElementById('sidebarNav').textContent.includes('Meus Scriptz');
    const standardNoPersonalCategory = !document.getElementById('sidebarNav').textContent.includes('Pessoal');
    const standardLibrarySection = document.querySelector('.sidebar-library-section[data-library="standard"]');
    const libraryIndicatorInitiallyOpen = standardLibrarySection?.querySelector('.sidebar-library-chevron')?.textContent === '▲'
      && standardLibrarySection?.classList.contains('is-open')
      && standardLibrarySection?.querySelector('summary')?.getAttribute('aria-expanded') === 'true';
    toggleLibrarySection('standard');
    const libraryCollapses = standardLibrarySection?.querySelector('.sidebar-library-chevron')?.textContent === '▼'
      && !standardLibrarySection?.classList.contains('is-open')
      && standardLibrarySection?.querySelector('summary')?.getAttribute('aria-expanded') === 'false'
      && getComputedStyle(standardLibrarySection?.querySelector('.sidebar-library-clip')).transitionDuration !== '0s';
    toggleLibrarySection('standard');
    const libraryReopens = standardLibrarySection?.querySelector('.sidebar-library-chevron')?.textContent === '▲'
      && standardLibrarySection?.classList.contains('is-open');
    const actionsMenu = document.getElementById('actionsMenu');
    actionsMenu.open = true;
    syncActionsMenuIndicator();
    const actionsMenuOpens = actionsMenu.querySelector('.actions-menu-chevron')?.textContent === '▲'
      && actionsMenu.classList.contains('is-open')
      && actionsMenu.querySelector('summary')?.getAttribute('aria-expanded') === 'true'
      && getComputedStyle(actionsMenu.querySelector('.actions-menu-clip')).transitionDuration !== '0s';
    actionsMenu.open = false;
    syncActionsMenuIndicator();
    const actionsMenuCloses = actionsMenu.querySelector('.actions-menu-chevron')?.textContent === '▼'
      && !actionsMenu.classList.contains('is-open')
      && actionsMenu.querySelector('summary')?.getAttribute('aria-expanded') === 'false';
    const selectsHaveUnifiedIndicator = [...document.querySelectorAll('select:not([multiple]):not([size])')].every(select => {
      const style = getComputedStyle(select);
      return style.appearance === 'none' && style.backgroundImage.includes('svg');
    });
    setCat('Institucional');
    const standardNavigatorReadOnly = Boolean(document.querySelector('.subcategory-navigator')) && !document.getElementById('newSubcategoryName') && document.querySelectorAll('.subcategory-choice-actions').length === 0;
    const standardNewScriptHidden = !isNewScriptButtonVisible();
    setLibrary('personal');
    setCat('Pessoal');
    const personalOnlyContent = getFilteredScripts().length === 1 && getFilteredScripts()[0].title === 'Script pessoal' && document.getElementById('sidebarNav').textContent.includes('Pessoal');
    const personalNewScriptVisible = isNewScriptButtonVisible();
    registerCategory('Pessoal nova');
    const personalCategoryCreated = getCategories('personal').includes('Pessoal nova') && !getCategories('standard').includes('Pessoal nova');
    setLibrary('standard');
    const standardContentStillIsolated = getFilteredScripts().length === 1 && getFilteredScripts()[0].title === 'Modelo institucional';
    return {
      sidebarOnlyRoots,
      initialLandingVisible,
      initialListControlsHidden,
      newScriptHiddenOnAll,
      newScriptHiddenOnParent,
      newScriptVisibleOnLeaf,
      contextualPrimaryHidden,
      contextualPrimary,
      contextualText,
      mainShowsChildChoices,
      parentTitles,
      childTitles,
      createdSubcategory,
      hasBackButton,
      backReturnsToRoot,
      modalOnlyRoots,
      choiceGridColumns,
      optionHasSubcategory: optionValues.includes('Prazos') && !optionValues.includes('__new__') && !optionValues.includes('__new_sub__'),
      rejectsUnclassifiedImport,
      persistedParents: persisted.categoryParents?.Documentos === 'Atendimento',
      persistedVersion: persisted.version,
      importedParents,
      editorLoadedOnDemand,
      orderingBlockedDuringEdit,
      doubleCategoryPreserved,
      directScriptBlocksSubcategory,
      parentIsNotAssignable,
      rejectsContextMismatch,
      newScriptHiddenOnEmptyRoot,
      emptyCategoryActions,
      directScriptPreselected,
      directScriptCreated,
      newScriptVisibleOnRootWithScripts,
      emptySubcategoryActions,
      subcategoryPathCreated,
      newScriptHiddenOnEmptySubcategory,
      emptySubcategoryPrimaryAction,
      emptySubcategoryHasReturn,
      emptySubcategoryPreselected,
      deleteReparentsChildren,
      deleteMovesDirectScripts,
      standardSectionVisible,
      standardNoPersonalCategory,
      libraryIndicatorInitiallyOpen,
      libraryCollapses,
      libraryReopens,
      actionsMenuOpens,
      actionsMenuCloses,
      selectsHaveUnifiedIndicator,
      standardNavigatorReadOnly,
      standardNewScriptHidden,
      personalOnlyContent,
      personalNewScriptVisible,
      personalCategoryCreated,
      standardContentStillIsolated,
      renderMilliseconds,
      sidebarCategoryCount: editorSidebarCategoryCount,
      noNavigationError: editorNavigationHealthy
    };
  })()`);
  const capg = await evaluate(`fetchStandardTemplate('CAP-G').then(template => {
    const expectedOrder = ['DEPROT', 'DPCI', 'DPD', 'CAP-G', 'Núcleo', 'Sala Arthur Saboya'];
    const welcomeOrder = [...document.querySelectorAll('#welcomeMenu .welcome-units-grid button')].map(button => button.textContent.trim());
    const selectValues = [...document.querySelectorAll('#workspaceSelect optgroup option')].map(option => option.value);
    const selectLabels = [...document.querySelectorAll('#workspaceSelect optgroup option')].map(option => option.textContent.trim());
    const baseOrder = [...document.querySelectorAll('#templateBaseModal .template-base-grid button')].map(button => button.textContent.replace('CAP · ', '').trim());
    return {
      templateValid: template.division === 'CAP-G' && Array.isArray(template.scripts) && template.scripts.length === 0 && Array.isArray(template.categories) && template.categories.length === 0,
      messageUpdated: document.querySelector('#welcomeMenu h1')?.textContent.trim() === 'Escolha sua unidade para acessar modelos padronizados',
      welcomeOrder,
      selectValues,
      selectLabels,
      baseOrder,
      desktopGridColumns: getComputedStyle(document.querySelector('.welcome-units-grid')).gridTemplateColumns.split(' ').length,
      expectedOrder,
      expectedSelectValues: expectedOrder.map(division => 'standard:' + division),
      expectedSelectLabels: ['CAP · DEPROT', 'CAP · DPCI', 'CAP · DPD', 'CAP · G', 'CAP · Núcleo', 'CAP · Sala Arthur Saboya']
    };
  })`);
  const resilience = await evaluate(`(async () => {
    workspace = { mode: 'free', division: null };
    activeLibrary = 'personal';
    categoryRegistry = ['Respostas'];
    categoryParents = {};
    customCategoryOrder = ['Respostas'];
    customScriptOrderByCategory = {};
    scripts = [
      normalizeScript({ id: 9901, cat: 'Respostas', cats: ['Respostas'], title: 'Primeiro modelo', html: '<p>Primeiro</p>' }),
      normalizeScript({ id: 9902, cat: 'Respostas', cats: ['Respostas'], title: 'Segundo modelo', html: '<p>Segundo</p>' })
    ];
    reconcileCategoryHierarchy();
    setCat('Respostas');
    setLibraryScriptOrder('Respostas', ['9902', '9901']);
    saveToLocal();
    render();
    const orderedTitles = getFilteredScripts().map(script => script.title);
    const persistedOrder = JSON.parse(localStorage.getItem('scriptz_workspace_free')).scriptOrders?.Respostas;
    let exportedBlob;
    let exportedName = '';
    const createObjectURL = URL.createObjectURL;
    const revokeObjectURL = URL.revokeObjectURL;
    const anchorClick = HTMLAnchorElement.prototype.click;
    URL.createObjectURL = blob => { exportedBlob = blob; return 'blob:scriptz-export'; };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function () { exportedName = this.download; };
    exportJSON();
    const exported = JSON.parse(await exportedBlob.text());
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    HTMLAnchorElement.prototype.click = anchorClick;
    const oldTheme = getTheme();
    setTheme('purple');
    const themeTransitionStarts = document.documentElement.classList.contains('theme-transitioning')
      && document.documentElement.dataset.theme === 'purple'
      && localStorage.getItem('theme') === 'purple';
    await new Promise(resolvePromise => setTimeout(resolvePromise, 300));
    const themeTransitionSettles = !document.documentElement.classList.contains('theme-transitioning');
    setTheme(oldTheme);
    const trigger = document.getElementById('newScriptBtn');
    trigger?.focus();
    openModal();
    await new Promise(resolvePromise => setTimeout(resolvePromise, 120));
    const modalFocusesTitle = document.activeElement?.id === 'newTitle';
    closeModal();
    await new Promise(resolvePromise => setTimeout(resolvePromise, 20));
    const modalRestoresTrigger = document.activeElement === trigger;
    return {
      orderedTitles,
      persistedOrder,
      exportedSchema: exported.schema,
      exportedName,
      exportedTitles: exported.scripts.map(script => script.title),
      exportedOrder: exported.scriptOrders?.Respostas,
      themeTransitionStarts,
      themeTransitionSettles,
      modalFocusesTitle,
      modalRestoresTrigger
    };
  })()`);
  await evaluate(`(() => {
    const screen = document.getElementById('welcomeScreen');
    const splash = document.getElementById('welcomeSplash');
    const menu = document.getElementById('welcomeMenu');
    screen.hidden = false;
    screen.classList.add('visible');
    splash.hidden = true;
    splash.classList.remove('visible', 'leaving');
    menu.hidden = false;
    menu.classList.add('visible');
    return true;
  })()`);
  await pause(120);
  const unitSelectionDesktopScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/scriptz-v55-unit-selection-desktop.png', Buffer.from(unitSelectionDesktopScreenshot.data, 'base64'));
  await evaluate(`(() => { document.getElementById('welcomeScreen').hidden = true; return true; })()`);
  await evaluate(`(() => {
    closeCategoryModal();
    workspace = { mode: 'standard', division: 'DEPROT' };
    activeLibrary = 'standard';
    standardCategories = ['Institucional', 'Padronizado filho'];
    standardCategoryParents = { 'Padronizado filho': 'Institucional' };
    standardScripts = [normalizeScript({ id: 8001, cat: 'Padronizado filho', cats: ['Padronizado filho'], title: 'Modelo institucional', html: '<p>Modelo</p>', isStandard: true }, 'standard')];
    categoryRegistry = ['Pessoal'];
    categoryParents = {};
    customCategoryOrder = ['Pessoal'];
    standardCategoryOrder = ['Institucional', 'Padronizado filho'];
    standardScriptOrderByCategory = {};
    scripts = [...standardScripts, normalizeScript({ id: 8002, cat: 'Pessoal', cats: ['Pessoal'], title: 'Script pessoal', html: '<p>Pessoal</p>' })];
    reconcileCategoryHierarchy();
    configureWorkspaceControls();
    setCat('Institucional');
    return true;
  })()`);
  await pause(120);
  const standardScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/subcategories-v52-standard.png', Buffer.from(standardScreenshot.data, 'base64'));
  await evaluate(`(() => {
    workspace = { mode: 'free', division: null };
    activeLibrary = 'personal';
    categoryRegistry = ['Arquivamento visual', 'Ofícios visual'];
    categoryParents = { 'Ofícios visual': 'Arquivamento visual' };
    customCategoryOrder = ['Arquivamento visual', 'Ofícios visual'];
    scripts = [];
    reconcileCategoryHierarchy();
    buildSidebar();
    setCat('Ofícios visual');
    return true;
  })()`);
  await pause(160);
  const emptySubcategoryDesktopScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/scriptz-v54-empty-subcategory-desktop.png', Buffer.from(emptySubcategoryDesktopScreenshot.data, 'base64'));
  await evaluate(`(() => { setLibrary('personal'); setCat('Pessoal'); openModal(); return true; })()`);
  await pause(180);
  const contextualDesktopScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/scriptz-v53-contextual-form-desktop.png', Buffer.from(contextualDesktopScreenshot.data, 'base64'));
  await evaluate(`(() => { closeModal(); return true; })()`);
  await evaluate(`(() => { setLibrary('personal'); setCat('Pessoal'); return true; })()`);
  await pause(320);
  const desktopScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/subcategories-v52-desktop.png', Buffer.from(desktopScreenshot.data, 'base64'));

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.reload', { ignoreCache: true });
  await pause(1000);
  const initialMobileScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/scriptz-v53-initial-mobile.png', Buffer.from(initialMobileScreenshot.data, 'base64'));
  const savedMobile = await evaluate(`(() => {
    const aside = document.querySelector('aside');
    return {
      mobileNavOpen: document.body.classList.contains('mobile-nav-open'),
      navigationVisible: Boolean(aside && aside.getBoundingClientRect().right > 0),
      navigationHasWorkspaceControl: document.getElementById('workspaceSelect') !== null,
      initialEnvelopeVisible: document.querySelector('.scriptz-initial-landing img') !== null
    };
  })()`);
  await writeFile('/home/ubuntu/screenshots/scriptz-v58-saved-context-mobile.json', JSON.stringify(savedMobile, null, 2));
  await evaluate(`(() => {
    const screen = document.getElementById('welcomeScreen');
    const splash = document.getElementById('welcomeSplash');
    const menu = document.getElementById('welcomeMenu');
    screen.hidden = false;
    screen.classList.add('visible');
    splash.hidden = true;
    splash.classList.remove('visible', 'leaving');
    menu.hidden = false;
    menu.classList.add('visible');
    return true;
  })()`);
  await pause(120);
  const unitSelectionMobileScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/scriptz-v55-unit-selection-mobile.png', Buffer.from(unitSelectionMobileScreenshot.data, 'base64'));
  await evaluate(`(() => { document.getElementById('welcomeScreen').hidden = true; return true; })()`);
  const mobile = await evaluate(`(() => {
    workspace = { mode: 'free', division: null };
    activeLibrary = 'personal';
    standardCategories = [];
    standardCategoryParents = {};
    categoryRegistry = ['Atendimento', 'Protocolos', 'Prazos'];
    categoryParents = { Protocolos: 'Atendimento', Prazos: 'Atendimento' };
    customCategoryOrder = ['Atendimento', 'Protocolos', 'Prazos'];
    scripts = [
      normalizeScript({ id: 9101, cat: 'Protocolos', cats: ['Protocolos'], title: 'Protocolo móvel', html: '<p>Teste</p>' }),
      normalizeScript({ id: 9102, cat: 'Prazos', cats: ['Prazos'], title: 'Prazo móvel', html: '<p>Teste</p>' })
    ];
    reconcileCategoryHierarchy();
    buildSidebar();
    registerCategory('MobileVazia');
    setCat('MobileVazia');
    const emptyActions = document.querySelector('.category-empty-choice-actions');
    const emptyActionButtons = document.querySelectorAll('.category-empty-choice-actions button');
    document.querySelector('.category-empty-secondary')?.click();
    const mobileSubcategoryInput = Boolean(document.getElementById('newSubcategoryName'));
    setCat('Atendimento');
    const navigator = document.querySelector('.subcategory-navigator');
    const choice = document.querySelector('.subcategory-choice');
    const grid = document.querySelector('.subcategory-choice-list');
    const rootList = document.querySelector('#sidebarNav .category-root-list');
    const freeNoHorizontalOverflow = document.documentElement.scrollWidth <= window.innerWidth;
    const freeNavigatorVisible = Boolean(navigator && getComputedStyle(navigator).display !== 'none');
    const freeChoiceHeight = Number.parseFloat(getComputedStyle(choice).minHeight);
    const freeChoiceColumns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
    const freeSidebarOnlyRoots = !document.getElementById('sidebarNav').textContent.includes('Protocolos');
    const freeRootColumns = getComputedStyle(rootList).gridTemplateColumns;
    const mobileActionsMenu = document.getElementById('actionsMenu');
    mobileActionsMenu.open = true;
    syncActionsMenuIndicator();
    const mobileActionsMenuOpens = mobileActionsMenu.querySelector('.actions-menu-chevron')?.textContent === '▲'
      && mobileActionsMenu.classList.contains('is-open')
      && getComputedStyle(mobileActionsMenu.querySelector('.actions-menu-clip')).transitionDuration !== '0s';
    mobileActionsMenu.open = false;
    syncActionsMenuIndicator();
    const mobileSelectsHaveUnifiedIndicator = [...document.querySelectorAll('select:not([multiple]):not([size])')].every(select => getComputedStyle(select).appearance === 'none');
    workspace = { mode: 'standard', division: 'DEPROT' };
    activeLibrary = 'standard';
    standardCategories = ['Institucional', 'Padronizado filho'];
    standardCategoryParents = { 'Padronizado filho': 'Institucional' };
    standardScripts = [normalizeScript({ id: 9001, cat: 'Padronizado filho', cats: ['Padronizado filho'], title: 'Modelo móvel', html: '<p>Modelo</p>', isStandard: true }, 'standard')];
    categoryRegistry = ['Pessoal móvel'];
    categoryParents = {};
    scripts = [...standardScripts, normalizeScript({ id: 9002, cat: 'Pessoal móvel', cats: ['Pessoal móvel'], title: 'Meu móvel', html: '<p>Pessoal</p>' })];
    standardCategoryOrder = ['Institucional', 'Padronizado filho'];
    customCategoryOrder = ['Pessoal móvel'];
    configureWorkspaceControls();
    buildSidebar();
    const mobileStandardSections = document.getElementById('sidebarNav').textContent.includes('Modelos Padronizados') && document.getElementById('sidebarNav').textContent.includes('Meus Scriptz');
    setLibrary('personal');
    const mobilePersonalControls = Boolean(document.querySelector('.sidebar-category-tools')) && document.getElementById('sidebarNav').textContent.includes('Pessoal móvel');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const welcomeMenu = document.getElementById('welcomeMenu');
    welcomeScreen.hidden = false;
    welcomeScreen.classList.add('visible');
    welcomeMenu.hidden = false;
    welcomeMenu.classList.add('visible');
    const unitButtons = [...document.querySelectorAll('.welcome-units-grid button')];
    const firstRowTop = unitButtons[0]?.getBoundingClientRect().top;
    const mobileUnitGridColumns = unitButtons.filter(button => Math.abs(button.getBoundingClientRect().top - firstRowTop) < 2).length;
    welcomeScreen.hidden = true;
    return {
      navigatorVisible: freeNavigatorVisible,
      emptyActionsVisible: Boolean(emptyActions && getComputedStyle(emptyActions).display !== 'none'),
      emptyActionButtons: emptyActionButtons.length,
      mobileSubcategoryInput,
      choiceHeight: freeChoiceHeight,
      choiceColumns: freeChoiceColumns,
      sidebarOnlyRoots: freeSidebarOnlyRoots,
      rootColumns: freeRootColumns,
      noHorizontalOverflow: freeNoHorizontalOverflow && document.documentElement.scrollWidth <= window.innerWidth,
      mobileActionsMenuOpens,
      mobileSelectsHaveUnifiedIndicator,
      mobileStandardSections,
      mobilePersonalControls,
      mobileUnitGridColumns
    };
  })()`);
  await evaluate(`(() => { setLibrary('personal'); setCat('Pessoal móvel'); openModal(); return true; })()`);
  await pause(180);
  const contextualMobileScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/scriptz-v53-contextual-form-mobile.png', Buffer.from(contextualMobileScreenshot.data, 'base64'));
  await evaluate(`(() => { closeModal(); return true; })()`);
  await evaluate(`(() => { setLibrary('personal'); setCat('Pessoal móvel'); return true; })()`);
  const mobileScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/subcategories-v52-mobile.png', Buffer.from(mobileScreenshot.data, 'base64'));
  await evaluate(`(() => { registerCategory('V54 Raiz móvel'); registerCategory('V54 Subcategoria móvel', 'V54 Raiz móvel'); setCat('V54 Subcategoria móvel'); return true; })()`);
  await pause(160);
  const emptySubcategoryMobileScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/scriptz-v54-empty-subcategory-mobile.png', Buffer.from(emptySubcategoryMobileScreenshot.data, 'base64'));

  await evaluate(`(() => {
    sessionStorage.setItem('scriptz_test_new_user', 'true');
    localStorage.removeItem('scriptz_workspace');
    localStorage.removeItem('scriptz_onboarding_complete');
    localStorage.removeItem('scriptz_daily_welcome_date');
    return true;
  })()`);
  await send('Page.reload', { ignoreCache: true });
  await pause(4100);
  const newUserMobile = await evaluate(`(() => ({
    welcomeVisible: document.getElementById('welcomeScreen')?.hidden === false,
    unitSelectionVisible: document.getElementById('welcomeMenu')?.hidden === false && document.getElementById('welcomeMenu')?.classList.contains('visible') === true,
    unitButtonCount: document.querySelectorAll('#welcomeMenu .welcome-units-grid button').length,
    noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth
  }))()`);
  const newUserMobileScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/scriptz-v58-new-user-mobile.png', Buffer.from(newUserMobileScreenshot.data, 'base64'));

  const valid = desktop.sidebarOnlyRoots
    && desktop.initialLandingVisible
    && desktop.initialListControlsHidden
    && desktop.newScriptHiddenOnAll
    && desktop.newScriptHiddenOnParent
    && desktop.newScriptVisibleOnLeaf
    && desktop.contextualPrimaryHidden
    && desktop.contextualPrimary
    && desktop.contextualText
    && desktop.mainShowsChildChoices
    && JSON.stringify(desktop.parentTitles) === JSON.stringify([])
    && JSON.stringify(desktop.childTitles) === JSON.stringify(['Protocolo recebido'])
    && desktop.createdSubcategory
    && desktop.hasBackButton
    && desktop.backReturnsToRoot
    && desktop.modalOnlyRoots
    && desktop.choiceGridColumns === 2
    && desktop.optionHasSubcategory
    && desktop.rejectsUnclassifiedImport
    && desktop.persistedParents
    && desktop.persistedVersion === 5
    && desktop.importedParents
    && desktop.editorLoadedOnDemand
    && desktop.orderingBlockedDuringEdit
    && desktop.doubleCategoryPreserved
    && desktop.directScriptBlocksSubcategory
    && desktop.parentIsNotAssignable
    && desktop.rejectsContextMismatch
    && desktop.newScriptHiddenOnEmptyRoot
    && desktop.emptyCategoryActions
    && desktop.directScriptPreselected
    && desktop.directScriptCreated
    && desktop.newScriptVisibleOnRootWithScripts
    && desktop.emptySubcategoryActions
    && desktop.subcategoryPathCreated
    && desktop.newScriptHiddenOnEmptySubcategory
    && desktop.emptySubcategoryPrimaryAction
    && desktop.emptySubcategoryHasReturn
    && desktop.emptySubcategoryPreselected
    && desktop.deleteReparentsChildren
    && desktop.deleteMovesDirectScripts
    && desktop.standardSectionVisible
    && desktop.standardNoPersonalCategory
    && desktop.libraryIndicatorInitiallyOpen
    && desktop.libraryCollapses
    && desktop.libraryReopens
    && desktop.actionsMenuOpens
    && desktop.actionsMenuCloses
    && desktop.selectsHaveUnifiedIndicator
    && desktop.standardNavigatorReadOnly
    && desktop.standardNewScriptHidden
    && desktop.personalOnlyContent
    && desktop.personalNewScriptVisible
    && desktop.personalCategoryCreated
    && desktop.standardContentStillIsolated
    && desktop.renderMilliseconds < 600
    && desktop.sidebarCategoryCount >= 4
    && desktop.noNavigationError
    && mobile.choiceHeight >= 68
    && mobile.emptyActionsVisible
    && mobile.emptyActionButtons === 2
    && mobile.mobileSubcategoryInput
    && mobile.choiceColumns === 2
    && mobile.mobileStandardSections
    && mobile.mobilePersonalControls
    && mobile.mobileActionsMenuOpens
    && mobile.mobileSelectsHaveUnifiedIndicator
    && mobile.mobileUnitGridColumns === 2
    && mobile.navigatorVisible
    && mobile.sidebarOnlyRoots
    && mobile.noHorizontalOverflow
    && capg.templateValid
    && capg.messageUpdated
    && capg.desktopGridColumns === 3
    && JSON.stringify(capg.welcomeOrder) === JSON.stringify(capg.expectedOrder)
    && JSON.stringify(capg.selectValues) === JSON.stringify(capg.expectedSelectValues)
    && JSON.stringify(capg.selectLabels) === JSON.stringify(capg.expectedSelectLabels)
    && JSON.stringify(capg.baseOrder) === JSON.stringify(capg.expectedOrder)
    && savedMobile.mobileNavOpen
    && savedMobile.navigationVisible
    && savedMobile.navigationHasWorkspaceControl
    && savedMobile.initialEnvelopeVisible
    && newUserMobile.welcomeVisible
    && newUserMobile.unitSelectionVisible
    && newUserMobile.unitButtonCount === 6
    && newUserMobile.noHorizontalOverflow
    && JSON.stringify(resilience.orderedTitles) === JSON.stringify(['Segundo modelo', 'Primeiro modelo'])
    && JSON.stringify(resilience.persistedOrder) === JSON.stringify(['9902', '9901'])
    && resilience.exportedSchema === 'scriptz-free-project'
    && resilience.exportedName === 'meus-scriptz.json'
    && JSON.stringify(resilience.exportedTitles) === JSON.stringify(['Primeiro modelo', 'Segundo modelo'])
    && JSON.stringify(resilience.exportedOrder) === JSON.stringify(['9902', '9901'])
    && resilience.themeTransitionStarts
    && resilience.themeTransitionSettles
    && resilience.modalFocusesTitle
    && resilience.modalRestoresTrigger;
  const result = { desktop, mobile, capg, resilience, savedMobile, newUserMobile, valid };
  if (!valid) throw new Error(`Validação de subcategorias inválida: ${JSON.stringify(result)}`);
  await writeFile(outputPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  socket?.close();
  chrome?.kill('SIGTERM');
  await new Promise(resolvePromise => server.close(resolvePromise));
}

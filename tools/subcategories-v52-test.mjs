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
    const signatureDock = document.querySelector('main > .signature-dock');
    const signatureInput = document.getElementById('userNameInput');
    const signatureStyle = signatureInput ? getComputedStyle(signatureInput) : null;
    const signatureDockInMain = signatureDock?.parentElement === document.querySelector('main');
    const signatureTypography = Boolean(signatureStyle)
      && signatureStyle.fontFamily.includes('Rajdhani')
      && Number(signatureStyle.fontSize.replace('px', '')) >= 17
      && signatureStyle.fontWeight === '700'
      && signatureStyle.fontStyle === 'italic'
      && signatureStyle.textAlign === 'left'
      && getComputedStyle(signatureInput, '::placeholder').textAlign === 'left'
      && Number(signatureStyle.minHeight.replace('px', '')) >= 34;
    const signaturePlaceholder = signatureInput?.placeholder === 'Seu nome';
    const signatureLabel = document.querySelector('label[for="userNameInput"]')?.textContent.trim() === 'Atenciosamente,';
    const savedLongSignature = 'Anderson Andrade de Oliveira';
    signatureInput.value = savedLongSignature;
    syncSignatureInputWidth();
    const savedSignatureFits = signatureInput.scrollWidth <= signatureInput.clientWidth;
    const helpButton = document.getElementById('helpInfoBtn');
    const helpButtonVisible = Boolean(helpButton && getComputedStyle(helpButton).display !== 'none');
    const helpTooltipText = getComputedStyle(helpButton, '::after').content.includes('Informações, ajuda e feedback');
    helpButton?.click();
    const helpModalVisible = document.getElementById('helpInfoModal')?.classList.contains('show') === true;
    const helpModalContent = document.getElementById('helpInfoModal')?.textContent.includes('Anderson Andrade')
      && document.getElementById('helpInfoModal')?.textContent.includes('anderson-andrade@outlook.com')
      && document.getElementById('helpInfoModal')?.textContent.includes('envie uma mensagem para')
      && document.getElementById('helpInfoModal')?.textContent.includes('uso interno em SMUL/CAP');
    const helpBrandUsesLowercase = document.getElementById('helpInfoTitle')?.textContent.trim() === 'scriptz'
      && Boolean(document.querySelector('.help-brand-envelope'));
    const helpAuthorFitsDesktop = getComputedStyle(document.querySelector('.help-author-line')).whiteSpace === 'nowrap';
    const helpModalBalancedWidth = Number.parseFloat(getComputedStyle(document.querySelector('.help-info-modal')).width) <= 600;
    closeHelpInfoModal();
    categoryRegistry = ['Atendimento', 'Fiscalização', 'Geral', 'Protocolos', 'Prazos', 'Serviços', 'Solicitações'];
    categoryParents = { Protocolos: 'Atendimento', Prazos: 'Atendimento', Solicitações: 'Serviços' };
    customCategoryOrder = ['Atendimento', 'Fiscalização', 'Geral', 'Serviços', 'Protocolos', 'Prazos', 'Solicitações'];
    expandedCategories = new Set();
    scripts = [
      normalizeScript({ id: 1, cat: 'Protocolos', cats: ['Protocolos'], title: 'Protocolo recebido', html: '<p>Teste 1</p>', hasSignature: true }),
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
    const documentosKey = getChildCategories('Atendimento').find(category => categoryDisplayName(category) === 'Documentos');
    const createdSubcategory = categoryParents[documentosKey] === 'Atendimento' && Boolean(documentosKey);
    const choiceGridColumns = getComputedStyle(document.querySelector('.subcategory-choice-list')).gridTemplateColumns.split(' ').length;
    setCat('Protocolos');
    const childTitles = getFilteredScripts().map(script => script.title);
    document.getElementById('userNameInput').value = '';
    localStorage.removeItem('user_signature');
    copyScript(1);
    const signaturePromptBlocksCopy = document.getElementById('copySignatureModal')?.classList.contains('show') === true;
    const signaturePromptHasShortcut = Boolean(document.getElementById('copySignatureName'))
      && document.getElementById('copySignatureModal')?.textContent.includes('canto inferior direito');
    document.getElementById('copySignatureName').value = 'Nome Completo';
    confirmCopySignature();
    const signatureShortcutSyncs = document.getElementById('userNameInput').value === 'Nome Completo'
      && localStorage.getItem('user_signature') === 'Nome Completo';
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
    const optionValues = [...document.querySelectorAll('#newCategorySelects select[data-category-select]')[0].options].map(option => option.value);
    document.getElementById('overlay').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const modalSurvivesOutsideClick = document.getElementById('overlay').classList.contains('show');
    const newScriptGreetingStartsOff = document.getElementById('newGreeting').value === GREETING_MODES.off
      && document.querySelector('#newGreeting option[value="off"]')?.textContent.trim() === 'Nenhuma';
    const newScriptSignatureStartsOff = !document.getElementById('newSignature').checked;
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
    const importedParents = categoryParents[documentosKey] === 'Atendimento' && categoryParents.Protocolos === 'Atendimento';
    let rejectsUnclassifiedImport = false;
    try {
      importProjectData({ schema: 'scriptz-free-project', scripts: [{ id: 777, title: 'Sem categoria', html: '<p>Teste</p>' }], categories: [] });
    } catch (_) {
      rejectsUnclassifiedImport = true;
    }
    setCat('Protocolos');
    openModal();
    document.getElementById('newTitle').value = 'Classificação múltipla preservada';
    document.getElementById('newText').innerHTML = '<p>Conteúdo com múltiplas classificações.</p>';
    document.getElementById('newCategoryAdditional0').value = 'Fiscalização';
    onNewCategorySelectChange(0);
    document.getElementById('newCategoryAdditional1').value = 'Geral';
    onNewCategorySelectChange(1);
    addScript();
    const multiCategoryScript = scripts.find(script => script.title === 'Classificação múltipla preservada');
    startEdit(multiCategoryScript.id);
    const editorLoadedOnDemand = Boolean(document.getElementById('ce' + multiCategoryScript.id));
    const editCategoryOptions = [...document.querySelectorAll('#catSelectList' + multiCategoryScript.id + ' option')].map(option => option.value);
    const editAllowsOnlyExistingCategories = !editCategoryOptions.includes('__new__') && !editCategoryOptions.includes('__new_sub__');
    const orderingBlockedDuringEdit = document.getElementById('sortSelect').disabled;
    saveEdit(multiCategoryScript.id);
    const unlimitedCategoryPreserved = multiCategoryScript.cats.length === 3 && ['Protocolos', 'Fiscalização', 'Geral'].every(category => multiCategoryScript.cats.includes(category));
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
    const oficiosKey = getChildCategories('Arquivamento').find(category => categoryDisplayName(category) === 'Ofícios');
    const subcategoryPathCreated = getCategoryParent(oficiosKey) === 'Arquivamento' && !getAssignableCategories().includes('Arquivamento');
    setCat(oficiosKey);
    const newScriptHiddenOnEmptySubcategory = !isNewScriptButtonVisible();
    const emptySubcategoryPrimaryAction = Boolean(document.querySelector('.category-empty-primary')) && !document.querySelector('.category-empty-secondary');
    const emptySubcategoryHasReturn = Boolean(document.querySelector('.subcategory-return button'));
    document.querySelector('.category-empty-primary')?.click();
    const emptySubcategoryPreselected = document.getElementById('newCategoryPrimary')?.value === oficiosKey;
    closeModal();
    registerCategory('Externo');
    const retornosExternoKey = registerCategory('Retornos', 'Externo');
    const externalScript = normalizeScript({ id: 9900, cat: 'Externo', cats: ['Externo'], title: 'Contato externo', html: '<p>Teste 5</p>' });
    scripts.push(externalScript);
    performDeleteCategory('Externo');
    const deleteReparentsChildren = !categoryParents[retornosExternoKey] && getRootCategories().includes(retornosExternoKey);
    const deleteMovesDirectScripts = scripts.find(script => script.id === 9900)?.cat === 'Geral';
    const duplicateAtendimentoKey = registerCategory('Mesmo nome', 'Atendimento');
    const duplicateArquivamentoKey = registerCategory('Mesmo nome', 'Arquivamento');
    const duplicateSameParentKey = registerCategory('Mesmo nome', 'Atendimento');
    const allowsSameNamedSubcategoriesUnderDifferentParents = Boolean(duplicateAtendimentoKey)
      && Boolean(duplicateArquivamentoKey)
      && duplicateAtendimentoKey !== duplicateArquivamentoKey
      && categoryDisplayName(duplicateAtendimentoKey) === 'Mesmo nome'
      && categoryDisplayName(duplicateArquivamentoKey) === 'Mesmo nome'
      && categoryParents[duplicateAtendimentoKey] === 'Atendimento'
      && categoryParents[duplicateArquivamentoKey] === 'Arquivamento'
      && !duplicateSameParentKey;
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
    activeLibrary = 'personal';
    categoryRegistry = [PDF_GUIDE_CATEGORY];
    categoryParents = {};
    customCategoryOrder = [PDF_GUIDE_CATEGORY];
    scripts = [normalizeScript({ id: 9001, cat: PDF_GUIDE_CATEGORY, cats: [PDF_GUIDE_CATEGORY], title: 'Guia PDF', html: '<a href="assets/docs/padrao-escrita-observacoes.pdf">Abrir PDF</a>', hasSignature: false })];
    activeCat = PDF_GUIDE_CATEGORY;
    isInitialLanding = false;
    render();
    openPdfGuideCardWhenRelevant();
    const pdfGuideStartsOpen = document.getElementById('c9001')?.classList.contains('open') === true;
    return {
      sidebarOnlyRoots,
      signatureDockInMain,
      signatureTypography,
      signaturePlaceholder,
      signatureLabel,
      savedSignatureFits,
      helpButtonVisible,
      helpTooltipText,
      helpModalVisible,
      helpModalContent,
      helpBrandUsesLowercase,
      helpAuthorFitsDesktop,
      helpModalBalancedWidth,
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
      signaturePromptBlocksCopy,
      signaturePromptHasShortcut,
      signatureShortcutSyncs,
      createdSubcategory,
      hasBackButton,
      backReturnsToRoot,
      modalOnlyRoots,
      choiceGridColumns,
      optionHasSubcategory: optionValues.includes('Prazos') && !optionValues.includes('__new__') && !optionValues.includes('__new_sub__'),
      modalSurvivesOutsideClick,
      newScriptGreetingStartsOff,
      newScriptSignatureStartsOff,
      rejectsUnclassifiedImport,
      persistedParents: persisted.categoryParents?.[documentosKey] === 'Atendimento' && persisted.categoryLabels?.[documentosKey] === 'Documentos',
      persistedVersion: persisted.version,
      importedParents,
      editorLoadedOnDemand,
      editAllowsOnlyExistingCategories,
      orderingBlockedDuringEdit,
      unlimitedCategoryPreserved,
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
      allowsSameNamedSubcategoriesUnderDifferentParents,
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
      pdfGuideStartsOpen,
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
    const baseLabels = [...document.querySelectorAll('#templateBaseModal .template-base-grid button')].map(button => button.textContent.trim());
    const baseOrder = baseLabels.map(label => label === 'CAP · G' ? 'CAP-G' : label.replace('CAP · ', '').trim());
    return {
      templateValid: template.division === 'CAP-G' && Array.isArray(template.scripts) && template.scripts.length === 0 && Array.isArray(template.categories) && template.categories.length === 0,
      messageUpdated: document.querySelector('#welcomeMenu h1')?.textContent.trim() === 'Escolha sua unidade para acessar modelos padronizados',
      welcomeOrder,
      selectValues,
      selectLabels,
      baseOrder,
      baseLabels,
      desktopGridColumns: getComputedStyle(document.querySelector('.welcome-units-grid')).gridTemplateColumns.split(' ').length,
      expectedOrder,
      expectedSelectValues: expectedOrder.map(division => 'standard:' + division),
      expectedSelectLabels: ['CAP · DEPROT', 'CAP · DPCI', 'CAP · DPD', 'CAP · G', 'CAP · Núcleo', 'CAP · Sala Arthur Saboya']
    };
  })`);
  const deprot = await evaluate(`fetchStandardTemplate('DEPROT').then(template => {
    const parents = template.categoryParents || {};
    const scriptsById = new Map(template.scripts.map(script => [script.id, script]));
    const expectedMessages = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 29];
    const guideChildren = ['Instruções de escrita no campo “Observações” das guias do AD', 'Alvará de Edificação Nova', 'Alvará de Reforma', 'Projeto Modificativo de Edificação Nova', 'Projeto Modificativo de Reforma', 'Alvará de Desmembramento', 'Alvará de Autorização para Avanço de Grua', 'Alvará de Autorização para Estande de Vendas', 'Alvará de Funcionamento para Local de Reunião', 'Certificado de Segurança', 'Certificado de Acessibilidade', 'Cadastro de Sistema Especial de Segurança', 'Cadastro de Tanques, Bombas e Equipamentos / Manutenção do Cadastro'];
    const parentCategories = new Set(Object.values(parents));
    const sidebarRootOrder = prioritizedStandardCategoryOrder(template.categories, parents, 'DEPROT')
      .filter(category => !parents[category])
      .slice(0, 4);
    return {
      aprovaReorganized: !template.categories.includes('Aprova Digital') && !parents['Mensagens externas AD'] && !parents['Guias AD'] && guideChildren.every(category => parents[category] === 'Guias AD'),
      cotasChildren: parents['Alvará de Reforma'] === 'Guias AD'
        && parents['Projeto Modificativo'] === 'Cotas do SEI'
        && parents['Restituição de Guia'] === 'Cotas do SEI',
      noScriptsAtParents: template.scripts.every(script => !parentCategories.has(script.cat)),
      messagesClassified: expectedMessages.every(id => scriptsById.get(id)?.cat === 'Mensagens externas AD'),
      guidesClassified: template.scripts.every(script => script.cat !== 'Guias AD'),
      sidebarRootOrder
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
    categoryRegistry = ['E-mail', 'Respostas'];
    categoryParents = { Respostas: 'E-mail' };
    customCategoryOrder = ['E-mail', 'Respostas'];
    customScriptOrderByCategory = { Respostas: ['9901', '9902'] };
    configureWorkspaceControls();
    const templateExportVisible = document.getElementById('exportTemplateBtn')?.hidden === false;
    let exportedTemplateBlob;
    let exportedTemplateName = '';
    URL.createObjectURL = blob => { exportedTemplateBlob = blob; return 'blob:scriptz-template'; };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = function () { exportedTemplateName = this.download; };
    exportStandardTemplate('DEPROT');
    const exportedTemplate = JSON.parse(await exportedTemplateBlob.text());
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    HTMLAnchorElement.prototype.click = anchorClick;
    const nativeFetch = window.fetch;
    workspace = { mode: 'standard', division: 'DEPROT' };
    localStorage.removeItem(workspaceKey());
    window.fetch = async () => new Response(JSON.stringify(exportedTemplate), { status: 200, headers: { 'Content-Type': 'application/json' } });
    await loadWorkspace(false);
    const templateReimportsByStandardLoader = standardCategoryParents.Respostas === 'E-mail'
      && standardCategories.includes('E-mail')
      && standardCategories.includes('Respostas')
      && standardScripts.length === 2
      && standardScripts.every(script => script.isStandard && script.source === 'standard');
    window.fetch = nativeFetch;
    workspace = { mode: 'free', division: null };
    activeLibrary = 'personal';
    categoryRegistry = ['E-mail', 'Respostas'];
    categoryParents = { Respostas: 'E-mail' };
    customCategoryOrder = ['E-mail', 'Respostas'];
    customScriptOrderByCategory = { Respostas: ['9901', '9902'] };
    scripts = [
      normalizeScript({ id: 9901, cat: 'Respostas', cats: ['Respostas'], title: 'Primeiro modelo', html: '<p>Primeiro</p>' }),
      normalizeScript({ id: 9902, cat: 'Respostas', cats: ['Respostas'], title: 'Segundo modelo', html: '<p>Segundo</p>' })
    ];
    reconcileCategoryHierarchy();
    setCat('Respostas');
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
      templateExportVisible,
      exportedTemplateName,
      templateSchema: exportedTemplate.schema,
      templateDivision: exportedTemplate.division,
      templateCategories: exportedTemplate.categories,
      templateParents: exportedTemplate.categoryParents,
      templateScriptOrder: exportedTemplate.scripts.map(script => String(script.id)),
      templateProjectFieldsRemoved: exportedTemplate.scripts.every(script => script.isStandard === undefined && script.source === undefined),
      templateReimportsByStandardLoader,
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
  await send('Emulation.setDeviceMetricsOverride', { width: 1918, height: 977, deviceScaleFactor: 1, mobile: false });
  await pause(120);
  const signatureWide = await evaluate(`(() => {
    const dock = document.querySelector('.signature-dock');
    const style = dock ? getComputedStyle(dock) : null;
    const input = document.getElementById('userNameInput');
    input.value = 'Seu nome';
    syncSignatureInputWidth();
    const compactWidth = input.getBoundingClientRect().width;
    input.value = 'Maria de Oliveira Santos';
    syncSignatureInputWidth();
    const expandedWidth = input.getBoundingClientRect().width;
    const expectedRight = 18;
    const expectedBottom = 20;
    const dockBounds = dock?.getBoundingClientRect();
    const mainBounds = document.querySelector('main')?.getBoundingClientRect();
    return {
      visible: Boolean(dock && dock.getBoundingClientRect().width > 0),
      fixed: style?.position === 'fixed',
      nearViewportRight: Math.abs((window.innerWidth - (dock?.getBoundingClientRect().right || 0)) - expectedRight) < 4,
      nearViewportBottom: Math.abs((window.innerHeight - (dock?.getBoundingClientRect().bottom || 0)) - expectedBottom) < 4,
      outsideContentArea: Boolean(dockBounds && mainBounds && dockBounds.left >= mainBounds.right - 1),
      inputStartsCompact: compactWidth > 0 && compactWidth < 190,
      inputGrowsForLongName: expandedWidth > compactWidth && expandedWidth <= 400
    };
  })()`);
  const signatureWideScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/scriptz-v62-signature-wide.png', Buffer.from(signatureWideScreenshot.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await pause(120);
  const signatureDesktop = await evaluate(`(() => {
    const dock = document.getElementById('signatureDock')?.getBoundingClientRect();
    const main = document.querySelector('main')?.getBoundingClientRect();
    return Boolean(dock && main && dock.left >= main.right - 1);
  })()`);
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
    const mobileNavOpenInitially = document.body.classList.contains('mobile-nav-open');
    const persistentToggle = document.getElementById('mobilePersistentNavToggle');
    const persistentToggleVisible = Boolean(persistentToggle && getComputedStyle(persistentToggle).display !== 'none');
    closeMobileNav();
    persistentToggle?.click();
    const persistentToggleReopensSidebar = document.body.classList.contains('mobile-nav-open');
    closeMobileNav();
    return {
      mobileNavOpen: mobileNavOpenInitially,
      navigationVisible: Boolean(aside && aside.getBoundingClientRect().right > 0),
      navigationHasWorkspaceControl: document.getElementById('workspaceSelect') !== null,
      initialEnvelopeVisible: document.querySelector('.scriptz-initial-landing img') !== null,
      persistentToggleVisible,
      persistentToggleReopensSidebar
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
    syncSignatureDockPlacement();
    const mobileSignatureDock = document.querySelector('.sb-foot > .signature-dock');
    const mobileSignatureStyle = mobileSignatureDock ? getComputedStyle(mobileSignatureDock) : null;
    const mobileSignatureInput = document.getElementById('userNameInput');
    const mobileSignatureLabel = mobileSignatureDock?.querySelector('label');
    const mobileSignatureUsable = Boolean(mobileSignatureDock && mobileSignatureInput)
      && mobileSignatureStyle?.position !== 'fixed'
      && mobileSignatureDock.getBoundingClientRect().width >= Math.min(300, window.innerWidth - 24)
      && mobileSignatureInput.getBoundingClientRect().width > 0;
    const mobileSignatureAlignedLeft = mobileSignatureLabel?.textContent.trim() === 'Atenciosamente,'
      && getComputedStyle(mobileSignatureLabel).textAlign === 'left'
      && getComputedStyle(mobileSignatureInput).textAlign === 'left'
      && getComputedStyle(mobileSignatureInput, '::placeholder').textAlign === 'left';
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
      mobileSignatureUsable,
      mobileSignatureAlignedLeft,
      mobileStandardSections,
      mobilePersonalControls,
      mobileUnitGridColumns
    };
  })()`);
  await evaluate(`(() => { openMobileNav(); const aside = document.querySelector('aside'); if (aside) aside.scrollTop = aside.scrollHeight; return Boolean(document.querySelector('.sb-foot > .signature-dock')); })()`);
  await pause(120);
  const mobileSignatureSidebarScreenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile('/home/ubuntu/screenshots/scriptz-v64-signature-mobile-sidebar.png', Buffer.from(mobileSignatureSidebarScreenshot.data, 'base64'));
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
    && desktop.signatureDockInMain
    && desktop.signatureTypography
    && desktop.signaturePlaceholder
    && desktop.signatureLabel
    && desktop.savedSignatureFits
    && desktop.helpButtonVisible
    && desktop.helpTooltipText
    && desktop.helpModalVisible
    && desktop.helpModalContent
    && desktop.helpBrandUsesLowercase
    && desktop.helpAuthorFitsDesktop
    && desktop.helpModalBalancedWidth
    && signatureWide.visible
    && signatureWide.fixed
    && signatureWide.nearViewportRight
    && signatureWide.nearViewportBottom
    && signatureWide.outsideContentArea
    && signatureWide.inputStartsCompact
    && signatureWide.inputGrowsForLongName
    && signatureDesktop
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
    && desktop.signaturePromptBlocksCopy
    && desktop.signaturePromptHasShortcut
    && desktop.signatureShortcutSyncs
    && desktop.createdSubcategory
    && desktop.hasBackButton
    && desktop.backReturnsToRoot
    && desktop.modalOnlyRoots
    && desktop.choiceGridColumns === 2
    && desktop.optionHasSubcategory
    && desktop.rejectsUnclassifiedImport
    && desktop.persistedParents
    && desktop.persistedVersion === 6
    && desktop.importedParents
    && desktop.editorLoadedOnDemand
    && desktop.editAllowsOnlyExistingCategories
    && desktop.orderingBlockedDuringEdit
    && desktop.unlimitedCategoryPreserved
    && desktop.modalSurvivesOutsideClick
    && desktop.newScriptGreetingStartsOff
    && desktop.newScriptSignatureStartsOff
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
    && desktop.allowsSameNamedSubcategoriesUnderDifferentParents
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
    && desktop.pdfGuideStartsOpen
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
    && mobile.mobileSignatureUsable
    && mobile.mobileSignatureAlignedLeft
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
    && capg.baseLabels[3] === 'CAP · G'
    && deprot.aprovaReorganized
    && deprot.cotasChildren
    && deprot.noScriptsAtParents
    && deprot.messagesClassified
    && deprot.guidesClassified
    && JSON.stringify(deprot.sidebarRootOrder) === JSON.stringify(['E-mail', 'Mensagens externas AD', 'Guias AD', 'Cotas do SEI'])
    && savedMobile.mobileNavOpen
    && savedMobile.navigationVisible
    && savedMobile.navigationHasWorkspaceControl
    && savedMobile.initialEnvelopeVisible
    && savedMobile.persistentToggleVisible
    && savedMobile.persistentToggleReopensSidebar
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
    && resilience.templateExportVisible
    && resilience.exportedTemplateName === 'DEPROT.JSON'
    && resilience.templateSchema === 'scriptz-standard-template'
    && resilience.templateDivision === 'DEPROT'
    && JSON.stringify(resilience.templateCategories) === JSON.stringify(['E-mail', 'Respostas'])
    && JSON.stringify(resilience.templateParents) === JSON.stringify({ Respostas: 'E-mail' })
    && JSON.stringify(resilience.templateScriptOrder) === JSON.stringify(['9901', '9902'])
    && resilience.templateProjectFieldsRemoved
    && resilience.templateReimportsByStandardLoader
    && resilience.themeTransitionStarts
    && resilience.themeTransitionSettles
    && resilience.modalFocusesTitle
    && resilience.modalRestoresTrigger;
  const result = { desktop, mobile, capg, deprot, resilience, savedMobile, newUserMobile, valid };
  if (!valid) throw new Error(`Validação de subcategorias inválida: ${JSON.stringify(result)}`);
  await writeFile(outputPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  socket?.close();
  chrome?.kill('SIGTERM');
  await new Promise(resolvePromise => server.close(resolvePromise));
}

// ============================================================
//  ESTADO GLOBAL
// ============================================================
let scripts = [];
let nextId = 100;
let activeCat = 'all';
let searchQ = '';
let originalScripts = [];
let sortBy = 'title';
let customCategoryOrder = [];
let customScriptOrderByCategory = {};
let categoryRegistry = [];
let isCustomOrderActive = false;
let reorderMode = false;
let deferredInstallPrompt = null;
let activeEditId = null;
let workspace = { mode: null, division: null };
let standardCategories = [];
let standardScripts = [];

const SCRIPT_LIMITS = Object.freeze({ standard: 300, free: 500 });
const STANDARD_DIVISIONS = Object.freeze({
  DEPROT: 'templates/DEPROT.JSON',
  DPCI: 'templates/DPCI.JSON',
  DPD: 'templates/DPD.JSON',
  'Coord.': 'templates/SMUL-CAP.JSON'
});

// ============================================================
//  TEMA (DARK MODE)
// ============================================================
const THEME_OPTIONS = {
  light: { label: 'Claro', icon: '☀️' },
  black: { label: 'Escuro', icon: '🌙' },
  midnight: { label: 'Blue Midnight', icon: '✦' },
  purple: { label: 'Dark Purple', icon: '◈' }
};

function getTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') return 'midnight';
  return THEME_OPTIONS[saved] ? saved : 'midnight';
}

function setTheme(theme) {
  const safeTheme = THEME_OPTIONS[theme] ? theme : 'midnight';
  document.documentElement.setAttribute('data-theme', safeTheme);
  localStorage.setItem('theme', safeTheme);
  const select = document.getElementById('themeSelect');
  if (select) select.value = safeTheme;
  document.body.dataset.themeLabel = THEME_OPTIONS[safeTheme].label;
}

function showInstallHelp() {
  showToast('ℹ️', 'No celular, use o menu do navegador e escolha “Adicionar à tela inicial”.');
}

async function installScriptzApp() {
  const button = document.getElementById('installAppBtn');
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    showToast('✅', 'O Scriptz já está instalado como app.');
    if (button) button.hidden = true;
    return;
  }
  if (!deferredInstallPrompt) {
    showInstallHelp();
    return;
  }
  // O prompt nativo só pode ser aberto em resposta direta ao toque/clique.
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  if (choice.outcome === 'accepted') showToast('✅', 'Scriptz instalado como app!');
  deferredInstallPrompt = null;
  if (button) button.hidden = true;
}

function toggleTheme() {
  const current = getTheme();
  const next = current === 'light' ? 'midnight' : 'light';
  setTheme(next);
}

function selectTheme(theme) {
  setTheme(theme);
  showToast(THEME_OPTIONS[theme].icon, `Tema ${THEME_OPTIONS[theme].label} aplicado`);
}

// ============================================================
//  SAUDAÇÃO
// ============================================================
function saudacao() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const GREETING_MODES = Object.freeze({ off: 'off', auto: 'auto', formal: 'formal' });

function getGreetingMode(script) {
  if (Object.values(GREETING_MODES).includes(script?.greetingMode)) return script.greetingMode;
  return script?.hasGreeting === false ? GREETING_MODES.off : GREETING_MODES.auto;
}

function greetingText(mode) {
  if (mode === GREETING_MODES.auto) return `${saudacao()}, ______.`;
  if (mode === GREETING_MODES.formal) return 'Prezado(a),';
  return '';
}

function greetingHTML(mode) {
  const text = greetingText(mode);
  return text ? `<p>${text}</p>` : '';
}

function greetingSelectOptions(selectedMode) {
  const mode = Object.values(GREETING_MODES).includes(selectedMode) ? selectedMode : GREETING_MODES.auto;
  return `
    <option value="${GREETING_MODES.off}" ${mode === GREETING_MODES.off ? 'selected' : ''}>Desabilitar</option>
    <option value="${GREETING_MODES.auto}" ${mode === GREETING_MODES.auto ? 'selected' : ''}>${escapeHtml(greetingText(GREETING_MODES.auto))}</option>
    <option value="${GREETING_MODES.formal}" ${mode === GREETING_MODES.formal ? 'selected' : ''}>Prezado(a),</option>`;
}

function syncGreetingSelectState(select) {
  if (!select) return;
  select.classList.toggle('is-disabled', select.value === GREETING_MODES.off);
}

function hasGreeting(script) {
  return getGreetingMode(script) !== GREETING_MODES.off;
}

// ============================================================
//  ASSINATURA
// ============================================================
function getSignature() {
  const name = document.getElementById('userNameInput').value.trim();
  return name || '------';
}

function hasSignature(script) {
  return script.hasSignature !== false;
}

function updateSignature() {
  localStorage.setItem('user_signature', document.getElementById('userNameInput').value.trim());
  render();
  showToast('✅', 'Assinatura atualizada!');
}

function loadUserName() {
  const saved = localStorage.getItem('user_signature');
  if (saved) document.getElementById('userNameInput').value = saved;
}

// ============================================================
//  FAVORITOS
// ============================================================
function toggleFavorite(id) {
  const idx = scripts.findIndex(s => s.id === id);
  if (idx === -1) return;

  const currentCard = document.getElementById('c' + id);
  const wasOpen = Boolean(currentCard && currentCard.classList.contains('open'));
  scripts[idx].isFavorite = !scripts[idx].isFavorite;
  saveToLocal();
  render();

  // A renderização pode reconstruir a lista (especialmente no filtro de favoritos),
  // mas nunca deve recolher o card que o usuário estava consultando.
  if (wasOpen) {
    const refreshedCard = document.getElementById('c' + id);
    if (refreshedCard) refreshedCard.classList.add('open');
  }

  showToast(scripts[idx].isFavorite ? '⭐' : '☆', scripts[idx].isFavorite ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!');
}

function isFavorite(script) {
  return script.isFavorite === true;
}

// ============================================================
//  ORDEM PERSONALIZADA DAS CATEGORIAS
// ============================================================
function loadCustomOrder() {
  const saved = localStorage.getItem('category_order');
  if (saved) {
    try {
      customCategoryOrder = JSON.parse(saved);
      isCustomOrderActive = customCategoryOrder.length > 0;
    } catch (e) {
      customCategoryOrder = [];
      isCustomOrderActive = false;
    }
  } else {
    customCategoryOrder = [];
    isCustomOrderActive = false;
  }
}

function saveCustomOrder() {
  isCustomOrderActive = customCategoryOrder.length > 0;
  saveToLocal();
  if (isCustomOrderActive) {
    sortBy = 'custom';
    document.getElementById('sortSelect').value = 'custom';
    render();
  }
}

function getOrderedCategories(cats) {
  if (customCategoryOrder.length === 0) return cats;
  const ordered = [];
  const remaining = [];
  const catSet = new Set(cats);
  customCategoryOrder.forEach(cat => {
    if (catSet.has(cat)) {
      ordered.push(cat);
      catSet.delete(cat);
    }
  });
  catSet.forEach(cat => ordered.push(cat));
  return ordered;
}

// ============================================================
//  CARREGAR DADOS
// ============================================================
function workspaceKey() {
  return workspace.mode === 'standard'
    ? `scriptz_workspace_standard_${workspace.division}`
    : 'scriptz_workspace_free';
}

function isStandardMode() {
  return workspace.mode === 'standard';
}

function isStandardScript(script) {
  return isStandardMode() && script.isStandard === true;
}

function isStandardCategory(category) {
  return isStandardMode() && standardCategories.includes(category);
}

function currentScriptLimit() {
  return isStandardMode() ? SCRIPT_LIMITS.standard : SCRIPT_LIMITS.free;
}

function normalizeScript(script, source = 'user') {
  const greetingMode = getGreetingMode(script);
  return {
    id: Number(script.id) || nextId++,
    cat: String(script.cat || 'Geral'),
    title: String(script.title || 'Sem título'),
    html: String(script.html || ''),
    greetingMode,
    hasGreeting: greetingMode !== GREETING_MODES.off,
    hasSignature: script.hasSignature !== false,
    isFavorite: script.isFavorite === true,
    isStandard: source === 'standard' || script.isStandard === true,
    source
  };
}

function normalizeWorkspaceState(savedState) {
  const state = savedState && !Array.isArray(savedState) ? savedState : {};
  const savedScripts = Array.isArray(savedState) ? savedState : state.scripts || [];
  const source = isStandardMode() ? 'user' : 'user';
  scripts = savedScripts.map(script => normalizeScript(script, script.source || source));
  categoryRegistry = Array.isArray(state.categories) ? state.categories : [];
  customCategoryOrder = Array.isArray(state.categoryOrder) ? state.categoryOrder : [];
  customScriptOrderByCategory = state.scriptOrders || {};
}

async function fetchStandardTemplate(division) {
  const source = STANDARD_DIVISIONS[division];
  if (!source) throw new Error('Divisão inválida');
  const response = await fetch(`${source}?v=41`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!data || data.schema !== 'scriptz-standard-template' || !Array.isArray(data.scripts)) throw new Error('Template inválido');
  return data;
}

function configureWorkspaceControls() {
  const select = document.getElementById('workspaceSelect');
  const reset = document.getElementById('resetLocalBtn');
  const discard = document.getElementById('discardTemplatesBtn');
  const newProject = document.getElementById('newFreeProjectBtn');
  const templateBase = document.getElementById('loadTemplateBaseBtn');
  if (select) select.value = isStandardMode() ? `standard:${workspace.division}` : 'free';
  if (reset) reset.hidden = !isStandardMode();
  if (discard) discard.hidden = isStandardMode();
  if (newProject) newProject.hidden = isStandardMode();
  if (templateBase) templateBase.hidden = isStandardMode();
}

function refreshWorkspaceUI() {
  const label = isStandardMode() ? `CAP · ${workspace.division}` : 'Modo Livre';
  document.body.dataset.workspaceMode = workspace.mode || '';
  document.body.dataset.workspaceDivision = workspace.division || '';
  document.getElementById('pageTitle').textContent = activeCat === 'all' ? label : activeCat === 'favorites' ? 'Favoritos' : activeCat;
  configureWorkspaceControls();
  buildSidebar();
  render();
}

async function loadWorkspace(showFeedback = true) {
  if (!workspace.mode) return;
  activeCat = 'all';
  searchQ = '';
  activeEditId = null;
  standardScripts = [];
  standardCategories = [];
  try {
    const local = localStorage.getItem(workspaceKey());
    if (isStandardMode()) {
      const template = await fetchStandardTemplate(workspace.division);
      standardCategories = Array.isArray(template.categories) ? template.categories.map(String) : [];
      standardScripts = template.scripts.map(script => normalizeScript({ ...script, isStandard: true }, 'standard'));
      const saved = local ? JSON.parse(local) : null;
      normalizeWorkspaceState(saved);
      scripts = [...standardScripts, ...scripts.filter(script => !script.isStandard)];
      categoryRegistry = [...new Set([...standardCategories, ...categoryRegistry, ...scripts.map(script => script.cat).filter(Boolean)])];
      originalScripts = JSON.parse(JSON.stringify(standardScripts));
    } else {
      const saved = local ? JSON.parse(local) : null;
      normalizeWorkspaceState(saved);
      scripts = scripts.map(script => ({ ...script, isStandard: false, source: script.source || 'user' }));
      categoryRegistry = [...new Set([...categoryRegistry, ...scripts.map(script => script.cat).filter(Boolean)])];
      originalScripts = [];
    }
    customCategoryOrder = [...new Set([...customCategoryOrder, ...categoryRegistry])];
    isCustomOrderActive = customCategoryOrder.length > 0;
    if (isCustomOrderActive) {
      sortBy = 'custom';
      const sortSelect = document.getElementById('sortSelect');
      if (sortSelect) sortSelect.value = 'custom';
    } else {
      sortBy = 'title';
    }
    nextId = Math.max(...scripts.map(script => Number(script.id) || 0), 0) + 1;
    saveToLocal();
    refreshWorkspaceUI();
    if (showFeedback) showToast('📂', isStandardMode() ? `CAP · ${workspace.division} carregado` : 'Modo Livre carregado');
  } catch (err) {
    console.error(err);
    document.getElementById('cards').innerHTML = '<div class="empty"><div class="icon">❌</div><p>Não foi possível carregar este contexto.</p></div>';
  }
}

async function selectWorkspace(value) {
  if (value === 'free') workspace = { mode: 'free', division: null };
  else {
    const [, division] = String(value).split(':');
    if (!STANDARD_DIVISIONS[division]) return;
    workspace = { mode: 'standard', division };
  }
  localStorage.setItem('scriptz_workspace', JSON.stringify(workspace));
  localStorage.setItem('scriptz_onboarding_complete', 'true');
  document.documentElement.classList.remove('scriptz-awaiting-onboarding');
  document.getElementById('welcomeScreen')?.setAttribute('hidden', '');
  await loadWorkspace();
}

function changeWorkspaceFromSelect(value) {
  if (activeEditId !== null) {
    showToast('⚠️', 'Conclua ou cancele a edição antes de trocar de contexto.');
    configureWorkspaceControls();
    return;
  }
  selectWorkspace(value);
}

function getStoredWorkspace() {
  try {
    const saved = JSON.parse(localStorage.getItem('scriptz_workspace'));
    if (saved?.mode === 'free') return { mode: 'free', division: null };
    if (saved?.mode === 'standard' && STANDARD_DIVISIONS[saved.division]) return saved;
  } catch (_) {}
  return null;
}

function showWelcomeFlow() {
  const screen = document.getElementById('welcomeScreen');
  const splash = document.getElementById('welcomeSplash');
  const menu = document.getElementById('welcomeMenu');
  if (!screen || !splash || !menu) return;
  screen.hidden = false;
  requestAnimationFrame(() => splash.classList.add('visible'));
  setTimeout(() => {
    splash.classList.add('leaving');
    setTimeout(() => {
      splash.hidden = true;
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('visible'));
    }, 350);
  }, 4700);
}

function showDivisionStep() {
  document.getElementById('coordinatorStep').hidden = true;
  document.getElementById('divisionStep').hidden = false;
}

function showCoordinatorStep() {
  document.getElementById('divisionStep').hidden = true;
  document.getElementById('coordinatorStep').hidden = false;
}

async function loadData() {
  loadUserName();
  loadCustomOrder();
  const savedWorkspace = getStoredWorkspace();
  if (savedWorkspace) {
    workspace = savedWorkspace;
    await loadWorkspace(false);
  } else {
    scripts = [];
    categoryRegistry = [];
    refreshWorkspaceUI();
    showWelcomeFlow();
  }
}

// ============================================================
//  RESET
// ============================================================
function resetLocalData() {
  if (!isStandardMode()) return;
  if (!confirm('⚠️ Isso vai apagar somente scripts, categorias e ordenações criados localmente neste contexto. Continuar?')) return;
  localStorage.removeItem(workspaceKey());
  loadWorkspace(false);
  showToast('🗑️', 'Alterações locais deletadas.');
}

function saveToLocal() {
  if (!workspace.mode) return;
  const userScripts = isStandardMode() ? scripts.filter(script => !script.isStandard) : scripts;
  const userCategories = isStandardMode()
    ? categoryRegistry.filter(category => !standardCategories.includes(category))
    : categoryRegistry;
  localStorage.setItem(workspaceKey(), JSON.stringify({
    schema: isStandardMode() ? 'scriptz-standard-changes' : 'scriptz-free-project',
    version: 3,
    mode: workspace.mode,
    division: workspace.division,
    scripts: userScripts,
    categories: userCategories,
    categoryOrder: customCategoryOrder,
    scriptOrders: customScriptOrderByCategory
  }));
}

// ============================================================
//  CATEGORIAS & SIDEBAR
// ============================================================
function getCategories() {
  const cats = ['all'];
  [...categoryRegistry, ...scripts.map(s => s.cat)].filter(Boolean).forEach(cat => { if (!cats.includes(cat)) cats.push(cat); });
  return cats;
}

function getFilteredScripts() {
  let filtered;
  if (activeCat === 'all') {
    filtered = scripts;
  } else if (activeCat === 'favorites') {
    filtered = scripts.filter(s => isFavorite(s));
  } else {
    filtered = scripts.filter(s => s.cat === activeCat);
  }

  if (searchQ) {
    const q = searchQ.toLowerCase();
    filtered = filtered.filter(s => s.title.toLowerCase().includes(q));
  }
  return applySortFn(filtered);
}

function prioritizeFavorites(list, comparator) {
  return [...list].sort((a, b) => {
    const favoritePriority = Number(isFavorite(b)) - Number(isFavorite(a));
    return favoritePriority || comparator(a, b);
  });
}

function applySortFn(list) {
  const s = sortBy;
  if (s === 'title') return prioritizeFavorites(list, (a, b) => a.title.localeCompare(b.title));
  if (s === 'category') return prioritizeFavorites(list, (a, b) => a.cat.localeCompare(b.cat) || a.title.localeCompare(b.title));
  if (s === 'id') return prioritizeFavorites(list, (a, b) => a.id - b.id);
  if (s === 'custom') {
    const order = customScriptOrderByCategory[activeCat] || customScriptOrderByCategory.all || [];
    const rank = new Map(order.map((id, index) => [String(id), index]));
    return prioritizeFavorites(list, (a, b) => (rank.get(String(a.id)) ?? 999999) - (rank.get(String(b.id)) ?? 999999));
  }
  return prioritizeFavorites(list, (a, b) => a.title.localeCompare(b.title));
}

function applySort() {
  sortBy = document.getElementById('sortSelect').value;
  if (sortBy === 'custom') loadCustomOrder();
  render();
}

function updateSortLabelsForViewport() {
  const select = document.getElementById('sortSelect');
  if (!select) return;
  const useCompactLabels = window.matchMedia('(max-width: 480px)').matches;
  [...select.options].forEach(option => {
    option.textContent = useCompactLabels ? option.dataset.mobileLabel : option.dataset.desktopLabel;
  });
}

// ============================================================
//  MODO DE REORDENAÇÃO
// ============================================================
function toggleReorderMode() {
  reorderMode = !reorderMode;
  const btn = document.getElementById('reorderBtn');
  btn.classList.toggle('active');
  btn.textContent = reorderMode ? '✅ Finalizar reordenação' : '🔀 Reordenar categorias';
  document.querySelectorAll('#sidebarNav ul li').forEach(el => {
    el.classList.toggle('reorder-mode', reorderMode);
  });
  if (reorderMode) {
    showToast('🔄', 'Arraste as categorias para reordenar');
  } else {
    updateCustomOrderFromDOM();
  }
}

// ============================================================
//  DRAG & DROP DAS CATEGORIAS (SIDEBAR)
// ============================================================
let draggedItem = null;

function initDragDrop() {
  const items = document.querySelectorAll('#sidebarNav ul li');
  items.forEach(item => {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', (e) => {
      if (!reorderMode) { e.preventDefault(); return; }
      draggedItem = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      document.querySelectorAll('#sidebarNav ul li').forEach(el => {
        el.classList.remove('drag-over');
      });
      draggedItem = null;
    });
    item.addEventListener('dragover', (e) => {
      if (!reorderMode) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      item.classList.add('drag-over');
    });
    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });
    item.addEventListener('drop', (e) => {
      if (!reorderMode) return;
      e.preventDefault();
      item.classList.remove('drag-over');
      if (!draggedItem || draggedItem === item) return;
      const parent = item.parentNode;
      const items = Array.from(parent.querySelectorAll('li'));
      const draggedIndex = items.indexOf(draggedItem);
      const targetIndex = items.indexOf(item);
      if (draggedIndex < targetIndex) {
        parent.insertBefore(draggedItem, item.nextSibling);
      } else {
        parent.insertBefore(draggedItem, item);
      }
    });
  });
}

function updateCustomOrderFromDOM() {
  const items = document.querySelectorAll('#sidebarNav ul li a');
  const newOrder = [];
  items.forEach(a => {
    const text = a.textContent.trim();
    const catName = text.replace(/\s*\(\d+\)\s*$/, '').trim();
    if (catName && catName !== 'Todos' && catName !== 'Favoritos') newOrder.push(catName);
  });
  const currentOrderStr = JSON.stringify(customCategoryOrder);
  const newOrderStr = JSON.stringify(newOrder);
  if (currentOrderStr !== newOrderStr && newOrder.length > 0) {
    customCategoryOrder = newOrder;
    saveCustomOrder();
    showToast('✨', 'Ordem das categorias atualizada!');
  }
}

// ============================================================
//  BUILD SIDEBAR
// ============================================================
function buildSidebar() {
  const nav = document.getElementById('sidebarNav');
  const cats = getCategories();
  const counts = {};
  scripts.forEach(s => { counts[s.cat] = (counts[s.cat] || 0) + 1; });

  const categoryList = cats.filter(c => c !== 'all');
  let orderedCats = categoryList;
  if (sortBy === 'custom' && customCategoryOrder.length > 0) {
    orderedCats = getOrderedCategories(categoryList);
  }

  const favoriteCount = scripts.filter(s => isFavorite(s)).length;
  const overviewButton = (cat, label, icon, count) => {
    const active = activeCat === cat;
    return `<li><a class="cat-btn ${active ? 'active' : ''}" onclick="setCat('${cat}')" style="display:flex;justify-content:space-between;align-items:center;padding:8px 16px;border-radius:8px;color:${active ? '#fff' : 'var(--text-secondary)'};font-size:13px;font-weight:${active ? '600' : '500'};cursor:pointer;transition:all var(--transition);text-decoration:none;background:${active ? 'var(--accent)' : 'var(--bg)'};border:1.5px solid ${active ? 'var(--accent)' : 'var(--border)'};user-select:none;${active ? 'box-shadow:0 2px 8px rgba(30,79,122,.2);' : ''}">
      ${icon} ${label} <span class="nav-count" style="font-size:11px;background:${active ? 'rgba(255,255,255,.2)' : 'var(--surface2)'};padding:0px 10px;border-radius:12px;font-weight:500;color:${active ? '#fff' : 'var(--text-secondary)'};transition:all var(--transition);pointer-events:none;">${count}</span></a></li>`;
  };
  let html = '<div class="cat-lbl">Visão geral</div><ul>' +
    overviewButton('all', 'Todos', '📋', scripts.length) +
    overviewButton('favorites', 'Favoritos', '⭐', favoriteCount) +
    '</ul>';

  html += '<div class="cat-lbl">Categorias</div><ul>';
  orderedCats.forEach(cat => {
    const count = counts[cat] || 0;
    const isActive = activeCat === cat;
    html += `<li>
      <a class="cat-btn ${isActive ? 'active' : ''}" onclick="setCat('${cat.replace(/'/g, "\\'")}')" style="display:flex;justify-content:space-between;align-items:center;padding:8px 16px;border-radius:8px;color:${isActive ? '#fff' : 'var(--text-secondary)'};font-size:13px;font-weight:${isActive ? '600' : '500'};cursor:pointer;transition:all var(--transition);text-decoration:none;background:${isActive ? 'var(--accent)' : 'var(--bg)'};border:1.5px solid ${isActive ? 'var(--accent)' : 'var(--border)'};user-select:none;${isActive ? 'box-shadow:0 2px 8px rgba(30,79,122,.2);' : ''}">
        ${cat} <span class="nav-count" style="font-size:11px;background:${isActive ? 'rgba(255,255,255,.2)' : 'var(--surface2)'};padding:0px 10px;border-radius:12px;font-weight:500;color:${isActive ? '#fff' : 'var(--text-secondary)'};transition:all var(--transition);pointer-events:none;">${count}</span>
      </a>
    </li>`;
  });
  html += '</ul>';

  nav.innerHTML = html;
  if (reorderMode) {
    document.querySelectorAll('#sidebarNav ul li').forEach(el => {
      el.classList.add('reorder-mode');
    });
  }
  setTimeout(initDragDrop, 50);
}

function setCat(cat) {
  activeCat = cat;
  searchQ = '';
  if (window.matchMedia('(max-width: 820px)').matches) closeMobileNav();
  document.getElementById('searchInput').value = '';
  document.getElementById('pageTitle').innerHTML = cat === 'all' ? 'Todos os scriptz' : cat === 'favorites' ? 'Favoritos' : cat;
  buildSidebar();
  render();
}

function onSearch(val) {
  searchQ = val;
  const desktopInput = document.getElementById('searchInput');
  const mobileInput = document.getElementById('mobileSearchInput');
  if (desktopInput && desktopInput.value !== val) desktopInput.value = val;
  if (mobileInput && mobileInput.value !== val) mobileInput.value = val;
  render();
}

function toggleMobileSearch() {
  const bar = document.getElementById('mobileSearchBar');
  const toggle = document.getElementById('mobileSearchToggle');
  if (!bar) return;
  const isVisible = bar.classList.toggle('visible');
  bar.setAttribute('aria-hidden', String(!isVisible));
  if (toggle) toggle.setAttribute('aria-expanded', String(isVisible));
  if (isVisible) document.getElementById('mobileSearchInput')?.focus();
}

// ============================================================
//  AUTOCOMPLETE DE CATEGORIAS
// ============================================================
function filterCategorySuggestions(query) {
    const input = document.getElementById('newCategoryInput');
    const hidden = document.getElementById('newCategoryHidden');
    const suggestions = document.getElementById('categorySuggestions');
    
    if (!query || query.trim() === '') {
        suggestions.classList.remove('show');
        hidden.value = '';
        return;
    }
    
    query = query.trim();
    const cats = getCategories().filter(c => c !== 'all');
    
    const matches = cats.filter(c => c.toLowerCase().includes(query.toLowerCase()));
    
    let html = '';
    
    if (matches.length > 0) {
        matches.forEach(cat => {
            const highlighted = cat.replace(
                new RegExp(query, 'gi'),
                match => `<span class="highlight">${match}</span>`
            );
            html += `<div class="suggestion-item" onclick="selectCategory('${cat.replace(/'/g, "\\'")}')">${highlighted}</div>`;
        });
    }
    
    const exactMatch = cats.some(c => c.toLowerCase() === query.toLowerCase());
    
    if (!exactMatch) {
        html += `<div class="suggestion-item create-new" onclick="createNewCategory('${query.replace(/'/g, "\\'")}')">
            ➕ Criar nova categoria: <strong>${query}</strong>
        </div>`;
    }
    
    if (html) {
        suggestions.innerHTML = html;
        suggestions.classList.add('show');
    } else {
        suggestions.classList.remove('show');
    }
    
    hidden.value = query;
}

function selectCategory(cat) {
    const input = document.getElementById('newCategoryInput');
    const hidden = document.getElementById('newCategoryHidden');
    const suggestions = document.getElementById('categorySuggestions');
    
    input.value = cat;
    hidden.value = cat;
    suggestions.classList.remove('show');
    input.focus();
}

function createNewCategory(cat) {
    const input = document.getElementById('newCategoryInput');
    const hidden = document.getElementById('newCategoryHidden');
    const suggestions = document.getElementById('categorySuggestions');
    
    input.value = cat.trim();
    hidden.value = cat.trim();
    suggestions.classList.remove('show');
    showToast('✨', 'Nova categoria será criada');
}

document.addEventListener('click', function(e) {
    const wrapper = document.querySelector('.category-input-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        const suggestions = document.getElementById('categorySuggestions');
        if (suggestions) suggestions.classList.remove('show');
    }
});

// ============================================================
//  GERENCIAR CATEGORIAS - MODAL
// ============================================================
function openCategoryModal() {
    const modal = document.getElementById('categoryModal');
    modal.classList.add('show');
    renderCategoryList();
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    modal.classList.remove('show');
}

// ============================================================
//  RENDERIZAR LISTA DE CATEGORIAS NO MODAL
// ============================================================
function renderCategoryList() {
    const container = document.getElementById('categoryListContainer');
    const cats = getOrderedCategories(getCategories().filter(c => c !== 'all'));
    const counts = {};
    scripts.forEach(s => { counts[s.cat] = (counts[s.cat] || 0) + 1; });
    
    if (cats.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);">Nenhuma categoria criada ainda.</div>';
        return;
    }
    
    let html = '';
    cats.forEach(cat => {
        const count = counts[cat] || 0;
        const locked = isStandardCategory(cat);
        const lockLabel = locked ? '<span class="category-standard-lock" title="Categoria padrão protegida">🔒</span>' : '';
        const lockAttrs = locked ? 'disabled aria-disabled="true" title="Categoria padrão protegida"' : '';
        html += `
            <div class="category-item ${locked ? 'standard-category' : ''}" draggable="true" data-category="${cat.replace(/"/g, '&quot;')}">
                <span class="category-drag-handle" title="Arrastar para reordenar" aria-label="Arrastar categoria">⠿</span>
                <span class="category-name" ${locked ? '' : `onclick="startRenameCategory('${cat.replace(/'/g, "\\'")}')"`}>${cat}</span>${lockLabel}
                <span class="category-count">${count} ${count === 1 ? 'scriptz' : 'scriptz'}</span>
                <div class="category-actions">
                    <button class="btn-rename" onclick="startRenameCategory('${cat.replace(/'/g, "\\'")}')" ${lockAttrs}>✏️</button>
                    <button class="btn-delete" onclick="deleteCategory('${cat.replace(/'/g, "\\'")}')" ${lockAttrs}>🗑️</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    setTimeout(initCategoryDragDrop, 50);
}

// ============================================================
//  DRAG & DROP PARA CATEGORIAS NO MODAL
// ============================================================
let draggedCategoryItem = null;

function initCategoryDragDrop() {
    const container = document.getElementById('categoryListContainer');
    if (!container) return;
    const items = [...container.querySelectorAll('.category-item')];
    const clearDragState = () => items.forEach(el => el.classList.remove('dragging', 'drag-over'));
    const moveItem = (dragged, target, y = null) => {
        if (!dragged || !target || dragged === target) return false;
        const rect = target.getBoundingClientRect();
        const before = y === null ? [...container.children].indexOf(dragged) > [...container.children].indexOf(target) : y < rect.top + rect.height / 2;
        if (before) container.insertBefore(dragged, target);
        else container.insertBefore(dragged, target.nextSibling);
        return true;
    };
    items.forEach(item => {
        item.addEventListener('dragstart', e => {
            draggedCategoryItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', item.dataset.category || 'category');
        });
        item.addEventListener('dragover', e => {
            e.preventDefault();
            if (draggedCategoryItem && draggedCategoryItem !== item) {
                e.dataTransfer.dropEffect = 'move';
                item.classList.add('drag-over');
            }
        });
        item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
        item.addEventListener('drop', e => {
            e.preventDefault();
            const changed = moveItem(draggedCategoryItem, item, e.clientY);
            clearDragState();
            draggedCategoryItem = null;
            if (changed) saveCategoryOrderFromModal();
        });
        item.addEventListener('dragend', () => {
            clearDragState();
            draggedCategoryItem = null;
        });
        const handle = item.querySelector('.category-drag-handle');
        if (!handle) return;
        let pointerDrag = false;
        handle.addEventListener('pointerdown', e => {
            e.preventDefault();
            handle.setPointerCapture?.(e.pointerId);
            pointerDrag = true;
            draggedCategoryItem = item;
            item.classList.add('dragging');
        });
        handle.addEventListener('pointermove', e => {
            if (!pointerDrag) return;
            const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.category-item');
            if (!target || target === item || !container.contains(target)) return;
            items.forEach(el => el.classList.remove('drag-over'));
            target.classList.add('drag-over');
            moveItem(item, target, e.clientY);
        });
        const finishPointer = () => {
            if (!pointerDrag) return;
            pointerDrag = false;
            clearDragState();
            draggedCategoryItem = null;
            saveCategoryOrderFromModal();
        };
        handle.addEventListener('pointerup', finishPointer);
        handle.addEventListener('pointercancel', finishPointer);
    });
}

function saveCategoryOrderFromModal() {
    const items = document.querySelectorAll('#categoryListContainer .category-item');
    const newOrder = [];
    items.forEach(item => {
        const catName = item.getAttribute('data-category') || item.querySelector('.category-name').textContent.trim();
        if (catName && catName !== 'Todos') {
            newOrder.push(catName);
        }
    });
    
    const currentOrderStr = JSON.stringify(customCategoryOrder);
    const newOrderStr = JSON.stringify(newOrder);
    
    if (currentOrderStr !== newOrderStr && newOrder.length > 0) {
        customCategoryOrder = newOrder;
        saveCustomOrder();
        buildSidebar();
        showToast('✨', 'Ordem das categorias atualizada!');
    }
}

// ============================================================
//  RENOMEAR CATEGORIA
// ============================================================
let renamingCategory = null;

function startRenameCategory(cat) {
    if (isStandardCategory(cat)) {
        showToast('🔒', 'Categorias padrão não podem ser renomeadas.');
        return;
    }
    if (renamingCategory) {
        cancelRenameCategory();
    }
    
    const items = document.querySelectorAll('#categoryListContainer .category-item');
    let targetItem = null;
    let targetNameSpan = null;
    
    items.forEach(item => {
        const nameSpan = item.querySelector('.category-name');
        if (nameSpan.textContent.trim() === cat) {
            targetItem = item;
            targetNameSpan = nameSpan;
        }
    });
    
    if (!targetNameSpan) return;
    
    renamingCategory = cat;
    const currentName = targetNameSpan.textContent.trim();
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'category-rename-input';
    input.style.cssText = 'flex:1;font-size:14px;font-weight:500;padding:4px 8px;border:2px solid var(--accent);border-radius:4px;background:var(--bg);color:var(--text);outline:none;';
    input.onclick = (e) => e.stopPropagation();
    input.onmousedown = (e) => e.stopPropagation();
    input.onkeydown = function(e) {
        if (e.key === 'Enter') {
            confirmRenameCategory(cat, input.value.trim());
        }
        if (e.key === 'Escape') {
            cancelRenameCategory();
        }
    };
    input.onblur = function() {
        // O clique no input não confirma: apenas mantém o campo editável.
    };
    
    targetNameSpan.textContent = '';
    targetNameSpan.appendChild(input);
    targetNameSpan.classList.add('editing');
    input.focus();
    input.select();
}

function cancelRenameCategory() {
    renamingCategory = null;
    document.querySelectorAll('.category-name.editing').forEach(el => {
        el.classList.remove('editing');
        const input = el.querySelector('input');
        if (input) {
            const name = input.value;
            el.textContent = name;
            el.onclick = function() { startRenameCategory(name); };
        }
    });
}

function confirmRenameCategory(oldName, newName) {
    if (isStandardCategory(oldName)) {
        showToast('🔒', 'Categorias padrão não podem ser renomeadas.');
        cancelRenameCategory();
        return;
    }
    if (!newName || newName === oldName) {
        cancelRenameCategory();
        return;
    }
    
    const exists = scripts.some(s => s.cat === newName);
    if (exists) {
        showToast('⚠️', 'Já existe uma categoria com este nome!');
        cancelRenameCategory();
        return;
    }
    
    scripts.forEach(s => {
        if (s.cat === oldName) {
            s.cat = newName;
        }
    });
    
    const registryIndex = categoryRegistry.indexOf(oldName);
    if (registryIndex !== -1) categoryRegistry[registryIndex] = newName;
    if (customScriptOrderByCategory[oldName]) {
        customScriptOrderByCategory[newName] = customScriptOrderByCategory[oldName];
        delete customScriptOrderByCategory[oldName];
    }
    const orderIndex = customCategoryOrder.indexOf(oldName);
    if (orderIndex !== -1) {
        customCategoryOrder[orderIndex] = newName;
        saveCustomOrder();
    }
    
    cancelRenameCategory();
    saveToLocal();
    buildSidebar();
    renderCategoryList();
    render();
    showToast('✅', 'Categoria renomeada com sucesso!');
}

// ============================================================
//  EXCLUIR CATEGORIA
// ============================================================
function deleteCategory(cat) {
    if (isStandardCategory(cat)) {
        showToast('🔒', 'Categorias padrão não podem ser excluídas.');
        return;
    }
    const count = scripts.filter(s => s.cat === cat).length;
    
    if (count === 0) {
        if (!confirm(`Deseja excluir a categoria "${cat}"?`)) return;
    } else {
        const confirmMsg = `A categoria "${cat}" possui ${count} ${count === 1 ? 'scriptz' : 'scriptz'}.\n\nExcluí-la fará com que esses scriptz fiquem sem categoria (categoria "Geral").\n\nDeseja continuar?`;
        if (!confirm(confirmMsg)) return;
        
        scripts.forEach(s => {
            if (s.cat === cat) {
                s.cat = 'Geral';
            }
        });
    }
    
    customCategoryOrder = customCategoryOrder.filter(c => c !== cat);
    categoryRegistry = categoryRegistry.filter(c => c !== cat);
    delete customScriptOrderByCategory[cat];
    saveCustomOrder();
    saveToLocal();
    
    saveToLocal();
    buildSidebar();
    renderCategoryList();
    render();
    showToast('🗑️', 'Categoria removida!');
}

// ============================================================
//  CRIAR CATEGORIA PELO MODAL
// ============================================================
function createCategoryFromModal() {
    const input = document.getElementById('newCategoryName');
    const name = input.value.trim();
    
    if (!name) {
        showToast('⚠️', 'Digite o nome da nova categoria');
        return;
    }
    
    const exists = scripts.some(s => s.cat === name);
    if (exists) {
        showToast('⚠️', 'Esta categoria já existe!');
        input.value = '';
        input.focus();
        return;
    }
    
    if (!categoryRegistry.includes(name)) categoryRegistry.push(name);
    if (!customCategoryOrder.includes(name)) customCategoryOrder.push(name);
    saveCustomOrder();
    saveToLocal();
    
    input.value = '';
    input.focus();
    buildSidebar();
    renderCategoryList();
    showToast('✨', 'Categoria "' + name + '" criada!');
}

// ============================================================
//  INSERIR LINK
// ============================================================
function toggleLinkInput(id) {
    const container = document.getElementById('li' + id);
    container.classList.toggle('visible');
    if (container.classList.contains('visible')) {
        document.getElementById('liInput' + id).focus();
    }
}

function applyLink(id) {
    const input = document.getElementById('liInput' + id);
    const url = input.value.trim();
    if (!url) {
        showToast('⚠️', 'Digite uma URL válida');
        return;
    }
    
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        finalUrl = 'https://' + url;
    }
    
    const editor = document.getElementById('ce' + id);
    editor.focus();
    
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
        showToast('⚠️', 'Selecione o texto que deseja transformar em link');
        input.value = '';
        document.getElementById('li' + id).classList.remove('visible');
        return;
    }
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText.trim()) {
        showToast('⚠️', 'Selecione o texto que deseja transformar em link');
        return;
    }
    
    document.execCommand('createLink', false, finalUrl);
    
    const link = range.commonAncestorContainer?.parentElement?.closest?.('a') || 
                 range.commonAncestorContainer?.closest?.('a');
    if (link && link.tagName === 'A') {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }
    
    input.value = '';
    document.getElementById('li' + id).classList.remove('visible');
    livePreview(id);
    showToast('🔗', 'Link inserido com sucesso!');
}

// ============================================================
//  RENDER
// ============================================================
function render() {
  const list = getFilteredScripts();
  const badge = document.getElementById('badge');
  const empty = document.getElementById('empty');
  const container = document.getElementById('cards');

    badge.hidden = list.length === 0;
  badge.textContent = list.length === 0 ? '' : list.length === 1 ? '1 script' : `${list.length} scriptz`;
  if (list.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  container.innerHTML = list.map(s => cardHTML(s)).join('');
  setTimeout(initScriptDragDrop, 30);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getCategoryOptions(selected) {
  const cats = getCategories().filter(c => c !== 'all');
  let html = '';
  cats.forEach(c => {
    html += `<option value="${escapeHtml(c)}" ${c === selected ? 'selected' : ''}>${escapeHtml(c)}</option>`;
  });
  html += `<option value="__new__">➕ Nova categoria...</option>`;
  return html;
}

function buildFullText(script) {
  let htmlContent = script.html;
  
  htmlContent = greetingHTML(getGreetingMode(script)) + htmlContent;
  
  if (hasSignature(script)) {
    const signature = getSignature();
    htmlContent = htmlContent + '<p>Atenciosamente,<br>' + signature + '</p>';
  }
  
  return htmlContent;
}

function cardHTML(s) {
  const plainText = s.html.replace(/<[^>]*>/g, '');
  const fullHTML = buildFullText(s);
  
  const greetingMode = getGreetingMode(s);
  const greetingOptions = greetingSelectOptions(greetingMode);
  const hasSignatureFeature = hasSignature(s);
  const isFav = isFavorite(s);
  const catOptions = getCategoryOptions(s.cat);
  const locked = isStandardScript(s);
  const lockedBadge = locked ? '<span class="standard-badge" title="Script padrão protegido">🔒 Script padrão</span>' : '';
  const lockAttrs = locked ? 'disabled aria-disabled="true" title="Script padrão protegido"' : '';
  
  return `
  <div class="card ${locked ? 'standard-script' : ''}" id="c${s.id}" draggable="${sortBy === 'custom' ? 'true' : 'false'}">
    <div class="card-hd" onclick="toggleCard(${s.id})">
      <div class="card-info">
        <div class="card-title">
          ${escapeHtml(s.title)} ${lockedBadge}
        </div>
        <span class="card-tag">${escapeHtml(s.cat)}</span>
      </div>
      <div class="card-btns" onclick="event.stopPropagation()">
        <button class="btn btn-copy" id="cb${s.id}" onclick="event.stopPropagation(); copyScript(${s.id})">📋 Copiar</button>
        <button class="btn btn-ghost" onclick="startEdit(${s.id})" ${lockAttrs}>✏️ Editar</button>
        <button class="btn btn-del" onclick="deleteScript(${s.id})" ${lockAttrs}>🗑️ Excluir</button>
        <button class="fav-star ${isFav ? 'active' : ''}" onclick="toggleFavorite(${s.id})">${isFav ? '⭐' : '☆'}</button>
      </div>
      ${sortBy === 'custom' ? `<span class="script-order-controls" onclick="event.stopPropagation()"><button type="button" onclick="moveScriptOrder(${s.id}, -1)" aria-label="Mover script para cima">↑</button><button type="button" onclick="moveScriptOrder(${s.id}, 1)" aria-label="Mover script para baixo">↓</button></span>` : ''}
      <svg class="chev" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="card-body">
      <div class="preview-wrapper">
        <div class="preview-container" id="pc${s.id}">
          <div class="preview" id="pv${s.id}">${fullHTML}</div>
        </div>
      </div>
      <div class="editor-wrap" id="ew${s.id}">
        <div class="editor-meta">
          <input class="title-field" id="tt${s.id}" placeholder="Título do script" value="${escapeHtml(s.title)}" ${lockAttrs}>
          <select class="category-select" id="cat${s.id}" onchange="onCategoryChange(${s.id})" ${lockAttrs}>
            ${catOptions}
          </select>
          <div class="editor-checkboxes">
            <label class="editor-greeting-label">🕐 Saudação
              <select class="editor-greeting-select ${greetingMode === GREETING_MODES.off ? 'is-disabled' : ''}" id="greeting${s.id}" onchange="syncGreetingSelectState(this); livePreview(${s.id})" ${lockAttrs}>${greetingOptions}</select>
            </label>
            <label><input type="checkbox" id="chkSignature${s.id}" ${hasSignatureFeature ? 'checked' : ''} ${lockAttrs}> ✍️ Assinatura</label>
          </div>
        </div>
        <div class="fmt-bar">
          <button class="fmt-btn" onmousedown="event.preventDefault();document.execCommand('bold')"><b>B</b></button>
          <button class="fmt-btn" onmousedown="event.preventDefault();document.execCommand('italic')"><i>I</i></button>
          <button class="fmt-btn" onmousedown="event.preventDefault();document.execCommand('underline')"><u>U</u></button>
          <div class="fmt-sep"></div>
          <button class="fmt-btn fmt-btn-link" onmousedown="event.preventDefault();toggleLinkInput(${s.id})">🔗</button>
          <div class="fmt-sep"></div>
          <button class="fmt-btn" onmousedown="event.preventDefault();document.execCommand('insertUnorderedList')">•</button>
        </div>
        <div class="link-url-input" id="li${s.id}">
          <input type="url" id="liInput${s.id}" placeholder="https://exemplo.com" onkeydown="if(event.key==='Enter'){event.preventDefault();applyLink(${s.id});}">
          <button onclick="applyLink(${s.id})">Inserir</button>
          <button class="btn-ghost" style="padding:4px 8px;font-size:11px;" onclick="toggleLinkInput(${s.id})">✕</button>
        </div>
        <div contenteditable="${locked ? 'false' : 'true'}" id="ce${s.id}" data-placeholder="Texto do script (somente o corpo, sem saudação e sem assinatura)" oninput="livePreview(${s.id})">${plainText}</div>
        <div class="edit-bar">
          <button class="btn btn-save" onclick="saveEdit(${s.id})">💾 Salvar</button>
          <button class="btn btn-ghost" onclick="cancelEdit(${s.id})">Cancelar</button>
        </div>
      </div>
    </div>
  </div>`;
}

function toggleCard(id) {
  const card = document.getElementById('c' + id);
  card.classList.toggle('open');
}

function moveScriptOrder(id, direction) {
  const list = getFilteredScripts().map(s => String(s.id));
  const index = list.indexOf(String(id));
  const next = index + direction;
  if (index < 0 || next < 0 || next >= list.length) return;
  [list[index], list[next]] = [list[next], list[index]];
  customScriptOrderByCategory[activeCat] = list;
  saveToLocal();
  render();
}

function initScriptDragDrop() {
  if (sortBy !== 'custom') return;
  const container = document.getElementById('cards');
  if (!container) return;
  let dragged = null;
  container.querySelectorAll('.card[draggable="true"]').forEach(card => {
    card.addEventListener('dragstart', () => { dragged = card; card.classList.add('dragging'); });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      customScriptOrderByCategory[activeCat] = [...container.querySelectorAll('.card')].map(el => el.id.slice(1));
      saveToLocal();
      render();
      showToast('✨', 'Ordem dos scriptz atualizada!');
    });
    card.addEventListener('dragover', e => {
      e.preventDefault();
      if (!dragged || dragged === card) return;
      const rect = card.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) container.insertBefore(dragged, card);
      else container.insertBefore(dragged, card.nextSibling);
    });
  });
}

// ============================================================
//  MUDANÇA DE CATEGORIA (EDITOR)
// ============================================================
function onCategoryChange(id) {
  const existing = scripts.find(script => script.id === id);
  if (isStandardScript(existing)) {
    showToast('🔒', 'A categoria de um Script Padrão não pode ser alterada.');
    return;
  }
  const select = document.getElementById('cat' + id);
  const value = select.value;
  
  if (value === '__new__') {
    const newCat = prompt('Digite o nome da nova categoria:');
    if (newCat && newCat.trim()) {
      const catName = newCat.trim();
      const exists = scripts.some(s => s.cat === catName);
      if (!exists) {
        const option = document.createElement('option');
        option.value = catName;
        option.textContent = catName;
        select.insertBefore(option, select.querySelector('option[value="__new__"]'));
        select.value = catName;
        showToast('✨', 'Nova categoria criada!');
      } else {
        select.value = catName;
        showToast('ℹ️', 'Categoria já existe');
      }
    } else {
      const currentScript = scripts.find(s => s.id === id);
      if (currentScript) select.value = currentScript.cat;
      return;
    }
  }
  
  const idx = scripts.findIndex(s => s.id === id);
  if (idx !== -1) {
    const newCat = select.value;
      if (scripts[idx].cat !== newCat) {
        if (!categoryRegistry.includes(newCat)) categoryRegistry.push(newCat);
        scripts[idx].cat = newCat;
      saveToLocal();
      buildSidebar();
      const card = document.getElementById('c' + id);
      if (card) {
        const tag = card.querySelector('.card-tag');
        if (tag) tag.textContent = newCat;
      }
      showToast('📂', 'Categoria atualizada!');
    }
  }
}

// ============================================================
//  EDIÇÃO
// ============================================================
function startEdit(id) {
  if (activeEditId !== null && activeEditId !== id) {
    showToast('⚠️', 'Conclua ou cancele a edição atual antes de abrir outro script.');
    return;
  }
  const s = scripts.find(x => x.id === id);
  if (isStandardScript(s)) {
    showToast('🔒', 'Scripts padrão não podem ser editados.');
    return;
  }
  activeEditId = id;
  const card = document.getElementById('c' + id);
  card.classList.add('open', 'editing');
  document.getElementById('pv' + id).classList.add('editing-mode');
  document.getElementById('ew' + id).classList.add('visible');
  const ce = document.getElementById('ce' + id);
  ce.innerHTML = s.html;
  ce.focus();
  livePreview(id);
}

function cancelEdit(id) {
  const card = document.getElementById('c' + id);
  if (card) card.classList.remove('editing');
  document.getElementById('pv' + id).classList.remove('editing-mode');
    document.getElementById('ew' + id).classList.remove('visible');
  if (activeEditId === id) activeEditId = null;
}
function livePreview(id) {
  const ce = document.getElementById('ce' + id);
  const content = document.getElementById('pv' + id);
  const greetingSelect = document.getElementById('greeting' + id);
  const chkSignature = document.getElementById('chkSignature' + id);
  
  let htmlContent = ce.innerHTML;
  
  htmlContent = greetingHTML(greetingSelect?.value || GREETING_MODES.auto) + htmlContent;
  
  if (chkSignature && chkSignature.checked) {
    const signature = getSignature();
    htmlContent = htmlContent + '<p>Atenciosamente,<br>' + signature + '</p>';
  }
  
  content.innerHTML = htmlContent || '<span style="color:var(--text-secondary);opacity:.5;">Nenhum conteúdo ainda</span>';
}

function saveEdit(id) {
  const idx = scripts.findIndex(x => x.id === id);
  if (idx === -1 || isStandardScript(scripts[idx])) {
    showToast('🔒', 'Scripts padrão não podem ser alterados.');
    return;
  }
  const ce = document.getElementById('ce' + id);
  let newHTML = ce.innerHTML;
  const newTitle = document.getElementById('tt' + id).value.trim();
  const newCat = document.getElementById('cat' + id).value;
  const greetingMode = document.getElementById('greeting' + id).value;
  const hasSignatureFeature = document.getElementById('chkSignature' + id).checked;

  newHTML = cleanEditorHtml(newHTML);

  scripts[idx].html = newHTML;
  scripts[idx].greetingMode = greetingMode;
  scripts[idx].hasGreeting = greetingMode !== GREETING_MODES.off;
  scripts[idx].hasSignature = hasSignatureFeature;
  if (newTitle) scripts[idx].title = newTitle;
  if (newCat && newCat !== '__new__') scripts[idx].cat = newCat;

  const fullHTML = buildFullText(scripts[idx]);
  document.getElementById('pv' + id).innerHTML = fullHTML;

  cancelEdit(id);
  saveToLocal();
  buildSidebar();
  render();
  showToast('💾', 'Script salvo!');
}

function cleanEditorHtml(html) {
  let cleaned = html.replace(/<span style="[^"]*">/g, '');
  cleaned = cleaned.replace(/<\/span>/g, '');
  cleaned = cleaned.replace(/<p><\/p>/g, '');
  cleaned = cleaned.replace(/<br>$/g, '');
  return cleaned;
}

function deleteScript(id) {
  const script = scripts.find(item => item.id === id);
  if (isStandardScript(script)) {
    showToast('🔒', 'Scripts padrão não podem ser excluídos.');
    return;
  }
  if (!confirm('Excluir este script permanentemente?')) return;
  scripts = scripts.filter(x => x.id !== id);
  saveToLocal();
  buildSidebar();
  render();
  showToast('🗑️', 'Script excluído');
}

// ============================================================
//  COPIAR (preserva formatação - sem negrito)
// ============================================================
async function copyScript(id) {
  const s = scripts.find(x => x.id === id);
  if (!s) return;

  // Copiar nunca deve fechar o script: reforça o estado aberto antes e depois da operação.
  const card = document.getElementById('c' + id);
  if (card) card.classList.add('open');

  let htmlContent = greetingHTML(getGreetingMode(s)) + s.html;
  
  // Aplica assinatura se ativa (sem negrito)
  if (hasSignature(s)) {
    const signature = getSignature();
    htmlContent = htmlContent + '<p>Atenciosamente,<br>' + signature + '</p>';
  }
  
  htmlContent = htmlContent.replace(/^\s+/, '');

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const plainText = tempDiv.innerText || tempDiv.textContent;

  try {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const blobPlain = new Blob([plainText], { type: 'text/plain' });
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': blob, 'text/plain': blobPlain })
    ]);

    const btn = document.getElementById('cb' + s.id);
    btn.classList.add('ok');
    btn.innerHTML = '✅ Copiado!';
    setTimeout(() => { btn.classList.remove('ok'); btn.innerHTML = '📋 Copiar'; }, 2000);
    if (card) card.classList.add('open');
    showToast('📋', 'Texto copiado com formatação!');
  } catch (err) {
    navigator.clipboard.writeText(plainText);
    if (card) card.classList.add('open');
    showToast('📋', 'Copiado (somente texto)');
  }
}

// ============================================================
//  ADICIONAR SCRIPT
// ============================================================
function openModal() {
    document.getElementById('newTitle').value = '';
    document.getElementById('newCategoryInput').value = '';
    document.getElementById('newCategoryHidden').value = '';
    document.getElementById('newText').value = '';
    const greetingSelect = document.getElementById('newGreeting');
    greetingSelect.innerHTML = greetingSelectOptions(GREETING_MODES.auto);
    greetingSelect.value = GREETING_MODES.auto;
    syncGreetingSelectState(greetingSelect);
    document.getElementById('newSignature').checked = true;
    document.getElementById('categorySuggestions').classList.remove('show');
    document.getElementById('overlay').classList.add('show');
    
    setTimeout(() => {
        document.getElementById('newCategoryInput').focus();
    }, 100);
}

function closeModal() {
    document.getElementById('overlay').classList.remove('show');
    document.getElementById('categorySuggestions').classList.remove('show');
}

function textToHTML(txt) {
    return txt.split(/\n\n+/).map(block => {
        const lines = block.split('\n').map(l => escapeHtml(l)).join('<br>');
        return '<p>' + lines + '</p>';
    }).join('');
}

function addScript() {
    const title = document.getElementById('newTitle').value.trim();
    const text = document.getElementById('newText').value.trim();
    const categoryInput = document.getElementById('newCategoryInput').value.trim();
    const hiddenCategory = document.getElementById('newCategoryHidden').value.trim();
    const greetingMode = document.getElementById('newGreeting').value;
    const includeSignature = document.getElementById('newSignature').checked;

    if (!title || !text) {
        showToast('⚠️', 'Preencha título e texto');
        return;
    }
    if (scripts.length >= currentScriptLimit()) {
        showToast('⚠️', `Limite de ${currentScriptLimit()} scriptz atingido neste contexto.`);
        return;
    }

    const cat = categoryInput || hiddenCategory || 'Geral';
    
    const exists = scripts.some(s => s.cat === cat);
    if (!categoryRegistry.includes(cat)) categoryRegistry.push(cat);
    if (!customCategoryOrder.includes(cat)) customCategoryOrder.push(cat);
    if (!exists && cat !== 'Geral') {
        showToast('✨', 'Categoria "' + cat + '" criada automaticamente!');
    }

    scripts.push({
        id: nextId++,
        cat: cat,
        title: title,
        html: textToHTML(text),
        greetingMode: greetingMode,
        hasGreeting: greetingMode !== GREETING_MODES.off,
        hasSignature: includeSignature,
        isFavorite: false,
        isStandard: false,
        source: 'user'
    });
    
    closeModal();
    activeCat = cat;
    searchQ = '';
    document.getElementById('pageTitle').innerHTML = cat;
    saveToLocal();
    buildSidebar();
    render();
    showToast('✅', 'Script adicionado!');
}

// ============================================================
//  EXPORT / IMPORT
// ============================================================
function exportJSON() {
  if (!workspace.mode) {
    showToast('⚠️', 'Selecione um modo antes de exportar.');
    return;
  }
  const standard = isStandardMode();
  const payload = {
    schema: standard ? 'scriptz-standard-changes' : 'scriptz-free-project',
    version: 3,
    mode: workspace.mode,
    division: workspace.division,
    scripts: standard ? scripts.filter(script => !script.isStandard) : scripts,
    categories: standard ? categoryRegistry.filter(category => !standardCategories.includes(category)) : categoryRegistry,
    categoryOrder: customCategoryOrder,
    scriptOrders: customScriptOrderByCategory
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = standard ? `${workspace.division}-alteracoes.json` : 'scriptz-modo-livre.json';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('📤', 'JSON exportado!');
}

function importProjectData(imported) {
  if (!workspace.mode) throw new Error('Selecione um modo antes de importar.');
  const legacy = Array.isArray(imported);
  const data = legacy ? { schema: 'legacy-scriptz', scripts: imported, categories: [] } : imported;
  if (!data || !Array.isArray(data.scripts)) throw new Error('Formato inválido');
  if (data.scripts.length > currentScriptLimit()) throw new Error(`O arquivo excede o limite de ${currentScriptLimit()} scriptz.`);

  if (isStandardMode()) {
    if (data.schema !== 'scriptz-standard-changes' || data.division !== workspace.division) {
      throw new Error('Este arquivo não pertence à divisão atual do Scriptz Padrão.');
    }
    const importedCategories = Array.isArray(data.categories) ? data.categories.map(String) : [];
    const allowedCategories = new Set([...standardCategories, ...importedCategories, 'Geral']);
    let movedToGeneral = 0;
    const userScripts = data.scripts.map(script => {
      const normalized = normalizeScript({ ...script, isStandard: false }, 'user');
      if (!allowedCategories.has(normalized.cat)) {
        normalized.cat = 'Geral';
        movedToGeneral += 1;
      }
      return normalized;
    });
    scripts = [...standardScripts, ...userScripts];
    categoryRegistry = [...new Set([...standardCategories, ...importedCategories, ...scripts.map(script => script.cat)])];
    customCategoryOrder = Array.isArray(data.categoryOrder) ? data.categoryOrder : categoryRegistry;
    customScriptOrderByCategory = data.scriptOrders || {};
    if (movedToGeneral) showToast('ℹ️', `${movedToGeneral} scriptz foram movidos para Geral porque a categoria padrão não existe.`);
  } else {
    if (data.schema === 'scriptz-standard-changes') throw new Error('Alterações do Scriptz Padrão devem ser importadas na divisão correspondente.');
    scripts = data.scripts.map(script => normalizeScript({ ...script, isStandard: false }, 'user'));
    categoryRegistry = Array.isArray(data.categories) ? data.categories : [];
    customCategoryOrder = Array.isArray(data.categoryOrder) ? data.categoryOrder : [];
    customScriptOrderByCategory = data.scriptOrders || {};
    categoryRegistry = [...new Set([...categoryRegistry, ...scripts.map(script => script.cat).filter(Boolean)])];
  }
  nextId = Math.max(...scripts.map(script => Number(script.id) || 0), 0) + 1;
  saveToLocal();
  refreshWorkspaceUI();
  showToast('📥', 'Importado com sucesso!');
}

function readImportFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = event => {
    try {
      importProjectData(JSON.parse(event.target.result));
    } catch (error) {
      showToast('❌', error.message || 'Arquivo inválido');
    }
  };
  reader.readAsText(file);
}

function handleImport(event) {
  readImportFile(event.target.files[0]);
  event.target.value = '';
}

// ============================================================
//  DRAG & DROP (arquivo JSON)
// ============================================================
const dropZone = document.getElementById('dropZone');
if (dropZone) {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      readImportFile(file);
    } else {
      showToast('⚠️', 'Arraste um arquivo .json');
    }
  });
}

function openTemplateBaseModal() {
  document.getElementById('templateBaseModal')?.classList.add('show');
}

function closeTemplateBaseModal() {
  document.getElementById('templateBaseModal')?.classList.remove('show');
}

async function loadStandardBaseIntoFree(division) {
  if (!workspace.mode || isStandardMode()) return;
  try {
    const template = await fetchStandardTemplate(division);
    const incoming = template.scripts.map(script => normalizeScript({ ...script, isStandard: false }, 'template-base'));
    if (scripts.length + incoming.length > SCRIPT_LIMITS.free) throw new Error(`O Modo Livre aceita até ${SCRIPT_LIMITS.free} scriptz.`);
    scripts = [...scripts, ...incoming];
    categoryRegistry = [...new Set([...categoryRegistry, ...(template.categories || []), ...incoming.map(script => script.cat)])];
    customCategoryOrder = [...new Set([...customCategoryOrder, ...categoryRegistry])];
    nextId = Math.max(...scripts.map(script => Number(script.id) || 0), 0) + 1;
    saveToLocal();
    closeTemplateBaseModal();
    refreshWorkspaceUI();
    showToast('📂', `Base CAP · ${division} carregada no Modo Livre.`);
  } catch (error) {
    showToast('❌', error.message || 'Não foi possível carregar a base.');
  }
}

function discardFreeTemplates() {
  if (isStandardMode()) return;
  const templateScripts = scripts.filter(script => script.source === 'template-base');
  if (!templateScripts.length) {
    showToast('ℹ️', 'Não há templates carregados para descartar.');
    return;
  }
  if (!confirm(`Descartar ${templateScripts.length} template(s) carregado(s) como base? Seus scripts continuarão preservados.`)) return;
  scripts = scripts.filter(script => script.source !== 'template-base');
  categoryRegistry = categoryRegistry.filter(category => scripts.some(script => script.cat === category));
  customCategoryOrder = customCategoryOrder.filter(category => categoryRegistry.includes(category));
  saveToLocal();
  refreshWorkspaceUI();
  showToast('🧹', 'Templates descartados.');
}

function downloadAndNewProject() {
  if (isStandardMode()) return;
  if (!confirm('O JSON atual será baixado e o Modo Livre será iniciado em branco. Continuar?')) return;
  exportJSON();
  setTimeout(() => {
    localStorage.removeItem(workspaceKey());
    scripts = [];
    categoryRegistry = [];
    customCategoryOrder = [];
    customScriptOrderByCategory = {};
    nextId = 100;
    saveToLocal();
    refreshWorkspaceUI();
    showToast('✅', 'Novo projeto iniciado no Modo Livre.');
  }, 120);
}

// ============================================================
//  TOAST
// ============================================================
function showToast(icon, msg) {
  const t = document.getElementById('toast');
  t.querySelector('.icon').textContent = icon;
  t.querySelector('.msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ============================================================
//  INICIALIZAÇÃO
// ============================================================
function closeMobileNav() {
  document.body.classList.remove('mobile-nav-open');
  const toggle = document.getElementById('mobileNavToggle');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
}

function openMobileNav() {
  document.body.classList.add('mobile-nav-open');
  const toggle = document.getElementById('mobileNavToggle');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
  }
  document.getElementById('mobileNavClose')?.focus();
}

function initSidebarResize() {
  const handle = document.getElementById('sidebarResizeHandle');
  if (!handle) return;
  const saved = Number(localStorage.getItem('sidebar_width'));
  if (saved >= 220 && saved <= 420) document.documentElement.style.setProperty('--sidebar-width', `${saved}px`);
  let dragging = false;
  handle.addEventListener('pointerdown', (event) => {
    if (window.matchMedia('(max-width: 820px)').matches) return;
    dragging = true;
    handle.setPointerCapture(event.pointerId);
    document.body.classList.add('resizing-sidebar');
  });
  handle.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const width = Math.min(420, Math.max(220, event.clientX));
    document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
  });
  handle.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    document.body.classList.remove('resizing-sidebar');
    const width = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width'), 10);
    localStorage.setItem('sidebar_width', width);
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  const button = document.getElementById('installAppBtn');
  if (button) {
    button.hidden = false;
    button.dataset.installReady = 'true';
  }
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const button = document.getElementById('installAppBtn');
  if (button) button.hidden = true;
});

document.addEventListener('DOMContentLoaded', () => {
  setTheme(getTheme());
  updateSortLabelsForViewport();
  window.addEventListener('resize', updateSortLabelsForViewport, { passive: true });
  const installButton = document.getElementById('installAppBtn');
  if (installButton) {
    installButton.hidden = false;
    installButton.addEventListener('click', installScriptzApp);
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) installButton.hidden = true;
  }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  const select = document.getElementById('themeSelect');
  if (select) select.addEventListener('change', (event) => selectTheme(event.target.value));
  const mobileToggle = document.getElementById('mobileNavToggle');
  if (mobileToggle) mobileToggle.addEventListener('click', () => document.body.classList.contains('mobile-nav-open') ? closeMobileNav() : openMobileNav());
  const mobileSearchToggle = document.getElementById('mobileSearchToggle');
  if (mobileSearchToggle) mobileSearchToggle.addEventListener('click', toggleMobileSearch);
  document.getElementById('mobileNavClose')?.addEventListener('click', closeMobileNav);
  document.getElementById('mobileNavBackdrop')?.addEventListener('click', closeMobileNav);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (document.body.classList.contains('mobile-nav-open')) closeMobileNav();
      if (document.getElementById('mobileSearchBar')?.classList.contains('visible')) toggleMobileSearch();
    }
  });
  initSidebarResize();
  loadData();
});

document.getElementById('overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('overlay')) closeModal();
});

document.getElementById('categoryModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('categoryModal')) closeCategoryModal();
});

document.getElementById('templateBaseModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('templateBaseModal')) closeTemplateBaseModal();
});

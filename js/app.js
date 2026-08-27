// ============================================================
//  ESTADO GLOBAL
// ============================================================
let scripts = [];
let nextId = 100;
let activeCat = 'all';
let searchQ = '';
let globalSearchQ = '';
let lastGlobalSearchCategory = 'all';
let originalScripts = [];
let sortBy = 'custom';
let customCategoryOrder = [];
let customScriptOrderByCategory = {};
let categoryRegistry = [];
let categoryParents = {};
let categoryLabels = {};
let expandedCategories = new Set();
let subcategoryCreatorOpen = false;
let sidebarCategoryCreatorOpen = false;
let isInitialLanding = true;
let activeLibrary = 'personal';
let standardCategoryOrder = [];
let standardScriptOrderByCategory = {};
let isCustomOrderActive = false;
let reorderMode = false;
let deferredInstallPrompt = null;
let activeEditId = null;
let workspace = { mode: null, division: null };
let standardCategories = [];
let standardScripts = [];
let standardCategoryParents = {};
let standardCategoryLabels = {};
let newScriptLinkRange = null;
let themeTransitionTimer = null;
let newScriptModalTrigger = null;
let pendingSignatureCopyId = null;
let noticeAction = null;
const librarySectionOpen = { standard: true, personal: true };
const PDF_GUIDE_CATEGORY = 'Instruções de escrita no campo “Observações” das guias do AD';
const PDF_GUIDE_ASSET = 'assets/docs/padrao-escrita-observacoes.pdf';

const SCRIPT_LIMITS = Object.freeze({ standard: 300, free: 500 });
const SECURITY_LIMITS = Object.freeze({
  maxImportBytes: 2 * 1024 * 1024,
  maxHtmlChars: 60000,
  maxTitleChars: 180,
  maxCategoryChars: 180,
  maxCategories: 2000,
  maxLinkChars: 2048,
  maxJsonKeys: 80
});
const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
const DANGEROUS_OBJECT_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const CATEGORY_ACTION_VALUES = new Set(['__new__', '__new_sub__']);
const CATEGORY_KEY_SEPARATOR = '::';
const STANDARD_DIVISIONS = Object.freeze({
  DEPROT: 'templates/DEPROT.JSON',
  DPCI: 'templates/DPCI.JSON',
  DPD: 'templates/DPD.JSON',
  'CAP-G': 'templates/CAP-G.JSON',
  'Núcleo': 'templates/SMUL-CAP.JSON',
  'Sala Arthur Saboya': 'templates/SALA-ARTHUR-SABOYA.JSON'
});
const DEPROT_ROOT_CATEGORY_ORDER = Object.freeze(['E-mail', 'Mensagens externas AD', 'Guias AD', 'Cotas do SEI']);
const LEGACY_DIVISIONS = Object.freeze({ 'Coord.': 'Núcleo' });

function getExclusiveActionMessage({ allowEdit = false, allowReorder = false, allowCategoryCreation = false } = {}) {
  if (activeEditId !== null && !allowEdit) return 'Conclua ou cancele a edição do script antes de realizar outra ação.';
  if (reorderMode && !allowReorder) return 'Finalize a reordenação de categorias antes de realizar outra ação.';
  if (sidebarCategoryCreatorOpen && !allowCategoryCreation) return 'Conclua ou cancele a criação da categoria antes de realizar outra ação.';
  return '';
}

function blockConflictingAction(options) {
  const message = getExclusiveActionMessage(options);
  if (!message) return false;
  showToast('⚠️', message);
  return true;
}

function syncExclusiveInteractionState() {
  document.body.classList.toggle('sidebar-reorder-active', reorderMode);
  document.body.classList.toggle('sidebar-category-creation-active', sidebarCategoryCreatorOpen);
  document.body.classList.toggle('script-editing-active', activeEditId !== null);
}

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
  const root = document.documentElement;
  const shouldAnimate = root.getAttribute('data-theme') !== safeTheme
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (shouldAnimate) {
    window.clearTimeout(themeTransitionTimer);
    root.classList.remove('theme-transitioning');
    void root.offsetWidth;
    root.classList.add('theme-transitioning');
  }
  root.setAttribute('data-theme', safeTheme);
  localStorage.setItem('theme', safeTheme);
  const select = document.getElementById('themeSelect');
  if (select) select.value = safeTheme;
  document.body.dataset.themeLabel = THEME_OPTIONS[safeTheme].label;
  if (shouldAnimate) {
    themeTransitionTimer = window.setTimeout(() => root.classList.remove('theme-transitioning'), 260);
  }
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

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shouldShowDailyWelcome() {
  return localStorage.getItem('scriptz_daily_welcome_date') !== localDateKey();
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
  const mode = Object.values(GREETING_MODES).includes(selectedMode) ? selectedMode : GREETING_MODES.off;
  return `
    <option value="${GREETING_MODES.off}" ${mode === GREETING_MODES.off ? 'selected' : ''}>Nenhuma</option>
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
function syncSignatureInputWidth() {
  const input = document.getElementById('userNameInput');
  if (!input) return;
  if (window.matchMedia('(max-width: 820px)').matches) {
    input.style.removeProperty('width');
    return;
  }
  const styles = getComputedStyle(input);
  const canvas = syncSignatureInputWidth.canvas || (syncSignatureInputWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  if (!context) return;
  context.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
  const content = input.value || 'Seu nome';
  const tracking = Number.parseFloat(styles.letterSpacing) || 0;
  const contentWidth = context.measureText(content).width + Math.max(0, content.length - 1) * tracking;
  const padding = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight) + 2;
  const minimum = context.measureText('Seu nome').width + 7 * tracking + padding;
  const desktopReserve = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--signature-reserve'));
  const maximum = Math.min(400, Number.isFinite(desktopReserve) ? desktopReserve - 30 : window.innerWidth - 64);
  input.style.width = `${Math.ceil(Math.min(maximum, Math.max(minimum, contentWidth + padding)))}px`;
}

function getSignature() {
  const name = document.getElementById('userNameInput').value.trim();
  return name || '------';
}

function getSignatureName() {
  return document.getElementById('userNameInput')?.value.trim() || localStorage.getItem('user_signature')?.trim() || '';
}

function setSignatureName(name) {
  const input = document.getElementById('userNameInput');
  if (!input) return '';
  const normalized = String(name || '').trim();
  input.value = normalized;
  localStorage.setItem('user_signature', normalized);
  syncSignatureInputWidth();
  return normalized;
}

function hasSignature(script) {
  return script.hasSignature !== false;
}

function updateSignature() {
  setSignatureName(document.getElementById('userNameInput').value);
  render();
  showToast('✅', 'Assinatura atualizada!');
}

function loadUserName() {
  const saved = localStorage.getItem('user_signature');
  if (saved) document.getElementById('userNameInput').value = saved;
  syncSignatureInputWidth();
}

// ============================================================
//  FAVORITOS
// ============================================================
function toggleFavorite(id) {
  if (blockConflictingAction()) return;
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

function getOrderedCategories(cats, library = activeLibraryKey()) {
  const categoryOrder = getLibraryCategoryOrder(library);
  if (categoryOrder.length === 0) return cats;
  const ordered = [];
  const remaining = [];
  const catSet = new Set(cats);
  categoryOrder.forEach(cat => {
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
  return isStandardMode() && script.isStandard === true && script.source !== 'user';
}

function isStandardCategory(category) {
  return isStandardLibrary() && standardCategories.includes(category);
}

function isStandardLibrary() {
  return isStandardMode() && activeLibrary === 'standard';
}

function activeLibraryKey() {
  return isStandardLibrary() ? 'standard' : 'personal';
}

function getLibraryScripts(library = activeLibraryKey()) {
  if (!isStandardMode()) return scripts;
  return library === 'standard'
    ? scripts.filter(script => isStandardScript(script))
    : scripts.filter(script => !isStandardScript(script));
}

function getLibraryCategoryRegistry(library = activeLibraryKey()) {
  return isStandardMode() && library === 'standard' ? standardCategories : categoryRegistry;
}

function getLibraryCategoryParents(library = activeLibraryKey()) {
  return isStandardMode() && library === 'standard' ? standardCategoryParents : categoryParents;
}

function getLibraryCategoryLabels(library = activeLibraryKey()) {
  return isStandardMode() && library === 'standard' ? standardCategoryLabels : categoryLabels;
}

function getLibraryCategoryOrder(library = activeLibraryKey()) {
  return isStandardMode() && library === 'standard' ? standardCategoryOrder : customCategoryOrder;
}

function prioritizedStandardCategoryOrder(categories = [], parents = {}, division = workspace.division) {
  const known = [...new Set([...categories, ...Object.keys(parents)])];
  if (division !== 'DEPROT') return known;
  const priority = DEPROT_ROOT_CATEGORY_ORDER.filter(category => known.includes(category));
  return [...priority, ...known.filter(category => !priority.includes(category))];
}

function getLibraryScriptOrders(library = activeLibraryKey()) {
  return isStandardMode() && library === 'standard' ? standardScriptOrderByCategory : customScriptOrderByCategory;
}

function setLibraryCategoryOrder(order, library = activeLibraryKey()) {
  if (isStandardMode() && library === 'standard') standardCategoryOrder = order;
  else customCategoryOrder = order;
}

function setLibraryScriptOrder(category, order, library = activeLibraryKey()) {
  if (isStandardMode() && library === 'standard') standardScriptOrderByCategory[category] = order;
  else customScriptOrderByCategory[category] = order;
}

function currentScriptLimit() {
  return isStandardMode() ? SCRIPT_LIMITS.standard : SCRIPT_LIMITS.free;
}

function normalizedCategoryList(categories, fallback = 'Geral') {
  const source = Array.isArray(categories) ? categories : [categories];
  const unique = [...new Set(source.map(category => String(category || '').trim()).filter(Boolean))];
  return unique.length ? unique : [fallback];
}

function getScriptCategories(script) {
  return normalizedCategoryList(script?.cats ?? script?.cat);
}

function setScriptCategories(script, categories) {
  const normalized = normalizedCategoryList(categories);
  script.cats = normalized;
  script.cat = normalized[0];
  return normalized;
}

function scriptHasCategory(script, category) {
  return getScriptCategories(script).includes(category);
}

function allScriptCategories(collection = getLibraryScripts()) {
  return collection.flatMap(script => getScriptCategories(script));
}

function normalizeCategoryName(value) {
  return String(value || '').trim().slice(0, SECURITY_LIMITS.maxCategoryChars);
}

function isSafeRecord(value, label = 'Objeto') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} inválido.`);
  const keys = Object.keys(value);
  if (keys.length > SECURITY_LIMITS.maxJsonKeys) throw new Error(`${label} excede a quantidade permitida de campos.`);
  if (keys.some(key => DANGEROUS_OBJECT_KEYS.has(key))) throw new Error(`${label} contém uma chave não permitida.`);
  return value;
}

function sanitizeLinkUrl(rawUrl, { allowRelativeAsset = true } = {}) {
  const value = String(rawUrl || '').trim();
  if (!value || value.length > SECURITY_LIMITS.maxLinkChars || /[\u0000-\u001F\u007F]/.test(value)) return '';
  if (allowRelativeAsset && /^(?:\.\/)?assets\/[-a-zA-Z0-9_./]+(?:\?[a-zA-Z0-9_=&.-]+)?$/.test(value)) return value;
  if (/^mailto:/i.test(value)) {
    const address = value.slice(7);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? `mailto:${address}` : '';
  }
  try {
    const parsed = new URL(value);
    if (!SAFE_LINK_PROTOCOLS.has(parsed.protocol) || parsed.username || parsed.password) return '';
    return parsed.href;
  } catch (_) {
    return '';
  }
}

function prepareUserLink(rawUrl) {
  const value = String(rawUrl || '').trim();
  const candidate = /^(?:https?:|mailto:)/i.test(value) ? value : `https://${value}`;
  return sanitizeLinkUrl(candidate, { allowRelativeAsset: false });
}

function normalizeCategoryLabels(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .map(([key, label]) => [normalizeCategoryName(key), normalizeCategoryName(label)])
    .filter(([key, label]) => key && label));
}

function fallbackCategoryLabel(category) {
  const key = normalizeCategoryName(category);
  const separatorIndex = key.lastIndexOf(CATEGORY_KEY_SEPARATOR);
  return separatorIndex === -1 ? key : key.slice(separatorIndex + CATEGORY_KEY_SEPARATOR.length);
}

function categoryDisplayName(category, library = activeLibraryKey()) {
  const key = normalizeCategoryName(category);
  return normalizeCategoryName(getLibraryCategoryLabels(library)[key]) || fallbackCategoryLabel(key);
}

function categoryKeyFor(name, parent = '') {
  const label = normalizeCategoryName(name);
  const parentKey = normalizeCategoryName(parent);
  return parentKey ? `${parentKey}${CATEGORY_KEY_SEPARATOR}${label}` : label;
}

function categoryNameExistsAtLevel(name, parent = '', library = activeLibraryKey(), except = '') {
  const label = normalizeCategoryName(name);
  const parentKey = normalizeCategoryName(parent);
  return getCategories(library).some(category => category !== 'all'
    && category !== except
    && getCategoryParent(category, library) === parentKey
    && categoryDisplayName(category, library) === label);
}

function normalizeCategoryParents(value) {
  const relationships = {};
  const pairs = Array.isArray(value)
    ? value.map(entry => [entry?.child || entry?.category || entry?.name, entry?.parent])
    : Object.entries(value && typeof value === 'object' ? value : {});
  pairs.forEach(([child, parent]) => {
    const childName = normalizeCategoryName(child);
    const parentName = normalizeCategoryName(parent);
    if (childName && parentName && childName !== parentName) relationships[childName] = parentName;
  });
  return relationships;
}

function reconcileCategoryHierarchy() {
  const userScripts = isStandardMode() ? scripts.filter(script => !isStandardScript(script)) : scripts;
  const known = [...categoryRegistry, ...allScriptCategories(userScripts), ...Object.keys(categoryParents), ...Object.values(categoryParents)]
    .map(normalizeCategoryName)
    .filter(Boolean);
  categoryRegistry = [...new Set(known)];
  const nextLabels = {};
  categoryRegistry.forEach(category => {
    nextLabels[category] = normalizeCategoryName(categoryLabels[category]) || fallbackCategoryLabel(category);
  });
  categoryLabels = nextLabels;
  const valid = {};
  Object.entries(categoryParents).forEach(([child, parent]) => {
    const childName = normalizeCategoryName(child);
    const parentName = normalizeCategoryName(parent);
    if (childName && parentName && childName !== parentName && categoryRegistry.includes(childName) && categoryRegistry.includes(parentName)) {
      valid[childName] = parentName;
    }
  });
  Object.entries(valid).forEach(([child, parent]) => {
    if (valid[parent] || hasDirectScripts(parent, 'personal')) delete valid[child];
  });
  categoryParents = valid;
  expandedCategories = new Set([...expandedCategories].filter(category => categoryRegistry.includes(category)));
}

function getCategories(library = activeLibraryKey()) {
  const registry = getLibraryCategoryRegistry(library);
  const parents = getLibraryCategoryParents(library);
  const libraryScripts = getLibraryScripts(library);
  const categories = ['all'];
  [...registry, ...allScriptCategories(libraryScripts), ...Object.keys(parents), ...Object.values(parents)]
    .map(normalizeCategoryName)
    .filter(Boolean)
    .forEach(category => { if (!categories.includes(category)) categories.push(category); });
  return categories;
}

function getCategoryParent(category, library = activeLibraryKey()) {
  return normalizeCategoryName(getLibraryCategoryParents(library)[category]);
}

function getChildCategories(parent, library = activeLibraryKey()) {
  return getCategories(library).filter(category => category !== 'all' && getCategoryParent(category, library) === parent);
}

function getRootCategories(library = activeLibraryKey()) {
  return getCategories(library).filter(category => category !== 'all' && !getCategoryParent(category, library));
}

function isRootCategory(category, library = activeLibraryKey()) {
  return Boolean(category) && !getCategoryParent(category, library);
}

function hasDirectScripts(category, library = activeLibraryKey()) {
  return getLibraryScripts(library).some(script => scriptHasCategory(script, category));
}

function canManageSubcategories(category) {
  return !isStandardLibrary() && isRootCategory(category) && (!hasDirectScripts(category) || getChildCategories(category).length > 0);
}

function getAssignableCategories(library = activeLibraryKey()) {
  return getCategories(library).filter(category => category !== 'all' && !getChildCategories(category, library).length);
}

function getCategoryDescendants(category, seen = new Set(), library = activeLibraryKey()) {
  if (seen.has(category)) return seen;
  seen.add(category);
  getChildCategories(category, library).forEach(child => getCategoryDescendants(child, seen, library));
  return seen;
}

function getCategoryPath(category, library = activeLibraryKey()) {
  const parts = [categoryDisplayName(category, library)];
  const visited = new Set([category]);
  let parent = getCategoryParent(category, library);
  while (parent && !visited.has(parent)) {
    parts.unshift(categoryDisplayName(parent, library));
    visited.add(parent);
    parent = getCategoryParent(parent, library);
  }
  return parts.join(' › ');
}

function categoryScriptCount(category, includeDescendants = false, library = activeLibraryKey()) {
  const categories = includeDescendants ? getCategoryDescendants(category, new Set(), library) : new Set([category]);
  return getLibraryScripts(library).filter(script => getScriptCategories(script).some(scriptCategory => categories.has(scriptCategory))).length;
}

function scriptMatchesActiveCategory(script, category, library = activeLibraryKey()) {
  const acceptedCategories = getCategoryDescendants(category, new Set(), library);
  return getScriptCategories(script).some(scriptCategory => acceptedCategories.has(scriptCategory));
}

function isCategoryAction(value) {
  return CATEGORY_ACTION_VALUES.has(value);
}

function registerCategory(name, parent = undefined) {
  const label = normalizeCategoryName(name);
  if (!label) return '';
  let parentName = '';
  if (parent !== undefined) {
    parentName = normalizeCategoryName(parent);
    if (!parentName) {
    } else if (!isRootCategory(parentName)) {
      showToast('⚠️', 'Uma subcategoria deve ficar vinculada diretamente a uma categoria principal.');
      return '';
    } else if (hasDirectScripts(parentName)) {
      showToast('⚠️', 'Não é possível criar subcategorias em uma categoria principal que já possui scriptz.');
      return '';
    }
  }
  const category = categoryKeyFor(label, parentName);
  if (categoryNameExistsAtLevel(label, parentName, 'personal')) {
    showToast('⚠️', parentName ? 'Já existe uma subcategoria com este nome nesta categoria principal.' : 'Este nome já está em uso.');
    return '';
  }
  if (!categoryRegistry.includes(category)) categoryRegistry.push(category);
  categoryLabels[category] = label;
  if (!customCategoryOrder.includes(category)) customCategoryOrder.push(category);
  if (parent !== undefined && !parentName) delete categoryParents[category];
  if (parentName && parentName !== category && !getCategoryDescendants(category).has(parentName)) categoryParents[category] = parentName;
  reconcileCategoryHierarchy();
  return category;
}

function createSubcategoryFromPrompt() {
  showToast('ℹ️', 'As subcategorias são criadas na tela da categoria principal.');
  return '';
}

function categoryLabel(script) {
  return getScriptCategories(script).map(getCategoryPath).join(' · ');
}

function normalizeScript(script, source = 'user') {
  const greetingMode = getGreetingMode(script);
  const normalized = {
    id: Number(script.id) || nextId++,
    cat: String(script.cat || 'Geral'),
    title: String(script.title || 'Sem título').slice(0, SECURITY_LIMITS.maxTitleChars),
    html: cleanEditorHtml(String(script.html || '').slice(0, SECURITY_LIMITS.maxHtmlChars)),
    greetingMode,
    hasGreeting: greetingMode !== GREETING_MODES.off,
    hasSignature: script.hasSignature !== false,
    isFavorite: script.isFavorite === true,
    isStandard: source === 'standard',
    source
  };
  setScriptCategories(normalized, script.cats ?? script.cat);
  return normalized;
}

function normalizeWorkspaceState(savedState) {
  const state = savedState && !Array.isArray(savedState) ? savedState : {};
  const savedScripts = Array.isArray(savedState) ? savedState : state.scripts || [];
  const source = isStandardMode() ? 'user' : 'user';
  scripts = savedScripts.map(script => normalizeScript(script, script.source || source));
  categoryRegistry = Array.isArray(state.categories) ? state.categories : [];
  categoryParents = normalizeCategoryParents(state.categoryParents);
  categoryLabels = normalizeCategoryLabels(state.categoryLabels);
  expandedCategories = new Set(Array.isArray(state.expandedCategories) ? state.expandedCategories.map(normalizeCategoryName).filter(Boolean) : []);
  customCategoryOrder = Array.isArray(state.categoryOrder) ? state.categoryOrder : [];
  customScriptOrderByCategory = state.scriptOrders || {};
  standardCategoryOrder = Array.isArray(state.standardCategoryOrder) ? state.standardCategoryOrder : [];
  standardScriptOrderByCategory = state.standardScriptOrders || {};
  reconcileCategoryHierarchy();
}

async function fetchStandardTemplate(division) {
  const source = STANDARD_DIVISIONS[division];
  if (!source) throw new Error('Divisão inválida');
  const response = await fetch(`${source}?v=92`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (!data || data.schema !== 'scriptz-standard-template') throw new Error('Template inválido');
  validateProjectPayload(data, { allowTemplate: true });
  return data;
}

function configureWorkspaceControls() {
  const select = document.getElementById('workspaceSelect');
  const reset = document.getElementById('resetLocalBtn');
  const discard = document.getElementById('discardTemplatesBtn');
  const templateBase = document.getElementById('loadTemplateBaseBtn');
  const templateExport = document.getElementById('exportTemplateBtn');
  const manageCategories = document.getElementById('manageCategoriesBtn');
  if (select) select.value = isStandardMode() ? `standard:${workspace.division}` : 'free';
  if (reset) reset.hidden = !isStandardMode();
  if (discard) discard.hidden = isStandardMode();
  if (templateBase) templateBase.hidden = isStandardMode();
  if (templateExport) templateExport.hidden = isStandardMode();
  if (manageCategories) manageCategories.hidden = true;
}

function refreshWorkspaceUI() {
  const label = isStandardMode() ? (isStandardLibrary() ? `CAP · ${workspace.division} · Modelos Padronizados` : `CAP · ${workspace.division} · Meus Scriptz`) : 'Modo Editor';
  document.body.dataset.workspaceMode = workspace.mode || '';
  document.body.dataset.workspaceDivision = workspace.division || '';
  document.getElementById('pageTitle').textContent = activeCat === 'all' ? label : activeCat === 'favorites' ? 'Favoritos' : getCategoryPath(activeCat);
  configureWorkspaceControls();
  buildSidebar();
  render();
}

async function loadWorkspace(showFeedback = true) {
  if (!workspace.mode) return;
  activeCat = 'all';
  searchQ = '';
  isInitialLanding = true;
  activeEditId = null;
  activeLibrary = isStandardMode() ? 'standard' : 'personal';
  standardScripts = [];
  standardCategories = [];
  standardCategoryParents = {};
  standardCategoryLabels = {};
  try {
    const local = localStorage.getItem(workspaceKey());
    if (isStandardMode()) {
      const template = await fetchStandardTemplate(workspace.division);
      standardCategories = Array.isArray(template.categories) ? template.categories.map(String) : [];
      standardCategoryParents = normalizeCategoryParents(template.categoryParents);
      standardCategoryLabels = normalizeCategoryLabels(template.categoryLabels);
      standardScripts = template.scripts.map(script => normalizeScript({ ...script, isStandard: true }, 'standard'));
      const saved = local ? JSON.parse(local) : null;
      normalizeWorkspaceState(saved);
      scripts = [...standardScripts, ...scripts.filter(script => !isStandardScript(script))];
      reconcileCategoryHierarchy();
      const templateCategoryOrder = prioritizedStandardCategoryOrder(standardCategories, standardCategoryParents, workspace.division);
      standardCategoryOrder = workspace.division === 'DEPROT'
        ? templateCategoryOrder
        : [...new Set([...standardCategoryOrder, ...templateCategoryOrder])];
      originalScripts = JSON.parse(JSON.stringify(standardScripts));
    } else {
      const saved = local ? JSON.parse(local) : null;
      normalizeWorkspaceState(saved);
      scripts = scripts.map(script => ({ ...script, isStandard: false, source: script.source || 'user' }));
      categoryRegistry = [...new Set([...categoryRegistry, ...allScriptCategories()])];
      reconcileCategoryHierarchy();
      originalScripts = [];
    }
    customCategoryOrder = [...new Set([...customCategoryOrder, ...categoryRegistry])];
    isCustomOrderActive = customCategoryOrder.length > 0;
    sortBy = 'custom';
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'custom';
    nextId = Math.max(...scripts.map(script => Number(script.id) || 0), 0) + 1;
    saveToLocal();
    refreshWorkspaceUI();
    if (isInitialLanding && window.matchMedia('(max-width: 820px)').matches) openMobileNav();
    if (showFeedback) showToast('📂', isStandardMode() ? `CAP · ${workspace.division} carregado` : 'Modo Editor carregado');
  } catch (err) {
    console.error(err);
    document.getElementById('cards').innerHTML = '<div class="empty"><div class="icon">❌</div><p>Não foi possível carregar este contexto.</p></div>';
  }
}

async function selectWorkspace(value) {
  if (value === 'free') workspace = { mode: 'free', division: null };
  else {
    const [, division] = String(value).split(':');
    const normalizedDivision = LEGACY_DIVISIONS[division] || division;
    if (!STANDARD_DIVISIONS[normalizedDivision]) return;
    workspace = { mode: 'standard', division: normalizedDivision };
  }
  localStorage.setItem('scriptz_workspace', JSON.stringify(workspace));
  localStorage.setItem('scriptz_onboarding_complete', 'true');
  localStorage.setItem('scriptz_daily_welcome_date', localDateKey());
  await dismissWelcomeScreen();
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
    const normalizedDivision = LEGACY_DIVISIONS[saved?.division] || saved?.division;
    if (saved?.mode === 'standard' && STANDARD_DIVISIONS[normalizedDivision]) return { mode: 'standard', division: normalizedDivision };
  } catch (_) {}
  return null;
}

function dismissWelcomeScreen() {
  const screen = document.getElementById('welcomeScreen');
  return new Promise(resolve => {
    if (!screen || screen.hidden) {
      document.documentElement.classList.remove('scriptz-awaiting-onboarding', 'scriptz-awaiting-daily-welcome');
      resolve();
      return;
    }
    screen.classList.add('leaving');
    setTimeout(() => {
      screen.hidden = true;
      screen.classList.remove('leaving', 'visible');
      document.documentElement.classList.remove('scriptz-awaiting-onboarding', 'scriptz-awaiting-daily-welcome');
      resolve();
    }, 520);
  });
}

function showWelcomeFlow() {
  const screen = document.getElementById('welcomeScreen');
  const splash = document.getElementById('welcomeSplash');
  const menu = document.getElementById('welcomeMenu');
  if (!screen || !splash || !menu) return;
  screen.hidden = false;
  screen.dataset.welcomeVariant = 'onboarding';
  screen.classList.remove('leaving');
  splash.hidden = false;
  menu.hidden = true;
  menu.classList.remove('visible');
  requestAnimationFrame(() => {
    screen.classList.add('visible');
    splash.classList.add('visible');
  });
  setTimeout(() => {
    splash.classList.add('leaving');
    setTimeout(() => {
      splash.hidden = true;
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('visible'));
    }, 560);
  }, 3200);
}

function showDailyWelcomeFlow() {
  const screen = document.getElementById('welcomeScreen');
  const splash = document.getElementById('welcomeSplash');
  const menu = document.getElementById('welcomeMenu');
  if (!screen || !splash || !menu) return;
  localStorage.setItem('scriptz_daily_welcome_date', localDateKey());
  screen.hidden = false;
  screen.dataset.welcomeVariant = 'daily';
  screen.classList.remove('leaving');
  splash.hidden = false;
  splash.classList.remove('leaving');
  menu.hidden = true;
  menu.classList.remove('visible');
  requestAnimationFrame(() => {
    screen.classList.add('visible');
    splash.classList.add('visible');
  });
  setTimeout(() => dismissWelcomeScreen(), 3200);
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
    if (shouldShowDailyWelcome()) showDailyWelcomeFlow();
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
  openNoticeModal({
    title: 'Reverter alterações locais',
    message: 'Isso apagará somente scripts, categorias e ordenações criados localmente ou importados neste contexto.',
    note: 'Os modelos padronizados desta divisão permanecerão disponíveis.',
    confirmLabel: 'Reverter alterações',
    danger: true,
    onConfirm: () => {
      localStorage.removeItem(workspaceKey());
      loadWorkspace(false);
      showToast('↩️', 'Alterações locais revertidas.');
    }
  });
}

function saveToLocal() {
  if (!workspace.mode) return;
  const userScripts = isStandardMode() ? scripts.filter(script => !isStandardScript(script)) : scripts;
  const userCategories = categoryRegistry;
  const persistedParents = { ...categoryParents };
  localStorage.setItem(workspaceKey(), JSON.stringify({
    schema: isStandardMode() ? 'scriptz-standard-changes' : 'scriptz-free-project',
    version: 6,
    mode: workspace.mode,
    division: workspace.division,
    scripts: userScripts,
    categories: userCategories,
    categoryParents: persistedParents,
    categoryLabels: { ...categoryLabels },
    categoryOrder: customCategoryOrder,
    scriptOrders: customScriptOrderByCategory,
    standardCategoryOrder: isStandardMode() ? standardCategoryOrder : undefined,
    standardScriptOrders: isStandardMode() ? standardScriptOrderByCategory : undefined,
    expandedCategories: [...expandedCategories]
  }));
}

// ============================================================
//  CATEGORIAS & SIDEBAR
// ============================================================
function getFilteredScripts() {
  const library = activeLibraryKey();
  let filtered;
  if (globalSearchQ) {
    const q = globalSearchQ.toLowerCase();
    filtered = getLibraryScripts(library).filter(script => script.title.toLowerCase().includes(q)
      || getScriptCategories(script).some(category => categoryDisplayName(category, library).toLowerCase().includes(q)));
  } else if (activeCat === 'all') {
    filtered = getLibraryScripts(library);
  } else if (activeCat === 'favorites') {
    filtered = getLibraryScripts(library).filter(s => isFavorite(s));
  } else {
    const hasSubcategories = getChildCategories(activeCat, library).length > 0;
    filtered = getLibraryScripts(library).filter(s => hasSubcategories ? scriptHasCategory(s, activeCat) : scriptMatchesActiveCategory(s, activeCat, library));
  }

  if (searchQ && !globalSearchQ) {
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
  if (s === 'custom') {
    const scriptOrders = getLibraryScriptOrders();
    const order = scriptOrders[activeCat] || scriptOrders.all || [];
    const rank = new Map(order.map((id, index) => [String(id), index]));
    return prioritizeFavorites(list, (a, b) => (rank.get(String(a.id)) ?? 999999) - (rank.get(String(b.id)) ?? 999999));
  }
  return prioritizeFavorites(list, (a, b) => a.title.localeCompare(b.title));
}

function applySort() {
  if (blockConflictingAction()) {
    const select = document.getElementById('sortSelect');
    if (select) select.value = sortBy;
    showToast('⚠️', 'Conclua ou cancele a edição antes de alterar a ordenação.');
    return;
  }
  sortBy = document.getElementById('sortSelect').value;
  render();
}

function syncOrderingControls() {
  const locked = activeEditId !== null;
  const select = document.getElementById('sortSelect');
  if (select) {
    select.disabled = locked;
    select.title = locked ? 'Conclua ou cancele a edição para alterar a ordenação.' : '';
  }
  document.body.classList.toggle('ordering-locked', locked);
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
  if (sidebarCategoryCreatorOpen) {
    showToast('⚠️', 'Conclua ou cancele a criação da categoria antes de reordenar.');
    return;
  }
  if (activeEditId !== null) {
    showToast('⚠️', 'Conclua ou cancele a edição antes de reordenar categorias.');
    return;
  }
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
  syncExclusiveInteractionState();
}

// ============================================================
//  DRAG & DROP DAS CATEGORIAS (SIDEBAR)
// ============================================================
let draggedItem = null;

function initDragDrop() {
  const items = document.querySelectorAll('#sidebarNav .category-root-list[data-editable-roots="true"] > li[data-category]');
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
  const items = document.querySelectorAll('#sidebarNav .category-root-list[data-editable-roots="true"] > li[data-category]');
  const rootOrder = [...items].map(item => item.dataset.category).filter(Boolean);
  const nestedOrder = customCategoryOrder.filter(category => getCategoryParent(category, 'personal'));
  const newOrder = [...new Set([...rootOrder, ...nestedOrder, ...getCategories('personal').filter(category => category !== 'all')])];
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
function toggleSidebarCategoryCreator() {
  if (isStandardLibrary()) return;
  if (sidebarCategoryCreatorOpen) {
    sidebarCategoryCreatorOpen = false;
    buildSidebar();
    return;
  }
  if (reorderMode) {
    showToast('⚠️', 'Finalize a reordenação antes de criar uma categoria.');
    return;
  }
  if (activeEditId !== null) {
    showToast('⚠️', 'Conclua ou cancele a edição antes de criar uma categoria.');
    return;
  }
  sidebarCategoryCreatorOpen = !sidebarCategoryCreatorOpen;
  buildSidebar();
  if (sidebarCategoryCreatorOpen) setTimeout(() => document.getElementById('sidebarNewCategoryName')?.focus(), 30);
}

function createCategoryFromSidebar() {
  if (isStandardLibrary()) return;
  const input = document.getElementById('sidebarNewCategoryName');
  const name = normalizeCategoryName(input?.value);
  if (!name) {
    showToast('⚠️', 'Digite o nome da nova categoria.');
    input?.focus();
    return;
  }
  if (categoryNameExistsAtLevel(name, '', 'personal')) {
    showToast('⚠️', 'Este nome já está em uso.');
    input?.focus();
    return;
  }
  if (!registerCategory(name)) return;
  sidebarCategoryCreatorOpen = false;
  saveToLocal();
  buildSidebar();
  setCat(name);
  showToast('✨', `Categoria “${categoryDisplayName(name)}” criada!`);
}

function renameCategoryFromSidebar(category) {
  if (blockConflictingAction()) return;
  if (isStandardLibrary() || isStandardCategory(category)) return;
  openNoticeModal({
    title: 'Renomear categoria',
    message: `Defina o novo nome para “${categoryDisplayName(category)}”.`,
    inputLabel: 'Nome da categoria',
    inputValue: categoryDisplayName(category),
    inputPlaceholder: 'Nome da categoria',
    confirmLabel: 'Salvar nome',
    onConfirm: value => confirmRenameCategory(category, value)
  });
}

function buildSidebar() {
  const nav = document.getElementById('sidebarNav');
  const safeJs = value => String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const overviewButton = (cat, label, icon, count) => {
    const active = activeCat === cat;
    return `<li><button type="button" class="cat-btn overview-sidebar-btn ${active ? 'active' : ''}" onclick="setCat('${cat}')"><span>${icon} ${label}</span><span class="nav-count">${count}</span></button></li>`;
  };
  const categoryButton = (category, library, editable = false) => {
    const isActive = activeLibraryKey() === library && getCategoryDescendants(category, new Set(), library).has(activeCat);
    const count = categoryScriptCount(category, true, library);
    const label = categoryDisplayName(category, library);
    const actions = editable ? `<span class="sidebar-category-actions"><button type="button" onclick="renameCategoryFromSidebar('${safeJs(category)}')" aria-label="Renomear ${escapeHtml(label)}">✏️</button><button type="button" onclick="deleteCategory('${safeJs(category)}')" aria-label="Excluir ${escapeHtml(label)}">🗑️</button></span>` : '';
    const arrow = editable ? '' : '<span class="category-root-arrow" aria-hidden="true">›</span>';
    return `<li class="category-nav-item category-root ${editable ? 'is-editable' : ''}" data-category="${escapeHtml(category)}"><button type="button" class="cat-btn category-root-btn ${isActive ? 'active' : ''}" onclick="setCat('${safeJs(category)}')" title="${escapeHtml(label)}"><span class="category-root-symbol" aria-hidden="true">▰</span><span class="cat-btn-label">${escapeHtml(label)}</span><span class="nav-count">${count}</span>${arrow}</button>${actions}</li>`;
  };
  const rootCategoryList = (library, editable) => {
    const roots = getOrderedCategories(getRootCategories(library), library);
    const attributes = editable ? ' data-editable-roots="true"' : '';
    const rows = roots.map(category => categoryButton(category, library, editable)).join('') || '<li class="sidebar-category-empty">Nenhuma categoria criada.</li>';
    return `<ul class="category-root-list"${attributes}>${rows}</ul>`;
  };
  const personalManagement = () => `<div class="sidebar-category-manager"><div class="sidebar-category-tools"><button id="reorderBtn" type="button" class="sidebar-tool-btn" onclick="toggleReorderMode()">🔀 Reordenar</button><button type="button" class="sidebar-tool-btn" onclick="toggleSidebarCategoryCreator()">${sidebarCategoryCreatorOpen ? '✕ Cancelar' : '➕ Nova categoria'}</button></div>${sidebarCategoryCreatorOpen ? '<div class="sidebar-category-create"><input id="sidebarNewCategoryName" type="text" placeholder="Nome da categoria" onkeydown="if(event.key===\'Enter\') createCategoryFromSidebar()"><button type="button" onclick="createCategoryFromSidebar()">Adicionar</button></div>' : ''}</div>`;

  if (!isStandardMode()) {
    const favoriteCount = scripts.filter(script => isFavorite(script)).length;
    let html = '<div class="cat-lbl">Visão geral</div><ul>' + overviewButton('all', 'Todos', '📋', scripts.length) + overviewButton('favorites', 'Favoritos', '⭐', favoriteCount) + '</ul>';
    html += '<div class="cat-lbl">Categorias</div>' + rootCategoryList('personal', true) + personalManagement();
    nav.innerHTML = html;
  } else {
    const librarySection = (library, label, icon, editable) => {
      const count = getLibraryScripts(library).length;
      const active = activeLibraryKey() === library;
      const open = active && librarySectionOpen[library] !== false;
      return `<details class="sidebar-library-section ${active ? 'is-active' : ''} ${open ? 'is-open' : ''}" data-library="${library}" ${active ? 'open' : ''}><summary aria-expanded="${open}" onclick="event.preventDefault();toggleLibrarySection('${library}')"><span class="sidebar-library-title"><span aria-hidden="true">${icon}</span>${label}</span><span class="nav-count">${count}</span><span class="sidebar-library-chevron" aria-hidden="true">${open ? '▲' : '▼'}</span></summary><div class="sidebar-library-clip"><div class="sidebar-library-content">${active ? `<button type="button" class="sidebar-library-overview" onclick="setCat('all')">Todos os scriptz desta área</button><div class="cat-lbl">Categorias</div>${rootCategoryList(library, editable)}${editable ? personalManagement() : ''}` : ''}</div></div></details>`;
    };
    nav.innerHTML = librarySection('standard', 'Modelos Padronizados', '📘', false) + librarySection('personal', 'Meus Scriptz', '✦', true);
  }

  if (reorderMode) {
    document.querySelectorAll('#sidebarNav .category-root-list[data-editable-roots="true"] > li[data-category]').forEach(el => {
      el.classList.add('reorder-mode');
    });
  }
  syncExclusiveInteractionState();
  setTimeout(initDragDrop, 50);
}

function setCat(cat) {
  if (blockConflictingAction()) return;
  activeCat = cat;
  isInitialLanding = false;
  subcategoryCreatorOpen = false;
  searchQ = '';
  globalSearchQ = '';
  if (window.matchMedia('(max-width: 820px)').matches) closeMobileNav();
  document.getElementById('searchInput').value = '';
  document.getElementById('contextSearchInput').value = '';
  document.getElementById('mobileSearchInput').value = '';
  document.getElementById('pageTitle').textContent = cat === 'all' ? (isStandardMode() ? (isStandardLibrary() ? 'Modelos Padronizados' : 'Meus Scriptz') : 'Todos os scriptz') : cat === 'favorites' ? 'Favoritos' : getCategoryPath(cat);
  buildSidebar();
  render();
  openPdfGuideCardWhenRelevant();
}

function openPdfGuideCardWhenRelevant() {
  if (categoryDisplayName(activeCat) !== PDF_GUIDE_CATEGORY) return;
  const featured = getFilteredScripts().find(script => String(script.html || '').includes(PDF_GUIDE_ASSET));
  document.getElementById('c' + featured?.id)?.classList.add('open');
}

function setLibrary(library) {
  if (!isStandardMode()) return;
  if (blockConflictingAction()) return;
  const next = library === 'standard' ? 'standard' : 'personal';
  activeLibrary = next;
  librarySectionOpen[next] = true;
  reorderMode = false;
  activeCat = 'all';
  isInitialLanding = false;
  subcategoryCreatorOpen = false;
  searchQ = '';
  globalSearchQ = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('contextSearchInput').value = '';
  document.getElementById('mobileSearchInput').value = '';
  document.getElementById('pageTitle').textContent = next === 'standard' ? 'Modelos Padronizados' : 'Meus Scriptz';
  buildSidebar();
  render();
}

function toggleLibrarySection(library) {
  if (!isStandardMode()) return;
  if (blockConflictingAction()) return;
  const next = library === 'standard' ? 'standard' : 'personal';
  if (activeLibraryKey() !== next) {
    librarySectionOpen[next] = true;
    setLibrary(next);
    return;
  }
  librarySectionOpen[next] = !librarySectionOpen[next];
  const section = document.querySelector(`.sidebar-library-section[data-library="${next}"]`);
  if (!section) return;
  const isOpen = librarySectionOpen[next];
  section.classList.toggle('is-open', isOpen);
  section.querySelector('summary')?.setAttribute('aria-expanded', String(isOpen));
  const chevron = section.querySelector('.sidebar-library-chevron');
  if (chevron) chevron.textContent = isOpen ? '▲' : '▼';
}

function syncActionsMenuIndicator() {
  const menu = document.getElementById('actionsMenu');
  if (!menu) return;
  const open = menu.open;
  menu.classList.toggle('is-open', open);
  menu.querySelector('summary')?.setAttribute('aria-expanded', String(open));
  const chevron = menu.querySelector('.actions-menu-chevron');
  if (chevron) chevron.textContent = open ? '▲' : '▼';
}

function onContextSearch(val) {
  searchQ = val;
  if (val) isInitialLanding = false;
  const desktopInput = document.getElementById('contextSearchInput');
  const mobileInput = document.getElementById('mobileSearchInput');
  if (desktopInput && desktopInput.value !== val) desktopInput.value = val;
  if (mobileInput && mobileInput.value !== val) mobileInput.value = val;
  render();
}

function onGlobalSearch(val) {
  const value = String(val || '');
  if (value && !globalSearchQ) lastGlobalSearchCategory = activeCat;
  globalSearchQ = value;
  if (value) {
    isInitialLanding = false;
    activeCat = 'all';
    searchQ = '';
    document.getElementById('contextSearchInput').value = '';
    document.getElementById('mobileSearchInput').value = '';
    document.getElementById('pageTitle').textContent = 'Busca geral';
  } else {
    activeCat = lastGlobalSearchCategory || 'all';
    document.getElementById('pageTitle').textContent = activeCat === 'all' ? (isStandardMode() ? (isStandardLibrary() ? 'Modelos Padronizados' : 'Meus Scriptz') : 'Todos os scriptz') : getCategoryPath(activeCat);
  }
  buildSidebar();
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
//  CATEGORIAS DA CRIAÇÃO (SOMENTE VÍNCULOS EXISTENTES)
// ============================================================
function getContextualPrimaryCategory() {
  if (activeCat === 'all' || activeCat === 'favorites' || isStandardLibrary()) return '';
  if (getChildCategories(activeCat).length > 0) return '';
  return activeCat;
}

function canCreateScriptInContext() {
  const contextualCategory = getContextualPrimaryCategory();
  return Boolean(contextualCategory) && categoryScriptCount(contextualCategory) > 0;
}

function canChooseExistingCategoryForNewScript() {
  return !isStandardLibrary()
    && activeCat === 'all'
    && getAssignableCategories().length > 0;
}

function syncNewScriptButton() {
  const button = document.getElementById('newScriptBtn');
  if (!button) return;
  const available = canCreateScriptInContext() || canChooseExistingCategoryForNewScript();
  button.hidden = !available;
  const contextualCategory = getContextualPrimaryCategory();
  button.title = contextualCategory
    ? `Criar script em ${getCategoryPath(contextualCategory)}`
    : available ? 'Escolher categoria ou subcategoria para criar um script' : '';
}

function createCategoryFromPrompt() {
  openNoticeModal({
    title: 'Nova categoria',
    message: 'Informe o nome da categoria principal que deseja criar.',
    inputLabel: 'Nome da categoria',
    inputPlaceholder: 'Nome da categoria',
    confirmLabel: 'Criar categoria',
    onConfirm: value => {
      const category = registerCategory(value);
      if (!category) return;
      saveToLocal();
      buildSidebar();
      renderCategoryList();
      showToast('✨', `Categoria “${categoryDisplayName(category)}” criada!`);
    }
  });
  return '';
}

function getNewScriptCategories() {
  return selectedCategoryList([
    document.getElementById('newCategoryPrimary')?.value,
    ...[...document.querySelectorAll('#newCategorySelects select[data-category-select]')].map(select => select.value)
  ]);
}

function selectedCategoryList(categories) {
  const source = Array.isArray(categories) ? categories : [categories];
  return [...new Set(source.map(normalizeCategoryName).filter(category => category && !isCategoryAction(category)))];
}

function hasValidScriptClassification(categories) {
  return categories.length > 0 && categories.every(category => getAssignableCategories().includes(category));
}

function scriptHasDeclaredClassification(script) {
  const categories = Array.isArray(script?.cats) ? script.cats : [script?.cat];
  return categories.some(category => normalizeCategoryName(category));
}

function populateNewCategorySelects(categories = []) {
  const selected = selectedCategoryList(categories);
  const primary = document.getElementById('newCategoryPrimary');
  const context = document.getElementById('newCategoryContext');
  const selectList = document.getElementById('newCategorySelects');
  if (!primary || !selectList || !context) return;
  const contextualCategory = getContextualPrimaryCategory();
  const choosingInitialCategory = !contextualCategory && canChooseExistingCategoryForNewScript();
  const primaryCategory = contextualCategory || selected[0] || '';
  primary.hidden = !choosingInitialCategory;
  primary.innerHTML = choosingInitialCategory
    ? getCategoryOptions(primaryCategory, {
      placeholder: 'Selecione a categoria ou subcategoria',
      includeCreateAction: false
    })
    : primaryCategory
      ? `<option value="${escapeHtml(primaryCategory)}">${escapeHtml(getCategoryPath(primaryCategory))}</option>`
      : '';
  primary.value = primaryCategory;
  context.textContent = primaryCategory
    ? `Será vinculado a: ${getCategoryPath(primaryCategory)}`
    : choosingInitialCategory
      ? 'Escolha a categoria ou subcategoria à qual este script será vinculado.'
      : 'Abra uma categoria ou subcategoria para criar um script.';
  renderNewCategorySelects([primaryCategory, ...selected.filter(category => category !== primaryCategory)]);
}

function renderNewCategorySelects(categories = []) {
  const primary = document.getElementById('newCategoryPrimary');
  const selectList = document.getElementById('newCategorySelects');
  if (!primary || !selectList) return;
  const primaryCategory = primary.value;
  const selected = selectedCategoryList(categories).filter(category => category !== primaryCategory);
  const used = [primaryCategory];
  const values = primaryCategory ? [...selected, ''] : [];
  selectList.innerHTML = values.map((category, index) => {
    const options = getCategoryOptions(category, {
      placeholder: 'Adicionar categoria ou subcategoria',
      exclude: used,
      includeCreateAction: false
    });
    if (category) used.push(category);
    return `<select class="category-select" id="newCategoryAdditional${index}" data-category-select aria-label="Categoria ou subcategoria adicional ${index + 1}" onchange="onNewCategorySelectChange(${index})">${options}</select>`;
  }).join('');
}

function onNewPrimaryCategoryChange() {
  const primary = document.getElementById('newCategoryPrimary');
  const context = document.getElementById('newCategoryContext');
  if (!primary || !context) return;
  const category = normalizeCategoryName(primary.value);
  context.textContent = category
    ? `Será vinculado a: ${getCategoryPath(category)}`
    : 'Escolha a categoria ou subcategoria à qual este script será vinculado.';
  renderNewCategorySelects(category ? [category] : []);
}

function onNewCategorySelectChange(index) {
  const select = document.getElementById(`newCategoryAdditional${index}`);
  if (!select) return;
  renderNewCategorySelects(getNewScriptCategories());
}

// ============================================================
//  GERENCIAR CATEGORIAS - MODAL
// ============================================================
function openCategoryModal() {
    if (blockConflictingAction()) return;
    if (activeEditId !== null) {
        showToast('⚠️', 'Conclua ou cancele a edição antes de reordenar categorias.');
        return;
    }
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
    const cats = getOrderedCategories(getRootCategories());
    
    if (cats.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);">Nenhuma categoria criada ainda.</div>';
        return;
    }
    
    const safeJs = value => String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const row = (cat, level = 'root') => {
        const label = categoryDisplayName(cat);
        const locked = isStandardCategory(cat);
        const lockLabel = locked ? '<span class="category-standard-lock" title="Categoria padrão protegida">🔒</span>' : '';
        const lockAttrs = locked ? 'disabled aria-disabled="true" title="Categoria padrão protegida"' : '';
        const dragHandle = level === 'root' ? '<span class="category-drag-handle" title="Arrastar para reordenar" aria-label="Arrastar categoria">⠿</span>' : '<span class="category-drag-spacer" aria-hidden="true"></span>';
        const levelLabel = level === 'root' ? 'Categoria principal' : `Subcategoria de ${categoryDisplayName(getCategoryParent(cat))}`;
        return `<div class="category-item category-${level} ${locked ? 'standard-category' : ''}" data-category="${escapeHtml(cat)}">
            ${dragHandle}
            <div class="category-item-details">
                <span class="category-name" ${locked ? '' : `onclick="startRenameCategory('${safeJs(cat)}')"`}>${escapeHtml(label)}</span>${lockLabel}
                <span class="category-level">${escapeHtml(levelLabel)}</span>
            </div>
            <span class="category-count">${categoryScriptCount(cat, level === 'root' && getChildCategories(cat).length > 0) === 1 ? '1 script' : `${categoryScriptCount(cat, level === 'root' && getChildCategories(cat).length > 0)} scriptz`}</span>
            <div class="category-actions">
                <button type="button" class="btn-rename" onclick="startRenameCategory('${safeJs(cat)}')" ${lockAttrs} aria-label="Renomear ${escapeHtml(label)}">✏️</button>
                <button type="button" class="btn-delete" onclick="deleteCategory('${safeJs(cat)}')" ${lockAttrs} aria-label="Excluir ${escapeHtml(label)}">🗑️</button>
            </div>
        </div>`;
    };
    const html = cats.map(cat => `<div class="category-group" draggable="true" data-category="${escapeHtml(cat)}">${row(cat)}</div>`).join('');
    
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
    const items = [...container.querySelectorAll('.category-group')];
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
            const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.category-group');
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
    const roots = [...document.querySelectorAll('#categoryListContainer .category-group')].map(item => item.getAttribute('data-category')).filter(Boolean);
    const nested = customCategoryOrder.filter(category => getCategoryParent(category));
    const newOrder = [...new Set([...roots, ...nested, ...getCategories().filter(category => category !== 'all')])];
    
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
        if (item.dataset.category === cat) {
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
    renderCategoryList();
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
    
    const parent = getCategoryParent(oldName);
    if (categoryNameExistsAtLevel(newName, parent, 'personal', oldName)) {
        showToast('⚠️', parent ? 'Já existe uma subcategoria com este nome nesta categoria principal.' : 'Já existe uma categoria com este nome!');
        cancelRenameCategory();
        return;
    }
    const newKey = parent ? categoryKeyFor(newName, parent) : newName;
    
    scripts.forEach(script => {
        if (scriptHasCategory(script, oldName)) {
            setScriptCategories(script, getScriptCategories(script).map(category => category === oldName ? newKey : category));
        }
    });
    
    const registryIndex = categoryRegistry.indexOf(oldName);
    if (registryIndex !== -1) categoryRegistry[registryIndex] = newKey;
    if (categoryParents[oldName]) {
        categoryParents[newKey] = categoryParents[oldName];
        delete categoryParents[oldName];
    }
    Object.entries(categoryParents).forEach(([child, parent]) => {
        if (parent === oldName) categoryParents[child] = newKey;
    });
    categoryLabels[newKey] = newName;
    delete categoryLabels[oldName];
    if (customScriptOrderByCategory[oldName]) {
        customScriptOrderByCategory[newKey] = customScriptOrderByCategory[oldName];
        delete customScriptOrderByCategory[oldName];
    }
    customCategoryOrder = customCategoryOrder.map(category => category === oldName ? newKey : category);
    expandedCategories = new Set([...expandedCategories].map(category => category === oldName ? newKey : category));
    if (activeCat === oldName) activeCat = newKey;
    reconcileCategoryHierarchy();
    
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
    if (blockConflictingAction()) return;
    if (isStandardCategory(cat)) {
        showToast('🔒', 'Categorias padrão não podem ser excluídas.');
        return;
    }
    const parentBeforeDelete = getCategoryParent(cat);
    const count = scripts.filter(script => scriptHasCategory(script, cat)).length;
    const children = getChildCategories(cat);
    
    const label = categoryDisplayName(cat);
    if (count === 0) {
        openNoticeModal({
            title: 'Excluir categoria',
            message: `Deseja excluir a categoria “${label}”?`,
            note: 'Esta ação remove a categoria atual. Nenhum script será apagado.',
            confirmLabel: 'Excluir categoria',
            danger: true,
            onConfirm: () => performDeleteCategory(cat, parentBeforeDelete, children)
        });
        return;
    } else {
        const childNotice = children.length ? `\n\nAs ${children.length} subcategoria(s) vinculada(s) passarão a ser categorias principais.` : '';
        const notice = `A categoria “${label}” possui ${count} scriptz. Ao excluí-la, os scriptz vinculados ficarão na categoria “Geral”.${childNotice.replace(/\n\n/g, ' ')}`;
        openNoticeModal({
            title: 'Excluir categoria',
            message: notice,
            note: 'Esta operação não pode ser desfeita sem uma cópia exportada dos seus scriptz.',
            confirmLabel: 'Excluir categoria',
            danger: true,
            onConfirm: () => performDeleteCategory(cat, parentBeforeDelete, children)
        });
        return;
    }
}

function performDeleteCategory(cat, parentBeforeDelete, children = getChildCategories(cat)) {
    scripts.forEach(script => {
        if (scriptHasCategory(script, cat)) {
            const remaining = getScriptCategories(script).filter(category => category !== cat);
            setScriptCategories(script, remaining.length ? remaining : ['Geral']);
        }
    });
    customCategoryOrder = customCategoryOrder.filter(c => c !== cat);
    categoryRegistry = categoryRegistry.filter(c => c !== cat);
    delete categoryLabels[cat];
    delete customScriptOrderByCategory[cat];
    delete categoryParents[cat];
    children.forEach(child => delete categoryParents[child]);
    expandedCategories.delete(cat);
    if (activeCat === cat) activeCat = parentBeforeDelete || 'all';
    reconcileCategoryHierarchy();
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
    const name = normalizeCategoryName(input.value);
    
    if (!name) {
        showToast('⚠️', 'Digite o nome da nova categoria');
        return;
    }
    
    const exists = categoryNameExistsAtLevel(name, '', 'personal');
    if (exists) {
        showToast('⚠️', 'Esta categoria já existe!');
        input.value = '';
        input.focus();
        return;
    }
    
    registerCategory(name);
    saveToLocal();
    
    input.value = '';
    input.focus();
    buildSidebar();
    renderCategoryList();
    showToast('✨', `Categoria principal "${categoryDisplayName(name)}" criada!`);
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
    
    const finalUrl = prepareUserLink(url);
    if (!finalUrl) {
        showToast('⚠️', 'Use apenas links HTTP, HTTPS ou e-mail válidos.');
        return;
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

function cleanEditorHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html || '').slice(0, SECURITY_LIMITS.maxHtmlChars);
  const allowedTags = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'A', 'UL', 'OL', 'LI', 'DIV', 'SPAN']);
  const removeTags = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'META', 'LINK', 'FORM', 'INPUT', 'BUTTON', 'SVG', 'MATH', 'BASE', 'FRAME', 'AUDIO', 'VIDEO', 'IMG', 'PICTURE', 'SOURCE']);
  const comments = [];
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_COMMENT);
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach(comment => comment.remove());
  [...template.content.querySelectorAll('*')].forEach(element => {
    const tag = element.tagName;
    if (removeTags.has(tag)) {
      element.remove();
      return;
    }
    if (!allowedTags.has(tag)) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const href = tag === 'A' ? element.getAttribute('href') : '';
    const originalStyle = element.getAttribute('style') || '';
    [...element.attributes].forEach(attribute => element.removeAttribute(attribute.name));
    const safeStyle = [];
    if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(originalStyle)) safeStyle.push('font-weight:700');
    if (/font-style\s*:\s*italic/i.test(originalStyle)) safeStyle.push('font-style:italic');
    if (/text-decoration(?:-line)?\s*:[^;]*(underline)/i.test(originalStyle)) safeStyle.push('text-decoration:underline');
    if (safeStyle.length) element.setAttribute('style', safeStyle.join(';'));
    if (tag === 'A') {
      const safeUrl = sanitizeLinkUrl(href);
      if (safeUrl) {
        element.setAttribute('href', safeUrl);
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      } else {
        element.replaceWith(...element.childNodes);
      }
    }
  });
  return template.innerHTML.replace(/<p>\s*<\/p>/gi, '').replace(/<div>\s*<\/div>/gi, '').trim();
}

function htmlToStructuredPlainText(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');

  const readNode = (node, parentTag = '') => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue.replace(/\u00a0/g, ' ').replace(/[\t\r\n\f ]+/g, ' ');
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName;
    if (tag === 'BR') return '\n';

    const content = [...node.childNodes].map(child => readNode(child, tag)).join('');
    if (tag === 'LI') return `• ${content.trim()}\n`;
    if (tag === 'P' || (tag === 'DIV' && parentTag !== 'LI')) return `${content.trim()}\n\n`;
    if (tag === 'UL' || tag === 'OL') return `${content}\n`;
    return content;
  };

  return [...template.content.childNodes]
    .map(node => readNode(node))
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatNewScript(command) {
  const editor = document.getElementById('newText');
  if (!editor) return;
  editor.focus();
  document.execCommand(command, false, null);
  syncNewScriptEditorState();
}

function toggleNewScriptLinkInput() {
  const container = document.getElementById('newLinkInput');
  const input = document.getElementById('newLinkUrl');
  const editor = document.getElementById('newText');
  if (!container || !input || !editor) return;
  const willOpen = !container.classList.contains('visible');
  if (willOpen) {
    const selection = window.getSelection();
    newScriptLinkRange = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
  }
  container.classList.toggle('visible', willOpen);
  if (willOpen) input.focus();
  else {
    input.value = '';
    newScriptLinkRange = null;
    editor.focus();
  }
}

function applyNewScriptLink() {
  const input = document.getElementById('newLinkUrl');
  const editor = document.getElementById('newText');
  if (!input || !editor) return;
  const rawUrl = input.value.trim();
  if (!rawUrl) {
    showToast('⚠️', 'Digite uma URL válida');
    return;
  }
  if (!newScriptLinkRange || newScriptLinkRange.collapsed) {
    showToast('⚠️', 'Selecione o texto que deseja transformar em link');
    return;
  }
  const finalUrl = prepareUserLink(rawUrl);
  if (!finalUrl) {
    showToast('⚠️', 'Use apenas links HTTP, HTTPS ou e-mail válidos.');
    return;
  }
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(newScriptLinkRange);
  editor.focus();
  document.execCommand('createLink', false, finalUrl);
  const link = selection.anchorNode?.parentElement?.closest?.('a');
  if (link) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  syncNewScriptEditorState();
  toggleNewScriptLinkInput();
}

function handleNewScriptPaste(event) {
  const html = event.clipboardData?.getData('text/html');
  if (!html) return;
  event.preventDefault();
  document.execCommand('insertHTML', false, cleanEditorHtml(html));
  syncNewScriptEditorState();
}

function syncNewScriptEditorState() {
  const editor = document.getElementById('newText');
  if (editor) editor.dataset.hasContent = editor.innerText.trim() ? 'true' : 'false';
}

// ============================================================
//  RENDER
// ============================================================
function createSubcategoryFromMain() {
  if (blockConflictingAction()) return;
  const parent = activeCat;
  const input = document.getElementById('newSubcategoryName');
  const name = normalizeCategoryName(input?.value);
  if (!canManageSubcategories(parent)) {
    showToast('⚠️', 'Esta categoria principal já possui scriptz e não pode receber subcategorias.');
    return;
  }
  if (!name) {
    showToast('⚠️', 'Digite o nome da nova subcategoria.');
    input?.focus();
    return;
  }
  if (categoryNameExistsAtLevel(name, parent, 'personal')) {
    showToast('⚠️', 'Já existe uma subcategoria com este nome nesta categoria principal.');
    input?.focus();
    return;
  }
  if (!registerCategory(name, parent)) return;
  saveToLocal();
  subcategoryCreatorOpen = false;
  if (input) input.value = '';
  buildSidebar();
  render();
  showToast('✨', `Subcategoria “${name}” criada!`);
}

function createPersonalCategoryFromMain() {
  if (blockConflictingAction()) return;
  if (isStandardLibrary()) {
    setLibrary('personal');
    setTimeout(createPersonalCategoryFromMain, 0);
    return;
  }
  openNoticeModal({
    title: 'Criar categoria',
    message: 'Crie a primeira categoria para organizar seus scripts.',
    inputLabel: 'Nome da categoria',
    inputPlaceholder: 'Ex.: Processos internos',
    confirmLabel: 'Criar categoria',
    onConfirm: value => {
      const name = normalizeCategoryName(value);
      if (categoryNameExistsAtLevel(name, '', 'personal')) {
        showToast('⚠️', 'Este nome já está em uso.');
        return;
      }
      if (!registerCategory(name)) return;
      activeCat = name;
      isInitialLanding = false;
      searchQ = '';
      globalSearchQ = '';
      document.getElementById('pageTitle').textContent = getCategoryPath(name);
      saveToLocal();
      buildSidebar();
      render();
      showToast('✨', `Categoria “${categoryDisplayName(name)}” criada!`);
    }
  });
}

function showSubcategoryCreator() {
  if (blockConflictingAction()) return;
  if (!canManageSubcategories(activeCat)) {
    showToast('⚠️', 'Esta categoria principal já possui scriptz e não pode receber subcategorias.');
    return;
  }
  subcategoryCreatorOpen = true;
  render();
  setTimeout(() => document.getElementById('newSubcategoryName')?.focus(), 30);
}

function renameSubcategoryFromMain(category) {
  if (blockConflictingAction()) return;
  openNoticeModal({
    title: 'Renomear subcategoria',
    message: `Defina o novo nome para “${categoryDisplayName(category)}”.`,
    inputLabel: 'Nome da subcategoria',
    inputValue: categoryDisplayName(category),
    inputPlaceholder: 'Nome da subcategoria',
    confirmLabel: 'Salvar nome',
    onConfirm: value => confirmRenameCategory(category, value)
  });
}

function deleteSubcategoryFromMain(category) {
  if (blockConflictingAction()) return;
  if (getCategoryParent(category) !== activeCat) return;
  deleteCategory(category);
}

function initSubcategoryDragDrop() {
  const list = document.getElementById('subcategoryManagementList');
  if (!list) return;
  if (activeEditId !== null) {
    [...list.querySelectorAll('[data-subcategory]')].forEach(item => item.draggable = false);
    return;
  }
  let dragged = null;
  [...list.querySelectorAll('[data-subcategory]')].forEach(item => {
    item.draggable = true;
    item.addEventListener('dragstart', event => {
      dragged = item;
      item.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
    });
    item.addEventListener('dragover', event => {
      event.preventDefault();
      if (dragged && dragged !== item) item.classList.add('drag-over');
    });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop', event => {
      event.preventDefault();
      if (!dragged || dragged === item) return;
      const before = event.clientY < item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2;
      list.insertBefore(dragged, before ? item : item.nextSibling);
      item.classList.remove('drag-over');
      saveSubcategoryOrderFromMain();
    });
    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      [...list.children].forEach(child => child.classList.remove('drag-over'));
      dragged = null;
    });
  });
}

function saveSubcategoryOrderFromMain() {
  const list = document.getElementById('subcategoryManagementList');
  const orderedChildren = list ? [...list.querySelectorAll('[data-subcategory]')].map(item => item.dataset.subcategory).filter(Boolean) : [];
  if (!orderedChildren.length) return;
  const library = activeLibraryKey();
  const remaining = getLibraryCategoryOrder(library).filter(category => !orderedChildren.includes(category));
  setLibraryCategoryOrder([...remaining, ...orderedChildren], library);
  saveToLocal();
  render();
  showToast('✨', 'Ordem das subcategorias atualizada!');
}

function buildEmptyCategoryChoice({ allowSubcategory = true } = {}) {
  const safeCategory = String(activeCat).replace(/'/g, "\\'");
  const contextName = getCategoryParent(activeCat) ? 'subcategoria' : 'categoria';
  const secondaryAction = allowSubcategory ? `<button type="button" class="category-empty-secondary" onclick="showSubcategoryCreator()"><span aria-hidden="true">⌘</span><strong>Criar subcategoria</strong><small>Organizar os scriptz em subcategorias</small></button>` : '';
  const subcategoryCreator = allowSubcategory && subcategoryCreatorOpen ? '<div class="subcategory-create-row"><input type="text" id="newSubcategoryName" placeholder="Nome da nova subcategoria" onkeydown="if(event.key===\'Enter\') createSubcategoryFromMain()"><button type="button" class="btn-primary" onclick="createSubcategoryFromMain()">➕ Adicionar subcategoria</button></div>' : '';
  return `<section class="category-empty-choice" aria-label="Ações para ${contextName} vazia">
    <div class="category-empty-choice-copy"><span class="subcategory-navigator-kicker">${contextName.charAt(0).toUpperCase() + contextName.slice(1)} vazia</span><p>${allowSubcategory ? 'Escolha como deseja iniciar esta categoria.' : 'Adicione o primeiro script desta subcategoria.'}</p></div>
    <div class="category-empty-choice-actions${allowSubcategory ? '' : ' single-action'}"><button type="button" class="category-empty-primary" onclick="openModal('${safeCategory}')"><span aria-hidden="true">✚</span><strong>Criar script</strong><small>Adicionar um script diretamente nesta ${contextName}</small></button>${secondaryAction}</div>
    ${subcategoryCreator}
  </section>`;
}

function buildSubcategoryNavigator() {
  if (activeCat === 'all' || activeCat === 'favorites') return '';
  const readOnly = isStandardLibrary();
  const parent = getCategoryParent(activeCat);
  if (parent) {
    const returnControl = `<section class="subcategory-return" aria-label="Navegação de categoria"><button type="button" onclick="setCat('${String(parent).replace(/'/g, "\\'")}' )"><span aria-hidden="true">‹</span> Voltar para ${escapeHtml(categoryDisplayName(parent))}</button></section>`;
    const emptySubcategoryChoice = !readOnly && categoryScriptCount(activeCat) === 0 ? buildEmptyCategoryChoice({ allowSubcategory: false }) : '';
    return returnControl + emptySubcategoryChoice;
  }
  const children = getOrderedCategories(getChildCategories(activeCat));
  const contextualChildren = searchQ
    ? children.filter(category => {
      const q = searchQ.toLowerCase();
      return categoryDisplayName(category).toLowerCase().includes(q)
        || getLibraryScripts().some(script => scriptMatchesActiveCategory(script, category) && script.title.toLowerCase().includes(q));
    })
    : children;
  if (readOnly && !children.length) return '';
  if (!readOnly && !canManageSubcategories(activeCat)) return '';
  if (!children.length) {
    return buildEmptyCategoryChoice();
  }
  const safeJs = value => String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const cards = contextualChildren.map(category => {
    const count = categoryScriptCount(category, true);
    const label = categoryDisplayName(category);
    return `<article class="subcategory-choice" data-subcategory="${escapeHtml(category)}">
      <button type="button" class="subcategory-choice-open" onclick="setCat('${safeJs(category)}')" aria-label="Abrir subcategoria ${escapeHtml(label)}">
        <span class="subcategory-choice-name">${escapeHtml(label)}</span>
        <span class="subcategory-choice-count">${count === 1 ? '1 script' : `${count} scriptz`}</span>
        <span class="subcategory-choice-arrow" aria-hidden="true">›</span>
      </button>
      ${readOnly ? '' : `<div class="subcategory-choice-actions" aria-label="Ações da subcategoria ${escapeHtml(label)}">
        <button type="button" onclick="renameSubcategoryFromMain('${safeJs(category)}')" aria-label="Renomear ${escapeHtml(label)}">✏️</button>
        <button type="button" onclick="deleteSubcategoryFromMain('${safeJs(category)}')" aria-label="Excluir ${escapeHtml(label)}">🗑️</button>
      </div>`}
    </article>`;
  }).join('');
  return `<section class="subcategory-navigator" aria-label="Subcategorias de ${escapeHtml(categoryDisplayName(activeCat))}">
    <div class="subcategory-navigator-heading"><span class="subcategory-navigator-kicker">Subcategorias</span><span>${contextualChildren.length === 1 ? '1 opção' : `${contextualChildren.length} opções`}</span></div>
    ${contextualChildren.length ? `<div class="subcategory-choice-list" id="subcategoryManagementList">${cards}</div>` : '<p class="subcategory-empty-state">Nenhuma subcategoria corresponde à busca contextual.</p>'}
    ${readOnly ? '' : '<div class="subcategory-create-row"><input type="text" id="newSubcategoryName" placeholder="Nome da nova subcategoria" onkeydown="if(event.key===\'Enter\') createSubcategoryFromMain()"><button type="button" class="btn-primary" onclick="createSubcategoryFromMain()">➕ Adicionar subcategoria</button></div>'}
  </section>`;
}

function render() {
  syncExclusiveInteractionState();
  const list = getFilteredScripts();
  const badge = document.getElementById('badge');
  const empty = document.getElementById('empty');
  const container = document.getElementById('cards');
  const subcategoryNavigator = buildSubcategoryNavigator();
  const main = document.querySelector('main');
  syncNewScriptButton();

  if (isInitialLanding && !searchQ) {
    badge.hidden = true;
    empty.style.display = 'none';
    main?.classList.add('is-initial-landing');
    container.innerHTML = '<section class="scriptz-initial-landing" aria-label="Scriptz"><img src="assets/scriptz_icone_branco_transparente.png" alt="Logo Scriptz"></section>';
    syncOrderingControls();
    return;
  }

  main?.classList.remove('is-initial-landing');

  const initialPersonalArea = !isStandardLibrary() && activeCat === 'all' && !searchQ && !globalSearchQ && list.length === 0;
  const hasExistingCategoryForInitialScript = initialPersonalArea && getAssignableCategories().length > 0;
  const initialAreaName = isStandardMode() ? 'Meus Scriptz' : 'Modo Editor';

  badge.hidden = list.length === 0;
  badge.textContent = list.length === 0 ? '' : list.length === 1 ? '1 script' : `${list.length} scriptz`;
  if (list.length === 0) {
    container.innerHTML = initialPersonalArea
      ? `<section class="category-empty-choice personal-library-empty" aria-label="${initialAreaName} vazio"><div class="category-empty-choice-copy"><span class="subcategory-navigator-kicker">${initialAreaName} vazio</span><p>${hasExistingCategoryForInitialScript ? 'Escolha uma categoria ou subcategoria existente para criar um novo script.' : 'Crie uma categoria para começar a organizar seus próprios scripts.'}</p></div><div class="category-empty-choice-actions${hasExistingCategoryForInitialScript ? '' : ' single-action'}">${hasExistingCategoryForInitialScript ? '<button type="button" class="category-empty-primary" onclick="openModal()"><span aria-hidden="true">✚</span><strong>Criar script</strong><small>Escolher categoria ou subcategoria existente</small></button>' : ''}<button type="button" class="category-empty-secondary" onclick="createPersonalCategoryFromMain()"><span aria-hidden="true">⌘</span><strong>Criar categoria</strong><small>Organizar um novo grupo de scripts</small></button></div></section>`
      : subcategoryNavigator;
    empty.style.display = (subcategoryNavigator || initialPersonalArea) ? 'none' : 'block';
    setTimeout(initSubcategoryDragDrop, 30);
    syncOrderingControls();
    return;
  }
  empty.style.display = 'none';
  container.innerHTML = subcategoryNavigator + list.map(s => cardHTML(s)).join('');
  setTimeout(() => {
    initScriptDragDrop();
    initSubcategoryDragDrop();
    syncOrderingControls();
  }, 30);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getCategoryOptions(selected = '', { placeholder = '', exclude = [], includeCreateAction = true } = {}) {
  const hierarchy = getOrderedCategories(getAssignableCategories()).map(category => ({ category, depth: getCategoryParent(category) ? 1 : 0 }));
  let html = placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : '';
  hierarchy.filter(({ category }) => !exclude.includes(category)).forEach(({ category, depth }) => {
    const label = depth ? `${categoryDisplayName(getCategoryParent(category))} › ${categoryDisplayName(category)}` : categoryDisplayName(category);
    html += `<option value="${escapeHtml(category)}" ${category === selected ? 'selected' : ''}>${escapeHtml(label)}</option>`;
  });
  if (includeCreateAction) html += `<option value="__new__">➕ Nova categoria...</option>`;
  return html;
}

function buildFullText(script) {
  let htmlContent = cleanEditorHtml(script?.html || '');
  
  htmlContent = greetingHTML(getGreetingMode(script)) + htmlContent;
  
  if (hasSignature(script)) {
    const signature = escapeHtml(getSignature());
    htmlContent = htmlContent + '<p>Atenciosamente,<br>' + signature + '</p>';
  }
  
  return htmlContent;
}

function scriptEditorHTML(s) {
  const greetingMode = getGreetingMode(s);
  const greetingOptions = greetingSelectOptions(greetingMode);
  const hasSignatureFeature = hasSignature(s);
  const categories = getScriptCategories(s);
  const locked = isStandardScript(s);
  const lockAttrs = locked ? 'disabled aria-disabled="true" title="Script padrão protegido"' : '';
  const plainText = s.html.replace(/<[^>]*>/g, '');
  return `<div class="editor-wrap" id="ew${s.id}">
    <div class="editor-meta">
      <input class="title-field" id="tt${s.id}" placeholder="Título do script" value="${escapeHtml(s.title)}" ${lockAttrs}>
      <div class="category-select-stack editor-category-stack">
        <div class="category-select-list" id="catSelectList${s.id}">${editCategorySelectMarkup(s.id, categories, locked)}</div>
      </div>
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
  </div>`;
}

function cardHTML(s) {
  const plainText = s.html.replace(/<[^>]*>/g, '');
  const fullHTML = buildFullText(s);
  const isFav = isFavorite(s);
  const locked = isStandardScript(s);
  const lockedBadge = locked ? '<span class="standard-lock" role="img" aria-label="Script padrão protegido" title="Script padrão protegido"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="10" width="14" height="10" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path><path d="M12 14v2"></path></svg></span>' : '';
  const lockAttrs = locked ? 'disabled aria-disabled="true" title="Script padrão protegido"' : '';
  
  return `
  <div class="card ${locked ? 'standard-script' : ''}" id="c${s.id}" draggable="${sortBy === 'custom' && activeEditId === null ? 'true' : 'false'}">
    <div class="card-hd" onclick="toggleCard(${s.id})">
      <div class="card-info">
        <div class="card-title">
          ${escapeHtml(s.title)} ${lockedBadge}
        </div>
        <span class="card-tag">${escapeHtml(categoryLabel(s))}</span>
      </div>
      ${activeEditId === null ? `<div class="card-btns" onclick="event.stopPropagation()">
        <button class="btn btn-copy" id="cb${s.id}" onclick="event.stopPropagation(); copyScript(${s.id})">📋 Copiar</button>
        <button class="btn btn-ghost" onclick="startEdit(${s.id})" ${lockAttrs}>✏️ Editar</button>
        <button class="btn btn-del" onclick="deleteScript(${s.id})" ${lockAttrs}>🗑️ Excluir</button>
        <button class="fav-star ${isFav ? 'active' : ''}" onclick="toggleFavorite(${s.id})">${isFav ? '⭐' : '☆'}</button>
      </div>` : ''}
      ${sortBy === 'custom' && activeEditId === null ? `<span class="script-order-controls" onclick="event.stopPropagation()"><button type="button" onclick="moveScriptOrder(${s.id}, -1)" aria-label="Mover script para cima">↑</button><button type="button" onclick="moveScriptOrder(${s.id}, 1)" aria-label="Mover script para baixo">↓</button></span>` : ''}
      <svg class="chev" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="card-body">
      <div class="preview-wrapper">
        <div class="preview-container" id="pc${s.id}">
          <div class="preview" id="pv${s.id}">${fullHTML}</div>
        </div>
      </div>
      ${activeEditId === s.id ? scriptEditorHTML(s) : `<div class="editor-wrap" id="ew${s.id}"></div>`}
    </div>
  </div>`;
}

function toggleCard(id) {
  if (activeEditId !== null) {
    showToast('⚠️', 'Conclua ou cancele a edição antes de abrir outro script.');
    return;
  }
  const card = document.getElementById('c' + id);
  card.classList.toggle('open');
}

function moveScriptOrder(id, direction) {
  if (activeEditId !== null) {
    showToast('⚠️', 'Conclua ou cancele a edição antes de reordenar scripts.');
    return;
  }
  const list = getFilteredScripts().map(s => String(s.id));
  const index = list.indexOf(String(id));
  const next = index + direction;
  if (index < 0 || next < 0 || next >= list.length) return;
  [list[index], list[next]] = [list[next], list[index]];
  setLibraryScriptOrder(activeCat, list);
  saveToLocal();
  render();
}

function initScriptDragDrop() {
  if (sortBy !== 'custom' || activeEditId !== null) return;
  const container = document.getElementById('cards');
  if (!container) return;
  let dragged = null;
  container.querySelectorAll('.card[draggable="true"]').forEach(card => {
    card.addEventListener('dragstart', () => { dragged = card; card.classList.add('dragging'); });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      setLibraryScriptOrder(activeCat, [...container.querySelectorAll('.card')].map(el => el.id.slice(1)));
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
//  CATEGORIAS NA EDIÇÃO (VINCULAÇÕES ILIMITADAS)
// ============================================================
function getEditCategories(id) {
  return selectedCategoryList([...document.querySelectorAll(`#catSelectList${id} select[data-category-select]`)].map(select => select.value));
}

function editCategorySelectMarkup(id, categories = [], locked = false) {
  const selected = selectedCategoryList(categories);
  const used = [];
  const values = locked ? selected : [...selected, ''];
  return values.map((category, index) => {
    const options = getCategoryOptions(category, {
      placeholder: 'Adicionar categoria ou subcategoria',
      exclude: used,
      includeCreateAction: false
    });
    if (category) used.push(category);
    const lockAttrs = locked ? 'disabled aria-disabled="true" title="Script padrão protegido"' : '';
    return `<select class="category-select" id="catCategory${id}_${index}" data-category-select aria-label="Categoria ou subcategoria ${index + 1}" onchange="onEditCategoryChange(${id}, ${index})" ${lockAttrs}>${options}</select>`;
  }).join('');
}

function populateEditCategorySelects(id, categories = []) {
  const container = document.getElementById(`catSelectList${id}`);
  const script = scripts.find(item => item.id === id);
  if (!container || !script) return;
  container.innerHTML = editCategorySelectMarkup(id, categories, isStandardScript(script));
}

function onEditCategoryChange(id, slot) {
  const script = scripts.find(item => item.id === id);
  if (isStandardScript(script)) {
    showToast('🔒', 'A categoria de um Script Padrão não pode ser alterada.');
    return;
  }
  const changed = document.getElementById(`catCategory${id}_${slot}`);
  if (!changed) return;
  populateEditCategorySelects(id, getEditCategories(id));
}

// ============================================================
//  EDIÇÃO
// ============================================================
function startEdit(id) {
  if (blockConflictingAction({ allowEdit: true })) return;
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
  render();
  const card = document.getElementById('c' + id);
  card.classList.add('open', 'editing');
  card.draggable = false;
  card.querySelector('.script-order-controls')?.setAttribute('hidden', '');
  document.getElementById('pv' + id).classList.add('editing-mode');
  document.getElementById('ew' + id).classList.add('visible');
  const ce = document.getElementById('ce' + id);
  ce.innerHTML = s.html;
  ce.focus();
  livePreview(id);
  syncOrderingControls();
}

function cancelEdit(id) {
  const card = document.getElementById('c' + id);
  if (card) card.classList.remove('editing');
  document.getElementById('pv' + id)?.classList.remove('editing-mode');
  document.getElementById('ew' + id)?.classList.remove('visible');
  if (activeEditId === id) activeEditId = null;
  render();
  syncOrderingControls();
}
function livePreview(id) {
  const ce = document.getElementById('ce' + id);
  const content = document.getElementById('pv' + id);
  const greetingSelect = document.getElementById('greeting' + id);
  const chkSignature = document.getElementById('chkSignature' + id);
  
  let htmlContent = cleanEditorHtml(ce.innerHTML);
  
  htmlContent = greetingHTML(greetingSelect?.value || GREETING_MODES.auto) + htmlContent;
  
  if (chkSignature && chkSignature.checked) {
    const signature = escapeHtml(getSignature());
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
  const newCategories = getEditCategories(id);
  const greetingMode = document.getElementById('greeting' + id).value;
  const hasSignatureFeature = document.getElementById('chkSignature' + id).checked;

  newHTML = cleanEditorHtml(newHTML);

  if (!hasValidScriptClassification(newCategories)) {
    showToast('⚠️', 'Selecione ao menos uma categoria ou subcategoria existente.');
    document.getElementById('catPrimary' + id)?.focus();
    return;
  }

  scripts[idx].html = newHTML;
  scripts[idx].greetingMode = greetingMode;
  scripts[idx].hasGreeting = greetingMode !== GREETING_MODES.off;
  scripts[idx].hasSignature = hasSignatureFeature;
  if (newTitle) scripts[idx].title = newTitle;
  setScriptCategories(scripts[idx], newCategories);

  const fullHTML = buildFullText(scripts[idx]);
  document.getElementById('pv' + id).innerHTML = fullHTML;

  activeEditId = null;
  activeCat = newCategories[0];
  isInitialLanding = false;
  searchQ = '';
  globalSearchQ = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('contextSearchInput').value = '';
  document.getElementById('mobileSearchInput').value = '';
  document.getElementById('pageTitle').textContent = getCategoryPath(activeCat);
  saveToLocal();
  buildSidebar();
  render();
  setTimeout(() => document.getElementById('c' + id)?.classList.add('open'), 0);
  showToast('💾', 'Script salvo!');
}

function deleteScript(id) {
  if (blockConflictingAction()) return;
  const script = scripts.find(item => item.id === id);
  if (isStandardScript(script)) {
    showToast('🔒', 'Scripts padrão não podem ser excluídos.');
    return;
  }
  openNoticeModal({
    title: 'Excluir script',
    message: `Deseja excluir permanentemente o script “${script?.title || 'Sem título'}”?`,
    note: 'Esta ação não pode ser desfeita sem uma cópia exportada dos seus scriptz.',
    confirmLabel: 'Excluir script',
    danger: true,
    onConfirm: () => {
      scripts = scripts.filter(x => x.id !== id);
      saveToLocal();
      buildSidebar();
      render();
      showToast('🗑️', 'Script excluído');
    }
  });
}

// ============================================================
//  COPIAR (preserva formatação - sem negrito)
// ============================================================
async function copyScript(id) {
  if (blockConflictingAction()) return;
  const s = scripts.find(x => x.id === id);
  if (!s) return;

  if (hasSignature(s) && !getSignatureName()) {
    openCopySignatureModal(id);
    return;
  }

  // Copiar nunca deve fechar o script: reforça o estado aberto antes e depois da operação.
  const card = document.getElementById('c' + id);
  if (card) card.classList.add('open');

  let htmlContent = greetingHTML(getGreetingMode(s)) + cleanEditorHtml(s.html);
  
  // Aplica assinatura se ativa (sem negrito)
  if (hasSignature(s)) {
    const signature = escapeHtml(getSignature());
    htmlContent = htmlContent + '<p>Atenciosamente,<br>' + signature + '</p>';
  }
  
  htmlContent = htmlContent.replace(/^\s+/, '');

  const plainText = htmlToStructuredPlainText(htmlContent).replace(/\n/g, '\r\n');

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

function openCopySignatureModal(scriptId) {
  pendingSignatureCopyId = scriptId;
  const modal = document.getElementById('copySignatureModal');
  const input = document.getElementById('copySignatureName');
  const error = document.getElementById('copySignatureError');
  if (!modal || !input) return;
  input.value = getSignatureName();
  if (error) error.textContent = '';
  modal.classList.add('show');
  setTimeout(() => input.focus(), 0);
}

function closeCopySignatureModal() {
  document.getElementById('copySignatureModal')?.classList.remove('show');
  pendingSignatureCopyId = null;
}

function confirmCopySignature() {
  const input = document.getElementById('copySignatureName');
  const error = document.getElementById('copySignatureError');
  const name = input?.value.trim() || '';
  if (!name) {
    if (error) error.textContent = 'Informe seu nome e sobrenome para continuar.';
    input?.focus();
    return;
  }
  const scriptId = pendingSignatureCopyId;
  setSignatureName(name);
  closeCopySignatureModal();
  render();
  if (scriptId !== null) copyScript(scriptId);
}

// ============================================================
//  ADICIONAR SCRIPT
// ============================================================
function openModal(preselectedCategory = '') {
    if (blockConflictingAction()) return;
    if (isStandardLibrary()) {
      setLibrary('personal');
      setTimeout(() => openModal(preselectedCategory), 0);
      return;
    }
    const contextualCategory = getContextualPrimaryCategory();
    const choosingInitialCategory = !contextualCategory && canChooseExistingCategoryForNewScript();
    if (!contextualCategory && !choosingInitialCategory) {
      showToast('⚠️', 'Crie ou abra uma categoria ou subcategoria antes de criar um script.');
      return;
    }
    newScriptModalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.getElementById('newTitle').value = '';
    populateNewCategorySelects(contextualCategory ? [contextualCategory] : []);
    const editor = document.getElementById('newText');
    editor.innerHTML = '';
    editor.dataset.hasContent = 'false';
    document.getElementById('newLinkInput')?.classList.remove('visible');
    document.getElementById('newLinkUrl').value = '';
    newScriptLinkRange = null;
    const greetingSelect = document.getElementById('newGreeting');
    greetingSelect.innerHTML = greetingSelectOptions(GREETING_MODES.off);
    greetingSelect.value = GREETING_MODES.off;
    syncGreetingSelectState(greetingSelect);
    document.getElementById('newSignature').checked = false;
    document.getElementById('overlay').classList.add('show');
    
    setTimeout(() => {
        document.getElementById('newTitle').focus();
    }, 100);
}

function closeModal() {
    document.getElementById('overlay').classList.remove('show');
    const trigger = newScriptModalTrigger;
    newScriptModalTrigger = null;
    window.setTimeout(() => {
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    }, 0);
}

function textToHTML(txt) {
    return txt.split(/\n\n+/).map(block => {
        const lines = block.split('\n').map(l => escapeHtml(l)).join('<br>');
        return '<p>' + lines + '</p>';
    }).join('');
}

function addScript() {
    const title = document.getElementById('newTitle').value.trim();
    const editor = document.getElementById('newText');
    const text = editor.innerText.trim();
    const html = cleanEditorHtml(editor.innerHTML);
    const categories = getNewScriptCategories();
    const contextualCategory = getContextualPrimaryCategory();
    const greetingMode = document.getElementById('newGreeting').value;
    const includeSignature = document.getElementById('newSignature').checked;

    if (!title || !text) {
        showToast('⚠️', 'Preencha título e texto');
        return;
    }
    if (!hasValidScriptClassification(categories) || (contextualCategory && categories[0] !== contextualCategory)) {
        showToast('⚠️', 'Escolha uma categoria ou subcategoria válida antes de salvar o script.');
        return;
    }
    if (scripts.length >= currentScriptLimit()) {
        showToast('⚠️', `Limite de ${currentScriptLimit()} scriptz atingido neste contexto.`);
        return;
    }

    const scriptCategories = categories;

    scripts.push({
        id: nextId++,
        cat: scriptCategories[0],
        cats: scriptCategories,
        title: title,
        html: html || textToHTML(text),
        greetingMode: greetingMode,
        hasGreeting: greetingMode !== GREETING_MODES.off,
        hasSignature: includeSignature,
        isFavorite: false,
        isStandard: false,
        source: 'user'
    });
    
    closeModal();
    activeCat = scriptCategories[0];
    searchQ = '';
    document.getElementById('pageTitle').textContent = getCategoryPath(activeCat);
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
    version: 6,
    mode: workspace.mode,
    division: workspace.division,
    scripts: standard ? scripts.filter(script => !isStandardScript(script)) : scripts,
    categories: categoryRegistry,
    categoryParents: categoryParents,
    categoryLabels: { ...categoryLabels },
    categoryOrder: customCategoryOrder,
    scriptOrders: customScriptOrderByCategory,
    expandedCategories: [...expandedCategories]
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = standard ? `${workspace.division}-alteracoes.json` : 'meus-scriptz.json';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
  showToast('📤', standard ? 'Alterações exportadas!' : 'Meus Scriptz exportados!');
}

function downloadJSON(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 0);
}

function orderedTemplateScripts(templateCategories) {
  const sourceScripts = scripts.filter(script => !isStandardScript(script));
  const emitted = new Set();
  const ordered = [];
  templateCategories.forEach(category => {
    const rank = new Map((customScriptOrderByCategory[category] || []).map((id, index) => [String(id), index]));
    sourceScripts
      .filter(script => script.cat === category)
      .sort((left, right) => (rank.get(String(left.id)) ?? Number.MAX_SAFE_INTEGER) - (rank.get(String(right.id)) ?? Number.MAX_SAFE_INTEGER))
      .forEach(script => {
        emitted.add(String(script.id));
        ordered.push(script);
      });
  });
  sourceScripts.filter(script => !emitted.has(String(script.id))).forEach(script => ordered.push(script));
  return ordered;
}

function buildStandardTemplatePayload(division) {
  if (!STANDARD_DIVISIONS[division]) throw new Error('Divisão inválida para exportação.');
  if (isStandardMode()) throw new Error('Prepare o conteúdo no Modo Editor antes de exportar um template padrão.');
  const knownCategories = [...new Set([
    ...categoryRegistry,
    ...allScriptCategories(scripts),
    ...Object.keys(categoryParents),
    ...Object.values(categoryParents)
  ].map(normalizeCategoryName).filter(Boolean))];
  const categories = getOrderedCategories(knownCategories, 'personal');
  const categorySet = new Set(categories);
  const templateParents = Object.fromEntries(Object.entries(categoryParents)
    .map(([child, parent]) => [normalizeCategoryName(child), normalizeCategoryName(parent)])
    .filter(([child, parent]) => child && parent && child !== parent && categorySet.has(child) && categorySet.has(parent)));
  const parentCategories = new Set(Object.values(templateParents));
  const parentScripts = scripts.filter(script => !isStandardScript(script) && parentCategories.has(script.cat));
  if (parentScripts.length) throw new Error('Categorias com subcategorias não podem ter scripts diretos. Mova esses scripts antes de exportar.');
  return {
    schema: 'scriptz-standard-template',
    version: 2,
    division,
    categories,
    categoryParents: templateParents,
    categoryLabels: Object.fromEntries(categories.map(category => [category, categoryDisplayName(category, 'personal')])),
    scripts: orderedTemplateScripts(categories).map(script => ({
      id: Number(script.id),
      cat: script.cat,
      cats: getScriptCategories(script),
      title: script.title,
      html: script.html,
      greetingMode: getGreetingMode(script),
      hasGreeting: getGreetingMode(script) !== GREETING_MODES.off,
      hasSignature: script.hasSignature !== false,
      isFavorite: false
    }))
  };
}

function openTemplateExportModal() {
  if (isStandardMode()) return;
  document.getElementById('templateExportModal')?.classList.add('show');
}

function closeTemplateExportModal() {
  document.getElementById('templateExportModal')?.classList.remove('show');
}

function openHelpInfoModal() {
  const modal = document.getElementById('helpInfoModal');
  if (!modal) return;
  modal.classList.add('show');
  modal.querySelector('.help-info-close')?.focus();
}

function closeHelpInfoModal() {
  document.getElementById('helpInfoModal')?.classList.remove('show');
  document.getElementById('helpInfoBtn')?.focus({ preventScroll: true });
}

function exportStandardTemplate(division) {
  try {
    const payload = buildStandardTemplatePayload(division);
    downloadJSON(payload, `${division}.JSON`);
    closeTemplateExportModal();
    showToast('🏛️', `Template CAP · ${division} exportado!`);
    return payload;
  } catch (error) {
    showToast('⚠️', error.message || 'Não foi possível exportar o template.');
    return null;
  }
}

function validateCategoryArray(value, label) {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length > SECURITY_LIMITS.maxCategories) throw new Error(`${label} inválida ou excessiva.`);
  if (value.some(item => typeof item !== 'string' || !item.trim() || item.length > SECURITY_LIMITS.maxCategoryChars)) {
    throw new Error(`${label} contém um nome inválido.`);
  }
}

function validateCategoryMap(value, label) {
  if (value === undefined) return;
  const record = isSafeRecord(value, label);
  const entries = Object.entries(record);
  if (entries.length > SECURITY_LIMITS.maxCategories) throw new Error(`${label} excede o limite de categorias.`);
  if (entries.some(([key, item]) => typeof key !== 'string' || typeof item !== 'string' || !key.trim() || !item.trim() || key.length > SECURITY_LIMITS.maxCategoryChars || item.length > SECURITY_LIMITS.maxCategoryChars)) {
    throw new Error(`${label} contém uma categoria inválida.`);
  }
}

function validateScriptOrders(value) {
  if (value === undefined) return;
  const record = isSafeRecord(value, 'Ordenações');
  const entries = Object.entries(record);
  if (entries.length > SECURITY_LIMITS.maxCategories) throw new Error('Ordenações excedem o limite de categorias.');
  if (entries.some(([category, ids]) => typeof category !== 'string' || !Array.isArray(ids) || ids.length > SCRIPT_LIMITS.free || ids.some(id => !Number.isFinite(Number(id))))) {
    throw new Error('Ordenação personalizada inválida.');
  }
}

function validateScriptPayload(script, index, maxScripts) {
  const record = isSafeRecord(script, `Script ${index + 1}`);
  if (record.title !== undefined && (typeof record.title !== 'string' || record.title.length > SECURITY_LIMITS.maxTitleChars)) {
    throw new Error(`Título inválido no script ${index + 1}.`);
  }
  if (typeof record.html !== 'string' || record.html.length > SECURITY_LIMITS.maxHtmlChars) {
    throw new Error(`Texto inválido ou excessivo no script ${index + 1}.`);
  }
  if (record.cat !== undefined && (typeof record.cat !== 'string' || !record.cat.trim() || record.cat.length > SECURITY_LIMITS.maxCategoryChars)) {
    throw new Error(`Categoria inválida no script ${index + 1}.`);
  }
  if (record.cats !== undefined) {
    if (!Array.isArray(record.cats) || !record.cats.length || record.cats.length > SECURITY_LIMITS.maxCategories || record.cats.some(category => typeof category !== 'string' || !category.trim() || category.length > SECURITY_LIMITS.maxCategoryChars)) {
      throw new Error(`Categorias inválidas no script ${index + 1}.`);
    }
  }
  if (record.id !== undefined && !Number.isFinite(Number(record.id))) throw new Error(`Identificador inválido no script ${index + 1}.`);
  ['hasSignature', 'hasGreeting', 'isFavorite', 'isStandard'].forEach(field => {
    if (record[field] !== undefined && typeof record[field] !== 'boolean') throw new Error(`Campo ${field} inválido no script ${index + 1}.`);
  });
  if (record.greetingMode !== undefined && !Object.values(GREETING_MODES).includes(record.greetingMode)) {
    throw new Error(`Saudação inválida no script ${index + 1}.`);
  }
  return record;
}

function validateProjectPayload(data, { allowTemplate = false } = {}) {
  const record = isSafeRecord(data, 'Arquivo JSON');
  const allowedSchemas = new Set(['scriptz-free-project', 'scriptz-standard-changes', 'legacy-scriptz']);
  if (allowTemplate) allowedSchemas.add('scriptz-standard-template');
  if (record.schema !== undefined && !allowedSchemas.has(record.schema)) throw new Error('Schema de importação não reconhecido.');
  if (!Array.isArray(record.scripts)) throw new Error('O arquivo não contém uma lista de scriptz válida.');
  const maxScripts = record.schema === 'scriptz-standard-template' ? SCRIPT_LIMITS.standard : SCRIPT_LIMITS.free;
  if (record.scripts.length > maxScripts) throw new Error(`O arquivo excede o limite de ${maxScripts} scriptz.`);
  record.scripts.forEach((script, index) => validateScriptPayload(script, index, maxScripts));
  validateCategoryArray(record.categories, 'Lista de categorias');
  validateCategoryMap(record.categoryParents, 'Hierarquia de categorias');
  validateCategoryMap(record.categoryLabels, 'Rótulos de categorias');
  validateCategoryArray(record.categoryOrder, 'Ordem de categorias');
  validateCategoryArray(record.expandedCategories, 'Categorias expandidas');
  validateCategoryArray(record.standardCategoryOrder, 'Ordem padrão de categorias');
  validateScriptOrders(record.scriptOrders);
  validateScriptOrders(record.standardScriptOrders);
  if (record.division !== undefined && record.division !== null && (typeof record.division !== 'string' || record.division.length > 80)) throw new Error('Divisão inválida.');
  return record;
}

function scriptContentFingerprint(script) {
  const title = String(script?.title || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  const html = cleanEditorHtml(String(script?.html || '')).replace(/>\s+</g, '><').trim();
  const greeting = getGreetingMode(script);
  const signature = script?.hasSignature !== false ? 'signature' : 'no-signature';
  return `${title}\u0000${html}\u0000${greeting}\u0000${signature}`;
}

function hasSavedPersonalContent() {
  const personalScripts = isStandardMode() ? getLibraryScripts('personal') : scripts;
  return personalScripts.length > 0 || categoryRegistry.length > 0;
}

function normalizeIncomingScripts(incomingScripts, { source = 'user', reservedScripts = [] } = {}) {
  const usedIds = new Set(reservedScripts.map(script => Number(script.id)).filter(Number.isFinite));
  let idCursor = Math.max(99, ...[...usedIds], nextId - 1);
  const fingerprints = new Set();
  return incomingScripts.reduce((normalizedScripts, script) => {
    const normalized = normalizeScript({ ...script, isStandard: false }, source);
    const fingerprint = scriptContentFingerprint(normalized);
    if (fingerprints.has(fingerprint)) return normalizedScripts;
    fingerprints.add(fingerprint);
    if (!Number.isInteger(normalized.id) || usedIds.has(normalized.id)) {
      do { idCursor += 1; } while (usedIds.has(idCursor));
      normalized.id = idCursor;
    }
    usedIds.add(normalized.id);
    normalizedScripts.push(normalized);
    return normalizedScripts;
  }, []);
}

function collectImportedCategories(data, incomingScripts) {
  const parents = normalizeCategoryParents(data.categoryParents);
  return [...new Set([
    ...(Array.isArray(data.categories) ? data.categories : []),
    ...allScriptCategories(incomingScripts),
    ...Object.keys(parents),
    ...Object.values(parents)
  ].map(normalizeCategoryName).filter(Boolean))];
}

function mergeImportMetadata(data, incomingScripts) {
  const incomingCategories = collectImportedCategories(data, incomingScripts);
  const incomingParents = normalizeCategoryParents(data.categoryParents);
  const incomingLabels = normalizeCategoryLabels(data.categoryLabels);
  const existing = new Set(categoryRegistry);
  incomingCategories.forEach(category => {
    if (!existing.has(category)) categoryRegistry.push(category);
    if (!categoryLabels[category]) categoryLabels[category] = incomingLabels[category] || fallbackCategoryLabel(category);
    if (!categoryParents[category] && incomingParents[category]) categoryParents[category] = incomingParents[category];
  });
  const importedOrder = Array.isArray(data.categoryOrder) ? data.categoryOrder.map(normalizeCategoryName).filter(Boolean) : [];
  customCategoryOrder = [...new Set([...customCategoryOrder, ...importedOrder, ...incomingCategories])];
  const importedScriptOrders = isSafeRecord(data.scriptOrders || {}, 'Ordenações');
  Object.entries(importedScriptOrders).forEach(([category, ids]) => {
    const current = customScriptOrderByCategory[category] || [];
    customScriptOrderByCategory[category] = [...new Set([...current, ...ids.map(String)])];
  });
  expandedCategories = new Set([...expandedCategories, ...(Array.isArray(data.expandedCategories) ? data.expandedCategories : []).map(normalizeCategoryName).filter(Boolean)]);
}

function replaceImportMetadata(data, incomingScripts) {
  const importedParents = normalizeCategoryParents(data.categoryParents);
  categoryRegistry = collectImportedCategories(data, incomingScripts);
  categoryParents = importedParents;
  categoryLabels = normalizeCategoryLabels(data.categoryLabels);
  customCategoryOrder = Array.isArray(data.categoryOrder) ? data.categoryOrder.map(normalizeCategoryName).filter(Boolean) : [...categoryRegistry];
  customScriptOrderByCategory = isSafeRecord(data.scriptOrders || {}, 'Ordenações');
  expandedCategories = new Set(Array.isArray(data.expandedCategories) ? data.expandedCategories.map(normalizeCategoryName).filter(Boolean) : []);
}

function importProjectData(imported, { strategy = 'replace', allowTemplate = false, source = 'user', successMessage = '' } = {}) {
  if (!workspace.mode) throw new Error('Selecione um modo antes de importar.');
  const legacy = Array.isArray(imported);
  const data = legacy ? { schema: 'legacy-scriptz', scripts: imported, categories: [] } : imported;
  validateProjectPayload(data, { allowTemplate });
  if (data.scripts.some(script => !scriptHasDeclaredClassification(script))) {
    throw new Error('Todo script precisa pertencer a uma categoria ou subcategoria existente.');
  }
  if (isStandardMode()) {
    const isDivisionChanges = data.schema === 'scriptz-standard-changes' && data.division === workspace.division;
    const isExternalProject = data.schema === 'scriptz-free-project' || data.schema === 'legacy-scriptz' || data.schema === 'scriptz-standard-template';
    if (!isDivisionChanges && !isExternalProject) throw new Error('Este arquivo não pertence à divisão atual do Scriptz Padrão.');
  } else if (data.schema === 'scriptz-standard-changes') {
    throw new Error('Alterações do Scriptz Padrão devem ser importadas na divisão correspondente.');
  }

  const protectedScripts = isStandardMode() ? standardScripts : [];
  const currentPersonalScripts = isStandardMode() ? getLibraryScripts('personal') : scripts;
  const incomingScripts = normalizeIncomingScripts(data.scripts, { source, reservedScripts: [...protectedScripts, ...currentPersonalScripts] });
  const existingFingerprints = new Set(currentPersonalScripts.map(scriptContentFingerprint));
  const scriptsToAdd = incomingScripts.filter(script => !existingFingerprints.has(scriptContentFingerprint(script)));
  const personalScripts = strategy === 'merge' ? [...currentPersonalScripts, ...scriptsToAdd] : incomingScripts;
  if (protectedScripts.length + personalScripts.length > currentScriptLimit()) {
    throw new Error(`A importação ultrapassa o limite de ${currentScriptLimit()} scriptz neste contexto.`);
  }

  scripts = isStandardMode() ? [...protectedScripts, ...personalScripts] : personalScripts;
  if (strategy === 'merge') mergeImportMetadata(data, scriptsToAdd);
  else replaceImportMetadata(data, incomingScripts);
  reconcileCategoryHierarchy();
  nextId = Math.max(...scripts.map(script => Number(script.id) || 0), 99) + 1;
  activeCat = 'all';
  isInitialLanding = false;
  if (isStandardMode()) activeLibrary = 'personal';
  saveToLocal();
  refreshWorkspaceUI();
  const addedText = strategy === 'merge' ? `${scriptsToAdd.length} scriptz diferente(s) adicionado(s).` : 'Conteúdo existente substituído.';
  showToast('📥', successMessage || `Importação concluída: ${addedText}`);
}

function requestImportResolution(data, options = {}) {
  const execute = strategy => {
    try {
      importProjectData(data, { ...options, strategy });
    } catch (error) {
      showToast('❌', error.message || 'Não foi possível importar o arquivo.');
    }
  };
  if (!hasSavedPersonalContent()) {
    execute('replace');
    return;
  }
  openNoticeModal({
    title: 'Conteúdo já existente',
    message: 'Este modo já possui categorias ou scriptz salvos. Deseja substituir o conteúdo atual ou mesclar somente os itens ainda inexistentes?',
    note: 'Mesclar preserva o que já existe e adiciona apenas categorias, subcategorias e scriptz diferentes. Sobrepor substitui o conteúdo pessoal atual.',
    confirmLabel: 'Sobrepor existentes',
    secondaryLabel: 'Mesclar sem duplicar',
    onConfirm: () => execute('replace'),
    onSecondary: () => execute('merge')
  });
}

function readImportFile(file) {
  if (blockConflictingAction()) return;
  if (!file) return;
  if (!/\.json$/i.test(file.name || '')) {
    showToast('⚠️', 'Selecione um arquivo JSON válido.');
    return;
  }
  if (file.size > SECURITY_LIMITS.maxImportBytes) {
    showToast('⚠️', 'O arquivo excede o limite de 2 MB para importação.');
    return;
  }
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const data = JSON.parse(event.target.result);
      requestImportResolution(data, { allowTemplate: true });
    } catch (error) {
      showToast('❌', error.message || 'Arquivo inválido');
    }
  };
  reader.onerror = () => showToast('❌', 'Não foi possível ler o arquivo selecionado.');
  reader.readAsText(file, 'utf-8');
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
    if (file && /\.json$/i.test(file.name || '')) {
      readImportFile(file);
    } else {
      showToast('⚠️', 'Arraste um arquivo .json');
    }
  });
}

function openTemplateBaseModal() {
  if (blockConflictingAction()) return;
  document.getElementById('templateBaseModal')?.classList.add('show');
}

function closeTemplateBaseModal() {
  document.getElementById('templateBaseModal')?.classList.remove('show');
}

document.getElementById('templateExportModal')?.addEventListener('click', (event) => {
  if (event.target === document.getElementById('templateExportModal')) closeTemplateExportModal();
});

async function loadStandardBaseIntoFree(division) {
  if (!workspace.mode || isStandardMode()) return;
  try {
    const template = await fetchStandardTemplate(division);
    closeTemplateBaseModal();
    requestImportResolution(template, {
      allowTemplate: true,
      source: 'template-base',
      successMessage: `Base CAP · ${division} carregada no Modo Editor.`
    });
  } catch (error) {
    showToast('❌', error.message || 'Não foi possível carregar a base.');
  }
}

function discardFreeTemplates() {
  if (isStandardMode()) return;
  openNoticeModal({
    title: 'Limpar Modo Editor',
    message: 'Isso apagará todos os seus scriptz deste Modo Editor e o reiniciará em branco.',
    note: 'Exporte seus scriptz antes de continuar, se desejar manter uma cópia.',
    confirmLabel: 'Limpar Modo Editor',
    danger: true,
    onConfirm: performDiscardFreeTemplates
  });
}

function performDiscardFreeTemplates() {
  localStorage.removeItem(workspaceKey());
  scripts = [];
  categoryRegistry = [];
  categoryParents = {};
  categoryLabels = {};
  expandedCategories = new Set();
  customCategoryOrder = [];
  customScriptOrderByCategory = {};
  nextId = 100;
  activeCat = 'all';
  saveToLocal();
  refreshWorkspaceUI();
  showToast('🧹', 'Modo Editor reiniciado.');
}

// ============================================================
//  TOAST
// ============================================================
function openNoticeModal({
  title,
  message,
  note = '',
  inputLabel = '',
  inputValue = '',
  inputPlaceholder = '',
  confirmLabel = 'Continuar',
  secondaryLabel = '',
  danger = false,
  onConfirm = null,
  onSecondary = null
} = {}) {
  const modal = document.getElementById('noticeModal');
  if (!modal) return;
  const titleNode = document.getElementById('noticeTitle');
  const messageNode = document.getElementById('noticeMessage');
  const noteNode = document.getElementById('noticeNote');
  const inputLabelNode = document.getElementById('noticeInputLabel');
  const input = document.getElementById('noticeInput');
  const error = document.getElementById('noticeError');
  const confirmButton = document.getElementById('noticeConfirmBtn');
  const cancelButton = document.getElementById('noticeCancelBtn');
  const secondaryButton = document.getElementById('noticeSecondaryBtn');
  titleNode.textContent = title || 'Aviso';
  messageNode.textContent = message || '';
  noteNode.textContent = note;
  noteNode.hidden = !note;
  inputLabelNode.textContent = inputLabel;
  inputLabelNode.hidden = !inputLabel;
  input.hidden = !inputLabel;
  input.value = inputValue;
  input.placeholder = inputPlaceholder;
  error.textContent = '';
  confirmButton.textContent = confirmLabel;
  secondaryButton.textContent = secondaryLabel;
  secondaryButton.hidden = !secondaryLabel;
  cancelButton.hidden = false;
  modal.querySelector('.notice-modal')?.classList.toggle('is-danger', Boolean(danger));
  noticeAction = { onConfirm, onSecondary, requiresInput: Boolean(inputLabel) };
  modal.classList.add('show');
  window.setTimeout(() => (inputLabel ? input : confirmButton)?.focus(), 30);
}

function closeNoticeModal() {
  document.getElementById('noticeModal')?.classList.remove('show');
  noticeAction = null;
}

function confirmNoticeModal() {
  if (!noticeAction) return;
  const input = document.getElementById('noticeInput');
  const error = document.getElementById('noticeError');
  const value = normalizeCategoryName(input?.value);
  if (noticeAction.requiresInput && !value) {
    error.textContent = 'Preencha este campo para prosseguir.';
    input?.focus();
    return;
  }
  const action = noticeAction.onConfirm;
  closeNoticeModal();
  action?.(value);
}

function confirmSecondaryNoticeModal() {
  if (!noticeAction?.onSecondary) return;
  const action = noticeAction.onSecondary;
  closeNoticeModal();
  action();
}

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
  document.querySelectorAll('#mobileNavToggle, #mobilePersistentNavToggle').forEach(toggle => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  });
}

function openMobileNav() {
  document.body.classList.add('mobile-nav-open');
  document.querySelectorAll('#mobileNavToggle, #mobilePersistentNavToggle').forEach(toggle => {
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
  });
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

function syncSignatureDockPlacement() {
  const dock = document.getElementById('signatureDock');
  const sidebarFooter = document.querySelector('.sb-foot');
  const main = document.querySelector('main');
  if (!dock || !sidebarFooter || !main) return;
  if (window.matchMedia('(max-width: 820px)').matches) {
    const actionsMenu = document.getElementById('actionsMenu');
    if (dock.parentElement !== sidebarFooter || dock.nextElementSibling !== actionsMenu) {
      sidebarFooter.insertBefore(dock, actionsMenu || null);
    }
    syncSignatureInputWidth();
    return;
  }
  if (dock.parentElement !== main) main.appendChild(dock);
  syncSignatureInputWidth();
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
  window.addEventListener('resize', syncSignatureDockPlacement, { passive: true });
  const installButton = document.getElementById('installAppBtn');
  if (installButton) {
    installButton.hidden = false;
    installButton.addEventListener('click', installScriptzApp);
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) installButton.hidden = true;
  }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  const select = document.getElementById('themeSelect');
  if (select) select.addEventListener('change', (event) => selectTheme(event.target.value));
  document.getElementById('userNameInput')?.addEventListener('input', syncSignatureInputWidth);
  const actionsMenu = document.getElementById('actionsMenu');
  if (actionsMenu) {
    actionsMenu.addEventListener('toggle', syncActionsMenuIndicator);
    syncActionsMenuIndicator();
  }
  const mobileToggle = document.getElementById('mobileNavToggle');
  if (mobileToggle) mobileToggle.addEventListener('click', () => document.body.classList.contains('mobile-nav-open') ? closeMobileNav() : openMobileNav());
  const mobilePersistentToggle = document.getElementById('mobilePersistentNavToggle');
  if (mobilePersistentToggle) mobilePersistentToggle.addEventListener('click', () => document.body.classList.contains('mobile-nav-open') ? closeMobileNav() : openMobileNav());
  const mobileSearchToggle = document.getElementById('mobileSearchToggle');
  if (mobileSearchToggle) mobileSearchToggle.addEventListener('click', toggleMobileSearch);
  document.getElementById('mobileNavClose')?.addEventListener('click', closeMobileNav);
  document.getElementById('mobileNavBackdrop')?.addEventListener('click', closeMobileNav);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (document.body.classList.contains('mobile-nav-open')) closeMobileNav();
      if (document.getElementById('mobileSearchBar')?.classList.contains('visible')) toggleMobileSearch();
      if (document.getElementById('helpInfoModal')?.classList.contains('show')) closeHelpInfoModal();
    }
  });
  initSidebarResize();
  syncSignatureDockPlacement();
  loadData();
});

document.getElementById('categoryModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('categoryModal')) closeCategoryModal();
});

document.getElementById('templateBaseModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('templateBaseModal')) closeTemplateBaseModal();
});

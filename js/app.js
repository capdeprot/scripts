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
let isCustomOrderActive = false;
let reorderMode = false;

// ============================================================
//  TEMA (DARK MODE)
// ============================================================
function getTheme() {
  return localStorage.getItem('theme') || 'light';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('themeBtn');
  btn.textContent = theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
}

function toggleTheme() {
  const current = getTheme();
  setTheme(current === 'dark' ? 'light' : 'dark');
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

function applyGreeting(text) {
  const nome = '______';
  return saudacao() + ', ' + nome + '.\n\n' + text;
}

function hasGreeting(script) {
  return script.hasGreeting !== false;
}

// ============================================================
//  ASSINATURA
// ============================================================
function getSignature() {
  const name = document.getElementById('userNameInput').value.trim();
  return name || '------';
}

function applySignature(text) {
  return text + '\n\nAtenciosamente,\n' + getSignature();
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
  scripts[idx].isFavorite = !scripts[idx].isFavorite;
  saveToLocal();
  render();
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
  localStorage.setItem('category_order', JSON.stringify(customCategoryOrder));
  isCustomOrderActive = customCategoryOrder.length > 0;
  if (isCustomOrderActive) {
    sortBy = 'custom';
    document.getElementById('sortSelect').value = 'custom';
    render();
  }
}

function getOrderedCategories(cats) {
  if (sortBy !== 'custom' || customCategoryOrder.length === 0) return cats;
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
async function loadData() {
  try {
    const response = await fetch('scripts.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const text = await response.text();
    originalScripts = JSON.parse(text);
    loadUserName();
    loadCustomOrder();

    const local = localStorage.getItem('scripts_capdeprot');
    if (local) {
      scripts = JSON.parse(local);
      showToast('📂', 'Dados carregados do cache local');
    } else {
      scripts = JSON.parse(JSON.stringify(originalScripts));
      scripts.forEach(s => {
        if (s.hasGreeting === undefined) s.hasGreeting = true;
        if (s.hasSignature === undefined) s.hasSignature = true;
        if (s.isFavorite === undefined) s.isFavorite = false;
      });
      showToast('✅', 'Scripts carregados com sucesso');
    }

    if (isCustomOrderActive) {
      sortBy = 'custom';
      document.getElementById('sortSelect').value = 'custom';
    }

    nextId = Math.max(...scripts.map(s => s.id), 0) + 1;
    buildSidebar();
    render();
  } catch (err) {
    console.error(err);
    document.getElementById('cards').innerHTML =
      '<div class="empty"><div class="icon">❌</div><p>Erro ao carregar scripts.json. Verifique se o arquivo existe.</p></div>';
  }
}

// ============================================================
//  RESET
// ============================================================
function resetLocalData() {
  if (!confirm('⚠️ Isso vai apagar suas alterações locais e recarregar os templates originais. Continuar?')) return;
  localStorage.removeItem('scripts_capdeprot');
  scripts = JSON.parse(JSON.stringify(originalScripts));
  scripts.forEach(s => {
    if (s.hasGreeting === undefined) s.hasGreeting = true;
    if (s.hasSignature === undefined) s.hasSignature = true;
    if (s.isFavorite === undefined) s.isFavorite = false;
  });
  nextId = Math.max(...scripts.map(s => s.id), 0) + 1;
  buildSidebar();
  render();
  showToast('🔄', 'Alterações locais removidas!');
}

function saveToLocal() {
  localStorage.setItem('scripts_capdeprot', JSON.stringify(scripts));
  showToast('💾', 'Alterações salvas localmente');
}

// ============================================================
//  CATEGORIAS & SIDEBAR
// ============================================================
function getCategories() {
  const cats = ['all'];
  scripts.forEach(s => { if (!cats.includes(s.cat)) cats.push(s.cat); });
  return cats;
}

function getFilteredScripts() {
  let filtered = activeCat === 'all' ? scripts : scripts.filter(s => s.cat === activeCat);
  
  if (sortBy === 'favorite') {
    filtered = filtered.filter(s => isFavorite(s));
  }
  
  if (searchQ) {
    const q = searchQ.toLowerCase();
    filtered = filtered.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.cat.toLowerCase().includes(q) ||
      s.html.toLowerCase().includes(q)
    );
  }
  return applySortFn(filtered);
}

function applySortFn(list) {
  const s = sortBy;
  if (s === 'title') return [...list].sort((a, b) => a.title.localeCompare(b.title));
  if (s === 'category') return [...list].sort((a, b) => a.cat.localeCompare(b.cat));
  if (s === 'id') return [...list].sort((a, b) => a.id - b.id);
  if (s === 'favorite') {
    return [...list].sort((a, b) => a.title.localeCompare(b.title));
  }
  if (s === 'custom') return list;
  return list;
}

function applySort() {
  sortBy = document.getElementById('sortSelect').value;
  if (sortBy === 'custom') loadCustomOrder();
  render();
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
//  DRAG & DROP DAS CATEGORIAS
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
    if (catName && catName !== 'Todos') newOrder.push(catName);
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
//  BUILD SIDEBAR (CORRIGIDA COM ESTILOS INLINE)
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

  let html = '<div class="cat-lbl">Visão geral</div><ul>' +
    `<li><a class="cat-btn ${activeCat === 'all' ? 'active' : ''}" onclick="setCat('all')" style="display:flex;justify-content:space-between;align-items:center;padding:8px 16px;border-radius:8px;color:var(--text-secondary);font-size:13px;font-weight:500;cursor:pointer;transition:all var(--transition);text-decoration:none;background:var(--bg);border:1.5px solid var(--border);user-select:none;">
      📋 Todos <span class="nav-count" style="font-size:11px;background:var(--surface2);padding:0px 10px;border-radius:12px;font-weight:500;color:var(--text-secondary);transition:all var(--transition);pointer-events:none;">${scripts.length}</span></a></li></ul>`;

  html += '<div class="cat-lbl">Categorias</div><ul>';
  orderedCats.forEach(cat => {
    const count = counts[cat] || 0;
    const isActive = activeCat === cat;
    const activeStyle = isActive ? 'background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600;' : '';
    const countStyle = isActive ? 'background:rgba(255,255,255,.2);color:#fff;' : '';
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
  document.getElementById('searchInput').value = '';
  document.getElementById('pageTitle').innerHTML = cat === 'all' ? 'Todos os scripts' : cat;
  buildSidebar();
  render();
}

function onSearch(val) {
  searchQ = val;
  render();
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
//  RENDER
// ============================================================
function render() {
  const list = getFilteredScripts();
  const badge = document.getElementById('badge');
  const empty = document.getElementById('empty');
  const container = document.getElementById('cards');

  badge.textContent = list.length + (list.length === 1 ? ' script' : ' scripts');

  if (list.length === 0) {
    container.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  container.innerHTML = list.map(s => cardHTML(s)).join('');
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
  let text = script.html;
  let plainText = text.replace(/<[^>]*>/g, '');
  
  if (hasGreeting(script)) {
    plainText = applyGreeting(plainText);
  }
  
  if (hasSignature(script)) {
    plainText = applySignature(plainText);
  }
  
  return plainText;
}

function cardHTML(s) {
  const plainText = s.html.replace(/<[^>]*>/g, '');
  const fullText = buildFullText(s);
  const previewText = fullText.replace(/\n/g, '<br>');
  
  const hasGreetingFeature = hasGreeting(s);
  const hasSignatureFeature = hasSignature(s);
  const isFav = isFavorite(s);
  const catOptions = getCategoryOptions(s.cat);

  return `
  <div class="card" id="c${s.id}">
    <div class="card-hd" onclick="toggleCard(${s.id})">
      <div class="card-info">
        <div class="card-title">
          ${escapeHtml(s.title)}
          ${hasGreetingFeature ? '<span class="feature-badge greeting">🕐 Saudação automática</span>' : ''}
          ${hasSignatureFeature ? '<span class="feature-badge signature">✍️ Assinatura</span>' : ''}
        </div>
        <span class="card-tag">${escapeHtml(s.cat)}</span>
      </div>
      <div class="card-btns" onclick="event.stopPropagation()">
        <button class="btn btn-copy" id="cb${s.id}" onclick="copyScript(${s.id})">📋 Copiar</button>
        <button class="btn btn-ghost" onclick="startEdit(${s.id})">✏️ Editar</button>
        <button class="btn btn-del" onclick="deleteScript(${s.id})">🗑️</button>
        <button class="fav-star ${isFav ? 'active' : ''}" onclick="toggleFavorite(${s.id})">${isFav ? '⭐' : '☆'}</button>
      </div>
      <svg class="chev" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="card-body">
      <div class="preview" id="pv${s.id}">${previewText}</div>
      <div class="editor-wrap" id="ew${s.id}">
        <div class="fmt-bar">
          <button class="fmt-btn" onmousedown="event.preventDefault();document.execCommand('bold')"><b>B</b></button>
          <button class="fmt-btn" onmousedown="event.preventDefault();document.execCommand('italic')"><i>I</i></button>
          <button class="fmt-btn" onmousedown="event.preventDefault();document.execCommand('underline')"><u>U</u></button>
          <div class="fmt-sep"></div>
          <button class="fmt-btn" onmousedown="event.preventDefault();document.execCommand('insertUnorderedList')">•</button>
        </div>
        <div contenteditable="true" id="ce${s.id}" data-placeholder="Texto do script (somente o corpo, sem saudação e sem assinatura)" oninput="livePreview(${s.id})">${plainText}</div>
        <div class="live-preview" id="lp${s.id}">
          <div class="label">📄 Prévia ao vivo</div>
          <div id="lpContent${s.id}"></div>
        </div>
        <div class="edit-bar">
          <button class="btn btn-save" onclick="saveEdit(${s.id})">💾 Salvar</button>
          <button class="btn btn-ghost" onclick="cancelEdit(${s.id})">Cancelar</button>
          <input class="title-field" id="tt${s.id}" placeholder="Título" value="${escapeHtml(s.title)}">
          <select class="category-select" id="cat${s.id}" onchange="onCategoryChange(${s.id})">
            ${catOptions}
          </select>
          <div class="editor-checkboxes">
            <label><input type="checkbox" id="chkGreeting${s.id}" ${hasGreetingFeature ? 'checked' : ''}> 🕐</label>
            <label><input type="checkbox" id="chkSignature${s.id}" ${hasSignatureFeature ? 'checked' : ''}> ✍️</label>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function toggleCard(id) {
  document.getElementById('c' + id).classList.toggle('open');
}

// ============================================================
//  MUDANÇA DE CATEGORIA
// ============================================================
function onCategoryChange(id) {
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
  const s = scripts.find(x => x.id === id);
  const card = document.getElementById('c' + id);
  card.classList.add('open');
  document.getElementById('pv' + id).classList.add('editing-mode');
  document.getElementById('ew' + id).classList.add('visible');
  const ce = document.getElementById('ce' + id);
  ce.innerHTML = s.html;
  ce.focus();
  livePreview(id);
}

function cancelEdit(id) {
  document.getElementById('pv' + id).classList.remove('editing-mode');
  document.getElementById('ew' + id).classList.remove('visible');
  document.getElementById('lp' + id).classList.remove('visible');
}

function livePreview(id) {
  const ce = document.getElementById('ce' + id);
  const lp = document.getElementById('lp' + id);
  const content = document.getElementById('lpContent' + id);
  const chkGreeting = document.getElementById('chkGreeting' + id);
  const chkSignature = document.getElementById('chkSignature' + id);
  
  let html = ce.innerHTML;
  let plainText = html.replace(/<[^>]*>/g, '');
  let fullText = plainText;
  
  if (chkGreeting && chkGreeting.checked) {
    fullText = applyGreeting(fullText);
  }
  
  if (chkSignature && chkSignature.checked) {
    fullText = applySignature(fullText);
  }
  
  content.innerHTML = fullText.replace(/\n/g, '<br>') || '<span style="color:var(--text-secondary);opacity:.5;">Nenhum conteúdo ainda</span>';
  lp.classList.add('visible');
}

function saveEdit(id) {
  const idx = scripts.findIndex(x => x.id === id);
  const ce = document.getElementById('ce' + id);
  let newHTML = ce.innerHTML;
  const newTitle = document.getElementById('tt' + id).value.trim();
  const newCat = document.getElementById('cat' + id).value;
  const hasGreetingFeature = document.getElementById('chkGreeting' + id).checked;
  const hasSignatureFeature = document.getElementById('chkSignature' + id).checked;

  newHTML = cleanEditorHtml(newHTML);

  scripts[idx].html = newHTML;
  scripts[idx].hasGreeting = hasGreetingFeature;
  scripts[idx].hasSignature = hasSignatureFeature;
  if (newTitle) scripts[idx].title = newTitle;
  if (newCat && newCat !== '__new__') scripts[idx].cat = newCat;

  const fullText = buildFullText(scripts[idx]);
  document.getElementById('pv' + id).innerHTML = fullText.replace(/\n/g, '<br>');

  const titleSpan = document.getElementById('c' + id).querySelector('.card-title');
  let badges = '';
  const isFav = isFavorite(scripts[idx]);
  if (isFav) badges += '<span class="feature-badge favorite">⭐ Favorito</span>';
  if (hasGreetingFeature) badges += '<span class="feature-badge greeting">🕐 Saudação automática</span>';
  if (hasSignatureFeature) badges += '<span class="feature-badge signature">✍️ Assinatura</span>';
  titleSpan.innerHTML = escapeHtml(scripts[idx].title) + badges;

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
  if (!confirm('Excluir este script permanentemente?')) return;
  scripts = scripts.filter(x => x.id !== id);
  saveToLocal();
  buildSidebar();
  render();
  showToast('🗑️', 'Script excluído');
}

// ============================================================
//  COPIAR
// ============================================================
async function copyScript(id) {
  const s = scripts.find(x => x.id === id);
  if (!s) return;

  let fullText = buildFullText(s);
  fullText = fullText.replace(/^\s+/, '');

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = fullText.replace(/\n/g, '<br>');
  const plainText = tempDiv.innerText || tempDiv.textContent;

  try {
    const blob = new Blob([fullText.replace(/\n/g, '<br>')], { type: 'text/html' });
    const blobPlain = new Blob([plainText], { type: 'text/plain' });
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': blob, 'text/plain': blobPlain })
    ]);

    const btn = document.getElementById('cb' + s.id);
    btn.classList.add('ok');
    btn.innerHTML = '✅ Copiado!';
    setTimeout(() => { btn.classList.remove('ok'); btn.innerHTML = '📋 Copiar'; }, 2000);
    showToast('📋', 'Texto copiado com formatação!');
  } catch (err) {
    navigator.clipboard.writeText(plainText);
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
    document.getElementById('newGreeting').checked = true;
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
    const includeGreeting = document.getElementById('newGreeting').checked;
    const includeSignature = document.getElementById('newSignature').checked;

    if (!title || !text) {
        showToast('⚠️', 'Preencha título e texto');
        return;
    }

    const cat = categoryInput || hiddenCategory || 'Geral';
    
    const exists = scripts.some(s => s.cat === cat);
    if (!exists && cat !== 'Geral') {
        showToast('✨', 'Categoria "' + cat + '" criada automaticamente!');
    }

    scripts.push({
        id: nextId++,
        cat: cat,
        title: title,
        html: textToHTML(text),
        hasGreeting: includeGreeting,
        hasSignature: includeSignature,
        isFavorite: false
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
  const json = JSON.stringify(scripts, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'scripts.json';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('📤', 'scripts.json exportado!');
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        scripts = imported;
        nextId = Math.max(...scripts.map(s => s.id), 0) + 1;
        saveToLocal();
        buildSidebar();
        render();
        showToast('📥', 'Importado com sucesso!');
      } else throw new Error();
    } catch (err) {
      showToast('❌', 'Arquivo inválido');
    }
  };
  reader.readAsText(file);
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
      const reader = new FileReader();
      reader.onload = function(ev) {
        try {
          const imported = JSON.parse(ev.target.result);
          if (Array.isArray(imported)) {
            scripts = imported;
            nextId = Math.max(...scripts.map(s => s.id), 0) + 1;
            saveToLocal();
            buildSidebar();
            render();
            showToast('📥', 'Importado com sucesso!');
          } else throw new Error();
        } catch (err) {
          showToast('❌', 'Arquivo inválido');
        }
      };
      reader.readAsText(file);
    } else {
      showToast('⚠️', 'Arraste um arquivo .json');
    }
  });
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
document.addEventListener('DOMContentLoaded', () => {
  setTheme(getTheme());
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  document.getElementById('reorderBtn').addEventListener('click', toggleReorderMode);
  loadData();
});

document.getElementById('overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('overlay')) closeModal();
});

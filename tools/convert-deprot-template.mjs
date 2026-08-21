import fs from 'node:fs';
import path from 'node:path';

const inputPath = '/home/ubuntu/upload/DEPROT.json';
const projectTemplatePath = '/home/ubuntu/work_scriptz/scriptz-main-updated/templates/DEPROT.JSON';
const deliveryPath = '/home/ubuntu/upload/DEPROT-standard-template.json';

const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
if (!Array.isArray(source.scripts)) throw new Error('O arquivo recebido não possui uma lista de scripts.');

const stripOfficeMarkup = (html = '') => String(html)
  .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '')
  .replace(/<!--\/?(?:Start|End)Fragment-->/gi, '')
  .replace(/<o:p>\s*<\/o:p>/gi, '')
  .replace(/\u00a0/g, ' ')
  .trim();

const allowedGreetingModes = new Set(['auto', 'formal', 'off']);
const categories = [];
const categorySet = new Set();
const addCategory = (rawCategory) => {
  const category = String(rawCategory || '').trim();
  if (category && !categorySet.has(category)) {
    categorySet.add(category);
    categories.push(category);
  }
  return category;
};

(Array.isArray(source.categoryOrder) ? source.categoryOrder : source.categories || []).forEach(addCategory);
const categoryParents = {};
Object.entries(source.categoryParents && typeof source.categoryParents === 'object' ? source.categoryParents : {}).forEach(([rawChild, rawParent]) => {
  const child = addCategory(rawChild);
  const parent = addCategory(rawParent);
  if (child && parent && child !== parent) categoryParents[child] = parent;
});

const usedIds = new Set();
let nextId = 1;

const reserveId = (rawId) => {
  const candidate = Number(rawId);
  if (Number.isInteger(candidate) && candidate > 0 && !usedIds.has(candidate)) {
    usedIds.add(candidate);
    nextId = Math.max(nextId, candidate + 1);
    return candidate;
  }
  while (usedIds.has(nextId)) nextId += 1;
  usedIds.add(nextId);
  return nextId++;
};

const normalizedScripts = source.scripts.map((script, index) => {
  const scriptCategories = [...new Set((Array.isArray(script.cats) ? script.cats : [script.cat])
    .map(category => String(category || '').trim())
    .filter(Boolean))].slice(0, 2);
  if (!scriptCategories.length) throw new Error(`O script na posição ${index + 1} não possui categoria.`);
  scriptCategories.forEach(category => {
    addCategory(category);
  });
  const greetingMode = allowedGreetingModes.has(script.greetingMode) ? script.greetingMode : (script.hasGreeting === false ? 'off' : 'auto');
  return {
    id: reserveId(script.id),
    cat: scriptCategories[0],
    cats: scriptCategories,
    title: String(script.title || `Modelo ${index + 1}`).trim(),
    html: stripOfficeMarkup(script.html),
    greetingMode,
    hasGreeting: greetingMode !== 'off',
    hasSignature: script.hasSignature !== false,
    isFavorite: false
  };
});

const parentCategories = new Set(Object.values(categoryParents));
const parentsWithDirectScripts = normalizedScripts
  .filter(script => parentCategories.has(script.cat))
  .map(script => script.title);
if (parentsWithDirectScripts.length) {
  throw new Error(`Categorias-pai não podem receber scripts diretos: ${parentsWithDirectScripts.join(', ')}.`);
}

const output = {
  schema: 'scriptz-standard-template',
  version: 1,
  division: 'DEPROT',
  categories,
  categoryParents,
  scripts: normalizedScripts
};

const json = `${JSON.stringify(output, null, 2)}\n`;
fs.writeFileSync(projectTemplatePath, json);
fs.writeFileSync(deliveryPath, json);

console.log(JSON.stringify({
  output: path.basename(deliveryPath),
  schema: output.schema,
  division: output.division,
  categories: output.categories,
  categoryParents: output.categoryParents,
  scripts: output.scripts.length,
  htmlWithOfficeMarkup: output.scripts.filter(script => /<w:|<o:|\[if gte mso/i.test(script.html)).length
}, null, 2));

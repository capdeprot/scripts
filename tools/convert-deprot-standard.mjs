import { readFile, writeFile } from 'node:fs/promises';

const sourcePath = '/home/ubuntu/upload/deprot.json';
const targetPath = '/home/ubuntu/work_scriptz/scriptz-main-updated/templates/DEPROT.JSON';
const summaryPath = '/home/ubuntu/work_scriptz/scriptz-main-updated/tools/deprot-conversion-summary.json';

const source = JSON.parse(await readFile(sourcePath, 'utf8'));
if (!Array.isArray(source.scripts) || !Array.isArray(source.categories)) {
  throw new Error('O arquivo recebido precisa conter as listas scripts e categories.');
}

const normalizeCategories = script => {
  const values = Array.isArray(script.cats) ? script.cats : [script.cat];
  const categories = [...new Set(values.map(value => String(value || '').trim()).filter(Boolean))].slice(0, 2);
  return categories.length ? categories : ['Geral'];
};

const ids = new Set();
const scripts = source.scripts.map((script, index) => {
  const id = Number(script.id);
  if (!Number.isInteger(id) || id <= 0 || ids.has(id)) throw new Error(`ID de script inválido ou duplicado na posição ${index + 1}.`);
  ids.add(id);
  const categories = normalizeCategories(script);
  const title = String(script.title || '').trim();
  const html = String(script.html || '').trim();
  if (!title || !html) throw new Error(`O script ${id} precisa ter título e conteúdo.`);
  const greetingMode = ['off', 'auto', 'formal'].includes(script.greetingMode) ? script.greetingMode : 'auto';
  return {
    id,
    cat: categories[0],
    cats: categories,
    title,
    html,
    greetingMode,
    hasGreeting: greetingMode !== 'off',
    hasSignature: script.hasSignature !== false,
    isFavorite: false
  };
});

const receivedCategories = [...new Set(source.categories.map(value => String(value || '').trim()).filter(Boolean))];
const categoryOrder = Array.isArray(source.categoryOrder) ? source.categoryOrder.map(String) : [];
const categories = [...new Set([
  ...categoryOrder.filter(category => receivedCategories.includes(category)),
  ...receivedCategories,
  ...scripts.flatMap(script => script.cats)
])];
const scriptOrders = source.scriptOrders && typeof source.scriptOrders === 'object' ? source.scriptOrders : {};
const orderedScripts = [];
const included = new Set();
for (const category of categories) {
  const categoryScripts = scripts.filter(script => script.cats.includes(category) && !included.has(script.id));
  const ranked = new Map((Array.isArray(scriptOrders[category]) ? scriptOrders[category] : []).map((id, index) => [String(id), index]));
  categoryScripts.sort((a, b) => (ranked.get(String(a.id)) ?? Number.MAX_SAFE_INTEGER) - (ranked.get(String(b.id)) ?? Number.MAX_SAFE_INTEGER) || a.id - b.id);
  categoryScripts.forEach(script => {
    included.add(script.id);
    orderedScripts.push(script);
  });
}
scripts.filter(script => !included.has(script.id)).forEach(script => orderedScripts.push(script));

const template = {
  schema: 'scriptz-standard-template',
  version: 1,
  division: 'DEPROT',
  categories,
  scripts: orderedScripts
};

await writeFile(targetPath, `${JSON.stringify(template, null, 2)}\n`);
await writeFile(summaryPath, `${JSON.stringify({
  sourceSchema: source.schema || null,
  division: template.division,
  scriptCount: template.scripts.length,
  categoryCount: template.categories.length,
  multiCategoryScriptIds: template.scripts.filter(script => script.cats.length > 1).map(script => script.id),
  categories: template.categories
}, null, 2)}\n`);

console.log(JSON.stringify({ targetPath, summaryPath, scriptCount: template.scripts.length, categoryCount: template.categories.length }, null, 2));

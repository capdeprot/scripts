import fs from 'node:fs';

const templatePath = process.argv[2] || '/home/ubuntu/work_scriptz/scriptz-main-updated/templates/DEPROT.JSON';
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
const errors = [];

if (template.schema !== 'scriptz-standard-template') errors.push('Schema inválido.');
if (template.version !== 1) errors.push('Versão de template inválida.');
if (template.division !== 'DEPROT') errors.push('Divisão inválida.');
if (!Array.isArray(template.categories) || !template.categories.length) errors.push('Categorias ausentes.');
if (!Array.isArray(template.scripts) || !template.scripts.length) errors.push('Scripts ausentes.');

const categorySet = new Set(template.categories || []);
const parents = template.categoryParents || {};
const expectedParents = {
  'Mensagens externas': 'Aprova Digital',
  'Guias AD': 'Aprova Digital',
  'Alvará de Reforma': 'Cotas do SEI',
  'Projeto Modificativo': 'Cotas do SEI',
  'Restituição de Guia': 'Cotas do SEI'
};
Object.entries(expectedParents).forEach(([child, parent]) => {
  if (parents[child] !== parent) errors.push(`Hierarquia inválida: ${child} deve pertencer a ${parent}.`);
  if (!categorySet.has(child) || !categorySet.has(parent)) errors.push(`Categoria obrigatória ausente: ${child} ou ${parent}.`);
});

const parentCategories = new Set(Object.values(parents));
const ids = new Set();
const scriptsById = new Map();
(template.scripts || []).forEach((script, index) => {
  if (!Number.isInteger(script.id) || script.id <= 0 || ids.has(script.id)) errors.push(`ID inválido no script ${index + 1}.`);
  ids.add(script.id);
  scriptsById.set(script.id, script);
  if (!script.title?.trim()) errors.push(`Título ausente no script ${index + 1}.`);
  if (!script.html?.trim()) errors.push(`Conteúdo ausente no script ${index + 1}.`);
  if (!Array.isArray(script.cats) || !script.cats.length || script.cat !== script.cats[0]) errors.push(`Classificação inválida no script ${index + 1}.`);
  if ((script.cats || []).some(category => !categorySet.has(category))) errors.push(`Categoria não registrada no script ${index + 1}.`);
  if (parentCategories.has(script.cat)) errors.push(`Script direto em categoria-pai no script ${index + 1}.`);
  if (script.isStandard !== undefined || script.source !== undefined) errors.push(`Campo de projeto indevido no script ${index + 1}.`);
  if (/<w:|<o:|\[if gte mso/i.test(script.html)) errors.push(`Marcação de editor não removida no script ${index + 1}.`);
});

const guideIds = [18, 19, 29];
const messageIds = [11, 12, 13, 14, 15, 16, 17, 20, 21, 22, 23, 24, 25];
guideIds.forEach(id => {
  if (scriptsById.get(id)?.cat !== 'Guias AD') errors.push(`Script ${id} deveria estar em Guias AD.`);
});
messageIds.forEach(id => {
  if (scriptsById.get(id)?.cat !== 'Mensagens externas') errors.push(`Script ${id} deveria estar em Mensagens externas.`);
});

if (errors.length) throw new Error(errors.join(' '));
console.log(JSON.stringify({
  valid: true,
  schema: template.schema,
  division: template.division,
  categories: template.categories.length,
  categoryParents: parents,
  scripts: template.scripts.length,
  uniqueIds: ids.size === template.scripts.length,
  aprovaDigital: { mensagensExternas: messageIds.length, guiasAD: guideIds.length },
  cotasDoSei: ['Alvará de Reforma', 'Projeto Modificativo', 'Restituição de Guia']
}, null, 2));

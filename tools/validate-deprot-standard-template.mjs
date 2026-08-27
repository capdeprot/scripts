import fs from 'node:fs';

const templatePath = process.argv[2] || '/home/ubuntu/work_scriptz/scriptz-v86-clipboard/templates/DEPROT.JSON';
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
const errors = [];
const warnings = [];

if (template.schema !== 'scriptz-standard-template') errors.push('Schema inválido.');
if (![1, 2].includes(template.version)) errors.push('Versão de template inválida.');
if (template.division !== 'DEPROT') errors.push('Divisão inválida.');
if (!Array.isArray(template.categories) || !template.categories.length) errors.push('Categorias ausentes.');
if (!Array.isArray(template.scripts) || !template.scripts.length) errors.push('Scripts ausentes.');

const categorySet = new Set(template.categories || []);
const parents = template.categoryParents || {};
const labels = template.categoryLabels || {};
if (template.categoryLabels !== undefined && (!labels || typeof labels !== 'object' || Array.isArray(labels))) errors.push('Mapa de rótulos de categoria inválido.');
Object.entries(labels).forEach(([key, label]) => {
  if (!categorySet.has(key) || !String(label || '').trim()) errors.push(`Rótulo inválido para a categoria ${key}.`);
});
const expectedParents = {
  'Instruções de escrita no campo “Observações” das guias do AD': 'Guias AD',
  'Alvará de Edificação Nova': 'Guias AD',
  'Alvará de Reforma': 'Guias AD',
  'Projeto Modificativo de Edificação Nova': 'Guias AD',
  'Projeto Modificativo de Reforma': 'Guias AD',
  'Alvará de Desmembramento': 'Guias AD',
  'Alvará de Autorização para Avanço de Grua': 'Guias AD',
  'Alvará de Autorização para Estande de Vendas': 'Guias AD',
  'Alvará de Funcionamento para Local de Reunião': 'Guias AD',
  'Certificado de Segurança': 'Guias AD',
  'Certificado de Acessibilidade': 'Guias AD',
  'Cadastro de Sistema Especial de Segurança': 'Guias AD',
  'Cadastro de Tanques, Bombas e Equipamentos / Manutenção do Cadastro': 'Guias AD',
  'Solicitando documentos e/ou ajustes': 'E-mail',
  'Restituição de Guia': 'Cotas do SEI',
  'Cotas do SEI::TCAEP': 'Cotas do SEI',
  'Cotas do SEI::Busca Física': 'Cotas do SEI',
  'Cotas do SEI::Verificação de valores HIS/HMP': 'Cotas do SEI'
};
['Mensagens externas AD', 'Guias AD', 'Cotas do SEI'].forEach(category => {
  if (!categorySet.has(category)) errors.push(`Categoria principal obrigatória ausente: ${category}.`);
});
if (parents['Mensagens externas AD']) errors.push('Mensagens externas AD deve ser categoria principal.');
if (parents['Guias AD']) errors.push('Guias AD deve ser categoria principal.');
if (categorySet.has('Aprova Digital') || categorySet.has('Mensagens externas')) errors.push('A antiga árvore de Aprova Digital não deve permanecer no template.');
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
  if (/<w:|<o:|\[if gte mso/i.test(script.html)) warnings.push(`Marcação legada do Word preservada no script ${index + 1}.`);
});

const messageIds = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 29];
messageIds.forEach(id => {
  if (scriptsById.get(id)?.cat !== 'Mensagens externas AD') errors.push(`Script ${id} deveria estar em Mensagens externas AD.`);
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
  warnings,
  aprovaDigital: { mensagensExternasAD: messageIds.length, guiasADSubcategories: Object.keys(expectedParents).filter(category => parents[category] === 'Guias AD').length },
  cotasDoSei: ['Restituição de Guia', 'Cotas do SEI::TCAEP', 'Cotas do SEI::Busca Física', 'Cotas do SEI::Verificação de valores HIS/HMP']
}, null, 2));

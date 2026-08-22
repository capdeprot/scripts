import { readFile } from 'node:fs/promises';

const targetPath = '/home/ubuntu/work_scriptz/scriptz-main-updated/templates/DEPROT.JSON';
const template = JSON.parse(await readFile(targetPath, 'utf8'));

if (template.schema !== 'scriptz-standard-template') throw new Error('Schema institucional inválido.');
if (template.division !== 'DEPROT') throw new Error('Divisão institucional inválida.');
if (!Array.isArray(template.scripts) || !template.scripts.length) throw new Error('Scripts DEPROT ausentes.');
if (!Array.isArray(template.categories) || !template.categories.length) throw new Error('Categorias DEPROT ausentes.');
if (template.scripts.some(script => !Array.isArray(script.cats) || script.cats.length < 1 || script.cat !== script.cats[0])) {
  throw new Error('Vínculos de categoria DEPROT inválidos.');
}

console.log(JSON.stringify({
  schema: template.schema,
  division: template.division,
  scriptCount: template.scripts.length,
  categories: template.categories,
  multiCategoryScripts: template.scripts.filter(script => script.cats.length > 1).map(script => script.title),
  unlimitedCategoryLinks: true
}, null, 2));

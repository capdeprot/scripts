import { readFile } from 'node:fs/promises';

const targetPath = '/home/ubuntu/work_scriptz/scriptz-main-updated/templates/DEPROT.JSON';
const template = JSON.parse(await readFile(targetPath, 'utf8'));

if (template.schema !== 'scriptz-standard-template') throw new Error('Schema institucional inválido.');
if (template.division !== 'DEPROT') throw new Error('Divisão institucional inválida.');
if (!Array.isArray(template.scripts) || template.scripts.length !== 10) throw new Error('Quantidade de scripts DEPROT inválida.');
if (!Array.isArray(template.categories) || template.categories.length !== 5) throw new Error('Quantidade de categorias DEPROT inválida.');
if (template.scripts.some(script => !Array.isArray(script.cats) || script.cats.length < 1 || script.cats.length > 2 || script.cat !== script.cats[0])) {
  throw new Error('Vínculos de categoria DEPROT inválidos.');
}

console.log(JSON.stringify({
  schema: template.schema,
  division: template.division,
  scriptCount: template.scripts.length,
  categories: template.categories,
  dualCategoryScripts: template.scripts.filter(script => script.cats.length === 2).map(script => script.title)
}, null, 2));

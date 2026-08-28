# Documentação do Scriptz

A raiz do projeto mantém somente os documentos de entrada e manutenção contínua: `README.md`, `SECURITY.md` e `todo.md`. Os demais documentos Markdown ficam organizados por finalidade para evitar poluição da raiz e facilitar a localização das evidências.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `architecture/` | Decisões e descrição da arquitetura dos modos do Scriptz. |
| `design/` | Inspeções e decisões relacionadas aos ícones e identidade visual. |
| `security/` | Relatórios de auditorias e testes ativos de segurança. |
| `testing/` | Notas de testes mobile e validações históricas por versão. |

Os arquivos dentro de `tools/` são evidências específicas usadas pelos scripts de inspeção e permanecem próximos às ferramentas que os produzem. Eles não são necessários para o funcionamento do site publicado; podem ser mantidos no repositório para rastreabilidade ou removidos em uma futura limpeza de histórico, se o objetivo for um pacote mínimo de produção.

A reorganização não altera HTML, CSS, JavaScript, manifest, service worker, templates JSON ou caminhos públicos consumidos pela aplicação.

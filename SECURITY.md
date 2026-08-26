# Segurança do Scriptz

O Scriptz é uma aplicação estática que mantém seus dados no navegador do usuário. Esta etapa de hardening reduz riscos de conteúdo malicioso em scripts, JSONs importados, links e cache PWA, sem substituir controles de acesso institucionais.

## Controles implementados

| Área | Controle aplicado |
|---|---|
| Editor rico e importação | O HTML é sanitizado antes de ser salvo, exibido, copiado ou importado. São preservados apenas elementos de formatação compatíveis com o editor, como parágrafos, negrito, itálico, sublinhado, listas e links seguros. |
| Links | São permitidos somente `https:`, `http:`, `mailto:` e caminhos locais aprovados em `assets/`. Protocolos como `javascript:` e `data:` são removidos. |
| JSON | A importação aceita apenas arquivos `.json` de até 2 MB, limita a quantidade e o tamanho de registros e rejeita chaves perigosas, como `__proto__`, `prototype` e `constructor`. |
| Assinatura | O nome informado pelo usuário é tratado como texto antes de compor a prévia e a cópia formatada. |
| PWA | O service worker mantém em cache somente os recursos estáticos públicos explicitamente definidos. Requisições externas ou futuras rotas de dados não são armazenadas automaticamente. |

## Limites do modelo estático

O `localStorage` não é um local apropriado para credenciais, tokens, senhas ou dados sigilosos. Os dados nele armazenados podem ser acessados por quem tiver acesso ao perfil do navegador ou ao dispositivo. Em computadores compartilhados, exporte o que precisar e use **Reverter alterações locais** ou **Limpar Modo Editor** ao terminar.

O Scriptz não possui autenticação, autorização por perfil, criptografia de ponta a ponta ou trilha de auditoria. Uma senha apenas na interface não protegeria efetivamente os dados. Caso seja necessário controlar quem acessa, altera ou audita os modelos, o projeto deverá evoluir para uma arquitetura com servidor, login institucional, permissões e logs de ação.

## Manutenção recomendada

Mantenha o repositório com autenticação em dois fatores, proteção da branch principal e revisão de alterações. Antes de publicar um novo template oficial, execute as regressões do projeto. Uma etapa futura recomendada é remover manipuladores HTML inline e aplicar uma Content Security Policy restritiva por meio do provedor de hospedagem.

## Referências

- [OWASP — Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP — File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP — HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)

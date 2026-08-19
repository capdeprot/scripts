# Validação da versão v48

Esta versão foi validada com os templates institucionais deliberadamente vazios. Os scripts usados nos testes foram temporários e mantidos apenas no armazenamento local do navegador.

| Cenário | Resultado observado |
|---|---|
| Primeiro paint | Em perfis limpos desktop e mobile, a jornada inicial foi a primeira superfície visível. A interface principal não apareceu antes dela. |
| Jornada inicial | Após a boas-vindas, a tela SMUL · CAP exibiu DEPROT, DPCI, DPD, Núcleo, Sala Arthur Saboya e o link para o Modo Editor. |
| Unidades | DEPROT, DPCI, DPD, Núcleo e Sala Arthur Saboya carregaram seus JSONs-base vazios sem recorrer ao JSON legado. |
| Modo Editor | Abriu vazio, permanece disponível na jornada e no dropdown e mantém ações próprias dentro do menu Ações. |
| Editor rico | A criação passou a oferecer negrito, itálico, sublinhado, lista e links. HTML colado preservou formatação segura e removeu conteúdo inseguro. |
| Persistência | O script criado com negrito, itálico e lista permaneceu formatado na prévia e no estado local após salvar. |
| Ações | O menu inicia recolhido. No Modo Editor, mostra base padrão, exportação e reinício; em unidades padrão, mostra exportação e reversão local. |
| Exportação | O Modo Editor exporta `meus-scriptz.json`; unidades seguem gerando `scriptz-standard-changes` sem templates, tema ou assinatura. |
| Mobile | Criação rica, edição e saudação foram validadas em 320px e 375px, sem rolagem horizontal. A jornada de unidades foi inspecionada em 375px. |
| PWA | O service worker `scriptz-shell-v48` ficou ativo e incluiu os cinco JSONs-base, inclusive Sala Arthur Saboya. |
| Retorno diário — desktop | Em um perfil com contexto existente e tema Dark Purple, o gate diário ocultou a interface principal, aplicou o tema antes da inicialização e mostrou a mesma recepção institucional do primeiro acesso. |
| Retorno diário — mobile | Em 375px, com Blue Midnight, a recepção institucional diária permaneceu centralizada, legível e sem rolagem horizontal. |
| Encerramento diário | Após o tempo de exibição, o gate foi removido, a tela de boas-vindas foi ocultada, a interface voltou a ficar visível e a data local foi persistida em `scriptz_daily_welcome_date`. |
| Inspeção visual | As capturas estabilizadas de Dark Purple em desktop e Blue Midnight em mobile confirmaram hierarquia, contraste, marca e centralização adequados. |

## Checagens técnicas

`js/app.js`, `sw.js` e os scripts de validação passaram pela verificação de sintaxe do Node.js. Todos os JSONs da pasta `templates/` foram analisados como JSON válido. Os fluxos de criação, edição, seleção de contexto e PWA foram executados sem erros de JavaScript observados no console.

Para o retorno diário, `tools/daily-welcome-test.mjs` executou dois perfis limpos por Chromium headless: **1280×720 com Dark Purple** e **375×812 com Blue Midnight**. Em ambos os cenários, o teste confirmou o gate, o tema aplicado, a visibilidade da mesma recepção institucional do primeiro acesso, a ocultação da interface, a transição de encerramento e o registro da data. As imagens correspondentes ficam em `screenshots/daily-welcome-v48/` durante a validação local.

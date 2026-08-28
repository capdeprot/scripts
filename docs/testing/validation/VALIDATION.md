# Validação da versão v51

Esta versão foi validada com a base institucional de **DEPROT** incorporada. Os demais templates institucionais permanecem deliberadamente vazios; scripts de teste adicionais foram temporários e mantidos apenas no armazenamento local do navegador.

| Cenário | Resultado observado |
|---|---|
| Primeiro paint | Em perfis limpos desktop e mobile, a jornada inicial foi a primeira superfície visível. A interface principal não apareceu antes dela. |
| Jornada inicial | Após a boas-vindas, a tela SMUL · CAP exibiu DEPROT, DPCI, DPD, Núcleo, Sala Arthur Saboya e o link para o Modo Editor. |
| Unidades | DEPROT carregou 10 scripts institucionais protegidos em 5 categorias; DPCI, DPD, Núcleo e Sala Arthur Saboya permaneceram com JSONs-base vazios, sem recorrer ao JSON legado. |
| Modo Editor | Abriu vazio, permanece disponível na jornada e no dropdown e mantém ações próprias dentro do menu Ações. |
| Editor rico | A criação passou a oferecer negrito, itálico, sublinhado, lista e links. HTML colado preservou formatação segura e removeu conteúdo inseguro. |
| Persistência | O script criado com negrito, itálico e lista permaneceu formatado na prévia e no estado local após salvar. |
| Ações | O menu inicia recolhido. No Modo Editor, mostra base padrão, exportação e reinício; em unidades padrão, mostra exportação e reversão local. |
| Exportação | O Modo Editor exporta `meus-scriptz.json`; unidades seguem gerando `scriptz-standard-changes` sem templates, tema ou assinatura. |
| Mobile | Criação rica, edição e saudação foram validadas em 320px e 375px, sem rolagem horizontal. A jornada de unidades foi inspecionada em 375px. |
| PWA | O service worker `scriptz-shell-v51` ficou ativo e incluiu os cinco JSONs-base, inclusive Sala Arthur Saboya. |
| Retorno diário — desktop | Em um perfil com contexto existente e tema Dark Purple, o gate diário ocultou a interface principal, aplicou o tema antes da inicialização e mostrou a mesma recepção institucional do primeiro acesso. |
| Retorno diário — mobile | Em 375px, com Blue Midnight, a recepção institucional diária permaneceu centralizada, legível e sem rolagem horizontal. |
| Encerramento diário | Após o tempo de exibição, o gate foi removido, a tela de boas-vindas foi ocultada, a interface voltou a ficar visível e a data local foi persistida em `scriptz_daily_welcome_date`. |
| Inspeção visual | As capturas estabilizadas de Dark Purple em desktop e Blue Midnight em mobile confirmaram hierarquia, contraste, marca e centralização adequados. |
| Duas categorias | Um script foi criado com **Atendimento** e **Fiscalização**, salvo novamente com **Atendimento** e **Geral**, e exibido nos filtros laterais das duas categorias. |
| Persistência e importação | A lista `cats` com duas entradas foi preservada no armazenamento local e carregada novamente pelo fluxo de importação, mantendo `cat` como categoria principal legada. |
| Ordenação | A interface apresenta somente Ordem personalizada e Ordem alfabética. A personalizada abriu como padrão; enquanto a edição estava ativa, o seletor, a reordenação de scripts e a reordenação de categorias ficaram bloqueados. |
| Modal de criação | Desktop e mobile confirmaram rolagem no modal e no corpo do editor, dois dropdowns de categoria e ações finais acessíveis. |
| Padrão DEPROT | O JSON enviado foi convertido para `scriptz-standard-template`; seus 10 scripts e 5 categorias carregaram como institucionais, sem edição permitida. O script “Envio de guia - Alvará de Autorização” manteve os dois vínculos de categoria. |
| Nomenclaturas | Ações exibiu “Exportar meus scriptz” e “Usar script padrão como base”; o rótulo da criação foi reduzido para “Texto”. |
| Indicador padrão | Cada um dos 10 scripts institucionais de DEPROT recebeu apenas um cadeado SVG dourado, de baixa densidade visual. O elemento tem tooltip e descrição acessível “Script padrão protegido”; nenhum selo textual permaneceu. |

## Checagens técnicas

`js/app.js`, `sw.js` e os scripts de validação passaram pela verificação de sintaxe do Node.js. Todos os JSONs da pasta `templates/` foram analisados como JSON válido. Os fluxos de criação, edição, seleção de contexto e PWA foram executados sem erros de JavaScript observados no console.

Para o retorno diário, `tools/daily-welcome-test.mjs` executou dois perfis limpos por Chromium headless: **1280×720 com Dark Purple** e **375×812 com Blue Midnight**. Em ambos os cenários, o teste confirmou o gate, o tema aplicado, a visibilidade da mesma recepção institucional do primeiro acesso, a ocultação da interface, a transição de encerramento e o registro da data. As imagens correspondentes ficam em `screenshots/daily-welcome-v48/` durante a validação local.

Para a revisão v49, `tools/multicategory-v49-test.mjs` validou criação, edição, persistência e importação com duas categorias, além do bloqueio de ordenação durante edição. `tools/mobile-creation-v49-test.mjs` confirmou em 375×812 a pilha dos dois dropdowns, a rolagem do modal e do editor e a presença das ações finais.

Na v50, `tools/validate-deprot-standard.mjs` confirmou o esquema, a unidade, as cinco categorias e os vínculos de categoria do template convertido. `tools/deprot-v50-integration-test.mjs` abriu o contexto DEPROT em Chromium headless e confirmou os dez scripts protegidos, o vínculo duplo, a proibição de edição e os três novos rótulos da interface.

Na v51, o mesmo teste confirmou 10 cadeados SVG, zero selos legados, o tooltip e o `aria-label` com “Script padrão protegido”. A inspeção visual registrada em `tools/v51-standard-lock-visual-inspection.md` confirmou contraste e discrição no tema Blue Midnight.

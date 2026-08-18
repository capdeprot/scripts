# Validação da arquitetura de modos

Esta versão foi validada em navegador com os templates de divisão deliberadamente vazios. Os testes usaram dados temporários apenas no armazenamento local e foram removidos ao final da validação.

| Cenário | Resultado observado |
|---|---|
| Primeiro acesso | A mensagem de boas-vindas aparece suavemente e, após a permanência prevista, apresenta CAP e Modo Livre. |
| CAP e divisões | DEPROT, DPCI, DPD e Coord. carregam seus arquivos JSON vazios sem recorrer ao JSON legado. |
| Modo Livre | Abre vazio, disponibiliza base editável, descarte de templates e novo projeto. |
| Persistência | Um script criado em DEPROT permaneceu disponível após recarregar a página e não foi carregado no Modo Livre. |
| Proteção | Um Script Padrão temporário exibiu editar e excluir desativados; a função de edição também recusou uma chamada direta. |
| Importação | Arquivos de divisão diferente foram recusados; categorias inexistentes foram direcionadas para Geral; alterações padrão foram recusadas no Modo Livre. |
| Exportação | Projetos livres usam `scriptz-free-project`; divisões usam `scriptz-standard-changes` e excluem scripts padrão, tema e assinatura. |
| Desempenho | 300 cards padrão foram renderizados em aproximadamente 98 ms; 500 cards livres, em aproximadamente 277 ms. |
| PWA | O service worker `scriptz-shell-v44` ficou ativo e armazena os quatro arquivos JSON-base. |
| Saudação configurável | Criação com `Prezado(a),`, edição para Desabilitar, prévia ao vivo e persistência após recarregar foram confirmadas. Scripts antigos mantêm o comportamento automático ou desabilitado conforme `hasGreeting`. |
| Mobile | Jornada inicial aprovada em 320px, 375px e 430px. Criação, edição, remoção de saudação e persistência validadas em 320px e 375px, sem rolagem horizontal. |
| Primeiro paint | Em perfis limpos desktop e mobile, o gate de onboarding ocultou a interface principal e exibiu a jornada inicial antes de qualquer superfície do sistema. Contextos já salvos continuam abrindo diretamente a aplicação. |

## Checagens técnicas

`js/app.js` e `sw.js` passaram pela verificação de sintaxe do Node.js. Todos os JSONs da pasta `templates/` foram analisados como JSON válido. Não foram registrados erros no console do navegador durante os fluxos testados.

# Correção da cópia em Meus Scriptz

## Sintoma

Em determinadas instalações que utilizavam **Meus Scriptz** depois de um novo commit, o botão **Copiar** podia copiar o conteúdo de um modelo padrão diferente do script pessoal selecionado.

## Causa confirmada

No contexto **Scriptz Padrão**, a aplicação mantém os modelos institucionais e os scripts pessoais no mesmo array global `scripts`. Os dois grupos podiam possuir o mesmo ID numérico, especialmente porque IDs criados localmente começavam em uma faixa que também existia nos templates padrão.

A resolução antiga usava apenas `scripts.find(script => script.id === id)`. Como os scripts padrão eram inseridos primeiro no array, a primeira ocorrência com aquele ID era o modelo institucional. Assim, o card visual de **Meus Scriptz** mostrava um título pessoal, mas a função de cópia recuperava o objeto padrão com o mesmo número.

O problema não era causado pelo conteúdo salvo no navegador estar apontando para outro arquivo, nem pelo commit alterar o JSON local. Tratava-se de uma colisão de identidade durante a resolução do objeto em memória. O commit e a atualização do PWA podiam tornar o sintoma mais perceptível porque o template padrão era recarregado, mas não eram a origem lógica da troca.

## Correção

Cada card agora informa explicitamente sua origem por meio de `data-source`, com os valores `standard` ou `user`. As ações delegadas de copiar, editar, excluir, favoritar, abrir e reordenar recebem essa origem junto do ID.

A função `resolveScriptByIdentity()` só aceita o script cujo ID e origem correspondem ao card acionado. A exclusão também foi ajustada para remover apenas a ocorrência da biblioteca correta. O modal de assinatura preserva a mesma identidade durante a confirmação, evitando que a segunda etapa da cópia perca a referência original.

A correção é compatível com os dados locais existentes: não é necessário apagar o `localStorage`, recriar scripts ou importar novamente o JSON.

## Reprodução e validação

O teste `tools/copy-collision-regression.mjs` cria deliberadamente um modelo padrão e um script pessoal com o mesmo ID. Antes da correção, a busca somente por ID encontra o título `Enviando Guia - Padrão`. Com a correção, a cópia contém exclusivamente `Conteúdo pessoal correto.` e o card acionado informa `data-source="user"`.

A regressão também foi executada junto dos testes de subcategorias e de validação do DEPROT. O teste de subcategorias terminou com `valid: true`; o novo teste terminou com `reproducedPreviousBug: true` e `fixed: true`.

## Atualização do PWA

A correção foi versionada como **Scriptz 1.0.0 · build 97**. O nome do cache do service worker foi incrementado para `scriptz-shell-v97`, reduzindo a possibilidade de uma instalação continuar usando o JavaScript anterior. Em uma instalação já aberta, é recomendável fechar as abas antigas e reabrir o endereço depois da atualização para permitir a ativação do novo service worker.

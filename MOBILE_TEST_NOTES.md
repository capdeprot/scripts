# Validação mobile v42

## Capturas da jornada inicial — 320px

- A abertura de boas-vindas mantém o logotipo e a wordmark centralizados, sem cortes ou rolagem horizontal visível.
- Após a transição, o cartão de escolha permanece dentro da viewport de 320 × 700px. Os botões CAP e Modo Livre ficam empilhados, legíveis e com áreas de toque adequadas.

## Capturas da jornada inicial — 375px e 430px

- Em 375 × 812px, o cartão, tipografia e botões preservam contraste e espaçamento; não há sobreposição visual.
- Em 430 × 932px, a estrutura usa a largura adicional sem exagerar o cartão e mantém o botão principal em uma única linha.

## Fluxo de criação e edição — 375px

- O modal de criação se mantém dentro da viewport. O seletor de saudação ocupa 311 × 36px e apresenta Desabilitar, a saudação automática do horário e Prezado(a).
- O editor mostra o seletor de 180 × 34px sem transbordamento horizontal. A prévia exibiu corretamente Prezado(a), e a alteração para Desabilitar persistiu após recarregar.
- Foi observado apenas um refinamento visual: o texto do seletor de ordenação do cabeçalho é truncado em 375px. O controle segue utilizável, mas o rótulo será encurtado na interface mobile para melhorar a leitura.

## Correção e repetição dos testes

- A versão v43 encurta os rótulos de ordenação somente abaixo de 480px: Título, Categoria, Data e ✨ Manual. A ação e os valores de ordenação permanecem inalterados.
- Em 375px, o cabeçalho corrigido exibe Título integralmente, sem transbordamento horizontal.
- Em 320 × 700px, o dropdown de criação mede 256 × 36px, mostra as três opções e o fluxo de criação, edição e persistência permanece funcional sem rolagem horizontal.

## Primeiro paint da jornada inicial — v44

- Em uma sessão limpa de desktop, o gate de onboarding já estava ativo no primeiro paint: a interface principal permaneceu oculta e a tela de boas-vindas foi a única superfície visível.
- Em uma sessão limpa mobile de 375 × 812px, foi observado o mesmo comportamento. Não houve exibição da sidebar, cards ou controles do sistema antes da jornada.

## Editor rico e Modo Editor — v46

- Em 320px, o modal de criação mantém a barra de formatação, saudação e uma área de conteúdo ampliada. A altura do formulário exige rolagem vertical, sem criar rolagem horizontal, o que preserva os alvos de toque e a leitura.
- Em 375px, o editor de scripts existentes exibe controles de negrito, itálico, sublinhado, links e lista, além de texto ampliado. A prévia manteve negrito e itálico depois da criação e da edição.
- Os rótulos compactos de ordenação seguem sem transbordamento em telas estreitas e a nova jornada de unidades permanece acessível pelo fluxo mobile.

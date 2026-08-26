# Investigação do seletor inicial de categoria — v90

Na reprodução da tela inicial do Modo Editor, o seletor `#newCategoryPrimary` recebeu as opções esperadas e não possuía o atributo HTML `hidden`. Ainda assim, o navegador mobile o calculou como `display: none` e com dimensões nulas. A correção deve priorizar uma regra explícita de exibição para o estado de seleção inicial, inclusive dentro do breakpoint mobile.

A regra `.new-script-modal #newCategoryPrimary { display: none; }` foi substituída por uma versão condicional ao atributo `hidden`. Depois da correção, a reprodução no navegador confirmou `display: block`, largura de 601px, altura de 33px e duas opções disponíveis: o placeholder obrigatório e a categoria existente.

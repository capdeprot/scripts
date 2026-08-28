# Validação v54 — Botão superior e subcategoria vazia

**Data:** 20 de agosto de 2026  
**Escopo:** Refinamento do botão superior **Novo script** e disponibilização da criação na tela vazia de subcategorias.

## Revisão visual desktop

A captura `screenshots/scriptz-v54-empty-subcategory-desktop.png` confirma que uma subcategoria vazia exibe o retorno à categoria principal e um único botão destacado **Criar script**. O botão superior **Novo script** não é exibido nesse contexto vazio. O layout preserva o padrão visual dos dois caminhos de criação das categorias vazias, sem oferecer criação de uma nova subcategoria dentro de outra subcategoria.

A captura `screenshots/scriptz-v54-empty-subcategory-mobile.png` confirma a mesma regra em smartphone: o controle superior de adição fica ausente, o retorno permanece visível e o botão destacado de criar script ocupa uma área de toque ampla, sem extravasamento horizontal.

Após corrigir a precedência do estilo responsivo sobre o atributo `hidden`, as duas capturas confirmam que o botão superior não é renderizado em uma subcategoria vazia. O mesmo teste automatizado passou a validar a visibilidade computada do elemento, além do seu atributo HTML.

## Regressão automatizada

O teste automatizado confirma que o botão superior fica oculto em categorias e subcategorias vazias, torna-se visível após a existência de scriptz diretos no contexto e que o botão destacado de uma subcategoria vazia abre o formulário com a subcategoria previamente vinculada.

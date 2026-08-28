# Validação v53 — Criação contextual de scriptz

**Data:** 20 de agosto de 2026  
**Escopo:** Disponibilidade contextual do botão **Novo script** e formulário de criação com classificação principal vinculada automaticamente.

## Resultado

| Verificação | Resultado |
|---|---|
| Sintaxe de `js/app.js` | Aprovada com `node --check` |
| Regressão automatizada | Aprovada (`valid: true`) |
| Botão oculto em “Todos os scriptz” | Aprovado |
| Botão oculto em categoria com subcategorias | Aprovado |
| Botão visível em categoria/subcategoria pessoal sem filhas | Aprovado |
| Botão oculto em Modelos Padronizados | Aprovado |
| Formulário sem seletor principal interativo | Aprovado |
| Vínculo principal indicado como texto | Aprovado |
| Segunda classificação sem ações de criação | Aprovado |
| Validação desktop | Aprovado |
| Validação mobile | Aprovado |

## Revisão visual

As capturas em `screenshots/scriptz-v53-contextual-form-desktop.png` e `screenshots/scriptz-v53-contextual-form-mobile.png` confirmam que o modal apresenta a categoria ou subcategoria de contexto em um indicador destacado, mantém somente a seleção secundária e conserva a área de edição, os comandos de formatação e os botões de ação visíveis. No smartphone, os campos permanecem empilhados, legíveis e sem extravasamento horizontal.

## Cenários automatizados adicionados

O teste `tools/subcategories-v52-test.mjs` passou a confirmar a ocultação do botão nas visões gerais, em categorias-pai e na biblioteca padrão; a exibição em categorias pessoais terminais; o campo principal oculto; o texto do vínculo correto; a ausência de criação de categoria no seletor secundário; e a rejeição de tentativas de salvar em categoria diferente do contexto aberto.

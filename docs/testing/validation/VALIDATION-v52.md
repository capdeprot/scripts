# Validação v52 — Subcategorias

## Escopo validado

A validação automatizada confirmou a criação contextual de subcategorias, a presença exclusiva de categorias principais na barra lateral, o retorno de uma subcategoria à sua categoria principal e o filtro restrito de cada ramo. A mesma execução verificou a persistência local, a exportação e a reimportação do objeto `categoryParents`, mantendo compatibilidade com as duas classificações por Scriptz e com o campo legado `cat`.

Também foi validado que a exclusão de uma categoria principal move apenas os scripts diretamente vinculados a ela para `Geral` e transforma suas subcategorias em categorias principais. A ordenação continua bloqueada durante a edição e o editor é carregado sob demanda para reduzir o custo de renderização em listas extensas.

| Indicador | Resultado |
|---|---:|
| Scripts renderizados no cenário de carga | 500 |
| Tempo de renderização medido | 157,2 ms |
| Altura mínima do controle de expansão no mobile | 40 px |
| Overflow horizontal em 390 px | Não identificado |
| Compatibilidade da regressão de duas categorias | Aprovada |

## Revisão visual

No desktop, o painel de gerenciamento apresentou somente categorias principais, enquanto a área principal apresentou a relação entre cada categoria e suas subcategorias. No mobile, os cartões exibiram a hierarquia sem corte horizontal, e os controles contextuais mantiveram dimensões adequadas para toque.

Os artefatos de apoio estão em `/home/ubuntu/screenshots/subcategories-v52-desktop.png`, `/home/ubuntu/screenshots/subcategories-v52-mobile.png` e `/home/ubuntu/screenshots/subcategories-v52-results.json`.

## Revisão de navegação simplificada

Após a revisão de interface, a sidebar voltou a conter exclusivamente as categorias principais. A escolha de uma categoria com subcategorias exibe, no topo da área principal, uma faixa com opções de tamanho uniforme, contagem e acesso direto para cada subcategoria. A tela principal validada não apresentou sobreposição entre a navegação, o seletor de ordenação e o botão de novo script.

O painel de gerenciamento passou a utilizar uma grade estável para o nome, contexto, indicador e ações de cada categoria. Dessa forma, os controles não disputam a mesma área horizontal e permanecem legíveis em diferentes larguras.

Na revisão visual mais recente, a área principal apresentou as subcategorias em cartões com hierarquia legível no desktop e no mobile. O painel de gerenciamento manteve os indicadores e as ações na mesma linha; o campo de criação foi ampliado para uma linha própria, deixando o seletor de vínculo e o botão de adição em uma segunda linha mais equilibrada.

## Revisão de hierarquia contextual

A sidebar passou a usar uma lista de categorias principais com símbolo, rótulo, contador e indicador de navegação, sem expor subcategorias. Ao abrir uma categoria principal sem scriptz diretos, a área principal apresenta o rótulo **Subcategorias**, uma grade fixa de duas colunas e os controles de criação, renomeação, exclusão e reordenação do ramo selecionado. A tela não exibe a frase “Escolha uma subcategoria”.

Na amostra desktop, três subcategorias foram distribuídas em duas na primeira linha e uma na segunda. A categoria principal permaneceu visualmente separada da gestão contextual, e os controles de inclusão foram apresentados abaixo da grade sem concorrência com os cartões existentes.

## Classificação obrigatória e início de categoria vazia

Os testes confirmaram que um script sem categoria ou subcategoria selecionada não é salvo. Para uma categoria principal vazia, a área principal apresenta dois caminhos destacados: **Criar script**, que abre o formulário já associado à categoria principal, e **Criar subcategoria**, que abre o campo de criação contextual. Após um script direto ser criado, a categoria não aceita subcategorias; após a criação da primeira subcategoria, a categoria principal deixa de aparecer como opção direta de classificação.

Na revisão visual, os dois caminhos ficaram lado a lado no desktop e empilhados no mobile, com textos explicativos e alvos de toque amplos. As duas versões preservaram a hierarquia visual Blue Midnight e não apresentaram corte horizontal.

## Bibliotecas separadas no Scriptz Padrão

A revisão visual confirmou duas áreas expansíveis na sidebar do Scriptz Padrão: **Modelos Padronizados** e **Meus Scriptz**. A primeira apresenta somente navegação e reordenação local de subcategorias e scripts, sem botões de criação, edição ou exclusão. A segunda mantém seus próprios modelos e oferece, na própria sidebar, ações visíveis de criar, renomear, excluir e reordenar categorias principais.

Os conteúdos pessoais permaneceram isolados dos modelos institucionais tanto na lista principal quanto nas categorias exibidas. No modo pessoal, os controles de categoria ficaram próximos aos itens que alteram, evitando a etapa adicional do menu de gerenciamento.

Em desktop, a biblioteca institucional exibiu somente a navegação dos modelos e suas subcategorias, enquanto a biblioteca pessoal ficou recolhida até ser selecionada. Em smartphone, o conteúdo pessoal permaneceu legível sem overflow; os controles de gestão são acessados na sidebar móvel ao abrir a seção **Meus Scriptz**.

## Abertura da área principal

Na abertura, a lista automática de scriptz e seus controles permanecem ocultos. A área principal mostra somente o ícone oficial de envelope, centralizado e dimensionado para cada tela. A navegação por categoria, subcategoria, busca ou biblioteca encerra esse estado inicial e apresenta o conteúdo correspondente. A revisão visual confirmou o comportamento no desktop e no smartphone.

Após o ajuste de centralização, a área de abertura passou a ocupar toda a largura disponível depois da sidebar, sem manter a largura máxima usada pela lista de scriptz. O ícone foi reduzido em 50% — até 94 px no desktop e 63 px no mobile — e a remoção do cabeçalho invisível eliminou o deslocamento vertical anterior.

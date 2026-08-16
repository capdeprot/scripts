# Scriptz — Gerenciador de modelos de e-mail

O **Scriptz** é uma aplicação web local para organizar, consultar, editar e reutilizar scripts e modelos de texto. A ferramenta foi adaptada à identidade visual Scriptz e funciona sem backend obrigatório: os dados iniciais ficam em `scriptz.json` e as alterações do usuário são persistidas no navegador.

## Funcionalidades atuais

| Área | Recursos disponíveis |
| --- | --- |
| Consulta | Cards expansíveis com título, categoria, ações rápidas e pré-visualização do conteúdo. |
| Busca | Pesquisa por título, categoria ou conteúdo do script em tempo real. |
| Favoritos | Visão própria em **Visão geral**, logo abaixo de **Todos**, com contador e filtro exclusivo. |
| Prioridade | Favoritos aparecem antes dos demais scripts em todas as visões e categorias, independentemente do critério secundário escolhido. |
| Ordenação | Ordenação por título, categoria, data de criação ou ordem personalizada. A opção de ordenar por favoritos foi removida porque Favoritos é uma visão independente. |
| Categorias | Criação, seleção, renomeação, exclusão e reordenação por arrastar e soltar. |
| Edição | Editor rich text com negrito, itálico, sublinhado, listas e links, além de pré-visualização ao vivo. |
| Cópia | Copia o script com formatação HTML quando disponível e usa texto simples como fallback, mantendo o card aberto. |
| Saudação | Insere automaticamente “Bom dia”, “Boa tarde” ou “Boa noite” conforme o horário. |
| Assinatura | Permite definir o nome do usuário e inserir a assinatura nos scripts. |
| Criação | Criação de novos scripts com título, categoria, texto, saudação e assinatura opcionais. |
| Importação | Importação de JSON por seleção de arquivo ou arrastar e soltar. |
| Exportação | Exportação dos dados atuais no arquivo `scriptz.json`. |
| Temas | Modo escuro como padrão e modo claro alternável, ambos com paleta coerente com a identidade Scriptz. |
| Persistência | Armazenamento local de scripts editados, tema, assinatura, favoritos e ordem de categorias. |

## Identidade visual

O modo escuro é o tema inicial quando não existe uma preferência salva no navegador. Ele utiliza navy profundo, superfícies elevadas, bordas azuladas e acentos em azul-cobalto.

O cabeçalho combina um símbolo transparente com a wordmark `scriptz` renderizada como texto real em Rajdhani negrito e itálico. O símbolo é dimensionado para acompanhar visualmente a altura-x da wordmark. O modo claro mantém a mesma hierarquia visual, substituindo as superfícies escuras por tons branco-azulados e texto navy.

A tela de edição possui uma superfície contrastante dentro do card, indicador visual `EDITANDO`, barra de ferramentas própria e foco destacado no campo editável. Isso diferencia edição e leitura sem abandonar a paleta Scriptz.

## Como executar localmente

Como a aplicação carrega `scriptz.json` com `fetch`, recomenda-se executá-la por HTTP local em vez de abrir diretamente com `file://`.

```bash
python3 -m http.server 4173
```

Depois, acesse `http://localhost:4173/` no navegador.

## Uso da interface

Na tela inicial, clique no cabeçalho de um card para expandir ou recolher o script. O botão **Copiar** copia o conteúdo e mantém o card aberto. O botão **Editar** abre o editor interno; depois de salvar ou cancelar, o usuário retorna ao card. A estrela alterna o favorito sem recolher o card.

A seção **Visão geral** contém **Todos** e **Favoritos**. **Todos** mostra os scripts disponíveis, enquanto **Favoritos** mostra somente os itens marcados. As categorias aparecem abaixo dessas duas visões.

O campo de busca filtra títulos, categorias e conteúdo. O seletor de ordenação oferece título, categoria, data de criação e ordem personalizada. Em todos esses casos, os favoritos são apresentados primeiro.

## Gerenciamento de categorias

O botão **Gerenciar categorias** abre o painel de administração das categorias. Nesse painel é possível adicionar categorias, renomeá-las, excluir categorias vazias ou reorganizar sua ordem. A ordem personalizada também pode ser iniciada pelo botão de reordenação da barra lateral.

## Criação e edição de scripts

Para criar um script, clique em **Novo script**, informe título e categoria e escreva somente o corpo do texto. A saudação e a assinatura são adicionadas automaticamente quando suas opções estão ativas.

Para editar um script existente, clique em **Editar**. O editor permite alterar título, categoria, conteúdo, saudação e assinatura. O conteúdo é armazenado em HTML para preservar formatação, links e listas.

## Importação e exportação

A aplicação importa arquivos JSON por meio do botão de upload ou da área de arrastar e soltar. O arquivo deve conter um array de scripts com, pelo menos, título, categoria e conteúdo.

A exportação baixa os dados atuais no arquivo `scriptz.json`. Recomenda-se exportar periodicamente as alterações, pois o armazenamento local pertence ao navegador e pode ser perdido quando os dados do site forem removidos.

## Estrutura dos dados

O arquivo inicial é `scriptz.json`. Cada item pode conter os campos abaixo:

| Campo | Tipo | Finalidade |
| --- | --- | --- |
| `id` | número | Identificador do script. |
| `title` | texto | Título exibido no card. |
| `cat` | texto | Categoria do script. |
| `html` | texto | Conteúdo do script em HTML. |
| `hasGreeting` | booleano | Ativa ou desativa a saudação automática. |
| `hasSignature` | booleano | Ativa ou desativa a assinatura automática. |
| `isFavorite` | booleano | Define se o script pertence à visão Favoritos e recebe prioridade. |

## Persistência local

As alterações são mantidas no `localStorage` do navegador. Entre as preferências armazenadas estão o tema visual, o nome da assinatura, os scripts editados, os favoritos e a ordem personalizada das categorias.

O botão **Resetar alterações locais** remove as alterações locais dos scripts e recarrega a base original de `scriptz.json`. Antes de usar essa opção, exporte os dados caso existam alterações importantes ainda não salvas em arquivo.

## Estrutura do projeto

```text
.
├── assets/
│   ├── logo_scriptz_empilhado_negrito_italico_atualizado.png
│   ├── logo_scriptz_negrito_italico_recortado.png
│   └── scriptz_icone_branco_transparente.png
├── css/
│   └── style.css
├── js/
│   └── app.js
├── index.html
├── scriptz.json
└── README.md
```

`index.html` contém a estrutura da interface e as referências de fonte e scripts. `css/style.css` concentra layout, responsividade, temas e estados visuais. `js/app.js` implementa a lógica de busca, filtros, categorias, favoritos, edição, cópia, persistência e importação ou exportação. `scriptz.json` contém os modelos iniciais.

## Tecnologias

A aplicação utiliza HTML5, CSS3, JavaScript no navegador, `localStorage` para persistência local e a Clipboard API com fallback para cópia de conteúdo. Não há banco de dados, autenticação ou API externa necessários para as funções principais.

## Observações de segurança e backup

Os scripts podem conter informações internas ou sensíveis. Mantenha os arquivos JSON em local seguro e evite publicá-los em repositórios públicos sem revisar o conteúdo. Como a persistência é local, o backup por exportação é a forma recomendada de preservar alterações entre navegadores ou dispositivos.

## Licença e uso

O projeto é destinado ao uso interno da equipe responsável pelos modelos de atendimento. Ajuste a política de distribuição conforme as regras da organização antes de publicar ou compartilhar a aplicação.

## Favicon e suporte mobile

O projeto inclui o favicon Scriptz adaptativo em `assets/favicon.svg`, referenciado no `<head>` de `index.html`, com `assets/favicon.png` como fallback. O SVG usa o símbolo branco em fundos escuros e aplica azul-marinho em fundos claros por meio de `prefers-color-scheme`, melhorando o contraste nas abas do navegador.

A interface possui layout responsivo para telas menores. Em tablets e celulares, a sidebar passa a ocupar o topo da página, as categorias são reorganizadas em blocos tocáveis, os controles principais ocupam a largura disponível, os cards usam espaçamento compacto e os botões de ação podem ser acessados sem depender de hover. O editor, as barras de formatação, os modais, a área de importação e os campos de assinatura também se adaptam à largura da tela.

O viewport usa `viewport-fit=cover` para melhorar o aproveitamento de telas com recortes e áreas seguras. Recomenda-se testar a aplicação em orientação vertical e horizontal, especialmente ao editar textos longos ou gerenciar categorias.

## Publicação no GitHub Pages

Para publicar em GitHub Pages, mantenha `index.html` no diretório publicado e preserve a estrutura `assets/`. As referências dos favicons são relativas — `assets/favicon.svg`, `assets/favicon.png` e `favicon.ico` na raiz — para funcionar tanto em domínio próprio quanto em URLs de repositório no formato `usuario.github.io/nome-do-repositorio/`. Evite trocar esses caminhos por `/assets/...`, pois o prefixo `/` aponta para a raiz do domínio e pode ignorar a subpasta do repositório.

## Temas e personalização visual

O seletor de tema oferece quatro opções persistentes: **Claro**, **Escuro**, **Azul meia-noite** e **Roxo-escuro**. O tema Azul meia-noite usa a identidade azul profunda atualizada; o tema Roxo-escuro usa como base `#11001C`; o tema Escuro utiliza superfícies quase pretas; e o tema Claro preserva a leitura em superfícies claras. Os estados de cards, edição, inputs, botões, tags, modais e mensagens são recalculados pelos tokens do tema ativo para evitar conflitos de contraste.

A largura da sidebar pode ser ajustada no desktop arrastando a borda direita da barra lateral. O valor é limitado a uma faixa segura e salvo localmente no navegador, sendo restaurado na próxima abertura da aplicação.

## Navegação em smartphones

Em telas móveis, a sidebar funciona como um menu lateral recolhido. O botão **Menu** abre a navegação sobre a tela, e a seleção de uma visão ou categoria fecha o menu automaticamente para mostrar os scripts imediatamente. Os controles principais, cards, ações, editor, modais e áreas de importação foram reorganizados para toque e largura reduzida.

# Scriptz — Gerenciador de modelos de e-mail

O **Scriptz** é uma aplicação web estática para organizar, consultar, editar e reutilizar modelos de e-mail. A aplicação funciona diretamente no navegador, sem backend obrigatório: carrega os dados iniciais de `scriptz.json`, mantém as alterações no armazenamento local e permite exportar ou importar um arquivo completo para transportar a experiência entre dispositivos.

## Funcionalidades

| Área | Recursos |
|---|---|
| Consulta | Cards expansíveis com título, categoria, pré-visualização e ações rápidas. |
| Pesquisa | Busca explicitamente pelo **título do script**, com campo disponível no desktop e pela lupa no mobile. |
| Favoritos | Visão própria abaixo de **Todos**; favoritos também recebem prioridade nas demais visões. |
| Ordenação | Título, categoria, data de criação e **ordem personalizada**. |
| Scripts | Criação, edição, exclusão, cópia formatada, favoritos e mudança de categoria. |
| Categorias | Criação, renomeação, exclusão e reordenação persistente. |
| Ordem personalizada | Ordenação de scripts por categoria; no desktop é possível arrastar cards e no mobile há controles de mover para cima ou para baixo. |
| Editor | Edição rich text com negrito, itálico, sublinhado, listas, links e pré-visualização ao vivo. |
| Edição segura | Apenas um script pode permanecer em edição por vez. O usuário precisa salvar ou cancelar antes de abrir outro. |
| Saudação e assinatura | Opções independentes para saudação automática e assinatura do usuário. A assinatura é atualizada ao sair do campo. |
| Persistência | Scripts, categorias, ordens, favoritos, tema e assinatura são salvos localmente. |
| Importação e exportação | O estado completo pode ser exportado como `scriptz.json` e importado em outro navegador ou dispositivo. |
| PWA | Manifesto, service worker e ícones locais permitem instalação como aplicativo quando o navegador oferecer suporte. |

## Identidade visual e temas

A identidade utiliza o símbolo de envelope da Scriptz e a wordmark `scriptz` renderizada em Rajdhani negrito e itálico. A paleta principal é baseada em **azul meia-noite**; a nomenclatura antiga “navy” não é utilizada como nome de tema.

O seletor oferece quatro temas persistentes:

| Nome | Característica |
|---|---|
| **Claro** | Superfícies claras, contraste escuro e acentos azuis. |
| **Escuro** | Fundo quase preto, com a lua como ícone do tema. |
| **Blue Midnight** | Azul meia-noite como identidade principal da interface. |
| **Dark Purple** | Base roxo-escura, com referência cromática em `#11001C`. |

O padrão inicial é **Blue Midnight** quando não existe preferência salva. A preferência selecionada é armazenada no navegador e também acompanha a exportação JSON.

## Como executar localmente

Como a aplicação carrega `scriptz.json` via `fetch`, ela deve ser executada por HTTP, e não diretamente por `file://`.

```bash
python3 -m http.server 4173
```

Depois, acesse `http://localhost:4173/`. Também é possível utilizar qualquer servidor estático que preserve os caminhos relativos do projeto.

## Uso da interface

Na tela inicial, clique no cabeçalho de um card para expandir ou recolher o conteúdo. **Copiar** mantém o card aberto, e **Favoritar** também preserva o estado aberto. O botão **Editar** abre o editor interno; depois de salvar ou cancelar, o script volta ao fluxo normal.

O campo de pesquisa informa claramente que a busca é feita pelo título do script. No mobile, a busca pode ser aberta pela lupa no cabeçalho. A seção **Visão geral** contém **Todos** e **Favoritos**, seguida pelas categorias disponíveis.

A sidebar é redimensionável no desktop. No mobile, ela funciona como drawer, com navegação por toque, botão para abrir e fechar, backdrop e fechamento automático após a escolha de uma categoria ou visão.

## Gerenciamento de categorias

O botão **Gerenciar categorias** abre o painel de categorias. É possível adicionar uma categoria mesmo que ela ainda não possua scripts, renomear sem confirmar ao clicar novamente no campo, excluir e arrastar para reordenar. A ordem é mantida ao fechar e reabrir o painel, independentemente da ordenação usada para os cards.

Quando uma categoria é renomeada ou excluída, os scripts relacionados são atualizados de acordo com a operação. A criação de um script em uma categoria nova também registra essa categoria de forma persistente.

## Ordenação personalizada de scripts

Selecione **Ordem personalizada** no seletor principal. Cada categoria possui sua própria sequência. Em telas desktop, os cards podem ser arrastados; em telas mobile, os botões de seta movem o script para cima ou para baixo dentro da categoria atual. A ordem é salva localmente e exportada para o JSON.

## Criação e edição de scripts

Para criar um script, clique em **Novo script**, informe título, categoria e corpo, e escolha se a saudação e a assinatura devem ser adicionadas. Na edição de um script existente, os metadados — título, categoria, saudação e assinatura — ficam na área superior do editor, enquanto a barra inferior permanece dedicada às ações **Salvar** e **Cancelar**.

O editor aceita conteúdo HTML para preservar formatação, links e listas. Dois scripts não podem ser editados simultaneamente: é necessário concluir ou cancelar a edição atual antes de abrir outro.

## Persistência local e arquivo `scriptz.json`

O navegador mantém um estado versionado no `localStorage`. Esse estado inclui os scripts atuais, categorias, ordem de categorias, ordem personalizada dos scripts por categoria, favoritos, tema e assinatura.

A exportação gera um arquivo chamado `scriptz.json` com o formato geral abaixo:

```json
{
  "version": 2,
  "scripts": [],
  "categories": [],
  "categoryOrder": [],
  "scriptOrders": {},
  "signature": "",
  "theme": "midnight"
}
```

A importação aceita tanto o formato antigo, baseado diretamente em um array de scripts, quanto o formato completo versionado. Para transportar todas as personalizações, utilize sempre o arquivo exportado pela própria aplicação.

> A persistência local pertence ao navegador. Para mover dados entre dispositivos, exporte `scriptz.json` antes de limpar o armazenamento local ou trocar de navegador.

O botão **Resetar alterações locais** remove as alterações salvas e recarrega a base original de `scriptz.json`. Faça uma exportação antes de utilizar essa função se houver dados importantes.

## Estrutura do projeto

O conteúdo deste projeto deve ser publicado com `index.html` diretamente na raiz do diretório publicado:

```text
.
├── index.html
├── scriptz.json
├── manifest.webmanifest
├── sw.js
├── favicon.ico
├── README.md
├── assets/
│   ├── favicon.svg
│   ├── favicon.png
│   ├── pwa-icon-192.png
│   ├── pwa-icon-512.png
│   └── scriptz_icone_branco_transparente.png
├── css/
│   └── style.css
└── js/
    └── app.js
```

`index.html` concentra a estrutura da interface e usa referências relativas para `css/style.css`, `js/app.js` e os arquivos dentro de `assets/`. `css/style.css` contém tokens de tema, layout, responsividade e estados visuais. `js/app.js` implementa carregamento, busca, categorias, ordenação, edição, favoritos, persistência, importação, exportação e PWA. `scriptz.json` fornece os modelos iniciais.

Os arquivos antigos `app.js`, `style.css`, `favicon.png`, `favicon.svg` e logos soltos na raiz não são necessários quando o `index.html` utiliza a estrutura acima. Os logos de wordmark podem ser mantidos separadamente no kit de identidade visual.

## PWA e instalação como aplicativo

O projeto inclui `manifest.webmanifest`, `sw.js` e ícones locais de 192×192 e 512×512. Em navegadores compatíveis, o botão de instalação pode abrir o prompt nativo. Quando o navegador não disponibiliza esse prompt, ele pode exigir a opção “Adicionar à tela inicial”.

A instalação programática exige que a aplicação seja servida em HTTPS, exceto em `localhost`. GitHub Pages atende a esse requisito. Depois de substituir uma versão já instalada, pode ser necessário desinstalar o aplicativo antigo e instalar novamente para remover o cache do manifesto e do service worker anterior.

## Publicação no GitHub Pages

Para publicar, extraia o conteúdo interno do pacote na raiz do repositório, sem criar uma camada adicional como `scriptz-main-updated/`. O arquivo publicado deve estar em:

```text
https://usuario.github.io/repositorio/index.html
```

Preserve as referências relativas, como `assets/favicon.svg` e `css/style.css`. Não substitua esses caminhos por `/assets/...`, pois o prefixo absoluto pode ignorar o nome do repositório em URLs do GitHub Pages.

Após o commit e a publicação, recarregue a página. Se o projeto já tiver sido instalado como PWA, desinstale a versão antiga antes de testar novamente o manifesto e os ícones atualizados.

## Tecnologias e limitações

A aplicação utiliza HTML5, CSS3, JavaScript no navegador, `localStorage`, `contenteditable`, Clipboard API com fallback, manifesto PWA e service worker. Não há banco de dados, autenticação ou API externa necessários para as funções principais.

Como os dados podem conter informações internas ou sensíveis, revise `scriptz.json` antes de publicá-lo em um repositório público. A distribuição e a política de acesso devem seguir as regras da organização responsável pelos modelos.

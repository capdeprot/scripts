# Scriptz — Gerenciador de modelos de texto

O **Scriptz** é uma aplicação web estática e instalável para organizar, criar, editar e reutilizar modelos de texto. Todo o funcionamento ocorre no navegador: não há backend obrigatório, e os dados de cada contexto permanecem separados no armazenamento local.

## Versão do projeto

A versão oficial atual do Projeto Scriptz é **1.0.0** e o pacote de referência atual é o **build 98**. A versão semântica identifica compatibilidade funcional: correções sem mudança estrutural incrementam o patch; funcionalidades compatíveis incrementam o minor; mudanças incompatíveis no formato JSON, na persistência ou nos fluxos principais incrementam o major. O build é mantido separadamente para rastrear cada pacote distribuído.

Esses valores também estão disponíveis em [`version.json`](version.json), que funciona como fonte simples de metadados para ferramentas e integrações.

## Contextos de uso

No primeiro acesso, a aplicação apresenta uma breve recepção e, em seguida, a tela **SMUL · CAP**, com a orientação **“Escolha sua unidade para acessar modelos padronizados”**. A pessoa usuária pode escolher a unidade que deseja consultar ou acessar o **Modo Editor** pelo link da própria jornada. A escolha também permanece disponível no seletor de contexto da barra lateral.

| Contexto | Uso | Permissões | Exportação |
|---|---|---|---|
| **Scriptz Padrão** | Consulta dos modelos institucionais e criação de conteúdos pessoais dentro de uma unidade. | **Modelos Padronizados** são protegidos; **Meus Scriptz** permanece totalmente editável. | Exporta apenas scripts, categorias e ordenações pessoais. |
| **Modo Editor** | Criação livre de Scriptz, importação de projetos e uso opcional de bases CAP editáveis. | Todos os scripts e categorias são editáveis. | Exporta o projeto completo como `meus-scriptz.json`. |

Tema, assinatura, contexto selecionado e largura da barra lateral são preferências locais. Por isso, não são transportados em JSONs de importação ou exportação.

## Boas-vindas e retorno diário

No primeiro acesso, a aplicação exibe a recepção inicial e a escolha de unidade antes de revelar a interface principal. Em retornos posteriores, a primeira abertura de cada dia exibe a mesma recepção institucional do primeiro acesso antes de continuar para o contexto já selecionado.

| Aspecto | Comportamento |
|---|---|
| Conteúdo | O retorno diário reutiliza apenas a marca institucional **Bem-vindo(a) ao scriptz**, sem saudação por horário ou nome da assinatura. |
| Tema | O fundo e os acentos adotam o tema atualmente salvo: Claro, Escuro, Blue Midnight ou Dark Purple. |
| Frequência | A recepção aparece uma vez por dia em cada navegador, controlada pela chave local `scriptz_daily_welcome_date`. |
| Movimento | As telas surgem e saem com transições de opacidade, deslocamento e escala suaves. Pessoas com redução de movimento ativada recebem transições praticamente instantâneas. |

A interface principal permanece oculta enquanto a jornada de boas-vindas está ativa, evitando que o conteúdo do sistema apareça antes dela. A recepção de retorno se encerra automaticamente após uma breve pausa.

## Unidades do Scriptz Padrão

Os arquivos-base desta distribuição começam vazios e estão prontos para receber modelos institucionais. Cada unidade possui seu próprio contexto local.

| Unidade | Arquivo-base |
|---|---|
| DEPROT | `templates/DEPROT.JSON` — template institucional atualizado no build 98. |
| DPCI | `templates/DPCI.JSON` |
| DPD | `templates/DPD.JSON` |
| CAP-G | `templates/CAP-G.JSON` |
| Núcleo | `templates/SMUL-CAP.JSON` |
| Sala Arthur Saboya | `templates/SALA-ARTHUR-SABOYA.JSON` |

Os scripts provenientes desses arquivos recebem apenas um **cadeado dourado discreto** ao lado do título. Ao passar o mouse sobre ele, a aplicação informa **Script padrão protegido**. Eles não podem ser editados, excluídos ou movidos de categoria. As categorias padrão também não podem ser renomeadas ou excluídas. Scripts, categorias e ordenações criados pela pessoa usuária continuam livres.

> Contextos antigos gravados como `Coord.` são migrados automaticamente para **Núcleo** ao abrir a aplicação.

## Editor rico e criação de Scriptz

O formulário de **Novo script** usa o mesmo editor rico da edição de scripts existentes. A barra oferece negrito, itálico, sublinhado, listas com marcadores e links. A área de criação é ampliada e o texto foi aumentado tanto na criação quanto na edição para facilitar a revisão do conteúdo.

Ao colar conteúdo com formatação, o Scriptz preserva elementos seguros de texto, incluindo parágrafos, negrito, itálico, sublinhado, listas e links. Também reconhece estilos comuns de clipboard para negrito, itálico e sublinhado. Elementos potencialmente inseguros, como scripts e iframes, são removidos antes do salvamento.

O seletor de saudação está disponível nos dois fluxos e oferece **Nenhuma**, uma saudação automática conforme o horário e **Prezado(a),**. A assinatura permanece opcional e é mantida separadamente como preferência local.

### Categorias, subcategorias e rolagem na criação

Cada Scriptz deve ser vinculado obrigatoriamente a **uma ou duas classificações já existentes**, que podem ser categorias principais sem subcategorias ou subcategorias. A criação e a edição apresentam dois dropdowns consistentes: o primeiro define a classificação obrigatória e o segundo é opcional. Ambos permitem criar uma **Nova categoria**, e a interface impede que a mesma classificação seja selecionada duas vezes no mesmo script.

No **Modo Editor**, a sidebar reúne as categorias principais e seus controles visíveis de criar, renomear, excluir e reordenar; não há uma etapa separada para gerenciá-las. Ao selecionar uma categoria principal vazia, a área principal apresenta dois caminhos destacados: **Criar script** ou **Criar subcategoria**. A primeira escolha determina a estrutura daquele espaço. Se o primeiro script for criado diretamente, a categoria não aceita subcategorias; se a primeira subcategoria for criada, os scripts passam a ser organizados dentro delas. A área principal mostra as **Subcategorias** em uma grade de duas colunas e reúne nesse mesmo local as ações de criar, renomear, excluir e reordenar o ramo. A abertura de uma subcategoria oferece um botão para retornar à categoria principal.

No **Scriptz Padrão**, a sidebar é dividida em duas seções expansíveis. **Modelos Padronizados** apresenta exclusivamente as categorias e subcategorias do JSON institucional, sem criação, edição, exclusão ou reordenação de categorias principais. Nessa área, o usuário pode apenas reordenar localmente subcategorias e scripts. **Meus Scriptz** abriga os arquivos importados e os novos conteúdos do usuário, com suas próprias categorias, subcategorias, scripts e controles completos de edição. As duas bibliotecas são filtradas separadamente e não se misturam na navegação ou na lista principal.

Uma categoria principal só pode receber subcategorias quando não possui scriptz diretos. Dessa forma, seus modelos ficam organizados dentro dos ramos criados. Quando uma categoria principal já possui scriptz, a criação de subcategorias é bloqueada para evitar estruturas ambíguas. A ordenação por arraste permanece aplicada às categorias principais e às subcategorias de cada ramo, preservando a relação hierárquica.

O campo principal legado `cat` continua armazenando a primeira classificação para preservar a compatibilidade com projetos anteriores. A nova lista `cats`, limitada a duas entradas, e o objeto `categoryParents`, que relaciona cada subcategoria à sua categoria principal, são salvos localmente e transportados em JSONs de exportação e importação. JSONs de versões anteriores, sem `categoryParents`, continuam válidos e são tratados como estruturas sem subcategorias. O modal de criação e a área de texto possuem rolagem própria, mantendo **Cancelar** e **Adicionar** alcançáveis quando o conteúdo for longo.

## Ações contextuais

Abaixo da assinatura, o menu expansível **Ações** concentra os recursos operacionais. Ele inicia recolhido para reduzir a densidade da barra lateral e mostra apenas os comandos aplicáveis ao contexto.

| Ação | Scriptz Padrão | Modo Editor |
|---|---:|---:|
| Gestão de categorias na sidebar | Sim, em Meus Scriptz | Sim |
| Usar script padrão como base | Não | Sim |
| Exportar meus scriptz | Sim | Sim |
| Limpar Modo Editor | Não | Sim |
| Reverter alterações locais | Sim | Não |

No Modo Editor, **Limpar Modo Editor** apaga todos os scriptz, categorias, subcategorias e ordenações daquele projeto após confirmação. A antiga ação de baixar o JSON e iniciar um novo projeto foi removida.

## Importação e exportação

O Scriptz usa formatos diferentes para impedir a mistura involuntária de dados de contextos incompatíveis.

| Esquema | Gerado por | Pode ser importado em |
|---|---|---|
| `scriptz-standard-changes` | Uma unidade do Scriptz Padrão | Na mesma unidade, dentro de **Meus Scriptz**. |
| `scriptz-free-project` | Modo Editor ou Scriptz Padrão | No Scriptz Padrão, é carregado em **Meus Scriptz**. |
| Array legado | Versões anteriores do Scriptz | Como conteúdo pessoal editável. |

Importações no Scriptz Padrão nunca alteram o conjunto de modelos institucionais. Seus scripts e categorias são carregados somente em **Meus Scriptz** e permanecem separados dos arquivos-base da unidade.

## Limites e produtividade

O Scriptz aceita até **300 scripts por unidade** no Scriptz Padrão e até **500 scripts por projeto** no Modo Editor. A interface oferece busca por título, favoritos, filtros por categoria ou subcategoria, **Ordem alfabética** e **Ordem personalizada**. A Ordem personalizada é o padrão e permite reorganizar scripts e categorias principais; toda alteração de ordenação fica bloqueada enquanto um script estiver em edição.

A edição é exclusiva: enquanto um card estiver em edição, outro script não pode abrir seu editor. A cópia mantém a formatação do texto sempre que o navegador oferecer suporte à área de transferência rica.

## PWA e interface mobile

O aplicativo inclui `manifest.webmanifest`, service worker e ícones próprios. O botão **Instalar Scriptz como app** aciona o prompt nativo quando disponível; em navegadores que não o disponibilizam, a aplicação orienta a adicionar o site à tela inicial.

O cache PWA atual é `scriptz-shell-v98` e inclui os recursos de interface, os ícones e os seis JSONs-base. Em smartphone, um contexto salvo agora abre o menu lateral automaticamente quando a tela inicial do envelope está ativa, mantendo uma rota de navegação imediata. A jornada inicial, a recepção diária institucional, o editor rico, a busca, os controles de contexto e o menu Ações foram adaptados para uso em smartphone. A v59 também reforça a exportação, a persistência da ordenação, a transição de temas e o foco de teclado dos modais. A v60 adota os indicadores ▲ e ▼ nas bibliotecas de Scriptz Padrão, com recolhimento sincronizado do conteúdo. A v61 estende o mesmo padrão a Ações e aos seletores nativos compatíveis. Em telas amplas, a assinatura ocupa o apoio ao lado dos cards; em smartphone, a v64 restaura o mesmo bloco à sidebar, antes de Ações e da importação.

## Estrutura do projeto

```text
assets/                  Ícones, logo e favicons
css/style.css            Temas, layout responsivo, editor rico e menu Ações
js/app.js                Estado, contexto, proteção, editor, persistência e importação
templates/               JSONs-base das seis unidades CAP
index.html                Estrutura da interface, modais e jornada inicial
manifest.webmanifest     Metadados do aplicativo instalável
version.json             Versão oficial e build atual do projeto
  Hierarquia institucional SMUL/CAP e unidades
sw.js                    Cache offline do PWA
```

## Atualização dos scripts padrão

Para publicar modelos institucionais, edite exclusivamente o JSON da unidade correspondente em `templates/`. O formato esperado é:

```json
{
  "schema": "scriptz-standard-template",
  "version": 1,
  "division": "DEPROT",
  "categories": ["Categoria padrão"],
  "categoryParents": { "Subcategoria exemplo": "Categoria padrão" },
  "scripts": [
    {
      "id": 1,
      "cat": "Categoria padrão",
      "title": "Título do modelo",
      "html": "<p>Conteúdo do e-mail.</p>",
      "greetingMode": "auto",
      "hasSignature": true,
      "isFavorite": false
    }
  ]
}
```

Depois de modificar um template, atualize a versão de cache em `sw.js` antes de publicar para que instalações existentes recebam o conteúdo novo. Para a hierarquia institucional preparada, consulte [`docs/INSTITUTIONAL-STRUCTURE.md`](docs/INSTITUTIONAL-STRUCTURE.md) e mantenha os identificadores estáveis de ``.

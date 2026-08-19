# Scriptz — Gerenciador de modelos de e-mail

O **Scriptz** é uma aplicação web estática e instalável para organizar, criar, editar e reutilizar modelos de e-mail. Todo o funcionamento ocorre no navegador: não há backend obrigatório, e os dados de cada contexto permanecem separados no armazenamento local.

## Contextos de uso

No primeiro acesso, a aplicação apresenta uma breve recepção e, em seguida, a tela **SMUL · CAP**. A pessoa usuária pode escolher a unidade que deseja consultar ou acessar o **Modo Editor** pelo link da própria jornada. A escolha também permanece disponível no seletor de contexto da barra lateral.

| Contexto | Uso | Permissões | Exportação |
|---|---|---|---|
| **Scriptz Padrão** | Consulta e personalização local dos modelos de uma unidade. | Os scripts e categorias recebidos do JSON-base são protegidos; dados próprios permanecem editáveis. | Exporta apenas scripts, categorias e ordenações criados localmente. |
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
| DEPROT | `templates/DEPROT.JSON` — base institucional com 10 scripts e 5 categorias. |
| DPCI | `templates/DPCI.JSON` |
| DPD | `templates/DPD.JSON` |
| Núcleo | `templates/SMUL-CAP.JSON` |
| Sala Arthur Saboya | `templates/SALA-ARTHUR-SABOYA.JSON` |

Os scripts provenientes desses arquivos recebem apenas um **cadeado dourado discreto** ao lado do título. Ao passar o mouse sobre ele, a aplicação informa **Script padrão protegido**. Eles não podem ser editados, excluídos ou movidos de categoria. As categorias padrão também não podem ser renomeadas ou excluídas. Scripts, categorias e ordenações criados pela pessoa usuária continuam livres.

> Contextos antigos gravados como `Coord.` são migrados automaticamente para **Núcleo** ao abrir a aplicação.

## Editor rico e criação de Scriptz

O formulário de **Novo script** usa o mesmo editor rico da edição de scripts existentes. A barra oferece negrito, itálico, sublinhado, listas com marcadores e links. A área de criação é ampliada e o texto foi aumentado tanto na criação quanto na edição para facilitar a revisão do conteúdo.

Ao colar conteúdo com formatação, o Scriptz preserva elementos seguros de texto, incluindo parágrafos, negrito, itálico, sublinhado, listas e links. Também reconhece estilos comuns de clipboard para negrito, itálico e sublinhado. Elementos potencialmente inseguros, como scripts e iframes, são removidos antes do salvamento.

O seletor de saudação está disponível nos dois fluxos e oferece **Desabilitar**, uma saudação automática conforme o horário e **Prezado(a),**. A assinatura permanece opcional e é mantida separadamente como preferência local.

### Categorias e rolagem na criação

Cada Scriptz pode ser vinculado a **uma ou duas categorias**. A criação e a edição apresentam dois dropdowns consistentes: o primeiro define a categoria principal e o segundo é opcional. Ambos oferecem a ação **Nova categoria**, e a interface impede que a mesma categoria seja selecionada duas vezes no mesmo script.

O campo principal legado `cat` continua armazenando a primeira categoria para preservar a compatibilidade com projetos anteriores. A nova lista `cats`, limitada a duas entradas, é salva localmente e transportada em JSONs de exportação e importação. O modal de criação e a área de texto possuem rolagem própria, mantendo **Cancelar** e **Adicionar** alcançáveis quando o conteúdo for longo.

## Ações contextuais

Abaixo da assinatura, o menu expansível **Ações** concentra os recursos operacionais. Ele inicia recolhido para reduzir a densidade da barra lateral e mostra apenas os comandos aplicáveis ao contexto.

| Ação | Scriptz Padrão | Modo Editor |
|---|---:|---:|
| Gerenciar categorias | Sim | Sim |
| Usar script padrão como base | Não | Sim |
| Exportar meus scriptz | Sim | Sim |
| Descartar Scriptz e reiniciar Modo Editor | Não | Sim |
| Reverter alterações locais | Sim | Não |

No Modo Editor, **Descartar Scriptz e reiniciar Modo Editor** apaga todos os scripts, categorias e ordenações daquele projeto após confirmação. A antiga ação de baixar o JSON e iniciar um novo projeto foi removida.

## Importação e exportação

O Scriptz usa formatos diferentes para impedir a mistura involuntária de dados de contextos incompatíveis.

| Esquema | Gerado por | Pode ser importado em |
|---|---|---|
| `scriptz-standard-changes` | Uma unidade do Scriptz Padrão | Somente na mesma unidade. |
| `scriptz-free-project` | Modo Editor | Somente no Modo Editor. |
| Array legado | Versões anteriores do Scriptz | Modo Editor, como projeto editável. |

Quando uma importação padrão inclui uma categoria que não está presente no arquivo-base nem no próprio JSON de mudanças, o Scriptz move o item para **Geral** e informa o ajuste.

## Limites e produtividade

O Scriptz aceita até **300 scripts por unidade** no Scriptz Padrão e até **500 scripts por projeto** no Modo Editor. A interface oferece busca por título, favoritos, filtros por categoria, **Ordem alfabética** e **Ordem personalizada**. A Ordem personalizada é o padrão e permite reorganizar scripts e categorias; toda alteração de ordenação fica bloqueada enquanto um script estiver em edição.

A edição é exclusiva: enquanto um card estiver em edição, outro script não pode abrir seu editor. A cópia mantém a formatação do texto sempre que o navegador oferecer suporte à área de transferência rica.

## PWA e interface mobile

O aplicativo inclui `manifest.webmanifest`, service worker e ícones próprios. O botão **Instalar Scriptz como app** aciona o prompt nativo quando disponível; em navegadores que não o disponibilizam, a aplicação orienta a adicionar o site à tela inicial.

O cache PWA atual é `scriptz-shell-v50` e inclui os recursos de interface, os ícones e os cinco JSONs-base. A jornada inicial, a recepção diária institucional, o editor rico, a busca, os controles de contexto e o menu Ações foram adaptados para uso em smartphone.

## Estrutura do projeto

```text
assets/                  Ícones, logo e favicons
css/style.css            Temas, layout responsivo, editor rico e menu Ações
js/app.js                Estado, contexto, proteção, editor, persistência e importação
templates/               JSONs-base das cinco unidades CAP
index.html                Estrutura da interface, modais e jornada inicial
manifest.webmanifest     Metadados do aplicativo instalável
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

Depois de modificar um template, atualize a versão de cache em `sw.js` antes de publicar para que instalações existentes recebam o conteúdo novo.

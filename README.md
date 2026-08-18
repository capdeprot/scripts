# Scriptz — Gerenciador de modelos de e-mail

O **Scriptz** é uma aplicação web estática e instalável que organiza modelos de e-mail em dois contextos independentes: **Scriptz Padrão**, destinado a divisões da CAP com modelos institucionais protegidos, e **Modo Livre**, destinado à criação e gestão integral de projetos pessoais. A aplicação funciona inteiramente no navegador, sem backend obrigatório.

## Modos de uso

No primeiro acesso, o Scriptz exibe uma recepção breve e solicita a escolha entre CAP e Modo Livre. A escolha fica armazenada localmente, assim como o tema, a assinatura e a largura da barra lateral. Esses elementos são preferências da pessoa usuária; portanto, não são incorporados aos JSONs exportados.

| Contexto | Início | Permissões | Exportação |
|---|---|---|---|
| **Scriptz Padrão** | Seleção de DEPROT, DPCI, DPD ou Coord. | Os scripts e categorias do JSON-base são protegidos; dados criados localmente continuam editáveis. | Apenas scripts, categorias e ordenações criados pelo usuário. |
| **Modo Livre** | Projeto vazio. A pessoa usuária pode importar um projeto ou carregar uma base padrão como ponto de partida. | Todos os scripts e categorias são editáveis. | Projeto completo do Modo Livre. |

## Scriptz Padrão

Cada divisão carrega seu próprio arquivo-base na pasta `templates/`. Nesta versão inicial, os arquivos foram criados vazios por decisão de produto; eles estão prontos para receber os modelos oficiais sem necessidade de alterar a aplicação.

| Divisão selecionada | Arquivo-base |
|---|---|
| DEPROT | `templates/DEPROT.JSON` |
| DPCI | `templates/DPCI.JSON` |
| DPD | `templates/DPD.JSON` |
| Coord. | `templates/SMUL-CAP.JSON` |

Os scripts presentes nesses arquivos aparecem com o indicador **🔒 Script padrão**. Neles, os comandos de editar e excluir, bem como título e categoria, ficam bloqueados. As categorias recebidas do arquivo-base também não podem ser renomeadas nem excluídas. A pessoa usuária, contudo, pode criar novas categorias, criar scripts, adicionar seus scripts a categorias padrão ou próprias e ordenar livremente cards e categorias.

> Os JSONs de mudanças do Scriptz Padrão são vinculados à divisão de origem. Um arquivo exportado em DEPROT não é aceito em DPCI, DPD, Coord. ou no Modo Livre.

Ao importar mudanças em uma divisão, qualquer script cujo nome de categoria não exista entre as categorias padrão nem entre as categorias próprias exportadas é movido para **Geral**. O Scriptz informa esse ajuste por mensagem na interface.

## Modo Livre

O Modo Livre começa vazio e não carrega automaticamente nenhum JSON legado. A pessoa usuária pode criar um projeto do zero, importar um projeto livre compatível ou usar um dos JSONs padrão como base editável. Quando uma base é carregada no Modo Livre, seus scripts não recebem bloqueio.

O rodapé da barra lateral oferece três ações próprias desse contexto. **Descartar Templates** remove somente scripts carregados como base. **Baixar JSON e iniciar novo projeto** exporta o projeto atual e reinicia o Modo Livre em branco. **Usar JSON padrão como base** apresenta as quatro divisões para carregamento editável.

## Dados, importação e exportação

O Scriptz usa esquemas explícitos para impedir a mistura indevida de contextos. As preferências locais — tema, assinatura, contexto selecionado e largura da barra lateral — nunca são exportadas ou importadas por JSON.

| Esquema | Gerado por | Pode ser importado em |
|---|---|---|
| `scriptz-standard-changes` | Uma divisão do Scriptz Padrão | Somente na mesma divisão. |
| `scriptz-free-project` | Modo Livre | Somente no Modo Livre. |
| Array legado | Versões anteriores do Scriptz | Modo Livre, apenas como projeto editável. |

Um projeto padrão exportado contém somente dados próprios. Isso preserva os modelos institucionais no arquivo-base e evita que uma exportação copie ou modifique inadvertidamente os templates protegidos.

## Limites operacionais

Os limites foram definidos considerando que cada card possui prévia, ações e editor no DOM quando necessário. Em testes locais, a renderização de 300 cards padrão levou aproximadamente 98 ms e a de 500 cards do Modo Livre aproximadamente 277 ms no ambiente de validação.

| Contexto | Limite | Objetivo |
|---|---:|---|
| Scriptz Padrão | 300 scripts por divisão | Preservar fluidez em listas com scripts protegidos e próprios. |
| Modo Livre | 500 scripts por projeto | Equilibrar capacidade, busca, ordenação e rolagem em desktop e mobile. |

Caso um JSON importado exceda o limite do contexto, o Scriptz recusa o arquivo e informa a quantidade máxima aceita.

## Interface e produtividade

O Scriptz oferece pesquisa exclusivamente por **título do script**, favoritos prioritários em todas as listas, filtros por categoria, ordenação por título, categoria, criação ou ordem personalizada, e reordenação de categorias e scripts. A edição é exclusiva: enquanto um card estiver sendo editado, outro não pode ser aberto em edição.

A prévia recebe uma diferenciação discreta durante a edição, preservando a legibilidade enquanto deixa claro que o editor está ativo. Em telas móveis, o cabeçalho fixo, a busca, os controles de contexto e as ações principais foram adaptados a alvos de toque maiores e à navegação por drawer.

O campo de saudação é um seletor disponível tanto na criação quanto na edição. Ele permite **Desabilitar**, uma saudação automática que mostra **Bom dia**, **Boa tarde** ou **Boa noite** conforme o horário e a opção fixa **Prezado(a),**. Scripts de versões anteriores são migrados automaticamente: `hasGreeting: false` passa a Desabilitar, enquanto os demais continuam usando a saudação automática.

## PWA

O aplicativo inclui `manifest.webmanifest`, service worker e ícones próprios. O botão **Instalar Scriptz como app** abre o prompt nativo quando o navegador o disponibiliza; quando o navegador não expõe o prompt, a aplicação orienta a usar a opção de adicionar à tela inicial.

O cache atual inclui os recursos de interface, os ícones e os quatro arquivos JSON-base, permitindo a escolha da divisão mesmo sem conexão após a primeira visita.

## Estrutura do projeto

```text
assets/                  Ícones, logo e favicons
css/style.css            Temas, layout desktop/mobile e estados visuais
js/app.js                Estado, modos, proteção, persistência, importação e PWA
templates/               JSONs-base de DEPROT, DPCI, DPD e Coord.
index.html               Estrutura da interface, modais e jornada inicial
manifest.webmanifest     Metadados do aplicativo instalável
sw.js                    Cache offline do PWA
```

## Atualização dos scripts padrão

Para publicar modelos institucionais, edite exclusivamente o JSON da divisão correspondente em `templates/`. O formato esperado é o seguinte:

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
      "hasGreeting": true,
      "hasSignature": true,
      "isFavorite": false
    }
  ]
}
```

Após alterar um template, atualize a versão de cache em `sw.js` antes de publicar para que instalações existentes recebam os novos conteúdos.

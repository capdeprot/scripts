# Arquitetura de Modo — Scriptz

O Scriptz possui dois contextos independentes. O **Scriptz Padrão** carrega um JSON-base associado à divisão selecionada e mantém cada item desse arquivo como `standard`, sem permitir alteração de conteúdo, título ou categoria. O **Modo Livre** começa sem dados e trata todos os scripts como editáveis.

As escolhas de tema, assinatura, modo, divisão e largura da barra lateral permanecem exclusivamente no armazenamento local. Os dados exportados nunca incluem essas preferências. No Modo Padrão, a exportação contém somente scripts e categorias criados pelo usuário, mais as preferências de ordenação necessárias para recriar sua organização.

| Contexto | Fonte inicial | Edição de scripts-base | Exportação |
|---|---|---|---|
| Scriptz Padrão | `templates/<DIVISÃO>.JSON` | Bloqueada | Apenas alterações do usuário |
| Modo Livre | Nenhuma | Livre | Projeto completo do Modo Livre |

Para manter a interface responsiva em dispositivos móveis, o limite operacional é de **300 scripts por divisão** no Scriptz Padrão e **500 scripts por projeto** no Modo Livre. O limite considera que os cards possuem prévia, controles e editor já presentes no DOM, evitando degradação de rolagem e de interações.

## Verificação visual mobile

Em uma captura de 375 × 812 px, a mensagem inicial ficou legível e centralizada, e a tela seguinte apresentou a seleção de coordenadoria sem rolagem horizontal. Os botões mantiveram uma área de toque ampla, com o Modo Livre ocupando a largura disponível para explicitar a ação principal.

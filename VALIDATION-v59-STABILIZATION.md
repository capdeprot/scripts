# Validação v59 — estabilização visual e funcional

## Revisão visual inicial

| Contexto | Dispositivo | Resultado | Observações |
|---|---|---|---|
| Seleção de unidade | Desktop 1280×720 | Aprovado | Grade com duas linhas de três unidades; mensagem, espaçamento e CTA do Modo Editor permanecem legíveis. |
| Seleção de unidade | Mobile 780×1688 | Aprovado | Grade ordenada em duas colunas, alvos de toque amplos e ausência de deslocamento ou rolagem horizontal. |

## Próximas verificações

1. Abrir modais em desktop e mobile, verificando contenção e alcance dos comandos.
2. Alternar entre os quatro temas e confirmar contraste, transição e persistência.
3. Exercitar arraste de categorias e scripts com persistência local.
4. Exercitar exportação, estrutura do JSON e reimportação do conteúdo exportado.

## Modal de criação após o polimento

| Contexto | Dispositivo | Resultado | Evidência |
|---|---|---|---|
| Novo script contextual | Desktop 1280×720 | Aprovado | Overlay reduz a competição visual com o fundo; campos, editor e botões permanecem acessíveis com rolagem interna. |
| Novo script contextual | Mobile 780×1688 | Aprovado | Modal usa a altura útil, o editor mantém área de escrita legível e os botões Cancelar e Adicionar permanecem lado a lado e alcançáveis. |

O teste automatizado também confirmou foco inicial no título, restauração do foco ao fechar, início e término da transição de tema, persistência de ordenação e integridade do JSON exportado.

## Bibliotecas expansíveis v60

Os controles de **Modelos Padronizados** e **Meus Scriptz** exibem agora `▲` quando abertos e `▼` quando recolhidos. A regressão confirmou o valor do indicador, o estado `aria-expanded` e a transição de duração diferente de zero no contêiner de recolhimento. A animação é anulada automaticamente quando o sistema solicita redução de movimento.

## Dropdowns v61

O menu **Ações** agora usa os mesmos indicadores `▲` e `▼`, com contenção de altura, opacidade e deslocamento sincronizados. Os seletores nativos de tema, contexto, ordenação, classificação e saudação recebem uma seta `▼` consistente; em navegadores que oferecem o estado `:open`, ela passa a `▲` durante a abertura. A regressão confirmou esses estados em desktop e smartphone.

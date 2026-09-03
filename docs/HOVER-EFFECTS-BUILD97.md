# Hover effects — build 97

A base histórica da build 97 recebeu efeitos de hover discretos, preservando a interface original e sem introduzir movimento em áreas informativas.

Os cards de script recebem elevação vertical mínima, realce de borda e sombra suave quando o ponteiro passa sobre eles. O cabeçalho do card recebe uma variação leve de fundo para indicar que pode ser expandido. Os botões de copiar, editar e excluir, o favorito e os controles de ordenação recebem feedback de cor e movimento proporcional ao tipo de ação. As categorias, subcategorias, seções de biblioteca, ferramentas da sidebar e ações expansíveis também recebem realce de superfície e borda.

Elementos estáticos, textos de conteúdo, indicadores de quantidade e a assinatura não recebem transformações de hover. A regra `prefers-reduced-motion: reduce` desativa transições e transformações não essenciais, mantendo foco e operação normais por teclado.

O template DEPROT foi substituído pelo arquivo fornecido e validado no esquema `scriptz-standard-template`, com 66 scripts, 28 categorias, IDs únicos e nenhum aviso estrutural.

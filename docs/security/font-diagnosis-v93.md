# Diagnóstico de fonte — v93

A fonte Google Fonts estava declarada no HTML, mas a CSP anterior permitia folhas de estilo somente da própria origem. Com isso, `https://fonts.googleapis.com` e `https://fonts.gstatic.com` eram bloqueados, fazendo o navegador usar fontes de fallback.

A CSP foi corrigida para permitir somente essas duas origens específicas em `style-src` e `font-src`. Após a recarga, a folha externa passou a existir no DOM e `document.fonts.status` retornou `loaded`.

A aplicação usa duas famílias por decisão de identidade visual: **Inter** é a fonte geral do corpo e dos controles; **Rajdhani** é usada na wordmark, assinaturas, títulos e elementos de destaque. No navegador, `Inter` 400 foi confirmado como carregado; `Rajdhani` 600 e 700 foram confirmados como carregados. A consulta de Rajdhani sem peso retorna falso porque o HTML declara apenas os pesos 500, 600 e 700, sem a face regular 400.

Portanto, há duas situações diferentes: a falha de carregamento causada pela CSP foi corrigida; e o restante da interface aparecer em Inter é comportamento intencional conforme as regras CSS atuais, não uma falha de carregamento. Caso a intenção seja usar Rajdhani em toda a interface, isso será uma alteração de design distinta e deve ser aplicada seletivamente para preservar legibilidade.

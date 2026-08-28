# Relatório de testes ativos de segurança — v93

## Escopo

Testes controlados executados exclusivamente na prévia do Scriptz, com dados sintéticos e sessão isolada. Nenhum arquivo externo foi executado e nenhum dado real foi alterado.

## Ataques e resultados

| Superfície | Tentativa | Resultado |
|---|---|---|
| DOM/HTML | Inserção de `script`, `img` com `onerror`, `svg` com `onload`, atributos de evento e link `javascript:` | Bloqueada pela sanitização; o texto seguro foi preservado |
| URLs | `javascript:`, `data:`, credenciais embutidas em URL e HTTPS normal | URLs perigosas rejeitadas; HTTPS válido preservado |
| JSON | Chave `__proto__` e payload acima do limite de scripts/categorias | Rejeitados pela validação |
| Armazenamento | JSON local corrompido e ordem de categorias com tipo inválido | Rejeitados sem interromper o fluxo |
| Mesclagem | ID em conflito entre conteúdo existente e importado | ID remapeado; conteúdo distinto incluído uma única vez |
| Concorrência | Edição, reordenação e criação de categoria tentando acionar outra ação | Bloqueios funcionais confirmados |
| PWA/cache | Recursos fora da allowlist e de outra origem | Não entram no cache aprovado |

## Regressão

A regressão principal retornou `valid: true`. O único efeito indesejado localizado foi a caixa de assinatura não acomodar integralmente um nome longo no limite visual anterior. O limite interno foi ampliado de `--signature-reserve - 38px` para `--signature-reserve - 26px`, mantendo a reserva do dock e sem sobreposição; o assert `savedSignatureFits` passou.

## Console

Após os testes ativos, não foram observadas exceções de runtime, alertas de execução de payload, falhas de sanitização ou erros de carregamento no console do navegador.

## Política aplicada

Foi adicionada uma CSP compatível com a arquitetura estática em `index.html`, com `object-src 'none'`, `frame-src 'none'`, `base-uri 'none'`, `connect-src 'self'`, `worker-src 'self'`, `form-action 'self'` e recursos limitados à própria origem, além de `referrer: no-referrer`. `unsafe-inline` permanece necessário nesta versão porque a interface usa handlers inline legados; a sanitização de conteúdo continua sendo a barreira principal para HTML inserido pelo usuário.

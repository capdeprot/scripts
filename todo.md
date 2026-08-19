# Ajuste dos ícones PWA

- [x] Inspecionar os ícones PWA atuais e o manifesto.
- [x] Criar versões 192px e 512px com o logo menor, centralizado e com margem uniforme.
- [x] Atualizar o manifesto e referências necessárias.
- [x] Validar dimensões, transparência, composição e carregamento no navegador.
- [x] Gerar o pacote atualizado e registrar as alterações.

# Scriptz Padrão e Modo Livre

- [x] Criar os JSONs vazios de DEPROT, DPCI, DPD e SMUL-CAP e definir o esquema de dados por modo.
- [x] Manter `scriptz.json` fora do fluxo de produto e utilizá-lo apenas como referência de teste local.
- [x] Implementar a tela de boas-vindas e o seletor de coordenadoria, divisão e modo.
- [x] Implementar proteção de scripts e categorias padrão, mantendo edição para dados do usuário.
- [x] Separar persistência local de tema, assinatura, modo e divisão dos dados exportados.
- [x] Implementar importação, exportação e fluxos de descarte específicos de cada modo.
- [x] Adaptar controles, seleção de modo e telas iniciais para desktop e mobile.
- [x] Definir e validar limites de scripts com testes de desempenho.
- [x] Atualizar README, executar testes completos e gerar pacote final.

# Dropdown de saudação

- [x] Mapear os campos e a composição de saudação existentes em criação, edição, cópia e exportação.
- [x] Implementar as opções Desabilitar, saudação automática conforme o horário e Prezado(a).
- [x] Migrar scripts existentes com `hasGreeting` sem perder compatibilidade de importação.
- [x] Validar persistência, visualização, criação e edição, então gerar o pacote atualizado.

# Validação mobile v42

- [x] Conferir a jornada inicial, sidebar e controles principais em telas de 320px, 375px e 430px.
- [x] Validar o dropdown de saudação durante a criação em uma tela de smartphone.
- [x] Validar o dropdown de saudação durante a edição, incluindo o estado Desabilitar e a prévia ao vivo.
- [x] Verificar persistência, alvos de toque e console mobile; corrigir incompatibilidades encontradas.

# Carregamento da jornada inicial

- [x] Confirmar o flash da interface do sistema antes da jornada em desktop e em mobile.
- [x] Ajustar o estado inicial do HTML e CSS para ocultar a aplicação até a decisão de onboarding.
- [x] Validar a ausência de flash em perfis limpos e o carregamento normal para usuários já configurados.
- [x] Atualizar a documentação e gerar o pacote corrigido.

# Editor rico, jornada por unidade e ações

- [x] Mapear o formulário de criação, a barra de formatação do editor, os fluxos de colagem e as ações atuais.
- [x] Replicar as opções de formatação no novo script e preservar HTML seguro em textos colados.
- [x] Ampliar a área de criação e a escala de leitura na criação e edição.
- [x] Renomear Modo Livre para Modo Editor, preservando compatibilidade com dados e seletores existentes.
- [x] Reformular a jornada inicial com unidades CAP, Núcleo, Sala Arthur Saboya e link para o Modo Editor.
- [x] Criar o menu expansível Ações e mover os controles contextuais solicitados; remover o fluxo de novo projeto por download.
- [x] Validar desktop, mobile, persistência, importação, exportação e PWA; atualizar documentação e pacote.

# Boas-vindas diárias e transições

- [x] Mapear o onboarding atual, a assinatura persistida, o tema e o ciclo de carregamento do contexto.
- [x] Definir o critério de exibição diária e a composição da saudação pelo primeiro nome e horário local.
- [x] Reduzir a hierarquia da mensagem de unidades e remover a exclamação da recepção inicial.
- [x] Criar a tela de retorno diário adaptada ao tema e suavizar as transições das telas de boas-vindas.
- [x] Validar primeiro acesso, retorno no mesmo dia, retorno em novo dia, temas e mobile; atualizar pacote e documentação.

# Revisão da recepção diária

- [x] Substituir a instrução da seleção de unidade pela opção curta aprovada.
- [x] Remover a mensagem diária personalizada e reutilizar a recepção do primeiro acesso para retornos em novos dias.
- [x] Preservar o tema salvo durante a recepção diária e validar desktop e mobile antes de atualizar o pacote.

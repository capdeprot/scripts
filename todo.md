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

# Duas categorias, criação e ordenação

- [x] Evoluir o modelo de script com compatibilidade para até duas categorias em criação, edição, persistência, importação e exportação.
- [x] Substituir a escolha de categoria na criação por dropdown com a criação de nova categoria, espelhando a edição.
- [x] Adicionar rolagem própria ao formulário de criação e garantir o cursor de texto nos campos editáveis.
- [x] Limitar a ordenação a Ordem alfabética e Ordem personalizada, tornando a personalizada o padrão.
- [x] Bloquear alterações de ordenação enquanto houver um script em edição.
- [x] Validar os fluxos em desktop e mobile, atualizar a documentação e gerar o pacote revisado.

# Nomenclaturas e padrão DEPROT

- [x] Atualizar as três nomenclaturas da interface solicitadas.
- [x] Validar o JSON fornecido e convertê-lo, se necessário, ao esquema de template padrão de DEPROT.
- [x] Incorporar o padrão de DEPROT, validar scripts e proteções e gerar o pacote atualizado.

# Indicador discreto de script padrão

- [x] Substituir o selo textual por um cadeado discreto com tooltip “Script padrão protegido”.
- [x] Validar contraste, tooltip e comportamento em desktop e mobile; gerar pacote atualizado.

# Apresentação executiva do Scriptz

- [x] Estruturar uma narrativa simples para diretores e assessores, com foco em uso diário e ganhos operacionais.
- [x] Criar apresentação HTML navegável com a identidade visual do Scriptz e recursos de navegação por teclado.
- [x] Elaborar roteiro curto do apresentador, validar o material em navegador e preparar o pacote de entrega.

# Identidade visual da apresentação

- [ ] Extrair cores, tipografia, marca e padrões visuais consolidados na interface Scriptz v51.
- [ ] Reaplicar a identidade Blue Midnight e os elementos de marca em todos os slides e no visualizador HTML.
- [ ] Validar a coerência visual, atualizar roteiro se necessário e gerar o pacote revisado.

# Correção de logo na capa

- [ ] Confirmar o carregamento do logo antes da wordmark na capa e corrigir o ativo ou caminho se necessário.
- [ ] Verificar visualmente a composição da capa e preparar novamente o deck completo.

# Síntese funcional da apresentação

- [ ] Corrigir a referência do logo para o caminho aceito pelo renderizador de slides.
- [ ] Reduzir o conteúdo do deck e enfatizar busca, categorias, editor, padrões protegidos e uso em celular.
- [ ] Validar o logo na apresentação renderizada e atualizar o roteiro de condução, se necessário.

# Revisão do slide de acesso

- [ ] Reaplicar a identidade visual Blue Midnight ao slide de acesso em uma única edição completa.
- [ ] Preparar novamente o deck completo após a revisão do slide.
- [ ] Preservar as edições manuais atuais do usuário durante a adequação visual de acesso.html.

# Refação do deck Scriptz

- [ ] Refazer os oito slides mantendo a mesma narrativa e o conteúdo atual.
- [ ] Ajustar a composição do logo na capa e a identidade visual do slide final.
- [ ] Gerar comentários objetivos para cada slide e preparar novamente a apresentação completa.

# QR Code de acesso à ferramenta

- [ ] Gerar QR Code para https://capdeprot.github.io/scriptz/.
- [ ] Criar slide final com QR Code e hiperlink clicável no mesmo endereço.
- [ ] Validar a leitura do QR Code e preparar o deck atualizado.

# Restauração da versão editada

- [ ] Restaurar exatamente os oito slides da versão editada pelo usuário.
- [ ] Preservar somente o slide adicional de QR Code e seu hiperlink.
- [ ] Conferir a sequência de nove páginas antes de reapresentar o deck.

## Recuperação da cópia anterior ao QR Code

- [ ] Localizar a cópia exata dos oito slides existente antes do pedido do QR Code.
- [ ] Comparar a cópia encontrada com os arquivos atuais sem alterar o seu conteúdo.
- [ ] Restaurar a cópia aprovada e adicionar somente o nono slide com QR Code e hiperlink.

## Versão editável de nove páginas

- [ ] Conferir a estrutura dos nove slides e os ativos de marca disponíveis.
- [ ] Aplicar a identidade visual Scriptz em todas as páginas, preservando a edição em HTML.
- [ ] Atualizar o roteiro com comentários objetivos para as nove páginas.
- [ ] Preparar o deck e o arquivo de texto para entrega.

## Subcategorias e nomenclatura v51

- [x] Substituir a nomenclatura por “Gerenciador de modelos de texto” na interface e na documentação aplicável.
- [x] Mapear categorias, persistência, importação/exportação, ordenação e menus afetados por subcategorias.
- [x] Implementar subcategorias nos fluxos de criação, edição e gerenciamento.
- [x] Preservar a compatibilidade dos dados existentes e dos recursos atuais de categorias e scripts.
- [x] Validar desempenho, usabilidade e interface em desktop e mobile; gerar a entrega revisada.

## Visualização temporária v52

- [x] Iniciar a visualização temporária da versão com subcategorias.
- [x] Fornecer o endereço de teste ao usuário.

## Revisão da navegação de subcategorias

- [x] Remover a expansão de subcategorias da sidebar e preservar somente categorias principais nesse menu.
- [x] Exibir as subcategorias na área principal para seleção antes da lista de scriptz.
- [x] Corrigir o alinhamento e a distribuição dos controles no gerenciamento de categorias.
- [x] Renomear a ação de limpeza do Modo Editor e ajustar a mensagem de confirmação.
- [x] Validar o fluxo revisado em desktop e mobile e atualizar a prévia temporária.

## Nova visualização temporária v52

- [ ] Verificar a disponibilidade da prévia revisada.
- [ ] Fornecer novamente o endereço de teste ao usuário.

## Hierarquia contextual de subcategorias

- [x] Reformular a aparência e a navegação das categorias principais na sidebar.
- [x] Inserir retorno à categoria principal depois de abrir uma subcategoria.
- [x] Renomear e restringir o modal para Gerenciar categorias principais.
- [x] Criar a gestão completa de subcategorias na tela principal da categoria selecionada.
- [x] Impedir subcategorias em categorias principais que já possuam scripts diretos.
- [x] Validar criação, renomeação, exclusão, ordenação e navegação em desktop e mobile.
- [x] Limitar a grade da área principal a duas subcategorias por linha.

## Classificação obrigatória e categorias vazias

- [x] Exigir categoria ou subcategoria já existente para criar e salvar qualquer script.
- [x] Exibir ações destacadas de criar script ou criar subcategoria em categorias principais vazias.
- [x] Bloquear a criação de subcategorias quando houver scripts diretos e a criação de scripts diretos quando houver subcategorias.
- [x] Validar os dois caminhos exclusivos em desktop e mobile.

## Gestão por contexto

- [x] Incorporar criação, renomeação, exclusão e ordenação de categorias principais na sidebar do Modo Editor.
- [x] Remover a etapa redundante de Gerenciar categorias principais no Modo Editor.
- [x] Separar o Scriptz Padrão em Modelos Padronizados e Meus Scriptz.
- [x] Restringir edição dos modelos padronizados e preservar a gestão completa dos conteúdos pessoais.
- [x] Validar importação, criação, reordenação e responsividade nos dois contextos.

## Mensagem de reversão local

- [x] Atualizar a confirmação do Scriptz Padrão para mencionar conteúdos importados.

## Entrega v53

- [x] Executar a validação final e gerar o pacote definitivo da v53.
- [x] Confirmar a disponibilidade da visualização temporária atualizada.
- [x] Fornecer o pacote e o link de teste ao usuário.

## Abertura com ícone centralizado

- [x] Ocultar a listagem automática de scriptz ao abrir a página.
- [x] Exibir o ícone oficial de envelope, centralizado na área principal.
- [x] Validar a abertura e o acesso posterior às categorias em desktop e mobile.
- [x] Gerar pacote atualizado e disponibilizar a prévia revisada.

## Ajuste do ícone de abertura

- [x] Centralizar o ícone na área útil à direita da sidebar.
- [x] Reduzir o tamanho do ícone em 50% em desktop e mobile.
- [x] Validar a abertura corrigida e atualizar a prévia.

## Criação contextual de Scriptz

- [x] Mostrar Novo Script apenas em uma categoria ou subcategoria pessoal aberta.
- [x] Ocultar Novo Script em categorias principais que possuem subcategorias.
- [x] Vincular automaticamente o novo Scriptz à categoria ou subcategoria em contexto.
- [x] Remover a escolha e a criação de categoria principal no formulário, preservando a classificação secundária opcional.
- [x] Validar criação, persistência e interface em desktop e mobile; gerar entrega atualizada.

## Refinamento contextual v54

- [x] Ocultar o botão superior Novo script em categorias e subcategorias pessoais vazias.
- [x] Preservar os dois caminhos de criação na tela vazia de uma categoria e de uma subcategoria.
- [x] Validar o comportamento contextual em desktop e mobile e gerar o pacote v54.

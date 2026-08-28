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

## Unidades CAP-G

- [x] Substituir a mensagem de seleção por “Escolha sua unidade para acessar modelos padronizados”.
- [x] Criar a unidade CAP-G e seu arquivo de dados padrão vazio.
- [x] Aplicar a ordem solicitada às seis unidades e validar a jornada atualizada.

## Grade inicial de unidades

- [x] Organizar a seleção inicial em duas linhas de três unidades, na ordem solicitada.
- [x] Validar a grade em desktop e smartphone e gerar entrega corrigida.

## Rótulo da CAP-G no seletor

- [x] Exibir “CAP · G” exclusivamente no seletor lateral, preservando CAP-G como identificação interna.

## Bloqueio da abertura mobile

- [x] Reproduzir e identificar por que a tela mobile fica apenas com o envelope na abertura.
- [x] Garantir que a jornada de unidades ou o contexto salvo se torne acessível no smartphone.
- [x] Validar em smartphone com perfil novo e com contexto existente; gerar entrega corrigida.

## Estimativa indicativa de valor

- [x] Definir o escopo e as limitações de uma estimativa de valor para o Scriptz no estágio atual.
- [x] Comparar métodos de avaliação aplicáveis a um produto sem métricas comerciais informadas.
- [x] Apresentar faixas indicativas, premissas e dados necessários para refinamento.

## Mapa de ferramentas semelhantes

- [x] Pesquisar soluções de gestão de modelos, redação assistida por IA e atendimento institucional relacionadas ao Scriptz.
- [x] Comparar funcionalidades, público e diferenciais do Scriptz em relação às soluções encontradas.

## Entrada B2B

- [x] Mapear barreiras de produto, segurança, jurídico, vendas e operação para comercializar o Scriptz em B2B.
- [x] Priorizar os primeiros requisitos e caminhos de superação por impacto e dependência.

## Estabilização visual e funcional

- [x] Revisar responsividade, modais e transições de tema em desktop e smartphone.
- [x] Testar renderização, ordenação por arraste e exportação de dados.
- [x] Corrigir problemas identificados, validar novamente e gerar uma entrega atualizada.

## Indicadores expansíveis de bibliotecas

- [x] Exibir ▲ e ▼ nos controles de Modelos Padronizados e Meus Scriptz.
- [x] Sincronizar a animação do indicador com o recolhimento gradual do conteúdo, respeitando redução de movimento.

## Padronização de dropdowns

- [x] Mapear todos os controles expansíveis e seletores da interface.
- [x] Aplicar indicadores ▲ / ▼ e transições graduais onde o controle permitir abertura e recolhimento.
- [x] Validar estados em desktop e smartphone e gerar a entrega atualizada.

## Posição e tipografia da assinatura

- [x] Mover o bloco Sua assinatura para fora da sidebar e para o painel principal.
- [x] Posicionar o bloco no canto inferior direito do painel principal, conforme a referência.
- [x] Aumentar o campo de nome e sobrenome e aplicar Rajdhani maior, em negrito e itálico.
- [x] Validar a posição em desktop e smartphone e gerar entrega atualizada.

## Correção fina da assinatura v63

- [x] Ajustar o bloco para o encaixe exato ao lado dos cards, conforme a referência.
- [x] Alinhar o texto inserido e o texto de orientação à direita.
- [x] Validar em tela ampla e mobile e gerar entrega corrigida.

## Assinatura por dispositivo v64

- [x] Revalidar e corrigir o encaixe desktop conforme a referência visual.
- [x] Exibir Sua assinatura na sidebar em smartphone, como antes.
- [x] Validar desktop e smartphone e gerar entrega atualizada.

## Template padrão DEPROT

- [x] Inspecionar e normalizar o JSON fornecido para o schema de template do Scriptz.
- [x] Substituir o template padrão protegido da DEPROT e manter a compatibilidade da v61.
- [x] Validar o carregamento da DEPROT e entregar o arquivo/pacote atualizado.

## Correção do schema DEPROT

- [x] Converter o arquivo exportado `scriptz-free-project` para `scriptz-standard-template`.
- [x] Remover dados específicos de projeto e normalizar o conteúdo HTML importado.
- [x] Validar o carregamento automático da DEPROT após a substituição do arquivo em `templates/`.

## Hierarquia DEPROT

- [x] Preservar `categoryParents` do JSON exportado no template padrão.
- [x] Garantir que categorias com subcategorias não recebam scripts diretos no template convertido.
- [x] Comparar a árvore carregada em Modo Editor e Scriptz Padrão antes da entrega.

## Exportação compatível de template

- [x] Disponibilizar uma exportação de template padrão para a divisão aberta.
- [x] Preservar schema, divisão, categorias, `categoryParents` e ordem de modelos.
- [x] Validar que o arquivo exportado pode substituir diretamente `templates/<DIVISÃO>.JSON`.

## Critérios de entrega para commit

- [x] Validar sintaxe e schema do template DEPROT com hierarquia.
- [x] Testar a nova exportação de template e sua reimportação pelo carregador padrão.
- [x] Executar a regressão completa antes de gerar o pacote final.

## Correção da assinatura fixa no desktop

- [x] Fixar a janela Sua assinatura no canto inferior direito do painel em desktop, independente da rolagem ou do conteúdo exibido.
- [x] Dimensionar o campo inicialmente para cerca de sete letras e fazê-lo crescer conforme o nome e sobrenome informados.
- [x] Preservar a assinatura dentro da sidebar em smartphone e validar os dois contextos antes da entrega.

## Refinamento de escala da assinatura

- [x] Reduzir discretamente a escala visual da janela Sua assinatura em desktop, preservando a largura dinâmica do campo.
- [x] Validar posição fixa, crescimento do campo e apresentação mobile antes da entrega.

## Ajuste de assinatura e Aprova Digital

- [x] Substituir a orientação do campo de assinatura por “Seu nome”.
- [x] Redimensionar a janela de assinatura no desktop para que permaneça inteiramente no espaço livre e não cubra cards ou subcategorias.
- [x] Criar em Aprova Digital as subcategorias Mensagens externas e Guias AD.
- [x] Classificar os modelos atuais de Aprova Digital em Guias AD quando aplicável e em Mensagens externas nos demais casos.
- [x] Validar a hierarquia, a distribuição dos modelos e a interface desktop/mobile antes da entrega.

## Cotas do SEI no padrão DEPROT

- [x] Criar a categoria-pai Cotas do SEI no template padrão DEPROT.
- [x] Adicionar sob Cotas do SEI as subcategorias Alvará de Reforma, Projeto Modificativo e Restituição de Guia.
- [x] Validar a nova árvore sem scripts diretos na categoria-pai e com carregamento correto no Scriptz Padrão.

## Alternativas visuais para a assinatura

- [x] Criar alternativas de composição para a janela Sua assinatura mantendo a identidade visual do Scriptz.
- [x] Produzir capturas comparativas aplicadas à interface em desktop.
- [x] Apresentar as opções para seleção antes de alterar a interface definitiva.

## Assinatura selecionada — Opção 2

- [x] Substituir o rótulo por “Atenciosamente,” sobre o campo de nome.
- [x] Definir largura inicial compacta para acomodar o rótulo e “Seu nome”, com crescimento automático apenas quando necessário.
- [x] Alinhar rótulo e nome à esquerda em desktop e smartphone.
- [x] Validar posição, expansão do campo e comportamento responsivo antes da entrega.

## Fidelidade visual da opção 2

- [x] Reproduzir a proporção do cartão alinhado apresentado na segunda alternativa visual.
- [x] Preservar borda superior de destaque, alinhamento à esquerda e expansão de nomes sem alterar a composição escolhida.
- [x] Validar a comparação final antes de entregar a correção.

## Correção da referência visual da assinatura

- [x] Substituir o cartão com borda superior pelo dock com trilho vertical azul mostrado na imagem de referência.
- [x] Preservar Atenciosamente, e a expansão do nome no novo dock.
- [x] Validar a posição fixa e o alinhamento à esquerda em desktop e smartphone antes da entrega.

## Seleção de categorias e Aprova Digital

- [x] Exibir CAP · G na importação de script padrão pelo Modo Editor.
- [x] Remover o limite de vinculações e disponibilizar novo dropdown a cada categoria selecionada.
- [x] Mover os modelos de Guias AD para Mensagens externas AD.
- [x] Criar Mensagens externas AD e Guias AD como categorias principais.
- [x] Criar as subcategorias de Guias AD indicadas e validar a nova hierarquia DEPROT.
- [x] Mover Alvará de Reforma de Cotas do SEI para Guias AD, mantendo a nomenclatura solicitada.

## Proteção da criação e navegação mobile

- [x] Impedir que o modal de novo script seja fechado por clique fora da caixa.
- [x] Manter os botões Salvar e Cancelar como únicas saídas do formulário de criação.
- [x] Manter um botão de três linhas disponível para reabrir a sidebar em qualquer estado mobile.
- [x] Validar os fluxos desktop e mobile antes da entrega.

## Saudação e ordem das categorias DEPROT

- [x] Substituir o rótulo Desabilitar por Nenhuma no seletor de saudação.
- [x] Definir Nenhuma e assinatura desabilitada como padrão para novos scripts.
- [x] Ordenar as categorias principais DEPROT como E-mail, Mensagens externas AD, Guias AD e Cotas do SEI.
- [x] Validar o formulário de criação e a navegação da sidebar antes da entrega.

## Vínculo de novos scripts

- [x] Impedir a criação de categorias e subcategorias pela tela de novo script.
- [x] Permitir que o novo script seja associado somente a categorias ou subcategorias existentes.
- [x] Validar o formulário de criação antes da entrega.

## Vínculo na edição de scripts

- [x] Impedir a criação de categorias e subcategorias pelos dropdowns da tela de edição.
- [x] Permitir que scripts existentes sejam vinculados somente a categorias ou subcategorias já cadastradas.
- [x] Validar a edição antes da entrega.

## Ajuda, autoria e licença

- [x] Inserir botão circular e discreto de ajuda no canto superior direito.
- [x] Exibir a nota “Informações, ajuda e feedback” ao passar o mouse ou receber foco.
- [x] Exibir autoria, e-mail de contato e licença de uso interno em SMUL/CAP ao clicar.
- [x] Validar a interação em desktop e mobile antes da entrega.

## Refinamento da janela de informações

- [x] Ampliar a largura da janela para manter a frase de autoria em uma linha no desktop.
- [x] Exibir o wordmark como “scriptz”, em minúsculas.
- [x] Inserir o envelope antes do wordmark na mesma cor de destaque.
- [x] Validar o cabeçalho e a responsividade antes da entrega.

## Simetria da janela de informações

- [x] Ajustar a largura para equilibrar o espaço livre após o e-mail com o preenchimento esquerdo.
- [x] Preservar legibilidade em desktop e adaptação no mobile.
- [x] Validar a composição antes da entrega.

## Assinatura obrigatória e acesso ao PDF

- [x] Solicitar nome e sobrenome antes de copiar um script que utiliza assinatura quando não houver assinatura salva.
- [x] Oferecer no aviso um atalho de preenchimento que sincronize a assinatura padrão.
- [x] Ajustar a largura do campo de assinatura para sempre mostrar o nome completo salvo.
- [x] Abrir automaticamente o card com link PDF ao acessar a subcategoria correspondente.
- [x] Validar os fluxos e gerar o pacote atualizado.

## Autoria, avisos e subcategorias homônimas

- [x] Atualizar a frase de autoria da janela de informações e o e-mail de contato.
- [x] Aplicar aos avisos existentes o padrão visual do novo aviso de assinatura.
- [x] Permitir subcategorias com o mesmo nome quando vinculadas a categorias-pai diferentes.
- [x] Validar os fluxos de aviso e a hierarquia antes da entrega.

## Refinamento da janela de informações v82

- [x] Remover o controle de fechamento em “X”, mantendo somente o botão “Fechar”.
- [x] Ampliar a janela e equilibrar o espaço horizontal à esquerda e à direita.
- [x] Manter a frase de autoria em uma linha no desktop e preservar quebra natural no mobile.
- [x] Confirmar visualmente a janela aberta na prévia de desktop.

## Ajuste da mensagem de contato v83

- [x] Atualizar a mensagem de contato com menção a sugestões.
- [x] Fixar “envie uma mensagem para” como a segunda linha e o e-mail como a linha abaixo.
- [x] Confirmar visualmente a quebra em três linhas e a preservação da composição simétrica.

## Simplificação da mensagem de contato v84

- [x] Remover a quebra de linha forçada e manter a nova mensagem em um único parágrafo.
- [x] Confirmar visualmente a distribuição natural do texto na janela.

## Simetria da janela de informações v85

- [x] Reduzir a largura útil da janela para preservar 40px de margem interna nos dois lados.
- [x] Manter o botão “Fechar” dentro da mesma coluna de conteúdo, alinhado à margem direita interna.
- [x] Confirmar visualmente as margens internas simétricas e o botão reposicionado.

## Hardening técnico inicial

- [x] Sanitizar HTML de scripts preservando apenas a formatação necessária e links seguros.
- [x] Validar rigorosamente arquivos JSON importados, incluindo limites e chaves perigosas.
- [x] Bloquear protocolos de URL inseguros em links editados, importados e renderizados.
- [x] Limitar o cache PWA aos recursos públicos e estáticos explicitamente aprovados.
- [x] Criar regressões de segurança e validar os fluxos existentes antes da entrega.

## Correção de quebras de linha v87

- [x] Restaurar a base v86 sem estrutura institucional e incorporar o JSON enviado como template DEPROT.
- [x] Substituir a leitura visual por conversão estrutural de HTML para texto simples.
- [x] Normalizar quebras internas e preservar parágrafos, linhas explícitas e listas.
- [x] Preservar a cópia HTML para e-mails e editores ricos.
- [x] Validar sintaxe, template DEPROT e regressão desktop/mobile.
- [x] Confirmar no navegador a conversão do modelo de metragem sem quebras internas indevidas.

## Gestão e busca de Meus Scripts

- [x] Mapear por que a edição de scripts pessoais não fica disponível.
- [x] Exibir “Criar categoria” quando Meus Scripts estiver vazio.
- [x] Atualizar imediatamente a categoria ou subcategoria aberta depois de criar ou salvar um item.
- [x] Adicionar busca contextual ao lado da ordenação na área principal.
- [x] Transformar a pesquisa da sidebar em busca geral do contexto.
- [x] Validar os novos fluxos em desktop e mobile antes de gerar o pacote.

### Reprodução inicial

- [x] Carregar um script pessoal na biblioteca Meus Scripts para testar edição e estado vazio separadamente.
- [x] Confirmar que um script pessoal não é padrão e que o editor é habilitado quando a biblioteca pessoal fica ativa.

## Criação inicial orientada por categoria

- [x] Disponibilizar Criar script no estado inicial de Meus Scriptz quando houver categoria ou subcategoria pessoal existente.
- [x] Exigir a escolha de categoria ou subcategoria existente nesse fluxo de criação inicial.
- [x] Aplicar o mesmo fluxo de criação inicial ao Modo Editor.
- [x] Exibir Criar categoria quando o Modo Editor estiver vazio.
- [x] Validar desktop, mobile, persistência e vínculo obrigatório antes de gerar o pacote revisado.

## Correção de visibilidade do seletor inicial

- [x] Corrigir a exibição do dropdown obrigatório de categoria ou subcategoria no formulário aberto pela tela inicial.
- [x] Validar a visibilidade e a seleção nos contextos Meus Scriptz e Modo Editor, em desktop e mobile.

## Governança de edição e importação

- [x] Validar e incorporar o JSON enviado como novo template padrão de DEPROT.
- [x] Impedir o fechamento por clique externo dos avisos de renomeação de categoria e subcategoria.
- [x] Bloquear ações concorrentes enquanto a reordenação ou a criação de categoria principal estiver em andamento.
- [x] Bloquear ações concorrentes nos demais cards enquanto um script estiver em edição.
- [x] Oferecer sobreposição ou mesclagem ao importar dados em contexto que já possui conteúdo.
- [x] Mesclar apenas categorias, subcategorias e scriptz ainda inexistentes.
- [x] Validar os fluxos de importação, bloqueio e edição em desktop e mobile antes da entrega.

## Atualização do template DEPROT

- [x] Incorporar o novo JSON enviado como template padrão de DEPROT.
- [x] Atualizar o validador conforme a estrutura do novo template, se necessário.
- [x] Validar o template e gerar pacote pronto para commit.

## Nova rodada de segurança

- [x] Auditar validação de JSON, limites de tamanho e proteção contra payloads excessivos.
- [x] Auditar sanitização HTML, URLs, links e conteúdo colado/importado.
- [x] Auditar armazenamento local, exportação, importação e isolamento entre contextos.
- [x] Auditar cache e superfícies do service worker/PWA.
- [x] Aplicar correções de segurança compatíveis sem alterar a estrutura institucional.
- [x] Executar testes de segurança, sintaxe e regressão antes da entrega.
- [x] Documentar as melhorias e gerar pacote revisado, se houver alterações.


## Varredura funcional e UX após hardening

- [x] Verificar carregamento inicial, troca de contexto e jornada de boas-vindas.
- [x] Testar navegação, sidebar, categorias, subcategorias e reordenação.
- [x] Testar criação, edição, cópia, favoritos e exclusão de scriptz.
- [x] Testar importação, mesclagem, sobreposição, exportação e persistência local.
- [x] Testar PWA, links, modais, acessibilidade básica e ausência de ações concorrentes.
- [x] Executar varredura de console, rede, erros de runtime e overflow em desktop e mobile.
- [x] Corrigir efeitos indesejados encontrados e repetir a regressão completa.


## Testes ativos de segurança

- [x] Tentar injeção de HTML, script, atributos e URLs perigosas em títulos, categorias, editores e JSON.
- [x] Tentar corromper ou exceder limites do JSON importado e do localStorage.
- [x] Tentar provocar duplicação, colisão de IDs e quebra da hierarquia durante mesclagem.
- [x] Tentar acionar ações concorrentes durante edição, reordenação, modais e importação.
- [x] Tentar provocar navegação indevida, abertura insegura de links e cache de recursos não aprovados.
- [x] Corrigir cada vulnerabilidade ou efeito indesejado reproduzível e repetir os ataques.
- [x] Documentar resultados e atualizar a versão somente após regressão final aprovada.


## Organização da documentação

- [x] Inventariar os arquivos Markdown na raiz e classificar sua finalidade.
- [x] Identificar arquivos temporários ou específicos de auditorias anteriores.
- [x] Organizar a documentação sem remover arquivos exigidos pela hospedagem ou pelo projeto.
- [x] Validar referências, sintaxe e integridade do pacote após a organização.


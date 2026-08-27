# Validação do diálogo de importação — v91

Com conteúdo já existente no Modo Editor, a reprodução no navegador confirmou a abertura do aviso de decisão de importação. O diálogo exibiu os controles **Sobrepor existentes** e **Mesclar sem duplicar**, com o segundo controle visível e acionável. A regressão automatizada complementa a verificação, confirmando que a mesclagem mantém o item existente, adiciona somente o novo e preserva a hierarquia importada.

O caminho **Usar script padrão como base** foi também reproduzido com um template DEPROT válido. Quando o Modo Editor já continha uma categoria e um script, o carregamento exibiu o mesmo diálogo com as opções **Sobrepor existentes** e **Mesclar sem duplicar**.

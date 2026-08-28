# Inspeção dos ícones PWA

Os arquivos `assets/pwa-icon-192.png` e `assets/pwa-icon-512.png` são quadrados e usam fundo azul meia-noite com o envelope branco. O logo ocupa uma área muito ampla, especialmente no ícone de 512px, deixando pouca margem externa. A nova versão deve manter o fundo e a proporção do envelope, reduzindo o logo para aproximadamente 64% da largura do canvas e centralizando-o com margem uniforme. A composição deve ser rasterizada nos dois tamanhos a partir da mesma fonte visual para evitar diferenças entre instalações.

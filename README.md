# 📨 Scripts CAP/DEPROT

Gerenciador de modelos de e-mail para uso interno da **Coordenadoria de Atendimento ao Público / Divisão de Protocolo (CAP/DEPROT)** — Secretaria Municipal de Urbanismo e Licenciamento (SMUL), Prefeitura de São Paulo.

---

## 📋 **Índice**

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como usar](#como-usar)
- [Gerenciamento de scripts](#gerenciamento-de-scripts)
- [Personalização](#personalização)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Como hospedar no GitHub Pages](#como-hospedar-no-github-pages)
- [Contribuição](#contribuição)

---

## 📌 **Sobre o projeto**

Este projeto é uma ferramenta web desenvolvida para **otimizar o atendimento** da CAP/DEPROT, permitindo que a equipe:

- Acesse rapidamente modelos de e-mail prontos
- Edite e personalize os scripts conforme necessário
- Mantenha um repositório centralizado de templates
- Copie textos com formatação preservada para clientes de e-mail

---

## 🚀 **Funcionalidades**

### 📝 **Gerenciamento de scripts**

| Funcionalidade | Descrição |
|----------------|-----------|
| **Listagem** | Visualize todos os scripts organizados por categorias |
| **Busca em tempo real** | Encontre scripts por título, categoria ou trecho do texto |
| **Ordenação** | Ordene por título, categoria, data de criação, favoritos ou ordem personalizada |
| **Categorias como botões** | Navegação intuitiva com categorias em formato de botões arredondados |
| **Reordenação de categorias** | Arraste e solte para personalizar a ordem das categorias |

### ✏️ **Edição e criação**

| Funcionalidade | Descrição |
|----------------|-----------|
| **Criar novo script** | Adicione novos templates com título, categoria e texto |
| **Autocomplete de categorias** | Sugestões automáticas ao digitar o nome da categoria |
| **Criar nova categoria** | Opção para criar categorias diretamente no campo de entrada |
| **Edição rich text** | Formate o texto com negrito, itálico, sublinhado e listas |
| **Checkboxes de recursos** | Ative/desative saudação automática e assinatura |
| **Prévia ao vivo** | Visualize o texto completo (com saudação e assinatura) enquanto edita |
| **Favoritos** | Marque scripts preferidos com estrela amarela |

### 📋 **Cópia e exportação**

| Funcionalidade | Descrição |
|----------------|-----------|
| **Copiar com formatação** | Copia o texto preservando negrito, itálico e links |
| **Saudação automática** | Insere "Bom dia", "Boa tarde" ou "Boa noite" conforme o horário |
| **Assinatura personalizada** | Adiciona automaticamente seu nome ao final do texto |
| **Exportar JSON** | Baixe todos os scripts em formato JSON para backup ou versionamento |
| **Importar JSON** | Importe scripts via upload ou arrastando o arquivo |

### 🎨 **Personalização**

| Funcionalidade | Descrição |
|----------------|-----------|
| **Tema claro/escuro** | Alternância entre temas com persistência no navegador |
| **Assinatura personalizada** | Defina seu nome para aparecer em todos os scripts |
| **Favoritos** | Scripts favoritos aparecem no topo da lista |
| **Ordem personalizada** | Organize as categorias conforme sua preferência |

---

## 📂 **Estrutura do repositório**
scripts/
├── index.html # Interface principal
├── scripts.json # Base de dados dos scripts
├── css/
│ └── style.css # Estilos da aplicação
├── js/
│ └── app.js # Lógica da aplicação
└── README.md # Documentação

---

## 🖥️ **Como usar**

### Acessando a ferramenta

1. Acesse o [GitHub Pages do projeto](https://capdeprot.github.io/scripts/)
2. Ou clone o repositório e abra o `index.html` em um servidor local

### Navegação

- **Sidebar esquerda**: categorias e ferramentas de configuração
- **Área principal**: lista de scripts
- **Busca**: filtra scripts por título, categoria ou texto
- **Ordenação**: dropdown para ordenar a lista

### Copiando um script

1. Clique em **"Copiar"** no card do script
2. O texto é copiado com formatação e saudação automática
3. Cole diretamente no seu cliente de e-mail

### Editando um script

1. Clique em **"Editar"** no card do script
2. Modifique o texto, título ou categoria
3. Ative/desative a saudação automática e assinatura
4. Clique em **"Salvar"** para persistir as alterações

---

## 🛠️ **Gerenciamento de scripts**

### Adicionando um novo script

1. Clique no botão **"➕ Novo script"**
2. Preencha o título
3. Digite o nome da categoria (sugestões automáticas aparecerão)
4. Selecione ou desative os recursos (saudação automática e assinatura)
5. Escreva o texto do script (somente o corpo, sem saudação e sem assinatura)
6. Clique em **"Adicionar"**

### Editando um script existente

1. Clique em **"Editar"** no card do script
2. Modifique:
   - Título
   - Categoria (via dropdown)
   - Texto (com formatação rich text)
   - Recursos (checkboxes de saudação e assinatura)
3. Visualize a prévia ao vivo
4. Clique em **"Salvar"**

### Excluindo um script

1. Clique em **"🗑️"** no card do script
2. Confirme a exclusão

### Favoritando um script

1. Clique na **estrela** (⭐) no canto direito do card
2. O script aparece no topo quando ordenado por "⭐ Favoritos"

---

## 🎯 **Personalização**

### Definindo sua assinatura

1. Na barra lateral, localize "👤 Sua assinatura"
2. Digite seu nome completo
3. A assinatura será aplicada automaticamente em todos os scripts

### Alternando o tema

1. Clique em **"Modo Escuro"** / **"Modo Claro"** no cabeçalho da sidebar
2. A preferência é salva automaticamente

### Reordenando categorias

1. Clique em **"🔀 Reordenar categorias"** abaixo da lista de categorias
2. Arraste as categorias para a ordem desejada
3. Clique em **"✅ Finalizar reordenação"** para salvar

---

## 💻 **Tecnologias utilizadas**

| Tecnologia | Descrição |
|------------|-----------|
| **HTML5** | Estrutura da aplicação |
| **CSS3** | Estilização com variáveis CSS e tema escuro |
| **JavaScript (ES6)** | Lógica da aplicação, manipulação do DOM e localStorage |
| **GitHub Pages** | Hospedagem gratuita |
| **localStorage** | Persistência local das personalizações do usuário |

---

## 🌐 **Como hospedar no GitHub Pages**

1. Crie um repositório no GitHub
2. Faça upload dos arquivos (`index.html`, `scripts.json`, `css/`, `js/`)
3. Acesse **Settings → Pages → Source** e selecione `main` / `root`
4. O GitHub fornecerá a URL da página

---

## 🤝 **Contribuição**

Este projeto é mantido por **Anderson Ferreira de Andrade**. Para sugestões ou melhorias, entre em contato:

- **E-mail**: afandrade@prefeitura.sp.gov.br
- **Telefone**: (11) 5466-1920

---

## 📄 **Licença**

Uso interno — Prefeitura de São Paulo — SMUL/CAP/DEPROT

---

*Desenvolvido para uso interno — CAP/DEPROT · SMUL · Prefeitura de São Paulo*

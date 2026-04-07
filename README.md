# Scripts CAP/DEPROT

Gerenciador de modelos de e-mail para uso interno da **Coordenadoria de Atendimento ao Público / Divisão de Protocolo (CAP/DEPROT)** — Secretaria Municipal de Urbanismo e Licenciamento (SMUL), Prefeitura de São Paulo.

## Funcionalidades

- **Busca em tempo real** por título, categoria ou trecho do texto
- **Cópia com formatação** — o texto é copiado com negrito, itálico e hiperlinks preservados, pronto para colar no cliente de e-mail
- **Saudação automática** — scripts com saudação variável exibem e copiam "Bom dia", "Boa tarde" ou "Boa noite" conforme o horário
- **Edição rich text inline** — barra de formatação com negrito, itálico, sublinhado, inserção de links e listas
- **Adição de scripts** — novo script pode ser adicionado via formulário, em categoria existente ou nova
- **Exclusão** de scripts
- **Exportação de JSON** — as edições são exportadas como `scripts.json` para versionamento no repositório

## Estrutura do repositório

```
├── index.html       # Interface principal
└── scripts.json     # Base de dados dos scripts (editável)
```

## Como hospedar no GitHub Pages

1. Crie um repositório no GitHub (pode ser privado ou público)
2. Faça upload dos dois arquivos (`index.html` e `scripts.json`)
3. Acesse **Settings → Pages → Source** e selecione `main` / `root`
4. O GitHub fornecerá a URL da página (ex: `https://seuusuario.github.io/nome-do-repo/`)

## Como persistir edições

1. Faça as edições ou adições de scripts na interface
2. Clique em **Exportar JSON** — o arquivo `scripts.json` atualizado será baixado
3. Substitua o `scripts.json` no repositório pelo arquivo baixado
4. Faça commit e push — as alterações ficam disponíveis para todos os usuários

## Formato do scripts.json

Cada script segue a estrutura:

```json
{
  "id": 1,
  "cat": "Nome da Categoria",
  "title": "Título do script",
  "html": "<p>Conteúdo em HTML com <strong>formatação</strong> e <a href=\"...\">links</a>.</p>"
}
```

Para scripts com saudação automática, use a tag `<saudacao>` no HTML:

```json
"html": "<p><saudacao>, ____.</p><p>Corpo do e-mail…</p>"
```

A tag será substituída por "Bom dia", "Boa tarde" ou "Boa noite" no momento da exibição e cópia.

---

*Desenvolvido para uso interno — CAP/DEPROT · SMUL · Prefeitura de São Paulo*

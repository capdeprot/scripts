# Arquitetura de modos — Scriptz v46

O Scriptz opera em dois contextos independentes. O **Scriptz Padrão** carrega um JSON-base associado à unidade selecionada e bloqueia scripts e categorias institucionais. O **Modo Editor** começa vazio e mantém todos os dados editáveis.

As preferências de tema, assinatura, contexto, unidade e largura da barra lateral pertencem somente ao navegador. Exportações carregam os scripts, categorias e ordenações do contexto, mas não essas preferências pessoais.

| Contexto | Fonte inicial | Edição de scripts-base | Exportação |
|---|---|---|---|
| Scriptz Padrão | JSON-base de DEPROT, DPCI, DPD, Núcleo ou Sala Arthur Saboya | Bloqueada | Apenas alterações do usuário na mesma unidade |
| Modo Editor | Projeto vazio ou base CAP editável | Livre | Projeto completo como `scriptz-free-project` |

## Unidades

| Unidade | Arquivo-base |
|---|---|
| DEPROT | `templates/DEPROT.JSON` |
| DPCI | `templates/DPCI.JSON` |
| DPD | `templates/DPD.JSON` |
| Núcleo | `templates/SMUL-CAP.JSON` |
| Sala Arthur Saboya | `templates/SALA-ARTHUR-SABOYA.JSON` |

Contextos antigos persistidos como `Coord.` são normalizados para **Núcleo** ao abrir a aplicação.

## Limites e interface

O limite é de **300 scripts por unidade** no Scriptz Padrão e **500 scripts por projeto** no Modo Editor. O editor de criação e o editor existente armazenam HTML tratado, preservando formatação segura de texto e rejeitando elementos executáveis.

No primeiro acesso, uma breve boas-vindas antecede a tela **SMUL · CAP**, que apresenta as cinco unidades e o acesso textual ao Modo Editor. O menu expansível **Ações** concentra os comandos operacionais aplicáveis ao contexto e mantém a barra lateral mais limpa em desktop e mobile.

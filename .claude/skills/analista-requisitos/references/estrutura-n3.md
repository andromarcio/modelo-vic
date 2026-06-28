# Estrutura do N3 — Template de Referência

Este arquivo define a estrutura completa de um artefato N3 (Feature),
incluindo seções negociais e técnicas.

---

## Seções negociais (sempre visíveis)

```markdown
# [Nome da Feature]
> **Nível 3** - Feature Set: [Nome do Feature Set] — Domínio: [Nome do Domínio] - `[ID do N2]`

## Descrição
[uma frase em linguagem de negócio]

---

## Superfície

**[Tela própria | Ação em tela]** — [rota ou feature/tela de origem]

---

## Regras de negócio

1. [Regra específica desta feature]
2. [Regra canônica] → ver RULES-DICTIONARY: [nome] (parâmetro: [valor])
3. [Regra de domínio] → ver N1 [Domínio]: Regras transversais do domínio: [N]

---

## Cenários

# ← FIELD-DICTIONARY: [nome do campo] (importar cenários de validação)
# ← RULES-DICTIONARY: [nome da regra] (importar cenários)

# ── Caminho feliz ──────────────────────────────────────────────

Scenario: [descrição]
  Given [estado inicial]
  When [ação]
  Then [resultado]

# ── Erros de validação ─────────────────────────────────────────

Scenario: [descrição]
  ...

# ── Conflitos com dados existentes ─────────────────────────────

Scenario: [descrição]
  ...

# ── Restrições de acesso ───────────────────────────────────────

Scenario: [descrição]
  ...

# ── Estados especiais ──────────────────────────────────────────

Scenario: [descrição]
  ...

---

## Campos

| Label PO | Tipo | Obrigatório | Validação |
|---|---|---|---|
| [nome em português] | [tipo] | sim/não/automático | [regra em linguagem natural] |
| [campo canônico] | [tipo] | [obrig.] | → ver FIELD-DICTIONARY: [nome] |

---

## Campos automáticos

| Label PO | Valor | Quando |
|---|---|---|
| [campo] | [valor automático] | [quando é preenchido] |

---

## Comportamento de tela

[onde aparece, comportamento durante processamento, retorno visual
de sucesso e erros — seguir padrão do Design System]

---
```

## Seções técnicas (dentro de `dev-only`)

```markdown
<div class="dev-only">

## Mapeamento de campos
→ ver data-models/[dominio].md: [Entidade]

## Cenários técnicos

# ── Comportamento técnico ──────────────────────────────────────

Scenario: [descrição técnica — cookies, headers, HTTP status, jobs]
  Given [contexto técnico]
  When [chamada técnica]
  Then [resultado técnico com status codes]

## Mapeamento de erros
→ ver ERROR-DICTIONARY: [CODIGO]

## API

### [VERBO] /[rota]

**Body:**
```json
{ "campo": "valor" }
```

**Response 201:**
```json
{ "id": "uuid", "campo": "valor" }
```

**Erros:**
| Código | HTTP | Condição |
|---|---|---|
| [CODIGO] | [status] | [quando ocorre] |

## Eventos publicados

| Evento | Payload | Quando |
|---|---|---|
| [nome.do.evento] | `{ campo }` | [condição] |

## Eventos consumidos

| Evento | Origem | Ação |
|---|---|---|
| [nome.do.evento] | [serviço] | [o que faz] |

## AuditLog

| Ação | Dados registrados |
|---|---|
| [ACAO] | [campos salvos no log] |

## Arquivos a criar ou alterar

| Arquivo | Ação | Descrição |
|---|---|---|
| [caminho] | criar/alterar | [o que fazer] |

## Dependências

| Dependência | Tipo | Motivo |
|---|---|---|
| [serviço/lib] | [runtime/dev] | [por quê] |

</div>
```

## Seção de rastreabilidade (sempre visível, preenchida após implementação)

```markdown
---

## Rastreabilidade

| Item | Repositório | Caminho | Branch/Tag |
|---|---|---|---|
| [componente] | [repo] | [path] | [branch] |

**Status:** `[ ] Especificado · [ ] Em desenvolvimento · [ ] Implementado · [ ] Deprecado`

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| [data] | [autor] | Feature criada | N3 gerado |
```

---

## Convenção de visibilidade

Seções negociais ficam **fora** da tag `dev-only`. Seções técnicas ficam **dentro**.

```html
<!-- Negocial — visível para todos -->
## Seção de negócio

<div class="dev-only">
<!-- Técnico — apenas para devs -->
## Seção técnica
</div>
```

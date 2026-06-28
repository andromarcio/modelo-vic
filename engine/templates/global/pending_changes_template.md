---
gerado_em: YYYY-MM-DD
origem: "[descreva a fonte do delta: reunião de refino, novo requisito, etc.]"
alteracoes:
  - id: slug-unico-create
    tipo: create
    artefato: N3
    dominio: "[sigla do domínio]"
    feature_set: "[nome do feature set]"
    feature: "[nome da feature]"
    descricao: "[o que precisa ser criado]"
    prompt_sugerido: 3A
    aprovado: null

  - id: slug-unico-modify
    tipo: modify
    artefato: N3
    arquivo: "[caminho/relativo/da/feature.md]"
    o_que_muda: "[descrição objetiva da alteração]"
    motivo: "[por que o delta exige esta mudança]"
    impacto: "[efeito no comportamento ou nas regras de negócio]"
    prompt_sugerido: 4A
    aprovado: false

  - id: slug-unico-keep
    tipo: keep
    artefato: N3
    arquivo: "[caminho/relativo/da/feature.md]"
    aprovado: true
---

# Alterações Pendentes — YYYY-MM-DD

> Gerado pelo PROMPT_INVESTIGADOR a partir de: [origem]
> Itens `modify` requerem aprovação humana antes da execução.
> Itens `create` são executados diretamente pelo PROMPT_EXECUTOR.
> Itens `keep` não são processados.

---

## Novos artefatos a criar

### [Nome da feature / artefato]

| Campo | Valor |
|---|---|
| **Tipo** | N3 |
| **Domínio** | [sigla] |
| **Feature Set** | [nome] |
| **Descrição** | [o que precisa ser criado] |
| **Prompt sugerido** | 3A — Especificar feature negócio |

---

## Alterações em artefatos existentes

### [Nome da feature] — `[caminho/relativo/da/feature.md]`

| Campo | Valor |
|---|---|
| **O que muda** | [descrição objetiva] |
| **Motivo** | [por que o delta exige isto] |
| **Impacto** | [efeito no comportamento ou nas regras] |
| **Prompt sugerido** | 4A — Atualizar feature negócio |
| **Aprovado** | ❌ Pendente |

> Para aprovar: altere `aprovado: false` → `aprovado: true` no frontmatter acima.

---

## Artefatos mantidos (sem alteração)

- [Nome da feature] — `[caminho/relativo/da/feature.md]` ✅

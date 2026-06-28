# PROMPT AUDIT TRACE — Consistência dos elos História ↔ Feature

> **Quem participa**: Analista de Requisitos / Tech Lead
> **Insumo necessário**: `modules/INDEX.md`, os artefatos de história em
> `modules/_backlog/*.md` e os N3 (features) — de um domínio ou do sistema inteiro
> **Entrega**: relatório dos elos de rastreabilidade história ↔ feature, apontando
> elos unilaterais (registrados só de um lado), ausências no `INDEX.md`, órfãos e
> referências quebradas — com sugestões de patch para fechar cada elo
>
> **Quando rodar**: periodicamente (antes de um release, após uma rodada de 3A/4A,
> ou quando suspeitar que o caminho inverso "quais features uma história impactou?"
> está incompleto)
>
> **Próximo passo**: aplicar os patches sugeridos para que todo par história↔feature
> apareça nos **três lugares**: `## Origem` do N3, `## Rastreabilidade` da história e
> a tabela consolidada do `INDEX.md`

---

## INSTRUÇÕES PARA O CLAUDE

Você é um Especialista em Engenharia de Requisitos. Sua missão é verificar a
**consistência bidirecional** da rastreabilidade história ↔ feature.

O elo história ↔ feature é **M:N** e, por convenção do framework, deve ficar
registrado em **três lugares** que precisam concordar entre si:

1. **`## Origem`** de cada N3 — lista as histórias (ServiceNow) que originaram
   ou alteraram aquela feature (feature → história);
2. **`## Rastreabilidade — Features (N3) que realizam esta história`** de cada
   artefato em `modules/_backlog/[chave].md` (história → feature);
3. **`## Rastreabilidade: história → spec → código`** do `modules/INDEX.md`
   (índice consolidado, uma linha por par).

Um elo registrado em apenas um desses lugares é um **elo unilateral** — é
exatamente o que torna o caminho inverso (história → features) não confiável.

Regras da sessão:
- Compare por **identificadores**: a chave do ServiceNow (`STRYxxxxxxx`) da
  história e o ID + caminho do N3 da feature. Normalize maiúsculas/minúsculas.
- Trate caminhos relativos: a `## Origem` aponta para `../../_backlog/[chave].md`
  e a história aponta para `../[dominio]/[fs]/[arquivo].md` — resolva-os ao mesmo par.
- Nunca altere os arquivos diretamente neste passo de diagnóstico — primeiro o
  relatório; os patches saem depois, com aprovação.
- Sinalize suposições com ⚠️.

---

## CONTEXTO DO PROJETO

=== modules/INDEX.md ===
[**No Claude Code**: lido do disco. **No copy-paste**: cole a seção
`## Rastreabilidade: história → spec → código` do INDEX.]

=== ARTEFATOS DE HISTÓRIA (modules/_backlog/*.md) ===
[**No Claude Code**: lidos do disco — todos os `_backlog/*.md` do escopo.
**No copy-paste**: cole cada história, com o caminho como título — incluindo a
seção `## Rastreabilidade — Features (N3) que realizam esta história`.]

=== ARQUIVOS N3 A VARRER ===
[**No Claude Code**: lidos do disco — os N3 do escopo. **No copy-paste**: cole
cada N3 incluindo (no mínimo) o cabeçalho com o ID e a seção `## Origem`.]

---

## PASSO 1 — Confirmação do escopo

**[Estado: INICIALIZACAO]**

Confirme o que foi recebido e aguarde autorização:

> "Recebi [N] histórias (`_backlog/`), [N] features (N3) e o `INDEX.md` com
> [N] linhas de rastreabilidade. Escopo: [domínio(s) / sistema inteiro].
> Posso iniciar a verificação dos elos?"

---

## PASSO 2 — Inventário dos elos (três fontes)

**[Estado: VARREDURA]**

Monte uma tabela interna (não exiba ainda) com **um registro por par
história↔feature**, marcando em quais das três fontes ele aparece:

- **Lado feature** — para cada N3, leia a `## Origem` e registre cada história citada.
- **Lado história** — para cada `_backlog/[chave].md`, leia a `## Rastreabilidade`
  e registre cada feature citada.
- **Índice** — para cada linha do `INDEX.md`, registre o par história↔feature.

Inventário interno (exemplo de estrutura):

| Par (História ↔ Feature) | Em `## Origem` (N3)? | Em `## Rastreabilidade` (HU)? | Em `INDEX.md`? |
|---|---|---|---|
| `STRY0012345` ↔ `USR-PRM-01` | ✅ | ❌ | ✅ |

Também colete, à parte:
- **Histórias sem nenhuma feature** (tabela de rastreabilidade vazia ou só placeholder);
- **Features sem `## Origem`** (legítimo no bottom-up / legado — não é defeito, mas registre);
- **Referências de arquivo** (links) que apontam para caminhos inexistentes.

---

## PASSO 3 — Classificação dos achados

**[Estado: ANALISE_CRUZADA]**

Classifique cada par e cada item solto:

| Tipo | Critério |
|---|---|
| 🟢 **Elo completo** | Presente nos três lugares (Origem + Rastreabilidade + INDEX) |
| 🔴 **Elo unilateral** | Citado de um lado mas não do recíproco (feature cita a história, mas a história não cita a feature — ou o inverso) |
| 🟠 **Ausente do INDEX** | Par consistente nos dois N3/HU, mas sem linha no `INDEX.md` |
| 🟡 **Status divergente** | Mesmo par com status diferente entre as três fontes |
| ⚫ **Órfão** | História em `_backlog/` sem nenhuma feature *(ok se ainda "A especificar" — sinalize sem tratar como erro)*; ou feature sem `## Origem` *(ok no bottom-up/legado)* |
| ⚠️ **Referência quebrada** | Link aponta para um arquivo/`_backlog/` inexistente |

Um **elo unilateral** é o achado central desta auditoria: deixe explícito qual
lado tem o registro e qual lado falta.

---

## PASSO 4 — Relatório de achados

Apresente o relatório no formato abaixo e pergunte:
> "Encontrei [N] elos unilaterais e [N] outras inconsistências. O relatório está
> correto? Posso gerar as sugestões de patch?"

```markdown
## Relatório de Rastreabilidade História ↔ Feature — [data]

### Escopo varrido
- Histórias (`_backlog/`): [N]
- Features (N3): [N]
- Linhas no INDEX.md: [N]

---

### 🔴 Elos unilaterais (registrados só de um lado)

| História | Feature | Onde consta | Onde FALTA |
|---|---|---|---|
| `STRY0012345` | `USR-PRM-01` | `## Origem` do N3 | `## Rastreabilidade` de `_backlog/stry0012345.md` |

### 🟠 Ausentes do INDEX.md

| História | Feature | Observação |
|---|---|---|
| `STRY0012345` | `USR-PRM-02` | Par consistente nos dois lados, mas sem linha no INDEX |

### 🟡 Status divergente

| História | Feature | Origem (N3) | Rastreab. (HU) | INDEX |
|---|---|---|---|---|
| `STRY0012345` | `USR-PRM-01` | 📋 | 🔄 | 📋 |

### ⚫ Órfãos (informativo)

| Item | Tipo | Observação |
|---|---|---|
| `STRY0099999` | História sem feature | Status "A especificar" — rodar 3A |
| `USR-PRM-09` | Feature sem `## Origem` | Bottom-up/legado — sem história de origem conhecida |

### ⚠️ Referências quebradas

| Origem do link | Aponta para | Problema |
|---|---|---|

---

### Resumo

| Tipo | Qtd |
|---|---|
| 🟢 Elo completo | [N] |
| 🔴 Elo unilateral | [N] |
| 🟠 Ausente do INDEX | [N] |
| 🟡 Status divergente | [N] |
| ⚫ Órfão | [N] |
| ⚠️ Referência quebrada | [N] |
```

---

## PASSO 5 — Sugestões de patch

**[Estado: GERACAO_PATCHES]**

Quando autorizado, para cada achado tratável gere a correção. O princípio é
sempre **fechar o elo nos três lugares** — nunca remover um lado para "casar"
com a ausência do outro (a menos que o usuário confirme que o elo é espúrio).

### 5a — Elo unilateral

Adicione a linha que falta no lado recíproco, espelhando o lado existente.

Se falta no **artefato da história** (`_backlog/[chave].md`), em
`## Rastreabilidade — Features (N3) que realizam esta história`:
```diff
+ | [`[ID]`: Nome da Feature](../[dominio]/[fs]/[arquivo].md) | [Domínio] · [FS] | [status] |
```

Se falta na **`## Origem`** do N3:
```diff
+ | [`STRYxxxxxxx`](../../_backlog/[chave].md) | Criação / Alteração | [critérios cobertos] |
```

### 5b — Ausente do INDEX

Adicione a linha na tabela `## Rastreabilidade: história → spec → código`:
```diff
+ | [`STRYxxxxxxx`](./_backlog/[chave].md) | [[ID]: Nome](./[dominio]/[fs]/[arquivo].md) | [Domínio] | [status] | — | — | — |
```

### 5c — Status divergente

Apresente os valores das três fontes e pergunte qual é o correto antes de
sugerir o alinhamento — não decida sozinho qual prevalece.

### 5d — Referência quebrada

Mostre o link atual e o caminho provável correto (se houver), ou sinalize que o
arquivo destino não existe e pergunte como proceder.

> **No Claude Code (com ferramentas de arquivo):** após aprovação, aplique os
> patches direto no disco. **No fluxo copy-paste:** entregue os blocos `diff`
> para o usuário aplicar manualmente.

---

## PASSO 6 — Conclusão

Após os patches aprovados, conclua:

> "✅ Auditoria de rastreabilidade concluída.
>
> - Elos unilaterais fechados: [N]
> - Linhas adicionadas ao INDEX.md: [N]
> - Status alinhados: [N]
> - Pendências que dependem de decisão: [N] (listadas acima)
>
> O caminho inverso — história → features impactadas — agora está consistente nas
> três fontes. Agende a próxima auditoria para [próximo release / após a próxima
> rodada de 3A/4A]."

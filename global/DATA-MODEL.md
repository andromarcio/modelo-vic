<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_DATA_MODEL_FROM_SQL | atualizado: 2026-06-23 -->
# DATA-MODEL.md
> **Índice e fonte de verdade** para nomenclatura e mapeamento de campos.
> Os modelos detalhados estão fragmentados por domínio em `global/data-models/`
> — cole apenas o fragmento do domínio que está sendo trabalhado.
>
> Os N3 referenciam com: `→ ver DATA-MODEL.md: Entidade [Nome]` e **nunca**
> duplicam Label Dev ou campo banco em suas tabelas.
>
> ℹ️ **Conteúdo de exemplo (genérico)** — domínio Clientes.

---

## Convenção de nomenclatura

| Camada | Convenção | Exemplo | Onde aparece |
|---|---|---|---|
| Entidade | PascalCase singular, português | `Cliente` | **data-models/[dominio].md** (cabeçalho), "Modelos por domínio" |
| Label PO | Português, title case, sem jargão | `Nome completo` | N3 (campos), Gherkin, telas |
| Label Dev | camelCase, português, autoexplicativo | `nomeCompleto` | **data-models/[dominio].md** — apenas aqui |
| Campo banco | snake_case, português ⚠️ | `nome_completo` | **data-models/[dominio].md** — apenas aqui |

> ⚠️ Entidades e campos em **português**. Confirme apenas a caixa dos identificadores
> (snake_case vs. UPPER_SNAKE_CASE) antes de implementar; em engenharia reversa,
> transcreva a origem como está — não traduza.

---

## Campos globais (presentes em todas as tabelas)

Estão implícitos — não precisam ser listados nos arquivos de domínio.

| Label PO | Label Dev | Campo banco | Tipo SQL | Notas |
|---|---|---|---|---|
| Identificador | id | id | NUMBER (sequence) | PK; gerada automaticamente |
| Data de criação | createdAt | created_at | TIMESTAMP WITH TIME ZONE | Gerado automaticamente |
| Data de atualização | updatedAt | updated_at | TIMESTAMP WITH TIME ZONE | Atualizado automaticamente |
| Data de exclusão | deletedAt | deleted_at | TIMESTAMP WITH TIME ZONE | Exclusão lógica (soft delete); null = ativo |

---

## Modelos por domínio

| Domínio | Arquivo | Entidades |
|---|---|---|
| Clientes | [data-models/clientes.md](./data-models/clientes.md) | Cliente |

---

## Enums do sistema

| Enum | Campo banco | Valores | Usado em |
|---|---|---|---|
| SituacaoCadastral | situacao_cadastral | Ativo, Inativo | Cliente.situacaoCadastral |

---

## Campos adicionados recentemente

| Data | Entidade | Label PO | Label Dev | Campo banco | Tipo | N3 de origem |
|---|---|---|---|---|---|---|
| 2026-06-23 | Cliente | Situação cadastral | situacaoCadastral | situacao_cadastral | enum | f-cadastrar (`CLI-GES-01`) |

---

## Relacionamentos

```
(sem relacionamentos — o domínio Clientes possui uma única entidade autocontida)
```

---

## Relacionamentos de seleção (comboboxes)

> Fonte de verdade para campos que, na tela, são uma **combobox/seleção cujas
> opções vêm de outra entidade** (FK com exibição de label).

| Campo (FK) | Entidade origem | Campo-valor | Campo-label | Endpoint origem | Filtro de origem |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

> Nenhuma seleção por FK neste exemplo. `Situação cadastral` é um enum fixo (ver *Enums do sistema*), não uma referência a outra entidade.

---

## Índices e restrições de unicidade

| Tabela | Campos | Tipo | Justificativa |
|---|---|---|---|
| clientes | (cpf) | UNIQUE | CPF é a chave de negócio; único no sistema |
| clientes | (nome_completo) | INDEX | Filtro de pesquisa por Nome |
| clientes | (email) | INDEX | Filtro de pesquisa por E-mail |

> Unicidade aplicada sobre registros ativos (`deleted_at IS NULL`).

---

## Arquivos Lógicos (APF)

> Registro central de ALIs e AIEs do sistema. A contagem de DER **exclui** os 4
> campos globais. **RLR** (= IFPUG RET) e **DER** (= IFPUG DET) determinam a complexidade — ver `global/SIZING.md`.

### ALIs — Arquivos Lógicos Internos

| ALI | Domínio | Entidades constituintes | RLR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|---|
| Cliente | Clientes | Cliente | 1 | 6 | Baixa | 7 | 2026-06-23 |

**Total ALIs: 7 PF** (1 ALI Baixa — 1 RLR / DER ≤ 19)

### AIEs — Arquivos de Interface Externa

| AIE | Sistema externo | Entidades / estruturas usadas | RLR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

**Total AIEs: 0 PF**

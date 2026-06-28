<!-- doc-template-engine: {{VERSION}} | prompt: {{PROMPT_ID}} | atualizado: {{YYYY-MM-DD}} -->
# DATA-MODEL.md
> **Índice e fonte de verdade** para nomenclatura e mapeamento de campos.
> Os modelos detalhados estão fragmentados por domínio em `global/data-models/`
> para otimizar o contexto enviado ao LLM — cole apenas o fragmento do
> domínio que está sendo trabalhado, não o arquivo inteiro.
>
> Os N3 referenciam com: `→ ver DATA-MODEL.md: Entidade [Nome]`
> Os N3 **nunca** duplicam Label Dev ou campo banco em suas tabelas.

---

## Convenção de nomenclatura

| Camada | Convenção | Exemplo | Onde aparece |
|---|---|---|---|
| Entidade | PascalCase singular, português | `ModeloEmail` | **data-models/[dominio].md** (cabeçalho), "Modelos por domínio" |
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
| Identificador | id | id | [tipo PK] | PK; gerada automaticamente |
| Data de criação | createdAt | created_at | [timestamp] | Gerado automaticamente |
| Data de atualização | updatedAt | updated_at | [timestamp] | Atualizado automaticamente |
| Data de exclusão | deletedAt | deleted_at | [timestamp] | Exclusão lógica (soft delete); null = ativo |

---

## Modelos por domínio

| Domínio | Arquivo | Entidades |
|---|---|---|
| [Nome do Domínio] | [data-models/[dominio].md](./data-models/[dominio].md) | [Entidade A, Entidade B] |

---

## Enums do sistema

| Enum | Campo banco | Valores | Usado em |
|---|---|---|---|
| [NomeEnum] | [campo_banco] | [valor A, valor B] | [Entidade].[campo] |

---

## Campos adicionados recentemente

| Data | Entidade | Label PO | Label Dev | Campo banco | Tipo | N3 de origem |
|---|---|---|---|---|---|---|
| [data] | [Entidade] | [Label PO] | [labelDev] | [campo_banco] | [tipo] | [feature] |

---

## Relacionamentos

```
[Entidade A] 1──N [Entidade B]    ([descrição da relação])
```

---

## Relacionamentos de seleção (comboboxes)

> Fonte de verdade para campos que, na tela, são uma **combobox/seleção cujas
> opções vêm de outra entidade** (chave estrangeira com exibição de label).
> Um campo do N3 com tipo `seleção → [Entidade]` referencia uma linha desta tabela.
> O agente de implementação usa estas colunas para resolver a consulta sozinho:
> grava o **campo-valor**, exibe o **campo-label** e busca as opções no **endpoint origem**.

| Campo (FK) | Entidade origem | Campo-valor | Campo-label | Endpoint origem | Filtro de origem |
|---|---|---|---|---|---|
| [exemploId] | [Entidade] | id | [labelDev] | GET /api/v1/[recurso] | apenas ativos (deletedAt IS NULL) |

**Significado das colunas:**
- **Campo (FK)** — Label Dev do campo que armazena a referência; termina em `Id`. É uma FK.
- **Entidade origem** — entidade de onde vêm as opções; deve existir em "Modelos por domínio".
- **Campo-valor** — o que é gravado no banco. Quase sempre o `id` da entidade origem.
- **Campo-label** — Label Dev exibido na combobox (ex: `nomeCompleto`, `razaoSocial`).
- **Endpoint origem** — rota de coleção que retorna as opções (paginada, com `?search=` para autocomplete). **Nunca** um endpoint novo dedicado — reusa a coleção da entidade.
- **Filtro de origem** — restrição de negócio sobre quais registros podem aparecer (ex.: "apenas ativos").

> A **estratégia de carga** (lista completa vs. autocomplete por digitação) é decisão
> de cada feature e fica no N3 (coluna Validação do campo), não aqui.

---

## Índices e restrições de unicidade

| Tabela | Campos | Tipo | Justificativa |
|---|---|---|---|
| [tabela] | (campo) | UNIQUE / INDEX | [justificativa] |

---

## Arquivos Lógicos (APF)

> Registro central de ALIs e AIEs do sistema.
> Mantido via atualização dos fragmentos `global/data-models/[dominio].md`.
> A contagem de DER **exclui** os campos globais (id, createdAt, updatedAt, deletedAt).
> **RLR** (Registro Lógico Referenciado = IFPUG RET) e **DER** (Dado Elementar Referenciado = IFPUG DET) determinam a complexidade — ver `global/SIZING.md`.

### ALIs — Arquivos Lógicos Internos

| ALI | Domínio | Entidades constituintes | RLR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|---|
| [Nome] | [Domínio] | [Entidade] | 1 | [N] | a definir ⚠️ | a definir | [AAAA-MM-DD] |

**Total ALIs: a definir** *(dimensionar via PROMPT_3B / SIZING.md)*

### AIEs — Arquivos de Interface Externa

| AIE | Sistema externo | Entidades / estruturas usadas | RLR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|---|
| [Nome] ⚠️ | [sistema externo] | [estrutura usada] | a definir | a definir | a definir | a definir | [AAAA-MM-DD] |

**Total AIEs: a definir**

---

> ℹ️ **Como manter esta seção**
> 1. Ao criar ou alterar uma entidade num fragmento `data-models/[dominio].md`,
>    atualize a linha do ALI correspondente (RLR, DER, Complexidade, PF).
> 2. Se uma nova entidade formar um ALI novo, adicione a linha aqui
>    **e** anote o ALI no cabeçalho da entidade no fragmento do domínio.
> 3. Entidades de suporte (tabelas de junção, tabelas de auditoria) geralmente
>    não formam ALI próprio — pertencem ao ALI da entidade principal.

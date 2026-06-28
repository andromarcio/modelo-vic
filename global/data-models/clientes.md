<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_3B | atualizado: 2026-06-23 -->
# Data Model: Clientes
> Fragmento do DATA-MODEL.md — cole apenas este arquivo nas sessões
> que envolvam o domínio **Clientes** (feature set Gestão de Clientes).
>
> **ALIs deste domínio**: Cliente
>
> Convenções (MASTER): exclusão lógica, PK por *sequence*.
> Campos globais implícitos: `id`, `createdAt`, `updatedAt`, `deletedAt`.
>
> ℹ️ **Conteúdo de exemplo (genérico)**.

---

## Cliente
> **ALI: Cliente** · entidade principal · tabela `clientes`

Pessoa física cadastrada no sistema. Cadastrada em `CLI-GES-01`, editada em
`CLI-GES-04`, visualizada em `CLI-GES-03`, pesquisada em `CLI-GES-02` e
excluída (lógica) em `CLI-GES-05`.

| Label PO | Label Dev | Campo banco | Tipo SQL | Obrigatório | Notas |
|---|---|---|---|---|---|
| Nome completo | nomeCompleto | nome_completo | VARCHAR2(150) | sim | → ver FIELD-DICTIONARY: Nome de pessoa |
| CPF | cpf | cpf | VARCHAR2(11) | sim | Somente dígitos; **chave de negócio única**. → ver FIELD-DICTIONARY: CPF |
| E-mail | email | email | VARCHAR2(120) | sim | → ver FIELD-DICTIONARY: E-mail |
| Telefone | telefone | telefone | VARCHAR2(11) | não | Somente dígitos. → ver FIELD-DICTIONARY: Telefone |
| Data de nascimento | dataNascimento | data_nascimento | DATE | não | → ver FIELD-DICTIONARY: Data de nascimento |
| Situação cadastral | situacaoCadastral | situacao_cadastral | VARCHAR2(10) | sim | enum **SituacaoCadastral**; padrão `Ativo` no cadastro |

---

## Arquivos Lógicos deste domínio

> DER calculado excluindo os 4 campos globais (id, createdAt, updatedAt, deletedAt).

| ALI / AIE | Tipo | Entidades constituintes | RLR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|---|
| Cliente | ALI | Cliente (principal) | 1 | 6 | Baixa | 7 | 2026-06-23 |

**Total deste domínio: 7 PF** (1 ALI Baixa; sem AIE)

<details>
<summary>Memória de cálculo (DER por entidade)</summary>

- **Cliente** — DER = 6 (nomeCompleto, cpf, email, telefone, dataNascimento, situacaoCadastral) → 1 RLR / 6 DER → Baixa → **7 PF**

</details>

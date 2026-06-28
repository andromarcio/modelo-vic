# Data Model: [Nome do Domínio]
> Fragmento do DATA-MODEL.md — cole apenas este arquivo nas sessões
> que envolvam o domínio [Nome do Domínio].
>
> **ALIs deste domínio**: [ALI 1] · [ALI 2]
> Detalhes de contagem: seção `## Arquivos Lógicos` no rodapé deste arquivo.

---

<!--
  CONVENÇÃO DE ALI
  ─────────────────────────────────────────────────────────────────
  Cada entidade deve ter uma anotação de ALI em seu cabeçalho:

  > **ALI: [Nome do ALI]** · entidade principal
  > **ALI: [Nome do ALI]** · entidade de suporte ([descrição do papel])
  > **AIE: [Nome da AIE]** · estrutura externa de [Sistema]

  Regras:
  - Uma entidade pertence a exatamente um ALI/AIE.
  - Tabelas de junção pura (sem campos próprios além das FKs) pertencem
    ao ALI da entidade principal do relacionamento.
  - Tabelas de auditoria (AuditLog) geralmente são um ALI próprio no
    domínio Identity — não criar ALI duplicado por domínio.
  - AIE: apenas quando o sistema consome dados de sistema externo
    (ex: estrutura de resposta do SendGrid, payload do Stripe).
  ─────────────────────────────────────────────────────────────────
-->

## [Entidade Principal]
> **ALI: [Nome do ALI]** · entidade principal

| Label PO | Label Dev | Campo banco | Tipo SQL | Obrigatório | Notas |
|---|---|---|---|---|---|
| [campo] | [camelCase] | [snake_case] | [tipo] | sim / não / automático | [notas] |

---

## [Entidade de Suporte]
> **ALI: [Nome do ALI]** · entidade de suporte ([papel no ALI])

| Label PO | Label Dev | Campo banco | Tipo SQL | Obrigatório | Notas |
|---|---|---|---|---|---|
| [campo] | [camelCase] | [snake_case] | [tipo] | sim / não / automático | [notas] |

---

## Arquivos Lógicos deste domínio

> DER calculado excluindo os 5 campos globais (id, organizationId, createdAt, updatedAt, deletedAt).
> **RLR** (Registro Lógico Referenciado = IFPUG RET) e **DER** (Dado Elementar Referenciado = IFPUG DET) determinam a complexidade — ver `global/SIZING.md`.

| ALI / AIE | Tipo | Entidades constituintes | RLR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|---|
| [Nome do ALI] | ALI | [Entidade principal] (principal) · [Entidade de suporte] (subgrupo) | [N] | [N] | Baixa / Média / Alta | [PF] | [AAAA-MM-DD] |
| [Nome da AIE] | AIE | [estrutura externa] | [N] | [N] | Baixa / Média / Alta | [PF] | [AAAA-MM-DD] |

**Total deste domínio: [N] PF**

<details>
<summary>Memória de cálculo</summary>

**ALI: [Nome]**
- RLR: [N] ([justificativa dos subgrupos])
- DER [Entidade 1]: [lista de campos contados] = [N]
- DER [Entidade 2]: [lista de campos contados] = [N]
- DER total: **[N]**
- Complexidade: RLR [N] × DER [N] → tabela SIZING.md → **[Complexidade] → [PF] PF**

</details>

<!-- doc-template-engine: {{VERSION}} | prompt: {{PROMPT_ID}} | atualizado: {{YYYY-MM-DD}} -->
# CONTAGEM-PF.md
> **Registro consolidado da contagem de Pontos de Função (APF / IFPUG CPM 4.3.1)**
> do sistema. Reúne num só lugar **todos os Processos Elementares (PE)** — as
> Funções de Transação EE/SE/CE — e **todas as entidades que possuem contagem**
> — as Funções de Dados ALI/AIE.
>
> Este arquivo é o **consolidado** (índice de leitura); as **fontes de cálculo** são:
> - **Funções de Transação (PE)** → a seção `## Métricas de tamanho` de cada **N3**.
> - **Funções de Dados (ALI/AIE)** → `global/DATA-MODEL.md → ## Arquivos Lógicos (APF)`
>   (validade do ALI/AIE em `global/ALI-AIE-MAP.md`).
>
> Critérios de contagem: `global/SIZING.md`.
>
> ℹ️ **Template do kit** — preencha as tabelas com os PE e entidades reais do seu
> sistema. As linhas abaixo são **exemplos** entre colchetes; substitua-as.

---

## ⚙️ Regra de manutenção (LEIA ANTES DE EDITAR)

> **Gatilho:** *sempre que um N3 for criado/alterado ou uma entidade (ALI/AIE) for
> criada/alterada, a contagem deve ser revisada e — havendo alteração — este arquivo
> deve ser atualizado.*

Procedimento sempre que mexer num N3 ou numa entidade:

1. **Reconte na fonte** seguindo `global/SIZING.md`:
   - mudou um N3? → revise a tabela `## Métricas de tamanho` do próprio N3;
   - mudou uma entidade/ALI? → revise a linha em `global/DATA-MODEL.md → ## Arquivos Lógicos (APF)`.
2. **Compare com o valor registrado aqui.** Se for igual, nada a fazer (registre, se quiser, que a contagem permanece inalterada no Changelog do N3).
3. **Havendo alteração**, atualize **neste arquivo**: a linha do PE/entidade, os subtotais e o **Total do sistema**.
4. **Propague o total** para `modules/INDEX.md` (tabela de rastreabilidade + linha de total).
5. **Registre** a recontagem no `## Changelog` do N3 (ou no histórico desta página, para mudança de entidade).

> ⚠️ **Mudança puramente técnica** que **não** altera a lógica de processamento sob a
> ótica do usuário (tipo físico de campo, otimização de banco, refactor interno)
> **não gera nova contagem** — ver `SIZING.md → Regras de medição de serviços, item 5`.
> Nesse caso, a contagem permanece e este arquivo **não** muda.

> Regra de ouro: **as fontes (N3 e DATA-MODEL.md) mandam; este arquivo as espelha.**
> Nunca registre aqui um número que não exista na fonte.

---

## 1. Funções de Transação — Processos Elementares (PE)

> Unidade de contagem = a **feature (N3) inteira** (front + BFF), não o endpoint.
> Ver *Arquitetura BFF* em `global/SIZING.md`. Cada PE classifica-se como **EE**, **SE** ou **CE**.

| # | Feature (N3) | Domínio | Tipo | ALR | DER | Complexidade | PF | Data | Status |
|---|---|---|---|---|---|---|---|---|---|
| [ID] | [Nome da feature](../modules/[dominio]/[feature-set]/[feature].md) | [Domínio] | [EE/SE/CE] | [N] | [N] | [Baixa/Média/Alta] | [PF] | [AAAA-MM-DD] | [📋/🔄/✅] |

**Subtotal Funções de Transação: [N] PF** ([N] PE).

> Features `❌ Deprecadas` saem do total vigente (mantêm-se no histórico).

---

## 2. Funções de Dados — entidades com contagem (ALI / AIE)

> Espelho de `global/DATA-MODEL.md → ## Arquivos Lógicos (APF)`. A contagem de DER
> **exclui** os campos globais (id, createdAt, updatedAt, deletedAt). Validade do
> ALI/AIE em `global/ALI-AIE-MAP.md`.

### ALIs — Arquivos Lógicos Internos

| ALI | Domínio | Entidades constituintes | RLR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|---|
| [Nome do ALI] | [Domínio] | [Entidade(s)] | [N] | [N] | [Baixa/Média/Alta] | [PF] | [AAAA-MM-DD] |

**Subtotal ALIs: [N] PF.**

### AIEs — Arquivos de Interface Externa

| AIE | Sistema externo | Entidades / estruturas usadas | RLR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|---|
| [Nome do AIE] | [Sistema] | [Entidade(s)] | [N] | [N] | [Baixa/Média/Alta] | [PF] | [AAAA-MM-DD] |

**Subtotal AIEs: [N] PF.**

**Subtotal Funções de Dados: [N] PF.**

---

## 3. Total do sistema

| Categoria | PF |
|---|---|
| Funções de Transação (PE: EE/SE/CE) | [N] |
| Funções de Dados (ALI/AIE) | [N] |
| **Total não ajustado (PF)** | **[N]** |

> **PF não ajustado** (FSM puro) — não adotar VAF/PF ajustado (ver `SIZING.md`).

---

## Histórico de recontagens

| Data | Autor | O que mudou | Δ PF | Total |
|---|---|---|---|---|
| [AAAA-MM-DD] | [Autor] | [Carga inicial / recontagem] | [±N / —] | [N] |

---

## Links
[SIZING.md](./SIZING.md) · [DATA-MODEL.md](./DATA-MODEL.md) · [ALI-AIE-MAP.md](./ALI-AIE-MAP.md) · [MASTER.md](./MASTER.md) · [INDEX geral](../modules/INDEX.md)

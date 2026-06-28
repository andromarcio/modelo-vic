# PROMPT_CONTAGEM — Contagem de Pontos de Função (APF) por escopo

> **Quando usar**: você quer **contar (ou recontar) Pontos de Função** de um
> recorte do sistema já especificado — uma **feature**, um **feature set** ou um
> **domínio** inteiro — em **uma única passada**, sem a elicitação
> pergunta-a-pergunta. O prompt lê a documentação existente (N3, DATA-MODEL),
> aplica as regras do IFPUG CPM 4.3.1, **grava a contagem na fonte onde ela já
> mora** e, **só após a sua confirmação**, atualiza o consolidado
> `global/CONTAGEM-PF.md`.
>
> **Quem participa**: Dev/Analista de Métricas (conduz) + Tech Lead/PO (confirma).
>
> **Insumo necessário**:
> - Um **código de escopo** (ver *Passo 0*): feature, feature set ou domínio.
> - Os N3 do escopo já especificados (idealmente pós-`PROMPT_3B`).
> - `global/DATA-MODEL.md` e os fragmentos `global/data-models/[dominio].md`.
> - Critérios em `global/SIZING.md` (regras CAIXA — **prevalecem** sobre o genérico).
> - `global/ALI-AIE-MAP.md` (validade de cada ALI/AIE).
>
> **Skill obrigatória**: acione a skill **`apf-cpm`** (IFPUG CPM 4.3.1) para todas
> as regras de classificação, contagem de DER/ALR/RLR e complexidade. O `SIZING.md`
> traz os ajustes da organização; em conflito, **vale o `SIZING.md`**.
>
> **Entrega — numa única passada, depois um único portão de confirmação**:
> 1. Contagem gravada **na fonte**: tabela `## Métricas de tamanho` de cada N3
>    (transações) e `## Arquivos Lógicos (APF)` do DATA-MODEL / fragmento do
>    domínio (funções de dados) — **cada linha com a coluna `Data`**.
> 2. Tabela consolidada do escopo + subtotais + total + lista de ⚠️/❓.
> 3. **Após confirmação**: espelho em `global/CONTAGEM-PF.md`, total propagado
>    para `modules/INDEX.md` e linha no *Histórico de recontagens*.
>
> **Próximo passo**: havendo lacuna de especificação (❓/⚠️) que muda o número,
> ajuste a **fonte** (N3 via `PROMPT_3B`/`4B`, ou o DATA-MODEL) e rode este prompt
> de novo no mesmo escopo.

---

## INSTRUÇÕES PARA O CLAUDE

Você é o **Analista de Métricas**. Diferente dos prompts de elicitação (1A/2A/3A),
aqui você **não conduz entrevista** — você **conta numa única passada** a partir do
que já está documentado, deixando toda lacuna explicitamente marcada. A única pausa
permitida é o **portão de confirmação** antes de tocar o consolidado.

### Princípios fundamentais

1. **A contagem reflete o que está documentado.** Cada DER, ALR, RLR, tipo
   (EE/SE/CE/ALI/AIE) e complexidade tem de ser **rastreável** a um campo, regra,
   dependência ou entidade do N3/DATA-MODEL. Ver `SIZING.md → APF, Princípio`.

2. **Não estimar, não inventar.** Se um campo, leitura ou entidade for necessário ao
   número mas **não estiver documentado**, **registre a lacuna com ⚠️** e *não feche*
   essa linha — em vez de chutar. O número que você grava é só o que a fonte sustenta.

3. **A fonte manda; o consolidado espelha.** As fontes de cálculo são a seção
   `## Métricas de tamanho` de cada N3 (transações) e `DATA-MODEL.md → ## Arquivos
   Lógicos (APF)` (dados). O `CONTAGEM-PF.md` **nunca** recebe um número que não exista
   na fonte.

4. **Unidade de contagem = a feature (N3) inteira (front + BFF), não o endpoint.**
   Ver `SIZING.md → Arquitetura BFF`.

5. **Fronteira das funções de dados = a aplicação, não a feature.** Mesmo quando o
   escopo pedido é **uma feature**, resolva as **funções de dados lendo o DATA-MODEL do
   domínio inteiro** — uma entidade pode ser *mantida* por outra feature do mesmo
   domínio (logo é ALI), e olhá-la por uma feature só a faria parecer AIE. As
   **transações** ficam restritas ao escopo pedido; as **funções de dados** são sempre
   resolvidas no nível do domínio.

6. **Mudança puramente técnica não gera recontagem** (tipo físico de campo, refactor,
   otimização de banco) — `SIZING.md → Regras de medição, item 5`. Nesses casos
   mantenha a linha e a `Data` anteriores.

7. **PF não ajustado (FSM puro).** A organização **não** adota VAF/PF ajustado.

---

## Passo 0 — Resolver o escopo

Receba um **código de escopo** e determine o nível:

| Formato informado | Nível | O que entra na contagem |
|---|---|---|
| `f-<slug>` ou ID de feature (ex.: `CAD-GFG-03`) ou caminho de um `f-*.md` | **Feature** | 1 N3 (transações dessa feature) + funções de dados do **domínio** dela |
| `g-<slug>` ou prefixo de feature set | **Feature Set** | todas as features `f-*` do `g-` + funções de dados do **domínio** |
| nome do módulo (ex.: `contagem-metricas`) | **Domínio** | todos os feature sets do módulo + todas as funções de dados do domínio |

- Liste os N3 que entram no escopo e o **domínio** ao qual pertencem. Se o código for
  ambíguo (casa com mais de um item), **pergunte qual** — esta é a única pergunta
  admitida no Passo 0.
- Declare explicitamente: **Tipo de contagem** (desenvolvimento / aplicação-baseline /
  melhoria), **Fronteira** (a sigla/domínio, conforme `SIZING.md → Fronteira`) e
  **Escopo** (a lista de N3).

---

## Passo 1 — Funções de Transação (PE) do escopo

Para **cada N3 no escopo**, usando a skill `apf-cpm`:

1. **Verificar se é Processo Elementar** (significativo, completo, autocontido, deixa o
   sistema consistente). Navegação, menus e telas que são só passo de outro PE **não
   contam**.
2. **Verificar unicidade** (mesmo conjunto de DER + ALR + lógica = mesmo PE).
3. **Classificar EE/SE/CE** pela intenção primária + as 13 formas de lógica. **Liste as
   formas de lógica** que justificam o tipo (a skill exige isso em caso de ambiguidade).
4. **Contar ALR** — ALIs/AIEs lidos ou mantidos pela transação (seção `## Dependências`
   e tabelas referenciadas no `## API`). Todo ALR deve existir no `ALI-AIE-MAP.md`; se
   não existir, ⚠️.
5. **Contar DER** — campos distintos que cruzam a fronteira (entrada ∪ saída) **+1 DER**
   para a capacidade de mensagens **+1 DER** para a ação que dispara. Campos de controle
   (HTTP status, organizationId, cursor) **não contam**. Cada DER rastreável à tabela
   `## Campos`/`Campos automáticos` do N3.
6. **Complexidade** pelas faixas de `SIZING.md` (tabela EE, ou tabela SE/CE) → **PF**
   pela tabela de pontos.

Aplique as **regras CAIXA** do `SIZING.md` que incidirem (combobox que carrega ALI/AIE
conta como CE/SE; consulta dinâmica = uma função; batch conforme item 12; migração
conforme item 2; etc.).

---

## Passo 2 — Funções de Dados (ALI/AIE) do domínio

> Sempre no nível do **domínio** do escopo (Princípio 5).

Para cada entidade em `global/data-models/[dominio].md` / `DATA-MODEL.md`:

1. **Classificar**: **ALI** (mantida pelo sistema), **AIE** (de sistema externo,
   referenciada e mantida por outra aplicação) ou **não conta** (dado de código,
   entidade sem atributos requeridos, associativa só com FKs — ver `apf-cpm`).
2. **Contar DER** — cada campo da entidade; **excluir** os 4 campos globais (`id`,
   `createdAt`, `updatedAt`, `deletedAt`) e `organizationId`.
3. **Contar RLR** — subgrupos lógicos; na ausência, RLR = 1.
4. **Complexidade** pela tabela de dados (`SIZING.md`) → **PF**.
5. AIE pela **visão de negócio do sistema contado** (`SIZING.md`, item 4), não pela
   modelagem física do sistema externo.

---

## Passo 3 — Gravar a contagem NA FONTE (onde já mora hoje)

> Ainda **não** toque em `CONTAGEM-PF.md`.

**Transações → seção `## Métricas de tamanho` de cada N3.** Use exatamente este
cabeçalho (acrescente a coluna `Data` se a tabela existente ainda não a tiver):

```markdown
| Função de Transação | Tipo | ALR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|
| <nome do PE> | EE/SE/CE | <n> | <n> | Baixa/Média/Alta | <pf> | AAAA-MM-DD |

**Total: <n> PF.**
```

- `Data` = a data em que a linha foi contada/atualizada (hoje, formato ISO `AAAA-MM-DD`).
- Linha **inalterada numa recontagem** mantém a `Data` anterior (Princípio 6).
- Registre uma entrada no `## Changelog` do N3 (tipo "Contagem"/"Recontagem").

**Funções de dados → `global/data-models/[dominio].md → ## Arquivos Lógicos` (fonte de
cálculo) e o índice `global/DATA-MODEL.md → ## Arquivos Lógicos (APF)`** (acrescente a
coluna `Data` ao final de cada tabela ALI/AIE se ainda não existir). Atualize **os dois**
— nunca um sem o outro.

---

## Passo 4 — Apresentar o consolidado do escopo e PARAR

Mostre, **sem ainda alterar o `CONTAGEM-PF.md`**:

1. **Cabeçalho da contagem**: tipo de contagem, fronteira, escopo (lista de N3), data.
2. **Funções de Transação** do escopo (nome · tipo · ALR · DER · complexidade · PF ·
   Data · origem N3).
3. **Funções de Dados** do domínio (ALI/AIE · RLR · DER · complexidade · PF · Data).
4. **Subtotais** (Transações / Dados) e **Total não ajustado (PF)**.
5. **Lacunas e divergências** ⚠️/❓ — cada uma com a fonte e o que falta para fechar.
6. Em caso de ambiguidade EE/SE/CE ou ALI/AIE, **mostre o raciocínio** (intenção
   primária + formas de lógica) antes de cravar.

Encerre pedindo **confirmação explícita**:

> *"Confirma a contagem acima para eu espelhar em `global/CONTAGEM-PF.md` e propagar o
> total? (responda **confirmo** / aponte ajustes)"*

**Não prossiga sem o "confirmo".**

---

## Passo 5 — Após confirmação: atualizar o consolidado

Só execute depois do "confirmo".

1. **Espelhar em `global/CONTAGEM-PF.md`**:
   - inserir/atualizar as linhas de PE em `## 1. Funções de Transação` (com a coluna
     `Data`);
   - inserir/atualizar as linhas de ALI/AIE em `## 2. Funções de Dados` (com `Data`);
   - **recalcular** os subtotais e o `## 3. Total do sistema`.
   - Acrescente a coluna `Data` aos cabeçalhos do `CONTAGEM-PF.md` caso ainda não exista.
   - **Regra de ouro**: nenhum número aqui que não exista na fonte (Passo 3).
2. **Propagar o total** para `modules/INDEX.md` (tabela de rastreabilidade + linha de
   total). Features `❌ Deprecadas` saem do total vigente.
3. **Registrar** no `## Histórico de recontagens` do `CONTAGEM-PF.md` uma linha:
   `| Data | Autor | O que mudou | Δ PF | Total |`.

Ao final, confirme o que foi alterado (arquivos tocados, Δ PF, novo total).

---

## Checklist de saída

```
[ ] Escopo resolvido e nível declarado (feature / feature set / domínio)
[ ] Tipo de contagem, fronteira e escopo declarados
[ ] Transações classificadas com formas de lógica justificadas (skill apf-cpm)
[ ] Funções de dados resolvidas no nível do DOMÍNIO
[ ] DER/ALR/RLR rastreáveis ao N3/DATA-MODEL — nada estimado
[ ] Lacunas marcadas com ⚠️/❓ (não fechadas com chute)
[ ] Contagem gravada NA FONTE (N3 + DATA-MODEL) com coluna Data
[ ] Confirmação explícita obtida ANTES de tocar o CONTAGEM-PF
[ ] CONTAGEM-PF espelhado + total propagado ao INDEX.md + histórico registrado
```

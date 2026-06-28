<!-- doc-template-engine: {{VERSION}} | prompt: {{PROMPT_ID}} | atualizado: {{YYYY-MM-DD}} -->
<!--
  CONVENÇÃO DE VISIBILIDADE
  ─────────────────────────────────────────────────────────────────
  Blocos <div class="dev-only"> contêm detalhes técnicos.
  Versão PO  → CSS: .dev-only { display: none; }
  Versão DEV → sem CSS adicional
  ─────────────────────────────────────────────────────────────────
-->

# [Nome da Feature]
> **Nível 3** - Feature Set: [Nome do Feature Set] — Domínio: [Nome do Domínio] - `[SIGLA]-[SFS]-[01]`

## Descrição
[Descrição em 1-2 frases do que esta feature faz, em linguagem de negócio,
para alguém que nunca viu o sistema.]

---

## Origem

<!--
  Histórias de usuário (ServiceNow) que originaram ou alteraram esta feature.
  Elo recíproco da seção "Rastreabilidade" do artefato da história em
  `modules/_backlog/[chave].md`. Relação M:N: uma feature pode atender a
  várias histórias; uma história pode gerar várias features.
  A chave do ServiceNow é a fonte de verdade — não inventar IDs aqui.
-->

| História (ServiceNow) | Tipo | Critérios cobertos |
|---|---|---|
| [`STRYxxxxxxx`](../../_backlog/[chave].md) | Criação / Alteração | [quais critérios de aceite desta história esta feature realiza] |

---

## Superfície

<!--
  Classifica COMO a feature se manifesta na interface — marcador escaneável
  que distingue uma feature com UI dedicada de uma ação embutida em outra tela.

  - **Tela própria** — a feature tem página/rota ou formulário dedicado.
  - **Ação em tela** — a feature é disparada de dentro de outra tela
    (botão/ícone em listagem, item de menu de contexto, modal de confirmação).
    Indicar a feature/tela de origem.

  Esta linha apenas classifica. O detalhamento de comportamento fica em
  "## Comportamento de tela → Onde fica". O mapa tela↔feature (N:N), quando
  uma tela atende várias features, é consolidado no N2 (seção Telas).
-->

**[Tela própria | Ação em tela]** — [se tela própria: rota `/...`; se ação em tela: origem: [Feature/Tela] (`/rota`)]

---

## Regras de negócio

<!--
  Regras canônicas: referenciar o dicionário em vez de repetir.
  Regras de domínio: referenciar o N1 em vez de repetir.
  Regras específicas desta feature: descrever aqui.

  REGRA ≠ COMPORTAMENTO — uma regra é a invariante/condição ("o quê"),
  não a reação do sistema ("como"). Apare a cauda de comportamento:
    ✗ "...todos os obrigatórios preenchidos e válidos; caso contrário,
       não salva e exibe mensagem conforme o Design System."
    ✓ "...todos os obrigatórios preenchidos e válidos."
  A reação ("não salva", "exibe mensagem", bloqueio) vira CENÁRIO em
  "## Cenários". E "conforme o Design System" não é texto final: é gatilho
  para resolver a mensagem no MESSAGE-DICTIONARY/FIELD-DICTIONARY e escrever
  o TEXTO LITERAL no cenário (ou usar o marcador BASELINE de validação).
-->

1. [Regra específica desta feature em linguagem de negócio]
   → ver RULES-DICTIONARY: [nome da regra] *(se for regra canônica)*
   → ver [N1 do domínio]: Regras transversais de negócio: [N] *(se for regra de domínio)*

2. [Regra específica]

---

## Cenários

```gherkin
Feature: [Nome da feature em linguagem natural]

  Background:
    Given que o usuário está autenticado na organização "[org]"
    And [contexto adicional comum a todos os cenários]

  # ── Caminho feliz ──────────────────────────────────────────────

  Scenario: [Descrição do cenário principal]
    Given [estado inicial em linguagem de negócio]
    When [ação do usuário]
    Then [resultado esperado]
    And [efeito colateral esperado]

  # ── Erros de validação ─────────────────────────────────────────

  Scenario: [Campo obrigatório ausente]
    When o usuário deixa o campo "[Label PO]" vazio
    And clica em "[botão de ação]"
    Then o sistema exibe abaixo do campo: "[mensagem de erro]"

  Scenario: [Formato inválido]
    When o usuário preenche "[Label PO]" com "[valor inválido]"
    Then o sistema exibe abaixo do campo: "[mensagem de erro]"
    # ← FIELD-DICTIONARY: [nome do campo] *(se for campo canônico)*

  # ── Conflitos com dados existentes ────────────────────────────

  Scenario: [Duplicata ou conflito]
    Given que já existe [registro] com [dado conflitante]
    When o usuário tenta [ação]
    Then o sistema exibe: "[mensagem de conflito]"

  # ── Restrições de acesso ───────────────────────────────────────

  Scenario: [Perfil sem permissão]
    Given que o usuário autenticado tem perfil "[perfil]"
    When o usuário tenta [ação]
    Then o sistema exibe: "[mensagem de acesso negado]"

  # ── Estados especiais ──────────────────────────────────────────

  Scenario: [Situação especial do sistema]
    Given que [estado especial]
    When o usuário tenta [ação]
    Then [comportamento alterado]
    And o sistema exibe: "[mensagem contextual]"
```

---

## Campos

<!--
  Esta tabela usa apenas Label PO e regras em linguagem de negócio.
  A nomenclatura técnica (Label Dev e campo banco) está centralizada
  no DATA-MODEL.md — não duplicar aqui.
-->

| Label PO | Tipo | Obrigatório | Validação |
|---|---|---|---|
| [Nome do campo em português] | [texto / número / data / lista de opções / sim·não / arquivo] | sim / não / automático | [regras em linguagem natural] |

*[Notas sobre dependências entre campos, se houver.]*

---

## Campos automáticos

| Label PO | Valor | Quando |
|---|---|---|
| [campo] | [valor fixo ou calculado em linguagem natural] | [momento — ex: "no momento do salvamento"] |

---

## Comportamento de tela

### Onde fica
[Descrever em qual rota e componente a feature aparece:
formulário em página própria, modal, botão em listagem, etc.]

### Estados da tela

| Estado | Comportamento |
|---|---|
| Loading | [o que exibir durante o processamento] |
| Erro de validação | [como exibir erros de campo] |
| Erro de servidor | [toast ou mensagem genérica] |
| Sucesso | [toast, redirecionamento ou relatório] |
| Empty state | [quando e o que exibir se não há dados] |

---

## Métricas de tamanho

<!--
  Preencher após aprovação do N3 técnico (PROMPT_3B) e antes do início do desenvolvimento.
  Responsável: Dev que especificou o N3. Revisão: Tech Lead do domínio.
  Critérios de contagem: ver global/SIZING.md

  IMPORTANTE — Arquitetura BFF (Java + Angular):
  A unidade de contagem é a FEATURE (N3) inteira, não o endpoint (ver global/SIZING.md).
  O front e o BFF são camadas internas da mesma feature: ter o backend em BFF interno
  NÃO é, por si só, motivo para não contar. A feature conta se satisfaz os critérios de
  processo elementar (PE) e se classifica como EE/SE/CE.
  Registrar aqui apenas Funções de Transação (EE, SE, CE).
  Funções de Dados (ALI, AIE) são contadas centralmente no DATA-MODEL.md.
-->

| Função de Transação | Tipo | ALR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|
| [Nome da Feature] | [EE / SE / CE] | [N] | [N] | Baixa / Média / Alta | [3/4/5/6/7] | [AAAA-MM-DD] |

> **ALR** = nº de ALIs/AIEs lidos ou mantidos pela transação · **DER** = campos no body/query + campos na resposta de sucesso. O par ALR × DER define a complexidade pela tabela de Funções de Transação do `global/SIZING.md`. · **Data** = quando a linha foi contada/atualizada (ISO `AAAA-MM-DD`); linha inalterada numa recontagem mantém a data anterior.
> Endpoints consumidos exclusivamente pelo frontend deste sistema (BFF interno) **não são contados**.

<details>
<summary>Memória de cálculo (ALR e DER por transação)</summary>

- **[Nome da Feature]** — ALR = [N] ([quais ALIs/AIEs: ex. Entidade X lida + Entidade Y mantida]); DER = [N] ([campos contados]) → tabela [EE | SE/CE] do SIZING.md → **[Complexidade] → [PF] PF**

</details>

**Total: [N] PF**

---

<div class="dev-only">

## Mapeamento de campos
→ ver DATA-MODEL.md: Entidade [Nome da Entidade]

<!--
  Todos os campos desta feature — Label Dev, campo banco, tipo SQL
  e constraints — estão centralizados no DATA-MODEL.md.
  Campos novos aprovados durante a sessão devem ser adicionados
  ao DATA-MODEL.md antes de iniciar a implementação.
-->

---

## Cenários técnicos adicionais

```gherkin
  # ── Comportamento técnico ──────────────────────────────────────

  Scenario: [Cenário técnico — sessão, cookies, formato de erro HTTP]
    Given [estado técnico]
    When [ação técnica]
    Then [resultado técnico com formato JSON ou HTTP status]
```

---

## Mapeamento de erros (código interno → mensagem ao usuário)

| Código | HTTP | Mensagem exibida ao usuário |
|---|---|---|
| `[ENTIDADE_ERRO]` | [código] | "[mensagem em português]" |

---

## API

### [MÉTODO] /api/v1/[rota]
**Acesso**: [público / autenticado — roles `[role1]`, `[role2]`]

**Body / Query params**:
```typescript
{
  [labelDev]: tipo        // Label PO: [Label PO] — obrigatório/opcional
  [labelDev]?: tipo       // Label PO: [Label PO] — opcional
}
// Tipos e constraints completos: ver DATA-MODEL.md: Entidade [Nome]
```

**Resposta de sucesso** — HTTP [código]:
```json
{
  "data": {
    "id": "uuid"
  },
  "meta": null
}
```

**Respostas de erro**:

| HTTP | Code | Situação |
|---|---|---|
| [código] | `[ENTIDADE_ERRO]` | [quando ocorre] |

---

## Eventos

### Publicados
| Evento | Quando | Payload | Consumidores |
|---|---|---|---|
| `[entidade.acao]` | [quando] | `{ organizationId, [id] }` | [quem consome] |

### Consumidos
| Evento | Publicado por | Reação |
|---|---|---|
| `[entidade.acao]` | [Domínio] | [o que faz ao receber] |

---

## AuditLog

```typescript
logAction({
  organizationId: context.organizationId,
  userId: context.userId,
  action: '[entidade.acao]',
  targetEntity: '[Entidade]',
  targetId: [entidade].id,
  metadata: {
    // campos relevantes usando Label Dev
    // → nomes completos em DATA-MODEL.md: Entidade [Nome]
  }
})
```

---

## Arquivos a criar ou alterar

```
[caminho/arquivo.ts]     ← [o que faz]
[caminho/arquivo.tsx]    ← [o que faz]
```

---

## Dependências

- **[Lib/Serviço]** — [para que é usado]

</div>

---

## Implementação

| Item | Repositório | Caminho | Branch/Tag |
|---|---|---|---|
| [endpoint/componente/job] | [repo] | [caminho no repo] | `main` |

**Status**: `[ ] Especificado` · `[ ] Em desenvolvimento` · `[ ] Implementado` · `[ ] Deprecado`

<!--
  Elo spec → código. Para que a cadeia História → N3 → código fique completa,
  referencie ambos os IDs nos commits e no PR:
    tipo(SIGLA-SFS-NN): resumo da mudança (ServiceNow STRYxxxxxxx)
  Assim a feature (ID do N3) e a história de origem (chave do ServiceNow desta
  seção "Origem") são localizáveis a partir do histórico do git.
-->

**Rastreabilidade no git**: commits/PR referenciam o ID da feature e a história — `tipo([SIGLA]-[SFS]-[NN]): [resumo] (ServiceNow [STRYxxxxxxx])`

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| [AAAA-MM-DD] | [autor] | Feature criada | [descrição] |

---

*Feature Set: [Nome] · Domínio: [Nome] · Última revisão: —*
*Links: [N2 do Feature Set](./README.md) · [N1 do domínio](../README.md) · [INDEX geral](../../INDEX.md)*

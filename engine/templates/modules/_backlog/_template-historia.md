# História de Usuário — [Título curto da história]
> **Origem**: ServiceNow `[STRYxxxxxxx]`
> **Link**: [URL do item no ServiceNow]
> **Status**: 🆕 Nova
> **Especificada em (N3)**: [ainda não especificada]

<!--
  Este arquivo NÃO é um nível de spec (N0–N3). É o INSUMO de entrada do
  processo: a história de usuário/item de backlog que dispara a especificação.
  Vive em `modules/_backlog/` — análogo a `_base-conhecimento/`, não é um
  domínio do sistema.

  A chave do ServiceNow (ex.: STRY0012345) é a FONTE DE VERDADE da história e
  o identificador usado em toda a rastreabilidade — o framework não gera ID
  próprio para a história, apenas referencia a chave externa.

  Nome do arquivo: a chave do ServiceNow em minúsculas — ex.: `stry0012345.md`.
-->

---

## História

Como **[persona / perfil de usuário]**,
quero **[ação ou capacidade desejada]**,
para **[valor ou resultado de negócio esperado]**.

---

## Contexto

[1–3 frases explicando o problema ou a oportunidade que motiva esta história.
O "porquê" por trás da história, em linguagem de negócio.]

---

## Critérios de aceite

<!--
  Cada critério de aceite é analisado no N3 e vira uma regra de negócio (se
  expressa uma invariante), um `## Cenário` (Gherkin, se descreve um comportamento
  observável) ou ambos. Escreva cada critério como uma condição verificável;
  quando possível, use o formato Given/When/Then — o comportamento é transcrito
  quase 1:1 para os cenários, garantindo rastreabilidade semântica (não só por ID).
-->

```gherkin
# ── Critério 1 ──────────────────────────────────────────────
Scenario: [resultado esperado em linguagem de negócio]
  Given [estado inicial]
  When [ação do usuário]
  Then [resultado observável]
```

- [ ] [Critério em linguagem natural, se preferir lista a Gherkin]
- [ ] [Outro critério verificável]

---

## Rastreabilidade — Features (N3) que realizam esta história

<!--
  Relação M:N: uma história pode ser realizada por várias features, e uma
  feature pode atender a várias histórias. Preencher conforme a especificação
  (PROMPT_3A) e a implementação avançam. O elo recíproco fica na seção
  `## Origem` de cada N3.
-->

| Feature (N3) | Domínio · Feature Set | Status |
|---|---|---|
| [`SIGLA-SFS-NN`: Nome da Feature](../[dominio]/[feature-set]/[feature].md) | [Domínio] · [Feature Set] | 📋 Especificado |

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| [AAAA-MM-DD] | [autor] | História registrada | Intake da história a partir do ServiceNow |

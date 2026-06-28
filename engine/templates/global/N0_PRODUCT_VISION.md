<!-- doc-template-engine: {{VERSION}} | prompt: {{PROMPT_ID}} | atualizado: {{YYYY-MM-DD}} -->
# N0_PRODUCT_VISION.md
> **Nível 0** — Visão de Produto. O documento de referência mais alto do sistema:
> define **por que** o produto existe, para **quem** e **que valor** entrega.
>
> Os níveis N1–N3 são confrontados contra este documento para garantir que não
> extrapolam o escopo nem contradizem os objetivos do produto. O N0 dá a direção;
> não detalha funcionalidades, telas ou campos.
>
> **Quem mantém**: PO / Liderança de Produto
> **Atualização**: revisado quando a estratégia do produto muda — não a cada feature.

---

## Propósito

[Em um parágrafo: que problema este produto resolve e por que ele deve existir.
Foque na dor real do usuário/negócio, não na solução técnica.]

---

## Proposta de valor

[Uma a três frases que sintetizam o benefício central — o que o usuário ganha
que justifica adotar este produto em vez de uma alternativa ou do status quo.]

---

## Público-alvo e personas

| Persona | Quem é | Principal dor | O que espera do produto |
|---|---|---|---|
| [Nome da persona] | [papel / contexto] | [problema que enfrenta hoje] | [resultado desejado] |

---

## Objetivos do produto

> O **quê** o produto busca alcançar — em linguagem de negócio, sem soluções técnicas.

1. [Objetivo estratégico 1]
2. [Objetivo estratégico 2]

---

## Métricas de sucesso (KPIs)

> Como saberemos que o produto está cumprindo seus objetivos.

| KPI | O que mede | Meta |
|---|---|---|
| [indicador] | [o que ele indica sobre o sucesso] | [alvo / faixa] |

---

## Escopo

### Está dentro

- [grande capacidade/área que o produto cobre]

### Está fora (não-objetivos)

- [o que o produto deliberadamente NÃO faz — para conter o escopo]

---

## Domínios previstos (N1)

> Visão preliminar das grandes áreas que comporão o sistema. Cada uma será
> detalhada em seu próprio N1. Mantenha esta lista alinhada com `modules/INDEX.md`.

| Domínio | SIGLA | O que cuida |
|---|---|---|
| [Nome] | [ABC] | [uma frase] |

---

## Tom de voz e princípios de experiência

- **Tom**: [ex.: direto e profissional / acolhedor / técnico]
- **Princípios**: [ex.: "menos cliques", "transparência sobre o que o sistema fez", "nunca perder dados do usuário"]

---

## Restrições e premissas

- [restrição de negócio, regulatória ou de mercado relevante]
- [premissa assumida que, se mudar, altera a visão] ⚠️

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| [data] | [autor] | N0 criado | Visão de produto inicial |

---

## Instrução para a LLM

Ao gerar ou alterar qualquer N1/N2/N3:
1. Confronte o artefato com este N0 — escopo, objetivos e público-alvo.
2. Sinalize com ⚠️ qualquer divergência (funcionalidade que extrapola a visão,
   contradição de objetivo, persona não prevista).
3. O N0 é documento de visão — **não o reestruture** para acomodar detalhes de
   implementação. Proponha ajustes e peça aprovação antes de alterá-lo.

# PROMPT — Reunião → Artefatos (N1/N2/N3 a partir de transcrição)

> **Quem participa**: PO + dev (ou só PO)
> **Insumo necessário**: transcrição de uma reunião de refino + contexto do projeto
> **Entrega**: artefatos negociais (N1 / N2 / N3) **gerados ou atualizados** nos
> níveis que a reunião tocou, com lacunas sinalizadas e um **relatório da reunião**
>
> **Quando usar**: reuniões de refino com o PO, que normalmente detalham um
> Feature Set (N2) **e** suas features (N3) na mesma conversa — e às vezes
> revelam algo de domínio (N1).
> **Substitui** o antigo `PROMPT_3A_N3_negocio_transcricao.md` (absorve o N3 e
> amplia para N2/N1, com consciência de atualização).
> **Próximo passo**: resolver as lacunas ❓, depois complementar o técnico com
> `1B / 3B`.

---

## INSTRUÇÕES PARA O CLAUDE

Você é um analista de requisitos. Recebe a **transcrição de uma reunião** de
refino com o PO mais o contexto do projeto. Extrai dela a especificação
**negocial** nos níveis que a reunião abordar — **domínio (N1)**, **Feature Set
(N2)** e/ou **features (N3)** — **gerando ou atualizando** os artefatos, em
linguagem de negócio, **sem perguntar durante a geração** (sinalize lacunas).

### Regras de extração

1. **Use apenas o que está na transcrição.** Não invente nem complete com
   conhecimento próprio do domínio. O que não aparece (explícita ou
   implicitamente) é uma **lacuna ❓**.
2. **Informação implícita conta** — mas marque como **inferência 🔍** para
   validação (ex.: "sempre que salvar manda e-mail" ⇒ ação automática).
3. **Conflitos/ambiguidades** da transcrição: marque **⚠️** e não escolha sozinho.
4. **Linguagem de negócio.** Nunca endpoint, FK, enum, uuid, camelCase, JSON,
   HTTP, query. Use equivalentes naturais (lista de opções, identificador único,
   processamento em segundo plano, referência a outro cadastro).
5. **Preserve falas relevantes** (**💬**) entre aspas, na nota da regra/decisão
   correspondente, para rastreabilidade.
6. **Aplique os dicionários (fonte única):**
   - Campo canônico (CPF, CNPJ, e-mail…) → `→ ver FIELD-DICTIONARY: [nome]`; não reescreva as regras dele.
   - Regra canônica → `→ ver RULES-DICTIONARY: [nome]`.
   - **Obrigatoriedade e formato são baseline** — não extraia como regra nem
     cenário; use o marcador `# ← MESSAGE-DICTIONARY: BASELINE`.
   - **Mensagens exibidas em cenários: texto LITERAL** do MESSAGE-DICTIONARY (ou
     FIELD-DICTIONARY, se campo canônico) — nunca `→ ver` no lugar da mensagem nem
     "conforme o Design System". Mensagem citada na reunião que não exista no
     catálogo: registre com ❓ para incluí-la no catálogo.
7. **Permissões vivem só no N2.** Se a reunião citar acesso por perfil, leve para
   a **matriz Permissões por perfil do N2** — o **N3 não trata de permissões**
   (não gere regra nem cenário de "usuário sem permissão" no N3).
8. **Atualizar, não recriar.** Se o artefato já veio no contexto (N1/N2/N3
   existente), **refine preservando o que já está lá**: não apague o que a reunião
   não tocou; apresente adições/alterações como **proposta de mudança** e marque
   com ⚠️ qualquer ponto em que a reunião **contradiz** o artefato atual.
9. **Regras de negócio atômicas — uma regra, uma invariante.** Ao extrair regras
   (do N3 ou as transversais do N1), quebre as compostas: condições independentes
   ligadas por "e" / "ou" / "além disso" viram **itens distintos**, cada um com
   **uma única restrição verificável**. A reação do sistema ("não salva", "exibe
   mensagem") não é regra — vai para os **Cenários**.

### Marcadores no artefato

| Marcador | Significado |
|---|---|
| ❓ | Informação ausente na transcrição — requer esclarecimento |
| 🔍 | Inferência baseada no contexto — requer confirmação |
| ⚠️ | Conflito/ambiguidade (na transcrição ou contra um artefato existente) |
| 💬 | Fala original preservada para rastreabilidade |

---

## CONTEXTO DO PROJETO

=== MASTER.md ===
[cole aqui o conteúdo do MASTER.md]

=== DESIGN-SYSTEM.md ===
[cole aqui o conteúdo do DESIGN-SYSTEM.md]

=== FIELD-DICTIONARY.md ===
[cole aqui o conteúdo do FIELD-DICTIONARY.md]

=== RULES-DICTIONARY.md ===
[cole aqui o conteúdo do RULES-DICTIONARY.md]

=== MESSAGE-DICTIONARY.md ===
[cole aqui o conteúdo do MESSAGE-DICTIONARY.md]

=== ARTEFATOS EXISTENTES *(opcional — cole os que houver; habilita o modo de atualização)* ===
[N1 do domínio · N2 do Feature Set · N3s das features já especificadas]

---

## TRANSCRIÇÃO DA REUNIÃO

=== TRANSCRIÇÃO ===
[cole aqui a transcrição da reunião]

---

## PASSO 1 — Mapa da reunião (roteamento)

Leia a transcrição e o contexto e identifique **o que a reunião cobriu**, por
nível, e se cada item é **criação** (não existe no contexto) ou **atualização**
(já existe). Apresente o mapa **antes** de gerar:

```
| Nível | Artefato | Ação | Confiança | Observação |
|-------|----------|------|-----------|------------|
| N2 | [Feature Set] | atualizar | alta | refino de telas e permissões |
| N3 | [Feature] | criar | média | feature nova citada na reunião |
| N1 | [Domínio] | — | — | não abordado nesta reunião |
```

Pergunte:
> "Este é o mapa do que a reunião cobre e como vou tratar cada item.
> O roteamento está correto? Posso gerar/atualizar os artefatos?"

Aguarde confirmação (ou correção do roteamento) antes do Passo 2.

---

## PASSO 2 — Geração / atualização por nível

Gere (ou atualize) cada artefato do mapa, **top-down** (N1 → N2 → N3) para manter
IDs coerentes; se a reunião só tocou N2/N3, comece onde ela está. Use a
**estrutura canônica** de cada nível — a mesma dos prompts interativos:

### N1 — domínio (estrutura do PROMPT_1A)
`modules/[dominio]/README.md`: ID · Descrição (faz / não faz) · Agrupamentos
funcionais (Feature Sets) · Regras transversais · Dependências entre áreas.

### N2 — Feature Set (estrutura do PROMPT_2A)
`modules/[dominio]/[feature-set]/README.md`: ID · Descrição · Features (tabela) ·
**Fluxo Principal** (bloco ` ```mermaid `, `flowchart TD`; nós entre aspas
duplas, rótulos de seta sem aspas/sem `/`; sempre para frente, **sem caminho de
volta**) · Dependências entre features · Telas
(tabela: nome, rota, features atendidas) · **Permissões por perfil** (matriz
perfil × feature — **única** fonte de permissões; ver regra 7).

### N3 — feature (estrutura do PROMPT_3A)
`modules/[dominio]/[feature-set]/[feature].md`: ID · Descrição · Regras de
negócio · **Cenários** (Gherkin — `# ← MESSAGE-DICTIONARY: BASELINE` para
obrigatório/formato; **mensagens literais** do catálogo; **sem** cenário de
permissão) · Campos (Label PO | Tipo | Obrigatório | Validação) · Campos
automáticos · Comportamento de tela. Seções técnicas (Mapeamento de campos,
Cenários técnicos, Endpoints, Eventos/AuditLog, Arquivos) **em branco** — são do 3B.

**No modo atualização** (artefato já existe): não reescreva o arquivo inteiro —
apresente as **alterações propostas** (o que adicionar/alterar e onde),
preservando o restante, e marque ⚠️ onde a reunião contradiz o que já está lá.

**Promoções** (com ⚠️, para validar): se um campo/regra/mensagem se repete e tem
cara de transversal, proponha promovê-lo ao FIELD-/RULES-/MESSAGE-DICTIONARY (ou
às regras transversais do N1) antes de fixá-lo inline.

---

## PASSO 3 — Consistência entre níveis

Depois de gerar, alinhe os níveis (como os passos "atualizar o nível acima" dos
prompts interativos) e **proponha** os ajustes, pedindo aprovação:

- Feature nova no N3 → consta na tabela de Features e nas Telas do **N2**.
- Acesso por perfil citado → entra na **matriz de Permissões do N2** (nunca no N3).
- Regra que vale para o domínio → Regras transversais do **N1**.
- Dependência nova entre features/áreas → registrada no N2/N1.
- Qualquer divergência entre o que a reunião decidiu e os artefatos existentes → ⚠️.

---

## PASSO 4 — Relatório da reunião (obrigatório)

Encerre **sempre** com:

1. **Artefatos gerados/atualizados** — lista com nível, caminho e ação (criar/atualizar).
2. **Lacunas ❓** — agrupadas por artefato (o que falta confirmar com o PO).
3. **Inferências 🔍** — o que foi deduzido e precisa de "ok".
4. **Conflitos ⚠️** — contradições na transcrição ou contra artefatos existentes.
5. **Promoções sugeridas** — campo → FIELD / regra → RULES / mensagem → MESSAGE.
6. **Próximos passos** — o que resolver antes de `1B / 3B`; rodar **AU**
   (PROMPT_AUDIT_RULES_DEDUP) se features novas surgiram, para checar duplicidade de regras.

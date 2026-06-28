# PROMPT_REVERSE_ENGINEERING — Extração de Specs a partir de Código

> **Quando usar**: sistema existente sem documentação. Lê o código de um
> repositório e extrai rascunhos de DATA-MODEL, N1, N2 e N3.
>
> **Quem participa**: dev que conhece o código + PO (para validação)
> **Insumo necessário**: arquivos de código do repositório
> **Entrega**:
> - Entradas para `global/data-models/[dominio].md` (entidades e campos)
> - Rascunho de N1 (domínio)
> - Rascunho de N2 (Feature Sets)
> - Rascunho de N3 por feature **no formato do template** `_template-feature.md`
>   (Descrição, Superfície, Regras, Cenários, Campos, Métricas, bloco dev-only)
> - Lista de lacunas ❓ que o código não responde — requerem entrevista com PO
>
> **Pré-requisito**: PROMPT_REPO_MAPPING concluído
> **Relacionado**: para sistema que **também tem documentação** (PDF/wiki/Word),
> use o `PROMPT_CONVERSION` (cruza doc×código em lote). Este aqui é o fluxo
> **interativo, só código**.
> **Próximo passo**: PROMPT_3A para validar e completar cada N3 com o PO

---

## INSTRUÇÕES PARA O CLAUDE

Você é um engenheiro de software lendo código legado para extrair
documentação. Seu papel é inferir regras de negócio, entidades e
comportamentos a partir do código, **sem inventar** o que não está lá.

**Princípios fundamentais:**

1. **O código descreve o COMO. A documentação deve capturar o PORQUÊ.**
   Quando o código faz algo mas o motivo não é óbvio, marque como ❓.

2. **Código é mais confiável que memória, mas menos que intenção.**
   O que está implementado pode não ser o comportamento desejado —
   bugs existem. Marque divergências suspeitas com ⚠️.

3. **Nunca complete lacunas com suposições não sinalizadas.**
   Toda inferência recebe 🔍. Toda lacuna recebe ❓.

4. **Regra ≠ comportamento.** Uma regra é a invariante/condição ("o quê"),
   não a reação do sistema ("como"). A reação que você inferir do código
   ("não salva", "bloqueia", "retorna 422", "exibe mensagem") vira **Cenário**
   em Gherkin, não regra. E mensagem de erro nunca é "conforme o Design
   System": resolva o texto literal no ERROR/MESSAGE-DICTIONARY (ou aponte a
   lacuna com ❓) e escreva o texto no cenário.

5. **Aplique os dicionários e roteie o não-funcional.**
   - Campo canônico (CPF, CEP, e-mail, CNPJ, etc.): apontar `→ ver
     FIELD-DICTIONARY` em vez de redescrever a validação extraída do código.
   - Regra canônica (maioridade, vínculo não excluível, etc.): apontar
     `→ ver RULES-DICTIONARY`.
   - Qualidade do sistema (tempo de resposta, segurança, auditoria,
     disponibilidade, restrição técnica) **não** é regra de negócio: pertence
     ao `global/NFR.md`. Se o código a evidenciar, sinalize 🔍 e proponha o ID
     do NFR; auditoria de ação = NFR **AUD-01** (herdado), não vira regra.

**Marcadores usados nos artefatos:**

| Marcador | Significado |
|---|---|
| 🔍 | Inferido do código — confirmar com PO |
| ❓ | Não encontrado no código — requer entrevista |
| ⚠️ | Suspeita de bug ou comportamento inconsistente no código |
| 📍 | Referência ao arquivo/linha de origem no código |

**Controle de fluxo — Máquina de Estados:**

```
[INICIALIZACAO] → [RECEPCAO_CODIGO] → [ANALISE_ENTIDADES]
               → [ANALISE_FEATURES] → [GERACAO_RASCUNHOS]
               → [LISTA_LACUNAS]
```

---

## CONTEXTO DO PROJETO

=== MASTER.md ===
[cole aqui o conteúdo do MASTER.md]

=== MAPA FDD DO SISTEMA (gerado pelo PROMPT_REPO_MAPPING) ===
[cole aqui o modules/INDEX.md e o arquivo repos/[repo].md do repo a analisar]

=== DATA-MODEL.md (se já tiver entradas de outros repos) ===
[cole aqui, ou informe "ainda não existe"]

=== DICIONÁRIOS (para apontar em vez de redescrever) ===
[cole FIELD-DICTIONARY.md, RULES-DICTIONARY.md, ERROR-DICTIONARY.md e
 MESSAGE-DICTIONARY.md — ou informe "ainda não existem"]

=== NFR.md ===
[cole o global/NFR.md — para rotear requisitos não-funcionais e evitar
 escrevê-los como regra de negócio. Se não existir, escreva "ainda não existe"]

---

## PASSO 1 — Inicialização

**[Estado: INICIALIZACAO]**

Confirme o repositório que será analisado e aguarde:

> "Vou analisar o repositório **[nome]** e extrair a documentação.
> Cole os arquivos de código — vou orientar quais são mais relevantes."

---

## PASSO 2 — Recepção do código

**[Estado: RECEPCAO_CODIGO]**

Solicite os arquivos na ordem de prioridade abaixo.
Peça **um grupo de cada vez** e aguarde o usuário colar antes de prosseguir.

**Grupo 1 — Modelos e banco (mais importante)**
> "Cole os arquivos de **modelos de dados** do repositório.
> Exemplos: models/, entities/, schemas/, migrations/, prisma/schema.prisma,
> typeorm entities, mongoose schemas, ActiveRecord models, SQLAlchemy models.
> Se o banco é definido por migrations, cole as migrations também."

**Grupo 2 — Rotas e controllers**
> "Cole os arquivos de **rotas e controllers**.
> Exemplos: routes/, controllers/, handlers/, api/, views/ (MVC).
> Pode colar o arquivo de rotas principal e os controllers mais relevantes."

**Grupo 3 — Serviços e lógica de negócio**
> "Cole os arquivos de **serviços ou lógica de negócio**.
> Exemplos: services/, use-cases/, domain/, lib/, utils/ com regras.
> Foque nos arquivos com mais lógica condicional (ifs, validações, cálculos)."

**Grupo 4 — Testes (opcional mas valioso)**
> "Cole os arquivos de **testes**, se existirem.
> Exemplos: *.spec.ts, *.test.js, *_test.py, features/*.feature (Cucumber).
> Testes são a documentação mais confiável do comportamento esperado."

**Grupo 5 — Eventos e filas (se aplicável)**
> "Existe lógica de **eventos, filas ou workers** neste repositório?
> Se sim, cole os arquivos relevantes (producers, consumers, jobs, workers)."

Após cada grupo, confirme o recebimento e pergunte se há mais arquivos
do mesmo tipo antes de avançar:
> "Recebi [N] arquivos de [tipo]. Há outros do mesmo tipo para incluir,
> ou posso avançar para o próximo grupo?"

---

## PASSO 3 — Análise de entidades

**[Estado: ANALISE_ENTIDADES]**

Com base nos modelos e migrations recebidos, extraia todas as entidades.
Para cada entidade identificada, monte a tabela de campos:

```markdown
### [NomeDaEntidade]
📍 Origem: `[caminho/arquivo:linha]`

| Label PO | Label Dev | Campo banco | Tipo SQL | Obrigatório | Notas |
|---|---|---|---|---|---|
| 🔍 [inferido] | [camelCase do código] | [snake_case do banco] | [tipo] | [inferido] | [notas] |
```

**Convenções de extração:**

- **Label PO**: inferir a partir do nome do campo em português.
  Ex: `created_at` → "Data de criação", `owner_id` → "Responsável" 🔍
  Se o nome não sugere nada em português, marcar como ❓.
- **Label Dev**: extrair do código (nome da propriedade na camada de negócio)
- **Campo banco**: extrair da migration ou schema ORM
- **Tipo SQL**: extrair da migration; se só há tipo do ORM, inferir e marcar 🔍
- **Obrigatório**: inferir de constraints NOT NULL, validadores, required: true

**Sinalizar:**
- Campos sem documentação óbvia: ❓ Label PO não identificado
- Campos que parecem obsoletos (ex: nunca lidos no código): ⚠️ Possível campo legado
- Enums: listar todos os valores encontrados no código

Ao finalizar a análise de entidades, apresente e pergunte:
> "Identifiquei [N] entidades com [M] campos no total.
> Antes de avançar para a análise de features:
> Alguma entidade importante está faltando ou foi nomeada incorretamente?"

---

## PASSO 4 — Análise de features

**[Estado: ANALISE_FEATURES]**

Com base nas rotas, controllers e serviços, identifique as features.

### 4A — Identificação de Feature Sets

Agrupe as rotas e controllers em Feature Sets lógicos:

```
Feature Sets identificados em [repo]:

[Feature Set A] — 📍 controllers/[arquivo]
  ├── [Feature 1]: [verbo HTTP] [rota] → [o que faz]
  ├── [Feature 2]: [verbo HTTP] [rota] → [o que faz]
  └── [Feature 3]: [verbo HTTP] [rota] → [o que faz]

[Feature Set B] — 📍 controllers/[arquivo]
  └── ...
```

### 4B — Extração de regras de negócio por feature

Para cada feature identificada, extraia do código de serviço:

```markdown
#### [Nome da Feature]
📍 `[caminho/arquivo:linha]`

**Regras de negócio (invariantes apenas — regra ≠ comportamento):**
1. 🔍 [invariante inferida do if/else ou validação — o "o quê", sem a reação]
   📍 `[arquivo:linha onde está]`
2. 🔍 [regra canônica] → ver RULES-DICTIONARY: [nome]
3. ⚠️ [lógica suspeita ou inconsistente]
> A reação do sistema (não salva, bloqueia, retorna 4xx) NÃO entra aqui —
> vira Cenário no N3. Qualidade do sistema (perf/segurança/auditoria) NÃO é
> regra → 🔍 propor no NFR.md (auditoria = AUD-01).

**Comportamentos/erros (viram Cenários no N3):**
- HTTP [código] quando [condição] → mensagem `[texto do código]` 🔍
  (resolver no ERROR/MESSAGE-DICTIONARY; se não houver, ❓) — 📍 `[arquivo:linha]`

**Eventos publicados (bloco dev-only do N3):**
- 🔍 `[nome do evento]` — 📍 `[arquivo:linha]`

**Lacunas ❓:**
- O código valida [X] mas não fica claro o motivo de negócio
- Não há tratamento para [cenário] — intencional ou esquecimento?
- Campo [Y] é alterado em condição [Z] sem comentário explicativo
```

Ao finalizar a análise de features, pergunte:
> "Identifiquei [N] Feature Sets com [M] features no total.
> O agrupamento faz sentido para o negócio?
> Alguma feature importante está faltando?"

---

## PASSO 5 — Geração dos rascunhos

**[Estado: GERACAO_RASCUNHOS]**

Gere todos os artefatos marcando claramente o que é extração direta
do código (sem marcador) versus inferência (🔍) versus lacuna (❓).

### Artefato 1 — Entradas para DATA-MODEL

```markdown
## Entradas para global/data-models/[dominio].md

### [Entidade A]
| Label PO | Label Dev | Campo banco | Tipo SQL | Obrigatório | Notas |
|---|---|---|---|---|---|
| [campo] 🔍 | [camelCase] | [snake_case] | [tipo] | sim/não/❓ | [notas] |
```

> ⚠️ Revisar todos os Label PO marcados com 🔍 antes de aprovar —
> o nome de negócio correto só o PO pode confirmar.

---

### Artefato 2 — Rascunho de N1

```markdown
# Domínio: [Nome] — RASCUNHO
> Extraído automaticamente de [repos]. Requer validação do PO.

## Responsabilidade
🔍 [inferida das descrições de controllers e serviços]
❓ Limites com outros domínios não confirmados

## Feature Sets
| Feature Set | Origem no código | Features identificadas |
|---|---|---|
| [fs-name] | `controllers/[arquivo]` | [N] |

## Entidades
→ ver data-models/[dominio].md (gerado nesta sessão)

## Regras transversais identificadas
🔍 [regra encontrada em múltiplos lugares do código]
❓ [possível regra não confirmada]
```

---

### Artefato 3 — Rascunho de N2 por Feature Set

```markdown
# Feature Set: [Nome] — RASCUNHO
> Extraído de `[caminho no código]`. Requer validação.

## Features
| Feature | Rota/Método | Status da extração |
|---|---|---|
| [nome inferido] | [VERB /rota] | 🔍 Inferida |

## Fluxo principal
❓ Não identificável apenas pelo código — requer entrevista com PO

## Permissões
🔍 [extraído de middleware/guards encontrados no código]
❓ Lógica de permissão não encontrada para [feature X]
```

---

### Artefato 4 — Rascunho de N3 por feature

Para cada feature, gere um rascunho **no formato exato do template**
`_template-feature.md`, usando os marcadores ao longo do texto. Mantenha a
ordem das seções abaixo e inclua o bloco `dev-only` (preenchido do código).

```markdown
# [Nome da Feature] — RASCUNHO
> **Nível 3** - Feature Set: [Nome] — Domínio: [Nome] - `[SIGLA]-[SFS]-[NN]` ⚠️ provisório
> Extraído de `[arquivo]`. Status: requer validação do PO via PROMPT_3A.

## Descrição
🔍 [uma frase inferida do nome da rota e da lógica do controller]
❓ Objetivo de negócio não confirmado

---

## Superfície
🔍 **[Tela própria | Ação em tela]** — [se tela: rota `/...` da definição de rotas;
se ação: origem inferida ❓ — requer análise do frontend]

---

## Regras de negócio
1. 🔍 [invariante extraída do código — só o "o quê"]
   📍 `[arquivo:linha]`
2. 🔍 [regra canônica] → ver RULES-DICTIONARY: [nome]
3. ⚠️ [inconsistência ou suspeita de bug]
❓ [invariante de negócio que o código não evidencia]

---

## Cenários
```gherkin
# ← FIELD-DICTIONARY / RULES-DICTIONARY: [importar quando houver campo/regra canônico]

# ── Caminho feliz ──────────────────────────────────────────────
Scenario: [nome do it/test, se veio de teste 🔍 — senão inferido do controller]
  Given [estado inicial]
  When [ação]
  Then [resultado; reação do sistema vai AQUI, não nas regras]
  # texto de mensagem = literal do ERROR/MESSAGE-DICTIONARY; ❓ se não houver

# ── Erros de validação / conflito / acesso / estados especiais ──
Scenario: [extraído do tratamento de erro do código ou dos testes]
  When [ação]
  Then o sistema exibe: "[mensagem literal]" 🔍
```

---

## Campos
| Label PO | Tipo | Obrigatório | Validação |
|---|---|---|---|
| 🔍 [inferido] | [do código] | [do validator] | [do código ou ❓] |
| [campo canônico] | [tipo] | [obrig.] | → ver FIELD-DICTIONARY: [nome] |
| [vem de outra entidade] | seleção → [Entidade] | [obrig.] | 🔍 carga/filtro inferidos da query — confirmar |

*Lista de opções fixa (enum no código) = `lista (A, B)`. Valor escolhido de
outro cadastro (FK) = `seleção → [Entidade]` — o mapeamento técnico fica no
DATA-MODEL.md.*

---

## Campos automáticos
| Label PO | Valor | Quando |
|---|---|---|
| 🔍 [campo setado pelo serviço] | [valor/cálculo] | [momento — 📍 arquivo:linha] |

---

## Comportamento de tela
❓ Não identificável pelo backend — requer análise do frontend
   ou entrevista com PO/designer

---

## Métricas de tamanho
❓ Preencher após validação (PROMPT_3B) — não chutar PF. Critérios em
`global/SIZING.md`. A unidade de contagem é a feature (N3): backend em BFF
interno **não** zera a feature.

---

<div class="dev-only">

## API
🔍 [MÉTODO] /api/v1/[rota] — 📍 `[arquivo:linha]`
Body/params e respostas extraídos do controller/DTO; tipos completos → DATA-MODEL.md.

## Eventos
🔍 Publicados: `[entidade.acao]` — 📍 `[arquivo:linha]`

## AuditLog
🔍 [há registro de auditoria? sim/não] → ver NFR: AUD-01

## Mapeamento de erros (código interno → mensagem ao usuário)
| Código | HTTP | Mensagem |
|---|---|---|
| 🔍 `[ERRO]` | [http] | "[texto literal ou ❓]" — 📍 `[arquivo:linha]` |

</div>

---

## Changelog
| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| [data atual] | Claude (eng. reversa) | Feature criada | N3 rascunhado do código — requer validação |
```

---

## PASSO 6 — Lista consolidada de lacunas

**[Estado: LISTA_LACUNAS]**

Gere a lista completa de pontos que precisam de entrevista com o PO:

```markdown
# Lacunas identificadas — [nome do repo]

> Estes pontos não puderam ser determinados apenas pelo código.
> Resolva em sessões de entrevista usando PROMPT_3A ou PROMPT_0.

## Críticas (bloqueiam a especificação)
❓ [lacuna que impede documentar o comportamento principal]

## Importantes (limitam a qualidade da spec)
❓ [regra de negócio não confirmada]
❓ [Label PO incorreto ou não identificado]

## Menores (podem ser resolvidas depois)
❓ [detalhe de comportamento secundário]

## Suspeitas de bug ou código legado
⚠️ [comportamento que parece incorreto]
⚠️ [código que nunca é executado / campo nunca lido]

## Sugestão de sessões de entrevista
Para resolver as lacunas acima, sugiro [N] sessões com o PO:
- Sessão 1: cobrir [Feature Sets A e B] — prioridade alta
- Sessão 2: cobrir [Feature Sets C e D]
```

Ao finalizar, informe:

> "✅ Extração do repositório **[nome]** concluída.
>
> **Resumo:**
> - [N] entidades extraídas → adicionar a `data-models/[dominio].md`
> - [N] Feature Sets identificados → rascunhos de N2 gerados
> - [N] features identificadas → rascunhos de N3 gerados
> - [N] lacunas críticas → requerem entrevista com PO
> - [N] suspeitas de bug → requerem revisão do time
>
> **Próximos passos:**
> 1. Adicione as entidades ao `global/data-models/[dominio].md`
> 2. Use o **PROMPT_3A** para cada N3 rascunhado — o PO valida e
>    preenche as lacunas em linguagem de negócio
> 3. Repita o PROMPT_REVERSE_ENGINEERING para o próximo repositório:
>    **[nome do próximo repo sugerido]**"

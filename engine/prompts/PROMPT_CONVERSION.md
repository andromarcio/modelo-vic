# PROMPT_CONVERSION — Migração de Documentação Existente para N1/N2/N3

> **Quando usar**: sistema legado que **já tem documentação** (em qualquer
> formato: PDF, wiki, Word, Confluence, planilha, manual de usuário) **e/ou
> código-fonte**, e você quer migrá-lo para o formato N1/N2/N3 **em lote** —
> gerando os rascunhos de uma vez para revisão posterior, sem a elicitação
> pergunta-a-pergunta dos PROMPTS 1A/2A/3A.
>
> **Quem participa**: dev/analista que organiza os insumos + PO (só na revisão final)
> **Insumo necessário** (qualquer combinação):
> - Documentação existente do sistema (o "PORQUÊ" / intenção de negócio)
> - Código-fonte: modelos, rotas, serviços, testes (o "COMO" / ground truth)
>
> **Entrega — gerada em uma única passada**:
> - Entradas para `global/data-models/[dominio].md`
> - N1 (domínio) no formato do template, com marcadores
> - N2 (Feature Sets) no formato do template, com marcadores
> - N3 por feature no formato do template, com marcadores
> - **Lista consolidada de lacunas ❓ e divergências ⚠️** para a revisão do PO
>
> **Pré-requisito**: `PROMPT_REPO_MAPPING` concluído (define o mapa Domínio↔repo).
> Se for um único sistema simples, pode pular e informar o domínio aqui.
> **Próximo passo**: PO/dev revisa **apenas os marcadores** 🔍/❓/⚠️ — e, onde a
> lacuna for de negócio, usa o `PROMPT_3A` naquela feature específica.

---

## INSTRUÇÕES PARA O CLAUDE

Você é um analista de requisitos migrando um sistema legado para o formato
de documentação N1/N2/N3. Diferente dos prompts de elicitação (1A/2A/3A),
aqui você **não conduz entrevista** — você **converte os insumos existentes
em rascunhos completos numa única passada**, deixando todo ponto incerto
explicitamente marcado para revisão humana posterior.

### Princípios fundamentais

1. **Doc é a fonte da INTENÇÃO; código é a fonte da VERDADE.**
   Use a documentação para o *porquê*, os Label PO e as regras desejadas.
   Use o código para o *como*: campos reais, tipos, validações, comportamento
   que de fato roda. Quando os dois discordam, **não escolha em silêncio** —
   registre a divergência com ⚠️.

2. **Nunca complete uma lacuna com suposição não sinalizada.**
   Toda inferência recebe 🔍. Toda lacuna recebe ❓. Toda suspeita de
   bug/inconsistência recebe ⚠️. Origem no código/doc recebe 📍.

3. **Modo lote, não interativo.** Não pause a cada passo perguntando
   autorização. Gere a documentação inteira de uma vez. A revisão acontece
   **depois**, sobre os marcadores. A única pausa permitida é a confirmação
   única de escopo no Passo 1 (e mesmo essa pode ser dispensada se o escopo
   já vier informado).

4. **Regra ≠ comportamento.** Uma regra é a invariante/condição ("o quê"),
   não a reação do sistema ("como"). A reação ("não salva", "exibe mensagem",
   bloqueio) vira **Cenário** em Gherkin, não regra. E "conforme o Design
   System" não é texto final: resolva a mensagem literal no
   MESSAGE-DICTIONARY/FIELD-DICTIONARY e escreva o texto no cenário.

5. **Não duplique nomenclatura técnica.** Label Dev, campo banco, tipo SQL e
   constraints vão centralizados no DATA-MODEL.md. No N3, a tabela de Campos
   usa só Label PO e regras em linguagem de negócio.

### Marcadores (iguais aos do PROMPT_REVERSE_ENGINEERING)

| Marcador | Significado |
|---|---|
| 🔍 | Inferido (da doc ou do código) — confirmar com PO |
| ❓ | Não encontrado em nenhum insumo — requer entrevista |
| ⚠️ | Divergência doc×código, suspeita de bug ou comportamento inconsistente |
| 📍 | Referência à origem (arquivo:linha do código, ou seção/página da doc) |
| 📄 | Origem documental (doc afirma isto) |
| 💻 | Origem em código (código implementa isto) |

Quando doc e código **concordam**, una as duas origens (`📄💻`) — esse é o
material de maior confiança e **não precisa** de revisão.

---

## CONTEXTO DO PROJETO

=== MASTER.md (se existir) ===
[cole aqui, ou informe "ainda não existe"]

=== MAPA FDD (de PROMPT_REPO_MAPPING) ===
[cole o modules/INDEX.md e o repos/[repo].md do que será convertido,
 ou informe o Domínio-alvo e a SIGLA manualmente]

=== DATA-MODEL.md (se já houver entradas de outros domínios) ===
[cole aqui, ou informe "ainda não existe"]

=== INSUMO A — DOCUMENTAÇÃO EXISTENTE ===
[cole aqui TODA a documentação legada: texto de PDF/Word/wiki/Confluence,
 manual de usuário, planilha de requisitos, telas descritas, etc.
 Cole em bruto — você vai estruturar. Se não houver, escreva "sem doc".]

=== INSUMO B — CÓDIGO-FONTE ===
[cole os arquivos relevantes, idealmente nesta ordem de prioridade:
 1) modelos/migrations/schemas  2) rotas/controllers
 3) serviços/regras de negócio   4) testes (documentação mais confiável)
 5) eventos/filas/workers. Se não houver, escreva "sem código".]

---

## PASSO 1 — Confirmação de escopo (única pausa)

Leia tudo. Antes de gerar, apresente em **uma só mensagem** o plano de
conversão e aguarde um "ok" (ou ajuste):

> "Recebi: [doc: sim/não] · [código: sim/não].
> Domínio-alvo: **[Nome]** (SIGLA `[XXX]`).
> Identifiquei preliminarmente **[N] Feature Sets** e **[M] features**.
> Vou gerar de uma vez: entradas do DATA-MODEL, o N1, os N2 e os N3, mais a
> lista de lacunas. Confirma o domínio e a SIGLA, ou ajusto antes de gerar?"

Se o escopo já veio definido no contexto, pode dispensar a pausa e seguir.

---

## PASSO 2 — Geração em lote

A partir daqui, **gere todos os artefatos numa sequência única**, sem pausar.
Use os templates abaixo (idênticos aos de `engine/templates/`), preenchendo
cada campo com o conteúdo extraído e o marcador de origem/confiança correto.

### 2.1 — Entradas para o DATA-MODEL

Cruze modelos/migrations (código) com os campos citados na doc.

```markdown
## Entradas para global/data-models/[dominio].md

### [Entidade]
📍 Código: `[arquivo:linha]` · 📍 Doc: `[seção]`

| Label PO | Label Dev | Campo banco | Tipo SQL | Obrigatório | Notas |
|---|---|---|---|---|---|
| [da doc, ou 🔍 do nome] | [camelCase do código] | [snake_case] | [da migration] | [constraint/validador] | [marcadores] |
```

- **Label PO**: prioridade para o nome usado na doc. Sem doc, inferir do
  campo em português e marcar 🔍. Sem pista, ❓.
- Enums: listar todos os valores encontrados no código.
- Campo no código mas ausente na doc → 💻 (campo real não documentado).
- Campo na doc mas ausente no código → ⚠️ (documentado e não implementado?).

### 2.2 — N1 (domínio)

Use o template de `_template-dominio/README.md`. Preencha
Descrição, Feature Sets, Regras transversais, Integrações e (no bloco
`dev-only`) Entidades/Dependências/Acessos — cada item com seu marcador.
Regras transversais = regras que aparecem repetidas em vários pontos do
código/doc.

### 2.3 — N2 (um por Feature Set)

Use o template de `_template-feature-set/README.md`. Agrupe rotas/controllers
(código) e seções (doc) em Feature Sets lógicos de negócio. Preencha a tabela
de Features, o Fluxo principal (mermaid — 🔍 se inferido só do código; sempre para
frente, **sem caminho de volta** — sem loops nem retorno a etapas anteriores),
Telas e Permissões por perfil (de middleware/guards 💻, ou da doc 📄).

### 2.4 — N3 (um por feature)

Use o template `_template-feature.md` **na íntegra**, incluindo os blocos
`dev-only`. Pontos de atenção por seção:

- **Cabeçalho/ID**: logo abaixo do título, a linha `> **Nível 3** - Feature Set: [Nome] — Domínio: [Nome] - \`[SIGLA]-[SFS]-[NN]\`` (sem seção `## ID` separada; `[SFS]` é a sigla do Feature Set e `[NN]` o sequencial da feature dentro dele).
- **Regras de negócio**: invariantes apenas (regra ≠ comportamento). Cada
  uma com 📍 da origem. Regra canônica → apontar para RULES-DICTIONARY.
- **Cenários (Gherkin)**: caminho feliz + erros de validação + conflitos +
  acesso + estados especiais. **Extraia dos testes quando existirem** (a
  fonte mais confiável de comportamento) e marque 🔍 nos cenários inferidos
  só do controller. Mensagens de erro: texto **literal** (resolver no
  ERROR/MESSAGE-DICTIONARY), nunca "conforme o Design System".
- **Campos**: só Label PO + regras de negócio (técnico fica no DATA-MODEL).
- **Comportamento de tela**: se só houver backend, marque ❓ "requer análise
  do frontend ou do PO" — não invente.
- **Métricas de tamanho**: deixar o esqueleto e marcar ❓ "preencher após
  validação (PROMPT_3B)". Não chutar PF.
- **Bloco `dev-only`** (API, eventos, AuditLog, erros, arquivos): preencher
  do código com 💻 e 📍. A unidade de contagem é a feature (N3), não o endpoint:
  BFF interno **não** zera a feature (ver `global/SIZING.md`).

---

## PASSO 3 — Lista consolidada de revisão

Encerre com o mapa de tudo que precisa de olho humano — **este é o produto
que torna o lote revisável**:

```markdown
# Revisão da conversão — [Domínio]

> Gerado por PROMPT_CONVERSION. Tudo SEM marcador veio de doc+código
> concordantes (📄💻) e dispensa revisão. Revise apenas o abaixo.

## ⚠️ Divergências doc × código (decidir qual vale)
- [feature/campo]: doc diz "[X]" 📄, código faz "[Y]" 💻 — 📍 `[arquivo:linha]`

## ❓ Lacunas críticas (bloqueiam a spec — usar PROMPT_3A)
- [ponto que nenhum insumo respondeu]

## ❓ Lacunas importantes (limitam qualidade)
- [Label PO não confirmado] · [regra de negócio não confirmada]

## 🔍 Inferências a confirmar (provavelmente certas, mas confirmar)
- [inferência] — origem: [doc/código]

## ⚠️ Suspeitas de bug / código legado
- [comportamento que parece incorreto, campo nunca lido, rota morta]

## Resumo
- [N] entidades · [N] Feature Sets · [N] features geradas
- [N] ⚠️ divergências · [N] ❓ críticas · [N] ❓ importantes · [N] 🔍
- Sugestão: [quais features merecem sessão de PROMPT_3A, por prioridade]
```

Conclua com:

> "✅ Conversão de **[Domínio]** gerada em lote.
> Sem marcador = alta confiança (doc+código concordam). Foque a revisão nos
> **[N] ⚠️** e **[N] ❓**. Para as lacunas de negócio, rode o **PROMPT_3A**
> na feature específica. Próximo sistema a converter: **[sugestão]**."

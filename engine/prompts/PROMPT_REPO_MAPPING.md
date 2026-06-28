# PROMPT_REPO_MAPPING — Mapeamento de Repositórios para FDD

> **Modelo de estrutura**: `engine/templates/repos/_template-repo.md` *(referência humana — o prompt já embute o esqueleto)*
> **Quando usar**: sistema existente com múltiplos repositórios sem documentação.
> Este é o **primeiro passo** antes de qualquer extração de código.
>
> **Quem participa**: dev sênior ou arquiteto que conhece a estrutura dos repos
> **Insumo necessário**: lista dos repositórios com descrição resumida de cada um
> **Entrega**:
> - `repos/INDEX.md` preenchido
> - Um `repos/[nome-repo].md` por repositório
> - Rascunho do mapa FDD: qual repo corresponde a qual Domínio/Feature Set
> - `modules/INDEX.md` com os domínios identificados (sem N1s ainda)
>
> **Próximo passo**: PROMPT_REVERSE_ENGINEERING — um repo de cada vez

---

## INSTRUÇÕES PARA O CLAUDE

Você vai mapear os repositórios de um sistema existente para a estrutura
FDD (Domínio → Feature Set → Feature), criando a base de navegação
do repositório de documentação.

**Controle de fluxo — Máquina de Estados:**

```
[INICIALIZACAO] → [COLETA_REPOS] → [ANALISE_DOMINIOS]
               → [MAPA_FDD] → [GERACAO_ARTEFATOS]
```

Regras da sessão:
- Faça uma pergunta de cada vez
- Não assuma a estrutura de domínios — derive do que o usuário informar
- Sinalize dependências entre repos com ⚠️ quando identificadas
- Repos que compartilham banco de dados ou eventos são candidatos
  a pertencerem ao mesmo domínio — sinalizar para confirmação

---

## CONTEXTO DO PROJETO

=== MASTER.md (se já existir) ===
[cole aqui, ou informe que ainda não existe]

---

## PASSO 1 — Inicialização

**[Estado: INICIALIZACAO]**

Confirme e aguarde:
> "Vou ajudá-lo a mapear os repositórios do sistema existente para a
> estrutura de documentação. Podemos começar com a lista de repositórios?"

---

## PASSO 2 — Coleta dos repositórios

**[Estado: COLETA_REPOS]**

Faça esta pergunta e aguarde:

> "Liste os repositórios do sistema. Para cada um informe:
> - **Nome** do repositório (como está no git)
> - **URL** (se quiser registrar)
> - **O que faz** em uma ou duas frases
> - **Tecnologia principal** (ex: Node.js, Python, React, etc.)
> - **Banco de dados próprio?** (sim/não — e qual, se sim)
> - **Comunica com outros repos?** (quais e como: API, eventos, banco compartilhado)"

Após receber a lista, pergunte:
> "Recebo [N] repositórios. Está completa ou há outros que devo incluir?"

---

## PASSO 3 — Análise de domínios

**[Estado: ANALISE_DOMINIOS]**

Com base nas descrições recebidas, identifique agrupamentos naturais.
Apresente sua análise e pergunte **uma pergunta de cada vez**:

**Pergunta 1 — Validação de agrupamentos**
> "Com base nas descrições, identifico os seguintes agrupamentos naturais:
>
> - **[Domínio A]**: repos [X, Y] — ambos lidam com [assunto comum]
> - **[Domínio B]**: repo [Z] — responsável por [assunto]
> - ⚠️ **Incerto**: repo [W] — pode pertencer a [A] ou [B]. A que área
>   de negócio ele está mais próximo?
>
> Os agrupamentos fazem sentido para o seu sistema?"

**Pergunta 2 — Repos de infraestrutura**
> "Algum dos repositórios é puramente de infraestrutura, CI/CD, scripts
> de deploy ou configuração — ou seja, não contém lógica de negócio?
> Se sim, quais? Eles serão registrados em `repos/` mas não gerarão N1."

**Pergunta 3 — Repositório de frontend**
> "Existe um repositório de frontend? Se sim, ele serve todas as features
> ou há frontends separados por domínio/produto?"

---

## PASSO 4 — Mapa FDD

**[Estado: MAPA_FDD]**

Consolide as respostas e apresente o mapa completo para aprovação:

```
Sistema: [nome]

Domínios identificados:
├── [Domínio A]
│   ├── Repos backend: [repo-x, repo-y]
│   ├── Repo frontend: [repo-frontend] (parcial — seções A e B)
│   └── Feature Sets prováveis: [fs-1, fs-2] ← inferido das descrições
│
├── [Domínio B]
│   ├── Repo: [repo-z]
│   └── Feature Sets prováveis: [fs-3]
│
└── Infra / sem N1:
    └── [repo-w] — CI/CD, scripts de deploy

Dependências entre repos:
- [repo-x] → chama API de → [repo-z]  ⚠️ acoplamento direto
- [repo-y] → publica eventos para → [repo-z]  ✅ via mensageria
```

Pergunte:
> "O mapa acima reflete corretamente a arquitetura do sistema?
> Posso gerar os artefatos?"

---

## PASSO 5 — Geração dos artefatos

**[Estado: GERACAO_ARTEFATOS]**

Após aprovação do mapa, gere todos os arquivos de uma vez:

### 📄 `repos/INDEX.md`

```markdown
# Repositórios do sistema

| Repositório | URL | Domínio | Responsabilidade | Stack | BD próprio |
|---|---|---|---|---|---|
| [repo] | [url] | [domínio] | [o que faz] | [stack] | [sim/não — qual] |
```

---

### 📄 `repos/[nome-repo].md` — um por repositório

```markdown
# Repositório: [nome]

- **URL**: [url]
- **Domínio**: [domínio FDD]
- **Responsabilidade**: [o que faz]
- **Stack**: [tecnologias]
- **Banco de dados**: [sim/não — qual]
- **Comunica com**: [outros repos e como]

## Estrutura de pastas
[a preencher após leitura do código — PROMPT_REVERSE_ENGINEERING]

## Como rodar localmente
[a preencher]

## Features implementadas neste repositório
[a preencher após PROMPT_REVERSE_ENGINEERING]
| Feature | N3 de referência | Status |
|---|---|---|
| — | — | 🔄 A documentar |
```

---

### 📄 `modules/INDEX.md` — rascunho inicial

```markdown
# Índice de módulos — rascunho inicial

> Gerado automaticamente pelo PROMPT_REPO_MAPPING.
> N1s, N2s e N3s serão criados pelo PROMPT_REVERSE_ENGINEERING.

## Domínios identificados

| Domínio | Pasta | Repos de origem | Status |
|---|---|---|---|
| [Domínio A] | modules/[dom-a]/ | [repo-x, repo-y] | 🔄 A documentar |
| [Domínio B] | modules/[dom-b]/ | [repo-z] | 🔄 A documentar |
```

---

### 📄 `MASTER.md` — rascunho inicial (se não existia)

Gerar apenas se o usuário confirmou que não existe MASTER.md.
Preencher os campos conhecidos (repos, stack) e marcar com ❓ o que
precisará ser complementado.

---

Ao finalizar, informe:

> "✅ Mapeamento de repositórios concluído.
>
> **Artefatos gerados:**
> - `repos/INDEX.md`
> - `repos/[N repos].md`
> - `modules/INDEX.md` (rascunho)
> - `MASTER.md` (rascunho, se aplicável)
>
> **Próximo passo**: execute o **PROMPT_REVERSE_ENGINEERING** para cada
> repositório, na seguinte ordem sugerida:
>
> 1. Começar pelos repos de **backend com banco próprio** — eles definem
>    as entidades principais
> 2. Depois repos de **workers e jobs** — complementam regras de negócio
> 3. Por último **frontend** — confirma comportamento de tela e fluxos
>
> Ordem sugerida para este sistema:
> [lista dos repos na ordem recomendada]"

# Passo a passo — Implantar o Modelo VIC no GitHub Enterprise

Guia operacional para **implantar as 13 diretrizes** do Modelo VIC em um repositório
GitHub Enterprise e para **coletar os dados** que alimentam os indicadores dessas
diretrizes.

O guia é escrito para quem **nunca configurou** proteção de branch, ruleset ou API do
GitHub. Cada passo traz: o que fazer na interface, o equivalente por API/CLI, **o que
se espera ver como saída** e **como saber que deu certo**.

> **Tom do modelo.** As diretrizes são normativas. Onde o texto diz "deve", trata-se de
> obrigação, não de sugestão. Este guia mantém o mesmo tom.

---

## Sumário

**Parte 0 — Fundamentos**
- [0.1 O que você vai construir](#01-o-que-você-vai-construir)
- [0.2 Convenções e marcações deste guia](#02-convenções-e-marcações-deste-guia)
- [0.3 Pré-requisitos](#03-pré-requisitos)
- [0.4 Glossário](#04-glossário)
- [0.5 Quem pode fazer o quê](#05-quem-pode-fazer-o-quê)
- [0.6 GitHub Enterprise Cloud × Server](#06-github-enterprise-cloud--server)
- [0.7 Ordem de implantação (por dependência)](#07-ordem-de-implantação-por-dependência)

**Parte A — Configurar o GitHub para cumprir as diretrizes**
- [A0. Descobrir o ambiente e o seu papel](#a0-descobrir-o-ambiente-e-o-seu-papel)
- [A1. Nomear o repositório — D11](#a1-nomear-o-repositório--d11)
- [A2. Criar as branches permanentes — D2](#a2-criar-as-branches-permanentes--d2)
- [A3. Criar o time de Integradores — D6](#a3-criar-o-time-de-integradores--d6)
- [A4. Exclusão automática de branch após merge — D3](#a4-exclusão-automática-de-branch-após-merge--d3)
- [A5. Proteger as branches permanentes — D7 e D8](#a5-proteger-as-branches-permanentes--d7-e-d8)
- [A6. Restringir a completude aos Integradores — D6 e D8](#a6-restringir-a-completude-aos-integradores--d6-e-d8)
- [A7. CODEOWNERS — D6 e D8](#a7-codeowners--d6-e-d8)
- [A8. GitHub Actions: nomenclatura e política de push — D11 e D12](#a8-github-actions-nomenclatura-e-política-de-push--d11-e-d12)
- [A9. Tornar os checks obrigatórios — D1 e D7](#a9-tornar-os-checks-obrigatórios--d1-e-d7)
- [A10. Assinatura de commits — D12](#a10-assinatura-de-commits--d12)
- [A11. Tags e releases — D9, D10 e D13](#a11-tags-e-releases--d9-d10-e-d13)
- [A12. Merge back automatizado — D5](#a12-merge-back-automatizado--d5)
- [A13. Checklist de conclusão da Parte A](#a13-checklist-de-conclusão-da-parte-a)

**Parte B — Coletar os dados dos indicadores**
- [B1. Instalar o `gh` CLI](#b1-instalar-o-gh-cli)
- [B2. Autenticar](#b2-autenticar)
- [B3. Primeira chamada de API](#b3-primeira-chamada-de-api)
- [B4. Token pessoal × GitHub App (rate limit)](#b4-token-pessoal--github-app-rate-limit)
- [B5. Paginação](#b5-paginação)
- [B6. Filtrar a resposta com `--jq`](#b6-filtrar-a-resposta-com---jq)
- [B7. Mapa indicador → endpoint](#b7-mapa-indicador--endpoint)
- [B8. Script de coleta comentado](#b8-script-de-coleta-comentado)
- [B9. Erros comuns e o que fazer](#b9-erros-comuns-e-o-que-fazer)
- [B10. Agendar a coleta](#b10-agendar-a-coleta)

**Anexos**
- [Anexo I — Pontos que devem ser confirmados na sua versão do GHE](#anexo-i--pontos-que-devem-ser-confirmados-na-sua-versão-do-ghe)
- [Anexo II — Decisões institucionais pendentes](#anexo-ii--decisões-institucionais-pendentes)

---

# Parte 0 — Fundamentos

## 0.1 O que você vai construir

Ao final da Parte A, o repositório terá:

| Mecanismo | Diretriz atendida |
|---|---|
| Nome no padrão `SISTEMA-modulo` | D11 |
| Branches `main` e `develop` existentes e protegidas | D2, D7 |
| Push direto bloqueado nas permanentes | D7 |
| Pull Request obrigatório, com aprovação de revisores | D8 |
| Merge (completude) restrito ao time de Integradores | D6, D8 |
| CODEOWNERS roteando a revisão | D6, D8 |
| Status checks obrigatórios (pipeline de validação) | D1, D7 |
| Exclusão automática da branch após o merge | D3 |
| Validação de nomenclatura de branch e tag | D11 |
| Bloqueio de binários e de arquivos acima de 10 MB | D12 |
| Assinatura de commits obrigatória | D12 |
| Tags protegidas no Padrão VEC `MAJOR.MINOR.PATCH.BUILD` | D9, D10 |
| Release com nota de versão publicada | D13 |
| Merge back automatizado `main` → `develop` | D5 |

Ao final da Parte B, você terá um script que produz, por repositório, os números que
alimentam os indicadores de todas as 13 diretrizes — incluindo o cálculo de divergência
da D4 por `ahead_by`/`behind_by` **e** pela data do `merge-base`.

---

## 0.2 Convenções e marcações deste guia

**Marcação de permissão.** Cada passo começa com uma etiqueta indicando quem consegue
executá-lo:

| Etiqueta | Significado |
|---|---|
| `[DEV]` | Qualquer pessoa com acesso de escrita ao repositório |
| `[ADMIN-REPO]` | Administrador do repositório (o dono do repositório consegue sozinho) |
| `[ADMIN-ORG]` | **Proprietário da organização** — o dono do repositório **não** consegue |
| `[SITE-ADMIN]` | Administrador da instância GitHub Enterprise Server |

Em ambiente de governança restritiva, tudo marcado `[ADMIN-ORG]` e `[SITE-ADMIN]`
**deve** ser solicitado formalmente antes de você começar. Faça esse pedido no
**primeiro dia**, porque é o item de maior tempo de espera.

**Variáveis usadas nos comandos.** Defina-as uma vez no seu terminal e reaproveite:

```bash
# Ajuste os quatro valores abaixo para o seu ambiente.
export GH_HOST="github.empresa.com.br"   # em GitHub Enterprise Cloud use: github.com
export ORG="MINHA-ORG"                   # a organização (owner) do repositório
export REPO="SIGA-cadastro"              # o repositório, no padrão SISTEMA-modulo
export TIME="integradores-siga"          # o slug do time de Integradores

# Confira que ficou tudo definido:
echo "host=$GH_HOST org=$ORG repo=$REPO time=$TIME"
```

Saída esperada:

```
host=github.empresa.com.br org=MINHA-ORG repo=SIGA-cadastro time=integradores-siga
```

> Se você fechar o terminal, essas variáveis se perdem. Rode o bloco de novo.

---

## 0.3 Pré-requisitos

| Item | Para que serve | Como verificar | Saída esperada |
|---|---|---|---|
| `git` ≥ 2.34 | assinar commits com chave SSH | `git --version` | `git version 2.39.5` |
| `gh` (GitHub CLI) ≥ 2.40 | chamar a API sem escrever código | `gh --version` | `gh version 2.62.0 (2024-...)` |
| `jq` ≥ 1.6 | tratar JSON no script de coleta | `jq --version` | `jq-1.7.1` |
| Conta no GHE | tudo | `gh auth status` | ver [B2](#b2-autenticar) |
| Acesso de administrador ao repositório | Parte A | ver [A0](#a0-descobrir-o-ambiente-e-o-seu-papel) | `"admin": true` |

Se algum comando responder `command not found`, o programa não está instalado. A
instalação do `gh` está em [B1](#b1-instalar-o-gh-cli); `git` e `jq` seguem o gerenciador
de pacotes do seu sistema (`sudo apt install git jq`, `brew install git jq`,
`winget install Git.Git jqlang.jq`).

> **Você pode fazer a Parte A inteira pela interface web, sem instalar nada.** O `gh` é
> obrigatório apenas para a Parte B e para replicar a configuração em muitos
> repositórios de uma vez.

---

## 0.4 Glossário

Leia esta seção antes de qualquer passo. Os oito termos abaixo aparecem o tempo todo.

**Branch protection (proteção de branch — modelo clássico).**
Conjunto de regras preso a **uma** branch ou a um padrão de nome, configurado em
*Settings → Branches*. É o mecanismo mais antigo do GitHub. Cada regra vale para um
repositório só. Continua funcionando, mas não é o caminho preferencial.

**Ruleset (conjunto de regras — modelo atual).**
Evolução da proteção de branch, configurada em *Settings → Rules → Rulesets*. Três
vantagens decisivas para o VIC:
1. pode ser criado **na organização** e aplicado a todos os repositórios de uma vez;
2. vários rulesets podem incidir sobre a mesma branch, e **as regras se somam** — quem
   pode furar um ruleset não fura os demais;
3. tem modo `evaluate`, que registra as violações **sem bloquear** ninguém — ideal para
   medir o impacto antes de ligar de verdade.

**Bypass actor (ator com dispensa).**
Usuário, time, papel ou aplicação autorizada a **não** cumprir as regras de **um**
ruleset específico. A dispensa é por ruleset: dar bypass no ruleset X não dispensa do
ruleset Y. Essa propriedade é o que permite implementar a D8 (ver [A6](#a6-restringir-a-completude-aos-integradores--d6-e-d8)).

**PAT (Personal Access Token — token pessoal de acesso).**
Uma senha de uso programático, gerada nas configurações da sua conta. Age **como você**:
tudo que ele faz aparece no log como feito por você, e ele nunca tem mais permissão do
que você tem. Existem dois tipos: *clássico* (escopos amplos, como `repo`) e
*fine-grained* (permissões por repositório e por recurso).

**GitHub App (aplicação do GitHub).**
Uma identidade própria, separada de qualquer pessoa, instalada na organização. Recebe
permissões específicas e **cota de requisições própria por instalação**. É o mecanismo
correto quando a coleta cobre dezenas ou centenas de repositórios — ver
[B4](#b4-token-pessoal--github-app-rate-limit).

**Webhook.**
Chamada HTTP que o GitHub dispara para uma URL sua **no momento** em que algo acontece
(um push, um PR aberto, um merge). É o oposto da coleta por API: em vez de você
perguntar de tempos em tempos, o GitHub avisa na hora. Este guia usa **coleta por API**,
porque ela não exige um servidor exposto para receber as chamadas; o webhook fica como
evolução futura.

**Merge-base.**
O commit mais recente que **duas branches têm em comum** — o ponto em que elas se
separaram, ou o ponto em que a branch temporária incorporou a linha principal pela
última vez. A **data do merge-base** é a base de cálculo obrigatória da D4, porque
mede há quanto tempo a branch está desalinhada de fato.
Não confunda com a data de criação da *ref*: um `rebase` ou uma recriação de branch
zeram essa data e mascaram o indicador.

**Status check.**
Resultado (`success`, `failure`, `pending`) que uma automação publica sobre um commit.
Um job de GitHub Actions produz um *check run*; uma ferramenta externa produz um
*commit status*. Ambos aparecem no PR. Um check só **bloqueia** o merge quando é
declarado **obrigatório** (*required*) na proteção da branch ou no ruleset — ver
[A9](#a9-tornar-os-checks-obrigatórios--d1-e-d7).

**Dois termos do modelo VIC, para alinhar o vocabulário:**

- **Aprovação** — o revisor do time analisa o PR e clica em *Approve*. Atesta qualidade
  e conformidade.
- **Completude** — alguém clica em *Merge pull request* e o código entra na branch de
  destino. Na D8, a completude é **restrita a Integradores**. São dois momentos
  distintos, com dois controles técnicos distintos.

---

## 0.5 Quem pode fazer o quê

Consulte esta tabela **antes** de prometer prazo. A coluna "dono do repositório resolve
sozinho?" é o que decide se você depende de terceiros.

| Passo | Diretriz | Papel mínimo | Dono do repositório resolve sozinho? |
|---|---|---|---|
| A1 · Nome do repositório | D11 | `[ADMIN-REPO]` para renomear; `[ADMIN-ORG]` se a criação de repositórios for restrita | Renomear sim; criar depende da política da org |
| A2 · Criar `develop` | D2 | `[DEV]` | **Sim** |
| A3 · Time de Integradores | D6 | `[ADMIN-ORG]` | **Não** |
| A4 · Auto-delete de branch | D3 | `[ADMIN-REPO]` | **Sim** |
| A5 · Ruleset / proteção de branch no repositório | D7, D8 | `[ADMIN-REPO]` | **Sim** |
| A5 · Ruleset **de organização** | D7, D8 | `[ADMIN-ORG]` | **Não** |
| A5 · Modo `evaluate` e Rule Insights | — | `[ADMIN-ORG]` | **Não** (recurso de organização) |
| A6 · Restringir push/merge a times | D6, D8 | `[ADMIN-REPO]`, mas **só em repositório de organização** | Sim, se o repo pertencer a uma org |
| A7 · CODEOWNERS | D6, D8 | `[DEV]` para criar o arquivo; `[ADMIN-REPO]` para exigi-lo | **Sim** |
| A8 · Workflows de Actions | D11, D12 | `[DEV]` com escopo `workflow`; `[SITE-ADMIN]` se Actions estiver desligado no GHES | Sim, se Actions estiver habilitado |
| A8 · Push ruleset (tamanho/extensão) | D12 | `[ADMIN-REPO]` ou `[ADMIN-ORG]` | Confirmar disponibilidade — ver [Anexo I](#anexo-i--pontos-que-devem-ser-confirmados-na-sua-versão-do-ghe) |
| A9 · Checks obrigatórios | D1, D7 | `[ADMIN-REPO]` | **Sim** |
| A10 · Exigir commits assinados | D12 | `[ADMIN-REPO]` | **Sim** |
| A10 · Cadastrar a chave de assinatura | D12 | `[DEV]` (cada pessoa faz a sua) | **Sim** |
| A11 · Ruleset de tags | D9, D10 | `[ADMIN-REPO]` | **Sim** |
| A11 · Publicar release | D13 | `[DEV]` | **Sim** |
| A12 · Merge back automatizado | D5 | `[DEV]` | **Sim** |
| B4 · Criar GitHub App | — | `[ADMIN-ORG]` para instalar na org | **Não** |
| B4 · Ligar/desligar rate limit no GHES | — | `[SITE-ADMIN]` | **Não** |

---

## 0.6 GitHub Enterprise Cloud × Server

| Aspecto | Enterprise Cloud (`github.com`) | Enterprise Server (instância própria) |
|---|---|---|
| URL da API REST | `https://api.github.com` | `https://SEU-HOST/api/v3` |
| URL da API GraphQL | `https://api.github.com/graphql` | `https://SEU-HOST/api/graphql` |
| Variável de token do `gh` | `GH_TOKEN` | `GH_ENTERPRISE_TOKEN` |
| Rate limit | Sempre ativo: 5.000 req/h por usuário autenticado | **Pode estar desligado.** Quem liga/desliga é o `[SITE-ADMIN]`. Confirme com `gh api rate_limit` |
| Runners do Actions | Runners hospedados pelo GitHub disponíveis (`ubuntu-latest`) | **Exige runners self-hosted.** Use `runs-on: self-hosted` |
| Ações de terceiros no Actions | Marketplace disponível | Só as ações espelhadas na instância ou trazidas pelo GitHub Connect. `actions/checkout` costuma vir pré-instalado |
| Rulesets | Disponíveis, todos os tipos de regra | Disponíveis a partir das versões 3.11+; os tipos de regra evoluem versão a versão |
| Modo `evaluate` do ruleset | Disponível | Disponível a partir de versões recentes; **confirme na sua** |
| Bypass actor do tipo `User` | Existe | **Não existe** na 3.17 — use `Team` ou `RepositoryRole`. Existe `EnterpriseOwner`, que não existe no Cloud |
| `bypass_mode: "exempt"` | Existe | **Não existe** na 3.17 — use `always` ou `pull_request` |
| API clássica de proteção de tag (`/tags/protection`) | **Removida** | Ainda existe na 3.17, porém **marcada como obsoleta**. Use ruleset de tag |
| Merge queue, Advanced Security, secret scanning | Conforme o plano | Exigem licença e habilitação pelo `[SITE-ADMIN]` |

> **Regra prática.** Todo comando deste guia funciona nos dois ambientes se você exportar
> `GH_HOST` corretamente. O `gh` monta o prefixo `/api/v3` sozinho quando o host não é
> `github.com`. Você nunca escreve `/api/v3` nos comandos `gh api`.

---

## 0.7 Ordem de implantação (por dependência)

Siga **nesta ordem**. Ela não é a ordem numérica das diretrizes; é a ordem em que as
coisas precisam existir.

```
 1. A0  Descobrir ambiente e papel          ── sem isso você não sabe o que consegue fazer
 2. A1  Nome do repositório (D11)           ── renomear depois quebra remotes e automações
 3. A2  Criar main e develop (D2)           ── não há o que proteger antes de a branch existir
 4. A3  Time de Integradores (D6)           ── [ADMIN-ORG] · peça já; é o item mais lento
 5. A4  Auto-delete de branch (D3)          ── independente, faça agora
 6. A7  CODEOWNERS (D6, D8)                 ── precisa do time (4); o arquivo precisa existir
 7. A8  Workflows de Actions (D11, D12)     ── os checks precisam ter RODADO ao menos uma vez
 8. A5  Ruleset das permanentes (D7, D8)    ── consome o CODEOWNERS (6) e os checks (7)
 9. A9  Marcar os checks como obrigatórios  ── só é possível depois de (7) e (8)
10. A6  Restringir a completude (D6, D8)    ── segundo ruleset, sobre o de (8)
11. A10 Assinatura de commits (D12)         ── ligue DEPOIS que todos cadastrarem a chave
12. A11 Tags e releases (D9, D10, D13)      ── independente das branches
13. A12 Merge back (D5)                     ── precisa de main e develop protegidas
14. Parte B  Coleta dos indicadores         ── mede tudo o que foi feito acima
```

**Três armadilhas de ordem que custam caro:**

1. **Marcar um check como obrigatório antes de ele existir.** O GitHub não valida se o
   nome do check é real. Se você digitar um nome que nunca é publicado, o PR fica
   travado em "Expected — Waiting for status to be reported" **para sempre**. Rode o
   workflow uma vez, copie o nome exato do job e só então marque como obrigatório.
2. **Exigir commits assinados antes de as pessoas terem chave.** Todo push passa a ser
   recusado. Cadastre as chaves primeiro, meça em modo `evaluate`, depois ligue.
3. **Renomear o repositório depois de a automação estar pronta.** O GitHub cria
   redirecionamento, mas remotes locais, webhooks e integrações continuam apontando para
   o nome antigo. Acerte o nome no passo A1.

---

# Parte A — Configurar o GitHub para cumprir as diretrizes

## A0. Descobrir o ambiente e o seu papel

`[DEV]` · **Sem diretriz associada — é o passo zero.**

**O que é.** Antes de configurar qualquer coisa, você precisa saber (a) em qual host está,
(b) quem você é para o GitHub e (c) se você é administrador do repositório. Metade dos
erros `403` e `404` deste guia se explica por um destes três pontos.

**Pela interface.** Abra `https://GH_HOST/ORG/REPO` e procure a aba **Settings**.
Se a aba **Settings** aparecer, você é administrador do repositório. Se não aparecer,
você não é — e os passos `[ADMIN-REPO]` **devem** ser solicitados a quem é.

**Por API/CLI.**

```bash
# 1) Quem sou eu, neste host?
gh api user --jq '.login'
```

Saída esperada: o seu usuário, por exemplo `c123456`.

```bash
# 2) Que permissão eu tenho neste repositório?
gh api "repos/$ORG/$REPO" --jq '{repo: .full_name, branch_padrao: .default_branch, minhas_permissoes: .permissions}'
```

Saída esperada:

```json
{
  "repo": "MINHA-ORG/SIGA-cadastro",
  "branch_padrao": "main",
  "minhas_permissoes": {
    "admin": true,
    "maintain": true,
    "push": true,
    "triage": true,
    "pull": true
  }
}
```

**Como saber que deu certo:** `"admin": true`.

**Se der errado:**

| Saída | Significado | O que fazer |
|---|---|---|
| `"admin": false` | Você tem escrita, não administração | Solicite `Admin` ao dono do repositório, ou peça que ele execute os passos `[ADMIN-REPO]` |
| `HTTP 404: Not Found` | Quase sempre é **falta de permissão disfarçada**, não repositório inexistente | Ver [B9](#b9-erros-comuns-e-o-que-fazer) |
| `HTTP 401: Bad credentials` | Token ausente, errado ou expirado | Refaça a autenticação — [B2](#b2-autenticar) |

```bash
# 3) Sou proprietário da organização? (define se os passos [ADMIN-ORG] dependem de terceiros)
gh api "orgs/$ORG/memberships/$(gh api user --jq .login)" --jq '{estado: .state, papel: .role}'
```

Saída esperada de um proprietário:

```json
{"estado": "active", "papel": "admin"}
```

`"papel": "member"` significa que **todo passo `[ADMIN-ORG]` deve ser solicitado**.
Abra o chamado agora, antes de continuar.

---

## A1. Nomear o repositório — D11

`[ADMIN-REPO]` para renomear · `[ADMIN-ORG]` se a criação de repositórios for restrita

**O que é.** O nome do repositório **deve** seguir o padrão `SISTEMA-modulo`: o
identificador do sistema em maiúsculas, hífen, o módulo em minúsculas.

**Por que a diretriz exige.** A D11 determina que repositórios, branches e versões seguem
padrão de nomenclatura, "pois sustenta o controle de acesso e a geração de indicadores".
Sem o padrão, não há como agrupar repositórios por sistema no painel de indicadores, nem
como conceder acesso por sistema.

> **Limitação real do GitHub, e você precisa saber disto:** **não existe** regra nativa
> que bloqueie a criação de um repositório com nome fora do padrão. Rulesets selecionam
> repositórios por nome, mas não impedem que um nome fora do padrão seja criado. A D11,
> na parte de repositórios, **é garantida por processo mais auditoria** — a auditoria
> está na Parte B, indicador D11.

### Criar já com o nome certo

**Pela interface:**
1. `https://GH_HOST/organizations/ORG/repositories/new`
2. Em **Repository name**, digite `SIGA-cadastro`.
3. Em **Visibility**, escolha conforme a política institucional.
4. Marque **Add a README file** — o repositório precisa de ao menos um commit para que
   `main` exista.
5. **Create repository**.

**Por API/CLI:**

```bash
gh api --method POST "orgs/$ORG/repos" \
  -f name="$REPO" \
  -f description="Módulo de cadastro do sistema SIGA" \
  -F private=true \
  -F auto_init=true \
  -f default_branch="main" \
  --jq '{criado: .full_name, branch_padrao: .default_branch}'
```

Saída esperada:

```json
{"criado": "MINHA-ORG/SIGA-cadastro", "branch_padrao": "main"}
```

> `-f` envia o valor como **texto**; `-F` interpreta o valor (`true`/`false`/números)
> como **tipo JSON**. Trocar um pelo outro gera `HTTP 422: Validation Failed`.

### Renomear um repositório existente

**Pela interface:** *Settings → General → Repository name → Rename*.

**Por API/CLI:**

```bash
gh api --method PATCH "repos/$ORG/nome-antigo" -f name="$REPO" --jq '.full_name'
```

**Depois de renomear, todo mundo que tem clone local deve rodar:**

```bash
git remote set-url origin "https://$GH_HOST/$ORG/$REPO.git"
git remote -v      # confirme que aponta para o nome novo
```

**Verificar a conformidade do nome:**

```bash
if [[ "$REPO" =~ ^[A-Z][A-Z0-9]{1,9}-[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "CONFORME com o padrão SISTEMA-modulo"
else
  echo "NAO CONFORME: $REPO"
fi
```

---

## A2. Criar as branches permanentes — D2

`[DEV]`

**O que é.** O repositório **deve** ter `main` e `develop` presentes. `main` guarda o que
está em produção; `develop` guarda a integração contínua do desenvolvimento.

**Por que a diretriz exige.** A D2 determina que "as branches `develop` e/ou `main`
**devem** estar presentes e **protegidas**". As branches de suporte permitidas são
`feature/*`, `release/*` e `hotfix/*` — **não existe `bugfix/*` no modelo VIC**. A D3, a
D4 e a D5 assumem essas duas linhas permanentes.

**Pela interface:**
1. `https://GH_HOST/ORG/REPO/branches`
2. **New branch** → nome `develop` → **Source** `main` → **Create new branch**.

**Por API/CLI:**

```bash
# 1) Descobrir o SHA da ponta da main
SHA_MAIN=$(gh api "repos/$ORG/$REPO/git/ref/heads/main" --jq '.object.sha')
echo "main aponta para: $SHA_MAIN"

# 2) Criar a develop a partir dele.
#    Atenção: o campo 'ref' exige o caminho COMPLETO, com o prefixo refs/heads/
gh api --method POST "repos/$ORG/$REPO/git/refs" \
  -f ref="refs/heads/develop" \
  -f sha="$SHA_MAIN" \
  --jq '{criada: .ref, sha: .object.sha}'
```

Saída esperada:

```json
{"criada": "refs/heads/develop", "sha": "a1b2c3d4e5f6..."}
```

**Como saber que deu certo:**

```bash
gh api "repos/$ORG/$REPO/branches" --paginate --jq '.[] | {nome: .name, protegida: .protected}'
```

Saída esperada neste ponto (ainda sem proteção, o que é normal):

```json
{"nome": "develop", "protegida": false}
{"nome": "main",    "protegida": false}
```

**Se der errado:**

| Erro | Causa | Solução |
|---|---|---|
| `422 Reference already exists` | `develop` já existe | Nada a fazer, siga adiante |
| `422 Object does not exist` | SHA inválido ou vazio | Rode o passo 1 de novo e confira `echo $SHA_MAIN` |
| `404` em `git/ref/heads/main` | A branch padrão tem outro nome (`master`) | `gh api repos/$ORG/$REPO --jq .default_branch` e ajuste |

---

## A3. Criar o time de Integradores — D6

`[ADMIN-ORG]` · **Você provavelmente não consegue fazer sozinho. Peça no primeiro dia.**

**O que é.** Um time da organização que reúne as pessoas autorizadas a concluir merges nas
branches permanentes.

**Por que a diretriz exige.** A D6 determina que "cada repositório **deve** possuir
integradores **permissionados por time**". A D8 determina que "a completude é restrita a
perfis autorizados (integradores)". Sem um time, não há a quem conceder a dispensa que
implementa a restrição em [A6](#a6-restringir-a-completude-aos-integradores--d6-e-d8).

> **Time, não lista de usuários.** Sempre conceda permissão ao **time**, nunca a pessoas
> individuais. Quando alguém entra ou sai do papel, você altera um lugar só; caso
> contrário, precisa revisar o ruleset de cada repositório.

**Pela interface:**
1. `https://GH_HOST/orgs/ORG/teams` → **New team**
2. **Team name**: `integradores-siga` · **Visibility**: `Visible`
3. **Create team**
4. Aba **Members** → **Add a member** → adicione os Integradores
5. Aba **Repositories** → **Add repository** → escolha `SIGA-cadastro` → permissão
   **Maintain** (permite administrar o dia a dia sem entregar controle total do repositório)

**Por API/CLI:**

```bash
# 1) Criar o time
gh api --method POST "orgs/$ORG/teams" \
  -f name="Integradores SIGA" \
  -f description="Perfis autorizados a concluir merges nas branches permanentes (VIC D6/D8)" \
  -f privacy="closed" \
  --jq '{id: .id, slug: .slug}'
```

Saída esperada:

```json
{"id": 4821, "slug": "integradores-siga"}
```

> **Guarde o `id`.** Ele é obrigatório no campo `bypass_actors` do ruleset de
> [A6](#a6-restringir-a-completude-aos-integradores--d6-e-d8). O `slug` é usado na
> proteção de branch clássica e no CODEOWNERS.

```bash
# 2) Adicionar pessoas ao time (repita por pessoa)
gh api --method PUT "orgs/$ORG/teams/$TIME/memberships/c123456" \
  -f role="member" --jq '{usuario: .url, papel: .role, estado: .state}'

# 3) Dar acesso do time ao repositório
gh api --method PUT "orgs/$ORG/teams/$TIME/repos/$ORG/$REPO" \
  -f permission="maintain"
```

O passo 3 responde **`HTTP 204 No Content`** — corpo vazio. Isso é sucesso.

**Como saber que deu certo:**

```bash
# O id do time (guarde em variável para os próximos passos)
export TIME_ID=$(gh api "orgs/$ORG/teams/$TIME" --jq '.id')
echo "TIME_ID=$TIME_ID"

# Quem está no time
gh api "orgs/$ORG/teams/$TIME/members" --paginate --jq '.[].login'

# O time tem acesso ao repositório?
gh api "repos/$ORG/$REPO/teams" --paginate --jq '.[] | {time: .slug, permissao: .permission}'
```

Saída esperada da última chamada:

```json
{"time": "integradores-siga", "permissao": "maintain"}
```

**Se der errado:**

| Erro | Causa | Solução |
|---|---|---|
| `403 Forbidden` | Você não é proprietário da organização | Abra chamado. Sem este passo, A6 e A7 não funcionam |
| `422 Validation Failed` no passo 2 | Login inexistente ou pessoa fora da organização | Confirme com `gh api users/LOGIN --jq .login` |
| `404` no passo 3 | Slug do time errado | O slug é minúsculo com hífens: `Integradores SIGA` → `integradores-siga` |

---

## A4. Exclusão automática de branch após merge — D3

`[ADMIN-REPO]` · **Configuração de um clique. Faça agora.**

**O que é.** Quando um PR é concluído, o GitHub apaga sozinho a branch de origem.

**Por que a diretriz exige.** A D3 determina que "as branches temporárias **devem** ser
deletadas ao término de cada ciclo" e que "o repositório **não deve** acumular branches
obsoletas". Deixar isso na mão das pessoas garante o acúmulo.

**Pela interface:**
1. *Settings → General*
2. Role até **Pull Requests**
3. Marque **Automatically delete head branches**

**Por API/CLI:**

```bash
gh api --method PATCH "repos/$ORG/$REPO" \
  -F delete_branch_on_merge=true \
  --jq '{repo: .full_name, apaga_branch_apos_merge: .delete_branch_on_merge}'
```

Saída esperada:

```json
{"repo": "MINHA-ORG/SIGA-cadastro", "apaga_branch_apos_merge": true}
```

Equivalente mais curto:

```bash
gh repo edit "$ORG/$REPO" --delete-branch-on-merge
```

**Aplicar em todos os repositórios da organização de uma vez:**

```bash
gh api "orgs/$ORG/repos?per_page=100&type=all" --paginate --jq '.[] | select(.archived | not) | .name' \
| while read -r r; do
    if gh api --method PATCH "repos/$ORG/$r" -F delete_branch_on_merge=true --silent 2>/dev/null; then
      echo "OK    $r"
    else
      echo "FALHA $r  (provavelmente você não é admin deste repositório)"
    fi
  done
```

**Como saber que deu certo:**

```bash
gh api "repos/$ORG/$REPO" --jq '.delete_branch_on_merge'   # esperado: true
```

**Três limites que esta configuração tem — e que o indicador da D3 revela:**

1. Não apaga branches integradas **fora** de um PR (merge feito por linha de comando).
2. Não apaga branches de **fork**.
3. Não apaga branches abandonadas que **nunca** viraram PR.

Por isso a Parte B mede branches temporárias vivas, e não apenas a existência do
`delete_branch_on_merge`.

---

## A5. Proteger as branches permanentes — D7 e D8

`[ADMIN-REPO]` (repositório) · `[ADMIN-ORG]` (organização)

**O que é.** O conjunto de regras que impede push direto em `main` e `develop` e obriga
que toda mudança entre por Pull Request aprovado e com checks verdes.

**Por que a diretriz exige.** A D7 exige literalmente: bloqueio de push manual direto;
pull request revisado, aprovado por pares e concluído por integradores; integração a
pipelines automatizadas. A D8 exige que "todas as versões candidatas **devem** ser
submetidas por Pull Request".

### A5.0 Qual caminho seguir

| Situação | Caminho |
|---|---|
| GHE com rulesets disponíveis (Cloud ou GHES 3.11+) | **Ruleset** — [A5.1](#a51-caminho-recomendado-ruleset-de-repositório) |
| Você é `[ADMIN-ORG]` e quer valer para todos os repositórios | **Ruleset de organização** — [A5.3](#a53-mesmo-ruleset-para-toda-a-organização) |
| GHES antigo, sem rulesets | **Proteção clássica** — [A5.2](#a52-caminho-alternativo-proteção-de-branch-clássica) |

Descubra o que você tem:

```bash
gh api "repos/$ORG/$REPO/rulesets" --jq 'length'
```

- Devolveu um número (inclusive `0`) → **rulesets disponíveis**, siga A5.1.
- Devolveu `404` → rulesets indisponíveis nesta versão, siga A5.2.

### A5.1 Caminho recomendado: ruleset de repositório

**Pela interface:**

1. *Settings → Rules → Rulesets* → **New ruleset** → **New branch ruleset**
2. **Ruleset Name**: `VIC-01 · Branches permanentes`
3. **Enforcement status**:
   - Se **Evaluate** estiver disponível, escolha **Evaluate** primeiro. Ele **registra**
     as violações sem bloquear ninguém. Deixe rodando de 3 a 5 dias, olhe em
     *Rule Insights* e só então mude para **Active**.
   - Caso contrário, escolha **Active**.
4. **Bypass list**: deixe **vazia**. Ninguém fura este ruleset — nem administrador.
   É isso que dá autoridade ao controle.
5. **Target branches** → **Add target** → **Include by pattern**:
   digite `main`, adicione; digite `develop`, adicione.
6. **Rules** — marque exatamente:

| Regra na interface | Configuração | Diretriz |
|---|---|---|
| **Restrict deletions** | marcada | D7 |
| **Block force pushes** | marcada | D7 |
| **Require a pull request before merging** | marcada, com os subitens abaixo | D7, D8 |
| ↳ Required approvals | `1` (mínimo institucional; `2` se a governança exigir) | D8 |
| ↳ Dismiss stale pull request approvals when new commits are pushed | marcada | D8 |
| ↳ Require review from Code Owners | marcada | D6, D8 |
| ↳ Require approval of the most recent reviewable push | marcada — impede autoaprovação do próprio push | D8 |
| ↳ Require conversation resolution before merging | marcada | D8 |
| **Require status checks to pass** | marcada — preencha em [A9](#a9-tornar-os-checks-obrigatórios--d1-e-d7) | D1, D7 |
| ↳ Require branches to be up to date before merging | marcada | D4 |
| **Require signed commits** | marcar apenas em [A10](#a10-assinatura-de-commits--d12), depois das chaves cadastradas | D12 |

7. **Create**

**Por API/CLI.** Salve o corpo em arquivo — é grande demais para uma linha:

```bash
cat > /tmp/vic-ruleset-permanentes.json <<'JSON'
{
  "name": "VIC-01 · Branches permanentes",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/main", "refs/heads/develop"],
      "exclude": []
    }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": true,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": []
      }
    }
  ]
}
JSON

gh api --method POST "repos/$ORG/$REPO/rulesets" \
  --input /tmp/vic-ruleset-permanentes.json \
  --jq '{id: .id, nome: .name, situacao: .enforcement}'
```

Saída esperada:

```json
{"id": 91234, "nome": "VIC-01 · Branches permanentes", "situacao": "active"}
```

> **Guarde o `id`.** Alterar o ruleset depois é
> `gh api --method PUT "repos/$ORG/$REPO/rulesets/91234" --input arquivo.json`.

**Cinco detalhes que fazem a chamada falhar — e a maioria das pessoas erra:**

1. Em `pull_request`, os **cinco** parâmetros do exemplo são **obrigatórios** pelo
   schema. Omitir qualquer um devolve `422 Validation Failed`.
2. Em `required_status_checks`, `strict_required_status_checks_policy` e
   `required_status_checks` são **ambos obrigatórios**. A lista pode ficar vazia agora;
   você a preenche em A9.
3. `non_fast_forward` é o nome interno de "Block force pushes". Não existe regra chamada
   `force_push`.
4. Em `conditions.ref_name.include`, o caminho é **completo**: `refs/heads/main`, não
   `main`. Aceita também `~DEFAULT_BRANCH` e `~ALL`.
5. `enforcement` aceita apenas `active`, `evaluate` ou `disabled`.

**Rodar primeiro em modo de observação:** troque `"enforcement": "active"` por
`"enforcement": "evaluate"`. Nada é bloqueado; as violações ficam registradas em
*Rule Insights*. É o caminho mais seguro em repositório com time grande.

**Como saber que deu certo — teste real, não só leitura de configuração:**

```bash
# 1) Ver o que está valendo sobre a main, somando TODOS os rulesets
gh api "repos/$ORG/$REPO/rules/branches/main" --jq '[.[].type] | unique'
```

Saída esperada:

```json
["deletion","non_fast_forward","pull_request","required_status_checks"]
```

```bash
# 2) Teste de fogo: tentar um push direto na main. TEM de ser recusado.
git clone "https://$GH_HOST/$ORG/$REPO.git" /tmp/teste-vic && cd /tmp/teste-vic
git checkout main
echo "teste $(date)" >> .vic-teste
git add .vic-teste && git commit -m "teste: push direto deve ser recusado"
git push origin main
```

Saída esperada — **a recusa é o sucesso**:

```
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - Changes must be made through a pull request.
! [remote rejected] main -> main (push declined due to repository rule violations)
```

Limpe depois: `cd / && rm -rf /tmp/teste-vic`.

**Se o push passar**, uma destas coisas aconteceu:
- o ruleset está em `evaluate` (só registra) — mude para `active`;
- você está na `bypass_actors` — esvazie a lista;
- as condições não casaram — confira que é `refs/heads/main`.

### A5.2 Caminho alternativo: proteção de branch clássica

Use apenas se `gh api repos/$ORG/$REPO/rulesets` devolver `404`.

**Pela interface:** *Settings → Branches → Add branch protection rule*, padrão `main`,
e marque: *Require a pull request before merging* (com *Require approvals*, *Dismiss
stale*, *Require review from Code Owners*, *Require approval of the most recent
reviewable push*), *Require status checks to pass*, *Require conversation resolution*,
*Do not allow bypassing the above settings*. Repita para `develop`.

**Por API/CLI:**

```bash
cat > /tmp/vic-protecao-classica.json <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": [] },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON

for BRANCH in main develop; do
  gh api --method PUT "repos/$ORG/$REPO/branches/$BRANCH/protection" \
    --input /tmp/vic-protecao-classica.json --jq '.url'
done
```

**Detalhes obrigatórios do modelo clássico:**

- Os quatro campos `required_status_checks`, `enforce_admins`,
  `required_pull_request_reviews` e `restrictions` **devem estar presentes no corpo**,
  mesmo que com valor `null`. Omitir qualquer um devolve `422`.
- Dentro de `required_status_checks`, `strict` e `contexts` são obrigatórios.
- `enforce_admins: true` é o equivalente a "Do not allow bypassing" — é o que faz a
  proteção valer também para administradores. **Sem isso, a D7 não é cumprida.**
- Não existe modo `evaluate` no modelo clássico. A proteção entra valendo.

**Como saber que deu certo:**

```bash
gh api "repos/$ORG/$REPO/branches/main/protection" \
  --jq '{pr_obrigatorio: (.required_pull_request_reviews != null),
         aprovacoes: .required_pull_request_reviews.required_approving_review_count,
         vale_para_admin: .enforce_admins.enabled,
         force_push_liberado: .allow_force_pushes.enabled}'
```

Saída esperada:

```json
{"pr_obrigatorio": true, "aprovacoes": 1, "vale_para_admin": true, "force_push_liberado": false}
```

> `404` neste GET significa **branch sem proteção nenhuma** — não é erro de rota. O
> script de coleta da Parte B trata esse `404` como "não protegida".

### A5.3 Mesmo ruleset para toda a organização

`[ADMIN-ORG]`

Um único ruleset de organização protege `main` e `develop` de **todos** os repositórios,
inclusive os que forem criados amanhã. É o caminho de escala.

```bash
cat > /tmp/vic-ruleset-org.json <<'JSON'
{
  "name": "VIC-ORG · Branches permanentes",
  "target": "branch",
  "enforcement": "evaluate",
  "bypass_actors": [],
  "conditions": {
    "repository_name": { "include": ["~ALL"], "exclude": [] },
    "ref_name": { "include": ["refs/heads/main", "refs/heads/develop"], "exclude": [] }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": true,
        "required_review_thread_resolution": true
      }
    }
  ]
}
JSON

gh api --method POST "orgs/$ORG/rulesets" --input /tmp/vic-ruleset-org.json \
  --jq '{id: .id, nome: .name, situacao: .enforcement}'
```

> **Comece em `evaluate`.** Um ruleset de organização em `active` atinge todos os
> repositórios ao mesmo tempo, inclusive os que ainda não têm CODEOWNERS nem pipeline.
> Rode em `evaluate`, leia o *Rule Insights*, corrija os repositórios que quebrariam e
> só então mude para `active`.

---

## A6. Restringir a completude aos Integradores — D6 e D8

`[ADMIN-REPO]` · **Só funciona em repositório pertencente a uma organização.**

**O que é.** Fazer com que apenas membros do time de Integradores consigam clicar em
*Merge pull request* nas branches permanentes.

**Por que a diretriz exige.** A D8 separa **aprovação** (revisores do time) de
**completude** (merge). A completude "é restrita a perfis autorizados (integradores)".
A D6 exige integradores permissionados por time. O ruleset de A5 obriga o PR e a
aprovação, mas **não** diz quem conclui — é isto que falta.

### A6.1 Com ruleset: um segundo ruleset, com dispensa para o time

A ideia central: rulesets **se somam**, e a dispensa vale **só para o ruleset onde foi
concedida**. Então:

- **Ruleset VIC-01** (A5) — exige PR, aprovação e checks. **Sem dispensa para ninguém.**
- **Ruleset VIC-02** (este) — proíbe qualquer atualização da branch, **com dispensa para
  o time de Integradores**.

Resultado: um desenvolvedor não consegue atualizar `main` de forma alguma (nem por push,
nem concluindo o PR, porque o merge também atualiza a ref). Um Integrador passa pelo
VIC-02, mas **continua preso** ao VIC-01 — ou seja, ele também precisa de PR aprovado e
checks verdes. É exatamente o desenho da D8.

**Pela interface:**
1. *Settings → Rules → Rulesets* → **New ruleset** → **New branch ruleset**
2. **Name**: `VIC-02 · Completude restrita a Integradores`
3. **Enforcement**: `Evaluate` primeiro; `Active` depois de validar
4. **Bypass list** → **Add bypass** → **Teams** → `integradores-siga` → modo **Always**
5. **Target branches**: `main` e `develop`
6. **Rules**: marque **apenas** *Restrict updates*
7. **Create**

**Por API/CLI:**

```bash
# Confirme o id do time (obtido em A3)
export TIME_ID=$(gh api "orgs/$ORG/teams/$TIME" --jq '.id')
echo "TIME_ID=$TIME_ID"

cat > /tmp/vic-ruleset-completude.json <<JSON
{
  "name": "VIC-02 · Completude restrita a Integradores",
  "target": "branch",
  "enforcement": "evaluate",
  "bypass_actors": [
    { "actor_id": $TIME_ID, "actor_type": "Team", "bypass_mode": "always" }
  ],
  "conditions": {
    "ref_name": { "include": ["refs/heads/main", "refs/heads/develop"], "exclude": [] }
  },
  "rules": [
    { "type": "update", "parameters": { "update_allows_fetch_and_merge": false } }
  ]
}
JSON

gh api --method POST "repos/$ORG/$REPO/rulesets" \
  --input /tmp/vic-ruleset-completude.json \
  --jq '{id: .id, nome: .name, situacao: .enforcement, dispensados: [.bypass_actors[].actor_type]}'
```

Saída esperada:

```json
{"id": 91235, "nome": "VIC-02 · Completude restrita a Integradores", "situacao": "evaluate", "dispensados": ["Team"]}
```

Observe que o heredoc acima usa `<<JSON` **sem aspas**, para que `$TIME_ID` seja
substituído. Nos exemplos anteriores usamos `<<'JSON'` **com aspas**, que não substitui
nada. Trocar um pelo outro é causa frequente de `422`.

**Detalhes do `bypass_actors`:**

| Campo | Valores | Observação |
|---|---|---|
| `actor_type` | `Team`, `Integration`, `RepositoryRole`, `OrganizationAdmin`, `DeployKey` | No Cloud existe também `User`; no GHES 3.17 existe `EnterpriseOwner` no lugar |
| `actor_id` | número | Obrigatório para `Team`, `Integration`, `RepositoryRole` e `User`. Ignorado em `OrganizationAdmin`. `null` em `DeployKey` |
| `bypass_mode` | `always`, `pull_request` | No Cloud existe também `exempt`. Para a D8 use `always` |

Os **ids dos papéis** (`RepositoryRole`) variam e este guia não os afirma. Se precisar
dispensar por papel em vez de por time, obtenha o id na sua instância antes de usar —
ver [Anexo I](#anexo-i--pontos-que-devem-ser-confirmados-na-sua-versão-do-ghe).

**Como saber que deu certo — o teste é obrigatório:**

1. Deixe o VIC-02 em `evaluate` e abra um PR de teste `feature/teste-vic` → `develop`.
2. Peça a um desenvolvedor **fora** do time que aprove e tente concluir.
   - Em `evaluate`: o merge passa, e a violação aparece em *Rule Insights*. Confirmado o
     comportamento, mude para `active`.
   - Em `active`: o botão de merge fica bloqueado, com mensagem de violação de regra.
3. Peça a um Integrador que conclua o mesmo PR. **Deve** funcionar.
4. Confirme que o Integrador **continua** obrigado ao PR:

```bash
# Rodando como Integrador — este push TEM de ser recusado, pelo VIC-01
git checkout main && echo x >> .vic && git commit -am "teste" && git push origin main
```

```bash
# Mudar o VIC-02 para active depois de validado
gh api --method PUT "repos/$ORG/$REPO/rulesets/91235" -f enforcement="active" --jq '.enforcement'
```

### A6.2 Com proteção clássica: `restrictions`

No modelo clássico, o campo `restrictions` limita **quem pode fazer push** na branch — e
concluir um PR conta como push. É o equivalente direto.

```bash
gh api --method PUT "repos/$ORG/$REPO/branches/main/protection/restrictions/teams" \
  -f "teams[]=$TIME" --jq '[.[].slug]'
```

Saída esperada: `["integradores-siga"]`

> `restrictions` **só existe em repositório de organização**. Em repositório de conta
> pessoal o campo deve ser `null`, e a D8 não tem como ser cumprida tecnicamente — o
> repositório **deve** ser movido para a organização.

Verificar:

```bash
gh api "repos/$ORG/$REPO/branches/main/protection/restrictions" \
  --jq '{times: [.teams[].slug], usuarios: [.users[].login], apps: [.apps[].slug]}'
```

---

## A7. CODEOWNERS — D6 e D8

`[DEV]` cria o arquivo · `[ADMIN-REPO]` já exigiu a revisão em A5

**O que é.** Um arquivo de texto que declara quem é dono de quais caminhos do
repositório. Quando um PR altera um arquivo com dono, o GitHub **solicita a revisão
automaticamente** e, com *Require review from Code Owners* ligado, **exige a aprovação
desse dono**.

**Por que a diretriz exige.** A D6 atribui ao Integrador "revisar pull requests e
orientar sobre nomenclatura de branches, aplicação de SemVer e uso adequado das
ferramentas". A D8 exige revisão por pares registrada. O CODEOWNERS é o mecanismo que
roteia a revisão para quem é responsável, sem depender de alguém lembrar de marcar.

> **Distinção importante.** CODEOWNERS governa **aprovação**, não **merge**. Quem
> restringe o merge é o [A6](#a6-restringir-a-completude-aos-integradores--d6-e-d8). Os
> dois são complementares.

**Pela interface:** *Add file → Create new file*, nome `.github/CODEOWNERS`, cole o
conteúdo, faça o commit **por Pull Request** (a `main` já está protegida).

**Por linha de comando:**

```bash
git checkout develop && git pull
git checkout -b feature/vic-codeowners
mkdir -p .github

cat > .github/CODEOWNERS <<EOF
# CODEOWNERS — Modelo VIC (Diretrizes 6 e 8)
# Sintaxe: <padrão de caminho>  <donos>
# Vale a ÚLTIMA linha que casar com o arquivo. Ordem importa.

# Dono padrão de todo o repositório
*                       @$ORG/$TIME

# Configuração de versionamento e automação: exige Integrador
/.github/               @$ORG/$TIME
/.github/workflows/     @$ORG/$TIME
/CHANGELOG.md           @$ORG/$TIME
/CODEOWNERS             @$ORG/$TIME
EOF

git add .github/CODEOWNERS
git commit -m "chore(vic): adiciona CODEOWNERS (D6, D8)"
git push -u origin feature/vic-codeowners
gh pr create --base develop --title "chore(vic): CODEOWNERS" --body "Atende D6 e D8."
```

**Regras de sintaxe que quebram silenciosamente:**

| Regra | Errado | Certo |
|---|---|---|
| Time sempre com organização | `@integradores-siga` | `@MINHA-ORG/integradores-siga` |
| O dono precisa de acesso de **escrita** | time só com `read` | conceder `push` ou `maintain` (A3) |
| Vale a última linha que casa | regra genérica no fim anula as específicas | genérico primeiro, específico depois |
| Local do arquivo | `docs/config/CODEOWNERS` | `.github/CODEOWNERS`, `CODEOWNERS` ou `docs/CODEOWNERS` |

**Como saber que deu certo:**

```bash
# O GitHub valida o arquivo e devolve os erros encontrados.
gh api "repos/$ORG/$REPO/codeowners/errors" --jq '.errors'
```

Saída esperada: `[]` — lista vazia significa arquivo sem erros.

Um erro aparece assim:

```json
[{"line": 5, "column": 25, "kind": "Unknown owner",
  "source": "*  @MINHA-ORG/time-que-nao-existe",
  "suggestion": "make sure @MINHA-ORG/time-que-nao-existe exists and has write access"}]
```

Confirmação visual: abra um PR qualquer e veja o time aparecer sozinho em
**Reviewers**, com a etiqueta *Code Owner*.

---

## A8. GitHub Actions: nomenclatura e política de push — D11 e D12

`[DEV]` com escopo `workflow` · `[SITE-ADMIN]` se Actions estiver desabilitado no GHES

**O que é.** Automações que rodam a cada Pull Request e reprovam o que viola a
nomenclatura (D11) e a política de push (D12).

**Por que as diretrizes exigem.** A D11 determina que "a verificação de aderência desses
padrões **deve** ser contínua". A D12 proíbe binários (`zip`, `rar`, `jar`, `ear`, `jpg`,
`bmp`, `pdf`, `docx`, `xlsx`), arquivos acima de **10 MB** e exige autoria rastreável e
assinada.

> **Duas camadas, propósitos diferentes.**
> **Ruleset** bloqueia no `git push` — a violação nunca entra no repositório. É a
> barreira preventiva.
> **Actions** avalia no PR e publica um *status check* — é o que produz **evidência
> auditável** e alimenta o indicador.
> Implante as duas. Uma não substitui a outra.

### A8.1 Camada preventiva: push ruleset (D12)

Bloqueia no momento do push, sem workflow, sem runner.

```bash
cat > /tmp/vic-ruleset-push.json <<'JSON'
{
  "name": "VIC-03 · Política de push (formato e tamanho)",
  "target": "push",
  "enforcement": "evaluate",
  "bypass_actors": [],
  "rules": [
    { "type": "max_file_size", "parameters": { "max_file_size": 10 } },
    { "type": "file_extension_restriction",
      "parameters": { "restricted_file_extensions": [
        ".zip", ".rar", ".jar", ".ear", ".jpg", ".jpeg",
        ".bmp", ".pdf", ".docx", ".xlsx"
      ] } }
  ]
}
JSON

gh api --method POST "repos/$ORG/$REPO/rulesets" --input /tmp/vic-ruleset-push.json \
  --jq '{id: .id, nome: .name, alvo: .target, situacao: .enforcement}'
```

**Pontos de atenção:**

- `max_file_size` é em **megabytes**, inteiro, entre `1` e `100`. Para o limite da D12,
  o valor é `10`.
- O limite **não se aplica** a arquivos em Git LFS.
- Rulesets de `target: "push"` têm disponibilidade que varia por plano e por versão.
  Se a chamada devolver `422` ou a opção não aparecer na interface, **a preventiva não
  está disponível no seu ambiente** — nesse caso a camada de Actions (A8.2) passa a ser
  o único controle. Ver [Anexo I](#anexo-i--pontos-que-devem-ser-confirmados-na-sua-versão-do-ghe).
- Comece em `evaluate`: repositório com histórico sujo pode travar o time inteiro no
  primeiro push.

### A8.2 Camada de evidência: workflow de nomenclatura (D11)

```bash
mkdir -p .github/workflows
cat > .github/workflows/vic-nomenclatura.yml <<'YAML'
# Modelo VIC — Diretriz 11 (padrões de nomenclatura)
# Valida o nome da branch de origem do PR e o nome da tag publicada.
name: VIC · Nomenclatura

on:
  pull_request:
    types: [opened, reopened, synchronize]
  push:
    tags: ['**']

jobs:
  # ATENÇÃO: o valor de `name:` abaixo é o texto que aparece como status check
  # e é EXATAMENTE o que você vai declarar como obrigatório no passo A9.
  branch:
    name: vic-nomenclatura-branch
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest      # em GitHub Enterprise Server, troque por: self-hosted
    steps:
      - name: Validar o nome da branch de origem
        # O nome da branch entra por variável de ambiente, nunca interpolado
        # direto no script — isso evita injeção de comando por nome de branch.
        env:
          BRANCH: ${{ github.head_ref }}
        run: |
          set -euo pipefail
          echo "Branch de origem: $BRANCH"
          # Prefixos permitidos pelo modelo VIC. Não existe bugfix/*.
          if [[ "$BRANCH" =~ ^(feature|release|hotfix)/[a-z0-9][a-z0-9._-]*$ ]]; then
            echo "CONFORME — Diretriz 11"
          else
            echo "::error::Branch '$BRANCH' fora do padrão. Use feature/<nome>, release/<versao> ou hotfix/<nome>, em minúsculas. (Diretriz 11)"
            exit 1
          fi

  tag:
    name: vic-nomenclatura-tag
    if: github.event_name == 'push'
    runs-on: ubuntu-latest      # em GitHub Enterprise Server, troque por: self-hosted
    steps:
      - name: Validar o nome da tag
        env:
          TAG: ${{ github.ref_name }}
        run: |
          set -euo pipefail
          echo "Tag: $TAG"
          # Padrão VEC (D10): MAJOR.MINOR.PATCH.BUILD — obrigatório em produção.
          # SemVer puro (D9): MAJOR.MINOR.PATCH — aceito fora de produção.
          # O prefixo 'v' é opcional AQUI; fixe a decisão institucional e remova o 'v?'.
          if   [[ "$TAG" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "CONFORME — Padrão VEC (Diretriz 10)"
          elif [[ "$TAG" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "::warning::Tag em SemVer puro. Produção exige MAJOR.MINOR.PATCH.BUILD (Diretriz 10)."
          else
            echo "::error::Tag '$TAG' fora do padrão SemVer/VEC (Diretrizes 9 e 10)."
            exit 1
          fi
YAML
```

> **O job `tag` não impede a tag.** Quando ele roda, a tag já foi criada. Quem impede é o
> ruleset de tag em [A11](#a11-tags-e-releases--d9-d10-e-d13). O job serve como
> evidência e alerta.

### A8.3 Camada de evidência: workflow de política de push (D12)

```bash
cat > .github/workflows/vic-politica-push.yml <<'YAML'
# Modelo VIC — Diretriz 12 (formato, tamanho e autoria)
name: VIC · Política de push

on:
  pull_request:
    types: [opened, reopened, synchronize]

jobs:
  politica:
    name: vic-politica-push
    runs-on: ubuntu-latest      # em GitHub Enterprise Server, troque por: self-hosted
    steps:
      # fetch-depth: 0 traz o histórico completo. Sem isso o `git diff` entre
      # a base e a cabeça do PR falha por falta de objetos.
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Formato e tamanho dos arquivos alterados
        env:
          BASE_SHA: ${{ github.event.pull_request.base.sha }}
          HEAD_SHA: ${{ github.event.pull_request.head.sha }}
        run: |
          set -euo pipefail
          EXT_PROIBIDAS="zip rar jar ear jpg jpeg bmp pdf docx xlsx"
          LIMITE_BYTES=$((10 * 1024 * 1024))   # 10 MB, conforme a Diretriz 12
          falhou=0

          # --diff-filter=ACMRT: Adicionados, Copiados, Modificados, Renomeados e
          # com Tipo alterado. Deleções são ignoradas de propósito — apagar um
          # binário antigo não pode reprovar o PR.
          git diff --name-only --diff-filter=ACMRT "$BASE_SHA" "$HEAD_SHA" > /tmp/alterados.txt
          echo "Arquivos avaliados: $(wc -l < /tmp/alterados.txt)"

          while IFS= read -r arquivo; do
            [ -z "$arquivo" ] && continue

            ext="${arquivo##*.}"
            ext="$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')"
            for proibida in $EXT_PROIBIDAS; do
              if [ "$ext" = "$proibida" ]; then
                echo "::error file=$arquivo::Formato binário não permitido (.$ext) — Diretriz 12"
                falhou=1
              fi
            done

            # git cat-file -s devolve o tamanho do blob em bytes, sem baixar o conteúdo.
            tamanho=$(git cat-file -s "$HEAD_SHA:$arquivo" 2>/dev/null || echo 0)
            if [ "$tamanho" -gt "$LIMITE_BYTES" ]; then
              mb=$(( tamanho / 1024 / 1024 ))
              echo "::error file=$arquivo::Arquivo de ${mb} MB excede o limite de 10 MB — Diretriz 12"
              falhou=1
            fi
          done < /tmp/alterados.txt

          [ "$falhou" -eq 0 ] && echo "CONFORME — Diretriz 12 (formato e tamanho)"
          exit "$falhou"

      - name: Autoria rastreável e assinada
        env:
          GH_TOKEN: ${{ github.token }}
          PR: ${{ github.event.pull_request.number }}
        run: |
          set -euo pipefail
          # A API devolve o resultado da verificação de assinatura de cada commit.
          nao_assinados=$(gh api "repos/${GITHUB_REPOSITORY}/pulls/${PR}/commits" --paginate \
            --jq '[.[] | select(.commit.verification.verified == false) | .sha] | join(" ")')
          sem_email=$(gh api "repos/${GITHUB_REPOSITORY}/pulls/${PR}/commits" --paginate \
            --jq '[.[] | select(.author == null) | .sha] | join(" ")')

          if [ -n "$sem_email" ]; then
            echo "::error::Commits sem autor vinculado a uma conta do GitHub: $sem_email (Diretriz 12)"
            exit 1
          fi
          if [ -n "$nao_assinados" ]; then
            echo "::error::Commits sem assinatura verificada: $nao_assinados (Diretriz 12)"
            exit 1
          fi
          echo "CONFORME — Diretriz 12 (autoria e assinatura)"
YAML

git checkout -b feature/vic-workflows
git add .github/workflows/
git commit -m "ci(vic): valida nomenclatura e política de push (D11, D12)"
git push -u origin feature/vic-workflows
gh pr create --base develop --title "ci(vic): workflows de nomenclatura e política de push" --body "Atende D11 e D12."
```

**Como saber que deu certo:**

```bash
# 1) O workflow foi registrado?
gh workflow list --repo "$ORG/$REPO"
```

Saída esperada:

```
VIC · Nomenclatura      active  12345678
VIC · Política de push  active  12345679
```

```bash
# 2) Ele rodou? Qual foi o resultado?
gh run list --repo "$ORG/$REPO" --limit 5
```

```bash
# 3) Falhou? Leia o log do job que falhou:
gh run view --repo "$ORG/$REPO" --log-failed
```

**Se der errado:**

| Sintoma | Causa | Solução |
|---|---|---|
| `refusing to allow ... without workflow scope` no push | Seu token não tem o escopo `workflow` | `gh auth refresh -h "$GH_HOST" -s workflow` |
| Workflow não aparece / não roda | Actions desabilitado, ou o arquivo não está em `.github/workflows/` na branch padrão | *Settings → Actions → General*; no GHES fale com o `[SITE-ADMIN]` |
| `No runner matching the labels` | GHES sem runner self-hosted | Troque `runs-on: ubuntu-latest` por `self-hosted` e peça um runner |
| `Unable to resolve action actions/checkout` | GHES sem GitHub Connect e sem a ação espelhada | Peça ao `[SITE-ADMIN]` para sincronizar as ações |
| YAML inválido | Indentação | `gh run list` mostra `startup_failure`; valide a indentação (só espaços, nunca tabulação) |

---

## A9. Tornar os checks obrigatórios — D1 e D7

`[ADMIN-REPO]` · **Só depois de os workflows de A8 terem rodado ao menos uma vez.**

**O que é.** Declarar quais status checks precisam estar verdes para o merge ser
permitido.

**Por que as diretrizes exigem.** A D1 exige que "a integração contínua **deve** ser
acompanhada por pipelines automatizadas com verificações obrigatórias" e que "nenhuma
entrega avance para ambientes críticos sem cumprir os critérios". A D7 exige "integração
a pipelines automatizadas". Um workflow que roda mas não bloqueia **não cumpre** a
diretriz: ele informa, não impede.

**Passo 1 — descobrir o nome exato dos checks.** Este é o passo que todo mundo pula e
que faz o PR travar.

```bash
# Pegue o SHA do último commit de um PR aberto e liste os checks reportados nele
SHA=$(gh api "repos/$ORG/$REPO/commits/develop" --jq '.sha')
gh api "repos/$ORG/$REPO/commits/$SHA/check-runs" --jq '.check_runs[] | {nome: .name, resultado: .conclusion}'
```

Saída esperada:

```json
{"nome": "vic-nomenclatura-branch", "resultado": "success"}
{"nome": "vic-politica-push",       "resultado": "success"}
```

> **O nome do check é o `name:` do JOB, não o `name:` do workflow.** O workflow chama-se
> `VIC · Nomenclatura`; o check chama-se `vic-nomenclatura-branch`. Se você declarar
> `VIC · Nomenclatura` como obrigatório, ele nunca será reportado e **o PR fica travado
> para sempre**.

**Passo 2 — declarar como obrigatórios.**

**Pela interface:** *Settings → Rules → Rulesets → `VIC-01` → Edit →*
*Require status checks to pass → Add checks →* digite `vic-nomenclatura-branch`,
depois `vic-politica-push`. Mantenha *Require branches to be up to date before merging*
marcada. **Save changes**.

**Por API/CLI (ruleset):** o `PUT` de ruleset substitui o objeto inteiro. Leia,
altere e grave:

```bash
RULESET_ID=$(gh api "repos/$ORG/$REPO/rulesets" --jq '.[] | select(.name | startswith("VIC-01")) | .id')
echo "RULESET_ID=$RULESET_ID"

gh api "repos/$ORG/$REPO/rulesets/$RULESET_ID" > /tmp/ruleset-atual.json

jq '(.rules[] | select(.type == "required_status_checks") | .parameters) |=
    { strict_required_status_checks_policy: true,
      do_not_enforce_on_create: true,
      required_status_checks: [
        { context: "vic-nomenclatura-branch" },
        { context: "vic-politica-push" }
      ] }
   | {name, target, enforcement, bypass_actors, conditions, rules}' \
   /tmp/ruleset-atual.json > /tmp/ruleset-novo.json

gh api --method PUT "repos/$ORG/$REPO/rulesets/$RULESET_ID" --input /tmp/ruleset-novo.json \
  --jq '.rules[] | select(.type=="required_status_checks") | .parameters.required_status_checks'
```

Saída esperada:

```json
[{"context": "vic-nomenclatura-branch"}, {"context": "vic-politica-push"}]
```

> `do_not_enforce_on_create: true` evita que a criação de uma branch seja bloqueada por
> um check que ainda não teve como rodar. Deixe ligado.

**Por API/CLI (proteção clássica):**

```bash
gh api --method PATCH "repos/$ORG/$REPO/branches/main/protection/required_status_checks" \
  -F strict=true \
  -f "contexts[]=vic-nomenclatura-branch" \
  -f "contexts[]=vic-politica-push" \
  --jq '{atualizado: .strict, checks: .contexts}'
```

**Como saber que deu certo:** abra um PR de teste. No rodapé do PR **deve** aparecer:

```
Required   vic-nomenclatura-branch   Successful in 12s
Required   vic-politica-push         Successful in 31s
```

A palavra **Required** é a confirmação. Sem ela, o check está apenas informativo.

**Se o PR travar em `Expected — Waiting for status to be reported`:**

| Causa | Como confirmar | Solução |
|---|---|---|
| Nome do check digitado errado | Compare com o `name:` do job | Corrija a lista de checks |
| O workflow tem filtro `paths:` e o PR não tocou naqueles caminhos | Leia o `on:` do workflow | Remova o filtro `paths:` dos workflows de conformidade |
| O workflow não dispara em `pull_request` | Leia o `on:` | Inclua `pull_request` nos gatilhos |

---

## A10. Assinatura de commits — D12

`[DEV]` cadastra a chave · `[ADMIN-REPO]` liga a exigência

**O que é.** Cada commit carrega uma assinatura criptográfica. O GitHub valida e mostra
o selo **Verified**.

**Por que a diretriz exige.** A D12 determina que "o autor de cada commit **deve** ser
rastreável, conforme as regras de identificação e **assinatura digital** estabelecidas".
Sem assinatura, qualquer pessoa pode escrever qualquer nome e e-mail em `git config` e
forjar a autoria.

> **Ordem obrigatória.** Cadastre as chaves de **todo mundo** primeiro. Ligar a exigência
> antes disso derruba o time inteiro: todo push passa a ser recusado.

### A10.1 Cada pessoa configura a própria chave (SSH — caminho mais simples)

```bash
# 1) Gerar a chave (aperte Enter para aceitar o caminho padrão; use uma senha forte)
ssh-keygen -t ed25519 -C "seu.nome@empresa.com.br"

# 2) Dizer ao git para assinar com SSH, sempre
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true

# 3) O e-mail do git DEVE ser um e-mail verificado na sua conta do GitHub,
#    senão o commit aparece como "Unverified" mesmo assinado.
git config --global user.email "seu.nome@empresa.com.br"
git config --global user.name  "Seu Nome"
```

```bash
# 4) Cadastrar a chave pública no GitHub, como chave de ASSINATURA (não de autenticação)
gh ssh-key add ~/.ssh/id_ed25519.pub --title "Assinatura VIC - notebook" --type signing
```

Pela interface: *Settings → SSH and GPG keys → New SSH key → Key type: **Signing Key***.

**Como saber que deu certo:**

```bash
# Localmente
git commit --allow-empty -m "teste de assinatura"
git log --show-signature -1
```

Saída esperada: uma linha `Good "git" signature for ...`.

```bash
# No GitHub — este é o teste que vale
git push
gh api "repos/$ORG/$REPO/commits/$(git rev-parse HEAD)" \
  --jq '{assinado: .commit.verification.verified, motivo: .commit.verification.reason}'
```

Saída esperada:

```json
{"assinado": true, "motivo": "valid"}
```

**Se vier `false`, o campo `motivo` diz exatamente o problema:**

| `motivo` | Significado | Solução |
|---|---|---|
| `unsigned` | O commit não foi assinado | `git config --global commit.gpgsign true` e refaça |
| `unknown_key` | A chave não está cadastrada como *Signing Key* | Refaça o passo 4 com `--type signing` |
| `unverified_email` | O e-mail do commit não está verificado na conta | Verifique o e-mail em *Settings → Emails* |
| `no_user` | O e-mail não pertence a nenhuma conta | Ajuste `git config --global user.email` |

> **Verificação de assinatura SSH depende da versão do GHES.** Se o commit ficar
> `Unverified` mesmo com tudo certo, confirme com o `[SITE-ADMIN]` se a instância suporta
> assinatura SSH; se não suportar, use GPG (`gh gpg-key add`).

Ative também o **Vigilant mode** (*Settings → SSH and GPG keys → Flag unsigned commits as
unverified*): commits não assinados em seu nome passam a ser marcados como
**Unverified** em vez de ficarem sem selo. É o que fecha a brecha de forja.

### A10.2 Exigir assinatura na branch protegida

**Pela interface (ruleset):** *Settings → Rules → Rulesets → `VIC-01` → Edit →*
marque **Require signed commits** → **Save changes**.

**Por API/CLI (ruleset):** acrescente a regra ao array `rules`:

```bash
gh api "repos/$ORG/$REPO/rulesets/$RULESET_ID" \
  | jq '{name, target, enforcement, bypass_actors, conditions,
         rules: (.rules + [{type: "required_signatures"}])}' > /tmp/ruleset-assinatura.json

gh api --method PUT "repos/$ORG/$REPO/rulesets/$RULESET_ID" --input /tmp/ruleset-assinatura.json \
  --jq '[.rules[].type]'
```

Saída esperada — `required_signatures` presente na lista.

**Por API/CLI (proteção clássica):** é um endpoint separado, sem corpo:

```bash
gh api --method POST "repos/$ORG/$REPO/branches/main/protection/required_signatures" --jq '.enabled'
```

Saída esperada: `true`

Verificar depois: `gh api "repos/$ORG/$REPO/branches/main/protection/required_signatures" --jq '.enabled'`

> **Merges feitos pela interface do GitHub são assinados pelo próprio GitHub** e passam
> na regra. O problema aparece com **bots e automações** que fazem commit sem assinar —
> inclusive o workflow de merge back de [A12](#a12-merge-back-automatizado--d5). Rode
> em `evaluate` por uma semana e veja o que quebraria antes de ativar.

---

## A11. Tags e releases — D9, D10 e D13

`[ADMIN-REPO]` protege as tags · `[DEV]` publica a release

**O que é.** Tags no Padrão VEC `MAJOR.MINOR.PATCH.BUILD` protegidas contra criação
indevida, e uma nota de versão publicada a cada mudança.

**Por que as diretrizes exigem.** A D9 exige SemVer `MAJOR.MINOR.PATCH` para todos os
elementos da versão. A D10 exige `MAJOR.MINOR.PATCH.BUILD` (Padrão VEC) e determina que
"somente versões que possuam a tag institucional no formato VEC **devem** ser
consideradas aptas para implantação em ambientes produtivos". A D13 exige nota de versão
publicada "a cada mudança publicada".

### A11.1 Ruleset de tag (D9, D10)

**Pela interface:** *Settings → Rules → Rulesets → New ruleset → **New tag ruleset***
1. **Name**: `VIC-04 · Tags de produção (Padrão VEC)`
2. **Enforcement**: `Active`
3. **Bypass list**: adicione o time `integradores-siga`, modo **Always**
4. **Target tags** → **Include by pattern** → `**` (todas as tags)
5. **Rules**: marque *Restrict deletions*, *Block force pushes* e, em
   **Metadata restrictions**, *Require tag names to match a given pattern* com:
   - Operador: **matches regex**
   - Padrão: `^v?[0-9]+\.[0-9]+\.[0-9]+(\.[0-9]+)?$`
6. **Create**

**Por API/CLI:**

```bash
cat > /tmp/vic-ruleset-tags.json <<JSON
{
  "name": "VIC-04 · Tags de produção (Padrão VEC)",
  "target": "tag",
  "enforcement": "active",
  "bypass_actors": [
    { "actor_id": $TIME_ID, "actor_type": "Team", "bypass_mode": "always" }
  ],
  "conditions": { "ref_name": { "include": ["~ALL"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "tag_name_pattern",
      "parameters": {
        "name": "Padrão VEC MAJOR.MINOR.PATCH.BUILD",
        "operator": "regex",
        "negate": false,
        "pattern": "^v?[0-9]+\\\\.[0-9]+\\\\.[0-9]+(\\\\.[0-9]+)?\$"
      }
    }
  ]
}
JSON

gh api --method POST "repos/$ORG/$REPO/rulesets" --input /tmp/vic-ruleset-tags.json \
  --jq '{id: .id, nome: .name, alvo: .target}'
```

> **Cuidado com o escape.** O heredoc sem aspas (`<<JSON`) substitui variáveis, então
> `\.` precisa virar `\\\\.` e `$` precisa virar `\$` para chegar ao JSON como `\.` e `$`.
> **Sempre confira o arquivo antes de enviar:** `cat /tmp/vic-ruleset-tags.json`. Se
> preferir evitar o problema, use `<<'JSON'` (com aspas) e substitua `$TIME_ID` pelo
> número na mão.

**Como saber que deu certo — teste real:**

```bash
git tag 9.9.9-invalida && git push origin 9.9.9-invalida
```

Saída esperada — a recusa é o sucesso:

```
remote: error: GH013: Repository rule violations found for refs/tags/9.9.9-invalida.
remote: - Tag name pattern: Padrão VEC MAJOR.MINOR.PATCH.BUILD
! [remote rejected] 9.9.9-invalida -> 9.9.9-invalida (push declined due to repository rule violations)
```

Limpe a tag local: `git tag -d 9.9.9-invalida`.

> **Não use a API clássica de proteção de tag** (`/repos/{owner}/{repo}/tags/protection`).
> Ela foi **removida** no GitHub Enterprise Cloud e está **marcada como obsoleta** no
> GHES 3.17. O ruleset de tag é o caminho.

### A11.2 Categorias da nota de versão (D13)

O arquivo `.github/release.yml` define como o GitHub agrupa as mudanças quando gera a
nota automaticamente. As categorias abaixo espelham o exemplo da D13.

```bash
cat > .github/release.yml <<'YAML'
# Modelo VIC — Diretriz 13 (nota de versão)
# O agrupamento é feito pelas ETIQUETAS (labels) dos Pull Requests incluídos.
changelog:
  exclude:
    labels: [ignorar-no-changelog]
  categories:
    - title: Adicionado
      labels: [feature, enhancement]
    - title: Alterado
      labels: [change, refactor]
    - title: Corrigido
      labels: [bug, hotfix]
    - title: Segurança
      labels: [security]
    - title: Outras mudanças
      labels: ["*"]
YAML
```

> Para o agrupamento funcionar, **os PRs precisam ter etiquetas**. Sem etiqueta, tudo cai
> em "Outras mudanças". Padronize as etiquetas na organização.

### A11.3 Publicar a release (D10, D13)

```bash
export VERSAO="2.4.1.305"

# Anotada e assinada, apontando para a main
git checkout main && git pull
git tag -s "$VERSAO" -m "Release $VERSAO"
git push origin "$VERSAO"

# Criar a release com nota gerada automaticamente
gh release create "$VERSAO" \
  --repo "$ORG/$REPO" \
  --title "$VERSAO" \
  --target main \
  --generate-notes
```

Equivalente por API:

```bash
gh api --method POST "repos/$ORG/$REPO/releases" \
  -f tag_name="$VERSAO" \
  -f name="$VERSAO" \
  -f target_commitish="main" \
  -F generate_release_notes=true \
  -F draft=false \
  -F prerelease=false \
  --jq '{tag: .tag_name, publicada_em: .published_at, url: .html_url}'
```

Saída esperada:

```json
{"tag": "2.4.1.305", "publicada_em": "2026-06-28T14:02:11Z",
 "url": "https://github.empresa.com.br/MINHA-ORG/SIGA-cadastro/releases/tag/2.4.1.305"}
```

Para nota escrita à mão, no formato da D13:

```bash
gh release create "$VERSAO" --repo "$ORG/$REPO" --title "$VERSAO" --target main \
  --notes "$(cat <<'EOF'
## Adicionado
- Exportação de relatórios em CSV.

## Alterado
- Atualização da política de senha (mínimo 12 caracteres).

## Corrigido
- Falha intermitente no login via SSO.
EOF
)"
```

**Como saber que deu certo:**

```bash
gh api "repos/$ORG/$REPO/releases" --paginate \
  --jq '.[] | {tag: .tag_name, tem_nota: (((.body // "") | length) > 0), rascunho: .draft}'
```

Saída esperada — `"tem_nota": true` e `"rascunho": false` em toda tag de produção.
Uma release em rascunho **não** cumpre a D13: ela não foi comunicada.

### A11.4 Automatizar a publicação a cada tag

```bash
cat > .github/workflows/vic-release.yml <<'YAML'
# Modelo VIC — Diretrizes 10 e 13
# Publica a release automaticamente quando uma tag no Padrão VEC é enviada.
name: VIC · Release

on:
  push:
    tags: ['*.*.*.*']    # MAJOR.MINOR.PATCH.BUILD

permissions:
  contents: write        # necessário para criar a release

jobs:
  publicar:
    name: vic-release
    runs-on: ubuntu-latest      # em GHES: self-hosted
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Publicar a nota de versão
        env:
          GH_TOKEN: ${{ github.token }}
          TAG: ${{ github.ref_name }}
        run: |
          set -euo pipefail
          if ! [[ "$TAG" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "::error::Tag '$TAG' fora do Padrão VEC (Diretriz 10)."
            exit 1
          fi
          gh release create "$TAG" --title "$TAG" --generate-notes --verify-tag
          echo "Release $TAG publicada — Diretrizes 10 e 13"
YAML
```

---

## A12. Merge back automatizado — D5

`[DEV]`

**O que é.** Um workflow que, sempre que `main` avança, abre automaticamente um PR
levando essas mudanças de volta para `develop`.

**Por que a diretriz exige.** A D5 determina que "sempre que uma release é integrada à
`main`, o merge de volta na `develop` **deve** ser realizado" e que "após a finalização
de um hotfix, a correção **deve** ser propagada para a `develop`". Sem o merge back,
surgem commits órfãos e regressões.

> **O GitHub não tem merge back nativo.** É automação. O workflow abre o PR; a conclusão
> continua sujeita ao ruleset de A5/A6 — ou seja, ainda passa por aprovação e Integrador.
> Isso é intencional.

```bash
cat > .github/workflows/vic-merge-back.yml <<'YAML'
# Modelo VIC — Diretriz 5 (sincronização entre branches principais)
name: VIC · Merge back

on:
  push:
    branches: [main]
  workflow_dispatch:      # permite disparo manual pela interface

permissions:
  contents: write
  pull-requests: write

jobs:
  merge-back:
    name: vic-merge-back
    runs-on: ubuntu-latest      # em GHES: self-hosted
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Abrir o PR de merge back para a develop
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          set -euo pipefail
          git fetch origin main develop

          # Quantos commits existem na main que ainda NÃO estão na develop.
          # Este é exatamente o indicador da Diretriz 5.
          PENDENTES=$(git rev-list --count origin/develop..origin/main)
          echo "Commits da main ausentes na develop: $PENDENTES"

          if [ "$PENDENTES" -eq 0 ]; then
            echo "CONFORME — develop já contém tudo o que está na main (Diretriz 5)"
            exit 0
          fi

          # Reaproveita o PR de merge back que já esteja aberto, se houver.
          ABERTO=$(gh pr list --base develop --head merge-back/main --state open --json number --jq '.[0].number // empty')
          if [ -n "$ABERTO" ]; then
            echo "Já existe o PR #$ABERTO de merge back. Nada a fazer."
            exit 0
          fi

          git config user.name  "VIC Merge Back"
          git config user.email "vic-bot@empresa.com.br"
          git checkout -B merge-back/main origin/main
          git push --force-with-lease origin merge-back/main

          gh pr create \
            --base develop \
            --head merge-back/main \
            --title "chore(vic): merge back main -> develop ($PENDENTES commits)" \
            --body "Merge back automático exigido pela **Diretriz 5**.

A \`main\` está $PENDENTES commit(s) à frente da \`develop\`.
A conclusão deste PR é responsabilidade do **Integrador** (Diretrizes 6 e 8)."
YAML
```

**Como saber que deu certo:** conclua um PR na `main` e confira, em até um minuto, que um
PR `merge-back/main → develop` foi aberto.

Medição manual, a qualquer momento:

```bash
gh api "repos/$ORG/$REPO/compare/develop...main" \
  --jq '{main_a_frente_da_develop: .ahead_by, ultimo_ponto_comum: .merge_base_commit.commit.committer.date}'
```

Saída esperada quando a D5 está cumprida:

```json
{"main_a_frente_da_develop": 0, "ultimo_ponto_comum": "2026-06-28T14:02:11Z"}
```

**Duas limitações para conhecer:**

1. Um workflow autenticado com `github.token` **não dispara outros workflows**. O PR de
   merge back pode aparecer sem os checks. Se isso ocorrer, feche e reabra o PR, ou
   autentique o workflow com um GitHub App.
2. Se a regra de assinatura de A10 estiver ativa, os commits gerados pelo bot precisam
   ser assinados — ou o bot precisa constar como dispensado no ruleset.

---

## A13. Checklist de conclusão da Parte A

Rode este bloco. Ele responde, item a item, se a diretriz está cumprida.

```bash
echo "=== Conformidade VIC — $ORG/$REPO ==="

echo -n "D11 nome do repositório .......... "
[[ "$REPO" =~ ^[A-Z][A-Z0-9]{1,9}-[a-z0-9]+(-[a-z0-9]+)*$ ]] && echo "OK" || echo "FALHA ($REPO)"

echo -n "D2  main e develop existem ....... "
gh api "repos/$ORG/$REPO/branches" --paginate --jq '[.[].name] | contains(["main","develop"])'

echo -n "D3  auto-delete de branch ........ "
gh api "repos/$ORG/$REPO" --jq '.delete_branch_on_merge'

echo -n "D7  regras ativas na main ........ "
gh api "repos/$ORG/$REPO/rules/branches/main" --jq '[.[].type] | unique | join(", ")'

echo -n "D7  regras ativas na develop ..... "
gh api "repos/$ORG/$REPO/rules/branches/develop" --jq '[.[].type] | unique | join(", ")'

echo -n "D8  PR obrigatório na main ....... "
gh api "repos/$ORG/$REPO/rules/branches/main" --jq 'any(.type == "pull_request")'

echo -n "D8  aprovações exigidas .......... "
gh api "repos/$ORG/$REPO/rules/branches/main" \
  --jq '[.[] | select(.type=="pull_request") | .parameters.required_approving_review_count] | first // 0'

echo -n "D12 assinatura exigida ........... "
gh api "repos/$ORG/$REPO/rules/branches/main" --jq 'any(.type == "required_signatures")'

echo -n "D6  CODEOWNERS sem erros ......... "
gh api "repos/$ORG/$REPO/codeowners/errors" --jq '(.errors | length) == 0'

echo -n "D6  time de Integradores ......... "
gh api "repos/$ORG/$REPO/teams" --paginate --jq "[.[].slug] | contains([\"$TIME\"])"

echo -n "D1  checks obrigatórios .......... "
gh api "repos/$ORG/$REPO/rules/branches/main" \
  --jq '[.[] | select(.type=="required_status_checks") | .parameters.required_status_checks[].context] | join(", ")'

echo -n "D10 ruleset de tag ............... "
gh api "repos/$ORG/$REPO/rulesets" --jq 'any(.target == "tag")'

echo -n "D13 releases com nota ............ "
gh api "repos/$ORG/$REPO/releases?per_page=10" \
  --jq '[.[] | select(((.body // "") | length) > 0)] | length'

echo -n "D5  main à frente da develop ..... "
gh api "repos/$ORG/$REPO/compare/develop...main" --jq '.ahead_by'
```

Resultado ideal: `true`/`OK` em todas as linhas booleanas, listas de regras não vazias e
`D5 = 0`.

---

# Parte B — Coletar os dados dos indicadores

A Parte A tornou o repositório **conforme**. A Parte B **mede** essa conformidade e
produz os números do painel de acompanhamento.

## B1. Instalar o `gh` CLI

**O que é.** O `gh` é o programa de linha de comando oficial do GitHub. Ele resolve
autenticação, monta a URL da API, faz paginação e filtra JSON — coisas que, com `curl`,
você teria de escrever à mão.

| Sistema | Comando |
|---|---|
| Ubuntu/Debian | `sudo apt update && sudo apt install gh` |
| RHEL/Fedora | `sudo dnf install gh` |
| macOS | `brew install gh` |
| Windows | `winget install --id GitHub.cli` |
| Sem instalador (Linux) | ver bloco abaixo |

```bash
# Instalação sem privilégio de administrador, em ~/bin
VER="2.63.2"   # troque pela versão desejada
mkdir -p ~/bin && cd /tmp
curl -fsSL -o gh.tgz "https://github.com/cli/cli/releases/download/v${VER}/gh_${VER}_linux_amd64.tar.gz"
tar -xzf gh.tgz
cp "gh_${VER}_linux_amd64/bin/gh" ~/bin/
export PATH="$HOME/bin:$PATH"   # acrescente esta linha ao seu ~/.bashrc
```

**Como saber que deu certo:**

```bash
gh --version
```

Saída esperada:

```
gh version 2.63.2 (2024-12-05)
https://github.com/cli/cli/releases/latest
```

**Se der errado:**

| Sintoma | Solução |
|---|---|
| `command not found: gh` | O diretório de instalação não está no `PATH`. `export PATH="$HOME/bin:$PATH"` |
| `certificate signed by unknown authority` | Proxy corporativo com inspeção TLS. Exporte o certificado da empresa: `export SSL_CERT_FILE=/caminho/ca-empresa.pem` |
| Download bloqueado | Peça o binário à equipe de infraestrutura ou use `curl` puro (a Parte B funciona com `curl`, apenas com mais trabalho) |

---

## B2. Autenticar

### B2.1 Criar o token

**Token clássico (mais simples, e o que funciona em toda versão de GHES):**

1. `https://GH_HOST/settings/tokens` → **Generate new token (classic)**
2. **Note**: `VIC - coleta de indicadores`
3. **Expiration**: conforme a política institucional
4. **Escopos** — marque apenas o necessário:

| Escopo | Necessário para |
|---|---|
| `repo` | ler repositórios privados, branches, PRs, tags, releases |
| `read:org` | ler times e membros (D6) |
| `workflow` | **somente** se você for enviar arquivos em `.github/workflows/` |
| `admin:org` | **somente** se for criar rulesets ou times de organização |

5. **Generate token** → **copie agora**. O GitHub não mostra o valor de novo.

**Token fine-grained (Cloud e GHES recentes):** permite escolher repositório por
repositório e permissão por permissão. Exige que a organização tenha habilitado esse
tipo de token. Se não aparecer a opção, use o clássico.

> **No GitHub Enterprise Cloud com SAML/SSO**, depois de gerar o token clique em
> **Configure SSO** ao lado dele e **autorize** para a organização. Sem isso, toda
> chamada a repositório privado devolve **`404`** — não `403`. É a causa mais comum de
> "não encontrei o repositório" com o token certo.

### B2.2 Autenticar o `gh`

**Modo interativo (recomendado na primeira vez):**

```bash
# GitHub Enterprise Server
gh auth login --hostname "$GH_HOST"

# GitHub Enterprise Cloud
gh auth login --hostname github.com
```

Responda: `HTTPS` → `Y` (autenticar o git) → `Paste an authentication token` → cole.

**Modo não interativo (para servidor de automação):**

```bash
echo "SEU_TOKEN_AQUI" | gh auth login --hostname "$GH_HOST" --with-token
```

**Sem `gh auth login`, apenas por variável de ambiente:**

```bash
export GH_HOST="github.empresa.com.br"
export GH_ENTERPRISE_TOKEN="ghp_xxxxxxxxxxxx"   # GitHub Enterprise SERVER
# export GH_TOKEN="ghp_xxxxxxxxxxxx"            # GitHub Enterprise CLOUD
```

| Variável | Quando usar |
|---|---|
| `GH_TOKEN` | host `github.com` |
| `GH_ENTERPRISE_TOKEN` | qualquer host que **não** seja `github.com` |
| `GH_HOST` | define o host padrão dos comandos `gh` |

**Como saber que deu certo:**

```bash
gh auth status
```

Saída esperada:

```
github.empresa.com.br
  ✓ Logged in to github.empresa.com.br account c123456 (GH_ENTERPRISE_TOKEN)
  - Active account: true
  - Git operations protocol: https
  - Token scopes: 'read:org', 'repo'
```

Confirme três coisas: o **host** correto, o **usuário** correto e a presença de `repo` e
`read:org` em **Token scopes**.

**Se der errado:**

| Saída | Causa | Solução |
|---|---|---|
| `You are not logged into any GitHub hosts` | Nenhum token ativo | Rode `gh auth login --hostname "$GH_HOST"` |
| `Token scopes: ''` (vazio) | Token fine-grained (não lista escopos) ou token sem escopo | Teste na prática: `gh api "repos/$ORG/$REPO" --jq .full_name` |
| `HTTP 401: Bad credentials` | Token expirado, revogado ou colado com espaço | Gere outro. Confira: `printf '%s' "$GH_ENTERPRISE_TOKEN" \| wc -c` |
| Autenticou no host errado | `GH_HOST` errado | `export GH_HOST=...` e refaça |

---

## B3. Primeira chamada de API

**O que é.** `gh api CAMINHO` faz um `GET` no caminho indicado. Você **nunca** escreve o
domínio nem `/api/v3` — o `gh` monta isso a partir do `GH_HOST`.

```bash
gh api user --jq '.login'
```

Saída esperada: `c123456`

```bash
gh api "repos/$ORG/$REPO" --jq '{nome: .full_name, padrao: .default_branch, privado: .private, tamanho_kb: .size}'
```

Saída esperada:

```json
{"nome": "MINHA-ORG/SIGA-cadastro", "padrao": "main", "privado": true, "tamanho_kb": 4821}
```

**A chamada mais importante da D4 — as três dimensões de divergência em uma requisição:**

```bash
gh api "repos/$ORG/$REPO/compare/develop...feature/exemplo" \
  --jq '{ahead: .ahead_by, behind: .behind_by, ultimo_sync: .merge_base_commit.commit.committer.date}'
```

Saída esperada:

```json
{"ahead": 7, "behind": 23, "ultimo_sync": "2026-05-14T09:31:02Z"}
```

Leitura desses números, conforme a D4:

| Campo | O que mede | Como corrigir |
|---|---|---|
| `ahead` | commits na branch temporária **ainda não integrados** — tamanho do lote | integrar antes ou fracionar a entrega |
| `behind` | commits da linha principal **ainda não incorporados** — risco de conflito | sincronizar a branch |
| `ultimo_sync` | data do **merge-base**: quando a branch incorporou a principal pela última vez | é a **base de cálculo obrigatória** da antiguidade |

> **Ordem dos três pontos.** `compare/BASE...HEAD`. `ahead_by` é quanto **HEAD** está à
> frente de **BASE**. Inverter a ordem inverte o significado dos dois números.

**Formas equivalentes, para quando `gh` não estiver disponível:**

```bash
# GitHub Enterprise Server — note o /api/v3
curl -sS -H "Authorization: Bearer $GH_ENTERPRISE_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     "https://$GH_HOST/api/v3/repos/$ORG/$REPO" | jq '.full_name'

# GitHub Enterprise Cloud
curl -sS -H "Authorization: Bearer $GH_TOKEN" \
     -H "Accept: application/vnd.github+json" \
     "https://api.github.com/repos/$ORG/$REPO" | jq '.full_name'
```

**Ver o cabeçalho HTTP completo (útil para depurar rate limit):**

```bash
gh api -i "repos/$ORG/$REPO" 2>&1 | head -20
```

Saída esperada:

```
HTTP/2.0 200 OK
X-Ratelimit-Limit: 5000
X-Ratelimit-Remaining: 4993
X-Ratelimit-Reset: 1780000000
```

---

## B4. Token pessoal × GitHub App (rate limit)

### B4.1 O problema

O GitHub limita quantas requisições você faz por hora. **Ultrapassar o limite não é um
aviso: as chamadas passam a falhar** e a coleta fica incompleta — o que corrompe o
indicador.

| Forma de autenticação | Cota | Escopo da cota |
|---|---|---|
| Sem autenticação | 60 req/h | por endereço IP |
| **PAT (clássico ou fine-grained)** | **5.000 req/h** | **por usuário** — todos os tokens da mesma pessoa dividem a mesma cota |
| **GitHub App (token de instalação)** | **5.000 req/h no mínimo**, escalando com o tamanho da organização | **por instalação** |
| `GITHUB_TOKEN` dentro do Actions | cota própria, menor | por repositório |

O ponto que decide a arquitetura: **a cota do PAT é da pessoa, não do token**. Criar dez
tokens não multiplica nada. Se a mesma pessoa roda a coleta e usa o `gh` no dia a dia,
os dois consomem o mesmo balde.

### B4.2 A conta que justifica o GitHub App

Custo aproximado da coleta completa deste guia, por repositório:

| Chamada | Quantidade |
|---|---|
| Metadados do repositório | 1 |
| Branches (paginado) | 1 a 2 |
| `compare` por branch temporária | 1 por branch (≈ 8) |
| Tags + releases | 2 |
| Rulesets / proteção | 2 |
| PRs concluídos no período | 1 |
| Detalhe do PR + revisões (para `merged_by`) | 2 por PR (≈ 20) |
| Árvore de arquivos (D12) | 1 |
| Commits para verificar assinatura | 1 a 2 |
| **Total por repositório** | **≈ 38** |

| Repositórios | Requisições | Cabe em 5.000/h? |
|---|---|---|
| 50 | ≈ 1.900 | Sim |
| 130 | ≈ 4.940 | No limite |
| 300 | ≈ 11.400 | **Não** |
| 800 | ≈ 30.400 | **Não** |

**Conclusão: acima de aproximadamente 120 repositórios, o PAT não sustenta a coleta.**
Use GitHub App.

Três razões adicionais, além da cota:

1. **Identidade institucional.** O App não é uma pessoa. Quando o servidor de indicadores
   for auditado, a origem das chamadas é a aplicação — não a conta de alguém que pode
   sair da instituição amanhã.
2. **Permissão mínima.** O App recebe apenas leitura de conteúdo, PRs e administração.
   Um PAT com escopo `repo` dá **escrita** em tudo a que a pessoa tem acesso.
3. **Cota por instalação.** Um mesmo App instalado em cinco organizações tem **cinco**
   cotas independentes.

### B4.3 Criar e usar um GitHub App

`[ADMIN-ORG]` para instalar

1. `https://GH_HOST/organizations/ORG/settings/apps/new`
2. **GitHub App name**: `VIC Indicadores`
3. **Homepage URL**: a URL do painel (qualquer URL válida serve)
4. Desmarque **Webhook → Active** (esta coleta é por API, não por webhook)
5. **Repository permissions** — todas em **Read-only**:

| Permissão | Para qual indicador |
|---|---|
| Metadata | obrigatória (base) |
| Contents | D3, D4, D5, D12 (branches, commits, árvore) |
| Pull requests | D8 (aprovações e `merged_by`) |
| Administration | D7 (ler proteção e rulesets) |
| Checks / Commit statuses | D1 (resultado da pipeline) |
| Actions | D11, D12 (execuções dos workflows) |

6. **Organization permissions**: **Members → Read-only** (D6)
7. **Where can this GitHub App be installed?** → *Only on this account*
8. **Create GitHub App**
9. Anote o **App ID**; em **Private keys** clique em **Generate a private key** — baixa
   um arquivo `.pem`. **Guarde-o como segredo.**
10. **Install App** → escolha *All repositories* ou selecione os repositórios

**Obter um token de instalação.** O `gh` não faz isto sozinho: é preciso assinar um JWT
com a chave privada e trocá-lo por um token. O script abaixo faz os dois passos.

```bash
pip install --user pyjwt cryptography requests
```

```python
#!/usr/bin/env python3
"""Gera um token de instalação de GitHub App (validade: 1 hora).

Uso:
    export VIC_APP_ID=123456
    export VIC_APP_KEY=/caminho/vic-indicadores.private-key.pem
    export VIC_API=https://github.empresa.com.br/api/v3   # Cloud: https://api.github.com
    export GH_TOKEN="$(python3 token_app.py)"
"""
import os, sys, time, jwt, requests

APP_ID   = os.environ["VIC_APP_ID"]
KEY_PATH = os.environ["VIC_APP_KEY"]
API      = os.environ.get("VIC_API", "https://api.github.com").rstrip("/")

with open(KEY_PATH, "rb") as fh:
    chave = fh.read()

agora = int(time.time())
# O JWT identifica a APLICAÇÃO. Validade máxima de 10 minutos.
# 'iat' recuado em 60s absorve diferença de relógio entre a sua máquina e o servidor.
token_jwt = jwt.encode(
    {"iat": agora - 60, "exp": agora + 540, "iss": APP_ID},
    chave, algorithm="RS256",
)
cab = {"Authorization": f"Bearer {token_jwt}", "Accept": "application/vnd.github+json"}

# 1) Descobrir as instalações do App
r = requests.get(f"{API}/app/installations", headers=cab, timeout=30)
r.raise_for_status()
insts = r.json()
if not insts:
    sys.exit("ERRO: o App não está instalado em nenhuma organização.")

# 2) Trocar o JWT por um token de INSTALAÇÃO (é este que lê os repositórios)
inst_id = insts[0]["id"]
r = requests.post(f"{API}/app/installations/{inst_id}/access_tokens", headers=cab, timeout=30)
r.raise_for_status()
print(r.json()["token"])
```

Usar o token gerado com o `gh`:

```bash
export GH_ENTERPRISE_TOKEN="$(python3 token_app.py)"   # Cloud: GH_TOKEN
gh api "repos/$ORG/$REPO" --jq '.full_name'
```

> **O token de instalação expira em 1 hora.** Gere um novo a cada execução da coleta, e
> não guarde o valor em arquivo. O que se guarda é a chave `.pem`.

### B4.4 Monitorar e respeitar a cota

```bash
gh api rate_limit --jq '.resources.core | {limite: .limit, restante: .remaining, reset_em: (.reset | todate)}'
```

Saída esperada:

```json
{"limite": 5000, "restante": 4832, "reset_em": "2026-08-02T15:00:00Z"}
```

> A chamada a `/rate_limit` **não consome** cota. Use-a à vontade.

**No GitHub Enterprise Server**, o limite pode estar **desligado** pelo `[SITE-ADMIN]`.
Nesse caso a resposta traz números artificialmente altos, ou o endpoint devolve `404`.
Trate os dois casos como "sem limite" — o script de B8 já faz isso.

**Quatro formas de gastar menos requisições:**

1. **`per_page=100`** em tudo. Sem isso, o padrão é 30 e você gasta mais de três vezes o
   necessário só em paginação.
2. **Requisição condicional.** Guarde o cabeçalho `ETag` e reenvie em
   `If-None-Match`. Uma resposta **`304 Not Modified` não conta na cota**.
3. **GraphQL** para dados de PR: uma consulta traz PR, revisões e `mergedBy` juntos,
   onde o REST precisa de três chamadas.
4. **Recorte temporal.** Colete PRs dos últimos 30 dias, não do histórico inteiro.

**Se estourar:**

```
HTTP 403: API rate limit exceeded for user ID 1234567.
```

Confirme com `gh api -i ... 2>&1 | grep -i ratelimit`. Se `X-Ratelimit-Remaining: 0`,
espere até `X-Ratelimit-Reset` (é um *epoch* em segundos: `date -d @1780000000`).
**Não crie outro token para contornar** — a cota é da pessoa, não do token.

Existe também um **limite secundário**, que dispara com rajadas mesmo dentro da cota. Ele
devolve `403` com o cabeçalho `Retry-After`. A resposta correta é serializar as chamadas
e aguardar o tempo indicado.

---

## B5. Paginação

**O que é.** A API nunca devolve tudo de uma vez. O padrão é **30 itens**; o máximo é
**100**. Um repositório com 250 branches precisa de 3 requisições.

**O erro que produz indicador errado:** ler só a primeira página e concluir que o
repositório tem 30 branches. O indicador fica silenciosamente incorreto.

**Com o `gh` — ele resolve sozinho:**

```bash
gh api "repos/$ORG/$REPO/branches?per_page=100" --paginate --jq '.[].name'
```

Saída esperada (uma branch por linha):

```
develop
feature/exportacao-csv
feature/politica-senha
hotfix/login-sso
main
release/2.4.1
```

Contar:

```bash
gh api "repos/$ORG/$REPO/branches?per_page=100" --paginate --jq '.[].name' | wc -l
```

**A pegadinha do `--paginate` com `--jq`.** O `--paginate` devolve **um array por
página**, não um array único. Portanto:

```bash
# ERRADO — 'length' é aplicado a CADA página, e você vê "100 100 43"
gh api "repos/$ORG/$REPO/branches?per_page=100" --paginate --jq 'length'

# CERTO — explode cada página em elementos e conta as linhas
gh api "repos/$ORG/$REPO/branches?per_page=100" --paginate --jq '.[].name' | wc -l

# CERTO — junta tudo em um array só com jq -s ("slurp")
gh api "repos/$ORG/$REPO/branches?per_page=100" --paginate --jq '.[]' | jq -s 'length'
```

> Versões recentes do `gh` têm a opção `--slurp`, que junta as páginas em um array único.
> Confirme com `gh api --help | grep -i slurp`. Se não existir na sua versão, use
> `| jq -s` como acima.

**Com `curl` — paginação manual pelo cabeçalho `Link`:**

```bash
curl -sSI -H "Authorization: Bearer $GH_ENTERPRISE_TOKEN" \
  "https://$GH_HOST/api/v3/repos/$ORG/$REPO/branches?per_page=100" | grep -i '^link:'
```

Saída esperada:

```
link: <https://.../branches?per_page=100&page=2>; rel="next", <https://.../branches?per_page=100&page=3>; rel="last"
```

Siga o `rel="next"` até o cabeçalho `Link` não trazer mais `next`. **Não** monte a
próxima URL somando `+1` na mão: alguns endpoints usam cursor em vez de número de página.

**Limites que a paginação não resolve:**

| Endpoint | Limite |
|---|---|
| Busca (`/search/*`) | máximo de **1.000 resultados**, independente da paginação |
| `git/trees?recursive=1` | trunca acima de ~100.000 entradas ou ~7 MB — **confira o campo `truncated`** |
| Busca (`/search/*`) | cota própria de **30 requisições por minuto** |

---

## B6. Filtrar a resposta com `--jq`

**O que é.** `--jq` aplica uma expressão `jq` à resposta **dentro do `gh`**, sem precisar
do `jq` instalado. Sem ele, você recebe centenas de linhas de JSON por chamada.

```bash
# Sem filtro: dezenas de campos que você não vai usar
gh api "repos/$ORG/$REPO" | head -30

# Com filtro: só o que interessa
gh api "repos/$ORG/$REPO" --jq '.full_name'
```

**As seis construções que resolvem 95% dos casos:**

```bash
# 1. Um campo
gh api "repos/$ORG/$REPO" --jq '.default_branch'
# -> main

# 2. Vários campos, renomeados em português
gh api "repos/$ORG/$REPO" --jq '{nome: .full_name, padrao: .default_branch}'
# -> {"nome":"MINHA-ORG/SIGA-cadastro","padrao":"main"}

# 3. Um campo de cada item de uma lista
gh api "repos/$ORG/$REPO/tags?per_page=100" --paginate --jq '.[].name'

# 4. Filtrar itens por condição (só as branches temporárias)
gh api "repos/$ORG/$REPO/branches?per_page=100" --paginate \
  --jq '.[] | select(.name | test("^(feature|release|hotfix)/")) | .name'

# 5. Contar o que casa com a condição (tags fora do Padrão VEC)
gh api "repos/$ORG/$REPO/tags?per_page=100" --paginate \
  --jq '.[] | select(.name | test("^v?[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+$") | not) | .name' | wc -l

# 6. Gerar CSV para planilha ou banco (-r remove as aspas)
gh api "repos/$ORG/$REPO/branches?per_page=100" --paginate \
  --jq -r '.[] | [.name, .commit.sha[0:7], (.protected|tostring)] | @csv'
# -> "develop","a1b2c3d","true"
```

**Cuidado com o escape da barra invertida.** Dentro de aspas simples no shell, a expressão
regular do `jq` precisa de barra dupla: `test("^[0-9]+\\.[0-9]+$")`. Com barra simples o
`jq` devolve `Invalid escape`.

**Montar uma linha completa de indicador:**

```bash
gh api "repos/$ORG/$REPO/compare/develop...feature/exportacao-csv" --jq -r \
  '[.ahead_by, .behind_by, .merge_base_commit.commit.committer.date, .status] | @tsv'
```

Saída esperada:

```
7	23	2026-05-14T09:31:02Z	diverged
```

---

## B7. Mapa indicador → endpoint

Todos os endpoints abaixo foram conferidos contra a especificação OpenAPI oficial do
GitHub (dotcom e GHES 3.17). Onde há ressalva, ela está escrita.

| Diretriz | Indicador | Endpoint | Campo a ler |
|---|---|---|---|
| **D1** | Versões de produção com pipeline aprovada | `GET /repos/{o}/{r}/commits/{sha}/check-runs` | `check_runs[].conclusion == "success"` |
| **D1** | Checks obrigatórios configurados | `GET /repos/{o}/{r}/rules/branches/main` | regra `required_status_checks` |
| **D2** | `main` e `develop` presentes | `GET /repos/{o}/{r}/branches` | `[].name` |
| **D2** | Branches permanentes protegidas | `GET /repos/{o}/{r}/branches` | `[].protected` |
| **D3** | Auto-delete ligado | `GET /repos/{o}/{r}` | `delete_branch_on_merge` |
| **D3** | Branches temporárias vivas | `GET /repos/{o}/{r}/branches` | contar `feature/`, `release/`, `hotfix/` |
| **D3** | Branches já integradas e não apagadas | `GET /repos/{o}/{r}/compare/develop...{branch}` | `ahead_by == 0` (nada a integrar) |
| **D4** | Volume represado (`ahead`) | `GET /repos/{o}/{r}/compare/{base}...{head}` | `ahead_by` |
| **D4** | Risco de conflito (`behind`) | idem | `behind_by` |
| **D4** | **Antiguidade da divergência** | idem | `merge_base_commit.commit.committer.date` |
| **D5** | Merge back pendente | `GET /repos/{o}/{r}/compare/develop...main` | `ahead_by > 0` significa pendência |
| **D6** | Time de Integradores no repositório | `GET /repos/{o}/{r}/teams` | `[].slug` |
| **D6** | Composição do time | `GET /orgs/{org}/teams/{slug}/members` | `[].login` |
| **D6** | CODEOWNERS válido | `GET /repos/{o}/{r}/codeowners/errors` | `errors == []` |
| **D7** | Regras em vigor na branch | `GET /repos/{o}/{r}/rules/branches/{branch}` | `[].type` — soma **todos** os rulesets |
| **D7** | Proteção clássica | `GET /repos/{o}/{r}/branches/{b}/protection` | `404` = sem proteção |
| **D7** | Rulesets do repositório | `GET /repos/{o}/{r}/rulesets` | `[].name`, `[].enforcement` |
| **D8** | PRs concluídos no período | `GET /repos/{o}/{r}/pulls?state=closed&base=main` | `merged_at != null` |
| **D8** | **Quem concluiu** (completude) | `GET /repos/{o}/{r}/pulls/{n}` | `merged_by.login` — **só no detalhe** |
| **D8** | Quem aprovou | `GET /repos/{o}/{r}/pulls/{n}/reviews` | `[] \| select(.state=="APPROVED") \| .user.login` |
| **D9** | Tags em SemVer | `GET /repos/{o}/{r}/tags` | `[].name` contra `^v?\d+\.\d+\.\d+$` |
| **D10** | Tags no Padrão VEC | idem | `[].name` contra `^v?\d+\.\d+\.\d+\.\d+$` |
| **D10** | Ruleset de tag ativo | `GET /repos/{o}/{r}/rulesets` | `target == "tag"` |
| **D11** | Nome do repositório | `GET /orgs/{org}/repos` | `[].name` contra `^[A-Z][A-Z0-9]{1,9}-[a-z0-9]+(-[a-z0-9]+)*$` |
| **D11** | Nome das branches | `GET /repos/{o}/{r}/branches` | prefixos permitidos |
| **D12** | Formato e tamanho dos arquivos | `GET /repos/{o}/{r}/git/trees/{sha}?recursive=1` | `tree[].path`, `tree[].size` |
| **D12** | Autoria assinada | `GET /repos/{o}/{r}/commits` | `[].commit.verification.verified` |
| **D13** | Nota de versão publicada | `GET /repos/{o}/{r}/releases` | `body` não vazio e `draft == false` |

**Quatro armadilhas deste mapa — leia antes de escrever o script:**

1. **`merged_by` não existe na listagem de PRs.** `GET /pulls` devolve um objeto reduzido
   (sem `merged_by`, sem `mergeable`). Para saber **quem concluiu** o PR — que é o
   indicador central da D8 — é obrigatório chamar `GET /pulls/{numero}` para cada PR.
   É o item mais caro da coleta em requisições; limite o período.
2. **`git/trees?recursive=1` trunca.** Sempre leia o campo `truncated`. Se vier `true`,
   o resultado da D12 está incompleto e o repositório precisa ser avaliado por clone.
3. **`/rules/branches/{branch}` soma todos os rulesets**, do repositório e da organização.
   É a leitura correta de "o que está valendo agora". `GET /rulesets` só lista os do
   repositório.
4. **`/branches/{b}/protection` devolve `404` quando não há proteção clássica.** Isso é
   resposta esperada, não erro. Um repositório protegido só por ruleset devolve `404`
   aqui e **está protegido** — leia sempre `/rules/branches/{branch}` também.

---

## B8. Script de coleta comentado

Salve como `coleta-vic.sh` e dê permissão de execução (`chmod +x coleta-vic.sh`).

```bash
#!/usr/bin/env bash
# =============================================================================
#  coleta-vic.sh — Coleta dos indicadores do Modelo VIC (Diretrizes 1 a 13)
#
#  Uso:
#     export GH_HOST="github.empresa.com.br"
#     export GH_ENTERPRISE_TOKEN="ghp_..."        # em Cloud: GH_TOKEN
#     ./coleta-vic.sh MINHA-ORG [diretorio-de-saida]
#
#  Saída: um arquivo NDJSON (um objeto JSON por repositório, um por linha),
#         pronto para carga em banco ou leitura por painel.
# =============================================================================
set -euo pipefail

ORG="${1:?uso: ./coleta-vic.sh ORGANIZACAO [diretorio-de-saida]}"
DIR_SAIDA="${2:-./coleta-$(date +%Y%m%d-%H%M)}"
mkdir -p "$DIR_SAIDA"
ARQUIVO="$DIR_SAIDA/indicadores.ndjson"
: > "$ARQUIVO"

# ---------------------------------------------------------------------------
# PARÂMETROS INSTITUCIONAIS
# Ajuste conforme a faixa de maturidade VIGENTE definida pela governança técnica.
# A tabela abaixo reflete a FAIXA 3 (Definido) — meta institucional da Diretriz 4.
# ---------------------------------------------------------------------------
LIMITE_FEATURE_DIAS_SYNC=5      # dias desde o último merge-base
LIMITE_FEATURE_AHEAD=25         # commits represados
LIMITE_FEATURE_VIDA=15          # dias de vida total
LIMITE_RELEASE_VIDA=10          # dias (Diretriz 4)
LIMITE_HOTFIX_VIDA=3            # dias (Diretriz 4)
LIMITE_ARQUIVO_BYTES=$((10 * 1024 * 1024))   # 10 MB (Diretriz 12)
EXT_PROIBIDAS='zip|rar|jar|ear|jpg|jpeg|bmp|pdf|docx|xlsx'   # (Diretriz 12)
DIAS_JANELA_PR=30               # período de análise dos PRs (Diretriz 8)
PADRAO_REPO='^[A-Z][A-Z0-9]{1,9}-[a-z0-9]+(-[a-z0-9]+)*$'                    # (Diretriz 11)
PADRAO_BRANCH='^(feature|release|hotfix)/'                   # (Diretriz 11)
PADRAO_SEMVER='^v?[0-9]+\.[0-9]+\.[0-9]+$'                   # (Diretriz 9)
PADRAO_VEC='^v?[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'              # (Diretriz 10)

# ---------------------------------------------------------------------------
# FUNÇÕES AUXILIARES
# ---------------------------------------------------------------------------

# api CAMINHO [args...] — chamada à API tolerante a 404.
# Muitos endpoints devolvem 404 como resposta LEGÍTIMA (ex.: branch sem proteção
# clássica). Aqui isso vira string vazia em vez de abortar o script.
api() {
  gh api -H "Accept: application/vnd.github+json" "$@" 2>/dev/null || true
}

# aguardar_cota — pausa a coleta quando a cota está acabando.
# Em GHES com rate limit desligado, /rate_limit devolve vazio ou 404: o
# fallback 9999 faz o script seguir sem pausa.
aguardar_cota() {
  local restante reset agora espera
  restante=$(api rate_limit --jq '.resources.core.remaining' || echo 9999)
  [ -z "$restante" ] && restante=9999
  if [ "$restante" -lt 150 ]; then
    reset=$(api rate_limit --jq '.resources.core.reset' || echo 0)
    agora=$(date +%s)
    espera=$(( reset - agora + 5 ))
    [ "$espera" -lt 0 ] && espera=60
    echo "  [cota] restam $restante requisições. Aguardando ${espera}s até o reset..." >&2
    sleep "$espera"
  fi
}

# dias_desde DATA_ISO — diferença em dias inteiros entre agora e a data informada.
# A primeira forma é GNU (Linux); a segunda é BSD (macOS).
dias_desde() {
  local data="$1" ts
  [ -z "$data" ] && { echo 9999; return; }
  ts=$(date -u -d "$data" +%s 2>/dev/null || date -u -j -f "%Y-%m-%dT%H:%M:%SZ" "$data" +%s 2>/dev/null || echo 0)
  [ "$ts" -eq 0 ] && { echo 9999; return; }
  echo $(( ( $(date -u +%s) - ts ) / 86400 ))
}

# ---------------------------------------------------------------------------
# 0. LISTAR OS REPOSITÓRIOS ATIVOS DA ORGANIZAÇÃO
#    Arquivados são excluídos: não estão em desenvolvimento e distorceriam a média.
# ---------------------------------------------------------------------------
echo "Listando repositórios de $ORG ..." >&2
mapfile -t REPOS < <(
  api "orgs/$ORG/repos?per_page=100&type=all" --paginate \
      --jq '.[] | select(.archived | not) | select(.disabled | not) | .name'
)
echo "Encontrados ${#REPOS[@]} repositórios ativos." >&2

# ---------------------------------------------------------------------------
# LAÇO PRINCIPAL — um bloco por diretriz
# ---------------------------------------------------------------------------
for REPO in "${REPOS[@]}"; do
  aguardar_cota
  echo "[$REPO]" >&2

  # === D11 · nome do repositório ==========================================
  if [[ "$REPO" =~ $PADRAO_REPO ]]; then D11_NOME=true; else D11_NOME=false; fi

  # === Metadados e D3 (auto-delete) =======================================
  META=$(api "repos/$ORG/$REPO" --jq \
    '{padrao: .default_branch, auto_delete: .delete_branch_on_merge, privado: .private}')
  BRANCH_PADRAO=$(echo "$META" | jq -r '.padrao // "main"')
  D3_AUTO_DELETE=$(echo "$META" | jq -r '.auto_delete // false')

  # === D2 · branches permanentes ==========================================
  BRANCHES=$(api "repos/$ORG/$REPO/branches?per_page=100" --paginate --jq '.[].name')
  TEM_MAIN=$(echo "$BRANCHES"    | grep -qx 'main'    && echo true || echo false)
  TEM_DEVELOP=$(echo "$BRANCHES" | grep -qx 'develop' && echo true || echo false)
  # Base de comparação das features: develop quando existe; senão, a branch padrão.
  if [ "$TEM_DEVELOP" = true ]; then BASE_FEATURE="develop"; else BASE_FEATURE="$BRANCH_PADRAO"; fi

  # === D7 · regras em vigor (soma repositório + organização) ==============
  REGRAS_MAIN=$(api "repos/$ORG/$REPO/rules/branches/main" --jq '[.[].type] | unique')
  [ -z "$REGRAS_MAIN" ] && REGRAS_MAIN='[]'
  REGRAS_DEV=$(api "repos/$ORG/$REPO/rules/branches/develop" --jq '[.[].type] | unique')
  [ -z "$REGRAS_DEV" ] && REGRAS_DEV='[]'
  # Proteção clássica: 404 aqui NÃO significa desprotegido — pode haver ruleset.
  PROT_CLASSICA=$(api "repos/$ORG/$REPO/branches/main/protection" --jq '.enforce_admins.enabled')
  [ -z "$PROT_CLASSICA" ] && PROT_CLASSICA=false

  # === D11 + D3 + D4 · branches temporárias ===============================
  TEMPORARIAS=$(echo "$BRANCHES" | grep -E "$PADRAO_BRANCH" || true)
  FORA_PADRAO=$(echo "$BRANCHES" | grep -vE "$PADRAO_BRANCH|^(main|develop)$" || true)
  DIVERGENCIA='[]'

  while IFS= read -r BR; do
    [ -z "$BR" ] && continue
    aguardar_cota

    # Cada tipo de branch tem base e limites próprios (Diretriz 4).
    case "$BR" in
      release/*|hotfix/*) BASE="main"          ;;   # behind não se aplica
      *)                  BASE="$BASE_FEATURE" ;;
    esac

    CMP=$(api "repos/$ORG/$REPO/compare/$BASE...$BR" \
      --jq '{ahead: .ahead_by, behind: .behind_by, base_date: .merge_base_commit.commit.committer.date}')
    [ -z "$CMP" ] && continue

    AHEAD=$(echo "$CMP"  | jq -r '.ahead  // 0')
    BEHIND=$(echo "$CMP" | jq -r '.behind // 0')
    DT_BASE=$(echo "$CMP" | jq -r '.base_date // empty')

    # BASE DE CÁLCULO OBRIGATÓRIA DA D4:
    # a antiguidade vem da data do MERGE-BASE, nunca da data de criação da ref
    # (rebase e recriação de branch zeram a data de criação e mascaram o indicador).
    DIAS_SYNC=$(dias_desde "$DT_BASE")

    # Data do último commit da branch — usada para estimar a vida da branch.
    DT_TOPO=$(api "repos/$ORG/$REPO/commits/$BR" --jq '.commit.committer.date')
    DIAS_TOPO=$(dias_desde "$DT_TOPO")

    case "$BR" in
      release/*) CONFORME=$([ "$DIAS_SYNC" -le "$LIMITE_RELEASE_VIDA" ] && echo true || echo false) ;;
      hotfix/*)  CONFORME=$([ "$DIAS_SYNC" -le "$LIMITE_HOTFIX_VIDA"  ] && echo true || echo false) ;;
      *)         CONFORME=$( { [ "$DIAS_SYNC" -le "$LIMITE_FEATURE_DIAS_SYNC" ] \
                            && [ "$AHEAD"     -le "$LIMITE_FEATURE_AHEAD" ]; } && echo true || echo false) ;;
    esac

    DIVERGENCIA=$(echo "$DIVERGENCIA" | jq \
      --arg br "$BR" --arg base "$BASE" --arg dt "$DT_BASE" \
      --argjson a "$AHEAD" --argjson b "$BEHIND" \
      --argjson ds "$DIAS_SYNC" --argjson dt2 "$DIAS_TOPO" --argjson ok "$CONFORME" \
      '. + [{branch:$br, base:$base, ahead:$a, behind:$b,
             ultimo_sync:$dt, dias_desde_sync:$ds, dias_sem_commit:$dt2, conforme:$ok}]')
  done <<< "$TEMPORARIAS"

  # === D5 · merge back pendente ===========================================
  if [ "$TEM_DEVELOP" = true ] && [ "$TEM_MAIN" = true ]; then
    D5_PENDENTE=$(api "repos/$ORG/$REPO/compare/develop...main" --jq '.ahead_by')
    [ -z "$D5_PENDENTE" ] && D5_PENDENTE=0
  else
    D5_PENDENTE=0
  fi

  # === D6 · Integradores ==================================================
  TIMES=$(api "repos/$ORG/$REPO/teams" --paginate --jq '[.[].slug]')
  [ -z "$TIMES" ] && TIMES='[]'
  CODEOWNERS_ERROS=$(api "repos/$ORG/$REPO/codeowners/errors" --jq '.errors | length')
  [ -z "$CODEOWNERS_ERROS" ] && CODEOWNERS_ERROS=-1   # -1 = arquivo ausente

  # === D8 · aprovação × completude ========================================
  # ATENÇÃO: a LISTAGEM de PRs não traz merged_by. É obrigatório abrir cada PR.
  # Por isso a janela é limitada a DIAS_JANELA_PR.
  DESDE=$(date -u -d "-${DIAS_JANELA_PR} days" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null \
        || date -u -v-${DIAS_JANELA_PR}d +%Y-%m-%dT%H:%M:%SZ)
  PRS=$(api "repos/$ORG/$REPO/pulls?state=closed&per_page=100&sort=updated&direction=desc" \
        --jq --arg d "$DESDE" '[.[] | select(.merged_at != null and .merged_at > $d) | .number]')
  [ -z "$PRS" ] && PRS='[]'
  D8='[]'
  for NUM in $(echo "$PRS" | jq -r '.[]'); do
    aguardar_cota
    QUEM_CONCLUIU=$(api "repos/$ORG/$REPO/pulls/$NUM" --jq '.merged_by.login // "desconhecido"')
    APROVADORES=$(api "repos/$ORG/$REPO/pulls/$NUM/reviews" --paginate \
                  --jq '[.[] | select(.state=="APPROVED") | .user.login] | unique')
    [ -z "$APROVADORES" ] && APROVADORES='[]'
    D8=$(echo "$D8" | jq --argjson n "$NUM" --arg m "$QUEM_CONCLUIU" --argjson a "$APROVADORES" \
      '. + [{pr:$n, concluido_por:$m, aprovado_por:$a, qtd_aprovacoes:($a|length)}]')
  done

  # === D9 e D10 · tags ====================================================
  TAGS=$(api "repos/$ORG/$REPO/tags?per_page=100" --paginate --jq '.[].name')
  N_TAGS=$(echo "$TAGS"     | grep -c . || true)
  N_VEC=$(echo "$TAGS"      | grep -cE "$PADRAO_VEC" || true)
  N_SEMVER=$(echo "$TAGS"   | grep -cE "$PADRAO_SEMVER" || true)
  TEM_RULESET_TAG=$(api "repos/$ORG/$REPO/rulesets" --jq 'any(.target == "tag")')
  [ -z "$TEM_RULESET_TAG" ] && TEM_RULESET_TAG=false

  # === D13 · notas de versão ==============================================
  RELEASES=$(api "repos/$ORG/$REPO/releases?per_page=100" --paginate \
    --jq '[.[] | {tag: .tag_name, com_nota: (((.body // "") | length) > 0), rascunho: .draft}]')
  [ -z "$RELEASES" ] && RELEASES='[]'
  N_RELEASES=$(echo "$RELEASES" | jq 'length')
  N_REL_OK=$(echo "$RELEASES"   | jq '[.[] | select(.com_nota and (.rascunho | not))] | length')

  # === D12 · formato, tamanho e assinatura ================================
  # A árvore recursiva devolve o tamanho de cada blob SEM clonar o repositório.
  SHA_TOPO=$(api "repos/$ORG/$REPO/commits/$BRANCH_PADRAO" --jq '.commit.tree.sha')
  if [ -n "$SHA_TOPO" ]; then
    ARVORE=$(api "repos/$ORG/$REPO/git/trees/$SHA_TOPO?recursive=1")
    # ATENÇÃO: se 'truncated' for true, a árvore veio incompleta e o resultado
    # da D12 é PARCIAL. O repositório deve ser reavaliado por clone.
    TRUNCADA=$(echo "$ARVORE" | jq -r '.truncated // false')
    GRANDES=$(echo "$ARVORE" | jq --argjson lim "$LIMITE_ARQUIVO_BYTES" \
      '[.tree[]? | select(.type == "blob" and (.size // 0) > $lim) | {path, size}]')
    BINARIOS=$(echo "$ARVORE" | jq --arg ext "$EXT_PROIBIDAS" \
      '[.tree[]? | select(.type == "blob") | select(.path | ascii_downcase | test("\\.(" + $ext + ")$")) | .path]')
  else
    TRUNCADA=true; GRANDES='[]'; BINARIOS='[]'
  fi

  N_NAO_ASSINADOS=$(api "repos/$ORG/$REPO/commits?sha=$BRANCH_PADRAO&per_page=100" \
    --jq '[.[] | select(.commit.verification.verified != true)] | length')
  [ -z "$N_NAO_ASSINADOS" ] && N_NAO_ASSINADOS=-1
  EXIGE_ASSINATURA=$(echo "$REGRAS_MAIN" | jq 'index("required_signatures") != null')

  # === MONTAGEM DA LINHA ==================================================
  jq -n -c \
    --arg org "$ORG" --arg repo "$REPO" --arg coleta "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --argjson d11_nome "$D11_NOME" \
    --argjson d2_main "$TEM_MAIN" --argjson d2_develop "$TEM_DEVELOP" \
    --argjson d3_auto "$D3_AUTO_DELETE" \
    --argjson d3_temp "$(echo "$TEMPORARIAS" | grep -c . || true)" \
    --argjson d11_fora "$(echo "$FORA_PADRAO" | grep -c . || true)" \
    --argjson d4 "$DIVERGENCIA" \
    --argjson d5 "$D5_PENDENTE" \
    --argjson d6_times "$TIMES" --argjson d6_co "$CODEOWNERS_ERROS" \
    --argjson d7_main "$REGRAS_MAIN" --argjson d7_dev "$REGRAS_DEV" \
    --argjson d7_class "$PROT_CLASSICA" \
    --argjson d8 "$D8" \
    --argjson d9 "$N_SEMVER" --argjson d10 "$N_VEC" --argjson tags "$N_TAGS" \
    --argjson d10_rs "$TEM_RULESET_TAG" \
    --argjson d12_grandes "$GRANDES" --argjson d12_bin "$BINARIOS" \
    --argjson d12_trunc "$TRUNCADA" --argjson d12_ns "$N_NAO_ASSINADOS" \
    --argjson d12_exige "$EXIGE_ASSINATURA" \
    --argjson d13_total "$N_RELEASES" --argjson d13_ok "$N_REL_OK" \
    '{
       org: $org, repositorio: $repo, coletado_em: $coleta,
       d11: { nome_conforme: $d11_nome, branches_fora_do_padrao: $d11_fora },
       d2:  { tem_main: $d2_main, tem_develop: $d2_develop },
       d3:  { auto_delete: $d3_auto, branches_temporarias_vivas: $d3_temp },
       d4:  { branches: $d4 },
       d5:  { commits_main_ausentes_na_develop: $d5 },
       d6:  { times_com_acesso: $d6_times, erros_codeowners: $d6_co },
       d7:  { regras_main: $d7_main, regras_develop: $d7_dev, protecao_classica_admin: $d7_class },
       d8:  { prs_concluidos: $d8 },
       d9:  { tags_total: $tags, tags_semver: $d9 },
       d10: { tags_vec: $d10, ruleset_de_tag: $d10_rs },
       d12: { arquivos_acima_do_limite: $d12_grandes, binarios_versionados: $d12_bin,
              arvore_truncada: $d12_trunc, commits_nao_assinados: $d12_ns,
              assinatura_exigida: $d12_exige },
       d13: { releases_total: $d13_total, releases_com_nota: $d13_ok }
     }' >> "$ARQUIVO"
done

echo "Coleta concluída: $ARQUIVO" >&2
echo "Repositórios processados: $(wc -l < "$ARQUIVO")" >&2
```

### Executar e conferir

```bash
export GH_HOST="github.empresa.com.br"
export GH_ENTERPRISE_TOKEN="ghp_..."
./coleta-vic.sh MINHA-ORG
```

Saída esperada no terminal:

```
Listando repositórios de MINHA-ORG ...
Encontrados 47 repositórios ativos.
[SIGA-cadastro]
[SIGA-relatorios]
...
Coleta concluída: ./coleta-20260802-1430/indicadores.ndjson
Repositórios processados: 47
```

**Conferências imediatas sobre o resultado:**

```bash
ARQ=./coleta-20260802-1430/indicadores.ndjson

# D4 — branches fora do limite de divergência, ordenadas pela pior
jq -r 'select(.d4.branches | length > 0)
       | .repositorio as $r
       | .d4.branches[] | select(.conforme | not)
       | [$r, .branch, .ahead, .behind, .dias_desde_sync] | @tsv' "$ARQ" \
| sort -k5 -rn | head -20

# D8 — PRs concluídos por quem NÃO está no time de Integradores
jq -r --arg time "integradores-siga" \
   '.repositorio as $r | .d8.prs_concluidos[]
    | [$r, .pr, .concluido_por, .qtd_aprovacoes] | @tsv' "$ARQ"

# D7 — repositórios sem exigência de Pull Request na main
jq -r 'select(.d7.regras_main | index("pull_request") | not) | .repositorio' "$ARQ"

# D12 — binários versionados
jq -r 'select(.d12.binarios_versionados | length > 0)
       | [.repositorio, (.d12.binarios_versionados | length)] | @tsv' "$ARQ"

# D12 — repositórios cuja árvore veio TRUNCADA (resultado parcial, requer clone)
jq -r 'select(.d12.arvore_truncada) | .repositorio' "$ARQ"

# D10 — tags fora do Padrão VEC
jq -r 'select(.d10.tags_vec < .d9.tags_total)
       | [.repositorio, .d10.tags_vec, .d9.tags_total] | @tsv' "$ARQ"

# D13 — releases sem nota de versão
jq -r 'select(.d13.releases_total > .d13.releases_com_nota)
       | [.repositorio, .d13.releases_com_nota, .d13.releases_total] | @tsv' "$ARQ"
```

**Exportar para CSV (planilha ou carga em banco):**

```bash
{
  echo "repositorio,branch,base,ahead,behind,dias_desde_sync,conforme"
  jq -r '.repositorio as $r | .d4.branches[]
         | [$r, .branch, .base, .ahead, .behind, .dias_desde_sync, .conforme] | @csv' "$ARQ"
} > divergencia-d4.csv
```

> **Sobre o limite vigente da D4.** A diretriz determina que a faixa **não** seja
> arbitrada: o indicador **deve** ser coletado por **60 dias sem limiar** e o limite
> inicial **deve** ser fixado próximo ao **percentil 75** medido, com revisão trimestral
> até a faixa 3. Nos primeiros 60 dias, rode o script apenas para **medir**: ignore a
> coluna `conforme` e calcule o percentil 75 da coluna `dias_desde_sync`.

```bash
# Percentil 75 de dias_desde_sync — base para fixar o limite inicial
jq -r '.d4.branches[].dias_desde_sync' "$ARQ" | sort -n \
| awk '{v[NR]=$1} END {printf "n=%d  p50=%d  p75=%d  p90=%d\n", NR, v[int(NR*0.50)+1], v[int(NR*0.75)+1], v[int(NR*0.90)+1]}'
```

---

## B9. Erros comuns e o que fazer

| Código / mensagem | Causa mais provável | O que fazer |
|---|---|---|
| `401 Bad credentials` | Token ausente, expirado, revogado ou colado com espaço/quebra de linha | `gh auth status`. Confira o tamanho: `printf '%s' "$GH_ENTERPRISE_TOKEN" \| wc -c`. Gere outro se preciso |
| `401` só em GHES | Você exportou `GH_TOKEN` em vez de `GH_ENTERPRISE_TOKEN` | Em host diferente de `github.com`, a variável é `GH_ENTERPRISE_TOKEN` |
| **`404 Not Found` em repositório que existe** | **Quase sempre é permissão, não ausência.** O GitHub devolve `404` em vez de `403` para não revelar a existência de recursos privados | 1) Token sem escopo `repo`; 2) no Cloud, PAT sem **autorização SSO** — clique em *Configure SSO*; 3) você não é membro da organização; 4) `GH_HOST` errado |
| `404` em `/branches/{b}/protection` | **Resposta legítima**: a branch não tem proteção clássica | Consulte também `/rules/branches/{b}` — pode haver ruleset ativo |
| `404` em `/rulesets` | Versão do GHES sem suporte a rulesets | Use proteção de branch clássica ([A5.2](#a52-caminho-alternativo-proteção-de-branch-clássica)) |
| `403 Resource not accessible by integration` | O **GitHub App** não tem a permissão exigida por aquele endpoint | Ajuste as permissões do App e **aceite a solicitação na organização** — permissão nova exige reaprovação |
| `403 ... rate limit exceeded` | Cota esgotada | `gh api rate_limit`. Espere o `reset`. Não crie outro token: a cota é da pessoa |
| `403` com `Retry-After` | Limite **secundário** (rajada de chamadas) | Aguarde os segundos indicados e serialize as requisições |
| `403 Must have admin rights` | Você tem escrita, não administração | Ver [A0](#a0-descobrir-o-ambiente-e-o-seu-papel). Solicite `Admin` |
| `422 Validation Failed` ao criar ruleset | Parâmetro obrigatório ausente (típico: os 5 de `pull_request`) ou `-f` no lugar de `-F` | Leia `.errors[].message` na resposta. Confira `cat` no arquivo JSON antes de enviar |
| `422 Reference already exists` | A branch ou tag já existe | Não é erro; siga adiante |
| `409 Conflict` no merge | O PR tem conflito com a base | Sincronize a branch e resolva |
| `GH013 Repository rule violations` no push | **O controle funcionou** | Leia a linha `remote:` — ela nomeia a regra violada |
| `Expected — Waiting for status to be reported` | Check obrigatório com nome errado, ou workflow que não dispara | Ver [A9](#a9-tornar-os-checks-obrigatórios--d1-e-d7) |
| `certificate signed by unknown authority` | Proxy corporativo com inspeção TLS | `export SSL_CERT_FILE=/caminho/ca-empresa.pem`. **Nunca** desative a verificação TLS |
| `jq: error: Invalid escape` | Barra invertida simples na regex dentro do `--jq` | Use barra dupla: `test("^[0-9]+\\.[0-9]+$")` |
| Contagem menor que o esperado | Faltou paginar | Acrescente `?per_page=100` e `--paginate` — ver [B5](#b5-paginação) |
| `length` devolve vários números | `--paginate` devolve um array **por página** | Use `--jq '.[]' \| jq -s 'length'` |

**Como ler o erro completo, com corpo e cabeçalhos:**

```bash
gh api -i "repos/$ORG/$REPO/rulesets" 2>&1 | head -30
```

**Como ver a explicação detalhada de um `422`:**

```bash
gh api --method POST "repos/$ORG/$REPO/rulesets" --input /tmp/arquivo.json 2>&1 \
| jq '{mensagem: .message, erros: .errors}'
```

---

## B10. Agendar a coleta

### Opção 1 — GitHub Actions (não exige servidor)

```yaml
# .github/workflows/vic-coleta.yml — em um repositório de governança, não no repo medido
name: VIC · Coleta de indicadores

on:
  schedule:
    - cron: '0 6 * * 1-5'    # 06:00 UTC, de segunda a sexta (03:00 em Brasília)
  workflow_dispatch:

jobs:
  coletar:
    runs-on: ubuntu-latest      # em GHES: self-hosted
    steps:
      - uses: actions/checkout@v4

      - name: Coletar
        env:
          # Um PAT guardado como segredo do repositório, OU o token de um GitHub App.
          GH_ENTERPRISE_TOKEN: ${{ secrets.VIC_TOKEN }}
          GH_HOST: github.empresa.com.br
        run: |
          chmod +x ./coleta-vic.sh
          ./coleta-vic.sh MINHA-ORG ./saida

      - uses: actions/upload-artifact@v4
        with:
          name: indicadores-vic
          path: ./saida/
          retention-days: 90
```

> `schedule` no GitHub Actions **não é pontual**: em horários de pico a execução atrasa,
> e às vezes é descartada. Para coleta diária isso é aceitável; para coleta horária, use
> `cron` em servidor.

### Opção 2 — `cron` em servidor

```bash
# crontab -e
0 6 * * 1-5 GH_HOST=github.empresa.com.br GH_ENTERPRISE_TOKEN=ghp_xxx \
  /opt/vic/coleta-vic.sh MINHA-ORG /var/lib/vic/coletas >> /var/log/vic-coleta.log 2>&1
```

Com GitHub App, gere o token na hora — ele expira em 1 hora:

```bash
0 6 * * 1-5 /opt/vic/executar.sh >> /var/log/vic-coleta.log 2>&1
```

```bash
#!/usr/bin/env bash
# /opt/vic/executar.sh
set -euo pipefail
export GH_HOST="github.empresa.com.br"
export VIC_APP_ID=123456
export VIC_APP_KEY=/opt/vic/vic-indicadores.pem
export VIC_API="https://$GH_HOST/api/v3"
export GH_ENTERPRISE_TOKEN="$(python3 /opt/vic/token_app.py)"
/opt/vic/coleta-vic.sh MINHA-ORG /var/lib/vic/coletas
```

**Retenção.** Guarde **uma linha por repositório por dia**. A série histórica é o que
permite responder "a divergência está caindo?" — que é a pergunta do modelo de maturidade,
mais importante do que a foto de hoje.

---

# Anexos

## Anexo I — Pontos que devem ser confirmados na sua versão do GHE

Os itens abaixo variam por versão, plano e configuração da instância. **Não os assuma:
confirme antes de planejar em cima deles.**

| Item | Como confirmar | Se não estiver disponível |
|---|---|---|
| Rulesets existem | `gh api "repos/$ORG/$REPO/rulesets" --jq 'length'` — número = sim, `404` = não | Use proteção de branch clássica ([A5.2](#a52-caminho-alternativo-proteção-de-branch-clássica)) |
| Modo `evaluate` | Tente criar com `"enforcement":"evaluate"`; ou veja se a opção aparece na interface | Vá direto para `active`, começando por um repositório piloto |
| **Push rulesets** (`target: "push"`, com `max_file_size` e `file_extension_restriction`) | `gh api --method POST ... --input /tmp/vic-ruleset-push.json`; `422` ou ausência na interface = indisponível | A camada preventiva da D12 cai; o workflow de [A8.3](#a83-camada-de-evidência-workflow-de-política-de-push-d12) passa a ser o único controle |
| Tipos de regra disponíveis | Compare a lista da interface com a de [A5.1](#a51-caminho-recomendado-ruleset-de-repositório) | Implemente o que falta por workflow de Actions |
| `bypass_actors` do tipo `User` | Existe no Cloud; **não existe** no GHES 3.17 | Use `Team` — que é o correto para o VIC de qualquer forma |
| `bypass_mode: "exempt"` | Existe no Cloud; **não existe** no GHES 3.17 | Use `always` |
| **IDs dos papéis** (`actor_type: "RepositoryRole"`) | Este guia **não afirma** esses números. Obtenha-os na sua instância antes de usar | Prefira `actor_type: "Team"`, que dispensa a tabela de ids |
| Verificação de assinatura **SSH** | Assine um commit e leia `.commit.verification.reason` | Use GPG: `gh gpg-key add` |
| Tokens **fine-grained** | Veja se a opção aparece em `/settings/tokens` | Use PAT clássico |
| Rate limit ligado no GHES | `gh api rate_limit --jq '.resources.core'` | Se estiver desligado, a pausa do script não dispara — é inofensivo |
| GitHub Actions habilitado | *Settings → Actions → General* | Sem Actions, D11 e D12 dependem só dos rulesets |
| Runners disponíveis (GHES) | *Settings → Actions → Runners* | Peça um runner ao `[SITE-ADMIN]`; troque `ubuntu-latest` por `self-hosted` |
| Ações de terceiros (GHES) | Tente usar `actions/checkout@v4` | Peça sincronização via GitHub Connect |
| Merge queue | Veja se a opção aparece no ruleset | Não é exigida por nenhuma das 13 diretrizes |
| API clássica de proteção de tag | Removida no Cloud; obsoleta no GHES 3.17 | Use ruleset de tag ([A11.1](#a111-ruleset-de-tag-d9-d10)) |

## Anexo II — Decisões institucionais pendentes

Cinco pontos que **devem** ser decididos pela governança técnica. Enquanto não forem,
este guia adotou o valor indicado — troque-o quando a decisão sair.

| # | Decisão | Valor adotado neste guia | Onde muda |
|---|---|---|---|
| 1 | **Prefixo `v` nas tags.** A D10 define o formato como `MAJOR.MINOR.PATCH.BUILD`, sem prefixo; o exemplo da D13 mostra `v2.4.1.305`. **São incompatíveis se a regex for estrita.** | `v` opcional: `^v?\d+\.\d+\.\d+\.\d+$` | Regex de [A8.2](#a82-camada-de-evidência-workflow-de-nomenclatura-d11), [A11.1](#a111-ruleset-de-tag-d9-d10) e variável `PADRAO_VEC` do script |
| 2 | **Faixa de maturidade vigente da D4.** A diretriz determina 60 dias de coleta sem limiar e limite inicial no percentil 75 | Faixa 3 (Definido): sync ≤ 5 dias, ahead ≤ 25, vida ≤ 15 | Variáveis `LIMITE_*` do script de [B8](#b8-script-de-coleta-comentado) |
| 3 | **Número de aprovações exigidas no PR.** A D8 exige revisão por pares, sem fixar quantidade | `1` | `required_approving_review_count` em [A5.1](#a51-caminho-recomendado-ruleset-de-repositório) |
| 4 | **Vida total da branch.** A D4 fixa limites de vida total, e a data de criação da *ref* não serve — `rebase` e recriação zeram essa referência | Usar o **commit divergente mais antigo** como início da branch: `GET /compare/{base}...{head}` devolve em `commits[]` os commits `ahead`, e o menor `commit.author.date` marca quando o trabalho passou a divergir. A data de *autoria* sobrevive ao `rebase`, ao contrário da data de *commit* | Ressalva: `compare` devolve no máximo 250 commits. Acima disso a branch já viola qualquer faixa da D4, então o truncamento não altera a classificação |
| 5 | **Tamanho da sigla.** A D11 já publica a expressão normativa, que admite sigla de 2 a 10 caracteres. Se as siglas institucionais têm tamanho fixo, o quantificador `{1,9}` deve ser ajustado para esse valor | `^[A-Z][A-Z0-9]{1,9}-[a-z0-9]+(-[a-z0-9]+)*$` (idêntica à publicada na Diretriz 11) | `PADRAO_REPO` no script e verificação de [A1](#a1-nomear-o-repositório--d11) |

---

**Referência cruzada com o modelo.** Este guia implementa as
[13 diretrizes](../diretrizes.html) do Modelo VIC. Cada seção declara a diretriz que
atende; cada diretriz tem, na Parte B, ao menos um indicador coletável.

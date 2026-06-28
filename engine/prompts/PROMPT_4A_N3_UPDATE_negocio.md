# PROMPT 4A — N3 Update Negócio
## Atualização de Feature Existente · Parte negocial

> **Modelo de estrutura**: `engine/templates/modules/_template-dominio/_template-feature-set/_template-feature.md` *(referência humana — o prompt já embute o esqueleto)*
> **Quem participa**: PO + dev (ou só PO)
> **Insumo necessário**: descrição da mudança desejada + a feature alvo
> (informada por nome/palavra-chave e **localizada pelo engine**, ou colada manualmente)
> **Entrega**: N3 negocial atualizado com as mudanças solicitadas e changelog
>
> **Pré-requisito**: PROMPT_3A e PROMPT_3B originais já aprovados
> **Próximo passo**: após aprovação, usar PROMPT_4B para a parte técnica
>
> ⚠️ **Use este prompt para manutenção (Brownfield).**
> Para features novas do zero, use PROMPT_3A.

---

## INSTRUÇÕES PARA O CLAUDE

Você vai me ajudar a atualizar uma especificação de feature (N3) já existente
do ponto de vista de negócio. Você **não reescreverá** tudo do zero —
apenas aplicará a mudança solicitada sobre o conteúdo atual.

Para evitar que o fluxo seja quebrado, você agirá como uma **Máquina de
Estados**. Toda resposta deve iniciar informando o estado atual:

```
[INICIALIZACAO] → [LOCALIZACAO_FEATURE] → [IDENTIFICACAO_MUDANCA]
                → [AVALIACAO_IMPACTO] → [ALINHAMENTO] → [GERACAO_ATUALIZACAO]
```

Regras da sessão:
- **Localize a feature antes de editar.** Nunca assuma qual é a feature alvo:
  pergunte qual é, busque-a no repositório e **confirme com o usuário** o que foi
  encontrado antes de coletar a mudança
- Trabalhe apenas na feature solicitada
- Verifique se a mudança afeta outras regras, fluxos ou campos — se sim, pergunte
- Mantenha linguagem de negócio — sem mencionar tabelas, endpoints ou tecnologias
- Faça uma pergunta de cada vez
- Sinalize suposições com ⚠️

---

## CONTEXTO DO PROJETO

=== MASTER.md ===
[cole aqui o conteúdo do MASTER.md]

=== FIELD-DICTIONARY.md ===
[cole aqui o conteúdo do FIELD-DICTIONARY.md]

=== RULES-DICTIONARY.md ===
[cole aqui o conteúdo do RULES-DICTIONARY.md]

=== N3 EXISTENTE DA FEATURE ===
[**No Claude Code**: deixe em branco — o engine localiza a feature no passo
LOCALIZACAO_FEATURE a partir do nome/palavra-chave que você informar.
**No fluxo copy-paste**: cole aqui o .md negocial atual da feature.]

=== HISTÓRIA DE USUÁRIO *(opcional — do PROMPT HU / ServiceNow)* ===
[cole aqui a história que motiva esta alteração — `modules/_backlog/[chave].md`.
Quando presente, acrescente a chave do ServiceNow à seção `## Origem` do N3
com Tipo "Alteração" e registre-a no changelog.]

---

## PASSO 1 — Inicialização

**[Estado: INICIALIZACAO]**

Confirme o que foi recebido e aguarde:
> "Vamos atualizar uma feature existente. Posso iniciar localizando a feature que
> você quer alterar?"

---

## PASSO 2 — Localização da feature

**[Estado: LOCALIZACAO_FEATURE]**

Nunca assuma qual é a feature alvo. Identifique-a junto com o usuário antes de
qualquer coleta de mudança.

**1. Pergunte qual feature** (se ainda não foi informada por nome/ID/palavra-chave):
> "Qual feature você quer alterar? Pode informar o nome, o ID (ex.: `USR-PRM-01`)
> ou uma palavra-chave do que ela faz."

**2. Busque a feature no repositório:**
- **No Claude Code (com ferramentas de arquivo):** procure nos N3 em
  `modules/**/[feature].md` por correspondências no nome do arquivo, no `## Objetivo`,
  no ID e nos campos. Não peça para colar o conteúdo — leia direto do disco.
- **No fluxo copy-paste:** use o N3 colado na seção CONTEXTO; se nenhum foi colado,
  peça que cole o N3 da feature.

**3. Apresente o que foi encontrado e confirme** antes de avançar:
- Se houver **uma** correspondência clara, mostre um cartão de identificação e peça
  confirmação:
  > "Encontrei esta feature:
  > - **Feature:** [nome] (`[ID]`)
  > - **Caminho:** `modules/[dom]/[fs]/[feat].md`
  > - **Objetivo:** [resumo do ## Objetivo]
  > - **Campos:** [lista curta dos Label PO]
  >
  > É esta que você quer alterar?"
- Se houver **mais de uma** correspondência, liste as candidatas (nome, ID, caminho,
  objetivo em uma linha) e peça para o usuário escolher — **uma pergunta**.
- Se **nenhuma** for encontrada, informe e pergunte se a feature usa outro nome ou se
  ainda não foi especificada (nesse caso, é caso de PROMPT_3A, não de manutenção).

Só transite para `IDENTIFICACAO_MUDANCA` após o usuário confirmar a feature. A partir
daqui, leia o N3 confirmado como base e trabalhe apenas sobre ele.

---

## PASSO 3 — Identificação da mudança

**[Estado: IDENTIFICACAO_MUDANCA]**

Faça esta pergunta e aguarde:
> "O que você deseja alterar, adicionar ou remover nesta feature?
> Descreva a necessidade em linguagem de negócio.
> Se a mudança vem de uma história do ServiceNow, informe a chave (ex.: `STRYxxxxxxx`)
> para eu registrá-la na seção `## Origem` e no changelog."

---

## PASSO 4 — Avaliação de impacto negocial

**[Estado: AVALIACAO_IMPACTO]**

Com base na resposta, avalie no N3 existente os pontos abaixo.
Para cada ponto com impacto, formule uma pergunta de esclarecimento —
**uma por vez**, aguardando resposta antes da próxima:

- **Campos**: novos campos são necessários? Algum campo sai ou muda?
- **Regras de negócio**: a mudança altera regras atuais ou insere uma nova?
- **Dicionários**: se a mudança introduz (ou revela) um campo ou regra com
  potencial de reuso, proponha ⚠️ promovê-lo ao FIELD-DICTIONARY / RULES-DICTIONARY
  (com aprovação) em vez de registrá-lo apenas inline. Se a mudança altera um
  campo/regra **já canônico**, sinalize que o dicionário pode precisar de ajuste.
- **Cenários**: quais novos cenários surgem? Quais ficam obsoletos?
- **Comportamento de tela**: a UI precisará de mudanças?

Exemplo de pergunta:
> "Notei que você quer adicionar 'Data de validade'. Esse campo será obrigatório?"

---

## PASSO 5 — Alinhamento final

**[Estado: ALINHAMENTO]**

Após todas as perguntas respondidas, apresente um resumo das mudanças
alinhadas e confirme:
> "Com base no que discutimos, as mudanças negociais são:
> [lista resumida]. Posso gerar a versão atualizada do N3?"

---

## PASSO 6 — Geração da atualização

**[Estado: GERACAO_ATUALIZACAO]**

Gere a versão atualizada das seções negociais do N3 afetadas,
evidenciando o que mudou. Se a alteração veio de uma história, adicione a linha
correspondente à seção `## Origem` (Tipo "Alteração"). Adicione ou atualize a
seção de changelog:

```markdown
## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| [data] | [nome] | Novo campo / Regra alterada / Correção | [o que mudou e por quê] |
```

Apresente apenas as seções alteradas (não repita o que não mudou).
Se houver promoções aprovadas a dicionários, liste-as como ação pendente
(⚠️ aplicar no FIELD-DICTIONARY / RULES-DICTIONARY antes de implementar).
Pergunte:
> "A atualização negocial do N3 de [feature] está correta?
> Ajusta algo ou avanço para a parte técnica via PROMPT_4B?"

---

## PASSO 7 — Fechar o elo recíproco (se a alteração veio de uma história)

**[Estado: GERACAO_ATUALIZACAO]**

> Execute **somente se** uma história motivou esta alteração (uma linha Tipo
> "Alteração" foi adicionada à `## Origem` no PASSO 6). O elo história ↔ feature
> é **M:N** e precisa ficar registrado dos dois lados mais o índice — senão o
> caminho inverso ("quais features esta história alterou?") fica incompleto.

Atualize os outros dois lados, espelhando a linha que entrou na `## Origem`:

**1. `modules/_backlog/[chave].md`** — na seção `## Rastreabilidade — Features
(N3) que realizam esta história`, adicione a linha desta feature se ainda não
constar, e registre uma linha no changelog da história ("Feature alterada").

**2. `modules/INDEX.md`** — garanta que existe a linha do par história↔feature na
tabela `## Rastreabilidade: história → spec → código` (adicione se faltar;
atualize o Status se ele mudou com esta alteração).

**No Claude Code (com ferramentas de arquivo):** edite os arquivos direto no disco.
**No fluxo copy-paste:** entregue os blocos como patch para o usuário aplicar.

> 💡 Para auditar todos os elos de uma vez e detectar links unilaterais, use o
> **PROMPT_AUDIT_TRACE_LINKS** (opção **AT** no menu).

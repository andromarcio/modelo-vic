# PROMPT 3A — N3 Negócio
## Features · Parte negocial

> **Modelo de estrutura**: `engine/templates/modules/_template-dominio/_template-feature-set/_template-feature.md` *(referência humana — o prompt já embute o esqueleto)*
> **Quem participa**: PO + dev (ou só PO)
> **Insumo necessário**: N1 do domínio + N2 do Feature Set escolhido
> *(ambos opcionais no fluxo bottom-up — ver Modo B abaixo)*
> **Entrega**: rascunho do .md de cada feature com objetivo, campos
> em Label PO, regras e cenários Gherkin negociais
>
> **Pré-requisito (fluxo top-down)**: PROMPT_2A concluído (N2 negocial) para o Feature Set escolhido
> **Pré-requisito (fluxo bottom-up)**: nenhum — informe nome do domínio, Feature Set e feature
> **Próximo passo**: após aprovação, usar PROMPT_3B

---

## INSTRUÇÕES PARA O CLAUDE

Você vai especificar features do ponto de vista de negócio.
Use exclusivamente linguagem de negócio — sem mencionar endpoints,
campos de banco, libs, FKs ou arquivos de código.

Regras da sessão:
- Trabalhe uma feature de cada vez, na ordem que eu indicar.
- Apresente as perguntas em blocos temáticos, um bloco de cada vez.
- Ao completar todos os blocos, gere o artefato e aguarde aprovação.
- A tabela de campos usa apenas: Label PO, Tipo, Obrigatório e Validação
  em linguagem natural. Nunca inclua Label Dev ou campo banco.
- Campos canônicos (CPF, CEP, e-mail, etc.): aplicar FIELD-DICTIONARY
  automaticamente sem perguntar sobre suas regras de validação.
- Regras canônicas (maioridade, responsável ativo, etc.): aplicar
  RULES-DICTIONARY automaticamente sem perguntar sobre o comportamento.
- Perguntar apenas o que os dicionários deixam em aberto (parâmetros).
- Sinalize suposições com ⚠️.
- **Nomenclatura dos arquivos N3**: prefixo `f-` obrigatório + verbo no infinitivo + hífen + substantivo da entidade principal (singular) + adjetivo qualificador quando a entidade tiver um (derivar do nome do Feature Set), tudo em kebab-case. A pasta do Feature Set usa o prefixo `g-`. Padrão: `modules/[dominio]/g-[feature-set]/f-[verbo]-[entidade]-[adjetivo].md` ou `f-[verbo]-[entidade].md` quando não houver adjetivo. Exemplos com adjetivo: `f-cadastrar-fundo-gerido.md`, `f-pesquisar-fundo-gerido.md`, `f-pesquisar-fundo-alocado.md`. Exemplos sem adjetivo: `f-cadastrar-cliente.md`, `f-excluir-usuario.md`. O adjetivo evita colisão entre features de Feature Sets distintos dentro do mesmo domínio. Nunca omita o prefixo `f-` nem use outro separador que não seja hífen.

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

=== NFR.md ===
[cole aqui o conteúdo do global/NFR.md — para rotear requisitos não-funcionais e evitar duplicação]

=== N1 DO DOMÍNIO *(opcional — omita se não existir ainda)* ===
[cole aqui o README.md do domínio]

=== N2 DO FEATURE SET *(opcional — omita se não existir ainda)* ===
[cole aqui o README.md do Feature Set]

=== HISTÓRIA DE USUÁRIO *(opcional — do PROMPT HU / ServiceNow)* ===
[cole aqui o conteúdo de modules/_backlog/[chave].md — a história que originou
esta feature. Quando presente, registre a chave do ServiceNow na seção
`## Origem` do N3 e analise cada critério de aceite: ele vira regra de negócio,
cenário ou ambos.]

=== IDENTIFICAÇÃO MANUAL *(preencher apenas no fluxo bottom-up, quando N1/N2 não existem)* ===
Domínio: [nome do domínio]
Feature Set: [nome do Feature Set]
Feature(s) a especificar: [nome da feature — ou lista separada por vírgula]

---

## PASSO 1 — Detecção do modo e confirmação das features

Verifique os insumos recebidos e bifurque:

---

### História de usuário fornecida (se houver)

Se uma **história de usuário** (`modules/_backlog/[chave].md`) foi colada no
contexto, ela é a **origem** desta feature. Antes de bifurcar entre Modo A/B:

- Registre a **chave do ServiceNow** para preencher a seção `## Origem` do N3.
- **Analise cada critério de aceite** e classifique-o — ele pode virar:
  - uma **regra de negócio**, se expressa uma **invariante** (*o quê* sempre vale);
  - um **`## Cenário`** (Gherkin), se descreve um **comportamento observável**
    (reaproveite o Given/When/Then quando já vier nesse formato);
  - **ambos** — a invariante vira regra; o comportamento que a exercita vira cenário.

  Isso garante o elo semântico história → spec (regra e/ou cenário), não só por ID.
- Confirme com o usuário se esta sessão cobre **um critério, vários ou todos**
  os da história (uma história pode virar mais de uma feature).

> "Esta feature tem origem na história **[STRYxxxxxxx]**. Vou registrá-la na
> seção `## Origem` e desdobrar cada critério de aceite em regra de negócio,
> cenário ou ambos. Esta feature cobre [todos os critérios | os critérios N, M]
> da história?"

---

### Modo A — Top-down (N2 disponível)

Se o N2 foi fornecido, leia a tabela de Features do N2 e extraia **exatamente**:
- O nome da feature (em **negrito** na coluna "Feature" do N2)
- O ID já atribuído no formato `[SIGLA]-[SFS]-NN` (no N2 ele aparece em `<small>` ao lado do nome da feature)
- O nome do arquivo já definido (ex: `f-cadastrar.md` — coluna "Arquivo de Especificação (N3)")

**Não gere novos IDs nem novos nomes de arquivo** — use os que o N2 já define.
Se alguma feature não tiver ID ou arquivo definido no N2, sinalize com ⚠️ e proponha seguindo o padrão das demais.

Pergunte:

> "Identifiquei as seguintes features em **[Feature Set]**:
>
> | Feature | ID | Arquivo |
> |---|---|---|
> | [nome exato do N2] | [ID do N2] | [arquivo do N2] |
>
> Qual delas deseja especificar primeiro?"

---

### Modo B — Bottom-up (sem N2)

Se o N2 **não** foi fornecido, use a identificação manual. Informe que IDs
provisórios serão atribuídos e confirmados quando o N2 for gerado via B2.
Confirme:

> "Vou especificar a feature **[nome da feature]** do Feature Set
> **[Feature Set]** no domínio **[Domínio]**.
> ⚠️ ID provisório atribuído: **[SIGLA]-[SFS]-[NN]** — confirmar quando o N2 for gerado via B2.
>
> ⚠️ Como N1 e N2 ainda não existem, registrarei as informações de
> contexto de domínio e Feature Set que surgirem durante a sessão —
> elas servirão de insumo para gerar esses artefatos depois via **B2** e **B1**.
>
> Podemos começar?"

Em Modo B, ao longo dos blocos:
- Sempre que o usuário mencionar regras que pareçam valer para outras
  features do mesmo Feature Set, sinalize com:
  > "⚠️ Esta regra pode ser transversal ao Feature Set — anote para
  > incluir no N2 quando for gerado via B2."
- Sempre que mencionar regras que pareçam valer para o domínio inteiro,
  sinalize com:
  > "⚠️ Esta regra pode ser transversal ao domínio — anote para
  > incluir no N1 quando for gerado via B1."

---

## PASSO 1.5 — Detecção de padrão CRUD

Antes de iniciar o PASSO 2, verifique se o nome da feature sugere uma
operação derivada de um cadastro:

- **Pesquisa / Listagem**: pesquisar, listar, consultar, buscar
- **Edição**: editar, alterar, atualizar
- **Exclusão**: excluir, remover, deletar, inativar, arquivar
- **Visualização**: visualizar, detalhar, exibir

Se o nome da feature se encaixar em algum desses padrões, pergunte:

> "Esta feature parece ser derivada de um cadastro existente.
> Já existe um N3 de **cadastro / inclusão** para este módulo?
> Se sim, cole o conteúdo aqui para que eu proponha os campos automaticamente."

Se o N3 de cadastro for fornecido, aplique as regras abaixo para a feature
em questão **antes** de entrar no PASSO 2. Informe ao usuário o que foi derivado
e peça apenas confirmação ou ajustes.

---

### Derivação para Pesquisa / Listagem

A partir dos campos do N3 de cadastro, proponha automaticamente:

**Filtros sugeridos** — mapeie por tipo de campo:
- Texto livre → filtro por correspondência parcial
- Lista de opções / enum → filtro por seleção (dropdown)
- Data → filtro por intervalo (De / Até)
- Sim/Não → filtro por seleção (todos / sim / não)
- Campos de identificação única (ex: CNPJ, código) → filtro por valor exato
- Campo que referencia outro cadastro (ex: Cliente, Gestor) → filtro por
  seleção que busca na entidade origem — ver "Campos de seleção" abaixo

**Colunas do resultado sugeridas** — inclua por padrão:
- O campo identificador único do cadastro
- Os campos de nome / descrição / razão social (quando existirem)
- Campos de status ou situação (quando existirem)
- No máximo 6 colunas — priorize os de maior valor para reconhecimento rápido

Apresente a proposta ao usuário:

> "Com base no cadastro, proponho:
>
> **Filtros:**
> | Campo | Tipo de filtro | Obrigatório |
> |---|---|---|
> | [campo] | [texto / seleção / intervalo] | não |
>
> **Colunas do resultado:**
> | Coluna | Origem |
> |---|---|
> | [campo] | cadastro |
>
> Algum filtro deve ser removido ou adicionado?
> Alguma coluna deve ser removida, adicionada ou reordenada?"

Após confirmação, **pule o BLOCO B** no PASSO 2 — os campos já estão derivados.
Prossiga a partir do BLOCO C (Regras de negócio), focando nas regras
específicas da pesquisa (ex: carga inicial, ordenação padrão, limite de registros).

**Superfície sugerida:** pesquisa/listagem normalmente é **Tela própria** (a tela
de resultados). Confirme com o usuário e registre na seção `## Superfície`.

---

### Derivação para Edição

A partir dos campos do N3 de cadastro, proponha automaticamente:

- Todos os campos do cadastro, mantendo tipo, obrigatoriedade e validações
- O campo identificador único → **somente leitura** (não editável)
- Campos preenchidos automaticamente no cadastro → manter como automáticos

Apresente a proposta ao usuário:

> "Com base no cadastro, proponho o mesmo formulário com as seguintes diferenças:
>
> | Label PO | Tipo | Obrigatório | Observação |
> |---|---|---|---|
> | [identificador único] | [tipo] | — | ⚠️ Somente leitura — não editável |
> | [demais campos] | [tipo] | [igual ao cadastro] | — |
>
> Algum campo adicional deve se tornar somente leitura na edição?
> Algum campo deve ser removido ou ter sua obrigatoriedade alterada?"

Após confirmação, **pule o BLOCO B** no PASSO 2 — os campos já estão derivados.
Prossiga a partir do BLOCO C (Regras de negócio), focando nas regras
específicas da edição (ex: restrições de edição por status, quem pode editar).

---

### Derivação para Exclusão

A partir do N3 de cadastro, proponha automaticamente:

- Identificação do registro pelo campo único do cadastro (somente leitura)
- Confirmação explícita do usuário antes de excluir (mensagem de confirmação)

Faça apenas as perguntas essenciais que a derivação não responde:

> "Com base no cadastro, proponho:
>
> - Exibir o registro identificado por [campo único] para confirmação
> - Solicitar confirmação explícita antes de excluir
>
> Preciso de mais duas informações:
>
> 1. A exclusão é **física** (remove do banco) ou **lógica**
>    (marca como inativo/excluído, mas mantém o registro)?
> 2. Este registro pode estar **vinculado** a outros no sistema?
>    Se sim, o que deve acontecer ao tentar excluir um registro com vínculos?"

Após as respostas, **pule os BLOCOs B e C** no PASSO 2 — campos e regras
principais já estão derivados. Passe diretamente ao BLOCO D (Cenários
alternativos), focando nos casos de erro e integridade.

**Superfície sugerida:** exclusão normalmente é **Ação em tela** — disparada da
listagem de resultados da pesquisa (ícone/botão na linha + modal de confirmação),
sem tela própria. Registre a feature/tela de origem na seção `## Superfície`.

---

### Campos de seleção (combobox que vem de outra feature)

Sempre que um campo — de cadastro **ou** de filtro — não for digitado livremente,
mas **escolhido a partir de registros de outra entidade** (ex: escolher um Cliente,
um Gestor, uma Categoria já cadastrada), trate-o como **campo de seleção**, não como
lista de opções fixas.

Diferencie:
- **Lista de opções fixa (enum)**: valores fechados e estáveis, definidos no código
  (ex: Tipo = FOF / Espelho). Tipo na tabela de campos: `lista (opção A, opção B)`.
- **Seleção de outra entidade (FK)**: as opções são registros vivos de outra feature
  e mudam conforme o cadastro. Tipo na tabela de campos: `seleção → [Entidade]`.

Para campos de seleção, registre na tabela de campos do N3 assim:

```markdown
| Gestor (filtro) | seleção → Gestor | não | → ver DATA-MODEL.md: Relacionamentos de seleção (gestorId); carga: autocomplete por nome; apenas Gestores ativos |
```

- **Tipo** = `seleção → [Entidade origem]` (nome da entidade em português).
- **Validação** carrega o que é decisão de negócio desta feature:
  - **carga**: `lista completa` (poucas opções, carrega tudo) ou
    `autocomplete por [campo]` (muitas opções, busca conforme o usuário digita);
  - **filtro de origem**: quais registros podem aparecer (ex: "apenas ativos").
- O **mapeamento técnico** (campo-valor, campo-label, endpoint) **não** vai no N3 —
  fica no DATA-MODEL.md e é resolvido no PROMPT_3B. O N3 apenas aponta.

Pergunte ao usuário apenas o que a derivação não responde:

> "O campo **[campo]** é uma seleção que vem do cadastro de **[Entidade]**.
> 1. Deve carregar a lista completa ou buscar conforme o usuário digita?
> 2. Algum registro de [Entidade] deve ficar de fora (ex: apenas ativos)?"

---

## PASSO 2 — Coleta negocial por blocos

Para cada feature, percorra os blocos abaixo em ordem.
Apresente um bloco de cada vez e aguarde minhas respostas.

> **Nota:** Se o PASSO 1.5 derivou campos de um N3 de cadastro existente,
> os blocos marcados como "pulados" na derivação devem ser **omitidos**
> — não faça as perguntas correspondentes.

---

### BLOCO A — Visão geral
> 1. O que esta funcionalidade faz, em uma frase para alguém
>    que nunca viu o sistema?
> 2. Quem a aciona: usuário interno, externo ou o próprio sistema?

---

### BLOCO B — Campos em linguagem de negócio

> 3. Quais informações o usuário preenche ou visualiza nesta funcionalidade?
>    Para cada informação: nome em português, tipo (texto, número, data,
>    lista de opções, sim/não, arquivo), se é obrigatória e qualquer
>    regra de preenchimento que o usuário precisa saber.
>
> 4. Existe alguma informação que o sistema preenche automaticamente?
>    Qual e quando?

Após receber os campos:
- Verificar se algum é canônico (CPF, CEP, e-mail, telefone, senha,
  data de nascimento, data futura, valor monetário, percentual, URL,
  nome de pessoa, razão social, CNPJ)
- Se for canônico: aplicar FIELD-DICTIONARY automaticamente e perguntar
  apenas o que o dicionário deixa em aberto (obrigatoriedade, unicidade, etc.)
- Se a opção for **escolhida a partir de outro cadastro** (ex: "seleciona um
  Cliente já cadastrado"): tratar como campo de seleção `seleção → [Entidade]`
  — ver "Campos de seleção" no PASSO 1.5
- Se não for canônico: registrar Label PO, tipo e validações informadas

---

### BLOCO C — Regras de negócio
> 5. Descreva o que acontece passo a passo quando tudo ocorre
>    como esperado (caminho feliz).
>
> 6. Existe alguma condição que impede ou altera o comportamento?
>
> 7. Quando esta funcionalidade conclui, o sistema faz algo
>    automaticamente? (e-mail, tarefa, notificação)
>
> 8. Esta ação precisa ficar registrada no histórico de auditoria?

Após receber as regras:
- **Atomicidade — uma regra, uma invariante**: ao montar `## Regras de negócio`,
  quebre regras compostas. Se a resposta liga condições independentes por
  "e" / "ou" / "além disso", separe em itens distintos — cada item deve carregar
  **uma única restrição verificável**. A reação do sistema ("não salva", "exibe
  mensagem") não é regra: vai para `## Cenários` (BLOCO D).
- Verificar se alguma é canônica (maioridade, responsável ativo,
  período de vigência, aprovação antes de publicar, limite por organização,
  slug único público, reenvio com cooldown, arquivo com tamanho máximo,
  registro vinculado não pode ser excluído)
- Se for canônica: aplicar RULES-DICTIONARY e perguntar apenas os parâmetros
  que o dicionário deixa em aberto
- **Roteamento regra × NFR**: registre em `## Regras de negócio` apenas
  **invariantes de negócio** (o *que* a feature garante). Se a resposta trouxer
  uma **qualidade do sistema** — tempo de resposta, segurança, disponibilidade,
  auditoria, restrição técnica — ela é **não-funcional** e **não** entra como
  regra de negócio: pertence ao `global/NFR.md`. Se já houver NFR equivalente,
  ele é herdado e **não** se repete no N3; se for novo, sinalize:
  > "⚠️ Isto é um requisito não-funcional ([categoria]). Não entra nas regras
  > de negócio — proponho registrá-lo no NFR.md como [ID sugerido]. Confirma?"
- **Pergunta 8 (auditoria)**: se a ação precisa ficar auditada, isso é o NFR
  **AUD-01** (herdado) — não escreva "fica auditado" como regra de negócio.
  Registre o "sim/não" para que o PROMPT_3B preencha a seção `## AuditLog`
  (que apontará `→ ver NFR: AUD-01`).

---

### BLOCO D — Cenários alternativos
> 9. Quais erros o usuário pode cometer? Para cada erro: o que aconteceu
>    e qual mensagem deve ser exibida?
>
> 10. Pode ocorrer conflito com dados já existentes? O que acontece?
>
> 11. O que acontece se um usuário sem permissão tentar usar esta funcionalidade?
>
> 12. Existe alguma situação especial no sistema que muda o comportamento?
>     (cadastro arquivado, período de carência, conta suspensa)

---

### BLOCO E — Interface
> 13. Onde esta funcionalidade aparece na tela?
>     (formulário, modal, botão em lista, página própria)
>
> 14. O que o usuário vê durante o processamento? E em caso de erro?
>     E quando não há dados?
>
> 15. Qual o retorno visual após a ação? (toast, redirect, relatório)

Com a resposta da pergunta 13, **classifique a feature na seção `## Superfície`**:
- Se a feature tem página/rota ou formulário dedicado → **Tela própria** (registre a rota).
- Se a feature é disparada de dentro de outra tela (botão/ícone em listagem,
  menu de contexto, modal de confirmação) → **Ação em tela** (registre a feature/tela de origem).

A seção `## Superfície` é o classificador escaneável; o detalhamento (estados,
retorno visual) permanece em `## Comportamento de tela`. Quando uma mesma tela
atende várias features, isso será consolidado na seção **Telas** do N2.

---

## PASSO 3 — Geração do artefato negocial

Com as respostas de todos os blocos, gere:

📄 `modules/[dominio]/[feature-set]/[arquivo-do-N2]` — usar o nome de arquivo **exatamente como definido** na tabela de Features do N2 (Modo A), ou derivar do nome da feature em kebab-case (Modo B)

**Gere exatamente esta estrutura — sem adicionar seções, subtítulos ou elementos não listados abaixo:**

```
# [Nome da Feature — exatamente como consta no N2]
> **Nível 3** - Feature Set: [Nome do Feature Set] — Domínio: [Nome do Domínio] - `[ID do N2]`
<!-- ID — Modo A: ID do N2 (ex: F01) | Modo B: [SIGLA]-[SFS]-[NN] ⚠️ provisório -->

## Descrição
[uma frase em linguagem de negócio]

---

## Origem
<!-- Incluir apenas se houver história de usuário de origem; senão, omitir a seção. -->

| História (ServiceNow) | Tipo | Critérios cobertos |
|---|---|---|
| [`STRYxxxxxxx`](../../_backlog/[chave].md) | Criação / Alteração | [critérios de aceite que esta feature realiza] |

---

## Superfície

**[Tela própria | Ação em tela]** — [se tela própria: rota `/...`; se ação em tela: origem: [Feature/Tela]]

---

## Regras de negócio

1. [Regra específica desta feature]
2. [Regra canônica] → ver RULES-DICTIONARY: [nome] (parâmetro: [valor])
3. [Regra de domínio] → ver N1 [Domínio]: Regras transversais de negócio: [N]

---

## Cenários

[bloco gherkin — ver formato abaixo]

---

## Campos

| Label PO | Tipo | Obrigatório | Validação |
|---|---|---|---|
| [nome em português] | [tipo] | sim/não/automático | [regra em linguagem natural] |
| [campo canônico] | [tipo] | [obrig.] | → ver FIELD-DICTIONARY: [nome] |

---

## Campos automáticos

| Label PO | Valor | Quando |
|---|---|---|
| [campo] | [valor automático] | [quando é preenchido] |

---

## Comportamento de tela

### Onde fica
[em qual rota e componente a feature aparece: página própria, modal, botão em listagem]

### Estados da tela

| Estado | Comportamento |
|---|---|
| Loading | [o que exibir durante o processamento] |
| Erro de validação | [como exibir erros de campo] |
| Erro de servidor | [toast ou mensagem genérica] |
| Sucesso | [toast, redirecionamento ou relatório] |
| Empty state | [quando e o que exibir se não há dados] |

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| [data atual] | [Claude / autor] | Feature criada | N3 negocial gerado |

---

*Feature Set: [Nome] · Domínio: [Nome] · Última revisão: —*
*Links: [N2 do Feature Set](./README.md) · [N1 do domínio](../README.md) · [INDEX geral](../../INDEX.md)*
```

**Formato do bloco Gherkin** (seção `## Cenários`):
```gherkin
# ← FIELD-DICTIONARY: [nome do campo] (importar cenários de validação)
# ← RULES-DICTIONARY: [nome da regra] (importar cenários)

# ── Caminho feliz ──────────────────────────────────────────────

Scenario: [descrição]
  Given [estado inicial]
  When [ação]
  Then [resultado]

# ── [Grupo temático] ───────────────────────────────────────────

Scenario: [descrição]
  ...
```

Após apresentar, pergunte:
> "O N3 negocial de [feature] está correto do ponto de vista de negócio?
> Ajusta algo ou avanço para a próxima feature?"

---

## PASSO 3.5 — Fechar o elo recíproco (história ↔ feature)

> Execute este passo **somente se a feature tem origem numa história** (a seção
> `## Origem` foi preenchida no PASSO 3). O elo história ↔ feature é **M:N** e
> precisa ficar registrado nos **três lugares** — senão o caminho inverso
> ("quais features esta história impactou?") fica incompleto. A `## Origem` é só
> o lado feature → história; os outros dois precisam ser atualizados na mesma passada.

Após o N3 ser aprovado, atualize:

**1. Artefato da história — `modules/_backlog/[chave].md`**
Na seção `## Rastreabilidade — Features (N3) que realizam esta história`, adicione
(ou atualize) a linha desta feature — espelho exato da `## Origem` do N3:

```markdown
| [`[ID]`: Nome da Feature](../[dominio]/[feature-set]/[arquivo].md) | [Domínio] · [Feature Set] | 📋 Especificado |
```

Atualize também o cabeçalho `> **Especificada em (N3)**:` da história se ainda
estiver "pendente", e acrescente uma linha ao changelog dela ("Feature especificada").

**2. Índice consolidado — `modules/INDEX.md`**
Na tabela `## Rastreabilidade: história → spec → código`, adicione uma linha por
par história↔feature (se ainda não existir):

```markdown
| [`STRYxxxxxxx`](./_backlog/[chave].md) | [[ID]: Nome](./[dominio]/[feature-set]/[arquivo].md) | [Domínio] | 📋 Especificado | — | — | — |
```

**No Claude Code (com ferramentas de arquivo):** edite os dois arquivos direto no
disco, na mesma passada da geração do N3 — não peça para o usuário colar conteúdo.
**No fluxo copy-paste:** apresente os dois blocos como patch para o usuário aplicar.

Confirme ao final:
> "Elo recíproco fechado: a feature consta na `## Origem` do N3, na
> `## Rastreabilidade` da história `[STRYxxxxxxx]` e no `INDEX.md`. O caminho
> inverso história → features está rastreável.
> 💡 Para auditar todos os elos de uma vez (e detectar unilaterais), use a opção **AT**."

---

## PASSO 4 — Confirmação de cobertura

Após todas as features aprovadas, bifurque conforme o modo da sessão:

**Modo A (top-down):**
> "Parte negocial do N3 concluída para todas as features de [Feature Set].
> Para complementar com a parte técnica e atualizar o DATA-MODEL.md,
> use o PROMPT_3B passando cada .md gerado aqui como contexto."

**Modo B (bottom-up):**
> "Parte negocial do N3 concluída para todas as features de [Feature Set].
>
> **Próximos passos recomendados:**
> 1. Use o **PROMPT_3B** para complementar cada N3 com a parte técnica
> 2. Quando tiver N3s suficientes do Feature Set, use **B2** para gerar o N2
> 3. Com os N2s prontos, use **B1** para gerar o N1 do domínio
> 4. Rode **AU** para verificar duplicatas de regras entre as features especificadas"

---

## Checklist de conformidade do N3

Antes de apresentar cada feature, confira (todos os itens são obrigatórios):

- [ ] Título `# [Nome da Feature]` (exatamente como no N2) + subtítulo `> **Nível 3** - Feature Set: [Nome] — Domínio: [Nome] - [ID]`
- [ ] `## Origem` presente **somente** se houver história de usuário (senão, omitir a seção)
- [ ] `## Superfície`: **Tela própria** (com rota `/...`) **ou** **Ação em tela** (com a feature/tela de origem)
- [ ] `## Regras de negócio`: itens **atômicos** (uma invariante cada); a reação do sistema e o texto da mensagem **não** entram aqui (vão para Cenários); canônicas como `→ ver RULES-DICTIONARY: [nome]`
- [ ] `## Cenários`: Gherkin com os grupos (Caminho feliz · Erros de validação · Conflitos com dados existentes · Restrições de acesso · Estados especiais), em Label PO, com os marcadores de importação dos canônicos
- [ ] `## Campos`: 4 colunas (Label PO | Tipo | Obrigatório | Validação) — **apenas Label PO** (nunca Label Dev nem campo banco); canônicos como `→ ver FIELD-DICTIONARY: [nome]`
- [ ] `## Campos automáticos`: 3 colunas (Label PO | Valor | Quando)
- [ ] `## Comportamento de tela` + `## Changelog`
- [ ] N3 **não** trata de permissões (vivem no N2); NFR **não** vira regra de negócio
- [ ] Campos novos (não canônicos) sinalizados para o **data-model** com ⚠️ — nunca inventados no N3
- [ ] **Nenhuma** seção técnica (API, eventos, AuditLog, mapeamento de campos) — isso é o **PROMPT_3B**

> **Gate determinístico** — após gravar o N3, rode `node scripts/validate-doc.mjs <arquivo>`.
> Ele exige as seções obrigatórias do N3 (Descrição, Superfície, Regras de negócio,
> Cenários, Campos, Campos automáticos, Comportamento de tela, Changelog) e **reprova**
> se a tabela `## Campos` vazar camada técnica (Label Dev / campo banco).
> O artefato só é conforme quando o validador retorna `✓` (sai com código 0).

# PROMPT CRUD — Feature Set CRUD padrão (N2 + N3 negocial)
## Atalho de especificação para cadastros

> **Modelo de estrutura (N2)**: `engine/templates/modules/_template-dominio/_template-feature-set/README.md`
> **Modelo de estrutura (N3)**: `engine/templates/modules/_template-dominio/_template-feature-set/_template-feature.md`
> *(referência humana — o prompt já embute os esqueletos)*
> **Quem participa**: PO + dev (ou só PO)
> **Insumo necessário**: descrição da entidade + tabela de campos. N1 do domínio é opcional.
> **Entrega**: o `README.md` (N2) do Feature Set **e** os N3 negociais das cinco
> operações CRUD — `f-pesquisar.md`, `f-cadastrar.md`, `f-editar.md`, `f-excluir.md`,
> `f-visualizar.md`.
>
> **Pré-requisito**: nenhum obrigatório. Se o N1 do domínio existir, informe-o para
> herdar regras transversais e manter consistência de Label PO.
> **Próximo passo**: após aprovação, usar **3B** para complementar cada N3 com a parte técnica.

---

## INSTRUÇÕES PARA O CLAUDE

Você vai especificar, numa única sessão, um Feature Set de **cadastro (CRUD)**
seguindo o padrão do framework. A partir de **uma descrição da entidade e da
tabela de campos**, produza o N2 do Feature Set e os N3 negociais das cinco
operações: **Pesquisar, Cadastrar, Editar, Excluir e Visualizar**.

Princípio do atalho: o usuário descreve a entidade **uma vez**. O N3 de
**Cadastro** é a fonte canônica; **Pesquisa, Edição, Exclusão e Visualização são
derivadas dele** — não repita as perguntas de campos para cada operação.

Regras da sessão:
- Use exclusivamente linguagem de negócio — sem endpoints, FKs, libs ou arquivos.
- A tabela de campos usa apenas: Label PO, Tipo, Obrigatório e Validação em
  linguagem natural. Nunca inclua Label Dev ou campo banco.
- Campos canônicos (CPF, CEP, e-mail, telefone, CNPJ, ISIN, data, valor
  monetário, percentual, URL, nome de pessoa, razão social, etc.): aplicar o
  FIELD-DICTIONARY automaticamente, sem perguntar suas regras de validação.
- Regras canônicas: aplicar o RULES-DICTIONARY automaticamente; perguntar
  apenas os parâmetros em aberto.
- **Regras de negócio atômicas — uma regra, uma invariante.** Ao escrever a
  seção `## Regras de negócio` de cada N3, quebre regras compostas: condições
  independentes ligadas por "e" / "ou" / "além disso" viram **itens distintos**,
  cada um com **uma única restrição verificável**. A reação do sistema ("não
  salva", "exibe mensagem") não é regra — vai para os **Cenários**.
- **Permissões vivem só no N2.** Colete perfis e permissões por operação uma
  vez e registre-os apenas no `README.md` do Feature Set — os N3 não tratam de permissões.
- Um artefato de cada vez: gere, aguarde aprovação, só então avance.
- Sinalize suposições com ⚠️.

> **Escopo deste prompt: negocial.** Não gere seções técnicas (API, eventos,
> AuditLog, mapeamento de campos) nem o `data-models/[dominio].md` — isso é o **3B**.

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

=== ROUTING.md ===
[cole aqui o conteúdo do global/ROUTING.md — convenção de rotas de tela]

=== N1 DO DOMÍNIO *(opcional — omita se não existir ainda)* ===
[cole aqui o README.md do domínio]

=== IDENTIFICAÇÃO MANUAL *(preencher quando o N1 não for fornecido)* ===
Domínio: [nome do domínio]
Sigla do domínio: [3 letras maiúsculas — ex.: CAD]

---

## Controle de fluxo — Máquina de Estados

```
[INICIALIZACAO] → [COLETA_ENTIDADE] → [COLETA_CAMPOS] → [COLETA_POLITICA_CRUD]
   → [GERACAO_N2] → [GERACAO_N3_CADASTRO] → [DERIVACAO_N3_DEMAIS] → [REVISAO_CONSISTENCIA]
```

Toda resposta inicia com `[Estado: NOME]`. Não pule estados. Aguarde aprovação
explícita antes de transitar de um estado de geração para o próximo.

---

## PASSO 1 — `[COLETA_ENTIDADE]`

Confirme o domínio e a sigla (do N1, se fornecido; senão da identificação
manual). **Se o N1 já definir este Feature Set, reutilize o ID `[SIGLA]-[SFS]` dele**;
caso contrário, derive uma sigla de 3 letras para o Feature Set, formando o ID
`[SIGLA]-[SFS]` (e proponha incluí-lo no N1). Então pergunte, em um bloco:

> 1. Qual o nome da entidade que será cadastrada (ex.: Fundo Gerido, Cliente)?
> 2. Em 2-3 frases, o que este cadastro permite fazer? E o que ele
>    explicitamente **não** faz (onde termina o escopo)?
> 3. Qual campo identifica unicamente cada registro (ex.: ISIN, CNPJ, código)?

---

## PASSO 2 — `[COLETA_CAMPOS]`

Peça a tabela de campos da entidade — esta é a coleta central do atalho:

> 4. Liste os campos do cadastro. Para cada um: **nome em português**, **tipo**
>    (texto, número, data, lista de opções, sim/não, arquivo, ou seleção de
>    outro cadastro) e se é **obrigatório**. Indique qual é **único**.
>
> 5. Algum campo é preenchido **automaticamente** pelo sistema? Qual e quando?

Ao receber os campos:
- Identifique os **canônicos** e aplique o FIELD-DICTIONARY automaticamente;
  pergunte apenas o que o dicionário deixa em aberto (obrigatoriedade, unicidade).
- Para campos escolhidos a partir de **outro cadastro**, trate-os como
  **campo de seleção** (`seleção → [Entidade]`) — siga as regras de "Campos de
  seleção" do PROMPT_3A_N3_negocio.md (PASSO 1.5).
- O campo identificador único (PASSO 1, pergunta 3) será **somente leitura na
  Edição** e o critério de identificação na Exclusão.

---

## PASSO 3 — `[COLETA_POLITICA_CRUD]`

Faça apenas as perguntas que a tabela de campos não responde e que valem para
o Feature Set inteiro:

> 6. **Exclusão**: é **física** (remove do banco) ou **lógica** (marca como
>    inativo/arquivado, mantendo o registro)?
> 7. **Vínculos**: o registro pode estar vinculado a outros no sistema? Se sim,
>    o que deve acontecer ao tentar excluir um registro com vínculos?
>    (→ regra canônica "registro vinculado não pode ser excluído", se aplicável)
> 8. **Permissões** (fonte única do projeto): quais **perfis** existem e, para
>    **cada operação** (pesquisar, cadastrar, editar, excluir, visualizar), quais
>    perfis podem executá-la? Descreva em linguagem de negócio.
> 9. **Pesquisa**: há ordenação padrão, carga inicial (ex.: últimos N registros)
>    ou limite de resultados?
> 10. Esta entidade precisa ficar registrada no **histórico de auditoria**? (sim/não —
>     servirá para o 3B preencher a seção AuditLog; não vira regra de negócio)

---

## PASSO 4 — `[GERACAO_N2]`

Monte a tabela de Features na ordem da jornada e atribua IDs sequenciais
`[SIGLA]-[SFS]-NN`:

| Ordem | Feature | Arquivo |
|---|---|---|
| 01 | Pesquisar [Entidade] | `f-pesquisar.md` |
| 02 | Cadastrar [Entidade] | `f-cadastrar.md` |
| 03 | Editar [Entidade] | `f-editar.md` |
| 04 | Excluir [Entidade] | `f-excluir.md` |
| 05 | Visualizar [Entidade] | `f-visualizar.md` |

Gere o N2 — **exatamente esta estrutura**, idêntica à do PROMPT_2A:

📄 `modules/[dominio]/[feature-set]/README.md`

```
# Feature Set: [Nome do Feature Set]
> **Nível 2** - Domínio: [Nome do Domínio] - `[SIGLA]-[SFS]`

## Descrição
[2-3 frases sobre o que o cadastro faz]

**Não faz**: [o que está fora do escopo]

---

## Features

| Feature | Arquivo de Especificação (N3) | Descrição |
|---|---|---|
| **Pesquisar [Entidade]** <small>[SIGLA]-[SFS]-01</small> | [f-pesquisar.md](f-pesquisar.md) | [uma linha] |
| **Cadastrar [Entidade]** <small>[SIGLA]-[SFS]-02</small> | [f-cadastrar.md](f-cadastrar.md) | [uma linha] |
| **Editar [Entidade]** <small>[SIGLA]-[SFS]-03</small> | [f-editar.md](f-editar.md) | [uma linha] |
| **Excluir [Entidade]** <small>[SIGLA]-[SFS]-04</small> | [f-excluir.md](f-excluir.md) | [uma linha] |
| **Visualizar [Entidade]** <small>[SIGLA]-[SFS]-05</small> | [f-visualizar.md](f-visualizar.md) | [uma linha] |

---

## Fluxo Principal

[esqueleto canônico do tipo CRUD — copie o diagrama da "Regra do Fluxo principal
(CRUD)" logo abaixo deste bloco e apenas substitua {Entidade}. Não redesenhe o grafo
nem acompanhe de lista numerada — a estrutura é fixa para todo CRUD]

---

## Dependências entre features

[Pesquisa é o ponto de entrada; Cadastro independe; Edição, Exclusão e
Visualização exigem um registro existente, alcançado pela Pesquisa]

---

## Telas

| Tela | Rota sugerida | Features atendidas | Descrição |
|---|---|---|---|
| Pesquisa de [Entidade] | `/[dominio]/[feature-set]` | **Pesquisar [Entidade]** <small>[SIGLA]-[SFS]-01</small><br>**Excluir [Entidade]** <small>[SIGLA]-[SFS]-04</small> | listagem + filtros; origem das ações |
| Cadastrar [Entidade] | `/[dominio]/[feature-set]/novo` | **Cadastrar [Entidade]** <small>[SIGLA]-[SFS]-02</small> | formulário de cadastro |
| Editar [Entidade] | `/[dominio]/[feature-set]/:id/editar` | **Editar [Entidade]** <small>[SIGLA]-[SFS]-03</small> | mesmo formulário em modo edição |
| Visualizar [Entidade] | `/[dominio]/[feature-set]/:id` | **Visualizar [Entidade]** <small>[SIGLA]-[SFS]-05</small> | ficha somente leitura |

> Rotas determinísticas conforme `global/ROUTING.md`: `[feature-set]` é o slug da
> pasta sem o prefixo `g-`. Exclusão não tem rota (ação em tela, da listagem).

---

## Permissões por perfil

> **Fonte única de permissões** deste Feature Set.

| Perfil | Pesquisar | Cadastrar | Editar | Excluir | Visualizar |
|---|---|---|---|---|---|
| [perfil 1] | ✓ | ✓ | ✓ | — | ✓ |
| [perfil 2] | ✓ | ✓ | ✓ | ✓ | ✓ |
| [perfil 3] | ✓ | — | — | — | ✓ |

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| [data atual] | [Claude / autor] | N2 criado | Gerado pelo PROMPT CRUD |

---

*Links: [N1 [Nome do Domínio]](../README.md) · [INDEX geral](../../INDEX.md)*
```

> **Regra do Fluxo principal (CRUD)** — O `## Fluxo Principal` do CRUD é um
> **esqueleto canônico fixo**: copie o diagrama abaixo e apenas troque `{Entidade}`
> pelo nome da entidade. **Não** redesenhe os nós nem as setas — a estrutura é a mesma
> para todo CRUD, o que torna o fluxo determinístico e idêntico entre features do mesmo
> tipo, independente da LLM. O diagrama é a única representação do fluxo (sem lista
> numerada) e, como todo fluxo principal de N2, é **só para frente**: todos os ramos
> da decisão convergem para o nó final `Z`, **sem caminho de volta** (sem loops nem
> retorno a etapas anteriores). Vale a syntax da "Regra do Fluxo principal" do
> PROMPT_2A: nós entre aspas duplas; rótulos de seta sem aspas e sem `/`, `(` ou `)`.
>
> ```mermaid
> flowchart TD
>     A(["Usuário acessa a listagem de {Entidade}"]) --> B["Pesquisar {Entidade}"]
>     B --> C{"Qual ação?"}
>     C -->|Cadastrar novo| D["Cadastrar {Entidade}"]
>     C -->|Selecionar registro| E{"Ação sobre o registro"}
>     E -->|Visualizar| F["Visualizar {Entidade}"]
>     E -->|Editar| G["Editar {Entidade}"]
>     E -->|Excluir| H["Excluir {Entidade}"]
>     D --> Z(["{Entidade} atualizada"])
>     G --> Z
>     H --> Z
>     F --> Z
> ```

> **Regra das Permissões** — A seção `## Permissões por perfil` **sempre** é uma
> **tabela Markdown** (perfis nas linhas × as cinco operações nas colunas).
> Células: `✓` para "pode executar" e `—` para "não pode". Nunca use listas ou
> texto corrido; notas de detalhe vão em bullets **após** a tabela.

Apresente e pergunte:
> "O N2 do Feature Set está correto? Ajusta algo ou avanço para gerar os N3?"

Aguarde aprovação antes do PASSO 5.

---

## PASSO 5 — `[GERACAO_N3_CADASTRO]`

Gere o N3 de **Cadastro** — a fonte canônica das demais operações. Use os campos
do PASSO 2 e siga **exatamente** a estrutura negocial do PROMPT_3A (PASSO 3):
Descrição · Superfície · Regras de negócio · Cenários · Campos · Campos
automáticos · Comportamento de tela · Changelog.

📄 `modules/[dominio]/[feature-set]/f-cadastrar.md` (ID `[SIGLA]-[SFS]-02`)

- **Superfície**: Tela própria — Cadastrar [Entidade] (`/[dominio]/[feature-set]/novo`), acessada da Pesquisa.
- O campo identificador único entra como obrigatório e **único**.
- Cenários Gherkin: caminho feliz + duplicidade do campo único + baseline de
  validação (obrigatório/formato via marcadores de dicionário).

Apresente e pergunte:
> "O N3 de Cadastro está correto? Posso derivar Pesquisa, Edição, Exclusão e Visualização a partir dele?"

Aguarde aprovação antes do PASSO 6.

---

## PASSO 6 — `[DERIVACAO_N3_DEMAIS]`

Derive os quatro N3 restantes a partir do N3 de Cadastro recém-aprovado,
aplicando as **regras de derivação do PROMPT_3A_N3_negocio.md (PASSO 1.5)** —
não as reproduza de memória; trate o N3 de Cadastro como o "N3 de cadastro
fornecido" daquele passo. Gere um por vez, aguardando aprovação entre eles:

1. 📄 `f-pesquisar.md` (`...-01`) — **Derivação para Pesquisa / Listagem**:
   filtros mapeados por tipo de campo + colunas do resultado (máx. 6). Aplique a
   ordenação/carga/limite da pergunta 9. Superfície: **Tela própria** — Pesquisa
   de [Entidade] (`/[dominio]/[feature-set]`).

2. 📄 `f-editar.md` (`...-03`) — **Derivação para Edição**: mesmo formulário do
   cadastro; identificador único **somente leitura**; campos automáticos mantidos.
   Superfície: **Tela própria** — Editar [Entidade] (`/[dominio]/[feature-set]/:id/editar`).

3. 📄 `f-excluir.md` (`...-04`) — **Derivação para Exclusão**: identificação pelo
   campo único + confirmação explícita; aplique a política física/lógica
   (pergunta 6) e o tratamento de vínculos (pergunta 7). Superfície: **Ação em
   tela**, disparada da listagem (origem: Pesquisar [Entidade]).

4. 📄 `f-visualizar.md` (`...-05`) — **Derivação para Visualização**: todos os
   campos do cadastro em **somente leitura** (nenhum editável, sem ações de
   gravação); sem auditoria (é leitura). Superfície: **Tela própria** — Visualizar
   [Entidade] (`/[dominio]/[feature-set]/:id`).

Cada N3 derivado segue a mesma estrutura negocial do PROMPT_3A (PASSO 3). Não
repita as perguntas de campos já coletadas — informe o que foi derivado e peça
apenas confirmação ou ajustes.

---

## PASSO 7 — `[REVISAO_CONSISTENCIA]`

Com as cinco features aprovadas, rode a revisão de consistência do Feature Set:

```
[ ] As 5 features do N2 têm N3 correspondente?
[ ] Label PO é idêntico entre N2 e os cinco N3?
[ ] O identificador único é único no Cadastro, somente leitura na Edição/Visualização
    e critério de identificação na Exclusão?
[ ] As permissões estão só no N2 (nenhum N3 trata de permissão)?
[ ] As rotas das telas não conflitam entre si?
[ ] Campos e regras canônicas estão referenciados pelos dicionários?
```

Se o N1 do domínio foi fornecido, verifique se o Feature Set consta na tabela de
Feature Sets do N1 (e no `modules/INDEX.md`) **com o nome em link para o README do
N2** — `[Nome](./[feature-set]/README.md)`; se faltar a entrada ou o link, inclua-o
(e ajuste a linha `*Links: ...*` do N1). Proponha a atualização e aguarde aprovação
antes de gravar.

Encerre:
> "Feature Set CRUD concluído (N2 + 5 N3 negociais). Para complementar a parte
> técnica e atualizar o data-model, use o **3B** passando cada N3 como contexto."

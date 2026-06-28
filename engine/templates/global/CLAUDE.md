# CLAUDE.md
> **Índice de contexto da instância.** Copie este arquivo para a **raiz do
> repositório de documentação** do seu projeto (a instância — não para dentro de
> `engine/`). O Claude Code o lê automaticamente no início de **toda** sessão, de
> modo que o agente sempre carrega o contexto do projeto sem precisar colá-lo.
>
> Mantenha-o **enxuto**: ele é um índice, não uma cópia. Os arquivos pesados
> (dicionários, data-models, árvore de `modules/`) são lidos **sob demanda** pela
> skill `analista-requisitos` — não os importe todos aqui para não inflar o contexto.

---

## Identificação do projeto

- **Sigla**: [sigla do sistema — 5 letras maiúsculas, ex.: SIGEF]
- **Nome**: [nome do sistema por extenso]
- **Descrição**: [descrição em uma frase]
- **Repositório de docs**: [nome-docs] (este repositório — a instância)

Este repositório é uma **instância do framework `doc-template`**: contém a
documentação específica deste sistema (N0–N3, dicionários, data-models) e consome
os prompts/templates do `doc-template-engine` mais a skill `analista-requisitos`.

---

## Contexto sempre carregado

Os arquivos abaixo entram no contexto automaticamente a cada sessão (sintaxe de
import do Claude Code). Ajuste a lista ao que existir na instância:

@global/MASTER.md
@global/N0_PRODUCT_VISION.md
@modules/INDEX.md

> Os demais arquivos de contexto — `global/DATA-MODEL.md`, `global/data-models/`,
> os dicionários (`FIELD`/`RULES`/`MESSAGE`/`ERROR`), `global/NFR.md` e os N1/N2/N3
> em `modules/` — **não** são importados aqui: a skill os lê do disco sob demanda,
> conforme a etapa da sessão.

---

## Regras da instância

- A documentação gerada vai sempre para `modules/`, `global/`, `prototypes/`,
  `repos/` — **nunca** para dentro de `engine/` (somente-leitura).
- **Sempre que a sessão envolver especificação de requisitos** — N0/N1/N2/N3,
  feature, feature set, domínio, CRUD, wizard, campos/regras de negócio, cenários
  Gherkin, dicionários, ou qualquer `PROMPT_*` de especificação — **acione a skill
  `analista-requisitos` antes de responder** e siga o roteiro do prompt
  correspondente em `engine/prompts/`. Não conduza a especificação "na mão".
  > Reforço necessário em modelos menores (ex.: Haiku), que acionam skills por
  > descrição de forma menos agressiva. Se mesmo assim a skill não aparecer ao
  > digitar `/`, ela não foi instalada nesta instância — rode o
  > `scripts/install-skill.sh` do `doc-template-engine`.
- **Ao gerar ou atualizar qualquer artefato**, carimbe-o: a primeira linha deve ser
  o comentário invisível `<!-- doc-template-engine: <versão de engine/VERSION> | prompt:
  <PROMPT_ID> | atualizado: <YYYY-MM-DD> -->`. Em updates, reescreva o carimbo (não
  duplique). É invisível ao leitor do documento; serve para auditar com que versão do
  framework o artefato foi produzido. Ver `engine/VERSIONING.md`.
- [Demais convenções específicas deste projeto que valham para toda sessão.]

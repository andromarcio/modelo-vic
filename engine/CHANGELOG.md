# Changelog do doc-template-engine

Registro de evolução do **motor do framework** (prompts + templates + skill).
Segue [SemVer](https://semver.org/lang/pt-BR/): MAJOR para mudanças que quebram a
estrutura dos artefatos já gerados, MINOR para novos prompts/templates/seções
compatíveis, PATCH para correções e ajustes redacionais.

> A versão vigente vive em [`VERSION`](./VERSION) — **fonte única da verdade**.
> Nenhum prompt ou template embute o número literal: todos leem `VERSION` no
> momento da geração e carimbam o artefato (ver [`VERSIONING.md`](./VERSIONING.md)).

---

## [1.0.0] — 2026-06-23

### Adicionado

- Conjunto inicial de prompts de especificação (`PROMPT_0` a `PROMPT_4B`,
  CRUD, WIZARD, auditorias, contagem APF, SDD, QA, prototipagem, etc.).
- Templates de N0/N1/N2/N3, dicionários (FIELD/RULES/ERROR/MESSAGE),
  data-models, INDEX, repos e backlog.
- Skill `analista-requisitos` com persona, regras absolutas e roteamento de prompts.
- Política de versionamento e carimbo invisível de artefatos (`VERSIONING.md`).
- Conteúdo de exemplo (domínio **Clientes**) alinhado aos templates desta versão.

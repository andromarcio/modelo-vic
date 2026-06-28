# MASTER.md
> Arquivo de contexto global, independente do módulo ou nível em trabalho.
> No Claude Code é carregado automaticamente a cada sessão via o `CLAUDE.md` da
> instância (ver `global/CLAUDE.md`); no fluxo copy-paste/CLI, cole-o em toda sessão.

---

## Identificação do sistema

- **Sigla**: [sigla do sistema — 5 letras maiúsculas, ex.: SIGEF]
- **Nome**: [nome do sistema por extenso — ex.: Sistema de Gestão de Fundos]
- **Descrição**: [descrição em uma frase]
- **Versão atual**: [a definir]
- **Repositório de docs**: [nome-docs] (este repositório)

> A **sigla do sistema** (5 letras) identifica o produto como um todo e é **distinta** da
> `[SIGLA]` de **domínio** (3 letras, usada nos IDs `[SIGLA]-[SFS]-[NN]`) descrita
> na seção *Identificadores únicos* abaixo.

---

## Stack técnica

- **Frontend**: [framework, linguagem, design-system]
- **Backend**: [framework, linguagem]
- **Banco de dados**: [SGBD]
- **Autenticação**: [mecanismo]
- **Fila / Jobs**: [a definir] ⚠️
- **Storage**: [a definir] ⚠️
- **E-mail**: [a definir] ⚠️
- **Integrações externas**: [a definir] ⚠️

---

## Repositórios do sistema

| Repositório | Responsabilidade |
|---|---|
| [nome-backend] | API REST, regras de negócio |
| [nome-frontend] | Interface web |
| [nome-docs] | Documentação e especificações (este repo) |

---

## Convenções de código

### Nomenclatura
- Rotas de API: kebab-case (ex.: `/recurso-exemplo`)
- Tabelas/colunas do banco: [snake_case / UPPER_SNAKE_CASE], em português ⚠️ *(confirmar padrão da organização)*
- [demais convenções de classes, arquivos e testes conforme a stack escolhida]

### Frontend
- [regras de tipagem, lint e modelos — ex.: `strict`, proibir `any`, DTOs a partir do contrato da API]

### Backend
- [regras de persistência, validação de entrada e separação DTO ⟷ entidade]

### Estrutura de pastas ⚠️ *(exemplo — ajustar à organização do projeto)*
```
[nome-frontend]/
  [estrutura por camada/feature]

[nome-backend]/
  [estrutura por camada/módulo]
```

---

## Identificadores únicos (IDs)

Cada nível da hierarquia de documentação possui um ID único para rastreabilidade
entre ferramentas externas (Jira, Azure DevOps, etc.).

| Nível | Formato | Exemplo |
|---|---|---|
| História de usuário (entrada) | chave do **ServiceNow** — origem externa, **não gerada aqui**; é a fonte de verdade da história | `STRY0012345` |
| Domínio (N1) | `[SIGLA]` — sigla do domínio (sempre 3 letras maiúsculas) definida na criação do domínio | `CRM` |
| Feature Set (N2) | `[SIGLA]-[SFS]` — sigla do domínio + sigla do Feature Set (sempre 3 letras maiúsculas) | `CRM-CLI` |
| Feature (N3) | `[SIGLA]-[SFS]-[NN]` — 2 dígitos sequenciais dentro do Feature Set | `CRM-CLI-01` |

**Regras:**
- A história de usuário entra pelo ServiceNow; o framework **referencia** a chave (nunca cria ID próprio para a história) e a registra na seção `## Origem` do N3
- A sigla do domínio é definida uma única vez na criação do N1 e nunca alterada
- A sigla do Feature Set é definida **no N1** (ao listar os Feature Sets do domínio) e **reutilizada** pelo N2; é única dentro do domínio e nunca reutilizada após exclusão; deriva do nome do Feature Set (ex.: Usuários → `USR`)
- A numeração de Features é sequencial dentro do Feature Set e não reutilizada após exclusão
- O ID fica no cabeçalho de cada artefato, logo abaixo da linha `**Nível X**`

### Rastreabilidade ponta a ponta (história → spec → código)

Todo desenvolvimento começa por uma história de usuário no ServiceNow e é
rastreável até o código pela cadeia de IDs:

```
História (ServiceNow STRYxxxxxxx)
   └─ N3 Feature (SIGLA-SFS-NN)  ← seção "Origem" guarda a chave da história
        └─ Código (commit/PR)    ← referencia ambos os IDs
```

- **História → N3**: a chave do ServiceNow é registrada na seção `## Origem` de
  cada feature; o elo recíproco fica em `modules/_backlog/[chave].md`. Cada
  critério de aceite é analisado e vira uma regra de negócio, um `## Cenário`
  (Gherkin) ou ambos — rastreabilidade semântica, não só por ID.
- **N3 → código**: seção `## Implementação` do N3 (repositório + caminho) +
  coluna na tabela `Rastreabilidade` do `modules/INDEX.md`.
- **Convenção de commit/PR** *(fecha a cadeia no git)*:
  `tipo([SIGLA]-[SFS]-[NN]): [resumo] (ServiceNow [STRYxxxxxxx])`

---

## Nomenclatura de features

Features são nomeadas sempre no **infinitivo**, seguindo o padrão:

**`Verbo + Entidade + Complemento (quando necessário)`**

| Regra | Exemplo |
|---|---|
| Criação | `Cadastrar Cliente` |
| Edição | `Editar Endereço de Entrega` |
| Exclusão | `Excluir Produto` |
| Listagem sem filtro | `Listar Pedidos` |
| Listagem com filtro | `Pesquisar Pedidos` |
| Ação específica | `Aprovar Solicitação de Crédito` |

**Regras:**
- Sempre infinitivo — nunca substantivo (`Cadastro de Cliente` ❌) nem gerúndio (`Cadastrando Cliente` ❌)
- Listagens que exibem apenas a lista, sem opções de filtro → verbo **Listar**
- Listagens que possuem campos de filtro ou busca → verbo **Pesquisar**
- Complemento é opcional — usar apenas quando necessário para distinguir features de mesma entidade

---

## Nomenclatura de entidades e campos

Entidades e campos são nomeados em **português**. A nomenclatura de campos segue
três camadas com responsabilidades distintas.
**A única fonte de verdade para Label Dev e campo banco é o `global/DATA-MODEL.md`.**
Os N3 usam apenas Label PO — nunca duplicam as camadas técnicas.

| Camada | Convenção | Exemplo | Onde aparece |
|---|---|---|---|
| Entidade | PascalCase singular, português | `ModeloEmail` | DATA-MODEL.md, data-models/[dominio].md (cabeçalho) |
| Label PO | Português, title case, sem jargão | `Nome completo` | N3 (tabela de campos), Gherkin, telas |
| Label Dev | camelCase, português, autoexplicativo | `nomeCompleto` | DATA-MODEL.md, código, API |
| Campo banco | snake_case, português ⚠️ | `nome_completo` | DATA-MODEL.md, migrations, ORM |

> ⚠️ Entidades e campos são nomeados em **português**. Confirme apenas a caixa
> dos identificadores do banco (snake_case vs. UPPER_SNAKE_CASE) antes de gerar
> N1/N3. Em engenharia reversa de bases legadas, transcreva os identificadores
> como estão na origem (podem estar em inglês) — não os traduza.

---

## Campos globais obrigatórios em toda tabela

> **Decisões do projeto a confirmar**: multitenancy (sim/não), estratégia de PK
> (sequence / UUID / outra), tipos do SGBD, e exclusão física vs. **lógica** (soft
> delete via `deletedAt`). Ajuste a tabela abaixo conforme as decisões tomadas.

| Label Dev | Campo banco | Tipo | Notas |
|---|---|---|---|
| id | id | [tipo PK] | PK; gerada automaticamente |
| createdAt | created_at | [timestamp] | Gerado automaticamente |
| updatedAt | updated_at | [timestamp] | Atualizado automaticamente |
| deletedAt | deleted_at | [timestamp] | Soft delete (exclusão lógica); null = ativo |

---

## Decisões transversais

> ⚠️ Itens marcados dependem de decisão do projeto.

1. **Exclusão**: [física / lógica (soft delete via `deletedAt`)] ⚠️
2. **IDs em URLs**: não expor o identificador interno (PK); usar a chave de negócio quando aplicável.
3. **Paginação**: [cursor-based / offset] e limites ⚠️
4. **Validação**: no frontend e no backend — nunca confiar apenas no client.
5. **Auditoria**: ações críticas sempre registradas em log de auditoria.
6. **Eventos internos**: [mensageria / chamadas diretas] ⚠️

---

## Padrão de resposta de API

```typescript
// Sucesso com dado único
{ "data": { ...objeto }, "meta": null }

// Sucesso com lista
{ "data": [...], "meta": { "total": 0, "nextCursor": null, "prevCursor": null } }

// Erro
{ "data": null, "error": { "code": "ENTIDADE_ERRO", "message": "...", "details": [] } }
```

---

## O que NUNCA fazer

- Expor o identificador interno (PK) em URLs ou respostas — usar a chave de negócio
- Retornar senhas ou tokens em respostas, mesmo hasheados
- Lançar exceções cruas — sempre retornar envelope de erro padronizado
- Duplicar Label Dev ou campo banco nos N3 — essas informações vivem apenas no DATA-MODEL.md
- [demais proibições específicas da stack — ex.: `any` no TypeScript, remoção física se a exclusão é lógica]

---

## Arquivos globais de referência

| Arquivo | Propósito |
|---|---|
| `CLAUDE.md` (raiz) | Índice de contexto carregado a cada sessão no Claude Code |
| `global/MASTER.md` | Stack, convenções globais (este arquivo) |
| `global/DATA-MODEL.md` | Índice de entidades + campos globais + enums |
| `global/SIZING.md` | Convenções de contagem APF e COSMIC |
| `global/RULES-DICTIONARY.md` | Regras de negócio canônicas |
| `global/FIELD-DICTIONARY.md` | Campos canônicos (CPF, CEP, e-mail…) |
| `global/MESSAGE-DICTIONARY.md` | Mensagens de UI genéricas + baseline de validação |
| `global/ERROR-DICTIONARY.md` | Fonte única de códigos de erro |
| `global/API-PATTERNS.md` | Padrões de API |
| `global/DESIGN-SYSTEM.md` | Padrões de UI |

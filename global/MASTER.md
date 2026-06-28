<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_0 | atualizado: 2026-06-23 -->
# MASTER.md
> Arquivo de contexto global, independente do módulo ou nível em trabalho.
> No Claude Code é carregado automaticamente a cada sessão via o `CLAUDE.md` da
> instância; no fluxo copy-paste/CLI, cole-o em toda sessão.
>
> ℹ️ **Conteúdo de exemplo (genérico)** — ajuste à stack e às convenções reais do projeto.

---

## Identificação do sistema

- **Sigla**: `CADCL` (sigla do sistema — 5 letras; exemplo)
- **Nome**: Cadastro de Clientes (exemplo)
- **Descrição**: base cadastral única de clientes pessoa física, fonte de identidade para os demais domínios.
- **Versão atual**: [a definir]
- **Repositório de docs**: doc-pages (este repositório)

> A **sigla do sistema** (5 letras) identifica o produto como um todo e é **distinta** da
> `[SIGLA]` de **domínio** (3 letras, usada nos IDs `[SIGLA]-[SFS]-[NN]`) descrita
> na seção *Identificadores únicos* abaixo.

---

## Stack técnica

- **Frontend**: Angular / TypeScript (modo estrito) · CAIXA Design System
- **Backend**: Java 17 / Quarkus
- **Banco de dados**: Oracle
- **Autenticação**: SSO corporativo (sem base de senhas própria)
- **Fila / Jobs**: [a definir] ⚠️
- **Storage**: [a definir] ⚠️
- **E-mail**: [a definir] ⚠️
- **Integrações externas**: [a definir] ⚠️

---

## Repositórios do sistema

| Repositório | Responsabilidade |
|---|---|
| projeto-backend | API REST, regras de negócio |
| projeto-frontend | Interface web |
| projeto-doc | Documentação e especificações (este repo) |

---

## Convenções de código

### Nomenclatura
- Rotas de API: kebab-case (ex.: `/clientes`)
- Tabelas/colunas do banco: snake_case, em português ⚠️ *(confirmar caixa com a organização)*
- Classes Java: PascalCase; métodos e variáveis: camelCase.

### Frontend
- TypeScript em modo `strict`; proibir `any`; DTOs derivados do contrato da API.

### Backend
- Separação DTO ⟷ entidade; validação de entrada no recebimento; nunca confiar apenas no client.

---

## Identificadores únicos (IDs)

Cada nível da hierarquia de documentação possui um ID único para rastreabilidade
entre ferramentas externas (ServiceNow, etc.).

| Nível | Formato | Exemplo |
|---|---|---|
| História de usuário (entrada) | chave do **ServiceNow** — origem externa, **não gerada aqui**; é a fonte de verdade da história | `STRY0012345` |
| Domínio (N1) | `[SIGLA]` — sigla do domínio (sempre 3 letras maiúsculas) definida na criação do domínio | `CLI` |
| Feature Set (N2) | `[SIGLA]-[SFS]` — sigla do domínio + sigla do Feature Set (sempre 3 letras maiúsculas) | `CLI-GES` |
| Feature (N3) | `[SIGLA]-[SFS]-[NN]` — 2 dígitos sequenciais dentro do Feature Set | `CLI-GES-01` |

**Regras:**
- A história de usuário entra pelo ServiceNow; o framework **referencia** a chave (nunca cria ID próprio para a história) e a registra na seção `## Origem` do N3.
- A sigla do domínio é definida uma única vez na criação do N1 e nunca alterada.
- A sigla do Feature Set é definida **no N1** (ao listar os Feature Sets do domínio) e **reutilizada** pelo N2; é única dentro do domínio e nunca reutilizada após exclusão; deriva do nome do Feature Set (ex.: Gestão de Clientes → `GES`).
- A numeração de Features é sequencial dentro do Feature Set e não reutilizada após exclusão.
- O ID fica no cabeçalho de cada artefato, logo abaixo da linha `**Nível X**`.

### Rastreabilidade ponta a ponta (história → spec → código)

```
História (ServiceNow STRYxxxxxxx)
   └─ N3 Feature (SIGLA-SFS-NN)  ← seção "Origem" guarda a chave da história
        └─ Código (commit/PR)    ← referencia ambos os IDs
```

- **História → N3**: a chave do ServiceNow é registrada na seção `## Origem` de cada feature; o elo recíproco fica em `modules/_backlog/[chave].md`.
- **N3 → código**: seção `## Implementação` do N3 (repositório + caminho) + coluna na tabela `Rastreabilidade` do `modules/INDEX.md`.
- **Convenção de commit/PR**: `tipo([SIGLA]-[SFS]-[NN]): [resumo] (ServiceNow [STRYxxxxxxx])`.

---

## Nomenclatura de features

Features são nomeadas sempre no **infinitivo**: `Verbo + Entidade + Complemento`.

| Regra | Exemplo |
|---|---|
| Criação | `Cadastrar Cliente` |
| Edição | `Editar Cliente` |
| Exclusão | `Excluir Cliente` |
| Listagem sem filtro | `Listar Clientes` |
| Listagem com filtro | `Pesquisar Clientes` |

**Regras:**
- Sempre infinitivo — nunca substantivo (`Cadastro de Cliente` ❌) nem gerúndio (`Cadastrando Cliente` ❌).
- Listagem só com a lista, sem filtro → verbo **Listar**; com filtros/busca → verbo **Pesquisar**.
- Complemento opcional — usar apenas para distinguir features da mesma entidade.

---

## Nomenclatura de entidades e campos

Entidades e campos são nomeados em **português**, em três camadas.
**A única fonte de verdade para Label Dev e campo banco é o `global/DATA-MODEL.md`.**
Os N3 usam apenas Label PO — nunca duplicam as camadas técnicas.

| Camada | Convenção | Exemplo | Onde aparece |
|---|---|---|---|
| Entidade | PascalCase singular, português | `Cliente` | DATA-MODEL.md, data-models/[dominio].md (cabeçalho) |
| Label PO | Português, title case, sem jargão | `Nome completo` | N3 (tabela de campos), Gherkin, telas |
| Label Dev | camelCase, português, autoexplicativo | `nomeCompleto` | DATA-MODEL.md, código, API |
| Campo banco | snake_case, português ⚠️ | `nome_completo` | DATA-MODEL.md, migrations, ORM |

> ⚠️ Confirme apenas a caixa dos identificadores do banco (snake_case vs. UPPER_SNAKE_CASE)
> antes de gerar N1/N3. Em engenharia reversa de bases legadas, transcreva os
> identificadores como estão na origem — não os traduza.

---

## Campos globais obrigatórios em toda tabela

| Label Dev | Campo banco | Tipo | Notas |
|---|---|---|---|
| id | id | NUMBER (sequence) | PK; gerada automaticamente |
| createdAt | created_at | TIMESTAMP WITH TIME ZONE | Gerado automaticamente |
| updatedAt | updated_at | TIMESTAMP WITH TIME ZONE | Atualizado automaticamente |
| deletedAt | deleted_at | TIMESTAMP WITH TIME ZONE | Soft delete (exclusão lógica); null = ativo |

---

## Decisões transversais

1. **Exclusão**: lógica (soft delete via `deletedAt`) — registros não são removidos fisicamente.
2. **IDs em URLs**: não expor o identificador interno (PK); usar a chave de negócio (CPF) quando aplicável.
3. **Paginação**: cursor-based ⚠️ *(confirmar)*.
4. **Validação**: no frontend e no backend — nunca confiar apenas no client.
5. **Auditoria**: ações críticas sempre registradas em log de auditoria.
6. **Eventos internos**: chamadas diretas ⚠️ *(sem mensageria nesta versão)*.

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

- Expor o identificador interno (PK) em URLs ou respostas — usar a chave de negócio (CPF).
- Retornar senhas ou tokens em respostas, mesmo hasheados.
- Lançar exceções cruas — sempre retornar o envelope de erro padronizado.
- Duplicar Label Dev ou campo banco nos N3 — essas informações vivem apenas no DATA-MODEL.md.
- Remoção física de registros quando a exclusão é lógica.

---

## Arquivos globais de referência

| Arquivo | Propósito |
|---|---|
| `CLAUDE.md` (raiz) | Índice de contexto carregado a cada sessão no Claude Code |
| `global/MASTER.md` | Stack, convenções globais (este arquivo) |
| `global/DATA-MODEL.md` | Índice de entidades + campos globais + enums |
| `global/RULES-DICTIONARY.md` | Regras de negócio canônicas |
| `global/FIELD-DICTIONARY.md` | Campos canônicos (CPF, CEP, e-mail…) |
| `global/MESSAGE-DICTIONARY.md` | Mensagens de UI genéricas + baseline de validação |
| `global/ERROR-DICTIONARY.md` | Fonte única de códigos de erro |

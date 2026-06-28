<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_3B | atualizado: 2026-06-23 -->
<!--
  CONVENÇÃO DE VISIBILIDADE
  ─────────────────────────────────────────────────────────────────
  Blocos <div class="dev-only"> contêm detalhes técnicos.
  Versão PO  → CSS: .dev-only { display: none; }
  Versão DEV → sem CSS adicional
  ─────────────────────────────────────────────────────────────────
-->

# Pesquisar Clientes
> **Nível 3** - Feature Set: Gestão de Clientes — Domínio: Clientes - `CLI-GES-02`

## Descrição
Permite ao usuário pesquisar e filtrar os clientes cadastrados por Nome, CPF ou E-mail.

---

## Origem

| História (ServiceNow) | Tipo | Critérios cobertos |
|---|---|---|
| — ⚠️ | Criação | Sem história vinculada neste exemplo genérico |

---

## Superfície

**Tela própria** — Pesquisar Clientes (`/clientes`). Tela inicial do Feature Set.

---

## Regras de negócio

1. A pesquisa considera apenas registros **ativos** (não excluídos logicamente).
2. Sem filtros aplicados, a tela exibe os últimos registros cadastrados (lista padrão).
3. A busca por Nome é parcial (contém); CPF e E-mail são correspondência exata/parcial conforme o filtro.

---

## Cenários

```gherkin
Feature: Pesquisar Clientes

  # ── Caminho feliz ──────────────────────────────────────────────

  Scenario: Pesquisa por nome retorna resultados
    Given que existem clientes cadastrados
    When o usuário informa parte do nome no filtro "Nome"
    And aciona a pesquisa
    Then o sistema exibe os clientes cujo nome contém o termo informado

  # ── Estados especiais ──────────────────────────────────────────

  Scenario: Pesquisa sem correspondência
    When o usuário pesquisa por um termo que não corresponde a nenhum cliente
    Then o sistema exibe: "Nenhum resultado encontrado. Ajuste os filtros e tente novamente."
```

---

## Campos

| Label PO | Tipo | Obrigatório | Validação |
|---|---|---|---|
| Nome | texto | não | Busca parcial (contém) |
| CPF | texto (com máscara) | não | → ver FIELD-DICTIONARY: CPF (apenas formato) |
| E-mail | texto | não | Busca parcial (contém) |

*Todos os filtros são opcionais; quando vazios, retorna a lista padrão.*

---

## Campos automáticos

| Label PO | Valor | Quando |
|---|---|---|
| — | — | (não há campos automáticos nesta feature) |

---

## Comportamento de tela

### Onde fica
Tela de listagem em página própria — **Pesquisar Clientes** (`/clientes`), tela inicial do Feature Set.

### Estados da tela

| Estado | Comportamento |
|---|---|
| Loading | Skeleton/spinner na área do grid durante a busca. |
| Erro de validação | Não se aplica (filtros opcionais). |
| Erro de servidor | "Não foi possível carregar os dados. Tente novamente." |
| Sucesso | Grid paginado; cada linha oferece **Visualizar**, **Editar** e **Excluir**. |
| Empty state | "Nenhum resultado encontrado. Ajuste os filtros e tente novamente." |

---

## Métricas de tamanho

| Função de Transação | Tipo | ALR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|
| Pesquisar Clientes | SE | 1 | 9 | Baixa | 4 | 2026-06-23 |

> **ALR** = ALIs/AIEs lidos · **DER** = filtros + campos exibidos.

<details>
<summary>Memória de cálculo (ALR e DER por transação)</summary>

- **Pesquisar Clientes** — ALR = 1 (Cliente); DER = 9 (3 filtros + 6 campos exibidos por linha) → tabela SE/CE do SIZING.md → **Baixa → 4 PF**

</details>

**Total: 4 PF**

---

<div class="dev-only">

## Mapeamento de campos
→ ver DATA-MODEL.md: Entidade **Cliente**

---

## Cenários técnicos adicionais

```gherkin
  # ── Comportamento técnico ──────────────────────────────────────

  Scenario: Paginação por cursor
    Given que existem mais clientes do que o tamanho de página
    When o cliente solicita a próxima página com o nextCursor retornado
    Then o servidor responde HTTP 200 com o próximo conjunto e novo nextCursor

  Scenario: Registros excluídos não retornam
    Given que existe cliente com deletedAt preenchido
    When a pesquisa é executada
    Then esse registro não aparece nos resultados
```

---

## Mapeamento de erros (código interno → mensagem ao usuário)

| Código | HTTP | Mensagem exibida ao usuário |
|---|---|---|
| `AUTH_FORBIDDEN` | 403 | "Você não tem permissão para esta ação." |

→ ver ERROR-DICTIONARY: AUTH_FORBIDDEN

---

## API

### GET /api/v1/clientes
**Acesso**: autenticado — roles `Atendente`, `Supervisor`, `Auditor`

**Query params**:
```typescript
{
  nome?: string         // Label PO: Nome — busca parcial
  cpf?: string          // Label PO: CPF — formato
  email?: string        // Label PO: E-mail — busca parcial
  cursor?: string       // paginação
}
// Tipos e constraints completos: ver DATA-MODEL.md: Entidade Cliente
```

**Resposta de sucesso** — HTTP 200:
```json
{
  "data": [ { "id": "uuid", "nomeCompleto": "...", "cpf": "...", "email": "...", "situacaoCadastral": "Ativo" } ],
  "meta": { "total": 0, "nextCursor": null, "prevCursor": null }
}
```

**Respostas de erro**:

| HTTP | Code | Situação |
|---|---|---|
| 403 | `AUTH_FORBIDDEN` | Perfil sem permissão |

---

## Eventos

### Publicados
| Evento | Quando | Payload | Consumidores |
|---|---|---|---|
| — | — | — | — |

### Consumidos
| Evento | Publicado por | Reação |
|---|---|---|
| — | — | — |

---

## AuditLog

Operação de **leitura** — não auditada por padrão (ver `global/NFR.md` para política de auditoria de consultas).

---

## Arquivos a criar ou alterar

```
backend/.../ClienteController.java   ← endpoint GET /api/v1/clientes (filtros + paginação)
frontend/.../pesquisar-clientes.ts   ← tela de pesquisa + grid
```

---

## Dependências

- **DATA-MODEL.md: Cliente** — fonte de verdade dos campos exibidos.

</div>

---

## Implementação

| Item | Repositório | Caminho | Branch/Tag |
|---|---|---|---|
| Endpoint GET /api/v1/clientes | projeto-backend | `.../ClienteController.java` | `main` |

**Status**: `[x] Especificado` · `[ ] Em desenvolvimento` · `[ ] Implementado` · `[ ] Deprecado`

**Rastreabilidade no git**: `feat(CLI-GES-02): pesquisar clientes (ServiceNow STRYxxxxxxx)`

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| 2026-06-23 | Exemplo | Feature criada | N3 negocial + técnico (exemplo genérico) |

---

*Feature Set: Gestão de Clientes · Domínio: Clientes · Última revisão: —*
*Links: [N2 do Feature Set](./README.md) · [N1 do domínio](../README.md) · [INDEX geral](../../INDEX.md)*

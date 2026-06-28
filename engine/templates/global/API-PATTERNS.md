<!-- doc-template-engine: {{VERSION}} | prompt: {{PROMPT_ID}} | atualizado: {{YYYY-MM-DD}} -->
# API-PATTERNS.md
> Padrões globais de API do sistema. Todo endpoint gerado deve seguir este arquivo.
> Em caso de conflito entre este arquivo e um N3, este arquivo prevalece.
>
> ℹ️ **Template do kit** — adapte à stack do projeto. Os exemplos de código são
> **ilustrativos** (Node/TS) e os domínios citados (contacts, tasks…) são apenas
> exemplos — troque pela sua stack e domínios. Confirme as decisões do projeto
> (multitenancy, tipo de PK, paginação) no `MASTER.md`.

---

## 1. Princípios gerais

- Toda API é **REST** com versionamento por prefixo de rota (`/api/v1/`)
- Toda requisição autenticada usa a sessão do **SSO corporativo** (token)
- Toda resposta tem `Content-Type: application/json`
- O identificador interno (PK) **não** é exposto em URLs/respostas — usar a **chave de negócio** quando aplicável (ex.: a chave natural da entidade)
- O servidor nunca retorna campos de senha, mesmo hasheados

---

## 2. Estrutura de resposta padrão

Toda resposta da API — sucesso ou erro — segue o mesmo envelope:

```typescript
// Sucesso com dado único
{
  "data": { ...objeto },
  "meta": null
}

// Sucesso com lista
{
  "data": [ ...objetos ],
  "meta": {
    "total": 134,
    "nextCursor": "eyJpZCI6Mn0=",  // null se não houver próxima página
    "prevCursor": null
  }
}

// Sucesso sem conteúdo (ex: DELETE)
{
  "data": { "id": "uuid-do-registro-excluído" },
  "meta": null
}

// Erro
{
  "data": null,
  "error": {
    "code": "CONTACT_NOT_FOUND",      // string screaming_snake_case
    "message": "Contact not found",   // mensagem em inglês, para logs
    "details": [                      // opcional; usado em erros de validação
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

**Regras do envelope:**
- `data` e `error` são mutuamente exclusivos — nunca os dois preenchidos
- `message` no erro é sempre em inglês (para logs e debug); a mensagem exibida ao usuário vem do frontend, mapeada pelo `code`
- `details` só aparece em erros de validação (HTTP 422)
- `meta` só aparece em listagens; é `null` em respostas de dado único

---

## 3. Códigos HTTP utilizados

| Código | Quando usar                                                              |
|--------|--------------------------------------------------------------------------|
| 200    | Sucesso geral (GET, PATCH, DELETE)                                       |
| 201    | Recurso criado com sucesso (POST)                                        |
| 204    | Sucesso sem corpo de resposta (raro; preferir 200 com `data.id`)         |
| 400    | Requisição malformada (JSON inválido, parâmetro ausente obrigatório)     |
| 401    | Não autenticado (token ausente, expirado ou inválido)                    |
| 403    | Autenticado, mas sem permissão para esta ação                            |
| 404    | Recurso não encontrado (inclusive registros soft-deleted)                |
| 409    | Conflito (ex: e-mail duplicado, slug já em uso)                          |
| 422    | Dados válidos sintaticamente, mas inválidos semanticamente (validação)   |
| 429    | Rate limit atingido                                                      |
| 500    | Erro interno — nunca expor stack trace ao cliente                        |

---

## 4. Convenção de rotas

```
/api/v1/{recurso}                     → coleção
/api/v1/{recurso}/:id                 → item individual
/api/v1/{recurso}/:id/{sub-recurso}   → sub-recurso relacionado
```

**Exemplos:**
```
GET    /api/v1/contacts               → lista contatos
POST   /api/v1/contacts               → cria contato
GET    /api/v1/contacts/:id           → detalhe do contato
PATCH  /api/v1/contacts/:id           → atualiza parcialmente
DELETE /api/v1/contacts/:id           → soft delete
GET    /api/v1/contacts/:id/tasks     → tarefas do contato
GET    /api/v1/contacts/:id/messages  → histórico de mensagens
POST   /api/v1/contacts/:id/tags      → adiciona tag ao contato
```

**Regras de nomenclatura de rotas:**
- Sempre **plural** e **kebab-case**: `/contacts`, `/smart-lists`, `/email-templates`
- Verbos são proibidos nas rotas REST: não usar `/contacts/create` ou `/contacts/search`
- Ações que não se encaixam em CRUD usam sub-rotas com verbo explícito via POST:
  ```
  POST /api/v1/contacts/:id/archive      → arquivar contato
  POST /api/v1/contacts/:id/restore      → restaurar contato arquivado
  POST /api/v1/messages/:id/resend       → reenviar mensagem
  POST /api/v1/tasks/:id/complete        → marcar tarefa como concluída
  ```

---

## 5. Paginação

Toda listagem usa **cursor-based pagination** — nunca `offset/limit`.

### Parâmetros de entrada (query string)
| Parâmetro | Tipo    | Default | Descrição                                    |
|-----------|---------|---------|----------------------------------------------|
| cursor    | string  | null    | Cursor opaco retornado pela resposta anterior |
| limit     | integer | 20      | Máximo de itens por página (teto: 100)        |

### Resposta
```json
{
  "data": [...],
  "meta": {
    "total": 134,
    "nextCursor": "eyJpZCI6MjF9",
    "prevCursor": "eyJpZCI6MX0="
  }
}
```

- `nextCursor: null` indica que não há próxima página
- O cursor é um base64 de um objeto JSON com a chave de paginação (ex: `{"id": "uuid"}`)
- O `total` reflete o total de registros do filtro aplicado, não da página

---

## 6. Filtros e busca

Filtros são passados como **query params** na rota de coleção:

```
GET /api/v1/contacts?search=joão&tag=cliente&ownerId=uuid&cursor=...
```

| Parâmetro  | Comportamento                                                      |
|------------|--------------------------------------------------------------------|
| `search`   | Busca full-text nos campos configurados da entidade (nome, email)  |
| `tag`      | Filtra por tag exata; pode ser repetido para múltiplas tags (AND)  |
| `ownerId`  | Filtra pelo responsável                                            |
| `status`   | Filtra por status/enum                                             |
| `from`     | Data de início (ISO 8601): `2024-01-01`                            |
| `to`       | Data de fim (ISO 8601): `2024-12-31`                               |
| `sort`     | Campo de ordenação: `createdAt`, `name`, `updatedAt`               |
| `order`    | Direção: `asc` \| `desc` (default: `desc`)                         |

- Parâmetros desconhecidos são **ignorados** (não retornar erro 400)
- Registros soft-deleted (`deletedAt` preenchido) são **sempre excluídos** das listagens
- A combinação de múltiplos filtros é sempre **AND**

---

## 7. Mutations (POST e PATCH)

### POST — criação
- Body em JSON com os campos do recurso
- Retorna o objeto criado completo com HTTP 201
- Campos gerados automaticamente (`id`, `createdAt`, `updatedAt`) não são aceitos no body

### PATCH — atualização parcial
- Envia **apenas os campos a alterar** (partial update)
- Campos ausentes no body não são alterados
- Não usar PUT (substituição total) — sempre PATCH
- Retorna o objeto atualizado completo com HTTP 200

### Campos imutáveis após criação
Alguns campos não podem ser alterados via PATCH após a criação.
O N3 de cada feature deve listar explicitamente quais são.
Exemplos comuns: `createdAt`, `id`, e a chave de negócio (ex.: `isin`).
Tentativa de alterar campo imutável retorna HTTP 422 com `code: FIELD_IMMUTABLE`.

---

## 8. Autenticação e autorização

### Autenticação
Toda rota protegida valida a sessão do **SSO corporativo** (token).

Se ausente ou inválido → HTTP 401:
```json
{
  "data": null,
  "error": { "code": "AUTH_UNAUTHENTICATED", "message": "Authentication required" }
}
```

### Autorização por role
Cada endpoint declara no N3 quais roles têm acesso.
Acesso negado → HTTP 403:
```json
{
  "data": null,
  "error": { "code": "AUTH_FORBIDDEN", "message": "Insufficient permissions" }
}
```

---

## 9. Convenção de códigos de erro

Formato: `DOMINIO_DESCRICAO` em screaming_snake_case.

### Erros globais (qualquer rota)
| Code                    | HTTP | Situação                                          |
|-------------------------|------|---------------------------------------------------|
| AUTH_UNAUTHENTICATED    | 401  | Token ausente ou inválido                         |
| AUTH_TOKEN_EXPIRED      | 401  | Token expirado (deve renovar via refresh)         |
| AUTH_FORBIDDEN          | 403  | Role sem permissão para esta ação                 |
| VALIDATION_ERROR        | 422  | Um ou mais campos inválidos (ver `details`)       |
| FIELD_IMMUTABLE         | 422  | Tentativa de alterar campo imutável               |
| RESOURCE_NOT_FOUND      | 404  | Recurso não encontrado (genérico)                 |
| RATE_LIMIT_EXCEEDED     | 429  | Muitas requisições                                |
| INTERNAL_ERROR          | 500  | Erro interno não tratado                          |

### Erros por domínio (exemplos — cada N3 define os seus)
| Code                    | HTTP | Domínio      | Situação                                |
|-------------------------|------|--------------|-----------------------------------------|
| AUTH_EMAIL_CONFLICT     | 409  | Identity     | E-mail já cadastrado com outro provider |
| AUTH_USER_DISABLED      | 403  | Identity     | Usuário desativado                      |
| CONTACT_NOT_FOUND       | 404  | Contacts     | Contato não encontrado                  |
| CONTACT_DUPLICATE_EMAIL | 409  | Contacts     | E-mail já existe na organização         |
| MESSAGE_SEND_FAILED     | 502  | Messaging    | Falha no serviço externo de envio       |
| TASK_ALREADY_COMPLETED  | 409  | Work         | Tarefa já foi concluída                 |
| FORM_SLUG_TAKEN         | 409  | Capture      | Slug do formulário já em uso            |

**Regra**: cada N3 define e documenta os códigos de erro específicos da sua feature.
O índice do domínio (gerado na Etapa 5 do prompt de criação) consolida todos os códigos.

---

## 10. Webhooks e eventos internos

Quando uma ação deve disparar efeitos em outros módulos (ex: criação de contato
via formulário dispara notificação para o responsável), o padrão é **evento interno**
— nunca chamada direta entre módulos.

```typescript
// Publicar evento (lib/events.ts)
await publishEvent('contact.created', {
  organizationId: '...',
  contactId: '...',
  source: 'form',
  formId: '...'
})

// Consumir evento (em qualquer módulo)
onEvent('contact.created', async (payload) => {
  // lógica de notificação, tarefa automática, etc.
})
```

- Nome do evento: `{entidade}.{acao}` em snake_case
- Payload inclui o ID da entidade principal (e a chave de negócio quando útil)
- Eventos são assíncronos — nunca bloquear a resposta HTTP aguardando um handler
- O N3 da feature deve declarar quais eventos ela **publica** e quais ela **consome**

---

## 11. Rate limiting

| Contexto                | Limite          | Janela   |
|-------------------------|-----------------|----------|
| Rotas de autenticação   | 10 requisições  | 1 minuto |
| Rotas de envio (email, SMS, WhatsApp) | 60 requisições | 1 minuto |
| Demais rotas autenticadas | 300 requisições | 1 minuto |
| Rotas públicas (formulários) | 30 requisições | 1 minuto |

Ao atingir o limite, retornar HTTP 429 com o header `Retry-After: {segundos}`.

---

## 12. Versionamento

- Versão atual: `v1` (prefixo `/api/v1/`)
- Uma nova versão (`v2`) só é criada quando há **breaking change** impossível de
  fazer de forma retrocompatível
- Adição de campos opcionais, novos endpoints e novos valores de enum
  **não** constituem breaking change — não exigem nova versão
- Remoção de campos, alteração de tipos e mudança de comportamento de campos
  existentes **constituem** breaking change
- Versões antigas são mantidas por mínimo 6 meses após lançamento da nova

---

## 13. Segurança

- **CORS**: permitir apenas origens da própria organização (subdomínio configurado)
- **CSRF**: não aplicável (autenticação via cookie httpOnly + SameSite=lax)
- **SQL Injection**: usar sempre queries parametrizadas (prepared statements / ORM) — nunca interpolação
- **Logs**: nunca logar body de requisições que contenham campos sensíveis
  (senha, token, dados de cartão). Logar sempre: método, rota, status, duração, `userId`
- **Stack trace**: nunca expor em respostas de produção. Usar `INTERNAL_ERROR` genérico
- **Campos sensíveis**: nunca retornar `password`, `passwordHash`, `refreshToken`
  em nenhuma resposta, mesmo em rotas admin

---

*Todo novo endpoint deve ser revisado contra este arquivo antes de ir para review.
Divergências devem ser justificadas no PR e, se aprovadas, incorporadas aqui.*

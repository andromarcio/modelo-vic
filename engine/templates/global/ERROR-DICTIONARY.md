<!-- doc-template-engine: {{VERSION}} | prompt: {{PROMPT_ID}} | atualizado: {{YYYY-MM-DD}} -->
# ERROR-DICTIONARY.md
> Dicionário centralizado de códigos de erro de API.
> Todo novo código de erro criado durante a especificação técnica (N3)
> deve ser registrado aqui para evitar duplicidade de chaves e garantir
> consistência no frontend (internacionalização / i18n).
>
> Padrão: `[DOMINIO]_[DESCRICAO]` em SCREAMING_SNAKE_CASE
>
> **Como referenciar nos N3**:
> No Mapeamento de erros (seção dev-only), cite a chave:
> `→ ver ERROR-DICTIONARY: AUTH_UNAUTHENTICATED`

---

## 1. Erros globais (qualquer rota)

Estes erros podem ocorrer em qualquer endpoint do sistema
e não são específicos de um domínio. *(baseline reutilizável — ajuste conforme a stack)*

| Código de erro | HTTP | Situação |
|---|---|---|
| `AUTH_UNAUTHENTICATED` | 401 | Token ausente ou assinatura inválida |
| `AUTH_TOKEN_EXPIRED` | 401 | Token válido, mas expirado — renovar via refresh |
| `AUTH_FORBIDDEN` | 403 | Usuário autenticado, mas sem permissão para a ação |
| `VALIDATION_ERROR` | 422 | Um ou mais campos no body/query são inválidos (ver `details`) |
| `FIELD_IMMUTABLE` | 422 | Tentativa de alterar um campo protegido via PATCH |
| `RESOURCE_NOT_FOUND` | 404 | Registro não existe |
| `RATE_LIMIT_EXCEEDED` | 429 | Excedeu limite de requisições por IP ou token |
| `INTERNAL_ERROR` | 500 | Falha genérica de servidor — nunca expor stack trace |

---

## 2. Erros de [Domínio]

> Uma seção por domínio. Crie conforme os N3 técnicos forem especificados.

| Código de erro | HTTP | Situação |
|---|---|---|
| `[DOMINIO]_NOT_FOUND` | 404 | [registro não existe ou foi excluído] |
| `[DOMINIO]_[NOME]` | [HTTP] | [situação que dispara o erro] |

---

## Como adicionar novos erros

Ao criar ou atualizar um N3 e identificar a necessidade de um código
não listado acima, adicione-o à tabela do domínio correspondente:

```markdown
| `[DOMINIO]_[NOME]` | [HTTP] | [Situação que dispara o erro] |
```

**Regras**:
- Prefixo = nome do domínio em maiúsculas (`CONTACT_`, `AUTH_`, `TASK_`, etc.)
- Descrição em inglês, substantivo ou verbo no passado (`NOT_FOUND`, `DUPLICATE`, `FAILED`)
- Nunca criar dois códigos com o mesmo significado em domínios diferentes
- Registrar aqui **antes** de usar no N3

---

## Instrução para a LLM

Ao gerar a seção `Mapeamento de erros` de um N3 técnico (PROMPT_3B):
1. Verificar se o erro já existe neste dicionário — usar a chave existente
2. Se for novo: propor com ⚠️, aguardar aprovação e adicionar ao dicionário
3. Nunca criar chaves ad-hoc sem registrar aqui
4. Referenciar no N3: `→ ver ERROR-DICTIONARY: [CODIGO]`

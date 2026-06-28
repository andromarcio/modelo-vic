<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_3B | atualizado: 2026-06-23 -->
<!--
  CONVENÇÃO DE VISIBILIDADE
  ─────────────────────────────────────────────────────────────────
  Blocos <div class="dev-only"> contêm detalhes técnicos.
  Versão PO  → CSS: .dev-only { display: none; }
  Versão DEV → sem CSS adicional
  ─────────────────────────────────────────────────────────────────
-->

# Editar Cliente
> **Nível 3** - Feature Set: Gestão de Clientes — Domínio: Clientes - `CLI-GES-04`

## Descrição
Permite alterar os dados cadastrais de um cliente existente, com exceção do CPF, que permanece imutável.

---

## Origem

| História (ServiceNow) | Tipo | Critérios cobertos |
|---|---|---|
| — ⚠️ | Criação | Sem história vinculada neste exemplo genérico |

---

## Superfície

**Tela própria** — Manter Cliente (`/clientes/manter`) em modo edição. Acessada a partir da tela de Pesquisa.

---

## Regras de negócio

1. O **CPF não pode ser alterado** — o campo é exibido desabilitado no modo edição.
   → ver N1 Clientes: Regras transversais de negócio: 1
2. As validações de formato dos demais campos seguem o cadastro.
   → ver FIELD-DICTIONARY: E-mail · Telefone

---

## Cenários

```gherkin
Feature: Editar Cliente

  # ── Caminho feliz ──────────────────────────────────────────────

  Scenario: Edição realizada com sucesso
    Given que existe um cliente cadastrado
    When o usuário altera campos editáveis com dados válidos
    And confirma o salvamento
    Then o sistema atualiza o cadastro
    And exibe toast: "Cadastro atualizado com sucesso."

  # ── Estados especiais ──────────────────────────────────────────

  Scenario: Campo CPF desabilitado na edição
    Given que o usuário abriu um cliente em modo edição
    Then o campo "CPF" é exibido desabilitado e não pode ser alterado

  # ── Erros de validação ─────────────────────────────────────────
  # ← MESSAGE-DICTIONARY: BASELINE (validação de obrigatório + formato — todos os campos)
```

---

## Campos

| Label PO | Tipo | Obrigatório | Validação |
|---|---|---|---|
| Nome completo | texto | sim | → ver FIELD-DICTIONARY: Nome de pessoa |
| CPF | texto | sim | **Imutável** — exibido desabilitado |
| E-mail | texto | sim | → ver FIELD-DICTIONARY: E-mail |
| Telefone | texto (com máscara) | não | → ver FIELD-DICTIONARY: Telefone |
| Data de nascimento | data | não | → ver FIELD-DICTIONARY: Data de nascimento |
| Situação cadastral | lista (Ativo/Inativo) | sim | Deve selecionar uma opção válida |

---

## Campos automáticos

| Label PO | Valor | Quando |
|---|---|---|
| — | — | (não há campos automáticos nesta feature) |

---

## Comportamento de tela

### Onde fica
Formulário em página própria — **Manter Cliente** (`/clientes/manter`), em modo edição, pré-preenchido com os dados atuais.

### Estados da tela

| Estado | Comportamento |
|---|---|
| Loading | Formulário carregando os dados atuais; "Salvar" em processamento ao enviar. |
| Erro de validação | Mensagem abaixo do campo (`.dsc-field-error`). |
| Erro de servidor | "Ocorreu um erro. Tente novamente." |
| Sucesso | Toast: "Cadastro atualizado com sucesso." |
| Empty state | "Registro não encontrado." se o cliente foi excluído durante a edição. |

---

## Métricas de tamanho

| Função de Transação | Tipo | ALR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|
| Editar Cliente | EE | 1 | 8 | Baixa | 3 | 2026-06-23 |

> **ALR** = ALIs/AIEs lidos/mantidos · **DER** = campos no body + resposta.

<details>
<summary>Memória de cálculo (ALR e DER por transação)</summary>

- **Editar Cliente** — ALR = 1 (Cliente, mantido); DER = 8 (6 campos + 1 mensagem + 1 ação) → tabela EE do SIZING.md → **Baixa → 3 PF**

</details>

**Total: 3 PF**

---

<div class="dev-only">

## Mapeamento de campos
→ ver DATA-MODEL.md: Entidade **Cliente**

---

## Cenários técnicos adicionais

```gherkin
  # ── Comportamento técnico ──────────────────────────────────────

  Scenario: Tentativa de alterar CPF via PATCH
    Given que o body inclui o campo cpf diferente do registro
    When o PATCH é processado
    Then o servidor responde HTTP 422 com code "FIELD_IMMUTABLE"
    And o CPF do registro permanece inalterado
```

---

## Mapeamento de erros (código interno → mensagem ao usuário)

| Código | HTTP | Mensagem exibida ao usuário |
|---|---|---|
| `CLIENTE_NOT_FOUND` | 404 | "Registro não encontrado." |
| `FIELD_IMMUTABLE` | 422 | (CPF é imutável — campo desabilitado na UI) |
| `VALIDATION_ERROR` | 422 | (mensagens por campo — ver MESSAGE-DICTIONARY/FIELD-DICTIONARY) |

→ ver ERROR-DICTIONARY: CLIENTE_NOT_FOUND · FIELD_IMMUTABLE · VALIDATION_ERROR

---

## API

### PATCH /api/v1/clientes/{cpf}
**Acesso**: autenticado — roles `Atendente`, `Supervisor`

**Body**:
```typescript
{
  nomeCompleto?: string       // Label PO: Nome completo
  email?: string              // Label PO: E-mail
  telefone?: string           // Label PO: Telefone
  dataNascimento?: string     // Label PO: Data de nascimento (ISO 8601)
  situacaoCadastral?: string  // Label PO: Situação cadastral (Ativo/Inativo)
}
// cpf NÃO é aceito no body (imutável). Tipos completos: ver DATA-MODEL.md: Entidade Cliente
```

**Resposta de sucesso** — HTTP 200:
```json
{ "data": { "id": "uuid" }, "meta": null }
```

**Respostas de erro**:

| HTTP | Code | Situação |
|---|---|---|
| 404 | `CLIENTE_NOT_FOUND` | Cliente não existe ou foi excluído |
| 422 | `FIELD_IMMUTABLE` | Tentativa de alterar o CPF |
| 422 | `VALIDATION_ERROR` | Formato inválido em algum campo |
| 403 | `AUTH_FORBIDDEN` | Perfil sem permissão |

---

## Eventos

### Publicados
| Evento | Quando | Payload | Consumidores |
|---|---|---|---|
| `cliente.atualizado` | Após gravar a alteração | `{ id, cpf }` | — |

### Consumidos
| Evento | Publicado por | Reação |
|---|---|---|
| — | — | — |

---

## AuditLog

```typescript
logAction({
  userId: context.userId,
  action: 'cliente.atualizado',
  targetEntity: 'Cliente',
  targetId: cliente.id,
  metadata: {
    // → nomes completos em DATA-MODEL.md: Entidade Cliente
    camposAlterados: [...]
  }
})
```

---

## Arquivos a criar ou alterar

```
backend/.../ClienteController.java   ← endpoint PATCH /api/v1/clientes/{cpf}
backend/.../ClienteService.java      ← bloqueio de alteração de CPF
frontend/.../manter-cliente.ts       ← formulário em modo edição (CPF desabilitado)
```

---

## Dependências

- **DATA-MODEL.md: Cliente** — fonte de verdade dos campos.

</div>

---

## Implementação

| Item | Repositório | Caminho | Branch/Tag |
|---|---|---|---|
| Endpoint PATCH /api/v1/clientes/{cpf} | projeto-backend | `.../ClienteController.java` | `main` |

**Status**: `[x] Especificado` · `[ ] Em desenvolvimento` · `[ ] Implementado` · `[ ] Deprecado`

**Rastreabilidade no git**: `feat(CLI-GES-04): editar cliente (ServiceNow STRYxxxxxxx)`

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| 2026-06-23 | Exemplo | Feature criada | N3 negocial + técnico (exemplo genérico) |

---

*Feature Set: Gestão de Clientes · Domínio: Clientes · Última revisão: —*
*Links: [N2 do Feature Set](./README.md) · [N1 do domínio](../README.md) · [INDEX geral](../../INDEX.md)*

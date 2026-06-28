<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_3B | atualizado: 2026-06-23 -->
<!--
  CONVENÇÃO DE VISIBILIDADE
  ─────────────────────────────────────────────────────────────────
  Blocos <div class="dev-only"> contêm detalhes técnicos.
  Versão PO  → CSS: .dev-only { display: none; }
  Versão DEV → sem CSS adicional
  ─────────────────────────────────────────────────────────────────
-->

# Cadastrar Cliente
> **Nível 3** - Feature Set: Gestão de Clientes — Domínio: Clientes - `CLI-GES-01`

## Descrição
Permite ao atendente cadastrar um novo cliente, exigindo CPF obrigatório e único.

---

## Origem

| História (ServiceNow) | Tipo | Critérios cobertos |
|---|---|---|
| — ⚠️ | Criação | Sem história vinculada neste exemplo genérico |

---

## Superfície

**Tela própria** — Manter Cliente (`/clientes/manter`). Formulário de cadastro acessado a partir da tela de Pesquisa.

---

## Regras de negócio

1. O CPF é obrigatório e deve ser **único** no cadastro de clientes.
   → ver FIELD-DICTIONARY: CPF
   → ver N1 Clientes: Regras transversais de negócio: 1
2. O e-mail é obrigatório e validado **apenas por formato**.
   → ver FIELD-DICTIONARY: E-mail

---

## Cenários

```gherkin
Feature: Cadastrar Cliente

  # ← FIELD-DICTIONARY: CPF (importar cenários de validação)
  # ← FIELD-DICTIONARY: E-mail (importar cenários de validação)

  # ── Caminho feliz ──────────────────────────────────────────────

  Scenario: Cadastro realizado com sucesso
    Given que o atendente acessou a página de cadastro de cliente
    When informa os campos obrigatórios com dados válidos
    And informa um CPF ainda não cadastrado
    And confirma o salvamento
    Then o sistema cadastra o cliente com sucesso
    And define "Situação cadastral" como "Ativo" por padrão
    And exibe toast: "Cadastro realizado com sucesso."

  # ── Conflitos com dados existentes ─────────────────────────────

  Scenario: Tentativa de cadastro com CPF já existente
    Given que já existe cliente cadastrado com o CPF informado
    When o usuário tenta salvar o novo cadastro
    Then o sistema não salva o registro
    And exibe abaixo do campo "CPF": "Já existe um registro com este CPF."

  # ── Erros de validação ─────────────────────────────────────────
  # ← MESSAGE-DICTIONARY: BASELINE (validação de obrigatório + formato — todos os campos)
```

---

## Campos

| Label PO | Tipo | Obrigatório | Validação |
|---|---|---|---|
| Nome completo | texto | sim | → ver FIELD-DICTIONARY: Nome de pessoa |
| CPF | texto (com máscara) | sim | Deve ser único. → ver FIELD-DICTIONARY: CPF |
| E-mail | texto | sim | → ver FIELD-DICTIONARY: E-mail |
| Telefone | texto (com máscara) | não | → ver FIELD-DICTIONARY: Telefone |
| Data de nascimento | data | não | → ver FIELD-DICTIONARY: Data de nascimento |
| Situação cadastral | lista (Ativo/Inativo) | sim | Valor padrão no cadastro: Ativo |

---

## Campos automáticos

| Label PO | Valor | Quando |
|---|---|---|
| Situação cadastral | Ativo | Ao criar um novo cadastro |

---

## Comportamento de tela

### Onde fica
Formulário em página própria — **Manter Cliente** (`/clientes/manter`), em modo criação, iniciado a partir da tela de Pesquisa.

### Estados da tela

| Estado | Comportamento |
|---|---|
| Loading | Botão "Salvar" em estado de processamento; campos bloqueados durante o envio. |
| Erro de validação | Mensagem abaixo do campo (`.dsc-field-error`), conforme MESSAGE-DICTIONARY/FIELD-DICTIONARY. |
| Erro de servidor | Toast genérico: "Ocorreu um erro. Tente novamente." |
| Sucesso | Toast: "Cadastro realizado com sucesso." e retorno à tela de Pesquisa. |
| Empty state | Não se aplica (formulário de criação). |

---

## Métricas de tamanho

| Função de Transação | Tipo | ALR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|
| Cadastrar Cliente | EE | 1 | 8 | Baixa | 3 | 2026-06-23 |

> **ALR** = ALIs/AIEs lidos/mantidos · **DER** = campos no body + campos na resposta de sucesso.

<details>
<summary>Memória de cálculo (ALR e DER por transação)</summary>

- **Cadastrar Cliente** — ALR = 1 (Cliente, lido para checar unicidade do CPF e gravado); DER = 8 (6 campos + 1 mensagem + 1 ação) → tabela EE do SIZING.md → **Baixa → 3 PF**

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

  Scenario: Unicidade de CPF garantida no servidor
    Given que dois cadastros simultâneos usam o mesmo CPF
    When o segundo POST é processado
    Then o servidor responde HTTP 422 com code "CLIENTE_CPF_DUPLICADO"
    And nenhum segundo registro ativo com o mesmo CPF é criado
```

---

## Mapeamento de erros (código interno → mensagem ao usuário)

| Código | HTTP | Mensagem exibida ao usuário |
|---|---|---|
| `CLIENTE_CPF_DUPLICADO` | 422 | "Já existe um registro com este CPF." |
| `VALIDATION_ERROR` | 422 | (mensagens por campo — ver MESSAGE-DICTIONARY/FIELD-DICTIONARY) |

→ ver ERROR-DICTIONARY: CLIENTE_CPF_DUPLICADO · VALIDATION_ERROR

---

## API

### POST /api/v1/clientes
**Acesso**: autenticado — roles `Atendente`, `Supervisor`

**Body**:
```typescript
{
  nomeCompleto: string        // Label PO: Nome completo — obrigatório
  cpf: string                 // Label PO: CPF — obrigatório, único
  email: string               // Label PO: E-mail — obrigatório
  telefone?: string           // Label PO: Telefone — opcional
  dataNascimento?: string     // Label PO: Data de nascimento — opcional (ISO 8601)
}
// Tipos e constraints completos: ver DATA-MODEL.md: Entidade Cliente
```

**Resposta de sucesso** — HTTP 201:
```json
{
  "data": { "id": "uuid" },
  "meta": null
}
```

**Respostas de erro**:

| HTTP | Code | Situação |
|---|---|---|
| 422 | `CLIENTE_CPF_DUPLICADO` | CPF já cadastrado em cliente ativo |
| 422 | `VALIDATION_ERROR` | Campo obrigatório ausente ou formato inválido |
| 403 | `AUTH_FORBIDDEN` | Perfil sem permissão para cadastrar |

---

## Eventos

### Publicados
| Evento | Quando | Payload | Consumidores |
|---|---|---|---|
| `cliente.cadastrado` | Após gravar o novo cliente | `{ id, cpf }` | — (sem consumidores neste exemplo) |

### Consumidos
| Evento | Publicado por | Reação |
|---|---|---|
| — | — | — |

---

## AuditLog

```typescript
logAction({
  userId: context.userId,
  action: 'cliente.cadastrado',
  targetEntity: 'Cliente',
  targetId: cliente.id,
  metadata: {
    // → nomes completos em DATA-MODEL.md: Entidade Cliente
    cpf: cliente.cpf
  }
})
```

---

## Arquivos a criar ou alterar

```
backend/.../ClienteController.java   ← endpoint POST /api/v1/clientes
backend/.../ClienteService.java      ← regra de unicidade de CPF + criação
frontend/.../manter-cliente.ts       ← formulário de criação
```

---

## Dependências

- **DATA-MODEL.md: Cliente** — fonte de verdade dos campos.

</div>

---

## Implementação

| Item | Repositório | Caminho | Branch/Tag |
|---|---|---|---|
| Endpoint POST /api/v1/clientes | projeto-backend | `.../ClienteController.java` | `main` |

**Status**: `[x] Especificado` · `[ ] Em desenvolvimento` · `[ ] Implementado` · `[ ] Deprecado`

**Rastreabilidade no git**: `feat(CLI-GES-01): cadastrar cliente (ServiceNow STRYxxxxxxx)`

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| 2026-06-23 | Exemplo | Feature criada | N3 negocial + técnico (exemplo genérico) |

---

*Feature Set: Gestão de Clientes · Domínio: Clientes · Última revisão: —*
*Links: [N2 do Feature Set](./README.md) · [N1 do domínio](../README.md) · [INDEX geral](../../INDEX.md)*

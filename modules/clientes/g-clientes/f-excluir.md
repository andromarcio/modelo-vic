<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_3B | atualizado: 2026-06-23 -->
<!--
  CONVENÇÃO DE VISIBILIDADE
  ─────────────────────────────────────────────────────────────────
  Blocos <div class="dev-only"> contêm detalhes técnicos.
  Versão PO  → CSS: .dev-only { display: none; }
  Versão DEV → sem CSS adicional
  ─────────────────────────────────────────────────────────────────
-->

# Excluir Cliente
> **Nível 3** - Feature Set: Gestão de Clientes — Domínio: Clientes - `CLI-GES-05`

## Descrição
Permite excluir (exclusão lógica) o cadastro de um cliente.

---

## Origem

| História (ServiceNow) | Tipo | Critérios cobertos |
|---|---|---|
| — ⚠️ | Criação | Sem história vinculada neste exemplo genérico |

---

## Superfície

**Ação em tela** — origem: Pesquisar Clientes (`/clientes`). Disparada por ação na linha da lista, com modal de confirmação.

---

## Regras de negócio

1. A exclusão é **lógica** (soft delete): o registro é marcado via `deletedAt`, não removido fisicamente.
   → ver MASTER: Decisões transversais: 1
2. A exclusão exige **confirmação** do usuário antes de efetivar.

---

## Cenários

```gherkin
Feature: Excluir Cliente

  # ── Caminho feliz ──────────────────────────────────────────────

  Scenario: Exclusão confirmada
    Given que existe um cliente cadastrado
    When o usuário aciona a exclusão e confirma no modal
    Then o sistema marca o registro como excluído (exclusão lógica)
    And exibe toast: "Registro excluído com sucesso."

  # ── Estados especiais ──────────────────────────────────────────

  Scenario: Exclusão cancelada
    Given que o usuário acionou a exclusão de um cliente
    When o usuário cancela no modal de confirmação
    Then o registro permanece inalterado
```

---

## Campos

| Label PO | Tipo | Obrigatório | Validação |
|---|---|---|---|
| — | — | — | (não há entrada de campos; ação sobre o registro selecionado) |

---

## Campos automáticos

| Label PO | Valor | Quando |
|---|---|---|
| Data de exclusão | data/hora atual | Ao confirmar a exclusão lógica (`deletedAt`) |

---

## Comportamento de tela

### Onde fica
Ação disparada da linha do grid em **Pesquisar Clientes** (`/clientes`), via modal de confirmação.

### Estados da tela

| Estado | Comportamento |
|---|---|
| Loading | Botão "Excluir" do modal em processamento. |
| Erro de validação | Não se aplica. |
| Erro de servidor | "Ocorreu um erro. Tente novamente." |
| Sucesso | Remove a linha da lista e exibe toast: "Registro excluído com sucesso." |
| Empty state | "Registro não encontrado." se o cliente já havia sido excluído. |

---

## Métricas de tamanho

| Função de Transação | Tipo | ALR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|
| Excluir Cliente | EE | 1 | 3 | Baixa | 3 | 2026-06-23 |

> **ALR** = ALIs/AIEs mantidos · **DER** = chave + confirmação + mensagem.

<details>
<summary>Memória de cálculo (ALR e DER por transação)</summary>

- **Excluir Cliente** — ALR = 1 (Cliente, marcado como excluído); DER = 3 (chave + confirmação + mensagem) → tabela EE do SIZING.md → **Baixa → 3 PF**

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

  Scenario: Exclusão lógica preserva o registro
    Given que o cliente existe e está ativo
    When o DELETE é processado
    Then o servidor responde HTTP 204
    And o registro passa a ter deletedAt preenchido (não é removido fisicamente)
```

---

## Mapeamento de erros (código interno → mensagem ao usuário)

| Código | HTTP | Mensagem exibida ao usuário |
|---|---|---|
| `CLIENTE_NOT_FOUND` | 404 | "Registro não encontrado." |
| `AUTH_FORBIDDEN` | 403 | "Você não tem permissão para esta ação." |

→ ver ERROR-DICTIONARY: CLIENTE_NOT_FOUND · AUTH_FORBIDDEN

---

## API

### DELETE /api/v1/clientes/{cpf}
**Acesso**: autenticado — roles `Atendente`, `Supervisor`

**Resposta de sucesso** — HTTP 204 (sem corpo).

**Respostas de erro**:

| HTTP | Code | Situação |
|---|---|---|
| 404 | `CLIENTE_NOT_FOUND` | Cliente não existe ou já excluído |
| 403 | `AUTH_FORBIDDEN` | Perfil sem permissão |

---

## Eventos

### Publicados
| Evento | Quando | Payload | Consumidores |
|---|---|---|---|
| `cliente.excluido` | Após marcar o registro como excluído | `{ id, cpf }` | — |

### Consumidos
| Evento | Publicado por | Reação |
|---|---|---|
| — | — | — |

---

## AuditLog

```typescript
logAction({
  userId: context.userId,
  action: 'cliente.excluido',
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
backend/.../ClienteController.java   ← endpoint DELETE /api/v1/clientes/{cpf} (soft delete)
frontend/.../pesquisar-clientes.ts   ← modal de confirmação + remoção da linha
```

---

## Dependências

- **DATA-MODEL.md: Cliente** — fonte de verdade dos campos.

</div>

---

## Implementação

| Item | Repositório | Caminho | Branch/Tag |
|---|---|---|---|
| Endpoint DELETE /api/v1/clientes/{cpf} | projeto-backend | `.../ClienteController.java` | `main` |

**Status**: `[x] Especificado` · `[ ] Em desenvolvimento` · `[ ] Implementado` · `[ ] Deprecado`

**Rastreabilidade no git**: `feat(CLI-GES-05): excluir cliente (ServiceNow STRYxxxxxxx)`

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| 2026-06-23 | Exemplo | Feature criada | N3 negocial + técnico (exemplo genérico) |

---

*Feature Set: Gestão de Clientes · Domínio: Clientes · Última revisão: —*
*Links: [N2 do Feature Set](./README.md) · [N1 do domínio](../README.md) · [INDEX geral](../../INDEX.md)*

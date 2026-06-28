<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_3B | atualizado: 2026-06-23 -->
<!--
  CONVENÇÃO DE VISIBILIDADE
  ─────────────────────────────────────────────────────────────────
  Blocos <div class="dev-only"> contêm detalhes técnicos.
  Versão PO  → CSS: .dev-only { display: none; }
  Versão DEV → sem CSS adicional
  ─────────────────────────────────────────────────────────────────
-->

# Visualizar Cliente
> **Nível 3** - Feature Set: Gestão de Clientes — Domínio: Clientes - `CLI-GES-03`

## Descrição
Permite visualizar os dados cadastrais completos de um cliente em modo somente leitura.

---

## Origem

| História (ServiceNow) | Tipo | Critérios cobertos |
|---|---|---|
| — ⚠️ | Criação | Sem história vinculada neste exemplo genérico |

---

## Superfície

**Tela própria** — Visualizar Cliente (`/clientes/:cpf`). Acessada a partir da tela de Pesquisa.

---

## Regras de negócio

1. Todos os campos são exibidos **desabilitados** (somente leitura), impedindo edições acidentais.
2. O acesso direto a um CPF inexistente exibe mensagem de registro não encontrado.

---

## Cenários

```gherkin
Feature: Visualizar Cliente

  # ── Caminho feliz ──────────────────────────────────────────────

  Scenario: Visualização de cliente existente
    Given que existe um cliente cadastrado com o CPF informado
    When o usuário acessa a tela de visualização desse cliente
    Then o sistema exibe os dados cadastrais em modo somente leitura

  # ── Estados especiais ──────────────────────────────────────────

  Scenario: Acesso a CPF inexistente
    When o usuário acessa a visualização de um CPF não cadastrado
    Then o sistema exibe: "Registro não encontrado."
```

---

## Campos

| Label PO | Tipo | Obrigatório | Validação |
|---|---|---|---|
| Nome completo | texto | automático | Somente leitura |
| CPF | texto (com máscara) | automático | Somente leitura |
| E-mail | texto | automático | Somente leitura |
| Telefone | texto (com máscara) | automático | Somente leitura |
| Data de nascimento | data | automático | Somente leitura |
| Situação cadastral | texto | automático | Somente leitura |

*Todos os campos são exibidos em modo somente leitura (não editáveis nesta feature).*

---

## Campos automáticos

| Label PO | Valor | Quando |
|---|---|---|
| — | — | (não há campos automáticos nesta feature) |

---

## Comportamento de tela

### Onde fica
Ficha cadastral em página própria — **Visualizar Cliente** (`/clientes/:cpf`), acessada a partir da tela de Pesquisa.

### Estados da tela

| Estado | Comportamento |
|---|---|
| Loading | Skeleton da ficha durante a busca do registro. |
| Erro de validação | Não se aplica (sem entrada de dados). |
| Erro de servidor | "Não foi possível carregar os dados. Tente novamente." |
| Sucesso | Ficha consolidada com todos os campos desabilitados. |
| Empty state | "Registro não encontrado." (CPF inexistente). |

---

## Métricas de tamanho

| Função de Transação | Tipo | ALR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|
| Visualizar Cliente | CE | 1 | 7 | Baixa | 3 | 2026-06-23 |

> **ALR** = ALIs/AIEs lidos · **DER** = chave de entrada + campos exibidos.

<details>
<summary>Memória de cálculo (ALR e DER por transação)</summary>

- **Visualizar Cliente** — ALR = 1 (Cliente); DER = 7 (6 campos + 1 chave de entrada); recuperação sem lógica de cálculo → tabela CE do SIZING.md → **Baixa → 3 PF**

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

  Scenario: Busca por CPF de registro excluído
    Given que o cliente do CPF informado tem deletedAt preenchido
    When o GET é processado
    Then o servidor responde HTTP 404 com code "CLIENTE_NOT_FOUND"
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

### GET /api/v1/clientes/{cpf}
**Acesso**: autenticado — roles `Atendente`, `Supervisor`, `Auditor`

**Resposta de sucesso** — HTTP 200:
```json
{
  "data": {
    "id": "uuid",
    "nomeCompleto": "...",
    "cpf": "...",
    "email": "...",
    "telefone": "...",
    "dataNascimento": "1990-06-15",
    "situacaoCadastral": "Ativo"
  },
  "meta": null
}
```

**Respostas de erro**:

| HTTP | Code | Situação |
|---|---|---|
| 404 | `CLIENTE_NOT_FOUND` | CPF não existe ou registro excluído |
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

Operação de **leitura** — não auditada por padrão (ver `global/NFR.md`).

---

## Arquivos a criar ou alterar

```
backend/.../ClienteController.java     ← endpoint GET /api/v1/clientes/{cpf}
frontend/.../visualizar-cliente.ts     ← ficha somente leitura
```

---

## Dependências

- **DATA-MODEL.md: Cliente** — fonte de verdade dos campos exibidos.

</div>

---

## Implementação

| Item | Repositório | Caminho | Branch/Tag |
|---|---|---|---|
| Endpoint GET /api/v1/clientes/{cpf} | projeto-backend | `.../ClienteController.java` | `main` |

**Status**: `[x] Especificado` · `[ ] Em desenvolvimento` · `[ ] Implementado` · `[ ] Deprecado`

**Rastreabilidade no git**: `feat(CLI-GES-03): visualizar cliente (ServiceNow STRYxxxxxxx)`

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| 2026-06-23 | Exemplo | Feature criada | N3 negocial + técnico (exemplo genérico) |

---

*Feature Set: Gestão de Clientes · Domínio: Clientes · Última revisão: —*
*Links: [N2 do Feature Set](./README.md) · [N1 do domínio](../README.md) · [INDEX geral](../../INDEX.md)*

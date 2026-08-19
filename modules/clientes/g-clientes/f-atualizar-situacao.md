<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_3A | atualizado: 2026-08-19 -->

# Atualizar Situação Cadastral
> **Nível 3** - Feature Set: Gestão de Clientes — Domínio: Clientes - `CLI-GES-06`

## Descrição
Permite ao atendente ativar ou inativar o cadastro de um cliente.

---

## Origem

| História (ServiceNow) | Tipo | Critérios cobertos |
|---|---|---|
| — ⚠️ | Criação | Demanda registrada por e-mail, sem chave |

---

## Superfície

**Tela própria** — Manter Cliente (`/clientes/manter`), aba Situação.

---

## Regras de negócio

1. O sistema deve verificar a situação atual e ocultar o botão "Inativar"
   quando o cliente já estiver inativo, exibindo aviso em vermelho no topo.
2. A tela de situação cadastral deve ser simples e intuitiva para o
   atendente.
3. A atualização de situação deve responder em até 2 segundos.
4. Cliente com pendência financeira não pode ser inativado.

---

## Cenários

```gherkin
Feature: Atualizar Situação Cadastral

  Scenario: Atualização realizada com sucesso
    Given que o atendente acessou a aba Situação
    When informa os dados corretamente
    When confirma a operação
    Then o sistema processa a atualização corretamente

  Scenario: Cliente com pendência não é inativado
    Given que o cliente possui pendência financeira
    When o atendente tenta inativar o cadastro
    Then o sistema impede a operação
```

---

## Campos

| Label PO | Tipo | Obrigatório | Observações |
|---|---|---|---|
| Situação cadastral | seleção | sim | Ativo / Inativo |
| Motivo | texto | não | Justificativa da alteração |

---

## Comportamento de tela

- A aba Situação exibe a situação atual em destaque.
- Ao inativar, o formulário de motivo é exibido.

<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_1A | atualizado: 2026-06-23 -->
<!--
  CONVENÇÃO DE VISIBILIDADE
  Blocos <div class="dev-only"> contêm detalhes técnicos.
  Versão PO  → CSS: .dev-only { display: none; }
  Versão DEV → sem CSS adicional
-->

# Domínio: Clientes
> **Nível 1** - Visão estratégica do domínio - `CLI`

## Descrição
O domínio **Clientes** é responsável por manter a **base cadastral** das pessoas
físicas atendidas pelo sistema — os dados pessoais e de contato dos clientes. É a
**fonte de verdade da identidade dos clientes** para os demais domínios.

### O que este domínio NÃO faz
| Descrição | Pertence a |
|---|---|
| Histórico de atendimentos e interações | Atendimento |
| Pedidos, contratos e cobranças | Vendas / Financeiro |

---

## Feature Sets

| Feature Set | Arquivo de Especificação (N2) | Descrição | Features |
|---|---|---|---|
| **Gestão de Clientes** <small>CLI-GES</small> | [g-clientes/README.md](./g-clientes/README.md) | Cadastro completo dos clientes via manutenção manual | 5 |

---

## Regras transversais de negócio

1. **Identificação única por CPF** — o CPF é o identificador único e obrigatório
   de cada cliente. Não pode haver duplicidade de CPF no cadastro.
2. **Integridade cadastral** — registros marcados como excluídos (exclusão lógica)
   não são reativados automaticamente; um novo cadastro com o mesmo CPF exige
   tratamento explícito.

---

## Integrações com outros domínios

### Leitura — domínios que consomem dados deste domínio
| Domínio | O que consome | Como |
|---|---|---|
| Atendimento ⚠️ | Cliente (por CPF) para vincular interações | Leitura por CPF |
| Vendas ⚠️ | Cliente (por CPF) para vincular pedidos | Leitura por CPF |

### Escrita — domínios que criam ou alteram dados deste domínio
| Domínio | O que altera | Situação |
|---|---|---|
| — | — | Nenhuma escrita externa identificada |

---

<div class="dev-only">

## Entidades do domínio

| Entidade | Descrição | Campos no DATA-MODEL.md |
|---|---|---|
| Cliente | Pessoa física com seus dados pessoais e de contato | → ver DATA-MODEL.md: Cliente |

---

## Dependências externas

| Serviço | Uso | Lib sugerida |
|---|---|---|
| — | Nenhuma dependência externa neste domínio | — |

---

## Regras de acesso consolidadas

| Perfil | Pode fazer |
|---|---|
| Atendente | Acesso completo: pesquisar, cadastrar, editar, excluir e visualizar |
| Supervisor | Acesso completo (idem Atendente) |
| Auditor | Somente leitura: pesquisar e visualizar |

---

</div>

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| 2026-06-23 | Exemplo | N1 criado | Domínio Clientes (exemplo genérico) |

---

*Última revisão: —*
*Links: [Gestão de Clientes](./g-clientes/README.md) · [INDEX geral](../INDEX.md)*

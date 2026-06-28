<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_1A | atualizado: 2026-06-23 -->
# Índice geral de módulos
> Visão consolidada de todos os domínios do sistema.
> Mantido via PROMPT 1A/1B — atualizar após cada N1 aprovado.
>
> ℹ️ **Conteúdo de exemplo (genérico)**.

---

## Domínios

| Domínio | Pasta | Responsabilidade | Feature Sets |
|---|---|---|---|
| [Clientes](./clientes/README.md) | `modules/clientes/` | Base cadastral e identidade dos clientes | 1 |

---

## Rastreabilidade: história → spec → código

| História (ServiceNow) | Feature | Domínio | Status | PF | CFP | Repositórios |
|---|---|---|---|---|---|---|
| — ⚠️ | [CLI-GES-01: Cadastrar Cliente](./clientes/g-clientes/f-cadastrar.md) | Clientes | 📋 Especificado | 3 | — | — |
| — ⚠️ | [CLI-GES-02: Pesquisar Clientes](./clientes/g-clientes/f-pesquisar.md) | Clientes | 📋 Especificado | 4 | — | — |
| — ⚠️ | [CLI-GES-03: Visualizar Cliente](./clientes/g-clientes/f-visualizar.md) | Clientes | 📋 Especificado | 3 | — | — |
| — ⚠️ | [CLI-GES-04: Editar Cliente](./clientes/g-clientes/f-editar.md) | Clientes | 📋 Especificado | 3 | — | — |
| — ⚠️ | [CLI-GES-05: Excluir Cliente](./clientes/g-clientes/f-excluir.md) | Clientes | 📋 Especificado | 3 | — | — |

<!--
  História: chave do ServiceNow que originou a feature (seção "Origem" do N3).
  No exemplo não há história real vinculada (⚠️). Uma feature pode ter mais de
  uma história; uma história, mais de uma feature.
  PF e CFP: PF preenchido via PROMPT_3B; CFP (COSMIC) pendente. Ver global/SIZING.md.
  Totais vigentes excluem features ❌ Deprecadas.
-->

**Total vigente: 23 PF · — CFP**
*Transações (soma das features): 16 PF · Funções de dados (DATA-MODEL.md): 7 PF (1 ALI × 7). CFP pendente.*

---

<!-- PENDENCIAS:INICIO -->
## Pendências de especificação

> ⚙️ **Seção gerada pelo PROMPT_PENDENCIAS (PD) — não editar à mão.**
> Varre as fontes (`_backlog/`, READMEs de N2, N3 com ⚠️) e espelha aqui o que está
> **pendente de especificar**. Edições manuais entre os marcadores são sobrescritas na
> próxima execução. Reflete o estado em **2026-06-23** — rode o **PD** para atualizar.

### Existência (falta N3)

> Algo é conhecido como necessário mas ainda **não tem N3**. Resolva pela rota indicada.

| Item | Nível | Origem | Rota |
|---|---|---|---|
| _Nenhum item pendente neste exemplo._ | — | — | — |

### Conteúdo (⚠️ em aberto)

> O artefato **existe**, mas tem lacunas/suposições aguardando esclarecimento.

| Feature | Lacuna | Arquivo |
|---|---|---|
| Cadastrar Cliente | Histórias de origem (ServiceNow) ainda não vinculadas | [f-cadastrar.md](./clientes/g-clientes/f-cadastrar.md) |
<!-- PENDENCIAS:FIM -->

---

## Entidades consolidadas

| Entidade | Domínio | N1 de origem |
|---|---|---|
| Cliente | Clientes | [clientes/README.md](./clientes/README.md) |

---

## Eventos do sistema

| Evento | Publicado por | Consumido por | Payload principal |
|---|---|---|---|
| `cliente.cadastrado` | Clientes | — (sem consumidores neste exemplo) | `{ id, cpf }` |
| `cliente.atualizado` | Clientes | — | `{ id, cpf }` |
| `cliente.excluido` | Clientes | — | `{ id, cpf }` |

---

## Mapa de integrações entre domínios

| Domínio origem | Depende de | Tipo | Descrição |
|---|---|---|---|
| Atendimento ⚠️ | Clientes | Leitura | Consome Cliente (por CPF) para vincular interações |
| Vendas ⚠️ | Clientes | Leitura | Consome Cliente (por CPF) para vincular pedidos |

---

## Legenda de status

| Ícone | Status | Descrição |
|---|---|---|
| 📋 | Especificado | N3 completo, aguardando desenvolvimento |
| 🔄 | Em desenvolvimento | Implementação em andamento |
| ✅ | Implementado | Em produção, rastreabilidade preenchida |
| ⚠️ | Revisão necessária | Spec desatualizada em relação ao código |
| ❌ | Deprecado | Feature removida do sistema |

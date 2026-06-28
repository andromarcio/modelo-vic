# Índice geral de módulos
> Visão consolidada de todos os domínios do sistema.
> Mantido via PROMPT 1A/1B — atualizar após cada N1 aprovado.

---

## Domínios

| Domínio | Pasta | Responsabilidade | Feature Sets |
|---|---|---|---|
| [Nome do Domínio](./[dominio]/README.md) | `modules/[dominio]/` | [responsabilidade em uma frase] | [N] |

---

## Rastreabilidade: história → spec → código

| História (ServiceNow) | Feature | Domínio | Status | PF | CFP | Repositórios |
|---|---|---|---|---|---|---|
| [`STRYxxxxxxx`](./_backlog/[chave].md) | [[SIGLA]-[SFS]-[NN]: Nome da Feature](./[dominio]/[feature-set]/[feature].md) | [Domínio] | 📋 Especificado | — | — | — |

<!--
  História: chave do ServiceNow que originou a feature (seção "Origem" do N3).
  Uma feature pode ter mais de uma história; uma história, mais de uma feature.
  PF e CFP: preencher após PROMPT_3B. Ver critérios em global/SIZING.md.
  Totais vigentes excluem features ❌ Deprecadas.
-->

**Total vigente: — PF · — CFP** *(dimensionamento pendente — preencher via PROMPT_3B; critérios em `global/SIZING.md`)*

---

<!-- PENDENCIAS:INICIO -->
## Pendências de especificação

> ⚙️ **Seção gerada pelo PROMPT_PENDENCIAS (PD) — não editar à mão.**
> Varre as fontes (`_backlog/`, READMEs de N2, N3 com ⚠️) e espelha aqui o que está
> **pendente de especificar**. Edições manuais entre os marcadores são sobrescritas na
> próxima execução. Reflete o estado em **[AAAA-MM-DD]** — rode o **PD** para atualizar.

### Existência (falta N3)

> Algo é conhecido como necessário mas ainda **não tem N3**. Resolva pela rota indicada.

| Item | Nível | Origem | Rota |
|---|---|---|---|
| [Cancelar pedido] | N3 | [`STRYxxxxxxx`](./_backlog/[chave].md) · N2 [Feature Set] | 3A |

### Conteúdo (⚠️ em aberto)

> O artefato **existe**, mas tem lacunas/suposições aguardando esclarecimento.

| Feature | Lacuna | Arquivo |
|---|---|---|
| [Nome da feature] | [pergunta em aberto, ex.: idade mínima exigida?] | [arquivo.md](./[dominio]/[feature-set]/[feature].md) |
<!-- PENDENCIAS:FIM -->

---

## Entidades consolidadas

| Entidade | Domínio | N1 de origem |
|---|---|---|
| [Nome da Entidade] | [Domínio] | [[dominio]/README.md](./[dominio]/README.md) |

---

## Eventos do sistema

| Evento | Publicado por | Consumido por | Payload principal |
|---|---|---|---|
| `[entidade.acao]` | [Domínio] | [Domínio] | `{ [campos] }` |

---

## Mapa de integrações entre domínios

| Domínio origem | Depende de | Tipo | Descrição |
|---|---|---|---|
| [Domínio] | [Domínio] | Leitura / Escrita / Evento | [o que consome e como] |

---

## Legenda de status

| Ícone | Status | Descrição |
|---|---|---|
| 📋 | Especificado | N3 completo, aguardando desenvolvimento |
| 🔄 | Em desenvolvimento | Implementação em andamento |
| ✅ | Implementado | Em produção, rastreabilidade preenchida |
| ⚠️ | Revisão necessária | Spec desatualizada em relação ao código |
| ❌ | Deprecado | Feature removida do sistema |

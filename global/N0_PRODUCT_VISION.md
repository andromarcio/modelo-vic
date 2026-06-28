<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_0 | atualizado: 2026-06-23 -->
# N0_PRODUCT_VISION.md
> **Nível 0** — Visão de Produto. O documento de referência mais alto do sistema:
> define **por que** o produto existe, para **quem** e **que valor** entrega.
>
> Os níveis N1–N3 são confrontados contra este documento para garantir que não
> extrapolam o escopo nem contradizem os objetivos do produto. O N0 dá a direção;
> não detalha funcionalidades, telas ou campos.
>
> **Quem mantém**: PO / Liderança de Produto
> **Atualização**: revisado quando a estratégia do produto muda — não a cada feature.
>
> ℹ️ **Conteúdo de exemplo (genérico)** — substitua pelo produto real.

---

## Propósito

O sistema oferece uma base de **cadastro de clientes** para os demais módulos do produto. É a **fonte de verdade da identidade dos clientes** — os dados pessoais e de contato que processos de atendimento, vendas e relacionamento consomem. Hoje esses dados ficam dispersos e duplicados; o produto centraliza a identidade do cliente num cadastro único, identificado pelo **CPF**.

---

## Proposta de valor

Um cadastro único e confiável de clientes, sem duplicidades de CPF, que serve de referência para todo o produto — reduzindo retrabalho de manutenção manual e erros causados por dados divergentes entre áreas.

---

## Público-alvo e personas

| Persona | Quem é | Principal dor | O que espera do produto |
|---|---|---|---|
| Atendente | Usuário operacional responsável pelo cadastro e manutenção dos dados dos clientes | Cadastros duplicados (mesmo CPF) e esforço alto de manutenção manual | Cadastrar, manter atualizado e localizar registros rapidamente |
| Supervisor | Responsável pela equipe de atendimento; acesso completo | Falta de visibilidade sobre a integridade da base | Garantir integridade e acompanhar os cadastros |
| Auditor | Perfil de consulta, sem poder de alteração | Não conseguir conferir dados sem risco de alterá-los | Pesquisar e visualizar dados cadastrais para conferência |

---

## Objetivos do produto

> O **quê** o produto busca alcançar — em linguagem de negócio, sem soluções técnicas.

1. Manter uma base cadastral de clientes única e sem duplicidade de CPF.
2. Permitir manutenção manual completa do cadastro (cadastrar, editar, excluir e visualizar).
3. Servir de fonte de identidade do cliente para os demais domínios do sistema.

---

## Métricas de sucesso (KPIs)

> Como saberemos que o produto está cumprindo seus objetivos.
> ⚠️ KPIs de exemplo — confirme metas reais com o PO antes de tratar como compromisso.

| KPI | O que mede | Meta |
|---|---|---|
| Taxa de cadastros duplicados | Integridade da base (CPF único) | 0% |
| Tempo de resposta de operações síncronas | Agilidade percebida no cadastro/pesquisa | p95 ≤ 500 ms |
| Cobertura de auditoria de ações críticas | Rastreabilidade de quem alterou o quê | 100% |

---

## Escopo

### Está dentro

- Cadastro, pesquisa, visualização, edição e exclusão (lógica) de clientes pessoa física.
- Identificação do cliente pelo CPF como chave de negócio única.

### Está fora (não-objetivos)

- Histórico de atendimentos e interações (domínio Atendimento).
- Pedidos, contratos e cobranças (domínios Vendas / Financeiro).
- Consulta de CPF na Receita Federal (apenas validação de formato).

---

## Domínios previstos (N1)

> Visão preliminar das grandes áreas que comporão o sistema. Cada uma será
> detalhada em seu próprio N1. Mantenha esta lista alinhada com `modules/INDEX.md`.

| Domínio | SIGLA | O que cuida |
|---|---|---|
| Clientes | CLI | Base cadastral e identidade dos clientes (pessoa física) |
| Atendimento ⚠️ | — | Interações e histórico de atendimento (não especificado) |
| Vendas ⚠️ | — | Pedidos, contratos e cobranças (não especificado) |

---

## Tom de voz e princípios de experiência

> Base visual: **CAIXA Design System** (tokens `--dsc-*`).

- **Tom**: claro, conciso e profissional — palavras simples, sem jargão desnecessário.
- **Princípios**:
  - **Consistência** — mesmos termos em todo o produto; aderência ao CAIXA Design System.
  - **Acessibilidade** — erro sinalizado por cor **e** texto; contraste mínimo 4.5:1; navegação por teclado.
  - **Erros humanos** — mensagens explicam o que houve e como resolver, nunca culpam a pessoa usuária.

---

## Restrições e premissas

- **Identidade pelo CPF**: o CPF é a chave de negócio do cliente e não pode haver duplicidade no cadastro.
- **Exclusão lógica (soft delete)**: registros não são removidos fisicamente — marcação via `deletedAt`.
- **Validação em dupla camada** (frontend + backend).
- **Auditoria de ações críticas** (quem / quando / o quê / alvo).
- **Aderência ao CAIXA Design System** em toda a interface.
- Premissa: o produto atende um único tenant (sem multitenancy). ⚠️

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| 2026-06-23 | Exemplo | N0 criado | Visão de produto inicial (exemplo genérico — domínio Clientes) |

---

## Instrução para a LLM

Ao gerar ou alterar qualquer N1/N2/N3:
1. Confronte o artefato com este N0 — escopo, objetivos e público-alvo.
2. Sinalize com ⚠️ qualquer divergência (funcionalidade que extrapola a visão, contradição de objetivo, persona não prevista).
3. O N0 é documento de visão — **não o reestruture** para acomodar detalhes de implementação. Proponha ajustes e peça aprovação antes de alterá-lo.

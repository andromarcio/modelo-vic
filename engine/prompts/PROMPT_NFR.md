# PROMPT NFR — Requisito Suplementar (Não-Funcional)
## Catálogo `global/NFR.md` · adicionar ou ajustar um NFR

> **Modelo de estrutura**: `global/NFR.md` (o próprio catálogo — já vem no contexto)
> **Quem participa**: arquiteto / dev / analista
> **Insumo necessário**: o `NFR.md` atual (carregado como global) + os dados do
> requisito coletados no questionário
> **Entrega**: o **arquivo `global/NFR.md` completo e atualizado** com o NFR
> adicionado ou ajustado
>
> **Atenção**: a saída **substitui** o arquivo inteiro. Reproduza **todo** o
> conteúdo existente e apenas integre a alteração — nunca devolva um fragmento.

---

## INSTRUÇÕES PARA O CLAUDE

Você vai **manter o catálogo de requisitos não-funcionais** (`global/NFR.md`),
equivalente à *Especificação Suplementar* do RUP. Trabalhe a partir do `NFR.md`
atual (no contexto) e dos dados informados no questionário.

Regras da sessão:
- **Devolva o arquivo `global/NFR.md` inteiro**, com o cabeçalho, as seções de
  roteamento/herança, o índice e **todos os NFRs já existentes preservados** —
  acrescentando ou ajustando apenas o requisito desta sessão.
- **Não altere** requisitos não relacionados nem reescreva os existentes.
- Mantenha **exatamente** o formato canônico de cada NFR (ver abaixo).
- Sinalize com ⚠️ qualquer suposição (ex.: critério de aceitação inferido).
- **Não invente NFRs** além do solicitado.

---

## CONTEXTO DO PROJETO

=== MASTER.md ===
[carregado automaticamente]

=== NFR.md (estado atual) ===
[carregado automaticamente]

=== DADOS DO REQUISITO (questionário) ===
[as respostas do formulário entram aqui]

---

## PASSO 1 — Determinar ação, categoria e ID

1. **Ação**: se o usuário informou um ID existente para ajustar (ex.: `DES-01`),
   **edite aquele item no lugar**, preservando o ID. Caso contrário, é um
   **novo** NFR.
2. **Categoria** (prefixo do ID): mapeie a categoria informada para uma das siglas
   FURPS+ do catálogo:
   - **DES** — Desempenho
   - **SEG** — Segurança
   - **CONF** — Confiabilidade / disponibilidade
   - **AUD** — Auditoria e rastreabilidade
   - **USA** — Usabilidade / acessibilidade
   - **SUP** — Suportabilidade / observabilidade
   - **REST** — Restrições de design e implementação
   Se a categoria informada não existir ainda no arquivo, crie a seção
   correspondente na ordem do template.
3. **ID novo**: use o **próximo número sequencial** dentro da categoria, lendo os
   IDs já presentes (ex.: se existe `SEG-01..04`, o novo é `SEG-05`). Não reutilize
   números de itens removidos.

---

## PASSO 2 — Montar o NFR no formato canônico

Cada NFR segue **exatamente** este bloco:

```markdown
### [CATEGORIA-NN] — [Título curto]

**Requisito**: [a qualidade que o sistema deve ter — uma a duas frases]

**Critério de aceitação**: [condição objetiva e verificável de atendimento]

**Verificação**: [como se comprova — teste de carga, teste negativo, revisão…]

**Exceções**: [quando não se aplica, ou → ver outro NFR]   (incluir só se houver)
```

Regras de conteúdo:
- **Requisito** descreve uma **qualidade** do sistema (*quão bem* ele faz algo),
  nunca um comportamento de negócio (*o que* ele faz). Se o que foi informado é,
  na verdade, uma regra de negócio, **avise** e proponha encaminhá-la a
  `RULES-DICTIONARY` / N1 / N3 em vez de criar um NFR.
- **Critério de aceitação** deve ser **verificável** (limite numérico, condição
  binária, padrão a conferir). Se vier vago, torne-o objetivo e marque ⚠️.
- **Verificação** indica o meio de prova (teste de carga, teste negativo de API,
  revisão de contrato, checagem de acessibilidade…).

---

## PASSO 3 — Integrar ao arquivo e atualizar o índice

1. Insira (ou substitua) o bloco na **seção da categoria** correta, ao final dos
   itens daquela categoria.
2. Atualize a **tabela de Índice** no topo: adicione/ajuste a linha
   `| [ID](#âncora) | [Categoria] | [Requisito] |`, mantendo a ordem por categoria.
3. Preserve o restante do arquivo **sem alterações** (cabeçalho, roteamento,
   herança, template e instrução para a LLM).

---

## PASSO 4 — Geração do artefato

Gere o **`global/NFR.md` completo** já atualizado. Depois, resuma em uma linha o
que mudou, para servir de mensagem de commit:

> "NFR [ID] [adicionado | ajustado]: [título]."

Se algum dado essencial faltou (critério não verificável, categoria ambígua),
gere mesmo assim com o melhor preenchimento possível, marque os pontos com ⚠️ e
liste-os ao final para revisão.

<!-- doc-template-engine: {{VERSION}} | prompt: {{PROMPT_ID}} | atualizado: {{YYYY-MM-DD}} -->
# NFR.md
> Catálogo de **Requisitos Não-Funcionais** (Especificação Suplementar, à la RUP).
> Reúne as **qualidades** do sistema — *quão bem* ele faz algo (desempenho,
> segurança, confiabilidade…) — separadas das regras de negócio (*o quê* ele faz).
>
> **Quem mantém**: arquiteto / dev / analista (ver `PROMPT_NFR.md`)
> **Atualização**: a cada NFR a saída **substitui o arquivo inteiro** — preserve
> todos os itens existentes e apenas integre a alteração.

---

## Roteamento — o que é (e o que não é) NFR

Antes de criar um NFR, classifique:

- **É NFR** → uma **qualidade** do sistema: tempo de resposta, segurança,
  disponibilidade, auditoria, usabilidade, restrição técnica. Registre aqui.
- **Não é NFR**:
  - **invariante de negócio** (*o quê* o sistema garante) → `RULES-DICTIONARY.md` (canônica) ou N1 (transversal de domínio) ou N3 (específica da feature);
  - **mensagem de UI** → `MESSAGE-DICTIONARY.md`;
  - **código de erro** → `ERROR-DICTIONARY.md`.

## Herança

NFRs são **herdados** por todas as features — não se repetem nos N3. Um N3 só
**referencia** um NFR quando precisa apontá-lo explicitamente (ex.: a seção
`## AuditLog` aponta `→ ver NFR: AUD-01`). Nunca reescreva a qualidade no N3.

---

## Índice

| ID | Categoria | Requisito |
|---|---|---|
| [AUD-01](#aud-01--registro-de-auditoria) | Auditoria | Ações críticas ficam registradas em log de auditoria |

> Categorias (prefixos FURPS+): **DES** Desempenho · **SEG** Segurança ·
> **CONF** Confiabilidade/Disponibilidade · **AUD** Auditoria/Rastreabilidade ·
> **USA** Usabilidade/Acessibilidade · **SUP** Suportabilidade/Observabilidade ·
> **REST** Restrições de design e implementação.

---

## DES — Desempenho

> *(sem itens ainda — adicione no formato canônico abaixo)*

## SEG — Segurança

> *(sem itens ainda)*

## CONF — Confiabilidade / Disponibilidade

> *(sem itens ainda)*

## AUD — Auditoria e rastreabilidade

### AUD-01 — Registro de auditoria

**Requisito**: ações críticas (criação, alteração e exclusão de registros
sensíveis) devem ser registradas em log de auditoria, com autor, data/hora e o
que mudou.

**Critério de aceitação**: para toda ação marcada como auditável, existe um
registro de auditoria recuperável contendo identificação do autor, timestamp e
o delta (antes/depois) da operação.

**Verificação**: teste que executa a ação e confere a criação do registro de
auditoria correspondente; revisão da cobertura de ações auditáveis.

## USA — Usabilidade / Acessibilidade

> *(sem itens ainda)*

## SUP — Suportabilidade / Observabilidade

> *(sem itens ainda)*

## REST — Restrições de design e implementação

> *(sem itens ainda)*

---

## Formato canônico de um NFR

Cada item segue **exatamente** este bloco, na seção da sua categoria:

```markdown
### [CATEGORIA-NN] — [Título curto]

**Requisito**: [a qualidade que o sistema deve ter — uma a duas frases]

**Critério de aceitação**: [condição objetiva e verificável de atendimento]

**Verificação**: [como se comprova — teste de carga, teste negativo, revisão…]

**Exceções**: [quando não se aplica, ou → ver outro NFR]   (incluir só se houver)
```

Regras de conteúdo:
- **Requisito** descreve uma **qualidade** (*quão bem*), nunca um comportamento de negócio (*o quê*).
- **Critério de aceitação** deve ser **verificável** (limite numérico, condição binária, padrão a conferir).
- **ID novo**: próximo número sequencial dentro da categoria (não reutilize números removidos).

---

## Instrução para a LLM

Ao adicionar ou ajustar um NFR (PROMPT_NFR):
1. Determine ação (novo vs. ajuste de ID existente), categoria (prefixo FURPS+) e ID sequencial.
2. Monte o bloco no formato canônico, na seção da categoria correta.
3. Atualize a tabela de **Índice** no topo.
4. **Devolva o arquivo inteiro** com todos os itens preservados — nunca um fragmento.
5. Se o que foi informado é regra de negócio (não qualidade), avise e encaminhe ao RULES-DICTIONARY/N1/N3 em vez de criar um NFR.

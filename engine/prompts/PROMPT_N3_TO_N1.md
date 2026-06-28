# PROMPT N3→N1 — Síntese do Domínio a partir dos N2s (ou N3s)

> **Modelo de estrutura**: `engine/templates/modules/_template-dominio/README.md` *(referência humana — o prompt já embute o esqueleto)*
> **Quem participa**: Analista de Requisitos / Tech Lead
> **Insumo necessário**: todos os N2s de um domínio — ou, na ausência de N2s,
> os N3s diretamente (o prompt trata os dois casos)
> **Entrega**: README.md do N1 (Domínio) sintetizado a partir das specs existentes
>
> **Quando usar**: sistema existente cujos N2s (e/ou N3s) já foram escritos
> mas o N1 ainda não existe — ou precisa ser regenerado para refletir o estado atual
>
> **Pré-requisito recomendado**: rodar PROMPT_N3_TO_N2 antes para ter os N2s prontos;
> se não houver N2s, é possível partir dos N3s diretamente (veja PASSO 1)

---

## INSTRUÇÕES PARA O CLAUDE

Você é um Analista de Requisitos Sênior. Sua missão é ler os N2s (e/ou N3s)
de um domínio e consolidar as informações em um README.md de N1 coerente,
sem inventar nada que não esteja nos insumos fornecidos.

Regras da sessão:
- Derive tudo exclusivamente do conteúdo dos N2s/N3s fornecidos.
- Se uma informação necessária para o N1 não puder ser inferida, sinalize
  com ⚠️ e inclua um placeholder para preenchimento manual.
- As seções negociais (visíveis para PO) devem usar linguagem de negócio —
  sem mencionar tabelas, endpoints ou tecnologias.
- As seções técnicas ficam dentro de `<div class="dev-only">`.
- Sinalize suposições com ⚠️.

---

## CONTEXTO DO PROJETO

=== IDENTIFICAÇÃO ===
Domínio: [nome do Domínio]
Caminho de destino: `modules/[dominio]/README.md`

=== N2s DO DOMÍNIO ===
[cole aqui cada N2 — separe com `---` e indique o nome do Feature Set como título]

=== N3s ADICIONAIS (se não houver N2s, ou para complementar) ===
[cole aqui N3s que não têm N2 gerado — ou remova esta seção]

=== ÍNDICE DE OUTROS DOMÍNIOS (para mapear integrações) ===
[cole aqui o modules/INDEX.md, ou liste os outros domínios do sistema com
uma linha de descrição de cada — para que o Claude identifique dependências]

---

## PASSO 1 — Confirmação do escopo e modo de operação

Confirme o que foi recebido e identifique o modo:

> **Modo A — N2s disponíveis:**
> "Recebi [N] Feature Sets do domínio **[nome]**: [lista].
> Posso sintetizar o N1 a partir deles?"

> **Modo B — Apenas N3s disponíveis:**
> "Não recebi N2s. Recebi [N] features (N3) diretamente: [lista agrupada por
> Feature Set inferido].
> Vou inferir os Feature Sets antes de sintetizar o N1. Posso prosseguir?"

---

## PASSO 2 — Extração dos elementos do N1

**[Estado: EXTRACAO]**

### Seções negociais (visíveis para PO)

1. **Descrição do domínio** — qual problema de negócio unifica todos
   os Feature Sets? O que está explicitamente fora do escopo deste domínio?
   *(Derive das seções "Descrição" e "Não faz" dos N2s)*

2. **O que este domínio NÃO faz** — cruze os limites declarados nos N2s e
   identifique a qual outro domínio cada responsabilidade excluída pertence.

3. **ID do domínio** — derive dos IDs presentes nos N2s/N3s (sigla já existente)
   ou proponha uma sigla de exatamente 3 letras maiúsculas se ainda não existir

4. **Índice de Feature Sets** — nome, pasta, ID e descrição de cada um,
   com contagem de features
   *(Derive dos N2s ou do agrupamento dos N3s no Modo B)*

4. **Regras transversais de negócio** — regras de negócio presentes em 2 ou
   mais Feature Sets do domínio; são candidatas a regra de domínio
   *(Cruze as seções "Regras de negócio" dos N3s ou N2s)*

5. **Integrações com outros domínios** — identifique referências a entidades,
   perfis ou eventos de outros domínios nos N3s/N2s; classifique como
   leitura ou escrita e descreva em linguagem de negócio

### Seções técnicas (`<div class="dev-only">`)

6. **Entidades do domínio** — lista das entidades mencionadas nos N3s,
   com nome, descrição e referência ao DATA-MODEL.md

7. **Dependências externas** — serviços externos citados nos N3s
   (seção "Dependências" dos N3s técnicos)

8. **Regras de acesso consolidadas** — consolide as matrizes de permissão
   de todos os N2s em uma visão por role do domínio

---

## PASSO 3 — Apresentação e validação

Apresente o rascunho do N1 no formato do template e pergunte:

> "N1 sintetizado para o domínio **[nome]**. Verifique:
> - ⚠️ Há [N] ponto(s) que não puderam ser inferidos — marcados com ⚠️.
> - As regras transversais identificadas são realmente do domínio, ou
>   deveriam ir para o RULES-DICTIONARY?
> - As integrações com outros domínios estão corretas?
> Posso gerar o arquivo final?"

---

## PASSO 4 — Geração do artefato final

Após aprovação, gere o arquivo completo seguindo o template N1:

```markdown
<!--
  CONVENÇÃO DE VISIBILIDADE
  Blocos <div class="dev-only"> contêm detalhes técnicos.
  Versão PO  → CSS: .dev-only { display: none; }
  Versão DEV → sem CSS adicional
-->

# Domínio: [Nome do Domínio]
> **Nível 1** - Visão estratégica do domínio - `[SIGLA]`

## Descrição
[síntese em 2-3 frases]

### O que este domínio NÃO faz
| Descrição | Pertence a |
|---|---|
| [o que não faz] | [Domínio responsável] |

---

## Feature Sets

| Feature Set | Arquivo de Especificação (N2) | Descrição | Features |
|---|---|---|---|
| **[Nome do Feature Set]** <small>[SIGLA]-[SFS]</small> | [[pasta]/README.md](./[pasta]/README.md) | [descrição em uma linha] | [N] |

---

## Regras transversais de negócio

1. [Regra que se aplica a todas as features deste domínio]

---

## Integrações com outros domínios

### Leitura — domínios que consomem dados deste domínio
| Domínio | O que consome | Como |
|---|---|---|
| [Domínio] | [entidade/campo em Label PO] | FK / Evento / Serviço |

### Escrita — domínios que criam ou alteram dados deste domínio
| Domínio | O que altera | Situação |
|---|---|---|
| [Domínio] | [entidade/campo em Label PO] | [quando ocorre] |

---

<div class="dev-only">

## Entidades do domínio

| Entidade | Descrição | Campos no DATA-MODEL.md |
|---|---|---|
| [Nome] | [descrição em uma linha] | → ver DATA-MODEL.md: [Nome] |

---

## Dependências externas

| Serviço | Uso | Lib sugerida |
|---|---|---|
| [serviço] | [para que é usado] | [lib] |

---

## Regras de acesso consolidadas

| Role | Pode fazer |
|---|---|
| [role] | [permissões resumidas] |

</div>

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| [data atual] | [Claude / autor] | N1 criado | Sintetizado a partir dos N2s/N3s pelo PROMPT N3→N1 |

---

*Última revisão: [data]*
*Links: [Feature Set 1](./[pasta]/README.md) · [INDEX geral](../INDEX.md)*
```

Ao finalizar, informe:
> "✅ N1 do domínio **[nome]** gerado. Salve em `modules/[dominio]/README.md`.
>
> **Próximos passos recomendados:**
> - Atualize o `modules/INDEX.md` com este domínio
> - Adicione ao DATA-MODEL.md as entidades marcadas com ⚠️
> - Rode PROMPT_AUDIT_RULES_DEDUP para verificar se alguma regra transversal
>   identificada aqui já existe em outro domínio"

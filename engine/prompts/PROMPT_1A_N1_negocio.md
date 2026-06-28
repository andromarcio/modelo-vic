# PROMPT 1A — N1 Negócio
## Domínios do sistema · Parte negocial

> **Modelo de estrutura**: `engine/templates/modules/_template-dominio/README.md` *(referência humana — o prompt já embute o esqueleto)*
> **Quem participa**: PO + dev (ou só PO)
> **Insumo necessário**: visão geral do sistema em linguagem natural
> **Entrega**: rascunho do README.md de cada domínio com descrições,
> limites e Feature Sets — sem campos de banco ou detalhes técnicos
>
> **Próximo passo**: após aprovação, usar PROMPT_1B com cada README.md gerado

---

## INSTRUÇÕES PARA O CLAUDE

Você vai me ajudar a mapear os domínios do sistema do ponto de vista
de negócio. Foque exclusivamente em linguagem de negócio — sem mencionar
tabelas, campos de banco, endpoints ou tecnologias.

Regras da sessão:
- Faça uma pergunta de cada vez e aguarde minha resposta antes de prosseguir.
- Ao completar as perguntas de um domínio, gere o artefato parcial e aguarde
  aprovação antes de iniciar o próximo.
- Sinalize suposições com ⚠️.
- Ao final, gere o INDEX negocial com a visão consolidada do sistema.

---

## CONTEXTO DO PROJETO

=== MASTER.md ===
[cole aqui o conteúdo do MASTER.md]

---

## PASSO 1 — Mapeamento geral

Faça esta pergunta única e aguarde:

> "Quais são as grandes áreas de negócio do sistema?
> Liste cada uma com nome e uma frase descrevendo o que ela cuida."

Com a resposta, monte a lista de domínios e, para cada um, proponha uma sigla
de exatamente 3 letras maiúsculas como ID do domínio. Confirme comigo:
> "Confirmo as áreas e IDs propostos abaixo. Ajusta algum ou posso detalhar a primeira?
>
> | Domínio | ID proposto |
> |---|---|
> | [Nome] | [SIGLA] |"

---

## PASSO 2 — Detalhamento negocial de cada domínio

Para cada domínio, faça as perguntas abaixo em sequência,
uma de cada vez, aguardando minha resposta:

**Pergunta 1 — Propósito e limites**
> "Em uma ou duas frases: o que a área [nome] faz?
> E o que ela explicitamente não faz — onde termina sua responsabilidade?"

**Pergunta 2 — Agrupamentos funcionais**
> "Quais são os grupos de funcionalidade dentro desta área?
> Para cada grupo: nome e uma linha do que engloba.
> Pense em termos do que o usuário faz, não de como o sistema funciona."

> **Atribua aqui o ID de cada Feature Set.** Para cada grupo identificado, proponha
> uma **sigla de 3 letras maiúsculas** derivada do nome, formando o ID `[SIGLA]-[SFS]`
> (ex.: no domínio `CAD`, "Fundos Geridos" → `CAD-GFG`), **única dentro do domínio**.
> Confirme antes de seguir:
> > "Feature Sets de **[área]** (`[SIGLA]`) e IDs propostos:
> >
> > | Feature Set | ID |
> > |---|---|
> > | [Nome] | [SIGLA]-[SFS] |
> >
> > Ajusto algum ou sigo?"
>
> Esse ID é **definitivo** e nasce no N1: o PROMPT_2A e os atalhos (CRUD/Wizard)
> **reutilizam** essa sigla, não geram outra. Isso permite referenciar o Feature Set
> (ex.: "vamos especificar `CAD-GFG`") antes mesmo de o N2 existir.

**Pergunta 3 — Regras que valem para tudo nesta área**
> "Existe alguma regra de negócio que se aplica a tudo dentro desta área?
> Exemplos: 'qualquer ação exige aprovação de um gerente',
> 'dados desta área são visíveis apenas para o time de vendas'."

> **Roteamento — regra de negócio × NFR**: registre em "Regras transversais de
> negócio" apenas **invariantes de negócio** (o *que* a área garante). Se a
> resposta trouxer uma **qualidade do sistema** — tempo de resposta, segurança,
> disponibilidade, auditoria, restrição técnica — ela **não** é regra transversal:
> pertence ao `global/NFR.md`. Se já houver NFR equivalente, não duplique; se for
> novo, sinalize:
> > "⚠️ Isto é um requisito não-funcional ([categoria]). Não entra no N1 —
> > proponho registrá-lo no NFR.md como [ID sugerido]. Confirma?"

**Pergunta 4 — Integrações com outras áreas**
> "Esta área **consome** informações de outras áreas para funcionar (leitura)?
> Outras áreas **criam ou alteram** dados desta área (escrita)?
> Para cada caso: qual área e qual informação, em linguagem de negócio."

Com as respostas, gere o artefato parcial:

📄 `modules/[dominio]/README.md` — seções negociais

**Gere exatamente esta estrutura — sem adicionar seções, subtítulos ou elementos não listados abaixo:**

```
# Domínio: [Nome]
> **Nível 1** - Visão estratégica do domínio - `[SIGLA]`

## Descrição
[2-3 frases sobre o que faz]

### O que este domínio NÃO faz
| Descrição | Pertence a |
|---|---|
| [o que está fora do escopo] | [Domínio responsável] |

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
| [Domínio] | [entidade/campo em Label PO] | [a confirmar no PROMPT_1B] |

### Escrita — domínios que criam ou alteram dados deste domínio
| Domínio | O que altera | Situação |
|---|---|---|
| [Domínio] | [entidade/campo em Label PO] | [quando ocorre] |

---

## Changelog

| Data | Autor | Tipo | Descrição |
|---|---|---|---|
| [data atual] | [Claude / autor] | N1 negocial criado | Gerado pelo PROMPT 1A |

---

*Última revisão: —*
*Links: [Feature Set 1](./[pasta]/README.md) · [INDEX geral](../INDEX.md)*
```

> **Tabela de Feature Sets** — renderize cada Feature Set como
> `**Nome** <small>[SIGLA]-[SFS]</small>` (nome em negrito + ID em `<small>`, mesmo
> padrão das Features no N2). O **ID `[SIGLA]-[SFS]` é atribuído aqui no N1** (Pergunta 2)
> e é definitivo — o PROMPT_2A o reutiliza. O link na coluna *Arquivo de Especificação
> (N2)* (`./[pasta]/README.md`) e a contagem de **Features** (`[N]`) só são preenchidos
> quando o Feature Set é detalhado no PROMPT_2A. O rodapé `*Links:*` também aponta para
> os Feature Sets do domínio.

Seções deixadas em branco para o PROMPT 1B:
- Entidades e campos
- Integrações técnicas

Após apresentar, pergunte:
> "O N1 negocial de [domínio] está correto?
> Ajusta algo ou avanço para o próximo domínio?"

---

## PASSO 3 — INDEX negocial

Após todos os domínios aprovados, gere:

📄 `modules/INDEX.md` — versão negocial

Conteúdo:
- Tabela de domínios com nome, descrição e Feature Sets
- Mapa de dependências entre domínios em linguagem de negócio
- Lista de regras que cruzam mais de um domínio

Após apresentar o INDEX, prossiga para o Passo 4.

---

## PASSO 4 — Verificação contra o N0 (nível imediatamente anterior)

Sempre que um domínio (N1) for gerado ou alterado, confronte-o com o
`N0_PRODUCT_VISION.md`:

- Verifique se o domínio e seus Feature Sets são coerentes com a visão de
  produto (objetivos, escopo, público-alvo).
- Se o N0 mantém uma lista de domínios/áreas e o novo domínio não estiver
  refletido, proponha incluí-lo.
- Sinalize com ⚠️ qualquer divergência entre o que o N1 descreve e o que o
  N0 estabelece (escopo que extrapola a visão, contradição de objetivo).

O N0 é um documento de visão — não o reestruture; limite-se a alinhar e a
registrar divergências, pedindo aprovação antes de qualquer ajuste no N0.

Ao finalizar, informe:
> "Parte negocial do N1 concluída. Para complementar com os campos,
> entidades e integrações técnicas, use o PROMPT_1B passando
> cada README.md gerado aqui como contexto."

---

## Checklist de conformidade do N1

Antes de apresentar cada domínio, confira (todos os itens são obrigatórios):

- [ ] Título exatamente `# Domínio: [Nome]`
- [ ] Subtítulo em blockquote: `> **Nível 1** - Visão estratégica do domínio - [SIGLA]` (SIGLA de **3 letras maiúsculas** em crase, hífens `-`)
- [ ] Descrição (2-3 frases) seguida da subseção `### O que este domínio NÃO faz` (tabela Descrição | Pertence a)
- [ ] **Feature Sets**: tabela (Feature Set | Arquivo de Especificação (N2) | Descrição | Features); coluna *Feature Set* no formato `**Nome** <small>[SIGLA]-[SFS]</small>` com o **ID já atribuído** (`[SFS]` de 3 letras, único no domínio); link para `./[pasta]/README.md` na coluna *Arquivo*; rodapé `*Links:*` apontando para os Feature Sets
- [ ] **Regras transversais de negócio**: lista numerada de **invariantes** (o *quê* a área garante) — qualidade do sistema (desempenho/segurança/auditoria) **não** entra aqui, vai para `global/NFR.md`
- [ ] **Integrações com outros domínios**: tabelas de Leitura e Escrita em linguagem de negócio (a coluna *Como* pode ficar para o dev confirmar no PROMPT_1B)
- [ ] **Changelog**
- [ ] **Nenhuma** seção técnica: entidades, campos, dependências externas e regras de acesso ficam para o **PROMPT_1B** (que também confirma a coluna *Como* das Integrações)
- [ ] Ao fechar todos os domínios: `modules/INDEX.md` negocial atualizado e cada N1 conferido contra o N0

> **Gate determinístico** — após gravar o N1, rode `node scripts/validate-doc.mjs <arquivo>`.
> Ele detecta o nível pelo subtítulo e exige as seções obrigatórias do N1 (Descrição +
> `### O que este domínio NÃO faz`, Feature Sets, Regras transversais de negócio, Changelog).
> O artefato só é conforme quando o validador retorna `✓` (sai com código 0).

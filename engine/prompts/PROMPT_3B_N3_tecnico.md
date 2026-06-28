# PROMPT 3B — N3 Técnico
## Features · Parte técnica

> **Modelo de estrutura**: `engine/templates/modules/_template-dominio/_template-feature-set/_template-feature.md` *(referência humana — o prompt já embute o esqueleto)*
> **Quem participa**: dev
> **Insumo necessário**: .md negocial aprovado pelo PO + N1 + N2 +
> fragmento `global/data-models/[dominio].md` (+ índice `global/DATA-MODEL.md`)
> **Entrega**: .md completo + `global/data-models/[dominio].md` atualizado com
> campos novos (e o índice `global/DATA-MODEL.md` quando houver entidade/ALI nova)
>
> **Pré-requisito**: PROMPT_3A concluído e aprovado para a feature
> **Atenção**: campos novos identificados nesta sessão vão para o fragmento
> `global/data-models/[dominio].md`, nunca para uma tabela de mapeamento dentro do N3

---

## INSTRUÇÕES PARA O CLAUDE

Você vai complementar o N3 negocial com as definições técnicas da feature.
O conteúdo negocial já foi validado pelo PO e não deve ser alterado.

Regras da sessão:
- Trabalhe uma feature de cada vez.
- **Passo 1 é obrigatório antes de qualquer outro**: cruzar todos os campos
  do N3 com o fragmento `global/data-models/[dominio].md`. Campos novos requerem
  aprovação explícita e devem ser listados para adição ao fragmento — nunca
  adicionados ao N3.
- O N3 não terá tabela de mapeamento de campos — apenas referência:
  `→ ver DATA-MODEL.md: Entidade [Nome]` (o índice `DATA-MODEL.md` é o nome
  lógico da citação; os campos detalhados vivem no fragmento do domínio).
- Aplicar FIELD-DICTIONARY e RULES-DICTIONARY automaticamente.
- Se identificar um campo/regra reutilizável ainda não dicionarizado, sinalize ⚠️
  para promoção ao FIELD-DICTIONARY / RULES-DICTIONARY (a decisão é negocial — 3A/4A).
- Siga rigorosamente o API-PATTERNS.md para todos os endpoints.
- Sinalize suposições com ⚠️.

---

## CONTEXTO DO PROJETO

=== MASTER.md ===
[cole aqui o conteúdo do MASTER.md]

=== NFR.md ===
[cole aqui o conteúdo do global/NFR.md — requisitos não-funcionais herdados]

=== DATA-MODEL (fragmento do domínio) ===
[cole aqui o conteúdo de global/data-models/[dominio].md — e, se útil, o índice global/DATA-MODEL.md]

=== API-PATTERNS.md ===
[cole aqui o conteúdo do API-PATTERNS.md]

=== SIZING.md ===
[cole aqui o conteúdo do global/SIZING.md — critérios de contagem APF]

=== FIELD-DICTIONARY.md ===
[cole aqui o conteúdo do FIELD-DICTIONARY.md]

=== RULES-DICTIONARY.md ===
[cole aqui o conteúdo do RULES-DICTIONARY.md]

=== N1 DO DOMÍNIO ===
[cole aqui o README.md do domínio]

=== N2 DO FEATURE SET ===
[cole aqui o README.md do Feature Set]

=== N3 NEGOCIAL DA FEATURE (gerado pelo PROMPT 3A) ===
[cole aqui o .md negocial aprovado]

---

## PASSO 1 — Cruzamento de campos com o fragmento data-models/[dominio].md

**Este passo é obrigatório e deve ser concluído antes de qualquer outro.**

Leia cada campo da tabela de campos do N3 negocial e:

1. Localize no fragmento `global/data-models/[dominio].md` o Label Dev e o campo banco correspondentes
2. Se o campo existir: confirme e prossiga
3. Se o campo NÃO existir: proponha Label Dev (camelCase) e campo banco (snake_case), ambos em português, com ⚠️

Apresente o resultado:

```
Campos existentes no fragmento global/data-models/[dominio].md:
- "[Label PO]" → Label Dev: [camelCase] | Campo banco: [snake_case] ✅

Campos NOVOS (requerem aprovação e adição ao fragmento global/data-models/[dominio].md):
⚠️ "[Label PO]" → Label Dev proposto: [camelCase] | Campo banco: [snake_case] | Tipo: [tipo SQL]
```

**Aguarde aprovação explícita de todos os campos novos antes de continuar.**

**Campos de seleção (`seleção → [Entidade]` no N3):** além do cruzamento acima,
para cada campo de seleção confirme ou proponha a linha correspondente em
**DATA-MODEL.md → Relacionamentos de seleção (comboboxes)**:

```
Relacionamentos de seleção a registrar no DATA-MODEL.md:
- "[Label PO]" → Campo (FK): [campoId] | Entidade origem: [Entidade] | Campo-valor: id | Campo-label: [labelDev] | Endpoint: GET /api/v1/[recurso] | Filtro: [restrição] ⚠️
```

- O **campo-valor** é a FK (`uuid`) gravada no registro; o **campo-label** é o que
  a combobox exibe; o **endpoint origem** é a rota de coleção da entidade origem
  (já coberta pelo API-PATTERNS, com `?search=` para autocomplete) — nunca um
  endpoint novo dedicado.
- A validação do `[campoId]` recebido (existe? pertence à organização?) segue o
  isolamento por organização do API-PATTERNS — recurso de outra organização
  retorna 404.
- A **estratégia de carga** (lista completa vs. autocomplete) permanece na coluna
  Validação do campo no N3 negocial; não a duplique aqui.

Após aprovação, a seção técnica do N3 terá apenas:
```markdown
## Mapeamento de campos
→ ver DATA-MODEL.md: Entidade [Nome da Entidade]
```

---

## PASSO 2 — Endpoints

**Pergunta 1**
> "Quantos e quais tipos de operação esta feature realiza?
> Existe algum processamento assíncrono (em segundo plano)?"

Com a resposta e seguindo rigorosamente o API-PATTERNS.md, defina
para cada endpoint:
- Método HTTP e rota
- Acesso (público / autenticado; quais roles)
- Body ou query params tipados em TypeScript
  (usar Label Dev dos campos — ver DATA-MODEL.md para referência)
- Exemplo de resposta de sucesso (JSON com HTTP status)
- Tabela de respostas de erro (HTTP | code | situação)

---

## PASSO 3 — Eventos e AuditLog

**Pergunta 2**
> "O N3 negocial menciona ações automáticas ao concluir (e-mail,
> notificação, tarefa). Quais módulos precisam saber que esta ação ocorreu?
> Existe algum evento que esta feature consome de outros módulos?"

Com a resposta, defina:

**Eventos publicados**: evento | quando | payload | consumidores

**Eventos consumidos**: evento | publicado por | reação

**AuditLog** (se a ação é crítica — materializa o NFR **AUD-01**):
Inicie a seção com a referência de rastreabilidade `→ ver NFR: AUD-01` e então o registro:
```typescript
logAction({
  organizationId: context.organizationId,
  userId: context.userId,
  action: '[entidade.acao]',
  targetEntity: '[Entidade]',
  targetId: [entidade].id,
  metadata: { [Label Dev dos campos relevantes] }
  // Label Dev completo: ver DATA-MODEL.md: Entidade [Nome]
})
```

---

## PASSO 4 — Cenários Gherkin técnicos

Com base nos cenários negociais do N3, gere os cenários técnicos adicionais:
- Comportamento de cookies, headers e tokens de sessão
- Formato exato de erros HTTP (status + JSON de resposta)
- Jobs assíncronos (polling de status, falhas de worker)
- Race conditions relevantes

Para cenários de campos canônicos e regras canônicas, use marcadores
de importação em vez de reescrever:
```gherkin
# ← FIELD-DICTIONARY: [nome do campo] (cenários já especificados)
# ← RULES-DICTIONARY: [nome da regra] (cenários já especificados)
```

---

## PASSO 5 — Arquivos e dependências

Com base em tudo definido, liste:

**Arquivos a criar ou alterar**:
```
[caminho/arquivo]     ← [o que faz]
```

**Dependências**:
- [Lib/Serviço] — [para que é usado nesta feature]

---

## PASSO 6 — Métricas de tamanho (APF)

Conte os **Pontos de Função (APF)** desta feature seguindo `global/SIZING.md`.
Registre **apenas Funções de Transação** (EE, SE, CE) — as Funções de Dados (ALI/AIE)
são contadas centralmente no DATA-MODEL.md, **não** no N3.

> **A contagem reflete o que está documentado.** Conte DER e ALR a partir do que o N3
> registra (tabela `## Campos`, `## Dependências`, entidades referenciadas) — **não
> estime nem antecipe** campos/leituras não especificados. Se o número exigir algo que
> falta no N3, **sinalize a lacuna com ⚠️ e complete a documentação antes de fechar a
> contagem**. Toda quantidade na tabela deve ser rastreável aos campos do próprio N3.

**6.1 — A unidade de contagem é a feature (N3), não o endpoint** (ver `global/SIZING.md`)
A fronteira da aplicação é a interface **usuário↔sistema** — **não** a divisão técnica
Angular↔BFF. O front e o BFF são camadas internas da **mesma** feature. Por isso:
- Avalie a **feature inteira** (front + BFF) como um **processo elementar (PE) candidato**.
  Ter o backend em BFF interno **não** é, por si só, motivo para não contar.
- A feature **conta** se satisfaz os critérios de PE (significativa para o usuário,
  transação completa e autocontida, deixa o sistema consistente), é **única** frente a
  outros PEs e se classifica como **EE/SE/CE**.
- **Não contam**: navegação/menus, telas que são apenas passos de outro PE, funções de
  suporte sem transação própria, e o endpoint do BFF olhado **isoladamente** — mas isso
  **não zera** a feature que ele atende.
- **Combobox/dropdown** que carrega opções de uma entidade ALI/AIE **conta** como CE (sem
  lógica) ou SE (com filtro/transformação) — uma vez por entidade consultada, por tela.

**6.2 — Classificar cada transação que conta**
- **EE** (Entrada Externa): POST/PUT/PATCH/DELETE — processa dados de fora para dentro.
- **SE** (Saída Externa): GET com cálculo, transformação ou relatório.
- **CE** (Consulta Externa): GET simples de listagem/detalhe, sem lógica adicional.

**6.3 — Complexidade (tabela ALR × DER do SIZING.md)**
Para cada transação, conte e **registre** os dois drivers:
- **DER** (Dado Elementar Referenciado = IFPUG DET) = campos no body/query da requisição + campos na resposta de sucesso.
  Campos de controle (HTTP status, cursor de paginação) **não contam**.
- **ALR** (Arquivo Lógico Referenciado = IFPUG FTR) = nº de ALIs/AIEs lidos ou mantidos pela transação (ver `## Dependências` e as entidades referenciadas no `## API`). Cada ALR deve existir em `global/ALI-AIE-MAP.md`.
- Cruze ALR × DER na tabela de Funções de Transação do SIZING.md → **Baixa / Média / Alta**.

**6.4 — PF por complexidade** (tabela do SIZING.md):

| Tipo | Baixa | Média | Alta |
|---|---|---|---|
| EE | 3 | 4 | 6 |
| SE | 4 | 5 | 7 |
| CE | 3 | 4 | 6 |

**6.5 — Preencher a seção `## Métricas de tamanho`** com a tabela e o total.
A coluna **Data** recebe a data de hoje em ISO (`AAAA-MM-DD`) — o dia em que a linha foi
contada; numa recontagem, mantenha a data anterior nas linhas cuja contagem não mudou.
O cabeçalho `## Métricas de tamanho` é seguido **diretamente pela tabela** — **não
escreva nenhum texto entre o título e a tabela**: nada de "Registra apenas Funções de
Transação (EE/SE/CE)…", aviso de contagem provisória ou explicação sobre ALI/AIE
estarem no DATA-MODEL. Essas notas existem só para orientar a contagem e vivem no
`global/SIZING.md`, não no N3 gerado. Qualquer ressalva pontual (lacuna ⚠️, contagem
provisória) vai no **Changelog** ou na **memória de cálculo** abaixo da tabela — nunca
entre o cabeçalho e a tabela.

| Função de Transação | Tipo | ALR | DER | Complexidade | PF | Data |
|---|---|---|---|---|---|---|
| [transação/endpoint que conta] | [EE/SE/CE] | [N] | [N] | [Baixa/Média/Alta] | [PF] | [AAAA-MM-DD] |

**Total: [N] PF**

Inclua também a **memória de cálculo** logo abaixo da tabela, registrando para cada transação
quais ALIs/AIEs entraram no ALR e quais campos entraram no DER:

```markdown
<details>
<summary>Memória de cálculo (ALR e DER por transação)</summary>

- **[transação]** — ALR = [N] ([ALIs/AIEs referenciados]); DER = [N] ([campos contados]) → tabela [EE | SE/CE] do SIZING.md → **[Complexidade] → [PF] PF**

</details>
```

> Registre **Total: 0 PF** apenas se a feature **não** for um processo elementar (ex.:
> navegação, tela que é só um passo de outro PE, suporte sem transação própria). Uma
> feature de negócio atendida 100% por BFF interno **não** é 0 PF por isso — classifique-a
> pelo tipo (EE/SE/CE).

Apresente a contagem e peça validação antes de gerar o arquivo:
> "Contagem APF: **[N] PF**. A classificação (EE/SE/CE), a complexidade e a regra de
> fronteira (BFF) estão corretas? Confirmo ou ajusto?"

---

## PASSO 7 — Geração do arquivo final

Apresente apenas as seções técnicas geradas. Pergunte:
> "As seções técnicas do N3 de [feature] estão corretas?
> Posso gerar o arquivo final mesclado?"

Após aprovação, gere o arquivo completo:

📄 `modules/[dominio]/g-[feature-set]/f-[verbo]-[entidade]-[adjetivo].md` — versão completa (usar o mesmo nome de arquivo gerado pelo PROMPT 3A; padrão: `f-` + verbo + entidade singular + adjetivo qualificador quando houver, em kebab-case)

> **Nota**: as seções técnicas **não existem** no N3 negocial gerado pelo PROMPT 3A — este prompt as cria e insere abaixo de `## Comportamento de tela`, dentro do bloco `<div class="dev-only">`.

**Estrutura obrigatória** — respeitar exatamente esta ordem e headings, sem adicionar seções ou elementos não listados:
```
# [Nome]

## Descrição                         ← negocial
## Origem                            ← negocial (só se houver história de origem)
## Superfície                        ← negocial (Tela própria | Ação em tela)
## Regras de negócio                 ← negocial (com refs. aos dicionários)
## Cenários                          ← negocial (grupos negociais + marcadores)
## Campos                            ← negocial (Label PO | Tipo | Obrig. | Validação)
## Campos automáticos                ← negocial (Label PO | Valor | Quando)
## Comportamento de tela             ← negocial
## Métricas de tamanho               ← APF — preencher com a contagem do PASSO 6 (sem COSMIC)

<div class="dev-only">
## Mapeamento de campos              ← apenas: → ver DATA-MODEL.md: Entidade [Nome]
## Cenários técnicos adicionais      ← técnico
## Mapeamento de erros               ← técnico
## API                               ← técnico
## Eventos                           ← técnico
## AuditLog                          ← técnico
## Arquivos a criar ou alterar       ← técnico
## Dependências                      ← técnico
</div>

## Implementação                     ← rastreabilidade (preenchido após dev)
## Changelog                         ← acrescentar entrada ao gerar o arquivo final
*Links: [N2] · [N1] · [INDEX]*       ← rodapé (última linha, como no template)
```

---

## PASSO 8 — Ações pós-sessão

Ao finalizar, informe obrigatoriamente:

> "✅ N3 de [feature] completo.
>
> **Ações obrigatórias antes de implementar:**
>
> 1. Adicionar ao fragmento global/data-models/[dominio].md — Entidade [Nome]:
> [tabela com campos novos aprovados, se houver]
> (e atualizar o índice global/DATA-MODEL.md — "Campos adicionados recentemente"
> e APF/ALI quando houver entidade ou arquivo lógico novo)
>
> 2. Atualizar o N2 do Feature Set (nível imediatamente anterior),
> `modules/[dominio]/[feature-set]/README.md`: garantir que a feature consta
> na tabela de Features com o link para o arquivo final e o status, e que
> telas/dependências novas estão refletidas. Sinalizar ⚠️ qualquer divergência.
>
> 3. Atualizar status no modules/INDEX.md:
> [feature] → 📋 Especificado
>
> 4. Consolidar a contagem em global/CONTAGEM-PF.md:
> adicionar/atualizar a linha desta feature em '## 1. Funções de Transação'
> (e a entidade em '## 2. Funções de Dados', se entidade/ALI novo) e recalcular
> os subtotais e o Total do sistema. Ver a regra de manutenção no topo do arquivo.
>
> 5. Após implementar: preencher seção 'Implementação' no N3
> e atualizar status para ✅ Implementado"

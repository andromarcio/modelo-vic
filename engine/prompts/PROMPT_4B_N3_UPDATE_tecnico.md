# PROMPT 4B — N3 Update Técnico
## Atualização de Feature Existente · Parte técnica

> **Modelo de estrutura**: `engine/templates/modules/_template-dominio/_template-feature-set/_template-feature.md` *(referência humana — o prompt já embute o esqueleto)*
> **Quem participa**: dev
> **Insumo necessário**: N3 negocial atualizado (PROMPT_4A aprovado) +
> data-models/[dominio].md + N3 original completo
> **Entrega**: .md completo atualizado + data-models/[dominio].md atualizado
>
> **Pré-requisito**: PROMPT_4A concluído e aprovado pelo PO
>
> ⚠️ **Use este prompt para manutenção (Brownfield).**
> Para features novas do zero, use PROMPT_3B.

---

## INSTRUÇÕES PARA O CLAUDE

Você vai complementar a atualização do N3 negocial com as definições técnicas.
O conteúdo negocial da atualização já foi validado pelo PO e não deve ser alterado.

Para evitar quebra de fluxo, você agirá como uma **Máquina de Estados**:

```
[INICIALIZACAO] → [LOCALIZACAO_FEATURE] → [ANALISE_BREAKING_CHANGES]
                → [ATUALIZACAO_DATA_MODEL] → [GERACAO_TECNICA] → [ARQUIVO_FINAL]
```

Regras da sessão:
- **Localize a feature antes de editar.** Confirme com o usuário qual N3 original e
  qual `data-models/[dominio].md` serão a base, buscando-os no repositório quando
  possível — não assuma o alvo
- Foque apenas nas partes técnicas afetadas pela mudança
- Campos novos vão para `global/data-models/[dominio].md` — NUNCA no N3
- Se a mudança introduz (ou revela) um campo/regra reutilizável ainda não
  dicionarizado, sinalize ⚠️ para promoção ao FIELD-DICTIONARY / RULES-DICTIONARY
  (a decisão é negocial — 4A); se altera um já canônico, avise que o dicionário
  pode precisar de ajuste
- **Avise explicitamente** se a mudança introduz breaking changes
- Siga rigorosamente o API-PATTERNS.md e o ERROR-DICTIONARY.md
- Sinalize suposições com ⚠️

---

## CONTEXTO DO PROJETO

=== MASTER.md ===
[cole aqui o conteúdo do MASTER.md]

=== DATA-MODEL do domínio (fragmentado) ===
[cole aqui o conteúdo de global/data-models/[dominio].md]

=== API-PATTERNS.md ===
[cole aqui o conteúdo do API-PATTERNS.md]

=== SIZING.md ===
[cole aqui o conteúdo do global/SIZING.md — critérios de contagem APF]

=== ERROR-DICTIONARY.md ===
[cole aqui o conteúdo do ERROR-DICTIONARY.md]

=== N3 COMPLETO ORIGINAL ===
[**No Claude Code**: deixe em branco — o engine localiza a feature no passo
LOCALIZACAO_FEATURE. **No fluxo copy-paste**: cole aqui o .md completo original.]

=== N3 NEGOCIAL ATUALIZADO (gerado pelo PROMPT_4A) ===
[cole aqui o .md negocial atualizado e aprovado]

---

## PASSO 1 — Inicialização

**[Estado: INICIALIZACAO]**

Confirme o que foi recebido e aguarde:
> "Vamos complementar a parte técnica de uma atualização de feature. Posso iniciar
> localizando a feature?"

---

## PASSO 2 — Localização da feature

**[Estado: LOCALIZACAO_FEATURE]**

Antes de analisar breaking changes, confirme qual feature será atualizada e quais
artefatos servem de base — não assuma o alvo.

**1. Identifique a feature** (pelo nome/ID informado ou pela atualização negocial do
PROMPT_4A que motivou esta sessão).

**2. Localize os insumos:**
- **No Claude Code (com ferramentas de arquivo):** leia do disco o N3 original
  completo em `modules/[dom]/[fs]/[feat].md` e o `global/data-models/[dominio].md`
  correspondente. Não peça para colar.
- **No fluxo copy-paste:** use o conteúdo colado na seção CONTEXTO; se faltar, peça.

**3. Apresente e confirme** antes de avançar:
> "Vou atualizar a parte técnica de:
> - **Feature:** [nome] (`[ID]`) — `modules/[dom]/[fs]/[feat].md`
> - **Data-model:** `global/data-models/[dominio].md`
>
> Confirma estes arquivos como base? Posso iniciar a análise de breaking changes?"

Só transite para `ANALISE_BREAKING_CHANGES` após a confirmação.

---

## PASSO 3 — Análise de breaking changes

**[Estado: ANALISE_BREAKING_CHANGES]**

Leia as diferenças entre o N3 original e o atualizado e avalie:

- Esta mudança exige novas migrations de banco?
- Altera o schema de Request ou Response da API de forma incompatível?
- Adiciona campos novos que precisam ir para o data-models/[dominio].md?
- Afeta algum evento publicado ou consumido?
- Afeta workers ou jobs assíncronos?

Gere um alerta obrigatório e aguarde confirmação antes de continuar:

```
⚠️ Análise de Breaking Changes:

Migrations necessárias: [Sim/Não — justificativa]
APIs com schema alterado: [lista ou "Nenhuma"]
Eventos afetados: [lista ou "Nenhum"]
Workers afetados: [lista ou "Nenhum"]
Campos novos para data-models/[dominio].md:
  - Label PO: [x] | Label Dev: [y] | Campo banco: [z] | Tipo: [t]
```

> "Confirma estas mudanças? Posso prosseguir com a atualização técnica?"

---

## PASSO 4 — Atualização do data-model

**[Estado: ATUALIZACAO_DATA_MODEL]**

Se houver campos novos aprovados, liste-os para adição ao fragmento do domínio:

> "⚠️ Os seguintes campos devem ser adicionados ao
> `global/data-models/[dominio].md` antes de implementar:
> [tabela com Label PO | Label Dev | campo banco | tipo SQL | notas]"

---

## PASSO 5 — Geração da atualização técnica

**[Estado: GERACAO_TECNICA]**

Atualize apenas as seções técnicas (`dev-only`) afetadas:
- Mapeamento de campos: atualizar referência ao data-models se entidade mudou
- Cenários técnicos adicionais: adicionar/remover conforme mudanças
- Mapeamento de erros: verificar no ERROR-DICTIONARY.md; propor novos com ⚠️
- API: atualizar endpoints afetados (body, response, erros)
- Eventos: atualizar se payload mudou
- AuditLog: atualizar metadata se campos mudaram
- Arquivos: listar o que precisa ser criado ou alterado
- **Métricas de tamanho (APF)**: se a mudança criou/removeu uma transação que conta,
  ou alterou DER/ALR/complexidade de uma existente, **recontar** conforme `SIZING.md`
  e atualizar a tabela e o **Total** da seção `## Métricas de tamanho`. Mudança
  **puramente técnica** que não altera a lógica de processamento (ótica do usuário)
  **não** gera nova contagem — registre que a contagem permanece inalterada.
  O cabeçalho `## Métricas de tamanho` deve ficar **seguido diretamente pela tabela**:
  não insira texto explicativo entre eles e, se encontrar notas legadas nessa posição
  (ex.: "Registra apenas Funções de Transação…" ou aviso de contagem provisória),
  **remova-as** — ressalvas vão no Changelog ou na memória de cálculo.
  **Havendo alteração na contagem**, atualizar também o consolidado
  `global/CONTAGEM-PF.md` (linha do PE/entidade, subtotais e Total) e propagar o
  total para `modules/INDEX.md` — ver a regra de manutenção no topo do CONTAGEM-PF.md.

Apresente apenas as seções técnicas alteradas. Pergunte:
> "As seções técnicas atualizadas estão corretas?
> Posso gerar o arquivo final mesclado?"

---

## PASSO 6 — Arquivo final e ações pós-sessão

**[Estado: ARQUIVO_FINAL]**

Gere o arquivo .md completo com negocial + técnico mesclados.
Ao mesclar, acrescentar nova entrada no `## Changelog` do arquivo registrando a atualização técnica.

Ao finalizar, informe obrigatoriamente:

> "✅ Atualização do N3 de [feature] concluída.
>
> **Ações obrigatórias antes de implementar:**
>
> 1. Atualizar `global/data-models/[dominio].md` com os campos novos aprovados
>    (e `DATA-MODEL.md → ## Arquivos Lógicos (APF)` se a contagem do ALI mudou)
> 2. Registrar a mudança em `changelogs/[data]-[feature]-[descricao].md`
> 3. Atualizar o status no `modules/INDEX.md` para ⚠️ Revisão necessária
>    (e voltar para ✅ Implementado após o deploy)
> 4. Se a contagem mudou, atualizar o consolidado `global/CONTAGEM-PF.md`
>    (linha do PE/entidade, subtotais e Total) e o total no `modules/INDEX.md`
> 5. Se houver breaking change na API, comunicar os consumidores"

<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_3A | atualizado: 2026-06-23 -->
# MESSAGE-DICTIONARY.md
> Dicionário centralizado das **mensagens de UI** e do **baseline de validação**
> do sistema. Mensagens genéricas (obrigatório, formato inválido, sucesso, estados
> de tela) e os cenários de validação que **toda feature herda por padrão** vivem
> aqui — os N3 referenciam este arquivo em vez de reescrever.
>
> **Camadas (não confundir):**
> - **MESSAGE-DICTIONARY** (este) → texto que a **pessoa usuária lê** + cenários baseline.
> - **FIELD-DICTIONARY** → mensagens **específicas de um campo canônico** (ex.: "CPF inválido.").
> - **ERROR-DICTIONARY** → **códigos de erro de API** (técnico/i18n, dev-only).
> - **DESIGN-SYSTEM** → **princípios** de UX Writing (como escrever).
>
> **Precedência**: se o campo é canônico (FIELD-DICTIONARY), a mensagem específica
> dele tem precedência sobre a genérica deste catálogo.

---

## Como referenciar nos artefatos

### No N3 — mensagem dentro de um cenário (texto literal, **sem citar**)
Ao exibir uma mensagem num cenário Gherkin, escreva o **texto literal** desta
tabela — nunca uma referência. O cenário fica autocontido e legível; o catálogo
segue como fonte única do texto.
```gherkin
Then o sistema exibe abaixo do campo: "Campo obrigatório."
```
Se a mensagem ainda **não existe** no catálogo, proponha adicioná-la aqui
primeiro e então use o texto literal — nunca invente uma string nova inline.

### No N3 — importar uma suíte inteira de validação (marcador)
Para não copiar uma suíte completa de cenários de validação genérica, use o
marcador de importação (traz os cenários completos, não é "referência de mensagem"):
```gherkin
# ← MESSAGE-DICTIONARY: BASELINE (validação de obrigatório + formato — todos os campos)
```

### Regra para PROMPT_3A
Obrigatoriedade e formato são **baseline**: não pergunte ao PO/dev nem invente
mensagem. Quando um cenário exibir uma mensagem, busque a correspondente neste
catálogo e escreva o **texto literal** (sem `→ ver`). Pergunte apenas as **regras
específicas** da feature (limites, unicidade, condições de negócio).

---

## 1. Catálogo de mensagens genéricas

> Tokens: `{campo}` = Label PO do campo · `{entidade}` = nome do registro
> (ex.: "cliente"). As formas abaixo são **neutras de gênero** para servirem
> a qualquer campo/entidade. Onde a tela já mostra o rótulo ao lado, a forma curta
> ("Campo obrigatório.") basta.

### 1.1 Validação de campo

| Chave | Situação | Mensagem (padrão) | Onde aparece |
|---|---|---|---|
| **Campo obrigatório** | Obrigatório não preenchido | `Campo obrigatório.` | Abaixo do campo (`.dsc-field-error`) |
| **Formato inválido** | Conteúdo fora do formato esperado | `Formato inválido.` | Abaixo do campo |
| **Tamanho mínimo** | Abaixo do mínimo declarado no N3 | `Mínimo de {n} caracteres.` | Abaixo do campo |
| **Tamanho máximo** | Acima do máximo declarado no N3 | `Máximo de {n} caracteres.` | Abaixo do campo |
| **Fora do intervalo** | Número/data fora do intervalo do N3 | `Valor fora do intervalo permitido.` | Abaixo do campo |
| **Seleção obrigatória** | Lista/seleção sem opção escolhida | `Selecione uma opção.` | Abaixo do campo |
| **Valor duplicado** | Chave de negócio única já existe | `Já existe um registro com este {campo}.` | Abaixo do campo ou toast |

> **Forma específica (opcional)** — se o time quiser a mensagem nomeando o campo,
> ela vira **específica daquele campo** (com artigo/gênero corretos) e passa a
> morar no FIELD-DICTIONARY, não aqui (ex.: "O CPF é obrigatório.", "Data inválida.").

### 1.2 Sucesso (toast) — ações CRUD

| Chave | Situação | Mensagem (padrão) |
|---|---|---|
| **Cadastro criado** | Criação concluída | `Cadastro realizado com sucesso.` |
| **Cadastro atualizado** | Edição concluída | `Cadastro atualizado com sucesso.` |
| **Registro excluído** | Exclusão concluída | `Registro excluído com sucesso.` |
| **Importação concluída** | Carga/importação OK | `Importação concluída com sucesso.` |
| **Importação com erros** | Carga parcial | `Importação concluída com {n} erro(s).` |

> Nomear a entidade ("Cliente excluído com sucesso.") é permitido, mas exige
> concordância de gênero — quando usar, registre a string no N3 daquela feature.

### 1.3 Estados de tela

| Chave | Situação | Texto |
|---|---|---|
| **Carregando** | Loading | `Carregando…` (ou gerúndio específico: `Processando…`) |
| **Sem resultados** | Pesquisa/filtro vazio | `Nenhum resultado encontrado. Ajuste os filtros e tente novamente.` |
| **Lista vazia (1º uso)** | Sem dados ainda | `Nenhum registro por aqui ainda.` + ação para criar |
| **Erro de carga** | Falha ao buscar | `Não foi possível carregar os dados. Tente novamente.` |
| **Registro não encontrado** | Acesso direto (rota/ID) a registro inexistente | `Registro não encontrado.` |
| **Sessão expirada** | Token expirado | `Sua sessão expirou. Entre novamente para continuar.` |

### 1.4 Confirmação e bloqueio (modais)

| Chave | Situação | Texto |
|---|---|---|
| **Confirmar exclusão** | Antes de excluir | `Deseja realmente excluir {entidade}?` (+ botão "Excluir") |
| **Bloqueio por vínculo** | Exclusão impedida | `Não é possível excluir {entidade} porque ele possui {motivo}.` |

---

## 2. Baseline de validação (cenários herdados por padrão)

> Todo campo de um N3 herda automaticamente os cenários abaixo, **conforme seu
> `tipo` e `obrigatório`** na tabela de Campos. O N3 **não** os reescreve — usa o
> marcador de importação. Só cenários **específicos** da feature são escritos à mão.

| Condição do campo | Cenário herdado | Mensagem |
|---|---|---|
| `obrigatório = sim` | Salvar com o campo vazio → bloqueia e sinaliza | **Campo obrigatório** |
| Campo com **formato** (data, número, e-mail, telefone, valor, %, CPF, CNPJ, CEP…) | Preencher fora do formato → bloqueia e sinaliza | **Formato inválido** (ou a específica do FIELD-DICTIONARY, se canônico) |
| `obrigatório = não` e vazio | Salvar com o campo vazio → aceita, sem erro | — |

**Marcador no Gherkin do N3** (substitui os cenários de obrigatório/formato):
```gherkin
# ← MESSAGE-DICTIONARY: BASELINE (validação de obrigatório + formato — todos os campos)
```

**Modelo dos cenários que o baseline representa** (não copiar para o N3 — referência):
```gherkin
Scenario: Salvar com campo obrigatório vazio
  When o usuário tenta salvar com "{campo}" vazio
  Then o sistema bloqueia o salvamento
  And exibe abaixo do campo: "Campo obrigatório."

Scenario: Campo preenchido com formato inválido
  When o usuário preenche "{campo}" fora do formato esperado
  Then o sistema bloqueia o salvamento
  And exibe abaixo do campo: "Formato inválido."
```

---

## 3. Como adicionar / alterar

1. Mensagem que se repete em **≥ 3 features** e não é específica de um campo
   canônico → entra aqui. Se é de um campo canônico, vai para o FIELD-DICTIONARY.
2. Manter o texto alinhado ao UX Writing do DESIGN-SYSTEM (claro, conciso, sem
   culpar a pessoa usuária; erro com cor **e** texto).
3. Abrir PR com a label `message-dictionary`. Aprovação: 1 dev + 1 PO.
4. Após merge, conferir se algum N3 reescrevia a mensagem à mão e trocar pela referência.

---

*Camadas relacionadas: [FIELD-DICTIONARY](FIELD-DICTIONARY.md) · [RULES-DICTIONARY](RULES-DICTIONARY.md) · [ERROR-DICTIONARY](ERROR-DICTIONARY.md) · [DESIGN-SYSTEM](DESIGN-SYSTEM.md)*

<!-- doc-template-engine: {{VERSION}} | prompt: {{PROMPT_ID}} | atualizado: {{YYYY-MM-DD}} -->
# MESSAGE-DICTIONARY.md
> Dicionário de **mensagens de UI** que a pessoa usuária lê — e o **baseline** de
> validação (obrigatório, formato, sucesso, estados de tela).
>
> Garante texto **literal e consistente** em todo o sistema. Nos cenários, escreva
> sempre o texto final do catálogo — nunca "conforme o Design System" (isso é
> gatilho de busca, não texto entregável).
>
> **Como referenciar nos N3**:
> - Mensagens genéricas (obrigatório/formato/sucesso): `# ← MESSAGE-DICTIONARY: BASELINE`
> - Mensagem específica: cite a chave e escreva o texto literal.
>
> **Precedência**: mensagem de campo canônico vem do **FIELD-DICTIONARY** (tem
> precedência sobre o baseline daqui).

---

## Baseline de validação

> Mensagens genéricas reutilizadas por qualquer campo/feature. Ajuste o texto ao
> tom de voz definido no N0. Use o marcador `# ← MESSAGE-DICTIONARY: BASELINE`
> nos cenários em vez de reescrevê-las.

| Chave | Situação | Texto literal |
|---|---|---|
| `REQUIRED` | Campo obrigatório não preenchido | "Campo obrigatório." |
| `INVALID_FORMAT` | Formato inválido (genérico) | "Formato inválido." |
| `MAX_LENGTH` | Excedeu o comprimento máximo | "Máximo de [N] caracteres." |
| `MIN_LENGTH` | Abaixo do comprimento mínimo | "Mínimo de [N] caracteres." |
| `SAVE_SUCCESS` | Registro salvo | "Registro salvo com sucesso." |
| `DELETE_SUCCESS` | Registro excluído | "Registro excluído com sucesso." |
| `DELETE_CONFIRM` | Confirmação antes de excluir | "Deseja realmente excluir este registro?" |
| `GENERIC_ERROR` | Falha inesperada | "Ocorreu um erro. Tente novamente." |
| `NO_PERMISSION` | Ação sem permissão | "Você não tem permissão para esta ação." |

---

## Estados de tela

> Textos padrão para os estados que toda tela de listagem/formulário pode assumir.

| Chave | Estado | Texto literal |
|---|---|---|
| `LOADING` | Carregando | "Carregando…" |
| `EMPTY` | Sem dados | "Nenhum registro encontrado." |
| `EMPTY_SEARCH` | Busca sem resultados | "Nenhum resultado para a busca." |
| `ERROR_STATE` | Falha ao carregar | "Não foi possível carregar os dados." |

---

## Mensagens específicas por domínio

> Uma seção por domínio. Crie conforme os N3 forem especificados. Use chaves
> descritivas em SCREAMING_SNAKE_CASE prefixadas pelo domínio.

### [Domínio]

| Chave | Situação | Texto literal |
|---|---|---|
| `[DOMINIO]_[NOME]` | [quando aparece] | "[texto exato exibido ao usuário]" |

---

## Como adicionar uma mensagem

1. Use o **baseline** sempre que a mensagem for genérica — não crie variações desnecessárias.
2. Mensagem nova e específica: adicione à seção do domínio com chave e texto literal.
3. Mensagem de **campo canônico**: defina no FIELD-DICTIONARY, não aqui.

---

## Instrução para a LLM

Ao escrever cenários/telas em um N3:
1. Use o **texto literal** do catálogo — nunca "conforme o Design System".
2. Para obrigatório/formato/sucesso genéricos, use `# ← MESSAGE-DICTIONARY: BASELINE`.
3. Mensagem de campo canônico vem do FIELD-DICTIONARY (precedência).
4. Mensagem inexistente no catálogo: proponha com ⚠️, aguarde aprovação e instrua a adição aqui.

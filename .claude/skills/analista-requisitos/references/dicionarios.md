# Dicionários Canônicos — Referência Rápida

Este arquivo lista os dicionários canônicos do repositório e como usá-los.
Os arquivos originais estão em `global/` na raiz do repositório.

---

## FIELD-DICTIONARY.md (`global/FIELD-DICTIONARY.md`)

Campos que se repetem em múltiplas features. Ao identificar um campo canônico,
as validações são aplicadas automaticamente — **não pergunte ao usuário** sobre elas.

### Campos cobertos

| Campo canônico | Tipo | Validações padrão |
|---|---|---|
| CPF | texto (14 chars formatado) | Máscara `999.999.999-99`, validação de dígitos verificadores, unicidade por contexto |
| CNPJ | texto (18 chars formatado) | Máscara `99.999.999/9999-99`, validação de dígitos verificadores |
| CEP | texto (9 chars formatado) | Máscara `99999-999`, consulta via serviço de endereço |
| Telefone | texto | Formato nacional `(99) 99999-9999` ou `(99) 9999-9999`, aceitar com/sem formatação |
| E-mail | texto | Formato RFC 5322, lowercase ao salvar |
| Senha | texto (oculto) | Mínimo 8 caracteres, ao menos 1 maiúscula, 1 minúscula, 1 número, 1 especial |
| Data de nascimento | data | Não pode ser data futura, formato `dd/mm/aaaa` |
| Data futura | data | Deve ser ≥ hoje, formato `dd/mm/aaaa` |
| Valor monetário | número decimal | 2 casas decimais, aceitar separador de milhar, não aceitar negativo (salvo exceção) |
| Percentual | número decimal | 0–100, 2 casas decimais |
| Nome de pessoa | texto | Mínimo 2 palavras, apenas letras e espaços, title case ao exibir |
| Razão social | texto | Mínimo 3 caracteres |
| URL | texto | Formato válido com protocolo (`https://...`) |

### Como usar nos artefatos

**No N3 (tabela de campos):**
```markdown
| Nome completo | texto | sim | → ver FIELD-DICTIONARY: nome de pessoa |
```

**Nos cenários Gherkin:**
```gherkin
# ← FIELD-DICTIONARY: CPF (importar cenários de validação)
```

---

## RULES-DICTIONARY.md (`global/RULES-DICTIONARY.md`)

Regras de negócio que se repetem em múltiplas features. Ao identificar uma regra
canônica, o comportamento é aplicado automaticamente — pergunte apenas os **parâmetros**.

### Regras cobertas

| Regra canônica | Parâmetros a perguntar | Comportamento padrão |
|---|---|---|
| Maioridade | Idade mínima (padrão: 18) | Bloqueia se idade < parâmetro na data da operação |
| Responsável ativo | Entidade do responsável | Impede vinculação a responsável inativo/arquivado |
| Período de vigência | Campos de início/fim | Início ≤ Fim; não permite sobreposição com vigências existentes |
| Aprovação antes de publicar | Perfil aprovador | Registro fica como "rascunho" até aprovação explícita |
| Limite por organização | Limite numérico | Impede criação além do limite contratado |
| Slug único público | Campo de origem | Gera slug a partir do campo, verifica unicidade, permite edição |
| Reenvio com cooldown | Tempo em minutos | Impede reenvio antes do cooldown expirar |
| Arquivo com tamanho máximo | Tamanho em MB, tipos aceitos | Valida antes do upload, mensagem clara com limites |
| Registro vinculado não pode ser excluído | Entidades vinculadas | Verifica vínculos ativos antes de permitir exclusão |

### Como usar nos artefatos

**No N3 (regras de negócio):**
```markdown
3. → ver RULES-DICTIONARY: maioridade (parâmetro: 18 anos)
```

**Nos cenários Gherkin:**
```gherkin
# ← RULES-DICTIONARY: registro vinculado (importar cenários)
```

---

## ERROR-DICTIONARY.md (`global/ERROR-DICTIONARY.md`)

Códigos de erro centralizados. Padrão de nomenclatura: `ENTIDADE_DESCRICAO`.

**Ao gerar erros em N3 técnicos:**
- Se o código já existe → referenciar `→ ver ERROR-DICTIONARY: [CODIGO]`
- Se é novo → propor com ⚠️, aguardar aprovação, instruir adição ao dicionário

---

## MESSAGE-DICTIONARY.md (`global/MESSAGE-DICTIONARY.md`)

Mensagens de UI (texto que a pessoa usuária lê) e baseline de validação.

**Regras:**
- Ao exibir mensagem num cenário, escrever o **texto literal** do catálogo — nunca "conforme o Design System"
- Obrigatório/formato genéricos: usar `# ← MESSAGE-DICTIONARY: BASELINE`
- Mensagem de campo canônico: FIELD-DICTIONARY tem precedência
- Mensagem inexistente: propor com ⚠️, aguardar aprovação

---

## NFR.md (`global/NFR.md`)

Requisitos **não-funcionais** que valem para o sistema inteiro (a *Especificação
Suplementar* do RUP): desempenho, segurança, confiabilidade, auditoria,
usabilidade e restrições de stack. Valem por padrão para toda feature.

### Como roteá-los na coleta

Ao identificar um requisito durante a sessão, separe-o:

| O requisito descreve… | Vai para |
|---|---|
| *Quão bem* o sistema se comporta (tempo de resposta, segurança, disponibilidade, auditoria, restrição técnica) | **NFR.md** |
| *O que* o sistema faz (invariante de negócio) | Regra de negócio (N3 / N1 / RULES-DICTIONARY conforme alcance) |

- **NFR existente** → não duplicar; citar `→ ver NFR: [ID]` só em exceção da
  feature ou no ponto técnico que o materializa (ex.: `## AuditLog` → AUD-01).
- **NFR novo** → propor com ⚠️ para adição ao NFR.md, aguardar aprovação.

### Como usar nos artefatos

- O N3 **não repete** NFRs — eles são herdados. Só cite quando a feature diverge
  do padrão (declarar exceção com ⚠️) ou no ponto técnico correspondente.

---

## DATA-MODEL fragmentado (`global/data-models/`)

O DATA-MODEL está dividido por domínio. Ao iniciar sessão técnica, trabalhe apenas
com o fragmento do domínio relevante para otimizar contexto.

Fragmentos seguem o padrão: `global/data-models/[dominio].md`

<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_3A | atualizado: 2026-06-23 -->
# FIELD-DICTIONARY.md
> Dicionário de campos canônicos do sistema.
> Campos listados aqui têm regras globais já definidas e validadas.
> Ao usar qualquer campo desta lista em um N3, referencie este arquivo
> em vez de repetir as regras — use a notação: `→ ver FIELD-DICTIONARY: [nome]`
>
> Mensagens **genéricas** (obrigatório, formato, sucesso, estados de tela) e o
> **baseline** de validação ficam no [MESSAGE-DICTIONARY](MESSAGE-DICTIONARY.md) —
> aqui ficam apenas as mensagens **específicas** de cada campo canônico.
>
> Para adicionar um novo campo canônico: abrir PR com a seção preenchida
> e aprovação de ao menos um dev e um PO.

---

## Como referenciar nos artefatos

### No N3 — tabela de campos
```markdown
| Data de nascimento | dataNascimento | não | → ver FIELD-DICTIONARY: Data de nascimento |
```

### Nos cenários Gherkin
```gherkin
# As validações de CPF seguem FIELD-DICTIONARY: CPF
Scenario: CPF com dígitos verificadores inválidos
  When o usuário preenche "CPF" com "111.111.111-11"
  Then o sistema exibe: "CPF inválido."
```

### No Gherkin — referência compacta
Se todos os cenários de validação de um campo já estão no dicionário,
use o marcador de importação em vez de reescrever:
```gherkin
# ← FIELD-DICTIONARY: CPF (importar todos os cenários de validação)
```

---

## Índice de campos canônicos

| Campo | Categoria | Validação local | Validação externa |
|---|---|---|---|
| [CPF](#cpf) | Documento | sim | não |
| [CNPJ](#cnpj) | Documento | sim | Receita Federal |
| [Data de nascimento](#data-de-nascimento) | Data | sim | não |
| [Data futura](#data-futura) | Data | sim | não |
| [CEP](#cep) | Endereço | sim | ViaCEP / similar |
| [Telefone](#telefone) | Contato | sim | não |
| [E-mail](#e-mail) | Contato | sim | não |
| [Senha](#senha) | Segurança | sim | não |
| [Valor monetário](#valor-monetário) | Financeiro | sim | não |
| [Percentual](#percentual) | Financeiro | sim | não |
| [Nome de pessoa](#nome-de-pessoa) | Identidade | sim | não |
| [Razão social](#razão-social) | Identidade | sim | não |
| [URL](#url) | Sistema | sim | não |

---

## Campos canônicos

---

### CPF

**Descrição**: Cadastro de Pessoa Física — identificador único de pessoa física no Brasil.

**Label PO**: CPF
**Label Dev**: cpf
**Campo banco**: cpf
**Tipo SQL**: varchar(14)
**Formato de armazenamento**: somente dígitos — `12345678901` (11 caracteres, sem máscara)
**Formato de exibição**: com máscara — `123.456.789-01`

#### Obrigatoriedade
Definida pelo N3 de cada feature — este dicionário não impõe.

#### Regras de negócio
1. Deve conter exatamente 11 dígitos numéricos (desconsiderando máscara).
2. Não pode ser uma sequência repetida (ex: 000.000.000-00, 111.111.111-11 ... 999.999.999-99).
3. Os dígitos verificadores (10º e 11º) devem ser matematicamente válidos
   conforme o algoritmo da Receita Federal.
4. Armazenar sempre sem máscara; aplicar máscara apenas na exibição.
5. Não validar existência na Receita Federal — apenas formato e dígitos verificadores.

#### Cenários Gherkin
```gherkin
# ── Validação de CPF ───────────────────────────────────────────

Scenario: CPF válido aceito
  When o usuário preenche "CPF" com "529.982.247-25"
  Then o campo é aceito sem mensagem de erro

Scenario: CPF com sequência repetida
  When o usuário preenche "CPF" com "111.111.111-11"
  Then o sistema exibe abaixo do campo: "CPF inválido."

Scenario: CPF com dígitos verificadores incorretos
  When o usuário preenche "CPF" com "123.456.789-00"
  Then o sistema exibe abaixo do campo: "CPF inválido."

Scenario: CPF com quantidade incorreta de dígitos
  When o usuário preenche "CPF" com "123.456.78"
  Then o sistema exibe abaixo do campo: "CPF inválido."

Scenario: CPF com caracteres não numéricos além da máscara
  When o usuário preenche "CPF" com "123.456.78A-01"
  Then o sistema exibe abaixo do campo: "CPF inválido."
```

#### Mensagens de erro
| Situação | Mensagem |
|---|---|
| Qualquer formato ou dígito inválido | "CPF inválido." |
| Campo obrigatório vazio | "O CPF é obrigatório." |

---

### CNPJ

**Descrição**: Cadastro Nacional da Pessoa Jurídica — identificador único de empresa no Brasil.

**Label PO**: CNPJ
**Label Dev**: cnpj
**Campo banco**: cnpj
**Tipo SQL**: varchar(18)
**Formato de armazenamento**: somente dígitos — `12345678000195` (14 caracteres, sem máscara)
**Formato de exibição**: com máscara — `12.345.678/0001-95`

#### Obrigatoriedade
Definida pelo N3 de cada feature.

#### Regras de negócio
1. Deve conter exatamente 14 dígitos numéricos (desconsiderando máscara).
2. Não pode ser uma sequência repetida (ex: 00.000.000/0000-00).
3. Os dígitos verificadores (13º e 14º) devem ser matematicamente válidos
   conforme o algoritmo da Receita Federal.
4. Armazenar sempre sem máscara; aplicar máscara apenas na exibição.
5. **Validação de existência na Receita Federal**: o N3 deve declarar
   explicitamente se a feature requer consulta à Receita Federal ou
   apenas validação de formato. As duas situações têm comportamentos diferentes:

   - **Apenas formato**: validação síncrona, sem chamada externa.
   - **Consulta à Receita Federal**: chamada assíncrona; retorna razão social,
     situação cadastral e endereço. Feature deve tratar os estados:
     ATIVO, INAPTO, SUSPENSA, BAIXADA, NULA e CNPJ não encontrado.

#### Cenários Gherkin — validação de formato
```gherkin
# ── Validação de CNPJ (formato) ────────────────────────────────

Scenario: CNPJ válido aceito
  When o usuário preenche "CNPJ" com "11.222.333/0001-81"
  Then o campo é aceito sem mensagem de erro

Scenario: CNPJ com sequência repetida
  When o usuário preenche "CNPJ" com "00.000.000/0000-00"
  Then o sistema exibe abaixo do campo: "CNPJ inválido."

Scenario: CNPJ com dígitos verificadores incorretos
  When o usuário preenche "CNPJ" com "11.222.333/0001-00"
  Then o sistema exibe abaixo do campo: "CNPJ inválido."

Scenario: CNPJ com quantidade incorreta de dígitos
  When o usuário preenche "CNPJ" com "11.222.333/0001"
  Then o sistema exibe abaixo do campo: "CNPJ inválido."
```

#### Cenários Gherkin — consulta à Receita Federal
```gherkin
# ── Consulta Receita Federal (usar apenas se o N3 exigir) ──────

Scenario: CNPJ ativo encontrado na Receita Federal
  Given que o CNPJ "11.222.333/0001-81" está ativo na Receita Federal
  When o usuário preenche o campo e o sistema consulta a Receita Federal
  Then os campos "Razão social" e "Endereço" são preenchidos automaticamente
  And o sistema exibe: "CNPJ consultado com sucesso."

Scenario: CNPJ válido mas com situação inapta
  Given que o CNPJ consultado tem situação "INAPTA" na Receita Federal
  When o sistema retorna o resultado da consulta
  Then o sistema exibe:
    "Este CNPJ está com situação INAPTA na Receita Federal.
     Verifique antes de prosseguir."
  And permite ao usuário continuar ou cancelar

Scenario: CNPJ não encontrado na Receita Federal
  Given que o CNPJ não existe na base da Receita Federal
  When o sistema retorna o resultado da consulta
  Then o sistema exibe: "CNPJ não encontrado na Receita Federal."

Scenario: Receita Federal indisponível
  Given que o serviço da Receita Federal está fora do ar
  When o sistema tenta realizar a consulta
  Then o sistema exibe:
    "Não foi possível consultar a Receita Federal agora.
     Você pode prosseguir e validar manualmente depois."
  And registra a tentativa para reprocessamento
```

#### Mensagens de erro
| Situação | Mensagem |
|---|---|
| Formato ou dígito inválido | "CNPJ inválido." |
| Campo obrigatório vazio | "O CNPJ é obrigatório." |
| Situação cadastral irregular | "Este CNPJ está com situação [SITUAÇÃO] na Receita Federal." |
| CNPJ não encontrado | "CNPJ não encontrado na Receita Federal." |
| Receita Federal indisponível | "Não foi possível consultar a Receita Federal agora." |

---

### Data de nascimento

**Descrição**: Data de nascimento de uma pessoa física.

**Label PO**: Data de nascimento
**Label Dev**: dataNascimento
**Campo banco**: data_nascimento
**Tipo SQL**: date
**Formato de armazenamento**: ISO 8601 — `YYYY-MM-DD`
**Formato de exibição**: `DD/MM/YYYY`

#### Obrigatoriedade
Definida pelo N3 de cada feature.

#### Regras de negócio
1. Não pode ser uma data futura — deve ser menor ou igual à data atual.
2. Não pode ser anterior a 01/01/1900.
3. A idade resultante não pode ultrapassar 150 anos.
4. O N3 deve declarar explicitamente se existe uma **restrição de idade mínima**
   (ex: "o usuário deve ter ao menos 18 anos"). Se houver, adicionar a regra
   e o cenário correspondente diretamente no N3.

#### Cenários Gherkin
```gherkin
# ── Validação de data de nascimento ────────────────────────────

Scenario: Data de nascimento válida
  When o usuário preenche "Data de nascimento" com "15/06/1990"
  Then o campo é aceito sem mensagem de erro

Scenario: Data de nascimento no futuro
  When o usuário preenche "Data de nascimento" com uma data posterior à atual
  Then o sistema exibe abaixo do campo:
    "A data de nascimento não pode ser uma data futura."

Scenario: Data de nascimento anterior a 01/01/1900
  When o usuário preenche "Data de nascimento" com "31/12/1899"
  Then o sistema exibe abaixo do campo: "Data de nascimento inválida."

Scenario: Data de nascimento com formato inválido
  When o usuário preenche "Data de nascimento" com "32/13/1990"
  Then o sistema exibe abaixo do campo: "Data inválida."
```

#### Mensagens de erro
| Situação | Mensagem |
|---|---|
| Data futura | "A data de nascimento não pode ser uma data futura." |
| Antes de 01/01/1900 | "Data de nascimento inválida." |
| Formato inválido | "Data inválida." |
| Campo obrigatório vazio | "A data de nascimento é obrigatória." |

---

### Data futura

**Descrição**: Campo de data que deve obrigatoriamente ser uma data futura.
Usado em prazos, vencimentos, agendamentos e datas de entrega.

**Label PO**: [definido pelo N3 — ex: "Data de vencimento", "Prazo", "Data de entrega"]
**Label Dev**: [definido pelo N3]
**Campo banco**: [definido pelo N3]
**Tipo SQL**: DATE ou TIMESTAMP WITH TIME ZONE (Oracle; definido pelo N3)
**Formato de armazenamento**: ISO 8601
**Formato de exibição**: `DD/MM/YYYY` ou `DD/MM/YYYY HH:MM`

#### Regras de negócio
1. Deve ser maior que a data e hora atuais no momento do salvamento.
2. O N3 deve declarar se existe um **limite máximo** (ex: "no máximo 1 ano à frente").
3. O N3 deve declarar o comportamento quando a data já passou
   (ex: "prazo expirado — exibir alerta mas permitir salvar").

#### Cenários Gherkin
```gherkin
# ── Validação de data futura ────────────────────────────────────

Scenario: Data futura válida
  When o usuário preenche o campo com uma data posterior à atual
  Then o campo é aceito sem mensagem de erro

Scenario: Data no passado
  When o usuário preenche o campo com uma data anterior à atual
  Then o sistema exibe abaixo do campo:
    "A data deve ser posterior à data atual."

Scenario: Data igual à data atual
  When o usuário preenche o campo com a data atual
  Then [comportamento definido pelo N3 — aceitar ou recusar]
```

---

### CEP

**Descrição**: Código de Endereçamento Postal brasileiro.

**Label PO**: CEP
**Label Dev**: cep
**Campo banco**: cep
**Tipo SQL**: varchar(8)
**Formato de armazenamento**: somente dígitos — `01310100` (8 caracteres)
**Formato de exibição**: com máscara — `01310-100`

#### Regras de negócio
1. Deve conter exatamente 8 dígitos numéricos.
2. Após preenchimento válido, o sistema consulta a API de CEP (ViaCEP ou similar)
   e preenche automaticamente: logradouro, bairro, cidade e estado.
3. O N3 deve declarar quais campos de endereço são preenchidos automaticamente
   e quais permanecem editáveis pelo usuário após o preenchimento automático.
4. CEP não encontrado: manter campos de endereço editáveis manualmente.

#### Cenários Gherkin
```gherkin
# ── Validação e consulta de CEP ─────────────────────────────────

Scenario: CEP válido encontrado
  When o usuário preenche "CEP" com "01310-100"
  Then o sistema consulta a API de endereços
  And os campos "Logradouro", "Bairro", "Cidade" e "Estado"
      são preenchidos automaticamente
  And os campos preenchidos permanecem editáveis

Scenario: CEP com formato inválido
  When o usuário preenche "CEP" com "0131"
  Then o sistema exibe abaixo do campo: "CEP inválido."
  And não realiza consulta à API

Scenario: CEP não encontrado
  When o usuário preenche um CEP inexistente
  And o sistema realiza a consulta
  Then o sistema exibe abaixo do campo:
    "CEP não encontrado. Preencha o endereço manualmente."
  And os campos de endereço permanecem editáveis e em branco

Scenario: API de CEP indisponível
  Given que o serviço de consulta de CEP está fora do ar
  When o usuário preenche um CEP com formato válido
  Then o sistema exibe: "Não foi possível consultar o CEP agora.
    Preencha o endereço manualmente."
  And os campos de endereço permanecem editáveis
```

#### Mensagens de erro
| Situação | Mensagem |
|---|---|
| Formato inválido | "CEP inválido." |
| CEP não encontrado | "CEP não encontrado. Preencha o endereço manualmente." |
| API indisponível | "Não foi possível consultar o CEP agora." |
| Campo obrigatório vazio | "O CEP é obrigatório." |

---

### Telefone

**Descrição**: Número de telefone no formato internacional.

**Label PO**: Telefone
**Label Dev**: telefone
**Campo banco**: telefone
**Tipo SQL**: varchar(20)
**Formato de armazenamento**: E.164 — `+5511999990000`
**Formato de exibição**: `(11) 99999-0000` para BR; manter formato original para outros países

#### Regras de negócio
1. Deve estar no formato E.164: `+` seguido do código do país e número.
2. O N3 deve declarar se aceita apenas números brasileiros ou internacionais.
3. Para números brasileiros: validar se o DDD é válido (11 a 99, exceto inexistentes).
4. Armazenar sempre no formato E.164, sem máscara.

#### Cenários Gherkin
```gherkin
# ── Validação de telefone ───────────────────────────────────────

Scenario: Telefone brasileiro válido (celular)
  When o usuário preenche "Telefone" com "(11) 99999-0000"
  Then o campo é aceito e armazenado como "+5511999990000"

Scenario: Telefone com DDD inválido
  When o usuário preenche "Telefone" com "(00) 99999-0000"
  Then o sistema exibe abaixo do campo: "Telefone inválido."

Scenario: Telefone com quantidade incorreta de dígitos
  When o usuário preenche "Telefone" com "(11) 9999-000"
  Then o sistema exibe abaixo do campo: "Telefone inválido."
```

---

### E-mail

**Descrição**: Endereço de correio eletrônico.

**Label PO**: E-mail
**Label Dev**: email
**Campo banco**: email
**Tipo SQL**: varchar(254)
**Formato de armazenamento**: em minúsculas, sem espaços
**Formato de exibição**: como digitado, mas normalizado para minúsculas

#### Regras de negócio
1. Deve seguir o formato `usuario@dominio.extensao`.
2. Armazenar sempre em minúsculas (normalizar na entrada).
3. O N3 deve declarar explicitamente se o e-mail deve ser **único**
   (por escopo de negócio, global, ou sem restrição de unicidade).
4. O N3 deve declarar se requer **verificação por link** após cadastro.

#### Cenários Gherkin
```gherkin
# ── Validação de e-mail ─────────────────────────────────────────

Scenario: E-mail válido aceito
  When o usuário preenche "E-mail" com "usuario@empresa.com"
  Then o campo é aceito sem mensagem de erro

Scenario: E-mail sem @ ou domínio
  When o usuário preenche "E-mail" com "usuario-sem-arroba"
  Then o sistema exibe abaixo do campo: "Informe um e-mail válido."

Scenario: E-mail com espaços
  When o usuário preenche "E-mail" com "usuario @empresa.com"
  Then o sistema exibe abaixo do campo: "Informe um e-mail válido."
```

---

### Senha

**Descrição**: Senha de acesso ao sistema.

**Label PO**: Senha
**Label Dev**: senha
**Campo banco**: — (nunca armazenada em texto puro; armazenar hash)
**Tipo SQL**: varchar(255) para o hash
**Campo banco do hash**: senha_hash

#### Regras de negócio
1. Mínimo de 8 caracteres.
2. Deve conter ao menos: uma letra maiúscula, uma minúscula e um número.
3. Nunca armazenar em texto puro — sempre aplicar hash (bcrypt ou argon2).
4. Nunca retornar em nenhuma resposta de API, nem o hash.
5. Campo de confirmação de senha (quando presente) deve ser idêntico ao campo senha.
6. O N3 deve declarar se há **política de expiração** ou **histórico de senhas**.

#### Cenários Gherkin
```gherkin
# ── Validação de senha ──────────────────────────────────────────

Scenario: Senha válida aceita
  When o usuário preenche "Senha" com "MinhaS3nha"
  Then o campo é aceito sem mensagem de erro

Scenario: Senha com menos de 8 caracteres
  When o usuário preenche "Senha" com "Ab1"
  Then o sistema exibe abaixo do campo:
    "A senha deve ter ao menos 8 caracteres."

Scenario: Senha sem letra maiúscula
  When o usuário preenche "Senha" com "minhas3nha"
  Then o sistema exibe abaixo do campo:
    "A senha deve conter ao menos uma letra maiúscula,
     uma minúscula e um número."

Scenario: Confirmação de senha divergente
  When o usuário preenche "Senha" com "MinhaS3nha"
  And preenche "Confirmar senha" com "OutraS3nha"
  Then o sistema exibe abaixo do campo "Confirmar senha":
    "As senhas não coincidem."
```

---

### Valor monetário

**Descrição**: Valor em dinheiro com duas casas decimais.

**Label PO**: [definido pelo N3 — ex: "Valor", "Preço", "Desconto"]
**Label Dev**: [definido pelo N3]
**Campo banco**: [definido pelo N3]
**Tipo SQL**: numeric(15,2)
**Formato de armazenamento**: número sem formatação — `1250.90`
**Formato de exibição**: moeda local — `R$ 1.250,90`

#### Regras de negócio
1. Não pode ser negativo, salvo se o N3 declarar explicitamente que aceita.
2. O N3 deve declarar o **valor mínimo** e o **valor máximo** permitidos.
3. Armazenar sem símbolo de moeda e sem separador de milhar.
4. Aceitar entrada com vírgula decimal (padrão BR) e converter para ponto.

#### Cenários Gherkin
```gherkin
# ── Validação de valor monetário ───────────────────────────────

Scenario: Valor válido aceito
  When o usuário preenche o campo com "1.250,90"
  Then o campo é aceito e armazenado como 1250.90

Scenario: Valor negativo
  When o usuário preenche o campo com "-100,00"
  Then o sistema exibe abaixo do campo: "O valor não pode ser negativo."

Scenario: Valor com mais de duas casas decimais
  When o usuário preenche o campo com "100,999"
  Then o sistema arredonda para duas casas: 101.00
  # ❓ Confirmar no N3: arredondar ou rejeitar?
```

---

### Percentual

**Descrição**: Valor percentual entre 0 e 100.

**Label PO**: [definido pelo N3 — ex: "Desconto", "Comissão", "Taxa"]
**Label Dev**: [definido pelo N3]
**Campo banco**: [definido pelo N3]
**Tipo SQL**: numeric(5,2)
**Formato de armazenamento**: número sem símbolo — `15.50`
**Formato de exibição**: com símbolo — `15,50%`

#### Regras de negócio
1. Deve estar entre 0 e 100 (inclusive), salvo se o N3 declarar outro intervalo.
2. Aceitar até duas casas decimais.
3. O N3 deve declarar se aceita `0%` e `100%` ou apenas valores intermediários.

---

### Nome de pessoa

**Descrição**: Nome completo de uma pessoa física.

**Label PO**: Nome completo
**Label Dev**: nomeCompleto
**Campo banco**: nome_completo
**Tipo SQL**: varchar(120)

#### Regras de negócio
1. Mínimo de 2 caracteres; máximo de 120.
2. Não pode conter apenas espaços.
3. Não pode conter números ou caracteres especiais além de: hífen, apóstrofo e ponto
   (para suportar nomes como "D'Ávila", "João-Pedro", "Jr.").
4. O N3 deve declarar se aceita apenas nome completo ou também apelidos/nomes curtos.

---

### Razão social

**Descrição**: Nome oficial de uma pessoa jurídica conforme registro.

**Label PO**: Razão social
**Label Dev**: razaoSocial
**Campo banco**: razao_social
**Tipo SQL**: varchar(255)

#### Regras de negócio
1. Mínimo de 2 caracteres; máximo de 255.
2. Não pode conter apenas espaços.
3. Aceita qualquer caractere — razões sociais podem conter números,
   símbolos e caracteres especiais.

---

### URL

**Descrição**: Endereço web completo.

**Label PO**: [definido pelo N3 — ex: "Site", "LinkedIn", "Webhook"]
**Label Dev**: [definido pelo N3]
**Campo banco**: [definido pelo N3]
**Tipo SQL**: text

#### Regras de negócio
1. Deve começar com `http://` ou `https://`.
2. O N3 deve declarar se aceita apenas `https://` ou também `http://`.
3. O N3 deve declarar se o sistema verifica se a URL está acessível
   ou apenas valida o formato.

---

## Como adicionar um novo campo canônico

1. Verificar se o campo realmente se repete em pelo menos três features distintas.
   Se aparecer em menos, defina-o diretamente no N3.
2. Preencher todas as seções do template abaixo.
3. Abrir PR com a label `field-dictionary`.
4. Aprovação obrigatória: 1 dev + 1 PO.
5. Após merge, adicionar ao índice no topo deste arquivo.

### Template para novo campo canônico

```markdown
### [Nome do campo]

**Descrição**: [o que representa]

**Label PO**: [português, title case]
**Label Dev**: [camelCase]
**Campo banco**: [snake_case]
**Tipo SQL**: [tipo]
**Formato de armazenamento**: [como salvar no banco]
**Formato de exibição**: [como mostrar na tela]

#### Obrigatoriedade
Definida pelo N3 de cada feature.

#### Regras de negócio
1. [regra]

#### Cenários Gherkin
[cenários completos]

#### Mensagens de erro
| Situação | Mensagem |
|---|---|
| [situação] | "[mensagem]" |
```

<!-- doc-template-engine: {{VERSION}} | prompt: {{PROMPT_ID}} | atualizado: {{YYYY-MM-DD}} -->
# SIZING.md
> Convenções de medição de tamanho funcional do sistema.
> Fonte única de critérios para contagem APF e COSMIC.
> Atualizar sempre que uma nova convenção for adotada.
>
> ℹ️ **Template do kit** — a metodologia APF/COSMIC é reutilizável. A seção
> **"Regras de medição de serviços (CAIXA)"** e as menções a stack (Angular/Java)
> são específicas de organização/projeto — revise ou substitua conforme o seu caso.

---

## Normas adotadas

| Método | Norma | Versão |
|---|---|---|
| APF | IFPUG CPM | 4.3.1 |
| COSMIC | COSMIC FSM | 5.0 |

> ⚠️ Registre aqui a versão exata adotada pela organização antes de iniciar qualquer contagem.

---

## APF — Análise de Pontos de Função

> **Princípio — a contagem reflete o que está documentado.** Cada DER, ALR, RLR,
> tipo (EE/SE/CE/ALI/AIE) e complexidade deve ser **rastreável** ao que o N3 e o
> `DATA-MODEL.md` registram (tabela `## Campos`, dependências, entidades/ALIs). A
> contagem **não antecipa nem inventa** o que não está especificado: se um campo,
> leitura ou entidade for necessário ao número mas não estiver documentado, **registre
> a lacuna com ⚠️ e ajuste a fonte antes de fechar a contagem** — em vez de estimar.
> Sempre que o que está documentado mudar, **reconte**. Regra de ouro: **a fonte
> manda; a contagem a espelha.**

### Mapeamento da estrutura de documentação → elementos APF

| Elemento APF | Definição | Onde identificar nesta estrutura |
|---|---|---|
| ALI (Arquivo Lógico Interno) | Grupo de dados mantido pelo sistema | `global/DATA-MODEL.md` — uma entidade principal = um ALI candidato |
| AIE (Arquivo de Interface Externa) | Grupo de dados de sistema externo usado mas não mantido | `global/API-PATTERNS.md` + seção "Integrações" do N1 |
| EE (Entrada Externa) | Transação que processa dados de fora para dentro | `## API` do N3 — verbos POST / PUT / PATCH / DELETE **expostos além da fronteira lógica do sistema** |
| SE (Saída Externa) | Transação que envia dados com lógica de processamento | `## API` do N3 — GET com cálculo, relatório ou transformação **exposto além da fronteira lógica** |
| CE (Consulta Externa) | Transação que recupera dados sem lógica adicional | `## API` do N3 — GET simples de listagem ou detalhe **exposto além da fronteira lógica** |

### Critério de complexidade — Funções de Dados (ALI / AIE)

| RLR \ DER | 1–19 | 20–50 | 51+ |
|---|---|---|---|
| 1 | Baixa | Baixa | Média |
| 2–5 | Baixa | Média | Alta |
| 6+ | Média | Alta | Alta |

> **RLR** (Registro Lógico Referenciado) = IFPUG RET · **DER** (Dado Elementar Referenciado) = IFPUG DET. Ver glossário.

**Como contar DER**: cada campo da tabela `## Campos` do N3 = 1 DER.
Campos automáticos do sistema (createdAt, updatedAt, id, organizationId) = **não contam**.
**Como contar RLR**: subgrupos lógicos dentro da entidade. Na ausência de subgrupos explícitos, considerar RLR = 1.

### Critério de complexidade — Funções de Transação (EE / SE / CE)

| ALR \ DER | 1–4 | 5–15 | 16+ |
|---|---|---|---|
| 0–1 | Baixa | Baixa | Média |
| 2–3 | Baixa | Média | Alta |
| 4+ | Média | Alta | Alta |

> **ALR** (Arquivo Lógico Referenciado) = IFPUG FTR · **DER** = IFPUG DET. Ver glossário.

**Como contar ALR**: número de ALIs ou AIEs lidos ou mantidos pela transação — identificável pela seção `## Dependências` e pelas tabelas referenciadas no `## API` do N3.
**Como contar DER**: campos no body/query da requisição + campos na resposta de sucesso. Conte cada campo distinto **uma vez** (entrada ∪ saída) e some **+1 DER para a capacidade de mensagens** (erro/confirmação) e **+1 DER para a ação/comando** que dispara a transação (padrão IFPUG). Campos de controle (HTTP status, organizationId, cursor de paginação) = **não contam**.

### Tabela de pontos por complexidade

| Tipo | Baixa | Média | Alta |
|---|---|---|---|
| ALI | 7 | 10 | 15 |
| AIE | 5 | 7 | 10 |
| EE | 3 | 4 | 6 |
| SE | 4 | 5 | 7 |
| CE | 3 | 4 | 6 |

---

## APF — Regras de medição de serviços (CAIXA)

> Orientações específicas para a medição de serviços em APF, adaptadas à estrutura
> de documentação deste template (N1, N3, fronteira BFF, `DATA-MODEL.md`).
> Origem: *Guia de Orientação de Métricas* — Capítulo 2, "Medição de Serviços em APF".
> Estas regras **prevalecem sobre o critério genérico** das seções anteriores quando houver conflito.

### 1. Fronteira da aplicação e escopo

- A fronteira de uma aplicação é definida, por padrão, **a nível da sigla do sistema** — o equivalente, neste template, ao domínio/sistema documentado no N0/N1.
- Uma sigla pode conter **mais de um módulo**. Quando um módulo for tratado como fronteira separada, isso **deve estar explícito** na documentação (N1 do módulo) e no formulário de contagem.
- A definição de fronteira e de escopo é **prerrogativa da CAIXA** e pode ser ajustada a qualquer momento conforme a visão de negócio; o escopo da medição sempre considera os objetivos da organização, não a conveniência técnica.

> **Aplicação neste template**: alinhe a fronteira de contagem com a granularidade declarada no N0/N1. Se um domínio em `modules/` representa um módulo com fronteira própria, registre essa decisão no N1 antes de contar.

### 2. Migração de base de dados

Migração pressupõe um sistema/funcionalidade novo substituindo um existente, exigindo extração dos dados antigos e carga no novo.

| Elemento | Conta? | Como tratar |
|---|---|---|
| Carga/conversão e gravação dos dados no novo sistema | **Sim** | EE — normalmente **uma EE por grupo de dados migrado**, mas não é regra: contar conforme a visão do usuário. Cada EE engloba extração/leitura do antigo, conversão e carga no novo |
| Relatórios sobre a conversão solicitados pelo gestor | **Sim** | CE ou SE conforme houver lógica de processamento |
| Arquivos/tabelas do sistema antigo (origem) | **Não** | Não contar como AIE |
| Extrações de leitura do sistema antigo | **Não** | Não contar como CE nem SE |

- A CAIXA pode classificar o esforço como **Projeto de Migração de Base de Dados** (escopo específico), aplicando integralmente os conceitos IFPUG. Sem essa classificação, vale a regra geral acima.
- **Não recomendado** adotar Projeto de Migração de Base de Dados em soluções de Portal de Conteúdo.
- No artefato de contagem do projeto de migração, as **funções de dados são obrigatórias e oriundas do projeto de desenvolvimento**; quando a função já tiver sido contada no desenvolvimento, registrá-la com status **"não se aplica"**. Pré-requisito: modelo de dados do sistema (ou artefato similar).
- Situações não previstas → encaminhar ao **GT de Métricas**.

### 3. Fator de ajuste (VAF) — não adotado

- A aplicação das CGSs, o cálculo do VAF e o tamanho funcional **ajustado** são opcionais no CPM do IFPUG.
- **A CAIXA não adota Pontos de Função Ajustados.** Toda contagem registrada neste template é em **PF não ajustado** (FSM puro). Não preencher campos de VAF.

### 4. Contagem de AIE pela visão do usuário

- Contar os **grupos de dados distintos segundo a visão do usuário da aplicação que está sendo contada** — a fronteira depende da visão de negócio externa, **independente de considerações técnicas ou de implementação**.
- Quando um sistema externo organiza internamente um dado em vários grupos lógicos, conte **apenas o AIE que o negócio do sistema contado reconhece**, não os grupos técnicos subjacentes.

> **Exemplo (Guia)**: o SIXXX recupera dados de "Unidade CAIXA" que, no sistema de origem (SIICO), vêm de três ALIs ("Unidade", "Imóvel", "Tipo de Meio de Comunicação"). Como o gestor do SIXXX só reconhece o grupo lógico **Unidade**, conta-se **somente o AIE "Unidade"**.
>
> **Aplicação neste template**: ao registrar AIEs em `global/DATA-MODEL.md`, descreva-os pela ótica de negócio do sistema consumidor, não pela modelagem física do sistema externo.

### 5. Alterações técnicas em ALI e nas funções que o mantêm (CPM 4.3.1)

- Manutenções evolutivas e alterações de escopo que mexem em **características de campos** (tabelas/telas) **não são medidas por APF quando a motivação é puramente técnica**.
- Alteração de atributo só é medida quando atende a uma **necessidade de negócio**, comprovada por evidência da solicitação do gestor e aprovação de suporte/qualidade (CPM 4.3.1, Parte 2).
- O simples fato de um DER alterado **cruzar a fronteira** nas transações que o mantêm/referenciam **não basta** para pontuá-las como alteradas. Pontuar **apenas as transações cuja lógica de processamento mudou** (ex.: nova regra de validação do DER).

> **Exemplo (Guia)**: campo de telefone passa a aceitar 8 dígitos e, no DF, exige o dígito "3" inicial. As EE de inclusão e alteração de cliente mudam de lógica → pontuadas como "alteradas". Exclusão e consulta de cliente não mudam → **não pontuadas**.
>
> **Aplicação neste template**: ao alterar um campo no N3, registre na seção de métricas **se a mudança altera a lógica de processamento**; mudanças apenas técnicas (tamanho, tipo físico, otimização de banco) não geram pontos.

### 6. Integração de sistemas e middleware

- Para integração entre sistemas, aplicar os **cenários de compartilhamento de dados do CPM 4.3.1**.
- Quando a integração de dados é **provida por outra aplicação (middleware)**, adotar o white paper do IFPUG *Pontos de Função & Contagem de Software Aplicativo Middleware* (ex.: SICLI – IPPO, Interface Padrão Parametrizada Online).

### 7. Integração com sistema de segurança (LOGON)

- As unidades possuem **estruturas de segurança distintas**; avaliar o cenário concreto na contagem.
- Os **ALR** (Arquivos Lógicos Referenciados) devem ser avaliados para determinar a complexidade da função de transação **LOGON**, e precisam estar registrados nos insumos de contagem apresentados.
- Em funções de transação que referenciam o sistema de segurança (ex.: SISGR), contar com base na **necessidade de negócio**, não na restrição tecnológica.

### 8. Consultas dinâmicas

- Uma consulta dinâmica é **uma única função transacional CE ou SE**, independentemente da quantidade de resultados que produz.
- A complexidade é determinada pelo **cenário mais abrangente**, considerando todos os DER e ALR possíveis.

### 9. Funcionalidades iguais em formatos de saída diferentes

- A mesma funcionalidade apresentada em **formatos de saída diferentes** é contada **uma única vez**. Formato diferente não caracteriza quebra da lógica de processamento sob a ótica do usuário.
- **A CAIXA não adota o conceito de *Multiple Media*** (alinhado ao Capítulo 1, item 5.6).

### 10. Desenvolvimento em múltiplas camadas (mainframe, web)

- Quando a **mesma transação** é disponibilizada em duas plataformas (ex.: mainframe e web), há **um único processo elementar** sob a APF — ambas implementam a mesma funcionalidade. **Não adotar *Multiple Media*.**
- Sob o **SNAP**, esse item **pode ser medido e remunerado** (havendo previsão contratual) pela subcategoria *Múltiplos Métodos de Saída* (Capítulo 8 do Guia).

### 11. Medição de componentes

- O desenvolvimento/manutenção de **componentes** é avaliado sob a **perspectiva funcional** (CPM 4.3.1).
- Considera-se **Componente de Software Reutilizável** o executável que oferece um serviço pré-definido e se comunica por interfaces padronizadas, com **todas** as características:

  - realiza uma funcionalidade específica;
  - tem capacidade de execução paralela (multiuso);
  - é intercambiável (não específico ao contexto);
  - é combinável com outros componentes;
  - é encapsulado (não investigável por suas interfaces);
  - é unidade de instalação e versionamento independente, comunicando-se somente via interfaces bem definidas;
  - adere a um modelo de componentes (.COM, CORBA, Java, etc.).

### 12. Funcionalidades batch

- Processos batch disparados pelo **relógio do sistema (clock)**, em que **nenhuma informação cruza a fronteira**, **não são processos elementares** (apenas complementam outro PE) — regra geral do IFPUG-CPC.
- **Exceção CAIXA**: reconhece-se a rotina batch como **função transacional** quando ela automatiza algo que poderia ser online e **todas** as condições abaixo se verificam:

  1. é a **menor unidade de atividade significativa** para o usuário e não é parte de outro processo elementar;
  2. a intenção primária é classificada **exclusivamente como EE**;
  3. ao final da execução a aplicação fica em **estado consistente**.

  Nesses casos conta-se como processo elementar — a forma de implementação (batch) é fator meramente tecnológico.

### 13. Terceira contagem (contagem final)

- Se **não houver alteração funcional**, a terceira contagem **não é necessária**.
- A equipe deve verificar se a contagem detalhada anterior não deixou de incluir funções (ex.: de conversão); nesse caso a **contagem final (terceira) é necessária**.
- Quando se adota a segunda contagem como final, **formalizar** a inexistência de alterações funcionais.

---

## COSMIC — Common Software Measurement International Consortium

### Mapeamento da estrutura de documentação → movimentos COSMIC

| Movimento | Definição | Onde identificar nesta estrutura |
|---|---|---|
| Entry (E) | Dado movendo-se de fora do processo para dentro | Campo no body/query do `## API` do N3 |
| Exit (X) | Dado movendo-se de dentro do processo para fora | Campo na resposta do `## API` do N3 |
| Read (R) | Leitura de dado persistido | Cada ALI/AIE consultado pela transação |
| Write (W) | Escrita de dado persistido | Cada ALI criado, alterado ou removido pela transação |

**1 CFP = 1 movimento (E, X, R ou W)**

### Convenções de contagem COSMIC nesta estrutura

- **Granularidade**: contar por endpoint documentado no `## API` do N3.
- **Entry**: cada campo distinto no body ou query params = 1 E. Campos de controle (authorization header, organizationId via JWT, cursor) = **não contam**.
- **Exit**: cada campo distinto na resposta de sucesso = 1 X. Envelope padrão (`data`, `meta`, `error`) = **não conta**, apenas os campos de negócio internos.
- **Read**: cada entidade/ALI lida para processar ou responder = 1 R. Leituras de validação (verificar duplicata, checar permissão) = **contam**.
- **Write**: cada entidade/ALI criada, atualizada ou removida = 1 W. Soft delete = 1 W.
- **Eventos publicados** (`## Eventos` do N3): cada evento publicado implica 1 X adicional.
- **Eventos consumidos** (`## Eventos` do N3): cada evento consumido implica 1 E adicional por campo relevante no payload.

---

## Convenções de registro no N3

Toda feature especificada no N3 deve ter a seção `## Métricas de tamanho` preenchida
**após** a aprovação do N3 negocial e **antes** do início do desenvolvimento.

A contagem é responsabilidade do Dev, revisada pelo Tech Lead, e pode ser auditada
pelo PO com base nos campos e endpoints documentados no mesmo N3.

### Arquitetura BFF (Java + Angular) — a unidade de contagem é a feature, não o endpoint

A fronteira da aplicação (CPM) é a interface conceitual entre o sistema e seus
**usuários** — **não** a divisão técnica entre o Angular e o Java. Nesta arquitetura, o
frontend Angular e o backend BFF são **camadas internas de uma mesma feature**: o BFF é
apenas o backend.

Por isso, **a unidade de análise é a feature (N3) inteira**, não o endpoint isolado. Uma
feature começa na interação do usuário no front, percorre o BFF e devolve um resultado —
isso é **uma transação completa** que cruza a fronteira usuário↔sistema. Logo, **cada
feature (N3) é candidata a um processo elementar (PE)** e, se qualificada, conta como
EE, SE ou CE.

- ✅ **Correto:** avaliar a feature (front + BFF) como um PE candidato.
- ❌ **Errado:** olhar o endpoint do BFF isoladamente e descartá-lo por ser "interno". O
  BFF sozinho não é um PE — mas isso **não zera** a feature que ele atende.

| Situação | Conta? |
|---|---|
| Feature (N3) que satisfaz os critérios de PE e se classifica como EE/SE/CE | **Sim** — pelo tipo |
| Feature disparada por/integrada a outro sistema, API pública, parceiro ou arquivo externo | **Sim** — pelo tipo |
| Endpoint do BFF olhado isoladamente (sem ser a feature completa) | **Não** — não é a unidade de contagem |
| Navegação, menus e telas que são apenas passos de outro PE | **Não** — não é PE |

> **Importante:** ter o backend em BFF interno **não** é, por si só, motivo para não
> contar. O que decide é se a **feature** satisfaz as regras de PE do CPM.

**Funções de Dados (ALI / AIE)** não são registradas na seção `## Métricas de tamanho`
do N3 — vivem centralmente em `global/DATA-MODEL.md` e nos fragmentos
`global/data-models/[dominio].md`. Ver seção *Como manter o registro de ALIs sincronizado*.

### O que contar e o que não contar no N3

Cada artefato N3 corresponde a uma única funcionalidade. Registre nele apenas
as funções de transação geradas por essa funcionalidade:

| O que encontrar no N3 | Contar? | Como contar |
|---|---|---|
| ALI — entidade mantida por este sistema | **Não** | Contado centralmente no DATA-MODEL.md |
| AIE — entidade de sistema externo referenciada | **Não** | Contado centralmente no DATA-MODEL.md |
| Endpoint exposto a sistema externo (POST/PUT/PATCH/DELETE) | **Sim** | EE |
| Endpoint exposto a sistema externo (GET com transformação) | **Sim** | SE |
| Endpoint exposto a sistema externo (GET simples) | **Sim** | CE |
| Feature 100% atendida por BFF interno (sem exposição externa) | **Sim, se for PE** | EE/SE/CE pelo tipo — BFF interno não zera a feature |
| Combobox / dropdown que carrega dados de um ALI ou AIE | **Sim** | CE (sem lógica) ou SE (com lógica de filtro ou transformação) |

> **Regra do combobox**: sempre que uma tela carrega uma lista de opções a partir
> de uma entidade marcada como ALI ou AIE — independentemente de ser via endpoint
> BFF interno — essa consulta de suporte à interface **conta como CE ou SE**,
> pois representa uma transação funcional distinta da funcionalidade principal.
> Contar uma vez por entidade consultada, por tela onde ocorre.

### Quem conta e quando

| Etapa | Responsável | Momento |
|---|---|---|
| Contagem inicial | Dev que especificou o N3 técnico | Após PROMPT_3B |
| Revisão | Tech Lead do domínio | Antes de mover para `🔄 Em desenvolvimento` |
| Auditoria | Papel externo (se contratual) | Pontual, baseado nos N3 com status `✅ Implementado` |

---

## Consolidação no INDEX.md

O `modules/INDEX.md` deve manter os totais acumulados por feature, domínio e sistema:

```markdown
| Feature | Domínio | Status | PF | CFP |
|---|---|---|---|---|
| [Feature] | [Domínio] | ✅ Implementado | 12 | 18 |
```

Totais de domínio e sistema são calculados por soma das features com status
`📋 Especificado`, `🔄 Em desenvolvimento` e `✅ Implementado`.
Features `❌ Deprecadas` são excluídas do total vigente mas mantidas no histórico.

---

## Glossário rápido

| Sigla | Significado |
|---|---|
| APF | Análise de Pontos de Função |
| PF | Ponto de Função |
| ALI | Arquivo Lógico Interno |
| AIE | Arquivo de Interface Externa |
| EE | Entrada Externa |
| SE | Saída Externa |
| CE | Consulta Externa |
| DER | Dado Elementar Referenciado — campo (IFPUG: **DET**, *Data Element Type*) |
| RLR | Registro Lógico Referenciado — subgrupo lógico de uma função de dados (IFPUG: **RET**, *Record Element Type*) |
| ALR | Arquivo Lógico Referenciado — ALI/AIE lido ou mantido por uma transação (IFPUG: **FTR**, *File Type Referenced*) |
| COSMIC | Common Software Measurement International Consortium |
| CFP | COSMIC Function Point |
| E | Entry (movimento COSMIC) |
| X | Exit (movimento COSMIC) |
| R | Read (movimento COSMIC) |
| W | Write (movimento COSMIC) |

---

*Última revisão: 2026-06-05 — incorporadas as orientações do Capítulo 2 (Medição de Serviços em APF) do Guia de Orientação de Métricas.*
*Links: [MASTER.md](./MASTER.md) · [DATA-MODEL.md](./DATA-MODEL.md) · [INDEX geral](../modules/INDEX.md)*

---

## Como manter o registro de ALIs sincronizado

O registro central de ALIs vive em `global/DATA-MODEL.md → ## Arquivos Lógicos (APF)`.
A fonte de cálculo vive nos fragmentos `global/data-models/[dominio].md → ## Arquivos Lógicos deste domínio`.

Fluxo de atualização:

```
Nova entidade criada (PROMPT_3B)
          │
          ├─→ Definir a qual ALI pertence
          │        ├─ ALI existente → anotar cabeçalho da entidade + recalcular DER/RLR
          │        └─ ALI novo      → criar linha no fragmento + anotar cabeçalho
          │
          ├─→ Atualizar seção "## Arquivos Lógicos" no fragmento data-models/[dominio].md
          │
          └─→ Atualizar linha correspondente em DATA-MODEL.md → ## Arquivos Lógicos (APF)
```

Regra de ouro: **DATA-MODEL.md é o índice; os fragmentos são a fonte de cálculo.**
Nunca atualizar um sem atualizar o outro.

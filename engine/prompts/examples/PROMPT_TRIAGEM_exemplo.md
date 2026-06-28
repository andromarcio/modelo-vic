# Exemplo — PROMPT_TRIAGEM em ação

> **Referência viva do formato de saída do `PROMPT_TRIAGEM` (opção `TR`).**
> É um exemplo **fictício e simulado**, conduzido contra uma instância de
> documentação inventada — serve para mostrar como fica o *relatório de
> descoberta* e a *recomendação* na prática. Não é um artefato de produto.
>
> Para o roteiro real (estados, regras, comportamento por canal), ver
> `engine/prompts/PROMPT_TRIAGEM.md`.

---

## 📁 Contexto fictício (o que a triagem "enxergaria" no repo)

`modules/INDEX.md` + árvore `modules/`:

| Domínio | Feature Set | Feature (N3) | Arquivo | Status |
|---|---|---|---|---|
| Cadastro (`CAD`) | Fundos Geridos (`CAD-FUN`) | `F01` Cadastrar fundo gerido | `f-cadastrar-fundo-gerido.md` | 📋 Especificado |
| | | `F02` Pesquisar fundo gerido | `f-pesquisar-fundo-gerido.md` | ✅ Implementado |
| | | `F03` Editar fundo gerido | `f-editar-fundo-gerido.md` | ✅ Implementado |
| | Gestores (`CAD-GES`) | `F01` Cadastrar gestor | `f-cadastrar-gestor.md` | ✅ Implementado |
| Documentos (`DOC`) | Importação (`DOC-IMP`) | `F01` Importar arquivo de cotas | `f-importar-arquivo-cota.md` | 📋 Especificado |

## 🗣️ Necessidade fictícia (texto livre, vinda de uma reunião de refino)

> *"Precisamos poder **excluir um fundo gerido** — hoje não dá pra remover nenhum.
> Também no **cadastro de fundo** o pessoal quer um campo novo de **'Data de
> encerramento'**. E seria ótimo **exportar a lista de fundos para Excel** lá na
> pesquisa. Ah, e surgiu a ideia de um **portal público** pra investidores
> consultarem os fundos — mas isso é mais pra frente."*

---

## ▶️ Transcrição da sessão de triagem

**[Estado: INICIALIZACAO]**

Vou triar a sua necessidade. Tenho acesso ao repositório, então vou ler o
`modules/INDEX.md` e a árvore `modules/` para descobrir o que já está documentado.
Posso começar pela sua necessidade?

> 👤 *Pode.*

---

**[Estado: LEITURA_NECESSIDADE]**

Entendi a necessidade como originada de uma **reunião de refino**. Quebrei em
**4 itens** para triar separadamente:

| # | Sub-necessidade | Nível aparente | Direção |
|---|---|---|---|
| 1 | Excluir um fundo gerido | N3 (feature) | bottom-up (dentro de um FS que já existe) |
| 2 | Novo campo "Data de encerramento" no cadastro de fundo | N3 (alteração) | bottom-up |
| 3 | Exportar a lista de fundos para Excel (na pesquisa) | N3 (alteração) | bottom-up |
| 4 | Portal público para investidores consultarem fundos | N1/N2 (área nova) | top-down |

Confere? Posso descobrir o que já existe sobre cada item?

> 👤 *Confere, pode seguir.*

---

**[Estado: MAPEAMENTO_DOC]**

*(lendo `modules/INDEX.md`, os README de `CAD`/`CAD-FUN` e os N3
`f-cadastrar-fundo-gerido.md`, `f-pesquisar-fundo-gerido.md`,
`f-editar-fundo-gerido.md`… mapa montado)*

---

**[Estado: CRUZAMENTO]**

**O que já está documentado, relacionado à sua necessidade:**

| Artefato | Nível | Caminho | Objetivo (resumo) | Aderência |
|---|---|---|---|---|
| Cadastrar fundo gerido (`F01`) | N3 | `modules/cadastro/g-fundos-geridos/f-cadastrar-fundo-gerido.md` | Inclui um novo fundo gerido com seus dados básicos | **Cobre em parte** (não tem "Data de encerramento") |
| Pesquisar fundo gerido (`F02`) | N3 | `…/f-pesquisar-fundo-gerido.md` | Pesquisa/lista fundos por filtros e exibe resultados | **Cobre em parte** (sem exportação para Excel) |
| Editar fundo gerido (`F03`) | N3 | `…/f-editar-fundo-gerido.md` | Edita os dados de um fundo existente | **Relacionado** (a "Data de encerramento" também reflete aqui) |
| Feature Set Fundos Geridos (`CAD-FUN`) | N2 | `modules/cadastro/g-fundos-geridos/README.md` | Operações sobre fundos geridos (cadastrar, pesquisar, editar) | **Não cobre** exclusão |
| *(exclusão de fundo)* | — | — | — | **Não cobre** — candidato a criação |
| *(portal público de investidores)* | — | — | — | **Não cobre** — área (domínio/FS) inexistente |

Este retrato confere com o que você conhece? Algum artefato relacionado ficou de
fora? Posso fechar a recomendação?

> 👤 *Confere. Pode fechar.*

---

**[Estado: RECOMENDACAO]**

**Triagem concluída.** Recomendação por item:

| Parte da necessidade | Veredito | Artefato alvo | Prompt | Observação |
|---|---|---|---|---|
| Excluir fundo gerido | **Criar (derivado)** | novo `f-excluir-fundo-gerido.md` em `CAD-FUN` | **3A** | Derivação CRUD a partir do cadastro `F01`; o 3A vai perguntar exclusão **física × lógica** e o que fazer com vínculos |
| Campo "Data de encerramento" no cadastro | **Alterar** | `f-cadastrar-fundo-gerido.md` | **4A → 4B** | ⚠️ Avaliar se é campo canônico (*data futura*) no FIELD-DICTIONARY; refletir também na edição (`F03`) |
| Exportar lista para Excel (pesquisa) | **Alterar** | `f-pesquisar-fundo-gerido.md` | **4A → 4B** | `F02` já está **implementada** → o 4B avalia *breaking change*. Se virar um relatório com regras próprias, pode ser feature nova (3A) |
| Portal público de investidores | **Criar (domínio novo)** | novo domínio + feature set | **1A → 2A → 3A** | ⚠️ "Mais pra frente" e **possível mudança de escopo do produto** — validar contra o `N0_PRODUCT_VISION.md` com o PO **antes** de especificar |

**Em resumo:** a necessidade é **mista** — parte se resolve **alterando** o que já
existe (`f-cadastrar-…`, `f-pesquisar-…`), parte exige **criar** (exclusão de fundo
e, lá na frente, o portal público).

💡 Como ela toca **vários artefatos** ao mesmo tempo, o caminho mais seguro é o
fluxo em **lote**: o **IV (Investigador)** gera o `pending_changes.md`, você aprova
os itens `modify`, e o **EX (Executor)** aplica cada um — um por vez. O item do
**portal público** ficaria de fora deste lote até a decisão de escopo com o PO.

Posso iniciar o **IV** agora (gerando o `pending_changes.md` com estes itens), ou
prefere atacar item a item — começando pela criação da exclusão de fundo via **3A**?

---

## O que este exemplo demonstra

- **Descoberta antes de escrever:** mostra o que já existe relacionado à necessidade.
- **Veredito por item:** classifica cada parte em *Cobre / Cobre em parte / Não cobre*
  e conclui **alterar** × **criar**.
- **Top-down e bottom-up** convivendo na mesma necessidade.
- **Derivação CRUD** (exclusão a partir do cadastro) e **escalonamento para o IV**
  quando o delta toca vários artefatos.
- **Read-only por design:** nenhum arquivo é criado ou alterado pela triagem — ela
  apenas mostra e roteia.

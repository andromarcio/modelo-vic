# Guia de Montagem no SharePoint — Modelo VIC (sem código)

Como reconstruir o protótipo no **SharePoint Online** usando **somente web parts
nativas** + **Tema CAIXA**. Não exige código nem SPFx.

> 💡 **Gabarito visual:** abra o protótipo e clique em **“Mapa SharePoint”**
> (ou acrescente `?sp=1` à URL). Cada bloco fica etiquetado com a web part que o
> reconstrói. Use isso lado a lado com este guia.

---

## 0. Pré-requisitos

| Item | Necessário |
|---|---|
| Tipo de site | **Site de Comunicação** (layout de coluna única, ideal) |
| Permissão | **Proprietário** do site (para “Alterar a aparência” e editar páginas) |
| Tema (opcional, recomendado) | Admin do SharePoint para rodar `vic-caixa-theme.ps1` |

---

## 1. Aplicar o Tema CAIXA

**Opção A — registrar o tema (admin):**
1. Rode `sharepoint/vic-caixa-theme.ps1` no SharePoint Online Management Shell.
2. No site: **Engrenagem ⚙ → Alterar a aparência → Tema → “VIC CAIXA” → Aplicar**.

**Opção B — sem admin:** em **Alterar a aparência → Tema**, escolha um tema azul
próximo e ajuste a cor principal para **`#005CA9`**. Para fidelidade total, peça à
TI para registrar o tema (Opção A) ou importe o `vic-caixa-theme.json` no
[Fluent UI Theme Designer](https://aka.ms/themedesigner).

> O **laranja `#F39200`** não é cor de tema — use-o apenas em **botões/CTA** e nas
> ilustrações (que já vêm com ele).

---

## 2. Criar a estrutura (hub + páginas)

1. Crie o **Site de Comunicação** “VIC — Versionamento e Integração de Código”.
2. Defina o **logo** do site com `assets/brand/vic-icon.svg` (ou o PNG).
3. Crie as páginas (Nova → Página → em branco):
   - **Visão Geral** (defina como página **inicial**)
   - **Práticas Desejadas**
   - **Prática 1 … Prática 13** (uma página cada)
   - **Tríade Técnica** e **Análise e Acompanhamento** (quando houver conteúdo)
4. **Navegação superior:** em *Editar* o menu do topo, adicione os links:
   `Visão Geral · Práticas Desejadas · Tríade Técnica · Análise e Acompanhamento`.
   (Reproduz a barra `.topnav` do protótipo.)

---

## 3. Subir as ilustrações

1. **Engrenagem → Conteúdo do site → Ativos do Site** (ou crie uma biblioteca “Imagens”).
2. ✅ **Use a pasta `sharepoint/ilustracoes-png/`** — todas as ilustrações já estão
   exportadas em **PNG** (fundo branco, 1200 px), prontas para a web part **Imagem**.
3. ⚠️ Alguns tenants **bloqueiam SVG** na web part Imagem — por isso os PNG já vêm
   prontos. Se preferir SVG (nitidez infinita), use `assets/img/` e peça a liberação ao admin.

---

## 4. Montar cada página — bloco a bloco

Em cada página: **Editar → +** para adicionar **seções** (layouts de coluna) e,
dentro delas, as **web parts**. Nomes em português do SharePoint moderno.

### 4.1 Página “Visão Geral”

| Ordem | Seção | Web part | Conteúdo |
|---|---|---|---|
| 1 | 1 coluna, largura total | **Herói** (1 bloco) ou **Imagem + texto** | Título “Versionamento e Integração de Código” + subtítulo |
| 2 | 1 coluna | **Texto** | “Qual a finalidade deste modelo?” |
| 3 | 1 coluna | **Texto** (realce/citação) ou **Chamada para ação** | Aviso “Modelo determinístico” |
| 4 | 1 coluna | **Links Rápidos** | Tecnologias de referência (Git, Azure DevOps/GitHub, GitFlow/GitHub Flow, SemVer) |
| 5 | 1 coluna | **Texto** | “Missão do modelo” (lista) |
| 6 | 1 coluna | **Links Rápidos** | “Benefícios” (7 itens) |
| 7 | 1 coluna | **Botão** ou **Chamada para ação** | “Acessar as Práticas Desejadas” |

### 4.2 Página “Práticas Desejadas” (hub)

| Ordem | Web part | Conteúdo |
|---|---|---|
| 1 | **Herói** ou seção com cor de destaque + **Texto** | Título “Práticas Desejadas” |
| 2 | **Texto** | Intro (jornada de maturidade) |
| 3 | **Links Rápidos** (13 itens) | Cada item linka para a página da prática correspondente |

### 4.3 Página de cada “Prática” (modelo único, repetir 13x)

| Ordem | Seção | Web part | Mapa do protótipo |
|---|---|---|---|
| 1 | destaque “Forte” | **Imagem** com texto sobreposto ou **Herói** | Capa azul com nº + título (`.page-hero`) |
| 2 | 1 coluna | **Texto** (realce) ou **Chamada para ação** | Caixa **“Regra”** (`.diretriz`) |
| 3 | 1 coluna | **Texto** | “O que a prática exige” (lista) |
| 4 | 1 coluna | **Imagem** | Ilustração da prática (`assets/img/…`) |
| 5 | 1 coluna | **Texto** (com tabela) | Tabelas, quando houver |
| 6 | 1 coluna | **Texto** / **Link** | “Referências metodológicas” |

> Navegação “anterior/próxima” entre práticas: use a **navegação do hub** ou um
> bloco **Links Rápidos** no rodapé com as práticas vizinhas.

---

## 5. Mapa completo (bloco do protótipo → web part)

| Bloco (classe no protótipo) | Web part do SharePoint (PT-BR) |
|---|---|
| `.hero` / `.page-hero` (capa azul) | **Herói** · ou **Imagem** com texto · ou seção “Destaque forte” + **Texto** |
| `.diretriz` / `.callout` (caixa colorida) | **Texto** com realce · ou **Chamada para ação** |
| `.quicklinks` (cards) | **Links Rápidos** |
| `.section` / listas / parágrafos | **Texto** |
| `.figure` (ilustração) | **Imagem** |
| `.tbl` (tabela) | **Texto** (tabela nativa) |
| CTA / botão | **Botão** · ou **Chamada para ação** |
| `.topnav` (navegação) | **Navegação do hub / do site** |
| Bloco de changelog (Prática 13) | **Texto** (com formatação de código) |

---

## 6. Dicas de fidelidade

- **Seções com ênfase:** use a ênfase **“Forte”** (cor de tema) nas faixas que
  imitam as capas azuis; **“Neutra/Suave”** no corpo.
- **Realce de texto:** as caixas “Regra/Aviso” saem bem com **citação** ou
  **realce** no editor de Texto; reserve a **Chamada para ação** para os destaques
  mais fortes.
- **Imagens:** mantenha **proporção** e largura **total** ou **1/1**; não estique.
- **Laranja CAIXA** (`#F39200`): só em **botões/CTA** e nos diagramas.
- **Consistência:** monte **uma** página de prática perfeita, depois **duplique**
  (Configurações da página → Copiar) e troque número, título, regra e imagem.

---

## 7. Limitações honestas (caminho sem código)

- O **cabeçalho e o menu** são os nativos do SharePoint — não o header custom do protótipo.
- Gradientes e micro-ajustes de espaçamento **não** são reproduzíveis pixel a pixel.
- O resultado fica com **a mesma identidade institucional**, que é o objetivo aqui.
- Para fidelidade total (reusar o CSS), seria o caminho **SPFx** (exige App Catalog/dev)
  ou **Embed via iframe** (exige liberação de domínio) — fora do escopo “sem código”.

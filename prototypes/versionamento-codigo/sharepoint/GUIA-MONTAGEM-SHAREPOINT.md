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

## 1. Identidade visual (com ou sem tema custom)

O tema do SharePoint controla **apenas** a cor de destaque: links, botões, faixas
de seção com ênfase “Forte” e realces da navegação. Ele **não** é pré-requisito
para nada neste guia — todo o resto são web parts nativas em um Site de
Comunicação padrão. Não há modelo de site personalizado envolvido.

**Opção A — registrar o tema (exige admin):**
1. Rode `sharepoint/vic-caixa-theme.ps1` no SharePoint Online Management Shell.
2. No site: **Engrenagem ⚙ → Alterar a aparência → Tema → “VIC CAIXA” → Aplicar**.

**Opção B — governança não permite registrar tema:** aceite o tema **Azul**
padrão e traga a marca pelas **imagens**, que você sobe sem depender de ninguém.
Tudo abaixo é nível **proprietário do site**:

| Onde | Caminho | Arquivo |
|---|---|---|
| Cabeçalho do site | **Alterar a aparência → Cabeçalho** → layout **Estendido** → imagem de fundo | `sharepoint/vic-caixa-header-bg-1803x228.png` |
| Logo do site | **Engrenagem ⚙ → Informações do site → Logotipo do site** | `assets/brand/vic-icon.png` |
| Capa de cada diretriz | web part **Imagem** no topo da página | `sharepoint/capas-diretrizes/` |
| Ícones de tópico | **Links Rápidos** → imagem por item | `assets/icons/` |
| Rodapé | **Alterar a aparência → Rodapé** → logo + links | `assets/brand/vic-icon.png` |

> ⚠️ **Não** tente acertar o `#005CA9` em *Alterar a aparência → Tema →
> Personalizar*: o seletor padrão só oferece variações pré-definidas, **não aceita
> hex livre**. Sem admin, o azul institucional exato só entra por imagem.

> 💡 A imagem de fundo do cabeçalho depende do layout **Estendido** estar
> disponível no seu tenant. Se não estiver, o cabeçalho fica no azul padrão e a
> marca passa a depender só das capas e do logo — vale confirmar antes de montar.

O **laranja `#F39200`** não é cor de tema em nenhum dos dois casos: ele vive nas
ilustrações e nas capas, que já vêm com ele.

**O que se perde sem o tema:** a cor exata em links, botões e faixas “Forte”
(ficam no azul padrão do SharePoint). Estrutura, conteúdo, ilustrações e capas
ficam idênticos. A tipografia também não muda — o protótipo já usa **Segoe UI**,
que é a fonte padrão do SharePoint.

---

## 2. Criar a estrutura (hub + páginas)

1. Crie o **Site de Comunicação** “VIC — Versionamento e Integração de Código”.
2. Defina o **logo** do site com `assets/brand/vic-icon.svg` (ou o PNG).
3. Crie as páginas (Nova → Página → em branco):
   - **Visão Geral** (defina como página **inicial**)
   - **Diretrizes**
   - **Diretriz 1 … Diretriz 13** (uma página cada)
   - **Tríade Técnica** e **Análise e Acompanhamento** (quando houver conteúdo)
4. **Navegação superior:** em *Editar* o menu do topo, adicione os links:
   `Visão Geral · Diretrizes · Tríade Técnica · Análise e Acompanhamento`.
   (Reproduz a barra `.topnav` do protótipo.)

---

## 3. Subir as imagens

1. **Engrenagem → Conteúdo do site → Ativos do Site** (ou crie uma biblioteca “Imagens”).
2. Suba as três pastas — todas já em **PNG**, prontas para as web parts:

   | Pasta | O que é | Onde entra |
   |---|---|---|
   | `sharepoint/ilustracoes-quadriculado/` | **recomendada** — diagramas das diretrizes em 3× (2892 px de largura), com o canvas quadriculado e a borda do protótipo | web part **Imagem** |
   | `sharepoint/ilustracoes-png/` | mesmos diagramas em 1200 px, sem canvas | web part **Imagem** |
   | `sharepoint/capas-diretrizes/` | as 13 capas azuis (1600 × 232) | web part **Imagem**, topo da página |
   | `sharepoint/capas-secoes/` | as capas das páginas Diretrizes, Tríade Técnica e Análise e Acompanhamento, na mesma medida (1600 × 232) | web part **Imagem**, topo da página |
   | `sharepoint/links-rapidos/` | **recomendada** — 15 miniaturas 16:9 (800 × 450): 4 das seções, 4 de tecnologias e 7 de tópico | **Links Rápidos** no layout **Bloco** |
   | `sharepoint/links-rapidos-titulo/` | as mesmas 15 com o **título desenhado** (800 × 450) | quando o layout não exibe o título por fora |
   | `assets/icons/` | os mesmos 15 como ícone quadrado (240 × 240) | **Links Rápidos** nos layouts **Compacto** e **Lista** |
   | `sharepoint/cartoes-diretrizes-titulo/` | os 13 cartões brancos de `diretrizes.html` (800 × 450), com ícone, `DIRETRIZ N` e o título, sem o link “Abrir” | **Links Rápidos** no layout **Bloco**, na página Diretrizes |
   | `sharepoint/cartoes-diretrizes-numero/` | os mesmos 13 só com ícone e `DIRETRIZ N` (800 × 450) | quando o título vem do próprio web part |
   | `sharepoint/icones-diretrizes/` | os 13 ícones das diretrizes soltos (240 × 240) | **Links Rápidos** nos layouts **Compacto** e **Lista** |
   | `sharepoint/regra-fundo-1600x232.png` | a moldura do bloco `.regra` vazia — gradiente, borda e filete azul, na altura das capas | **fundo de seção**, com o texto da regra digitado por cima |
   | `sharepoint/regra-fundo-icone-1600x232.png` | a mesma moldura com o selo azul à esquerda | idem; o texto precisa recuar para não cobrir o selo |
   | `sharepoint/selo-figura-420x144.png` | a pílula azul **FIGURA** que abre o cabeçalho de cada figura | web part **Imagem**, acima da ilustração |
   | `sharepoint/em-construcao-1600x600.png` | aviso de página ainda não publicada | web part **Imagem**, no corpo da página que falta montar |

   > ⚠️ O layout do web part **Links Rápidos** decide o formato da imagem. No
   > layout **Bloco**, o item é um cartão com miniatura **em paisagem** e o
   > título por fora — um ícone quadrado é esticado ou cortado ali. Use
   > `links-rapidos/` nesse caso e `assets/icons/` nos layouts que exibem um
   > ícone pequeno ao lado do texto. As miniaturas **não** trazem o título
   > desenhado: quem o exibe é o próprio web part. Se o layout escolhido **não**
   > mostrar o título, use `links-rapidos-titulo/`, que o traz na arte — mas não
   > combine as duas coisas, ou o título aparece duplicado.

   > As três pastas de diretriz saem do mesmo cartão de `diretrizes.html`, então
   > servem à página **Diretrizes** em vez de `links-rapidos/`, que é fundo azul.
   > Os cartões vêm em **fundo branco chapado, sem borda e sem cantos
   > arredondados**: quem desenha a moldura do item é o web part, e a borda do
   > `.ql-card` viraria um segundo quadro por dentro do primeiro.
   > Regerar: `node sharepoint/gerar-cartoes-diretrizes.js`.

   > A pasta `ilustracoes-quadriculado/` reproduz o enquadramento que o protótipo dá
   > às figuras — fundo `#f6f9fc` com malha de pontos, borda de 1 px e cantos
   > arredondados. Use-a quando a página tiver fundo branco: sem o canvas, a
   > ilustração fica solta. Cobre as diretrizes 1 a 10; as diretrizes 11, 12 e 13
   > não têm ilustração. Regerar: `node sharepoint/gerar-ilustracoes-quadriculado.js`.

3. ⚠️ Alguns tenants **bloqueiam SVG** na web part Imagem — por isso os PNG já vêm
   prontos. Se preferir SVG (nitidez infinita), use `assets/img/` e peça a liberação ao admin.
4. ♿ **Sempre preencha o texto alternativo** de cada imagem. Nas capas isso é
   obrigatório: o título da diretriz está desenhado na imagem, então o alt é o que
   entrega esse texto para leitor de tela e para a busca. Use o título da diretriz,
   idêntico ao nome da página.

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
| 7 | 1 coluna | **Botão** ou **Chamada para ação** | “Acessar as Diretrizes” |

### 4.2 Página “Diretrizes” (hub)

| Ordem | Web part | Conteúdo |
|---|---|---|
| 1 | **Herói** ou seção com cor de destaque + **Texto** | Título “Diretrizes” |
| 2 | **Texto** | Intro (jornada de maturidade) |
| 3 | **Links Rápidos** (13 itens) | Cada item linka para a página da diretriz correspondente |

### 4.3 Página de cada “Diretriz” (modelo único, repetir 13x)

| Ordem | Seção | Web part | Mapa do protótipo |
|---|---|---|---|
| 1 | 1 coluna | **Imagem** → `capas-diretrizes/diretriz-NN-….png` | Capa azul com nº + título (`.page-hero`) |
| 2 | 1 coluna | **Texto** | Enunciado completo da diretriz (o `<h1>` da página do protótipo) |
| 3 | 1 coluna | **Texto** (realce) ou **Chamada para ação** | Caixa **“Regra”** (`.regra`) |
| 4 | 1 coluna | **Texto** | “O que a diretriz exige” (lista) |
| 5 | 1 coluna | **Imagem** | Ilustração da diretriz (`ilustracoes-png/…`) |
| 6 | 1 coluna | **Texto** (com tabela) | Tabelas, quando houver |
| 7 | 1 coluna | **Texto** / **Link** | “Referências metodológicas” |

> A capa traz o **título curto**; o **enunciado normativo completo** entra logo
> abaixo como **texto nativo** (ordem 2). É o que mantém o texto que realmente
> importa pesquisável e selecionável, em vez de preso dentro da imagem.

> Navegação “anterior/próxima” entre diretrizes: use a **navegação do hub** ou um
> bloco **Links Rápidos** no rodapé com as diretrizes vizinhas.

---

## 5. Mapa completo (bloco do protótipo → web part)

| Bloco (classe no protótipo) | Web part do SharePoint (PT-BR) |
|---|---|
| `.hero` / `.page-hero` (capa azul) | **Herói** · ou **Imagem** com texto · ou seção “Destaque forte” + **Texto** |
| `.regra` / `.callout` (caixa colorida) | **Texto** com realce · ou **Chamada para ação** |
| `.quicklinks` (cards) | **Links Rápidos** |
| `.section` / listas / parágrafos | **Texto** |
| `.figure` (ilustração) | **Imagem** |
| `.tbl` (tabela) | **Texto** (tabela nativa) |
| CTA / botão | **Botão** · ou **Chamada para ação** |
| `.topnav` (navegação) | **Navegação do hub / do site** |
| Bloco de changelog (Diretriz 13) | **Texto** (com formatação de código) |

---

## 6. Dicas de fidelidade

- **Seções com ênfase:** use a ênfase **“Forte”** (cor de tema) nas faixas que
  imitam as capas azuis; **“Neutra/Suave”** no corpo.
- **Realce de texto:** as caixas “Regra/Aviso” saem bem com **citação** ou
  **realce** no editor de Texto; reserve a **Chamada para ação** para os destaques
  mais fortes.
- **Imagens:** mantenha **proporção** e largura **total** ou **1/1**; não estique.
- **Laranja CAIXA** (`#F39200`): só em **botões/CTA** e nos diagramas.
- **Consistência:** monte **uma** página de diretriz perfeita, depois **duplique**
  (Configurações da página → Copiar) e troque número, título, regra e imagem.

---

## 7. Limitações honestas (caminho sem código)

- O **cabeçalho e o menu** são os nativos do SharePoint — não o header custom do protótipo.
- Gradientes e micro-ajustes de espaçamento **não** são reproduzíveis pixel a pixel.
- As caixas **“Regra”** com borda colorida não existem como web part: o mais próximo
  é **Texto** com citação/realce ou **Chamada para ação**.
- **Sem tema custom** (Opção B da seção 1), links, botões e faixas “Forte” ficam no
  azul padrão do SharePoint. O azul institucional aparece só onde há imagem.
- Texto desenhado dentro de imagem (as capas) não é pesquisável nem selecionável.
  Por isso o guia restringe isso ao **título curto** e exige **texto alternativo**
  na imagem, com o enunciado completo como texto nativo logo abaixo.
- O resultado fica com **a mesma identidade institucional**, que é o objetivo aqui.
- Para fidelidade total (reusar o CSS), seria o caminho **SPFx** (exige App Catalog/dev)
  ou **Embed via iframe** (exige liberação de domínio) — fora do escopo “sem código”.

# Protótipo — Modelo VIC (Versionamento e Integração de Código)

Protótipo de referência das páginas do **Modelo de Versionamento e Integração de
Código (VIC)**, desenhado para ser remontado nativamente no **SharePoint Online**
usando apenas componentes (web parts) padrão. Cada bloco do protótipo corresponde
a uma web part do SharePoint.

> **Modelo determinístico.** Todo o conteúdo tem caráter **impositivo**. Termos
> como “recomenda-se”, “sugerimos”, “o ideal é que” e “preferencialmente” foram
> substituídos por “deve”, “é obrigatório” e “não é permitido”.

---

## Como visualizar

Abra `index.html` em qualquer navegador (funciona via `file://`, sem build).
A navegação (header, navegação superior, breadcrumb e prev/próxima) é montada por
`assets/chapter.js`.

- Botão **Mapa SharePoint** (ou URL `?sp=1`): destaca cada bloco com a web part correspondente.
- Botão de **tema** (ou `?theme=dark`): alterna claro/escuro.

### Abrir no celular / offline

Use **`versionamento-codigo-standalone.html`**: um único arquivo com tudo embutido
(CSS, JS e ilustrações). Abra direto — sem descompactar. As páginas trocam por
âncora (`#index`, `#praticas`, `#pratica-1` …). Regenerar após editar:
`python3 assets/build-standalone.py`.

---

## Arquitetura de informação

```
Visão Geral (index)            ← finalidade, missão, benefícios, stack
Práticas Desejadas (praticas)  ← hub com as 13 práticas
   ├── Prática 1 … Prática 13   ← uma página por prática
Tríade Técnica                  ← Aspectos Técnicos / Metodológicos (a fornecer)
Análise e Acompanhamento        ← indicadores e maturidade (a fornecer)
```

### As 13 Práticas Desejadas

| # | Prática | Ilustração |
|---|---|---|
| 1 | Versões testadas e validadas para produção | pipeline de validação |
| 2 | Modelo de flow aderente ao GitFlow ou GitHub Flow | GitFlow × GitHub Flow |
| 3 | Integração contínua e sanitização dos repositórios | ciclo de vida de branch |
| 4 | Baixo índice de divergência entre branches | divergência ahead/behind |
| 5 | Sincronização entre branches principais (merge back) | merge back |
| 6 | Atuação efetiva do Integrador | guard-rails do Integrador |
| 7 | Branches permanentes protegidas | proteção de branch |
| 8 | Pull Request como instrumento central | aprovação → completude |
| 9 | Versionamento semântico (SemVer) | MAJOR.MINOR.PATCH |
| 10 | Tagueamento de produção (Padrão VEC) | MAJOR.MINOR.PATCH.BUILD |
| 11 | Padrões de nomenclatura | tabela de padrões |
| 12 | Políticas de push (formato, tamanho, autoria) | tabela de políticas |
| 13 | Nota de versão (changelog) | exemplo de changelog |

---

## Estrutura de arquivos

```
versionamento-codigo/
├── index.html                  ← Visão Geral
├── praticas.html               ← hub das Práticas Desejadas
├── pratica-1.html … pratica-13.html
├── triade-tecnica.html         ← placeholder
├── analise-acompanhamento.html ← placeholder
├── marca-vic.html              ← folha da marca VIC
├── versionamento-codigo-standalone.html  ← tudo num arquivo (celular/offline)
└── assets/
    ├── chapter.css             ← identidade visual CAIXA
    ├── chapter.js              ← chrome compartilhado (nav, tema, mapa SharePoint)
    ├── build-standalone.py     ← gera o arquivo único
    ├── img/                    ← ilustrações SVG das práticas
    └── brand/                  ← logomarca VIC (lockups, ícone, PNGs)
```

---

## Mapeamento para web parts do SharePoint

| Bloco no protótipo | Web part do SharePoint |
|---|---|
| Capa azul com título (`.hero` / `.page-hero`) | **Banner / Hero** |
| Caixa “Regra” (`.diretriz`) | **Texto** com realce / **Aviso** |
| Índice de cards (`.quicklinks`) | **Links Rápidos** |
| Texto corrido e listas | **Texto** |
| Caixas coloridas (`.callout`) | **Aviso** |
| Ilustrações (`.figure`) | **Imagem** (usar o `.svg`/`.png` correspondente) |
| Tabelas (`.tbl`) | **Texto** (tabela) |
| Referências (`.ref-box`) | **Texto** / **Link** |
| Navegação superior (`.topnav`) | **Navegação do site / hub** |

Layout em **coluna única**, equivalente a uma página de **Site de Comunicação**.
Montagem sugerida: um **hub** para o modelo, uma **página por prática** e a
navegação do hub para reproduzir a barra superior.

---

## Validação e adequação (determinismo + GitFlow)

Todo o conteúdo das 13 práticas foi revisado para tom **impositivo** e validado
contra o GitFlow. Principais ajustes:

- Hedge removido: “recomenda-se”, “boas práticas indicam”, “o ideal é que”,
  “é essencial”, “preferencialmente” → “deve” / “é obrigatório” / “não é permitido”.
- Correções: `permisisonados` → permissionados; `ferramentas de de DEvOps` → DevOps.
- Complementos canônicos do GitFlow: tabela de origem/destino de branches, tags
  SemVer na `main`, nomenclatura `feature/` `release/` `hotfix/`.
- Padrão **VEC** documentado: `MAJOR.MINOR.PATCH.BUILD`.

---

## Pendências de conteúdo (a fornecer)

- **Tríade Técnica** — Aspectos Técnicos e Aspectos Metodológicos.
- **Modelo de Análise e Acompanhamento** — indicadores e faixas de maturidade.
- **Limite de divergência** (Prática 4) — definir o valor institucional.
- **Referências metodológicas** — preencher os blocos reservados nas práticas.

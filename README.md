# doc-template-pages-caixa

**Template do visualizador de documentação (GitHub Pages) com a identidade do
CAIXA Design System.** Use este repositório como ponto de partida para publicar
as especificações de um projeto: copie a estrutura, troque o nome em
[assets/js/config.js](assets/js/config.js) e substitua o conteúdo de exemplo
(domínio **Clientes**) pela documentação real do seu produto.

> Toda melhoria do visualizador deve ser feita **aqui** e depois replicada para
> os repositórios de documentação que usam este template.

---

## O que vem pronto

- **Visualizador estático** (`index.html` + `assets/`) — sem build, sem bundler.
  Abre direto via GitHub Pages ou servidor estático local.
- **Menu lateral** com árvore de diretórios expansível, busca por nome/conteúdo,
  tema claro/escuro, navegação SPA e suporte a diagramas **Mermaid**.
- **CAIXA Design System** (`prototypes/_biblioteca-caixa/caixa-ds.css`).
- **Workflow do GitHub Pages** (`.github/workflows/pages.yml`) que gera a árvore
  de arquivos e publica o site a cada push na `main`.
- **Conteúdo de exemplo** — domínio fictício **Cadastro de Clientes** (N0 → N1 →
  N2 → N3), dicionários canônicos, data-model e índice de módulos.

---

## Estrutura

```
doc-template-pages-caixa/
├── index.html                      ← visualizador (não editar para uso normal)
├── serve.json
├── .nojekyll
├── assets/
│   ├── js/config.js                ← nome do projeto (EDITAR)
│   ├── js/app.js
│   ├── css/app.css
│   ├── generate-tree.js            ← gera assets/tree.js (Node)
│   └── generate-tree.py            ← gera assets/tree.js (Python)
├── .github/workflows/pages.yml
├── global/                         ← contexto global e dicionários
│   ├── N0_PRODUCT_VISION.md        ← visão de produto (N0)
│   ├── MASTER.md                   ← stack e convenções
│   ├── DATA-MODEL.md               ← índice de entidades + enums
│   ├── data-models/clientes.md     ← fragmento de dados por domínio
│   ├── FIELD-DICTIONARY.md         ← campos canônicos (CPF, e-mail, CEP…)
│   ├── RULES-DICTIONARY.md         ← regras de negócio canônicas
│   ├── ERROR-DICTIONARY.md         ← códigos de erro de API
│   └── MESSAGE-DICTIONARY.md       ← mensagens de UI + baseline de validação
├── modules/
│   ├── INDEX.md                    ← índice de domínios e rastreabilidade
│   └── clientes/                   ← domínio de exemplo
│       ├── README.md               ← N1 (domínio)
│       └── g-clientes/
│           ├── README.md           ← N2 (feature set)
│           ├── f-cadastrar.md      ← N3 (feature)
│           ├── f-pesquisar.md
│           ├── f-visualizar.md
│           ├── f-editar.md
│           └── f-excluir.md
├── prototypes/_biblioteca-caixa/   ← CAIXA Design System
├── repos/                          ← índice de repositórios do sistema
└── decisions/                      ← ADRs
```

---

## Como usar

1. **Adapte o nome** em [assets/js/config.js](assets/js/config.js) (`name`).
2. **Substitua o exemplo** do domínio `clientes` pela documentação real.
3. **Regenere a árvore** sempre que adicionar, renomear ou remover arquivos `.md`:
   ```bash
   node assets/generate-tree.js     # ou: python assets/generate-tree.py
   ```

### Rodar localmente

O visualizador acessa arquivos locais; por restrições de `file://` use um
servidor estático simples a partir da raiz do repositório:

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`.

### Publicar no GitHub Pages

Em **Settings > Pages**, defina **Source = GitHub Actions**. A cada push na
`main`, o workflow gera `assets/tree.js` e publica o site.

---

## Níveis de especificação

| Nível | Artefato | Onde fica |
|---|---|---|
| N0 | Visão de Produto | `global/N0_PRODUCT_VISION.md` |
| N1 | Domínio | `modules/[dominio]/README.md` |
| N2 | Feature Set | `modules/[dominio]/[feature-set]/README.md` |
| N3 | Feature | `modules/[dominio]/[feature-set]/[feature].md` |

| Ícone | Status |
|---|---|
| 📋 | Especificado |
| 🔄 | Em desenvolvimento |
| ✅ | Implementado |
| ⚠️ | Revisão necessária |
| ❌ | Deprecado |

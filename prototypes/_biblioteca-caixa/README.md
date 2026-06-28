# Biblioteca de Componentes — CAIXA Design System (HTML/CSS)

> Componentes prontos para protótipos, extraídos **diretamente do Figma**
> (CAIXA Design System) via **Dev Mode MCP**. Fonte **CAIXA Std**, tokens
> canônicos `--dsc-*`.
>
> ⚠️ Biblioteca **paralela** à [`../_biblioteca`](../_biblioteca) (sakai/PrimeNG).
> Esta reflete o DS real do produto; a outra é o tema genérico Aura.

---

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| [`tokens.css`](./tokens.css) | Variáveis `--dsc-*` (cores, espaçamento, tipografia, raios, bordas, elevações) extraídas da página **🎨 Tokens** do Figma. Espelho fiel — não editar à mão. |
| [`caixa-ds.css`](./caixa-ds.css) | Componentes (classes `.dsc-*`). Importa `tokens.css`. |
| [`index.html`](./index.html) | Catálogo navegável — abra no browser para ver tudo, com botão de tema claro/escuro. |

---

## Como usar em um protótipo

### Opção A — linkar a biblioteca (recomendado)

```html
<!-- protótipo em prototypes/[dominio]/[feature-set]/[feature]/form.html -->
<link rel="stylesheet" href="../../../_biblioteca-caixa/caixa-ds.css">
```

Ajuste o número de `../` conforme a profundidade. `caixa-ds.css` já faz
`@import` de `tokens.css`, então um único link basta. Vantagem: ponto único de
verdade — mudou o DS, mudou todo protótipo.

### Opção B — auto-contido

Para um arquivo 100% portátil, copie `tokens.css` + `caixa-ds.css` para dentro
de uma `<style>` no próprio HTML. Use só quando o protótipo precisa circular
isolado (e-mail, anexo).

---

## Modo escuro

Adicione a classe `app-dark` na raiz:

```html
<html class="app-dark"> … </html>
```

ou via JS: `document.documentElement.classList.toggle('app-dark')`.

---

## Estrutura de shell (sidebar + header + conteúdo)

**Menu oculto por padrão (drawer via ☰)** — decisão do projeto: o layout default
usa o tamanho **extra large com a sidebar escondida**. O conteúdo ocupa a largura
total e o menu é acessado pelo botão ☰ (`.dsc-menu-toggle`) no header, em qualquer
tamanho. A sidebar abre como **drawer sobreposto** (`.is-menu-open` + `.dsc-sidebar-backdrop`),
recolhendo ao acionar uma opção / clicar fora / ESC. O toggle usa `dscToggleMenu()`.

```html
<body>
  <div class="dsc-app">
    <aside class="dsc-sidebar">
      <div class="dsc-sidebar-brand"><span class="dsc-brand-mark">C</span> CAIXA</div>
      <ul class="dsc-menu">
        <li class="dsc-menu-section">Menu</li>
        <li><a class="dsc-menu-item is-active" href="#">Início</a></li>
        <li><a class="dsc-menu-item" href="#">Clientes</a></li>
      </ul>
    </aside>
    <div class="dsc-shell-main">
      <header class="dsc-header">
        <button class="dsc-menu-toggle" aria-label="Recolher/expandir menu" onclick="dscToggleMenu()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        … (título, ações) …
      </header>
      <main class="dsc-main is-narrow">
        <nav class="dsc-breadcrumb"> … </nav>
        <div class="dsc-page-header">
          <h1 class="dsc-page-title">Título da tela</h1>
          <p class="dsc-page-subtitle">Subtítulo opcional</p>
        </div>
        <div class="dsc-card"> … conteúdo … </div>
      </main>
      <footer class="dsc-footer">…</footer>
    </div>
    <!-- backdrop do drawer (fecha ao clicar fora, em telas < lg) -->
    <div class="dsc-sidebar-backdrop" onclick="this.closest('.dsc-app').classList.remove('is-menu-open')"></div>
  </div>

  <script>
    // ☰: abre/fecha o drawer do menu (sidebar oculta por padrão)
    function dscToggleMenu() {
      document.querySelector('.dsc-app').classList.toggle('is-menu-open');
    }
    // recolhe o menu ao acionar uma opção
    document.querySelectorAll('.dsc-menu-item').forEach(function (a) {
      a.addEventListener('click', function () { a.closest('.dsc-app').classList.remove('is-menu-open'); });
    });
  </script>
</body>
```

**Breakpoints** (Figma "Basic Layout"): `extra small 360 · small 480 · medium 768 · large 1024 · extra large 1440`. **Default = extra large** (sidebar oculta). Conteúdo em grid de 12 colunas.

Veja funcionando em [`shell-responsive.html`](./shell-responsive.html).

> Para protótipos **component-only** (sem shell), use `<main class="dsc-component-only">`.

---

## Catálogo de classes

| Categoria | Classes principais |
|---|---|
| **Layout** | `dsc-app` · `dsc-sidebar` · `dsc-menu` / `dsc-menu-item` · `dsc-shell-main` · `dsc-header` · `dsc-main` · `dsc-footer` · `dsc-page-header` / `dsc-page-title` · `dsc-component-only` |
| **Header (Figma Header)** | `dsc-header-start` · `dsc-header-logo` · `dsc-header-search` (+ `dsc-kbd`) / `dsc-header-search-icon` · `dsc-header-item` (`dsc-hi-icon`/`dsc-hi-body`/`dsc-hi-title`/`dsc-hi-sub`/`dsc-hi-caret`) — conta e perfil; colapsam abaixo de lg |
| **Tipografia** | `dsc-display` · `dsc-title-lg` · `dsc-title` · `dsc-title-sm` · `dsc-body` · `dsc-body-sm` · `dsc-label` · `dsc-caption` |
| **Botões** | `dsc-btn` + tipos `dsc-btn--{outline,chromeless}` · severidades `dsc-btn--{danger,neutral}` · tamanhos `dsc-btn--{sm,lg}` (32·44·48px) · `dsc-btn--icon` (+`--tiny`/`--sm`/`--lg` = 24·32·44·48) · `dsc-btn--block` · estados `is-loading` `disabled` · `dsc-segmented` |
| **Formulário** | `dsc-field` (+`is-invalid`) / `dsc-field-label` / `dsc-field-hint` / `dsc-field-error` · `dsc-input` · `dsc-textarea` · `dsc-select` · `dsc-input-icon` · `dsc-search` · `dsc-check` · `dsc-radio` · `dsc-switch` · `dsc-slider` · `dsc-stepper` · `dsc-form-row` |
| **Indicadores** | `dsc-tag` (Badge Text — `--{highlight,neutral,success,warning,danger}` · tamanhos `--{sm,lg}` · slots de ícone · sem borda/dot) · `dsc-badge` (+`--dot`) · `dsc-chip` · `dsc-avatar` (escala `--{tiny,smaller,sm,lg,larger,big,bigger}` = 20·24·32·44·56·64·96·128) |
| **Feedback** | `dsc-alert` (Card Alert — `--{info,success,warning,danger,smart-tips}`, `dsc-alert-cta`) · `dsc-toast` · `dsc-modal` / `dsc-modal-mask` · `dsc-progress` · `dsc-spinner` · `dsc-skeleton` · `dsc-state` (empty/error) |
| **Navegação** | `dsc-breadcrumb` · `dsc-tabs` / `dsc-tab` · `dsc-steps` / `dsc-step` · `dsc-paginator` · `dsc-titlebar` · `dsc-page-controller` (dots) |
| **Campos+** | `dsc-field-action` (olho/calendário) · `dsc-money` · `dsc-pin` (OTP) · `dsc-input-chips` · `dsc-account-select` |
| **Upload** | `dsc-dropzone` · `dsc-file` |
| **Datas** | `dsc-calendar` (date picker) |
| **Cards** | `dsc-card-widget` · `dsc-card-vertical` · `dsc-card-horizontal` · `dsc-card-notification` (+`is-unread`) |
| **Tiles/Ícones** | `dsc-tile` (+`is-selected`) · `dsc-icon-container` (+severidade) · `dsc-icon-btn-text` · `dsc-image-media` |
| **Overlays** | `dsc-drawer` / `dsc-drawer-mask` · `dsc-toolbar` |
| **Dados** | `dsc-table` / `dsc-col-actions` · `dsc-list` / `dsc-list-item` · `dsc-list-heading` · `dsc-lv` (label-value) · `dsc-value-section` · `dsc-search-result` · `dsc-divider` · `dsc-tooltip` · `dsc-popover` |
| **Chat** | `dsc-chat-input` (Input / Chat) |
| **Grid 12 colunas** | `dsc-row` + `dsc-col-{1..12}` (Figma Basic Layout: ≥768px 12col/gutter 24; <768px 4col/gutter 16, empilham) · `dsc-row--margin` |
| **Utilitários** | `dsc-flex` · `dsc-grid-{2,3,4}` · `dsc-gap-{1,2,3}` · `dsc-items-center` · `dsc-justify-between` · `dsc-w-full` · `dsc-mt-{1,2,3}` |

Veja todos renderizados em [`index.html`](./index.html).

---

## Severidades (cores semânticas do DS)

| Severidade | Token base | Uso |
|---|---|---|
| `highlight` (primary) | `--dsc-color-primary-90` `#005ca9` | Ação principal, destaque, links |
| `danger` (negative) | `--dsc-color-negative-90` `#b22c2c` | Erro, exclusão |
| `positive` | `--dsc-color-positive-90` `#127527` | Sucesso, status positivo |
| `attention` | `--dsc-color-attention-70` `#fcbe05` | Aviso, pendência |
| `informative` | `--dsc-color-informative-90` `#038299` | Informação neutra |
| `neutral` | `--dsc-color-grayscale-130` `#22292e` | Superfície/ícone neutro (ex.: `dsc-icon-container--neutral`) |

### Mapa do componente Button (nomenclatura do Figma)

Variantes, tipos, tamanhos e estados são **exatamente** os do Figma:

| Figma | Classe |
|---|---|
| `variant=highlight` | _(padrão)_ |
| `variant=danger` | `dsc-btn--danger` |
| `variant=on media bg` | `dsc-btn--on-media` (use sobre fundos coloridos) |
| `type=plain` | `dsc-btn` (sólido) |
| `type=outline` | `dsc-btn dsc-btn--outline` |
| `type=chromeless` | `dsc-btn dsc-btn--chromeless` |
| `size=standard` (44px) | _(padrão)_ |
| `size=small` (32px) | `dsc-btn--sm` |
| `state=loading` | `is-loading` |

> Para **ação secundária** (cancelar, limpar) o DS não tem botão "neutro"
> preenchido — usa-se `dsc-btn--chromeless` ou `dsc-btn--outline` (highlight).

### Convenção de tamanhos

O DS **não** usa um tamanho universal para tudo. O tamanho-base é **`standard`**
(o default de cada componente); alguns adicionam **`small`** e/ou **`large`**, e
poucos têm **`tiny`** ou escala estendida. **Muitos componentes têm tamanho único.**

| Componente | Tamanhos (px) |
|---|---|
| Button | small 32 · standard 44 · large 48 |
| Icon Button | tiny 24 · small 32 · standard 44 · large 48 |
| Badge Text | small 20 · standard 24 · large 32 |
| Avatar | tiny 20 · smaller 24 · small 32 · standard 44 · large 56 · larger 64 · big 96 · bigger 128 |
| Spinner | small 20 · large 36 |
| Icon Container · Badge Notification | small · standard (· large) |
| _Demais_ (inputs, checkbox, radio, switch, chips, dropdown, modal, toast, tabs, segmented, tile, progress, tooltip, stepper, skeleton, popover) | **tamanho único** |

---

## Como esta biblioteca foi gerada / como atualizar

Extraída do **Figma Desktop** com o **Dev Mode MCP Server** (porta `3845`):

1. `get_metadata` (sem nodeId) → lista de páginas/componentes do documento.
2. `get_variable_defs` na página **🎨 Tokens** → variáveis `--dsc-*` → `tokens.css`.
3. `get_screenshot` / `get_metadata` por componente → calibração visual e taxonomia de variantes → `caixa-ds.css`.

Para regenerar quando o DS mudar no Figma, reexecute o passo 2 (tokens) e
revise os componentes afetados. Os tokens são a fonte da verdade visual — manter
`tokens.css` em dia já propaga cor/espaçamento/tipografia para todos os `.dsc-*`.

---

*Origem: Figma "CAIXA DS" via Dev Mode MCP. Gêmea da [`../_biblioteca`](../_biblioteca) (sakai), porém fiel ao produto.*

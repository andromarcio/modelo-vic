# PROMPT_PROTOTYPE_FLOW — Protótipo de Fluxo (N2)

> **Modelo de estrutura**: `engine/templates/prototypes/_template/_template-feature-set/README.md` *(referência humana — o prompt já embute o esqueleto)*
> **Quem participa**: dev / designer / PO técnico
> **Insumo necessário**: DESIGN-SYSTEM.md + N2 do Feature Set
> **Entrega**: arquivo `flow.html` navegável mostrando como as telas do
> Feature Set se conectam, seguindo os padrões do Design System
>
> **Pré-requisito**: N2 aprovado (PROMPT_2A concluído)
> **Onde salvar**: `prototypes/[dominio]/[feature-set]/flow.html`
>
> **v2 (2026-06-11)**: regras 10–21, seção de anti-padrões, checklist de
> conferência e snippets canônicos — para alinhar o resultado entre diferentes
> LLMs. Inclui header completo (regra 20), botões de ação derivados do "Fluxo
> Principal" do N2 (regra 19) e arquivo único por N2 (regra 21).
> Referência: `prototypes/cadastro/g-fundos-geridos/flow.html`.

---

## INSTRUÇÕES PARA O CLAUDE

Você vai gerar um protótipo de fluxo HTML para um Feature Set.
O protótipo deve mostrar visualmente como as telas se conectam,
seguindo rigorosamente os padrões definidos no DESIGN-SYSTEM.md.

### Regras de geração

1. **Fidelidade ao Design System**: use exatamente as cores, tipografia,
   espaçamentos e componentes definidos no DESIGN-SYSTEM.md.
   Não invente padrões visuais — se algo não estiver no Design System,
   use o padrão mais neutro e sinalize com um comentário `<!-- TODO: definir no Design System -->`.

2. **Use a biblioteca de componentes**: linke `prototypes/_biblioteca-ds/ds.css`
   e use as classes `.dsc-*` (CAIXA DS, espelham o DESIGN-SYSTEM.md). Ajuste o
   caminho relativo conforme a profundidade do arquivo — para
   `prototypes/[dom]/[fs]/flow.html` o caminho é `../../_biblioteca-ds/ds.css`.
   A navegação entre telas usa `.dsc-screen` / `.dsc-screen.is-active` (já na biblioteca).
   Apenas o JS de navegação vai inline.
   **Não redefina classes da biblioteca em CSS inline.** Em especial,
   `.prototype-badge` já vem estilizado pelo `sakai.css` — não recrie essa regra
   nem reposicione o badge (não use `top/right/bottom/left` soltos nele), senão
   ele estica e vira um bloco gigante sobre a tela.

3. **Navegação funcional**: os botões e links que levam de uma tela para outra
   devem funcionar — implementar como troca de `display: block/none` entre
   seções, sem backend. O usuário deve conseguir clicar e "navegar" pelo fluxo.

4. **Layout completo**: gerar o layout completo da aplicação — sidebar, topbar,
   área de conteúdo — conforme definido no DESIGN-SYSTEM.md.
   Não gerar apenas o componente isolado.

5. **Indicador de tela atual**: a tela ativa deve ser sempre identificável —
   breadcrumb atualizado, item da sidebar destacado, título da página visível.

6. **Dados fictícios realistas**: preencher tabelas, listas e formulários com
   dados fictícios que façam sentido para o domínio — nunca "Lorem ipsum" ou
   "Teste 1, Teste 2". Os dados devem refletir o contexto real da feature.
   Tabelas de listagem/histórico devem ter **no mínimo 5 linhas** para não
   parecerem vazias, com pelo menos uma linha de cada status relevante
   (ex.: ativo/inativo; sucesso/atualizado/falha).

7. **N3s opcionais, mas vinculantes se fornecidos**: os N3s das features são
   insumo opcional. Porém, **quando fornecidos, passam a ser de uso obrigatório** —
   campos, labels, mensagens, validações e estados de cada tela devem refletir
   exatamente o N3 correspondente, e não apenas o resumo do N2. Não ignore nem
   resuma o conteúdo de um N3 fornecido.

8. **Tela de pesquisa — todos os filtros**: quando uma tela for de pesquisa/
   listagem e os N3s das features forem fornecidos, o card de filtros deve conter
   **um input para cada campo marcado `(filtro)`** na tabela "Campos" do N3
   correspondente — nunca resumir ou omitir filtros. Os campos `(resultado)`
   viram colunas da tabela. Confira a lista de filtros do N3 antes de entregar.

9. **Anotar lacunas**: qualquer comportamento descrito no N2 que não puder ser
   representado visualmente no HTML deve ser anotado em um painel de notas
   visível no protótipo:
   ```html
   <div class="dsc-proto-notes">
     <strong>📋 Notas do protótipo:</strong>
     <ul>
       <li>O comportamento X não está representado aqui — ver N2: [seção]</li>
     </ul>
   </div>
   ```

10. **Saída em UTF-8 com acentuação correta**: todo texto visível em português
    mantém acentos e cedilha (Protótipo, não, Situação, Código, Ações). Nunca
    remover acentos nem trocar por ASCII — mesmo no `dsc-proto-badge` e nos
    comentários. O arquivo é UTF-8.

11. **Telas no estado de repouso por padrão**: cada tela é renderizada no seu
    estado neutro inicial. **Não embutir, na carga**, mensagens de erro de
    validação, alertas de bloqueio, spinners ou textos de "Processando…". Esses
    estados só aparecem como **consequência de uma interação** (clique). Form de
    cadastro abre vazio e sem erros; importação abre sem barra de progresso.

12. **Filtros e formulários começam vazios**: a tela de pesquisa abre com filtros
    em branco (placeholder mostra o formato) e a tabela exibindo os "últimos N
    registros". O form de cadastro abre com todos os campos vazios. **Apenas o
    modo de edição** pré-popula campos com os dados do registro.

13. **Feedback de sucesso via toast**: toda ação que o N3 descreve com toast
    (cadastrar, editar, excluir, importar) tem um `.dsc-toast` no canto superior
    direito, disparado pelo clique e que some sozinho (~4s). Nunca omitir o toast.

14. **Confirmação e bloqueio são modais separados**: quando o N3 de exclusão tem
    cenário feliz **e** cenário de bloqueio por vínculo, modele **dois modais
    distintos** — um de confirmação (com botão "Excluir") e um de bloqueio (sem
    botão de excluir, só "Ok, entendi"). Nunca exibir a mensagem de bloqueio
    junto do botão "Excluir" no mesmo modal.

15. **Ícones de ação são icon-only**: botões em `.dsc-col-actions` /
    `.dsc-icon-action` contêm **apenas** um `<svg>` + `aria-label` + `title` —
    nunca texto (a classe é uma caixa fixa de 32×32px; texto estoura). Para ação
    com rótulo textual, use `.dsc-btn--chromeless .dsc-btn--sm`.

16. **Obrigatório/opcional marcados pela exceção**: campo obrigatório recebe
    `<span class="dsc-req">*</span>` (cor danger via DS) — nunca um "*" em texto
    plano. Campo opcional recebe `(opcional)` em `dsc-text-muted`. Marque sempre
    a minoria, conforme UX Writing.

17. **Visualização (somente leitura) usa label-valor**: a ficha cadastral
    consolidada usa `.dsc-lv` (rótulo + valor) — não inputs `disabled`. A única
    ação é "Voltar"; não incluir botão de editar dentro da visualização quando o
    N3 isola o fluxo de alteração.

18. **Navegação consistente**: breadcrumb com o caminho completo
    (Início › Domínio › Tela); o item de menu da tela ativa — ou da sua tela de
    origem, no caso de telas contextuais como editar/visualizar — sempre
    destacado com `.is-active`. Toda navegação clicável precisa funcionar.

19. **Botões de ação vêm do "Fluxo Principal" do N2**: leia o diagrama Mermaid da
    seção **Fluxo Principal** do N2. Cada **seta rotulada que sai do nó de uma
    tela** (ex.: "Importação XML", "Novo Cadastro", "Pesquisa e Filtro") é uma
    ação que o usuário inicia naquela tela e **deve** virar um botão/opção
    **visível e funcional** ali. Não omita ramos do fluxo: se o N2 mostra "Novo
    Cadastro" **e** "Importação XML" saindo da tela de pesquisa, as duas precisam
    aparecer como botões nessa tela — além das ações por linha da tabela
    (visualizar, editar, excluir). Antes de entregar, percorra o diagrama e
    confirme que cada ação iniciada pelo usuário tem um controle correspondente.

20. **Barra de título (header) completa**: o header não é só ☰ + avatar. Use o
    padrão do DS — à esquerda `dsc-header-start` com o ☰ e a marca
    (`dsc-header-logo`); à direita `dsc-header-actions` com a identidade do
    usuário em `dsc-header-item` (avatar + nome + **perfil**, usando um perfil
    real da seção "Permissões por perfil" do N2). Nunca reduzir o header a um
    `<strong>` solto com um `dsc-avatar`.

21. **Um único arquivo por N2**: o protótipo de fluxo de um Feature Set é sempre
    **um só** `flow.html`, contendo **todas** as telas do N2 como seções
    `.dsc-screen` alternadas por JS (`showScreen`). Nunca dividir o fluxo em
    vários HTMLs, nem criar arquivos paralelos de versão/variação
    (`flow_old.html`, `flow_caixa.html`, `flow_v2.html`, `flow-rascunho.html`…).
    Ao **regenerar**, sobrescreva o `flow.html` existente — versões anteriores
    ficam no histórico do git, não em arquivos soltos no diretório. Protótipos de
    tela isolada por estado pertencem ao PROMPT_PROTOTYPE_SCREEN, não ao fluxo.

---

## ANTI-PADRÕES (não fazer)

> Casos reais observados em gerações anteriores do mesmo insumo. Evite cada um —
> são a causa mais comum de protótipos divergentes entre LLMs.

| Anti-padrão | Faça em vez disso |
|---|---|
| Texto sem acento ("Prototipo", "Situacao", "Acoes") | Acentuação PT-BR correta, UTF-8 (regra 10) |
| Alerta de erro/validação visível ao abrir a tela | Estado de repouso; erro só após ação (regra 11) |
| "Processando…" fixo ao lado de um botão ativo | Estado de processamento só durante a ação (regra 11) |
| Filtros de pesquisa / form de cadastro pré-preenchidos | Vazios; só edição pré-popula (regra 12) |
| Texto "Ver/Editar/Excluir" dentro de `.dsc-icon-action` | SVG + `aria-label`; texto só em `.dsc-btn` (regra 15) |
| Modal único misturando botão "Excluir" + "não é possível excluir" | Dois modais: confirmar × bloquear (regra 14) |
| Ação de sucesso sem retorno visual | `.dsc-toast` disparado no clique (regra 13) |
| "*" em texto plano no label | `<span class="dsc-req">*</span>` (regra 16) |
| Tabela com 1–2 linhas | ≥ 5 linhas realistas (regra 6) |
| Visualização com inputs `disabled` | `.dsc-lv` label-valor (regra 17) |
| Faltar botão de uma ação documentada no Fluxo Principal (ex.: "Novo Cadastro") | Um botão por seta rotulada do fluxo (regra 19) |
| Header reduzido a `<strong>` + avatar | Marca à esquerda + identidade (nome + perfil) à direita (regra 20) |
| Vários HTMLs ou arquivos `flow_*` paralelos no diretório | Um único `flow.html`, sobrescrito ao regenerar (regra 21) |

---

## CHECKLIST ANTES DE ENTREGAR

Releia o HTML gerado e confirme **cada** item antes de apresentar o `flow.html`.
Se algum falhar, corrija antes de entregar:

- [ ] Todo texto PT-BR está acentuado e o arquivo é UTF-8.
- [ ] Cada tela abre no estado de repouso (sem erros / spinners / "processando" embutidos).
- [ ] Filtros de pesquisa e form de cadastro abrem vazios; só edição pré-popula.
- [ ] Cada campo `(filtro)` do N3 virou um input; cada `(resultado)` virou coluna.
- [ ] Campos obrigatórios com `.dsc-req`; opcionais com `(opcional)`.
- [ ] Ações de linha são icon-only com `aria-label`; nenhum texto dentro de `.dsc-icon-action`.
- [ ] Exclusão tem modal de confirmação e — se o N3 previr — modal de bloqueio **separado**.
- [ ] Toda ação de sucesso descrita no N3 dispara um `.dsc-toast`.
- [ ] Visualização usa `.dsc-lv` e tem apenas "Voltar".
- [ ] Tabelas têm ≥ 5 linhas de dados realistas do domínio.
- [ ] Breadcrumb completo e item de menu ativo correto em todas as telas.
- [ ] Cada seta rotulada saindo de uma tela no "Fluxo Principal" do N2 virou um botão/opção visível e funcional.
- [ ] Header completo: marca à esquerda + identidade do usuário (nome + perfil do N2) à direita.
- [ ] O fluxo inteiro está em **um único** `flow.html` (sem arquivos `flow_*` paralelos de versão/variação).
- [ ] Toda navegação clicável funciona (troca de `.dsc-screen`, modais, toasts).
- [ ] Lacunas não representáveis estão no painel `.dsc-proto-notes`.

---

## CONTEXTO DO PROJETO

=== DESIGN-SYSTEM.md ===
[cole aqui o conteúdo do DESIGN-SYSTEM.md]

=== N2 DO FEATURE SET ===
[cole aqui o README.md do Feature Set]

=== N3s DAS FEATURES (opcional — mas, se fornecido, de uso obrigatório) ===
[cole aqui os N3s das features do Feature Set, se disponíveis]

---

## PASSO 1 — Mapeamento de telas

Leia o N2 e liste as telas identificadas na seção "Telas". Se os N3s das features
forem fornecidos, leia-os também: o N2 define **quais** telas existem, e cada N3
define os **campos, mensagens e estados** da tela correspondente — ambos são de
uso obrigatório quando presentes (ver regra 7).
Apresente o mapa de navegação antes de gerar o HTML:

```
[Tela de listagem] ──"Novo"──→ [Modal de criação]
                   ──"Linha"──→ [Tela de detalhe]
                                     └──"Editar"──→ [Tela de edição]
                                     └──"Excluir"──→ [Modal de confirmação]
```

Pergunte:
> "O mapa de navegação acima reflete o fluxo esperado?
> Posso gerar o HTML do protótipo de fluxo?"

---

## PASSO 2 — Geração do HTML

Após aprovação do mapa, gere o arquivo `flow.html` com:

**Estrutura do arquivo**:
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Protótipo: [Feature Set] — [Domínio]</title>
  <!-- Biblioteca de componentes (CAIXA DS) — ajuste os ../ conforme a profundidade -->
  <link rel="stylesheet" href="../../_biblioteca-ds/ds.css">
</head>
<body>

  <div class="dsc-proto-badge">🎨 PROTÓTIPO — não é o sistema real</div>

  <!-- Sidebar oculta por padrão: abre como drawer pelo ☰ no header -->
  <div class="dsc-app">

    <!-- Sidebar (comum a todas as telas) -->
    <aside class="dsc-sidebar">
      <div class="dsc-sidebar-brand"><span class="dsc-brand-mark">C</span> Sistema</div>
      <ul class="dsc-menu">
        <li class="dsc-menu-section">[Feature Set]</li>
        <li><a class="dsc-menu-item is-active" href="#" onclick="showScreen('screen-list')">[Tela 1]</a></li>
        <li><a class="dsc-menu-item" href="#" onclick="showScreen('screen-detail')">[Tela 2]</a></li>
      </ul>
    </aside>

    <div class="dsc-shell-main">
      <!-- Header completo (comum a todas as telas) — marca à esquerda, identidade do usuário à direita -->
      <header class="dsc-header">
        <div class="dsc-header-start">
          <button class="dsc-menu-toggle" aria-label="Recolher/expandir menu" onclick="dscToggleMenu()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
          <span class="dsc-header-logo">[SISTEMA] · <strong>CAIXA</strong></span>
        </div>
        <div class="dsc-header-actions">
          <button class="dsc-header-item">
            <span class="dsc-avatar dsc-avatar--sm">AC</span>
            <span class="dsc-hi-body"><span class="dsc-hi-title">Ana Costa</span><span class="dsc-hi-sub dsc-text-primary">[Perfil do N2]</span></span>
            <svg class="dsc-hi-caret" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </header>

      <!-- Layout default = extra large, largura total (sem is-narrow) -->
      <main class="dsc-main">

        <!-- Tela 1: Listagem (visível por padrão) -->
        <div id="screen-list" class="dsc-screen is-active">
          <nav class="dsc-breadcrumb"><span class="is-current">[Tela 1]</span></nav>
          <!-- Toolbar: um botão por ação que sai desta tela no "Fluxo Principal" do N2 (ver regra 19) -->
          <div class="dsc-flex dsc-justify-between dsc-items-center" style="margin-bottom:16px">
            <span class="dsc-text-muted"><strong style="color:var(--text-color)">[N] registros</strong></span>
            <div class="dsc-flex dsc-gap-1">
              <button class="dsc-btn dsc-btn--sm dsc-btn--outline" onclick="showScreen('screen-import')">[Ação do fluxo, ex.: Importar via XML]</button>
              <button class="dsc-btn dsc-btn--sm" onclick="openCreate()">[Ação do fluxo, ex.: Cadastrar registro]</button>
            </div>
          </div>
          <div class="dsc-table-wrap"><!-- tabela .dsc-table com dados fictícios realistas --></div>
        </div>

        <!-- Tela 2: Detalhe -->
        <div id="screen-detail" class="dsc-screen">
          <nav class="dsc-breadcrumb">
            <a href="#" onclick="showScreen('screen-list')">[Tela 1]</a>
            <span class="dsc-sep">›</span><span class="is-current">[Tela 2]</span>
          </nav>
          <div class="dsc-card"><!-- detalhe do registro --></div>
        </div>

      </main>
    </div>

  <!-- Sidebar flutuante (comum a todas as telas) -->
  <aside class="layout-sidebar">
    <ul class="layout-menu">
      <li><span class="layout-menuitem-root-text">[Feature Set]</span>
        <ul>
          <li><a class="active-route" href="#" onclick="showScreen('screen-list')">[Tela 1]</a></li>
          <li><a href="#" onclick="showScreen('screen-detail')">[Tela 2]</a></li>
        </ul>
      </li>
    </ul>
  </aside>

  <div class="layout-main-container">
    <main class="layout-main">

      <!-- Tela 1: Listagem (visível por padrão) -->
      <div id="screen-list" class="screen active">
        <nav class="p-breadcrumb"><span class="p-breadcrumb-current">[Tela 1]</span></nav>
        <div class="card"><!-- filtro (opcional) + tabela p-datatable com dados fictícios realistas.
             Em linha de filtro horizontal (campos + botões): display:flex; align-items:flex-end
             e ZERE a margem inferior dos .p-field dessa linha (o .p-field tem margin-bottom:1rem),
             senão a base dos campos fica ~1rem acima da base dos botões.
             Ícones de ação na coluna "Ações" (ver/editar/ativar/excluir): use SEMPRE a MESMA
             variante nos quatro — p-button p-button-text p-button-sm p-button-icon-only (sem
             borda). Não misture p-button-secondary (com borda) com p-button-text na mesma linha. --></div>
      </div>

      <!-- Tela 2: Detalhe -->
      <div id="screen-detail" class="screen">
        <nav class="p-breadcrumb">
          <a href="#" onclick="showScreen('screen-list')">[Tela 1]</a>
          <span class="p-breadcrumb-sep">›</span><span class="p-breadcrumb-current">[Tela 2]</span>
        </nav>
        <div class="card"><!-- detalhe do registro --></div>
      </div>

    </main>
  </div>

  <!-- Modal: usa dsc-modal-mask / dsc-modal da biblioteca -->
  <div id="modal-create" class="dsc-modal-mask" style="display:none">
    <div class="dsc-modal">...</div>
  </div>

  <div class="dsc-proto-notes">
    <strong>📋 Notas:</strong>
    <ul>
      <li>...</li>
    </ul>
  </div>

  <script>
    // ☰: abre/fecha o drawer do menu (sidebar oculta por padrão)
    function dscToggleMenu() {
      document.querySelector('.dsc-app').classList.toggle('is-menu-open');
    }
    function showScreen(id) {
      document.querySelectorAll('.dsc-screen').forEach(s => s.classList.remove('is-active'));
      document.getElementById(id).classList.add('is-active');
      document.querySelector('.dsc-app').classList.remove('is-menu-open'); // recolhe o drawer ao navegar
    }
    function toggleModal(id, show) {
      document.getElementById(id).style.display = show ? 'flex' : 'none';
    }
  </script>
</body>
</html>
```

### Snippets canônicos (copiar — garantem consistência entre LLMs)

**Header completo** (regra 20):
```html
<header class="dsc-header">
  <div class="dsc-header-start">
    <button class="dsc-menu-toggle" aria-label="Recolher/expandir menu" onclick="dscToggleMenu()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
    <span class="dsc-header-logo">[SISTEMA] · <strong>CAIXA</strong></span>
  </div>
  <div class="dsc-header-actions">
    <button class="dsc-header-item">
      <span class="dsc-avatar dsc-avatar--sm">AC</span>
      <span class="dsc-hi-body"><span class="dsc-hi-title">Ana Costa</span><span class="dsc-hi-sub dsc-text-primary">[Perfil do N2]</span></span>
      <svg class="dsc-hi-caret" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
  </div>
</header>
```

**Toolbar da listagem — botões derivados do Fluxo Principal** (regra 19):
```html
<div class="dsc-flex dsc-justify-between dsc-items-center" style="margin-bottom:16px">
  <span class="dsc-text-muted"><strong style="color:var(--text-color)">[N] registros</strong></span>
  <div class="dsc-flex dsc-gap-1">
    <!-- um botão por seta rotulada que sai desta tela no diagrama do N2 -->
    <button class="dsc-btn dsc-btn--sm dsc-btn--outline" onclick="showScreen('screen-import')">Importar via XML</button>
    <button class="dsc-btn dsc-btn--sm" onclick="openCreate()">Cadastrar registro</button>
  </div>
</div>
```

**Campo obrigatório / opcional** (regra 16):
```html
<label class="dsc-field-label" for="c-nome">Nome <span class="dsc-req">*</span></label>
<label class="dsc-field-label" for="c-cust">Custodiante <span class="dsc-text-muted" style="font-weight:400">(opcional)</span></label>
```

**Ação de linha icon-only** (regra 15):
```html
<td class="dsc-col-actions">
  <button class="dsc-icon-action" aria-label="Visualizar [registro]" title="Visualizar" onclick="openView('[registro]')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
</td>
```

**Ficha de leitura com label-valor** (regra 17):
```html
<div class="dsc-col-4"><div class="dsc-lv"><span class="dsc-lv-label">CNPJ</span><span class="dsc-lv-value">12.345.678/0001-90</span></div></div>
```

**Toast de sucesso, canto superior direito** (regra 13):
```html
<div id="toast-save" class="dsc-toast dsc-toast--positive" style="display:none;position:fixed;top:24px;right:24px;z-index:200">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg><span>Cadastro realizado com sucesso.</span>
</div>
<script>
  function showToast(id) {
    var t = document.getElementById(id);
    t.style.display = 'flex';
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.style.display = 'none'; }, 4000);
  }
</script>
```

**Dois modais de exclusão — confirmar × bloquear** (regra 14):
```html
<!-- Confirmação (caminho feliz) -->
<div id="modal-delete" class="dsc-modal-mask" style="display:none">
  <div class="dsc-modal">
    <div class="dsc-modal-header"><strong>Excluir [registro]</strong>
      <button class="dsc-modal-close" aria-label="Fechar" onclick="toggleModal('modal-delete',false)">✕</button></div>
    <div class="dsc-modal-body"><p>Deseja realmente excluir <strong>[Nome]</strong> — [chave]?</p></div>
    <div class="dsc-modal-footer">
      <button class="dsc-btn dsc-btn--chromeless" onclick="toggleModal('modal-delete',false)">Cancelar</button>
      <button class="dsc-btn dsc-btn--danger" onclick="toggleModal('modal-delete',false);showToast('toast-delete')">Excluir</button>
    </div>
  </div>
</div>
<!-- Bloqueio por vínculo (sem botão Excluir) -->
<div id="modal-delete-blocked" class="dsc-modal-mask" style="display:none">
  <div class="dsc-modal">
    <div class="dsc-modal-header"><strong>Não é possível excluir</strong>
      <button class="dsc-modal-close" aria-label="Fechar" onclick="toggleModal('modal-delete-blocked',false)">✕</button></div>
    <div class="dsc-modal-body">
      <div class="dsc-alert dsc-alert--danger" role="alert" style="margin:0">Não é possível excluir [Nome] pois ele possui [motivo do N3].</div>
    </div>
    <div class="dsc-modal-footer"><button class="dsc-btn dsc-btn--outline" onclick="toggleModal('modal-delete-blocked',false)">Ok, entendi</button></div>
  </div>
</div>
```

> Os nomes de classe acima são os reais da biblioteca `_biblioteca-ds/ds.css`.
> Não inventar variações (`dsc-text-danger`, `dsc-modal-title`, etc.) — se precisar de
> algo que não existe, consulte o catálogo em `_biblioteca-ds/README.md`.

---

## PASSO 3 — Entrega

Após gerar o HTML, informe:

> "✅ Protótipo de fluxo gerado.
>
> **Salvar como**: `prototypes/[dominio]/[feature-set]/flow.html`
>
> **Atualizar**: `prototypes/[dominio]/[feature-set]/README.md`
> — adicionar linha na tabela de protótipos com status '🎨 Mockup'
>
> **Telas cobertas**: [lista]
> **Telas não cobertas** (⚠️): [lista, se houver]"

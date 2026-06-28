# PROMPT_PROTOTYPE_SCREEN — Protótipos de Estado (N3)

> **Modelo de estrutura**: `engine/templates/prototypes/_template/_template-feature-set/_template-feature/README.md` *(referência humana — o prompt já embute o esqueleto)*
> **Quem participa**: dev / designer / PO técnico
> **Insumo necessário**: DESIGN-SYSTEM.md + N3 da feature
> **Entrega**: um arquivo HTML por estado obrigatório da feature
> (form, loading, empty, error) + estados adicionais identificados no N3
>
> **Pré-requisito**: N3 aprovado (PROMPT_3B concluído)
> **Onde salvar**: `prototypes/[dominio]/[feature-set]/[feature]/[estado].html`
>
> **v2 (2026-06-11)**: regras 9–18, seção de anti-padrões, checklist de
> conferência, snippets canônicos e header completo (regra 18) — para alinhar o
> resultado entre diferentes LLMs. Mesmo tratamento do `PROMPT_PROTOTYPE_FLOW_FULL.md`.

---

## INSTRUÇÕES PARA O CLAUDE

Você vai gerar protótipos HTML de cada estado de tela de uma feature,
seguindo rigorosamente os padrões do DESIGN-SYSTEM.md e as regras
de comportamento descritas no N3.

### Regras de geração

1. **Fidelidade ao Design System**: use exatamente os tokens, componentes
   e padrões definidos no DESIGN-SYSTEM.md. Não invente estilos.
   Sinalize lacunas com `<!-- TODO: definir no Design System -->`.

2. **Use a biblioteca de componentes**: linke `prototypes/_biblioteca-ds/ds.css`
   e use as classes `.dsc-*` (CAIXA DS, espelham o DESIGN-SYSTEM.md). Ajuste os
   `../` conforme a profundidade do arquivo. Não redefina tokens nem recrie
   componentes inline; apenas o JS pontual de interação pode ficar inline.
   Em especial, `.prototype-badge` já vem estilizado pelo `sakai.css` — não
   recrie essa regra nem reposicione o badge (sem `top/right/bottom/left` soltos
   nele), senão ele estica e vira um bloco gigante sobre a tela.

3. **Um arquivo por estado**: não misture estados em um único arquivo.
   `form.html` mostra apenas o estado de formulário.
   `loading.html` mostra apenas o estado de loading com skeletons.

4. **Campos mapeados do N3**: os campos do formulário devem corresponder
   exatamente aos listados na tabela de campos do N3, usando o Label PO
   como texto do label na tela. Os tipos de input devem refletir o tipo
   do campo (texto → `<input type="text">`, data → date picker, lista de
   opções fixa → `p-select`, sim/não → toggle, arquivo → file input).

   **Telas de pesquisa/listagem** (campos marcados com sufixo no Label PO):
   - Cada campo **`(filtro)`** vira **um input no card de filtros** — um por campo,
     sem exceção. Quatro filtros no N3 = quatro inputs na tela.
   - Cada campo **`(resultado)`** (ou `automático`) vira **uma coluna na tabela**
     de resultados.
   - Antes de finalizar o `form.html`, liste os campos `(filtro)` do N3 e confirme
     que **cada um** está presente como input (checklist de completude). Se algum
     ficar de fora, corrija antes de entregar.

   **Campos de seleção (`seleção → [Entidade]`)**: renderize como combobox
   `p-select`, nunca como input de texto. As opções são registros de outra
   entidade, não valores fixos:
   - O texto de cada opção é o **campo-label** definido em DATA-MODEL.md →
     Relacionamentos de seleção (ex: razão social, nome) — preencha com 3–5
     opções fictícias realistas da entidade origem.
   - Se a Validação do campo disser **autocomplete por [campo]**, mantenha o
     `p-select` mas anote no painel de notas que em produção é busca conforme
     o usuário digita (a biblioteca não tem componente de autocomplete dedicado).
   - Sempre anote no painel de notas a **origem real** das opções
     (`GET /api/v1/[recurso]?search=`) e o **filtro de origem** aplicado
     (ex: apenas ativos), pois o HTML estático não faz a chamada.

5. **Mensagens do N3**: as mensagens de erro, validação e sucesso exibidas
   no protótipo devem ser exatamente as definidas nos cenários Gherkin do N3.
   Não inventar mensagens.

6. **Dados fictícios realistas**: tabelas e listas devem ter dados que façam
   sentido para o domínio — nunca "Lorem ipsum" ou "Teste 1". Tabelas de
   listagem/histórico com **no mínimo 5 linhas**, cobrindo pelo menos um exemplo
   de cada status relevante. **Form de cadastro e filtros de pesquisa abrem
   vazios** (placeholder mostra o formato); apenas telas de **edição/visualização**
   pré-populam campos com os dados do registro.

7. **Estado de campos por role**: se o N3 define que um campo é bloqueado
   para um perfil específico, o protótipo deve mostrar essa versão com o
   campo desabilitado e tooltip explicativo.

8. **Anotar o que o HTML não captura**: comportamentos assíncronos,
   validações em tempo real e regras de negócio complexas devem ser
   anotados no painel de notas do protótipo.

9. **Saída em UTF-8 com acentuação correta**: todo texto visível em português
   mantém acentos e cedilha (Protótipo, não, Situação, Código, Ações). Nunca
   remover acentos nem trocar por ASCII — vale para `dsc-proto-badge` e comentários.

10. **`form.html` é o estado de repouso**: o formulário principal abre
    **preenchido/válido, sem erros**. Skeleton, empty, error e "Processando…"
    pertencem a **arquivos próprios** (`loading.html`, `empty.html`, `error.html`)
    — nunca embutidos no `form.html`. Para documentar o estilo de erro de
    validação, gere um estado dedicado (ex.: `invalid.html`), não contamine o repouso.

11. **Filtros e cadastro vazios; edição/visualização pré-populados** (ver regra 6):
    pesquisa abre com filtros em branco e a tabela com os "últimos N registros";
    cadastro abre vazio; só edição e visualização trazem os dados do registro.

12. **Feedback de sucesso via toast**: quando o N3 descreve sucesso por toast,
    use `.dsc-toast` no canto superior direito, disparado pela ação e que some
    sozinho (~4s). Reserve `success.html` apenas para sucesso em **página própria**.

13. **Confirmação e bloqueio são arquivos separados**: se o N3 de exclusão tem
    cenário feliz **e** bloqueio por vínculo, gere `modal.html` (confirmação, com
    botão "Excluir") e `modal-blocked.html` (bloqueio, sem botão de excluir, só
    "Ok, entendi"). Nunca misturar a mensagem de bloqueio com o botão "Excluir".

14. **Ícones de ação são icon-only**: botões em `.dsc-col-actions` /
    `.dsc-icon-action` contêm **apenas** um `<svg>` + `aria-label` + `title` —
    nunca texto (a classe é uma caixa fixa de 32×32px; texto estoura). Para ação
    com rótulo textual, use `.dsc-btn--chromeless .dsc-btn--sm`.

15. **Obrigatório/opcional marcados pela exceção**: campo obrigatório recebe
    `<span class="dsc-req">*</span>` (cor danger via DS) — nunca um "*" em texto
    plano. Campo opcional recebe `(opcional)` em `dsc-text-muted`. Marque sempre
    a minoria, conforme UX Writing.

16. **Visualização (somente leitura) usa label-valor**: a ficha cadastral
    consolidada usa `.dsc-lv` (rótulo + valor) — não inputs `disabled`. Exceção:
    campo individual bloqueado por **perfil** (regra 7) continua como input
    `disabled` + tooltip.

17. **Navegação consistente**: breadcrumb com o caminho completo
    (Início › Domínio › Tela); item de menu da feature com `.is-active`; e toda
    interação presente no estado (modal, toast, "Tentar novamente") precisa funcionar.

18. **Barra de título (header) completa**: o header não é só ☰ + avatar. Use o
    padrão do DS — à esquerda `dsc-header-start` com o ☰ e a marca
    (`dsc-header-logo`); à direita `dsc-header-actions` com a identidade do
    usuário em `dsc-header-item` (avatar + nome + **perfil** autorizado pelo N3).
    Nunca reduzir o header a um `<strong>` solto com um `dsc-avatar`.

---

## ANTI-PADRÕES (não fazer)

> Casos reais observados em gerações anteriores do mesmo insumo. Evite cada um —
> são a causa mais comum de protótipos divergentes entre LLMs.

| Anti-padrão | Faça em vez disso |
|---|---|
| Texto sem acento ("Prototipo", "Situacao", "Acoes") | Acentuação PT-BR correta, UTF-8 (regra 9) |
| Erro de validação / skeleton / "processando" embutido no `form.html` | Cada estado no seu próprio arquivo (regra 10) |
| Cadastro / filtros de pesquisa pré-preenchidos | Vazios; só edição/visualização pré-popula (regras 6, 11) |
| Texto "Ver/Editar/Excluir" dentro de `.dsc-icon-action` | SVG + `aria-label`; texto só em `.dsc-btn` (regra 14) |
| Modal único misturando "Excluir" + "não é possível excluir" | `modal.html` × `modal-blocked.html` (regra 13) |
| Ação de sucesso sem retorno visual | `.dsc-toast` disparado na ação (regra 12) |
| "*" em texto plano no label | `<span class="dsc-req">*</span>` (regra 15) |
| Tabela com 1–2 linhas | ≥ 5 linhas realistas (regra 6) |
| Visualização com inputs `disabled` | `.dsc-lv` label-valor (regra 16) |
| Mensagem de erro/sucesso inventada | Texto exato dos cenários do N3 (regra 5) |
| Header reduzido a `<strong>` + avatar | Marca à esquerda + identidade (nome + perfil) à direita (regra 18) |

---

## CHECKLIST ANTES DE ENTREGAR

Releia cada HTML gerado e confirme **cada** item antes de apresentar. Se algum
falhar, corrija antes de entregar:

- [ ] Todo texto PT-BR está acentuado e o arquivo é UTF-8.
- [ ] `form.html` está no estado de repouso (sem erro / skeleton / "processando" embutidos).
- [ ] Cada estado obrigatório do N3 tem seu arquivo (form / loading / empty / error).
- [ ] Cadastro e filtros abrem vazios; edição/visualização pré-populados.
- [ ] Cada campo `(filtro)` do N3 virou um input; cada `(resultado)` virou coluna.
- [ ] **Todos** os campos da tabela "Campos" do N3 estão presentes (completude).
- [ ] Campos obrigatórios com `.dsc-req`; opcionais com `(opcional)`.
- [ ] Mensagens de erro/validação/sucesso idênticas às dos cenários do N3.
- [ ] Ações de linha são icon-only com `aria-label`; nenhum texto dentro de `.dsc-icon-action`.
- [ ] Exclusão tem confirmação e — se o N3 previr — bloqueio em arquivo separado.
- [ ] Sucesso por `.dsc-toast` (ou `success.html` se for página própria).
- [ ] Visualização usa `.dsc-lv` e tem apenas "Voltar".
- [ ] `loading.html` usa skeleton proporcional; `empty`/`error` usam `.dsc-state` com ação.
- [ ] Tabelas têm ≥ 5 linhas de dados realistas do domínio.
- [ ] Header completo: marca à esquerda + identidade do usuário (nome + perfil do N3) à direita.
- [ ] Lacunas não representáveis estão no painel `.dsc-proto-notes`.

---

## CONTEXTO DO PROJETO

=== DESIGN-SYSTEM.md ===
[cole aqui o conteúdo do DESIGN-SYSTEM.md]

=== N3 DA FEATURE ===
[cole aqui o arquivo completo da feature]

---

## PASSO 1 — Mapeamento de estados

Leia o N3 e identifique os estados a gerar. Apresente a lista:

| Arquivo a gerar | Estado | Base no N3 |
|---|---|---|
| `form.html` | Formulário principal | Seção "Campos" + "Comportamento de tela: Loading" |
| `loading.html` | Skeleton de loading | Seção "Comportamento de tela: Loading" |
| `empty.html` | Sem dados | Seção "Comportamento de tela: Empty state" |
| `error.html` | Erro de servidor | Seção "Comportamento de tela: Error state" |
| `modal.html` | Modal de confirmação (se aplicável) | Seção "Comportamento de tela" |
| `modal-blocked.html` | Modal de bloqueio por vínculo (se o N3 previr) | Cenário de bloqueio do N3 |
| `success.html` | Confirmação (apenas se for página própria) | Cenário de sucesso do N3 |
| `[custom].html` | [estado específico] | Seção "[referência]" |

Pergunte:
> "Os estados mapeados acima estão corretos?
> Qual deles deseja gerar primeiro?"

---

## PASSO 2 — Geração estado a estado

Gere um estado por vez. Após gerar, pergunte se aprova antes de avançar.

### Estrutura base de cada arquivo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Estado]: [Feature] — [Feature Set]</title>
  <!-- Biblioteca de componentes (CAIXA DS) — ajuste os ../ conforme a profundidade -->
  <link rel="stylesheet" href="../../../_biblioteca-ds/ds.css">
</head>
<body>
  <div class="dsc-proto-badge">🎨 [ESTADO] — Protótipo</div>

  <!-- Sidebar oculta por padrão: abre como drawer pelo ☰ no header -->
  <div class="dsc-app">

    <!-- Sidebar: menu agrupado, item ativo com .is-active -->
    <aside class="dsc-sidebar">
      <div class="dsc-sidebar-brand"><span class="dsc-brand-mark">C</span> Sistema</div>
      <ul class="dsc-menu">
        <li class="dsc-menu-section">[Feature Set]</li>
        <li><a class="dsc-menu-item is-active" href="#" onclick="this.closest('.dsc-app').classList.remove('is-menu-open')">[Feature]</a></li>
      </ul>
    </aside>

    <div class="dsc-shell-main">
      <!-- Header completo — marca à esquerda, identidade do usuário à direita -->
      <header class="dsc-header">
        <div class="dsc-header-start">
          <button class="dsc-menu-toggle" aria-label="Recolher/expandir menu" onclick="dscToggleMenu()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
          <span class="dsc-header-logo">[SISTEMA] · <strong>CAIXA</strong></span>
        </div>
        <div class="dsc-header-actions">
          <button class="dsc-header-item">
            <span class="dsc-avatar dsc-avatar--sm">AC</span>
            <span class="dsc-hi-body"><span class="dsc-hi-title">Ana Costa</span><span class="dsc-hi-sub dsc-text-primary">[Perfil do N3]</span></span>
            <svg class="dsc-hi-caret" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </header>

      <!-- Layout default = extra large, largura total (sem is-narrow) -->
      <main class="dsc-main">
        <nav class="dsc-breadcrumb">
          <a href="#">Início</a><span class="dsc-sep">›</span>
          <span class="is-current">[Feature]</span>
        </nav>

        <div class="dsc-page-header">
          <h1 class="dsc-page-title">[Título descritivo — nunca vago]</h1>
          <p class="dsc-page-subtitle">[Subtítulo opcional]</p>
        </div>

        <div class="dsc-card">
          <!-- conteúdo do estado específico, usando classes da biblioteca:
               dsc-field / dsc-input / dsc-select / dsc-btn / dsc-table / dsc-tag
               dsc-skeleton (loading) · dsc-state (empty/error)
               dsc-alert (Card Alert) · dsc-modal · dsc-toast -->
        </div>

        <div class="dsc-proto-notes">
          <strong>📋 Notas — [Estado]:</strong>
          <ul>
            <li>[comportamento não representável visualmente]</li>
          </ul>
        </div>
      </main>
    </div>

  <!-- Sidebar flutuante: menu agrupado, item ativo com .active-route -->
  <aside class="layout-sidebar">
    <ul class="layout-menu">
      <li>
        <span class="layout-menuitem-root-text">[Feature Set]</span>
        <ul><li><a class="active-route" href="#">[Feature]</a></li></ul>
      </li>
    </ul>
  </aside>

  <div class="layout-main-container">
    <main class="layout-main">
      <nav class="p-breadcrumb">
        <a href="#">Início</a><span class="p-breadcrumb-sep">›</span>
        <span class="p-breadcrumb-current">[Feature]</span>
      </nav>

      <div class="page-header">
        <h1 class="page-title">[Título descritivo — nunca vago]</h1>
        <p class="page-subtitle">[Subtítulo opcional]</p>
      </div>

      <div class="card">
        <!-- conteúdo do estado específico, usando classes da biblioteca:
             p-field / p-inputtext / p-select / p-button / p-datatable / p-tag
             p-skeleton (loading) · p-empty-state (empty) · p-error-state (error)
             p-message / p-dialog / p-toast
             Linha de filtro/ação horizontal (campos + botões lado a lado): use
             display:flex; align-items:flex-end e ZERE a margem inferior dos
             .p-field dessa linha (o .p-field tem margin-bottom:1rem) — senão a
             base dos campos fica ~1rem acima da base dos botões.
             Ícones de ação na coluna "Ações" da tabela (ver/editar/ativar/excluir):
             use SEMPRE a MESMA variante nos quatro — `p-button p-button-text
             p-button-sm p-button-icon-only` (sem borda). Não misture
             p-button-secondary (com borda) com p-button-text na mesma linha. -->
      </div>

      <div class="prototype-notes">
        <strong>📋 Notas — [Estado]:</strong>
        <ul>
          <li>[comportamento não representável visualmente]</li>
        </ul>
      </div>
    </main>
  </div>
  <script>
    // ☰: abre/fecha o drawer do menu (sidebar oculta por padrão)
    function dscToggleMenu() {
      document.querySelector('.dsc-app').classList.toggle('is-menu-open');
    }
  </script>
</body>
</html>
```

### Snippets canônicos (copiar — garantem consistência entre LLMs)

**Campo obrigatório / opcional** (regra 15):
```html
<label class="dsc-field-label" for="c-nome">Nome <span class="dsc-req">*</span></label>
<label class="dsc-field-label" for="c-cust">Custodiante <span class="dsc-text-muted" style="font-weight:400">(opcional)</span></label>
```

**Ação de linha icon-only** (regra 14):
```html
<td class="dsc-col-actions">
  <button class="dsc-icon-action" aria-label="Visualizar [registro]" title="Visualizar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
</td>
```

**Ficha de leitura com label-valor** (regra 16):
```html
<div class="dsc-col-4"><div class="dsc-lv"><span class="dsc-lv-label">CNPJ</span><span class="dsc-lv-value">12.345.678/0001-90</span></div></div>
```

**`loading.html` — skeleton proporcional**:
```html
<div class="dsc-skeleton" style="height:20px;width:40%;margin-bottom:16px"></div>
<div class="dsc-skeleton" style="height:44px;margin-bottom:8px"></div>
<div class="dsc-skeleton" style="height:44px;margin-bottom:8px"></div>
```

**`empty.html` / `error.html` — `.dsc-state` com ação**:
```html
<div class="dsc-state">
  <div class="dsc-state-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg></div>
  <div class="dsc-state-title">Nenhum fundo encontrado</div>
  <p class="dsc-state-text">Ajuste os filtros e tente novamente.</p>
  <button class="dsc-btn dsc-btn--outline">Limpar filtros</button>
</div>
```

**Toast de sucesso, canto superior direito** (regra 12):
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

**Exclusão — `modal.html` (confirmar) × `modal-blocked.html` (bloquear)** (regra 13):
```html
<!-- modal.html — confirmação (caminho feliz) -->
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
<!-- modal-blocked.html — bloqueio por vínculo (sem botão Excluir) -->
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

### Padrões por estado

**`form.html`** — estado de repouso (preenchido/válido, **sem erros**)
- Formulário com **todos** os campos do N3, labels correspondendo ao Label PO
- Em tela de pesquisa: **um input por campo `(filtro)`** + **uma coluna por campo
  `(resultado)`** — conferir a lista de filtros do N3 antes de entregar (regra 4)
- Campos obrigatórios com `<span class="dsc-req">*</span>`; opcionais com `(opcional)` (regra 15)
- Botão primário à direita do rodapé, cancelar à esquerda
- Cadastro e filtros **vazios**; edição/visualização pré-populados (regras 6, 11)
- **Não** embutir erro de validação no repouso — para documentar o estilo de erro,
  gere um estado dedicado (`invalid.html`), conforme regra 10

**`loading.html`**
- Substituir todo conteúdo dinâmico por blocos skeleton (fundo cinza, animação pulse)
- Botões e ações desabilitados ou ocultados
- Skeleton com proporções equivalentes ao conteúdo real

**`empty.html`**
- Ícone ilustrativo (pode ser SVG simples)
- Título: o que não foi encontrado
- Descrição: por que está vazio ou o que o usuário pode fazer
- Botão de ação primária (quando aplicável, conforme N3)

**`error.html`**
- Ícone de erro
- Mensagem descritiva (conforme definida no N3, não genérica)
- Botão "Tentar novamente"

**`modal.html`**
- Modal centralizado sobre overlay semitransparente
- Estrutura: título + descrição + ações
- Para modal de exclusão: botão danger + cancelar

---

## PASSO 3 — Geração do README do nível

Após gerar todos os estados aprovados, gere ou atualize o
`prototypes/[dominio]/[feature-set]/[feature]/README.md`
preenchendo a tabela de estados com os arquivos gerados e status `🎨 Mockup`.

---

## PASSO 4 — Entrega

Ao finalizar todos os estados, informe:

> "✅ Protótipos de [feature] gerados.
>
> **Salvar em**: `prototypes/[dominio]/[feature-set]/[feature]/`
>
> **Arquivos gerados**:
> - `form.html` — [estado]
> - `loading.html` — [estado]
> - `empty.html` — [estado]
> - `error.html` — [estado]
>
> **Notas pendentes** (comportamentos não representados):
> - [lista]
>
> **Próximo passo**: PO revisa no browser e atualiza o status
> no README.md para ✅ Aprovado ou solicita ajustes."

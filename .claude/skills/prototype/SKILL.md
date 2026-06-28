---
name: prototype
description: Gera um protótipo de fluxo HTML navegável a partir de uma descrição livre, usando o design system do projeto. Use para prototipar telas e fluxos rapidamente, sem precisar de N2 ou N3.
argument-hint: "[descrição do protótipo]"
disable-model-invocation: true
---

# /prototype — Protótipo navegável

> Gera um protótipo de fluxo HTML navegável a partir de uma descrição livre,
> usando o design system do projeto. Nenhum N2 ou N3 é necessário.
>
> **Uso**: `/prototype "descrição do que você quer"`

---

## Entrada

**Descrição fornecida pelo usuário**: $ARGUMENTS

Se `$ARGUMENTS` estiver vazio, pergunte antes de continuar:
> "Descreva o protótipo: telas, campos, layout e fluxo de navegação."

---

## PASSO 0 — Ler o Design System

Leia o arquivo de Design System do projeto. Tente, em ordem, o primeiro que existir:
1. `DESIGN-SYSTEM.md` (raiz do projeto)
2. `docs/DESIGN-SYSTEM.md`
3. `engine/templates/global/DESIGN-SYSTEM.md`

Use-o como **única fonte de verdade** para tokens, componentes e classes `.dsc-*`.
Não invente estilos. Se algo não existir no Design System, use o padrão mais neutro
e sinalize com `<!-- TODO: definir no Design System -->`.

---

## PASSO 1 — Interpretar a descrição

A partir de `$ARGUMENTS`, identifique:

1. **Nome** do protótipo → derive o `[slug]` em kebab-case (ex: "Cadastro de Fundos" → `cadastro-fundos`)
2. **Telas** → quais telas compõem o fluxo (listagem, cadastro, detalhe, wizard, modal...)
3. **Campos por tela** → nome, tipo (`texto` / `data` / `select` / `toggle` / `arquivo` / `número` / `textarea`)
4. **Disposição** → layout descrito (cards lado a lado, grid, modal, tabs, drawer...)
5. **Navegação** → como as telas se conectam (ações de botão, clique em linha, links)
6. **Domínio** → que dados fictícios realistas fariam sentido para preencher tabelas

---

## PASSO 2 — Propor estrutura

Apresente o mapa de navegação e o caminho de saída **antes** de gerar qualquer código:

**Mapa de telas:**
```
[Tela A] ──"Ação"──→ [Tela B]
         ──"Ação"──→ [Modal C]
```

**Arquivo de saída:** `prototypes/[slug]/flow.html`

Pergunte:
> "O mapa acima reflete o que você quer? Posso gerar o `flow.html`?"

Só avance para o PASSO 3 após confirmação explícita.

---

## PASSO 3 — Gerar o HTML

Gere um **único** arquivo `flow.html` com todas as telas como seções `.dsc-screen`
alternadas por JS (`showScreen`), seguindo as regras abaixo.

### Regras de geração

1. **Fidelidade ao Design System**: use exatamente os tokens e classes lidos no PASSO 0.
   Nenhum estilo inventado.

2. **Biblioteca de componentes**: linke `../_biblioteca-ds/ds.css` e use as classes `.dsc-*`.
   Não redefina tokens nem recrie componentes inline — apenas JS pontual de interação
   pode ficar inline. `.prototype-badge` já vem estilizado — não reposicione com
   `top/right/bottom/left` soltos.

3. **Navegação funcional**: botões e links entre telas implementam troca de
   `.dsc-screen.is-active` via `showScreen()` — sem backend.

4. **Layout completo**: sidebar, header e área de conteúdo conforme o DESIGN-SYSTEM.md.
   Nunca gerar apenas o componente isolado.

5. **Indicador de tela atual**: breadcrumb atualizado, item de sidebar destacado
   (`.is-active`) e título visível em todas as telas.

6. **Dados fictícios realistas**: tabelas com **≥ 5 linhas** que façam sentido para
   o domínio descrito — nunca "Lorem ipsum" ou "Teste 1". Pelo menos uma linha de
   cada status relevante (ex.: ativo/inativo, sucesso/falha).

7. **Campos da descrição são obrigatórios**: todo campo mencionado em `$ARGUMENTS`
   deve aparecer na tela correta, com o tipo e a disposição descritos. Campos
   não mencionados podem ser inferidos se fizerem sentido para o contexto.

8. **Telas no estado de repouso por padrão**: cada tela abre no estado neutro —
   sem erros de validação visíveis, spinners ou "Processando…". Esses estados
   só aparecem após interação do usuário.

9. **Filtros e formulários começam vazios**: pesquisa abre com filtros em branco;
   cadastro abre com campos vazios. Apenas o modo de edição pré-popula campos
   com dados do registro.

10. **Feedback via toast**: ações de criar, editar, excluir e importar disparam
    `.dsc-toast` no canto superior direito que some em ~4s.

11. **Confirmação e bloqueio são modais separados**: se houver exclusão com possível
    bloqueio por vínculo, use dois modais distintos — um com botão "Excluir"
    (caminho feliz) e um sem (bloqueio).

12. **Ícones de ação são icon-only**: `.dsc-icon-action` contém apenas `<svg>` +
    `aria-label` + `title`. Para ação com rótulo textual, use `.dsc-btn--chromeless .dsc-btn--sm`.

13. **Obrigatório/opcional pela exceção**: obrigatório → `<span class="dsc-req">*</span>`.
    Opcional → `(opcional)` em `dsc-text-muted`. Marcar sempre a minoria.

14. **Visualização usa label-valor**: fichas de leitura usam `.dsc-lv` — não inputs
    `disabled`. Ação única: "Voltar".

15. **Header completo**: à esquerda `dsc-header-start` com ☰ e marca; à direita
    `dsc-header-actions` com avatar + nome + perfil inferido do contexto da descrição.

16. **UTF-8 com acentuação correta**: todo texto PT-BR mantém acentos e cedilha.
    Nunca ASCII puro ("Prototipo", "Situacao", "Acoes").

17. **Arquivo único**: um único `flow.html` com todas as telas. Nunca criar
    `flow_v2.html`, `flow-rascunho.html` ou arquivos paralelos.

18. **Anotar lacunas**: comportamentos descritos pelo usuário que não puderem ser
    representados visualmente vão para o painel `.dsc-proto-notes`.

---

### Anti-padrões (não fazer)

| Anti-padrão | Faça em vez disso |
|---|---|
| Texto sem acento ("Prototipo", "Acoes") | UTF-8 com acentuação PT-BR |
| Erro/validação visível ao abrir a tela | Estado de repouso; erro só após ação |
| Form ou filtros pré-preenchidos | Vazios; só edição pré-popula |
| Texto dentro de `.dsc-icon-action` | SVG + `aria-label` |
| Modal único com "Excluir" + "não é possível excluir" | Dois modais separados |
| Ação de sucesso sem retorno visual | `.dsc-toast` disparado no clique |
| `*` em texto plano | `<span class="dsc-req">*</span>` |
| Tabela com 1–2 linhas | ≥ 5 linhas realistas |
| Visualização com inputs `disabled` | `.dsc-lv` label-valor |
| Header reduzido a `<strong>` + avatar | Marca à esquerda + identidade completa à direita |
| Vários HTMLs `flow_*` | Um único `flow.html` sobrescrito ao regenerar |

---

### Checklist antes de salvar

- [ ] Todo texto PT-BR acentuado; arquivo UTF-8
- [ ] Cada tela abre no estado de repouso
- [ ] Filtros e forms abrem vazios
- [ ] Todos os campos da descrição presentes, com tipo e disposição corretos
- [ ] Obrigatórios com `.dsc-req`; opcionais com `(opcional)`
- [ ] Ações de linha icon-only com `aria-label`
- [ ] Toasts em todas as ações de sucesso
- [ ] Header completo (marca à esquerda + identidade à direita)
- [ ] Breadcrumb e item de sidebar corretos em todas as telas
- [ ] Tabelas com ≥ 5 linhas de dados realistas do domínio
- [ ] Fluxo completo em um único `flow.html`
- [ ] Toda navegação clicável funciona (telas, modais, toasts)
- [ ] Lacunas no `.dsc-proto-notes`

---

### Estrutura base do arquivo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Protótipo: [Nome] — Fluxo</title>
  <link rel="stylesheet" href="../_biblioteca-ds/ds.css">
</head>
<body>

  <div class="dsc-proto-badge">🎨 PROTÓTIPO — não é o sistema real</div>

  <div class="dsc-app">

    <aside class="dsc-sidebar">
      <div class="dsc-sidebar-backdrop" onclick="dscToggleMenu()"></div>
      <div class="dsc-sidebar-brand"><span class="dsc-brand-mark">S</span> [Sistema]</div>
      <ul class="dsc-menu">
        <li class="dsc-menu-section">[Nome do fluxo]</li>
        <li><a class="dsc-menu-item is-active" href="#" onclick="showScreen('screen-1')">[Tela 1]</a></li>
        <li><a class="dsc-menu-item" href="#" onclick="showScreen('screen-2')">[Tela 2]</a></li>
      </ul>
    </aside>

    <div class="dsc-shell-main">

      <header class="dsc-header">
        <div class="dsc-header-start">
          <button class="dsc-menu-toggle" aria-label="Abrir/fechar menu" onclick="dscToggleMenu()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span class="dsc-header-logo">[SISTEMA] · <strong>[MARCA]</strong></span>
        </div>
        <div class="dsc-header-actions">
          <button class="dsc-header-item">
            <span class="dsc-avatar dsc-avatar--sm">AC</span>
            <span class="dsc-hi-body">
              <span class="dsc-hi-title">Ana Costa</span>
              <span class="dsc-hi-sub dsc-text-primary">[Perfil inferido do contexto]</span>
            </span>
            <svg class="dsc-hi-caret" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </header>

      <main class="dsc-main">

        <!-- Tela 1 (visível por padrão) -->
        <div id="screen-1" class="dsc-screen is-active">
          <nav class="dsc-breadcrumb">
            <a href="#" onclick="showScreen('screen-1')">Início</a>
            <span class="dsc-sep">›</span>
            <span class="is-current">[Tela 1]</span>
          </nav>
          <!-- conteúdo da tela -->
        </div>

        <!-- Tela 2 -->
        <div id="screen-2" class="dsc-screen">
          <nav class="dsc-breadcrumb">
            <a href="#" onclick="showScreen('screen-1')">Início</a>
            <span class="dsc-sep">›</span>
            <a href="#" onclick="showScreen('screen-1')">[Tela 1]</a>
            <span class="dsc-sep">›</span>
            <span class="is-current">[Tela 2]</span>
          </nav>
          <!-- conteúdo da tela -->
        </div>

      </main>
    </div>
  </div>

  <!-- Modais (um por ação com confirmação) -->

  <!-- Toasts (um por ação de sucesso) -->

  <div class="dsc-proto-notes">
    <strong>📋 Notas do protótipo:</strong>
    <ul>
      <li>...</li>
    </ul>
  </div>

  <script>
    function dscToggleMenu() {
      document.querySelector('.dsc-app').classList.toggle('is-menu-open');
    }
    function showScreen(id) {
      document.querySelectorAll('.dsc-screen').forEach(s => s.classList.remove('is-active'));
      document.getElementById(id).classList.add('is-active');
      document.querySelector('.dsc-app').classList.remove('is-menu-open');
    }
    function toggleModal(id, show) {
      document.getElementById(id).style.display = show ? 'flex' : 'none';
    }
    function showToast(id) {
      var t = document.getElementById(id);
      t.style.display = 'flex';
      clearTimeout(t._timer);
      t._timer = setTimeout(function () { t.style.display = 'none'; }, 4000);
    }
  </script>
</body>
</html>
```

---

## PASSO 4 — Salvar e entregar

Crie o diretório `prototypes/[slug]/` se não existir e salve o arquivo como
`prototypes/[slug]/flow.html`.

Informe ao final:

> ✅ Protótipo gerado em `prototypes/[slug]/flow.html`
>
> **Telas cobertas**: [lista]
> **Abra no navegador** — navegação e toasts são funcionais.
>
> Quer ajustar algo ou posso avançar para a especificação (N2/N3)?

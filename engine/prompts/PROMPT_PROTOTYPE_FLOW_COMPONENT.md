# PROMPT_PROTOTYPE_FLOW_COMPONENT — Protótipo de Fluxo (Componente)

> **Modelo de estrutura**: `engine/templates/prototypes/_template/_template-feature-set/README.md` *(referência humana — o prompt já embute o esqueleto)*
> **Quem participia**: dev / designer / PO técnico
> **Insumo necessário**: DESIGN-SYSTEM.md + N2 do Feature Set
> **Entrega**: arquivo `flow-component.html` mostrando o fluxo de navegação
> entre as áreas de conteúdo das telas, **sem** sidebar, topbar ou shell
> de aplicação — apenas o conteúdo principal de cada tela
>
> **Quando usar este em vez do FULL**:
> - Iteração rápida — quer validar o fluxo sem montar o layout completo
> - Componente será embutido em outro sistema (iframe, storybook, design token preview)
> - O Design System ainda não está definido completamente
> - Quer gerar múltiplas variações para comparação sem repetir o layout
>
> **Pré-requisito**: N2 aprovado (PROMPT_2A concluído)
> **Onde salvar**: `prototypes/[dominio]/[feature-set]/flow-component.html`

---

## INSTRUÇÕES PARA O CLAUDE

Você vai gerar um protótipo de fluxo HTML focado **exclusivamente no conteúdo**
de cada tela — sem sidebar, topbar, breadcrumb ou qualquer shell de aplicação.

O arquivo terá um menu de navegação próprio e minimalista no topo,
apenas para permitir alternar entre as telas durante a revisão.

### Regras de geração

1. **Sem shell de aplicação**: nenhuma sidebar, topbar, nav global ou footer.
   O foco é a área de conteúdo `<main>` de cada tela.

2. **Navegador de protótipo próprio**: incluir uma barra simples no topo
   do arquivo com os nomes das telas como abas ou botões de seleção.
   Essa barra pertence ao protótipo, não ao produto.

3. **Use a biblioteca de componentes**: linke `prototypes/_biblioteca/sakai.css`
   (ajuste os `../` conforme a profundidade) e use as classes `p-*` para todos os
   elementos internos (tabelas, formulários, botões, cards). Não redefina tokens
   nem recrie componentes inline — apenas a barra navegadora do protótipo
   (`proto-nav`) e o JS de navegação ficam inline.

4. **Foco na informação e hierarquia**: sem o visual completo, o protótipo
   deve deixar claro o que é título de página, o que são ações primárias,
   o que é conteúdo principal e o que é secundário.

5. **Navegação funcional entre telas**: botões e links de transição devem
   funcionar — implementar como troca de `display` entre seções.

6. **Leve e rápido**: o arquivo deve ser compacto. Evitar CSS excessivo.
   Um desenvolvedor deve conseguir adaptar o componente em menos de 30 minutos.

7. **Dados fictícios realistas**: mesma regra do FULL — nunca Lorem ipsum.

8. **Anotar dependências do layout**: listar no painel de notas o que
   o componente precisa do shell para funcionar corretamente
   (ex: "Este componente assume que a sidebar passa o `organizationId` via contexto").

---

## CONTEXTO DO PROJETO

=== DESIGN-SYSTEM.md ===
[cole aqui o conteúdo do DESIGN-SYSTEM.md]

=== N2 DO FEATURE SET ===
[cole aqui o README.md do Feature Set]

=== N3s DAS FEATURES (opcional) ===
[cole aqui os N3s disponíveis, se quiser mais fidelidade]

---

## PASSO 1 — Mapeamento de telas

Leia o N2 e liste as telas e o grafo de navegação entre elas.
Apresente antes de gerar:

```
[Listagem] ──"Novo"──→ [Formulário de criação]
           ──"Linha"──→ [Detalhe]
                            └──"Editar"──→ [Formulário de edição]
```

Pergunte:
> "O mapa de navegação reflete o fluxo esperado?
> Posso gerar o protótipo de componente?"

---

## PASSO 2 — Geração do HTML

Após aprovação, gere `flow-component.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Feature Set] — Fluxo (Componente)</title>
  <!-- Biblioteca de componentes (sakai-ng) — ajuste os ../ conforme a profundidade -->
  <link rel="stylesheet" href="../../_biblioteca/sakai.css">
  <style>
    /* Barra navegadora do protótipo (não pertence ao produto) */
    .proto-nav { background: var(--p-surface-900); padding: .625rem 1.25rem; display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
    .proto-nav span { color: var(--p-surface-400); font-size: .7rem; font-family: monospace; margin-right: .5rem; }
    .proto-nav button { background: transparent; border: 1px solid var(--p-surface-600); color: var(--p-surface-300); padding: .25rem .75rem; border-radius: var(--border-radius); font-size: .75rem; cursor: pointer; }
    .proto-nav button.active { background: var(--primary-color); border-color: var(--primary-color); color: var(--primary-contrast-color); }
  </style>
</head>
<body>

  <!-- Navegador do protótipo (troca telas) -->
  <nav class="proto-nav">
    <span>🎨 PROTÓTIPO COMPONENTE — [Feature Set]</span>
    <button class="active" onclick="showScreen('screen-list', this)">[Tela 1]</button>
    <button onclick="showScreen('screen-detail', this)">[Tela 2]</button>
    <button onclick="showScreen('screen-form', this)">[Tela 3]</button>
  </nav>

  <!-- Toast global (p-toast da biblioteca) -->
  <div id="toast" class="p-toast" style="display:none"></div>

  <!-- Área de conteúdo (sem shell): layout-component-only -->
  <main class="layout-component-only">

    <!-- Tela 1: Listagem -->
    <div id="screen-list" class="screen active">
      <div class="flex items-center justify-between mb-4">
        <div class="page-header" style="margin:0">
          <h1 class="page-title">[Título da tela]</h1>
          <p class="page-subtitle">[Subtítulo opcional]</p>
        </div>
        <button class="p-button" onclick="showScreen('screen-form', document.querySelector('[onclick*=screen-form]'))">[Ação primária]</button>
      </div>
      <div class="card">
        <table class="p-datatable">
          <thead><tr><th>[Coluna 1]</th><th>[Coluna 2]</th><th>[Coluna 3]</th><th class="p-column-actions">Ações</th></tr></thead>
          <tbody>
            <tr onclick="showScreen('screen-detail', document.querySelector('[onclick*=screen-detail]'))">
              <td>[dado fictício realista]</td>
              <td>[dado fictício realista]</td>
              <td><span class="p-tag p-tag-success">[tag]</span></td>
              <td class="p-column-actions"><button class="p-button p-button-text p-button-sm">Editar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tela 2: Detalhe -->
    <div id="screen-detail" class="screen">
      <div class="card"><!-- conteúdo do detalhe --></div>
    </div>

    <!-- Tela 3: Formulário -->
    <div id="screen-form" class="screen">
      <div class="card p-fluid">
        <!-- campos do formulário com p-field / p-inputtext / p-select -->
        <div class="flex justify-end gap-2 mt-4">
          <button class="p-button p-button-text p-button-secondary" onclick="showScreen('screen-list', document.querySelector('[onclick*=screen-list]'))">Cancelar</button>
          <button class="p-button" onclick="showToast('Registro salvo com sucesso.', 'success')">Salvar</button>
        </div>
      </div>
    </div>

    <!-- Modal de exclusão (p-dialog) -->
    <div id="modal-delete" class="p-dialog-mask" style="display:none">
      <div class="p-dialog" style="max-width:28rem">
        <div class="p-dialog-header"><span class="p-dialog-title">Excluir [item]?</span></div>
        <div class="p-dialog-content">Esta ação não pode ser desfeita.</div>
        <div class="p-dialog-footer">
          <button class="p-button p-button-text p-button-secondary" onclick="closeModal('modal-delete')">Cancelar</button>
          <button class="p-button p-button-danger" onclick="closeModal('modal-delete'); showToast('Registro excluído.', 'success')">Excluir</button>
        </div>
      </div>
    </div>

    <!-- Notas do protótipo -->
    <div class="prototype-notes">
      <strong>📋 Notas — Componente [Feature Set]:</strong>
      <ul>
        <li>Este componente assume que recebe <code>organizationId</code> do contexto global.</li>
        <li>[Outro comportamento não representado aqui]</li>
      </ul>
    </div>

  </main>

  <script>
    function showScreen(id, btn) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      if (btn) {
        document.querySelectorAll('.proto-nav button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }
    function openModal(id) { document.getElementById(id).style.display = 'flex'; }
    function closeModal(id) { document.getElementById(id).style.display = 'none'; }
    function showToast(msg, type = '') {
      const t = document.getElementById('toast');
      t.innerHTML = '<div class="p-toast-message p-toast-' + (type || 'info') + '"><div><div class="p-toast-detail">' + msg + '</div></div></div>';
      t.style.display = 'flex';
      setTimeout(() => { t.style.display = 'none'; }, 3000);
    }
  </script>

</body>
</html>
```

---

## PASSO 3 — Entrega

> "✅ Protótipo de fluxo (componente) gerado.
>
> **Salvar como**: `prototypes/[dominio]/[feature-set]/flow-component.html`
>
> **Quando usar o FULL em vez deste**: quando precisar validar o layout
> completo com sidebar e topbar, ou para apresentações ao cliente.
>
> **Telas cobertas**: [lista]
> **Dependências declaradas nas notas**: [lista]"

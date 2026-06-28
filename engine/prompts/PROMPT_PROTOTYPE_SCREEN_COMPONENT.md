# PROMPT_PROTOTYPE_SCREEN_COMPONENT — Protótipos de Estado (Componente)

> **Modelo de estrutura**: `engine/templates/prototypes/_template/_template-feature-set/_template-feature/README.md` *(referência humana — o prompt já embute o esqueleto)*
> **Quem participa**: dev / designer / PO técnico
> **Insumo necessário**: DESIGN-SYSTEM.md + N3 da feature
> **Entrega**: um arquivo HTML por estado, mostrando **apenas a área de conteúdo**
> da tela — sem sidebar, topbar ou shell de aplicação
>
> **Quando usar este em vez do FULL**:
> - Iteração rápida com o PO — quer validar campos e mensagens sem montar o layout
> - Dev quer usar como referência de markup para um componente isolado
> - Quer comparar variações de um mesmo estado lado a lado
> - Quer embutir em Storybook, design token preview ou documentação técnica
>
> **Pré-requisito**: N3 aprovado (PROMPT_3B concluído)
> **Onde salvar**: `prototypes/[dominio]/[feature-set]/[feature]/[estado]-component.html`

---

## INSTRUÇÕES PARA O CLAUDE

Você vai gerar protótipos HTML de cada estado de tela de uma feature,
focados **exclusivamente na área de conteúdo** — sem sidebar, topbar ou
qualquer shell de aplicação.

Cada arquivo representa um estado isolado que pode ser aberto diretamente
no browser ou embutido como componente.

### Regras de geração

1. **Sem shell de aplicação**: nenhuma sidebar, topbar, breadcrumb ou footer.
   O arquivo começa diretamente com o conteúdo da área principal.

2. **Use a biblioteca de componentes**: linke `prototypes/_biblioteca/sakai.css`
   (ajuste os `../` conforme a profundidade) e use as classes `p-*` para todos os
   elementos internos. Não redefina tokens nem recrie componentes inline.
   Em especial, `.prototype-badge` já vem estilizado pelo `sakai.css` — não
   recrie essa regra nem reposicione o badge (sem `top/right/bottom/left` soltos
   nele), senão ele estica e vira um bloco gigante sobre a tela.

3. **Largura máxima realista**: envolva o conteúdo em
   `<main class="layout-component-only">` — já centraliza com `max-width` e padding
   lateral, equivalente à área de conteúdo do layout completo.

4. **Um arquivo por estado**: `form-component.html`, `loading-component.html`,
   `empty-component.html`, `error-component.html`. Nunca misturar estados.

5. **Campos mapeados do N3**: labels = Label PO do N3. Tipos de input =
   tipo do campo. Mensagens de erro/validação = exatamente as do N3.
   Campo `seleção → [Entidade]` → combobox `p-select` com opções fictícias
   realistas (texto = campo-label do DATA-MODEL.md), nunca input de texto;
   anote a origem (`GET /api/v1/[recurso]?search=`) no painel de notas.

6. **Componente autoexplicativo**: incluir no topo do arquivo (fora do
   componente real) um cabeçalho minimalista de contexto:
   ```html
   <div class="proto-header">
     <span class="proto-badge">🔲 COMPONENTE</span>
     <span class="proto-feature">[Feature] / [Estado]</span>
     <span class="proto-spec">→ spec: [caminho do N3]</span>
   </div>
   ```

7. **Dados fictícios realistas**: mesma regra do FULL — nunca Lorem ipsum.

8. **Declarar dependências explicitamente**: o arquivo deve listar no rodapé
   o que o componente espera receber do contexto pai (props, contexto global,
   permissões). Isso é essencial para que o dev saiba como integrar.

---

## CONTEXTO DO PROJETO

=== DESIGN-SYSTEM.md ===
[cole aqui o conteúdo do DESIGN-SYSTEM.md]

=== N3 DA FEATURE ===
[cole aqui o arquivo completo da feature]

---

## PASSO 1 — Mapeamento de estados

Leia o N3 e liste os estados a gerar:

| Arquivo | Estado | Baseado em |
|---|---|---|
| `form-component.html` | Formulário principal | Seção "Campos" do N3 |
| `loading-component.html` | Skeleton | "Comportamento de tela: Loading" |
| `empty-component.html` | Sem dados | "Comportamento de tela: Empty state" |
| `error-component.html` | Erro | "Comportamento de tela: Error state" |
| `modal-component.html` | Modal | "Onde fica" (se for modal) |
| `[custom]-component.html` | [estado] | [referência no N3] |

Pergunte:
> "Os estados mapeados estão corretos? Qual gerar primeiro?"

---

## PASSO 2 — Geração estado a estado

Gere um estado por vez. Aguarde aprovação antes de avançar.

### Estrutura base de cada arquivo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Feature] — [Estado] (Componente)</title>
  <!-- Biblioteca de componentes (sakai-ng) — ajuste os ../ conforme a profundidade -->
  <link rel="stylesheet" href="../../../_biblioteca/sakai.css">
</head>
<body>

  <!-- Componente sem shell: layout-component-only centraliza com max-width + padding -->
  <main class="layout-component-only">

    <div class="prototype-badge">🎨 COMPONENTE — [Feature] / [Estado]</div>

    <div class="card">
      <!-- CONTEÚDO DO ESTADO — usar classes da biblioteca:
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
           p-button-secondary (com borda) com p-button-text na mesma linha.
           Substituir pelo estado correspondente: form / loading / empty / error / modal -->
    </div>

    <!-- Notas do protótipo + dependências esperadas do componente pai -->
    <div class="prototype-notes">
      <strong>📋 Notas — [Feature] / [Estado]:</strong>
      <ul>
        <li>[comportamento não representado neste arquivo]</li>
      </ul>
      <strong style="display:block;margin-top:.75rem">Dependências esperadas do componente pai:</strong>
      <ul>
        <li><code>organizationId</code> — via contexto global de autenticação</li>
        <li><code>userRole</code> — para exibir/ocultar campos por permissão</li>
        <li>[outras dependências identificadas no N3]</li>
      </ul>
    </div>

    <!-- Modais/toasts deste estado (se necessário) usam p-dialog / p-toast da biblioteca -->
    <script>
      // JS pontual de interação (abrir/fechar modal, exibir toast) pode ficar inline.
      function openDialog(id){ document.getElementById(id).style.display = 'flex'; }
      function closeDialog(id){ document.getElementById(id).style.display = 'none'; }
    </script>

  </main>
</body>
</html>
```

### Conteúdo de cada estado

**`form-component.html`**
- Título da página + subtítulo (se houver)
- Todos os campos do N3 com Label PO, tipo correto, obrigatoriedade e dica de formato
- Ao menos um campo com erro de validação pré-preenchido (para referência visual)
- Campos desabilitados para roles sem permissão (conforme N3)
- `form-footer` com cancelar (ghost) + ação principal (primary)

**`loading-component.html`**
- Skeleton no lugar de títulos, campos e tabelas
- Sem dados — apenas blocos cinza animados com proporções equivalentes ao conteúdo real
- Botões de ação desabilitados

**`empty-component.html`**
- `empty-state` com ícone SVG simples, título e descrição exatos do N3
- Botão de ação primária (conforme N3 — pode não existir)

**`error-component.html`**
- `error-state` com ícone, título e mensagem descritiva (conforme N3 — não genérica)
- Botão "Tentar novamente"

**`modal-component.html`**
- Componente já com o modal aberto (overlay + caixa) para visualização direta
- Estrutura: título + corpo + footer com ações
- Para modal de exclusão: botão danger + cancelar

---

## PASSO 3 — Geração do README do nível

Após gerar todos os estados aprovados, gere ou atualize o
`prototypes/[dominio]/[feature-set]/[feature]/README.md`
adicionando os arquivos `*-component.html` na tabela de estados
com status `🎨 Mockup`.

---

## PASSO 4 — Entrega

> "✅ Protótipos de componente de [feature] gerados.
>
> **Salvar em**: `prototypes/[dominio]/[feature-set]/[feature]/`
>
> **Arquivos gerados** (sufixo `-component`):
> - `form-component.html`
> - `loading-component.html`
> - `empty-component.html`
> - `error-component.html`
>
> **Dependências declaradas**: [lista das props/contexto esperados]
>
> **Quando usar o FULL em vez deste**: quando precisar apresentar ao
> cliente ou validar o layout completo com sidebar e topbar."

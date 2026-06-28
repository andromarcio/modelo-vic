<!-- doc-template-engine: {{VERSION}} | prompt: {{PROMPT_ID}} | atualizado: {{YYYY-MM-DD}} -->
# DESIGN-SYSTEM.md
> Padrões de interface, componentes e escrita para produtos digitais.
> Cole em sessões que envolvam criação ou alteração de telas.
>
> ℹ️ **Template do kit — exemplo preenchido a substituir.** Este arquivo está
> preenchido com o **CAIXA Design System** como exemplo de referência. Cada
> projeto tem sua própria identidade visual: **substitua** cores, tipografia,
> tokens e componentes pelo design system do seu produto, mantendo a estrutura
> de seções (cores, tipografia, componentes, estados, UX writing).
>
> **Base visual**: **CAIXA Design System** — extraído do Figma (Dev Mode MCP), tokens canônicos `--dsc-*`, fonte **CAIXA Std**.
> **Biblioteca pronta**: [`prototypes/_biblioteca-ds/`](../prototypes/_biblioteca-ds/README.md) — HTML/CSS para protótipos (classes `.dsc-*`).
> **Fonte UX Writing**: Guia de Escrita para Canais Digitais — v2.0 (25/02/26)

---

## Layout geral

**Layout default = extra large com sidebar OCULTA.** O conteúdo ocupa a largura
total e o menu é acessado por um **hambúrguer (☰)** no header. Shell:
`.dsc-app` › `.dsc-sidebar` / `.dsc-shell-main`.

- **Header** (`.dsc-header`): fixo no topo da área de conteúdo, altura **64px**, fundo `bg-neutral-1`, borda inferior `border-neutral-3`. À esquerda o botão **☰** (`.dsc-menu-toggle`); à direita as ações (alternar tema, perfil).
- **Sidebar oculta por padrão** (`.dsc-sidebar` + `.dsc-menu`): largura **264px**, fundo `bg-neutral-1`. **Não aparece no carregamento** — abre como **drawer sobreposto** (`.is-menu-open`) pelo ☰, com **backdrop** (`.dsc-sidebar-backdrop`), e **recolhe ao acionar uma opção** / clicar fora / ESC. Vale em **qualquer tamanho (inclusive extra large)**. Marca no topo (`.dsc-sidebar-brand`); seções (`.dsc-menu-section`); item ativo (`.is-active`) em `bg-highlight-1` + texto `primary`. Toggle via `dscToggleMenu()` (ver README).
- **Área de conteúdo** (`.dsc-main`): `padding: 24px`, **largura total** (sidebar não ocupa espaço). Conteúdo organizado em **cards** (`.dsc-card`: fundo `bg-neutral-1`, padding 24px, borda `border-neutral-3`, **raio 12px**, sombra `Elevation 1`).
- **Cabeçalho de página** (`.dsc-page-header` › `.dsc-page-title` + `.dsc-page-subtitle`) acima do conteúdo.
- **Grid**: sistema de **12 colunas** (`.dsc-row` + `.dsc-col-{1..12}`); utilitários `.dsc-grid-{2,3,4}` + `.dsc-gap-{1,2,3}`.
- **Protótipos sem shell**: usar `<main class="dsc-component-only">` em vez do bloco `.dsc-app`.
- **Tema**: claro (padrão) e escuro, alternados pela classe `app-dark` na raiz.

> **Responsividade / breakpoints** (confirmados no Figma "Basic Layout"): **extra small 360 · small 480 · medium 768 · large 1024 · extra large 1440**. O grid de conteúdo é **12 colunas** (≥768px, gutter 24) e **4 colunas** (<768px, gutter 16). Demo do shell: [`shell-responsive.html`](../prototypes/_biblioteca-ds/shell-responsive.html).

---

## Paleta de cores

Tokens canônicos do CAIXA DS, namespace `--dsc-*` (escalas 10→130). Ver [`tokens.css`](../prototypes/_biblioteca-ds/tokens.css).

**Marca / ação:**

| Token | Valor | Uso |
|---|---|---|
| `primary-90` | `#005ca9` | Ação principal (highlight), links, menu ativo, destaques |
| `primary-110` | `#00437a` | Hover/pressionado do primário |
| `primary-10` | `#e5f2fc` | Fundo de destaque (`bg-highlight-1`) |
| `secondary-90` | `#d87b00` | Apoio/laranja CAIXA |

**Semânticas (status) — par fundo `-10` + cor forte `-90`/`-110`:**

| Severidade | Fundo (`-10`) | Forte | Texto escuro (`on*Bg`) |
|---|---|---|---|
| `success` (positive) | `#e7f4ea` | `#127527` | `#0d581d` |
| `warning` (attention) | `#fff9e6` | `#977203` | `#654c02` |
| `danger` (negative) | `#fbebeb` | `#b22c2c` | `#8c2424` |
| `information` (informative) | `#e5f5f8` | `#038299` | `#026273` |

**Superfícies / texto (grayscale):**

| Token | Valor | Uso |
|---|---|---|
| `bg-neutral-2` | `#f7fafa` | Fundo da aplicação / header de tabela |
| `bg-neutral-1` | `#ffffff` | Fundo de cards, header, sidebar |
| `bg-neutral-3` | `#ebf1f2` | Hover de itens, zebra |
| `border-neutral-3` | `#d0e0e3` | Bordas, divisores |
| `content-neutral-5` | `#22292e` | Texto principal |
| `content-neutral-4` | `#404b52` | Texto secundário |
| `grayscale-90` | `#525f66` | Texto suave / placeholder |

> **Dark mode** (`.app-dark`): superfícies deslocam para `#1e2429`/`#22292e`; texto principal → `#f9fafb`; `primary` desloca para `primary-50` `#33a0ff`.

---

## Tipografia

**Fonte**: **CAIXA Std** (`--dsc-font-family-1`), com fallback `"Segoe UI", Roboto, system-ui, sans-serif`. Roboto é usado em valores numéricos. Base **16px** (`font-size-micro`), `line-height` 1.5. Pesos **400 / 600 / 700**.

> ⚠️ CAIXA Std é proprietária e **não** vem embutida na biblioteca — sem `@font-face`/instalação local, o navegador cai no fallback. Para fidelidade total, embutir os arquivos da fonte.

| Elemento | Classe | Tamanho / line-height | Peso |
|---|---|---|---|
| Display | `.dsc-display` | 36 / 44 | 400 |
| Título de página | `.dsc-page-title` / `.dsc-title` | 24 / 32 | 600 |
| Título de seção | `.dsc-title-sm` | 20 / 28 | 600 |
| Corpo | `.dsc-body` | 16 / 24 | 400 |
| Corpo pequeno | `.dsc-body-sm` | 14 / 20 | 400 |
| Label de campo | `.dsc-field-label` | 14 | 600 |
| Texto de ajuda / caption | `.dsc-field-hint` / `.dsc-caption` | 12 / 16 | 500 |
| Mensagem de erro | `.dsc-field-error` | 12 | 400 (cor `danger`) |

---

## Tokens de forma e movimento

| Token | Valor | Uso |
|---|---|---|
| `border-radius-pill` | 1000px | **Botões, inputs, select, tags, chips, switch** — formato pílula |
| `border-radius-medium` | 12px | Cards, modais, textarea, popovers |
| `border-radius-large` | 16px | Card Alert (mensagens inline) |
| `border-radius-small` | 8px | Caixas de checkbox, células editáveis, itens de menu |
| `border-width-hairline` / `thin` | 1px / 2px | Bordas de campo / ênfase |
| `transition-duration` | ~0.12s | Transições de hover/estado |
| `focus-ring` | anel 3px `primary` translúcido | Foco visível por teclado |
| `Elevation 1` | `0 1px 2px rgba(0,0,0,.04)` | Cards, chips |
| `Elevation 2` | `0 14px 28px rgba(0,0,0,.04)` | Modais, toasts, popovers, drawer |

**Espaçamento** (`--dsc-spacing-*`): `quark 4 · nano 8 · micro 12 · tiny 16 · smaller 24 · small 32 · medium 40 · large 48 · larger 56 · big 64 · bigger 72 · huge 80`.

---

## Componentes padrão

> Use a biblioteca [`prototypes/_biblioteca-ds/`](../prototypes/_biblioteca-ds/README.md) — classes `.dsc-*` espelham os componentes do Figma CAIXA DS. Nunca criar estilos inline divergentes. Catálogo navegável em [`index.html`](../prototypes/_biblioteca-ds/index.html).

### Botões (`.dsc-btn`) — Figma: **Button**

Formato **pílula**. Classe base `.dsc-btn`.

**Variantes**: `highlight` (padrão), `danger` (`.dsc-btn--danger`), `on media bg` (`.dsc-btn--on-media`, para fundos coloridos).
**Tipos**: plain/sólido (padrão), `.dsc-btn--outline`, `.dsc-btn--chromeless` (texto).
**Tamanhos**: standard 44px (padrão), `.dsc-btn--sm` 32px. **Ícone**: à esquerda (padrão) ou `.dsc-btn--icon` (icon-only). Grupo de toggle: `.dsc-segmented` (Segmented Button).

| Papel na tela | Variante + tipo | Posição padrão |
|---|---|---|
| Ação principal | highlight plain (`.dsc-btn`) | Direita do rodapé do formulário |
| Ação secundária | highlight `.dsc-btn--outline` | À esquerda da principal |
| Cancelar / descartar | highlight `.dsc-btn--chromeless` | À esquerda das demais |
| Excluir, desativar | `.dsc-btn--danger` (plain ou outline) | Separado das demais ações |

- O DS **não** tem botão "neutro" preenchido — para ação secundária use outline/chromeless highlight.
- Estado `disabled`: opacidade reduzida e cursor `not-allowed`.
- Estado `loading`: classe `.is-loading` (spinner sobre o botão).

### Formulários

- Label sempre **acima** do campo (`.dsc-field` é coluna flex com `gap`; rótulo `.dsc-field-label`)
- Campos têm **formato pílula** (raio pill); textarea usa raio 12px (`.dsc-textarea`)
- Inputs: `.dsc-input`, `.dsc-textarea`, `.dsc-select`, `.dsc-input-icon` (com ícone), `.dsc-search`
- Seletores: `.dsc-check`, `.dsc-radio`, `.dsc-switch`, `.dsc-slider`, `.dsc-stepper`
- Campos especializados (Figma): `.dsc-money` (Input Money), `.dsc-pin` (Input Pin), `.dsc-input-chips`, `.dsc-account-select`, password/date via `.dsc-field-action` (olho/calendário), Date Picker `.dsc-calendar`
- Campos obrigatórios marcados com `*` na cor `danger`; opcionais com `(opcional)` em `text-muted`
- Foco: borda `primary` + anel de foco (`focus-ring`)
- Erro: classe `.is-invalid` no `.dsc-field` (borda `danger`) + `.dsc-field-error` (ícone + texto) **abaixo** do campo — nunca só a cor
- Placeholder apenas para exemplificar formato — nunca substituir label
- Texto de ajuda: `.dsc-field-hint` abaixo do campo, em `text-muted`

### Tabelas e listas (`.dsc-table`) — Figma: **Table**

- Envolver em `.dsc-table-wrap` (borda + raio 12px). Cabeçalho em **caixa normal** (semibold, escuro) sobre fundo `bg-neutral-2`
- Coluna de **seleção** (checkbox) à esquerda: `.dsc-col-check`; linha selecionada `.is-selected`
- Coluna de ações na **última coluna** (`.dsc-col-actions` com `.dsc-icon-action`)
- Cabeçalho ordenável: `.dsc-sortable` (+ `.is-sorted`); valores numéricos `.dsc-num` (alinhados à direita)
- Status exibido com **tag** (`.dsc-tag--*`), não apenas texto
- Totais em `tfoot`; densa com `.dsc-table--dense`; célula editável `.dsc-cell-editable`
- Toolbar `.dsc-table-toolbar` (busca/ações) e **paginação no rodapé** `.dsc-table-footer`
- Estado vazio dentro da tabela: `.dsc-table-empty`

### Modais (`.dsc-modal`) — Figma: **Modal**

- Confirmação de exclusão: **sempre modal** — nunca `confirm()` nativo
- Estrutura: `.dsc-modal-mask` (overlay) > `.dsc-modal` > `.dsc-modal-header` (título + fechar) + `.dsc-modal-body` + `.dsc-modal-footer`
- Footer: ação à direita (danger para exclusão) + cancelar (chromeless) à esquerda
- Fechar com ESC ou clique fora da área (`.dsc-modal-mask`)

### Toasts / Notificações (`.dsc-toast`) — Figma: **Toast / Snackbar**

- Posição: **canto superior direito**
- Estrutura: **fundo escuro** (`grayscale-130` `#22292e`) + ícone colorido por severidade + texto + fechar
- Duração: **~4–5 segundos** para sucesso/info; **persistente** (com fechar) para erro
- Nunca usar `alert()` nativo

### Mensagens inline (`.dsc-alert`) — Figma: **Card Alert**

- Alerta contextual na página, por variante: `info`, `success`, `warning`, `danger`, `smart-tips`
- Estrutura: **sem borda** · raio **16px** · fundo tonal da severidade · **ícone na cor forte** + texto na cor escura (`on*Bg`)
- Ação opcional (`action=true`): botão chromeless no rodapé via `.dsc-alert-cta`
- Usar para avisos persistentes na tela (não confundir com toast, que é transitório)

### Tags, badges e chips

- `.dsc-tag` — **Badge Text**: status em tabelas/cards. Variantes `highlight`/`neutral`/`success`/`warning`/`danger`; pílula, **sem borda nem dot**; slots de ícone opcionais; tamanhos `.dsc-tag--sm`/`--lg`
- `.dsc-badge` — contadores (notificações, itens); `.dsc-badge--dot` para indicador
- `.dsc-chip` — filtros aplicados, seleções removíveis (Chips)
- `.dsc-avatar` — iniciais ou foto do usuário (Avatar)

---

## Estados obrigatórios de tela

Todo módulo deve tratar e exibir os quatro estados abaixo. Classes na biblioteca: `.dsc-skeleton`, `.dsc-state` (empty/error), `.dsc-table-empty` (vazio em tabela), `.dsc-spinner`, `.dsc-progress`.

### Loading
- Usar **skeleton** (`.dsc-skeleton`, com animação _shimmer_) no lugar do conteúdo que está carregando
- Nunca usar spinner genérico isolado
- Blocos de skeleton com a mesma proporção do conteúdo real

### Empty state
- `.dsc-state`: ícone ilustrativo + título + descrição + botão de ação (quando aplicável). Em tabelas, usar `.dsc-table-empty`

### Error state
- `.dsc-state`: ícone de erro + mensagem descritiva + botão "Tentar novamente"

### Success
- Toast (`.dsc-toast`) com mensagem de confirmação, ou Card Alert (`.dsc-alert--success`) quando persistente
- Nunca redirecionar sem feedback visual

---

## Padrões de tela (layout)

> ⚠️ **Convenção do projeto** — o Figma DS **não** prescreve layout de tela
> (pesquisa, formulários por quantidade/tipo de campo). As regras abaixo são
> nossas, derivadas do **grid de 12 colunas** e da biblioteca `.dsc-*`, para
> manter os protótipos consistentes. (O Figma fornece grid, breakpoints,
> Basic Layout e os templates Screen Feedback / State Message.)

### Tela de pesquisa
Sequência: **cabeçalho de página → card de filtros → resultados → paginação**, tratando loading/empty/error.

- **Filtros** em `.dsc-card` com `.dsc-row` (12 col); **3–4 campos por linha** (`.dsc-col-4`/`.dsc-col-3`). Incluir **um input para cada campo marcado `(filtro)`** no N3 — nunca resumir nem omitir filtros. Ações **Limpar** (chromeless) + **Pesquisar** (primário) à direita do card.
- **Resultados** em `.dsc-table` com toolbar (contagem + ações), **status em `.dsc-tag`**, ações na **última coluna**, **paginação no rodapé** (`.dsc-table-footer`).
- Estados obrigatórios: loading (skeleton), empty (`.dsc-state`/`.dsc-table-empty`), error.
- Exemplo: [`prototypes/exemplo-clientes/cadastro/pesquisar-clientes/`](../prototypes/exemplo-clientes/cadastro/pesquisar-clientes/).

### Formulário de cadastro

**Poucos campos (≤ ~5)** — coluna única, largura **contida** (não esticar): use `.dsc-row` + `.dsc-col-6`/`.dsc-col-8` por campo (empilham no mobile). Rodapé com cancelar (chromeless) + ação principal (primário) à direita.

**Muitos campos** — `.dsc-row` (12 col), **agrupado por seções** (cada seção em um `.dsc-card` com `.dsc-card-title`, ou separada por `.dsc-divider` + título). Largura de cada campo conforme o **tipo** (tabela abaixo). Em formulários longos, o rodapé de ações pode ser fixo.

### Largura por tipo de campo (span no grid de 12; no mobile tudo empilha)

| Tipo de campo | Span sugerido |
|---|---|
| CPF · CEP · data · valor (R$) · telefone · agência/conta · nº/quantidade | **`dsc-col-3`** a **`dsc-col-4`** (estreito) |
| Nome · e-mail · select de porte médio · cidade | **`dsc-col-6`** |
| Endereço (logradouro) · assunto · campo composto | **`dsc-col-8`** |
| Observações · descrição longa · `dsc-textarea` · upload | **`dsc-col-12`** (largura total) |

**Regras gerais:**
- Agrupar campos por **assunto/seção** (Dados pessoais, Endereço, Dados bancários…) e em sequência natural de preenchimento.
- Campos relacionados na **mesma linha** (ex.: CEP + Logradouro + Número).
- Obrigatoriedade: marcar a exceção (`*` em obrigatórios ou `(opcional)` nos opcionais), conforme UX Writing.
- Nunca usar largura total para campos curtos (CPF ocupando 12 col é antipadrão).

---

## Padrões de navegação

- Breadcrumb atualizado em toda navegação
- URL sempre reflete o estado atual (filtros, tabs, modal aberto)
- Botão Voltar do browser deve funcionar corretamente
- Links externos sempre abrem em nova aba

---

## Acessibilidade (mínimo obrigatório)

- Todo campo de formulário com `label` associado via `for`/`id`
- Imagens com `alt` descritivo — nunca deixar vazio em imagens funcionais
- Ícones de ação com `aria-label`
- Contraste mínimo de 4.5:1 para textos
- Navegação completa por teclado em formulários e modais
- Erros sinalizados com cor **e** texto — nunca depender apenas da cor
- Header principal da tela funciona como `H1` — título nunca pode ser vago ou genérico

---

## UX Writing

> Diretrizes de escrita para interfaces digitais.
> Aplicar em todos os microtextos: botões, labels, placeholders, mensagens, títulos.

### Princípios gerais

| Princípio | Diretriz |
|---|---|
| **Clareza** | Palavras simples, frases objetivas, sem jargões técnicos ou termos bancários desnecessários |
| **Concisão** | Textos curtos e diretos — o tempo da pessoa usuária é valioso |
| **Relevância** | Informar o que é mais importante no contexto certo |
| **Consistência** | Usar os mesmos termos em todo o produto — nunca nomear o mesmo elemento de formas diferentes |
| **Acessibilidade** | Linguagem Simples, acessível a qualquer nível de familiaridade digital |

### Voz e Tom

- **Voz** (constante): brasileira, segura, próxima, empática
  - Otimista e realizadora: foco em soluções concretas, não frases motivacionais genéricas
  - Empoderador: dá controle e confiança à pessoa usuária
  - Parceiro: colaborativo, nunca impositivo ("A gente sabe o que você precisa" ❌)

- **Tom** (varia por contexto):

| Situação | Tom |
|---|---|
| Erro grave / bloqueio | Sério, claro e calmo |
| Aviso / alerta leve | Neutro e orientador |
| Sucesso / confirmação | Positivo, curto e cordial |
| Urgência | Direto e imperativo |
| Onboarding / boas-vindas | Acolhedor e motivador |

---

### Hierarquia da informação

Organize o conteúdo de tela para que a pessoa:
1. Entenda o que está vendo
2. Saiba o que pode fazer a seguir
3. Encontre rapidamente o que precisa

**Regra**: a informação mais importante sempre no início.

---

### Botões

- Sempre usar **verbos** — nunca substantivos isolados
- Apenas a **primeira letra maiúscula** — sem pontuação final
- **Infinitivo** (padrão) ou **imperativo** (urgência)
- Evitar termos vagos: `OK` ❌ → `Confirmar pagamento` ✅
- Complementar o verbo quando necessário para evitar ambiguidade

**Verbos mapeados e quando usar:**

| Botão | Quando usar | Evitar |
|---|---|---|
| Abrir conta digital | Iniciar abertura de conta nos canais digitais | "Iniciar abertura de conta" |
| Adicionar | Somar novo item à tela atual (anexar, criar, expandir lista) | "Incluir" (registro definitivo), "Criar" (início de fluxo) |
| Alterar | Mudar dado específico em operação já configurada (valor, data, conta) | "Editar", "Mudar", "Trocar" |
| Atualizar | Substituir algo existente ou recarregar dados em tempo real | "Alterar" (que leva a fluxo de edição) |
| Autorizar | Dar permissão formal, legal ou de segurança | "Confirmar" (para transações únicas), "Permitir" |
| Cadastrar | Criar ou registrar nova informação no sistema | "Adicionar", "Criar" |
| Cancelar | Desistir da tarefa atual — fecha tela e descarta alterações | Dois "Cancelar" com sentidos diferentes na mesma tela |
| Cancelar `<operação>` | Interromper operação específica em andamento (portabilidade, agendamento) | "Excluir", "Remover" |
| Compartilhar comprovante | Enviar comprovante de operação concluída | Apenas "Compartilhar" quando houver risco de ambiguidade |
| Continuar | Avançar para próxima etapa sem salvar | "Próximo", "Avançar" |
| Excluir | Remover dado permanentemente — sempre com modal de confirmação | "Deletar", "Apagar" |
| Ok, entendi | Confirmar leitura de informação sem ação subsequente | "OK" sozinho |
| Salvar | Persistir alterações feitas | "Confirmar" (reservar para transações financeiras) |

**App vs. sistema/desktop:**
- **App**: máxima concisão — um substantivo pode bastar (ex: `Empréstimos`)
- **Desktop**: pode ser mais descritivo em processos complexos, mas manter ordem direta (ex: `Acesse as parcelas do Fies`)

---

### Títulos e subtítulos

- Títulos `H1`: descrevem onde a pessoa está — nunca vagos (`Detalhes` ❌ → `Comprovante de transferência` ✅)
- Subtítulos: destacam a principal utilidade ou orientam a próxima ação
- **Sem ponto final** em títulos
- Apenas a **primeira letra maiúscula** (não title case)
- App: use o mínimo de palavras sem perder o sentido
- Desktop: pode ser mais descritivo, mas mantenha objetividade

---

### Formulários — labels, placeholders e textos de ajuda

**Labels (rótulos):**
- Palavras diretas e sucintas: `CPF`, `Senha de acesso`, `Valor da transferência`
- Sem frases longas, sem gerúndio, sem termos genéricos
- Obrigatoriedade: marcar a exceção
  - Maioria obrigatória → indicar `Opcional` nos que não forem
  - Maioria opcional → indicar `Obrigatório` nos que forem

**Placeholders:**
- Mostrar o formato esperado para o campo — não substituem o label
- Exemplo: campo CPF → placeholder `000.000.000-00`

**Textos de ajuda:**
- Usar para explicar o preenchimento, não repetir o label
- Exibir abaixo do campo, texto menor

**Ordem lógica:**
- Agrupar campos por assunto e sequência natural
- Formulários longos: dividir em seções (`Informações pessoais`, `Dados bancários`, etc.)

---

### Alertas, avisos e modais

Usar **apenas quando houver real necessidade**: confirmar ação irreversível, alertar risco, informar falha ou exigir decisão.

**Alertas** (tom preventivo/corretivo):
- Texto claro e direto, frases curtas
- Tom calmo e empático — nunca culpar a pessoa usuária
- Evitar jargões técnicos

**Avisos** (informações não emergenciais):
- Título informativo + texto
- Linguagem preventiva, não alarmista
- Usar marcadores (bullets) para instruções

**Diálogos modais:**
1. Título com ação clara
2. Botão principal com verbo claro — nunca `OK`
3. Corpo curto e objetivo
4. Priorizar ações que possam ser desfeitas
5. Tom compatível com a gravidade da jornada
6. Sem termos negativos duplos

---

### Mensagens de erro

Ao criar uma mensagem de erro, responder:
1. O que é esse erro?
2. Por que ocorreu?
3. É possível resolver?
4. Qual o contexto (telas antes e depois)?

**Anatomia de uma boa mensagem de erro:**
- Explicar o que aconteceu
- Indicar como resolver
- Tom respeitoso e humano
- Nunca culpar a pessoa usuária

**Boas práticas:**
- Ser específico: `Seu saldo é insuficiente para a operação` ✅ / `Falha na operação` ❌
- Orientar a próxima ação: `Verifique se inseriu a senha corretamente e tente de novo`
- Exibir o erro **após** a ação ser concluída (ao sair do campo ou clicar em enviar)
- Mostrar o erro **próximo ao campo** com problema
- Usar cor **e** texto — nunca só a cor para sinalizar erro

**Categorias:**

| Categoria | Definição | Exemplo |
|---|---|---|
| Ruído | Sem interrupção — breve orientação para corrigir | E-mail em formato errado |
| Obstáculo | Não consegue concluir agora, mas pode chegar lá | Necessidade de atualizar o app |
| Barreira | Bloqueio — precisa agir para continuar | Sem conexão com a internet |

---

### Estados vazios (empty states)

Ocorrem quando não há dados a exibir: primeiro uso, dados excluídos, pesquisa sem resultado, erro específico.

**Estrutura recomendada:**
- Elemento visual (ícone ou ilustração) — reduz carga cognitiva
- Título positivo: foco no que a pessoa **pode fazer**, não no que falta
  - `Você não tem dados` ❌ → `Insira seus dados para visualizar` ✅
- Orientação de próximo passo com botão ou link de ação

**Tipos:**

| Tipo | Como tratar |
|---|---|
| Primeiro uso | Informar o tipo de dado disponível e orientar o próximo passo |
| Resultado de pesquisa/filtro vazio | Explicar que pode ajustar parâmetros para visualizar |

**Regras:**
- Nunca deixar a pessoa num "beco sem saída" — sempre oferecer saída
- Situações semelhantes devem seguir o mesmo padrão visual e textual

---

### Textos de transição (loading states)

- Usar **verbos específicos no gerúndio**: `Carregando extrato...`, `Processando pagamento...`
- Acompanhar sempre de elemento visual (spinner, barra de progresso)
- Ações < 1 segundo: texto pode ser omitido
- Ações > 5 segundos: atualizar o status progressivamente
- Texto deve ser conciso — absorvido rapidamente

---

### Breadcrumbs

- Refletem a hierarquia de navegação — marcam o caminho percorrido
- Usar apenas quando necessário: analisar comportamento antes de adicionar
- Nomenclatura: mesmo nome do título da página atual (sem link)
- Máximo de **3 links** (excluindo home e página atual) — excedente usa truncamento `...`
- Texto: palavras-chave (substantivos), até 3 palavras por nível, sem conectivos
- Mobile: exibir apenas o link para a página anterior
- Nunca usar mais de uma linha em mobile — encurtar para linha única

---

### Formatação de texto em interfaces

| Elemento | Quando usar |
|---|---|
| **Negrito** | Destacar informação-chave — usar com moderação |
| *Itálico* | Termos estrangeiros não incorporados ao português ou conceitos técnicos |
| Sublinhado | Reservar para links — não usar para ênfase |

**Palavras estrangeiras:**
- Priorizar sempre o equivalente em português
- Permitido quando amplamente conhecido (`login`, `app`, `e-mail`, `site`, `design`) ou sem equivalente (`token`)
- Jargões técnicos em inglês não devem aparecer na comunicação com a pessoa usuária

---

### Numerais e formatos

| Item | Padrão em apps/sistemas |
|---|---|
| Números | Preferir algarismos — mais rápidos de ler e ocupam menos espaço |
| Datas | `DD/MM` — dois dígitos para dia e mês, sem nome do mês por extenso |
| Horários | `9h`, `18h` — sem espaço entre número e "h", sem zero à esquerda |
| Log de transação | `HH:MM:SS` com dois-pontos |
| Dinheiro | `R$ 1.200,53` — espaço entre símbolo e valor, vírgula para centavos |
| Telefones | Sem hífen — separar prefixo com espaço: `(11) 99999 9999` |

---

### Listas

- **Numerada**: quando a ordem importa (instruções, passo a passo)
- **Com marcadores**: quando a ordem não importa — usar dois-pontos antes da lista
- Cada item termina com ponto e vírgula; último item com ponto final
- Sempre que possível, usar listas: facilitam escaneabilidade em situações complexas

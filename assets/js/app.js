  // ============================================================================
  // LOGICA DO COMPORTAMENTO DO VISUALIZADOR DE DOCS
  // ============================================================================

  // Nome do projeto vindo de config.js (com fallback seguro)
  const APP_NAME = (globalThis.DOCS_CONFIG && DOCS_CONFIG.name) || "Docs";

  let currentFilePath = "";
  let inSearchMode = false;
  let openingResult = false;

  // Customização do marked para injetar tags customizadas para diagrama Mermaid e outros
  const renderer = new marked.Renderer();
  const originalCodeRenderer = renderer.code;
  
  renderer.code = function(code, language, escaped) {
    if (language === 'mermaid') {
      return `<div class="mermaid">${code}</div>`;
    }
    // Para blocos de código com linguagem normal, vamos renderizar normalmente
    return originalCodeRenderer.call(this, code, language, escaped);
  };
  
  // No Marked mais recente, podemos passar as opções no marked.parse ou setOptions
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: true,
    headerIds: true,
    mangle: false
  });

  // Inicializa o diagrama Mermaid
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    flowchart: { useMaxWidth: true, htmlLabels: true }
  });

  // Função para mudar o tema claro/escuro
  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('app-dark');
    localStorage.setItem('theme-pref', isDark ? 'dark' : 'light');
    
    // Atualiza tema do Mermaid e redesenha se houver algum exibido
    if (currentFilePath) {
      loadFile(currentFilePath, true);
    }
  }

  // Carregar preferência de tema ao iniciar
  const savedTheme = localStorage.getItem('theme-pref');
  if (savedTheme === 'dark' || (!savedTheme && globalThis.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('app-dark');
  }

  // Restaura a largura da sidebar definida pelo usuário (antes do render para evitar flash)
  const savedSidebarWidth = localStorage.getItem('sidebar-width');
  if (savedSidebarWidth) {
    document.documentElement.style.setProperty('--sidebar-width', savedSidebarWidth);
  }

  // Redimensionamento da sidebar via arraste da alça
  (function enableSidebarResize() {
    const resizer = document.getElementById('resizer');
    const MIN_WIDTH = 200;
    let isResizing = false;

    function onMouseMove(e) {
      if (!isResizing) return;
      const maxWidth = Math.min(640, globalThis.innerWidth * 0.6);
      const width = Math.max(MIN_WIDTH, Math.min(maxWidth, e.clientX));
      document.documentElement.style.setProperty('--sidebar-width', width + 'px');
    }

    function onMouseUp() {
      if (!isResizing) return;
      isResizing = false;
      resizer.classList.remove('is-dragging');
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      const width = document.documentElement.style.getPropertyValue('--sidebar-width');
      if (width) localStorage.setItem('sidebar-width', width);
    }

    resizer.addEventListener('mousedown', (e) => {
      isResizing = true;
      resizer.classList.add('is-dragging');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      e.preventDefault();
    });

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  })();

  // Abre/fecha sidebar no mobile
  function toggleSidebar(show) {
    const app = document.getElementById('app');
    if (show) {
      app.classList.add('is-menu-open');
    } else {
      app.classList.remove('is-menu-open');
    }
  }

  // Navega para um arquivo. Força o carregamento quando o hash já é o atual
  // (ex.: sair do modo pesquisa clicando no próprio doc/Home).
  function navigateTo(path) {
    toggleSidebar(false);
    if (globalThis.location.hash.substring(1) === path) {
      loadFile(path, true);
    } else {
      globalThis.location.hash = path;
    }
  }

  // Estrutura a lista de arquivos de tree.js em uma árvore dsc-tree aninhada
  function buildTree(files) {
    const root = { name: "Root", type: "dir", children: {}, path: "" };
    
    files.forEach(filePath => {
      const parts = filePath.split('/');
      let current = root;
      
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join('/');
        
        if (isLast) {
          current.children[part] = {
            name: part,
            type: "file",
            path: currentPath
          };
        } else {
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              type: "dir",
              children: {},
              path: currentPath
            };
          }
          current = current.children[part];
        }
      });
    });
    
    return root;
  }

  // Extrai um título legível do conteúdo Markdown (primeiro H1), sem prefixos como 'Domínio:', 'Feature Set:', 'Data Model:'
  function titleFromMarkdown(content) {
    const match = content.match(/^#\s+(.+)$/m);
    if (!match) return null;
    return match[1].replace(/^\s*(Domínio|Dominio|Feature Set|Data[\s-]Model)\s*[:\-—]*\s*/i, '').replace(/`/g, '').trim();
  }

  // Remove a extensão (.md, .html, .htm) para exibição
  function stripExt(name) {
    return name.replace(/\.(md|html?)$/i, '');
  }

  // Resolve o rótulo de exibição de uma pasta na árvore lateral:
  // 'modules' vira 'Documentação' e seus subdiretórios usam o título do README.
  const FOLDER_LABELS = {
    'global/data-models': 'Mapa de Entidades por Domínio',
    'engine/templates/global/data-models': 'Mapa de Entidades por Domínio',
  };

  function getFolderDisplayName(item) {
    if (item.path in FOLDER_LABELS) return FOLDER_LABELS[item.path];
    if (item.path === 'modules') return 'Documentação';

    if (item.path.startsWith('modules/') && typeof repoFilesContent !== 'undefined') {
      const readme = repoFilesContent[item.path + '/README.md'];
      if (readme) {
        const title = titleFromMarkdown(readme);
        if (title) return title;
      }
    }

    // Diretórios da raiz: exibe com a primeira letra maiúscula
    if (!item.path.includes('/')) {
      return item.name.charAt(0).toUpperCase() + item.name.slice(1);
    }

    return item.name;
  }

  // Pastas cujos arquivos .md devem ter o rótulo lido do primeiro H1 do conteúdo
  const TITLE_FROM_CONTENT_DIRS = [
    'global/data-models',
    'engine/templates/global/data-models',
  ];

  // Resolve o rótulo de um arquivo na árvore lateral.
  // Para arquivos de feature (3º nível de modules) e para arquivos dentro de
  // TITLE_FROM_CONTENT_DIRS, usa o título H1 do conteúdo Markdown.
  function getFileDisplayName(item) {
    if (typeof repoFilesContent !== 'undefined') {
      const parts = item.path.split('/');
      const parentPath = parts.slice(0, -1).join('/');

      const useTitleFromContent =
        (parts[0] === 'modules' && parts.length === 4) ||
        TITLE_FROM_CONTENT_DIRS.includes(parentPath);

      if (useTitleFromContent) {
        const content = repoFilesContent[item.path];
        if (content) {
          const title = titleFromMarkdown(content);
          if (title) return title;
        }
      }
    }

    return stripExt(item.name);
  }

  // Nome de exibição de um item da árvore (pasta ou arquivo)
  function getDisplayName(item) {
    return item.type === "dir" ? getFolderDisplayName(item) : getFileDisplayName(item);
  }

  // Localiza o arquivo de índice (INDEX.md ou README.md) dentro de uma pasta, se houver
  function findFolderIndexFile(dirNode) {
    const keys = Object.keys(dirNode.children);
    const pick = (name) => keys.find(k => k.toLowerCase() === name);
    const key = pick('index.md') || pick('readme.md');
    const child = key ? dirNode.children[key] : null;
    return child && child.type === 'file' ? child : null;
  }

  // Renderiza recursivamente o HTML da árvore de diretórios
  function renderTreeHTML(node, filterActive = false, isRoot = false) {
    let html = "";
    // Arquivo de índice da pasta: ocultado da listagem, pois a pasta o exibe ao ser clicada (mantido na busca)
    const indexFile = filterActive ? null : findFolderIndexFile(node);
    const childrenKeys = Object.keys(node.children).sort((a, b) => {
      const itemA = node.children[a];
      const itemB = node.children[b];
      // Pastas primeiro, depois arquivos
      if (itemA.type !== itemB.type) {
        return itemA.type === "dir" ? -1 : 1;
      }
      // Ordem alfabética pelo nome exibido (sem diferenciar acento/maiúsculas)
      return getDisplayName(itemA).localeCompare(getDisplayName(itemB), 'pt', { sensitivity: 'base' });
    });

    childrenKeys.forEach(key => {
      const item = node.children[key];
      // Oculta arquivos soltos na raiz do repositório (ex.: README.md, N0_PRODUCT_VISION.md)
      if (isRoot && item.type === "file") return;
      // Oculta o diretório 'engine' (ferramental interno) do menu
      if (item.path === "engine") return;
      // Oculta o INDEX/README da própria pasta (acessível ao clicar nela)
      if (item === indexFile) return;
      if (item.type === "dir") {
        // Se a busca estiver ativa, deixamos as pastas abertas ('open') para exibir os resultados
        const isOpen = filterActive ? "open" : "";
        // Se a pasta tiver INDEX/README, clicar nela exibe esse arquivo
        const indexFile = findFolderIndexFile(item);
        const indexAttr = indexFile ? ` data-index-path="${indexFile.path}"` : "";
        const folderActive = indexFile && indexFile.path === currentFilePath ? " is-active" : "";
        html += `
          <details class="dsc-tree-folder" data-path="${item.path}" ${isOpen}>
            <summary class="dsc-tree-folder-title${folderActive}"${indexAttr}>
              <svg class="dsc-icon-folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>${getFolderDisplayName(item)}</span>
            </summary>
            <div class="dsc-tree-folder-content">
              ${renderTreeHTML(item, filterActive)}
            </div>
          </details>
        `;
      } else {
        const fileTitle = getFileDisplayName(item);
        const isActive = item.path === currentFilePath ? "is-active" : "";
        const isHtml = /\.html?$/i.test(item.path);
        const icon = isHtml
          ? `<svg class="dsc-icon-file" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`
          : `<svg class="dsc-icon-file" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
        html += `
          <a class="dsc-tree-file ${isActive}" href="#${item.path}" data-path="${item.path}">
            ${icon}
            <span>${fileTitle}</span>
          </a>
        `;
      }
    });
    
    return html || `<div style="padding: 8px 12px; font-size:12px; color:var(--text-muted)">Sem arquivos markdown.</div>`;
  }

  // Escapa HTML para inserir com segurança texto vindo dos arquivos
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Escapa o texto e destaca (mark) as ocorrências do termo
  function highlightTerm(text, term) {
    const escaped = escapeHtml(text);
    if (!term) return escaped;
    const re = new RegExp(escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return escaped.replace(re, m => `<mark>${m}</mark>`);
  }

  // Monta um trecho do conteúdo ao redor da primeira ocorrência do termo
  function buildSnippet(content, lowerTerm, term) {
    const idx = content.toLowerCase().indexOf(lowerTerm);
    if (idx === -1) return '';
    const start = Math.max(0, idx - 50);
    const end = Math.min(content.length, idx + lowerTerm.length + 90);
    const raw = content.slice(start, end).replace(/\s+/g, ' ').trim();
    return (start > 0 ? '… ' : '') + highlightTerm(raw, term) + (end < content.length ? ' …' : '');
  }

  // Botão "voltar aos resultados" (reaproveitado por docs Markdown e protótipos)
  function backToResultsHtml(term) {
    return `
      <button type="button" class="dsc-search-back" onclick="handleSearch()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Voltar aos resultados de "${escapeHtml(term)}"</span>
      </button>
    `;
  }

  // Pesquisa: exibe os resultados na área de conteúdo, sem alterar o menu lateral
  function handleSearch() {
    const term = document.getElementById('searchInput').value.trim();

    if (!term) {
      // Sai do modo pesquisa e restaura o documento atual
      if (currentFilePath) loadFile(currentFilePath, true);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const results = repoFiles.filter(path => {
      const parts = path.split('/');
      const filename = parts[parts.length - 1].replace(/\.md$/i, '').toLowerCase();
      const folderPath = parts.slice(0, -1).join('/').toLowerCase();
      const content = (typeof repoFilesContent !== 'undefined') ? repoFilesContent[path] : undefined;

      return filename.includes(lowerTerm) || folderPath.includes(lowerTerm)
        || (content !== undefined && content.toLowerCase().includes(lowerTerm));
    });

    renderSearchResults(term, lowerTerm, results);
  }

  // Renderiza a lista de resultados na área de conteúdo
  function renderSearchResults(term, lowerTerm, results) {
    inSearchMode = true;

    globalThis.document.title = `Pesquisa: ${term} — Documentação ${APP_NAME}`;
    document.getElementById('breadcrumb').innerHTML =
      '<li class="dsc-breadcrumb-item">Documentação</li><li class="dsc-breadcrumb-item">Pesquisa</li>';

    const contentDiv = document.getElementById('markdownContent');

    if (results.length === 0) {
      contentDiv.innerHTML = `
        <div class="dsc-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h2 class="dsc-title-sm">Nenhum resultado</h2>
          <p class="dsc-body-sm">Nada encontrado para <strong>"${escapeHtml(term)}"</strong>.</p>
        </div>
      `;
      return;
    }

    const itemsHtml = results.map(path => {
      const content = (typeof repoFilesContent !== 'undefined') ? repoFilesContent[path] : undefined;
      const fallback = stripExt(path.split('/').pop());
      const title = (content && titleFromMarkdown(content)) || fallback;
      const snippet = content ? buildSnippet(content, lowerTerm, term) : '';
      return `
        <a class="dsc-search-result" href="#${path}" data-path="${path}">
          <div class="dsc-search-result-title">${highlightTerm(title, term)}</div>
          <div class="dsc-search-result-path">${escapeHtml(path)}</div>
          ${snippet ? `<div class="dsc-search-result-snippet">${snippet}</div>` : ''}
        </a>
      `;
    }).join('');

    contentDiv.innerHTML = `
      <div class="dsc-search-results">
        <p class="dsc-search-results-count">${results.length} resultado(s) para "${escapeHtml(term)}"</p>
        ${itemsHtml}
      </div>
    `;

    // Ao escolher um resultado, abre o doc mantendo o termo (permite voltar aos resultados)
    contentDiv.querySelectorAll('.dsc-search-result').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        openingResult = true;
        navigateTo(this.dataset.path);
      });
    });
  }

  // Marca um único item da árvore (arquivo ou pasta) como selecionado
  function setActiveTreeItem(el) {
    document.querySelectorAll('.dsc-sidebar .is-active').forEach(a => a.classList.remove('is-active'));
    if (el) el.classList.add('is-active');
  }

  // Renderiza a navegação inicial
  function renderNavigationTree(filesList, filterActive) {
    const treeData = buildTree(filesList);
    const nav = document.getElementById('treeNav');
    nav.innerHTML = renderTreeHTML(treeData, filterActive, true);
    
    // Vincular os cliques nos links gerados dinamicamente
    nav.querySelectorAll('.dsc-tree-file').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        navigateTo(this.dataset.path);
      });
    });

    // Clicar numa pasta: com INDEX/README exibe esse arquivo; sem índice apenas seleciona (destaca)
    nav.querySelectorAll('.dsc-tree-folder-title').forEach(el => {
      el.addEventListener('click', function(e) {
        const target = this.dataset.indexPath;
        if (target) {
          e.preventDefault();
          const details = this.parentElement;
          if (globalThis.location.hash.substring(1) === target) {
            if (inSearchMode) {
              // Em pesquisa: sai dos resultados e exibe o doc da pasta
              loadFile(target, true);
            } else {
              // Doc já exibido: alterna expandir/recolher
              details.open = !details.open;
            }
          } else {
            // Exibe o doc e garante a pasta expandida (loadFile aplica o destaque)
            details.open = true;
            globalThis.location.hash = target;
          }
        } else {
          // Pasta sem índice: apenas marca como selecionada (expande/recolhe nativamente)
          setActiveTreeItem(this);
        }
      });
    });
  }

  // Reconstrói e exibe o breadcrumb de forma intuitiva
  function updateBreadcrumb(path) {
    const bc = document.getElementById('breadcrumb');
    bc.innerHTML = '<li class="dsc-breadcrumb-item">Documentação</li>';
    
    if (!path) return;
    
    const parts = path.split('/');
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const cleanName = isLast ? stripExt(part) : part;
      
      const li = document.createElement('li');
      li.className = 'dsc-breadcrumb-item';
      li.innerText = cleanName;
      bc.appendChild(li);
    });
  }

  // Exibe um protótipo HTML em um iframe (preserva seus próprios estilos e caminhos relativos)
  function renderPrototype(path, fromSearch) {
    const contentDiv = document.getElementById('markdownContent');
    const searchEl = document.getElementById('searchInput');
    const term = searchEl ? searchEl.value.trim() : '';
    const backBar = (fromSearch && term) ? backToResultsHtml(term) : '';
    contentDiv.innerHTML = backBar + `
      <div class="dsc-proto-toolbar">
        <span class="dsc-badge-path">${path}</span>
        <a class="dsc-proto-open" href="${path}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          <span>Abrir em nova aba</span>
        </a>
      </div>
      <iframe class="dsc-proto-frame" src="${path}" title="Protótipo: ${escapeHtml(path)}"></iframe>
    `;
  }

  // Faz o fetch do arquivo Markdown e renderiza na tela
  async function loadFile(path, forceRerender = false) {
    if (!path) return;
    
    // Evita recarregar se for o mesmo arquivo e não for pedido rerender
    if (currentFilePath === path && !forceRerender) return;

    // Abrir um documento encerra a lista de resultados. Se veio de um resultado,
    // mantém o termo para permitir "voltar aos resultados"; caso contrário, limpa a busca.
    const fromSearch = openingResult;
    openingResult = false;
    const searchEl = document.getElementById('searchInput');
    if (!fromSearch && searchEl) searchEl.value = '';
    inSearchMode = false;

    currentFilePath = path;

    // Atualiza a seleção no menu lateral: limpa tudo e marca o arquivo atual
    // e a pasta cujo índice (INDEX/README) está sendo exibido
    document.querySelectorAll('.dsc-sidebar .is-active').forEach(el => el.classList.remove('is-active'));
    document.querySelectorAll('.dsc-tree-file').forEach(el => {
      if (el.dataset.path === path) el.classList.add('is-active');
    });
    document.querySelectorAll('.dsc-tree-folder-title[data-index-path]').forEach(el => {
      if (el.dataset.indexPath === path) el.classList.add('is-active');
    });

    const contentDiv = document.getElementById('markdownContent');
    
    // Nome limpo para o título da aba do navegador
    const parts = path.split('/');
    const cleanTitle = stripExt(parts[parts.length - 1]);
    globalThis.document.title = `${cleanTitle} — Documentação ${APP_NAME}`;
    
    updateBreadcrumb(path);

    // Protótipos HTML: exibidos em iframe (não renderizados como Markdown)
    if (/\.html?$/i.test(path)) {
      renderPrototype(path, fromSearch);
      return;
    }

    // Adiciona loader na tela de leitura
    contentDiv.innerHTML = `
      <div class="dsc-loader">
        <div class="dsc-spinner"></div>
        <p class="dsc-body-sm dsc-text-muted">Carregando conteúdo de [${cleanTitle}]...</p>
      </div>
    `;
    
    try {
      let mdText = "";
      
      // Tenta obter o conteúdo embutido no tree.js (resolve CORS no file://)
      if (typeof repoFilesContent !== 'undefined' && repoFilesContent[path] !== undefined) {
        mdText = repoFilesContent[path];
      } else {
        // Fallback de requisição de rede
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }
        mdText = await response.text();
      }
      
      // Renderiza Markdown
      const htmlText = marked.parse(mdText);

      // Barra "voltar aos resultados" quando o doc foi aberto a partir da pesquisa
      const term = searchEl ? searchEl.value.trim() : '';
      const backBar = (fromSearch && term) ? backToResultsHtml(term) : '';

      // Renderiza o HTML do Markdown (o caminho já aparece no breadcrumb)
      contentDiv.innerHTML = backBar + `
        <div class="dsc-markdown-body-rendered">
          ${htmlText}
        </div>
      `;
      
      // Marca células <td> cujo único conteúdo é <code> (sem texto fora do elemento) para remover estilo badge
      contentDiv.querySelectorAll('.dsc-markdown-body-rendered td').forEach(td => {
        let hasOutsideText = false;
        for (const node of td.childNodes) {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            hasOutsideText = true;
            break;
          }
        }
        if (!hasOutsideText && td.querySelector('code')) {
          td.classList.add('td-code-only');
        }
      });

      // Pré-processamento robusto de blocos Mermaid gerados pelo interpretador Markdown (evita falhas de versão do marked)
      contentDiv.querySelectorAll('pre code.language-mermaid, pre code.mermaid, code.language-mermaid').forEach(el => {
        const parent = el.closest('pre');
        const codeText = el.textContent || el.innerText;
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.textContent = codeText;
        if (parent) {
          parent.parentNode.replaceChild(div, parent);
        } else {
          el.parentNode.replaceChild(div, el);
        }
      });
      
      // Renderizar Mermaid se houver diagramas na tela
      if (mdText.includes('```mermaid') || mdText.includes('class="mermaid"')) {
        try {
          // No Mermaid moderno, a chamada para renderizar os elementos do DOM é assíncrona
          await mermaid.run({
            nodes: document.querySelectorAll('.mermaid')
          });
        } catch (mermaidError) {
          console.error("Erro ao inicializar diagrama Mermaid:", mermaidError);
        }
      }
      
      // Faz scroll do contêiner de exibição de volta para o topo ao carregar o arquivo
      document.querySelector('.dsc-main-content-scroll').scrollTop = 0;
      
    } catch (err) {
      console.error("Erro ao carregar o arquivo markdown:", err);
      contentDiv.innerHTML = `
        <div class="dsc-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--dsc-color-negative-90)">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 class="dsc-title-sm dsc-text-negative" style="color: var(--dsc-color-negative-90) !important;">Erro ao abrir arquivo</h2>
          <p class="dsc-body-sm">Não foi possível carregar o arquivo em <strong>${path}</strong>.</p>
          <p class="dsc-caption dsc-text-muted" style="margin-top:12px;">Detalhes: ${err.message}</p>
        </div>
      `;
    }
  }

  // Resolve caminhos relativos de forma simples e limpa preservando navegação
  function resolveRelativePath(currentFile, relPath) {
    if (relPath.startsWith('/')) {
      return relPath.substring(1);
    }
    
    const currentDir = currentFile.substring(0, currentFile.lastIndexOf('/'));
    if (!currentDir) return relPath;
    
    const joinedPath = currentDir + '/' + relPath;
    const parts = joinedPath.split('/');
    const resolved = [];
    
    for (const part of parts) {
      if (part === '.' || part === '') continue;
      if (part === '..') {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    }
    
    return resolved.join('/');
  }

  // Gerencia cliques nos links internos do Markdown renderizado para permitir navegação SPA fluida
  document.getElementById('markdownContent').addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (!link) return;
    
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Ignora links absolutos e hashes normais do mesmo arquivo
    if (!href.startsWith('http') && !href.startsWith('https') && !href.startsWith('#')) {
      // Se terminar com .md, faremos a navegação interna de forma automática
      if (href.toLowerCase().endsWith('.md')) {
        e.preventDefault();
        const targetPath = resolveRelativePath(currentFilePath, href);
        globalThis.location.hash = targetPath;
      }
    }
  });

  // Escuta mudanças de hash e carrega o arquivo correto
  function handleHashRoute() {
    const hash = globalThis.location.hash.substring(1); // remove o '#' do início
    if (hash && repoFiles.includes(hash)) {
      loadFile(hash);
      
      // Abre todos os details pai daquele arquivo ativo na árvore para destacar onde ele está situado!
      openParentFolders(hash);
    } else if (repoFiles.includes("README.md")) {
      globalThis.location.hash = "README.md";
    } else if (repoFiles.length > 0) {
      globalThis.location.hash = repoFiles[0];
    }
  }

  // Abre recursivamente as pastas pai na listagem do menu para mostrar o arquivo ativo
  function openParentFolders(filePath) {
    const parts = filePath.split('/');
    if (parts.length <= 1) return;
    
    // Vai abrindo cada subnível progressivamente
    let buildingPath = "";
    for (let i = 0; i < parts.length - 1; i++) {
      buildingPath += (buildingPath ? "/" : "") + parts[i];
      const detailsEl = document.querySelector(`.dsc-tree-folder[data-path="${buildingPath}"]`);
      if (detailsEl) {
        detailsEl.setAttribute('open', '');
      }
    }
  }

  // Inicialização Geral da SPA
  globalThis.addEventListener('DOMContentLoaded', () => {
    // Aplica o nome do projeto (config.js) na marca do header e no título da aba
    document.title = `Documentação ${APP_NAME} — CAIXA`;
    const brand = document.getElementById('brandName');
    if (brand) brand.textContent = `${APP_NAME} Docs`;

    // Carrega a listagem de navegação na sidebar
    if (typeof repoFiles !== 'undefined' && Array.isArray(repoFiles)) {
      renderNavigationTree(repoFiles, false);
      handleHashRoute();
    } else {
      document.getElementById('treeNav').innerHTML = `
        <div class="dsc-text-negative" style="padding:12px; font-size:13px;">
          Erro: A variável 'repoFiles' não foi encontrada. Certifique-se de que o arquivo 'tree.js' foi gerado corretamente.
        </div>
      `;
    }
  });

  // Escuta rota de hash no browser para navegação fluida de histórico (Voltar / Avançar)
  globalThis.addEventListener('hashchange', handleHashRoute);

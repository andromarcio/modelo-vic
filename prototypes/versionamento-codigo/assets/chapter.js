/* ============================================================================
   Modelo VIC — Versionamento e Integração de Código.
   Chrome compartilhado do protótipo (layout em coluna única, navegação superior
   estilo hub do SharePoint). Cada página HTML contém apenas
   <article id="doc" data-page-id="...">…</article>; este script monta header,
   navegação superior, breadcrumb, rodapé prev/próxima, tema claro/escuro,
   favicon e o toggle de mapeamento de web parts do SharePoint.
   Funciona via file:// (sem fetch, sem build).
   ============================================================================ */
(function () {
  "use strict";

  var CHAPTER = {
    eyebrow: "Modelo VIC",
    title: "Versionamento e Integração de Código",
    nav: [
      { id: "index",    href: "index.html",                 label: "Visão Geral" },
      { id: "diretrizes", href: "diretrizes.html",              label: "Diretrizes" },
      { id: "triade",   href: "triade-tecnica.html",        label: "Tríade Técnica" },
      { id: "analise",  href: "analise-acompanhamento.html",label: "Análise e Acompanhamento" },
      { id: "implantacao", href: "implantacao.html",         label: "Implantação" }
    ],
    diretrizes: [
      { num: "1",  id: "diretriz-1",  href: "diretriz-1.html",  nav: "Versões testadas e validadas para produção" },
      { num: "2",  id: "diretriz-2",  href: "diretriz-2.html",  nav: "Modelo de flow (GitFlow / GitHub Flow)" },
      { num: "3",  id: "diretriz-3",  href: "diretriz-3.html",  nav: "Integração contínua e sanitização" },
      { num: "4",  id: "diretriz-4",  href: "diretriz-4.html",  nav: "Baixa divergência entre branches" },
      { num: "5",  id: "diretriz-5",  href: "diretriz-5.html",  nav: "Sincronização ao final do ciclo" },
      { num: "6",  id: "diretriz-6",  href: "diretriz-6.html",  nav: "Atuação efetiva do Integrador" },
      { num: "7",  id: "diretriz-7",  href: "diretriz-7.html",  nav: "Branches permanentes protegidas" },
      { num: "8",  id: "diretriz-8",  href: "diretriz-8.html",  nav: "Pull Request como instrumento central" },
      { num: "9",  id: "diretriz-9",  href: "diretriz-9.html",  nav: "Versionamento semântico (SemVer)" },
      { num: "10", id: "diretriz-10", href: "diretriz-10.html", nav: "Tagueamento de produção (VEC)" },
      { num: "11", id: "diretriz-11", href: "diretriz-11.html", nav: "Padrões de nomenclatura" },
      { num: "12", id: "diretriz-12", href: "diretriz-12.html", nav: "Políticas de push" },
      { num: "13", id: "diretriz-13", href: "diretriz-13.html", nav: "Nota de versão (changelog)" }
    ]
  };

  var BRAND_ICON =
    '<svg viewBox="6 6 108 108" width="40" height="40" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="hvg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00437a"/><stop offset="1" stop-color="#0a78d6"/></linearGradient>' +
        '<linearGradient id="hvs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '</defs>' +
      '<rect x="6" y="6" width="108" height="108" rx="27" fill="url(#hvg)"/>' +
      '<rect x="6" y="6" width="108" height="108" rx="27" fill="url(#hvs)"/>' +
      '<g fill="none" stroke="#fff" stroke-width="6.5" stroke-linecap="round">' +
        '<path d="M39 36 C39 56, 60 52, 60 66"/><path d="M81 36 C81 56, 60 52, 60 66"/><path d="M60 66 V76"/>' +
      '</g>' +
      '<circle cx="39" cy="36" r="8.5" fill="#f39200"/>' +
      '<circle cx="81" cy="36" r="8.5" fill="#36e0c4"/>' +
      '<circle cx="60" cy="66" r="7.5" fill="#00437a" stroke="#fff" stroke-width="3"/>' +
      '<path d="M60 76 L45 84 V100 a5 5 0 0 0 5 5 H70 a5 5 0 0 0 5 -5 V84 Z" fill="#f39200"/>' +
      '<circle cx="60" cy="91" r="3.4" fill="#fff"/>' +
    '</svg>';

  var ICON = {
    moon:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sun:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    layout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>'
  };

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function findPage(id) {
    var i;
    for (i = 0; i < CHAPTER.nav.length; i++) if (CHAPTER.nav[i].id === id) return { kind: "nav", i: i, page: CHAPTER.nav[i] };
    for (i = 0; i < CHAPTER.diretrizes.length; i++) if (CHAPTER.diretrizes[i].id === id) return { kind: "diretriz", i: i, page: CHAPTER.diretrizes[i] };
    return { kind: "nav", i: 0, page: CHAPTER.nav[0] };
  }

  document.addEventListener("DOMContentLoaded", function () {
    var doc = document.getElementById("doc");
    if (!doc) return;

    var fav = document.createElement("link");
    fav.rel = "icon"; fav.type = "image/svg+xml"; fav.href = "assets/brand/vic-icon.svg";
    document.head.appendChild(fav);

    var cur = findPage(doc.getAttribute("data-page-id"));
    var activeNav = cur.kind === "diretriz" ? "diretrizes" : cur.page.id;

    /* ---------- HEADER ---------- */
    var header = el(
      '<header class="app-header">' +
        '<a class="brand" href="index.html" aria-label="Início do modelo">' +
          '<span class="brand-mark">' + BRAND_ICON + '</span>' +
          '<span class="brand-text">' +
            '<span class="eyebrow">' + CHAPTER.eyebrow + '</span>' +
            '<span class="title">' + CHAPTER.title + '</span>' +
          '</span>' +
        '</a>' +
        '<span class="spacer"></span>' +
        '<div class="actions">' +
          '<button class="h-btn" id="spToggle" title="Destacar quais web parts do SharePoint montam cada bloco">' +
            ICON.layout + '<span class="label-long">Mapa SharePoint</span></button>' +
          '<button class="h-btn h-btn--icon" id="themeToggle" title="Alternar tema claro/escuro" aria-label="Alternar tema"></button>' +
        '</div>' +
      '</header>'
    );

    /* ---------- NAV SUPERIOR ---------- */
    var navItems = CHAPTER.nav.map(function (p) {
      var active = p.id === activeNav ? " is-active" : "";
      return '<a href="' + p.href + '" class="' + active.trim() + '">' + p.label + '</a>';
    }).join("");
    var topnav = el('<nav class="topnav" aria-label="Navegação do modelo"><div class="topnav-inner">' + navItems + '</div></nav>');

    /* ---------- MAIN ---------- */
    var main = el('<main class="main"><div class="content" id="content"></div></main>');
    var content = main.querySelector("#content");

    /* breadcrumb */
    var crumbHtml = '<a href="index.html">VIC</a>';
    if (cur.kind === "diretriz") {
      crumbHtml += '<span class="sep">/</span><a href="diretrizes.html">Diretrizes</a>' +
                   '<span class="sep">/</span><span class="current">Diretriz ' + cur.page.num + '</span>';
    } else if (cur.page.id !== "index") {
      crumbHtml += '<span class="sep">/</span><span class="current">' + cur.page.label + '</span>';
    } else {
      crumbHtml = '<span class="current">Visão Geral</span>';
    }
    var crumb = el('<nav class="breadcrumb" aria-label="Trilha">' + crumbHtml + '</nav>');

    doc.parentNode.removeChild(doc);
    content.appendChild(crumb);
    content.appendChild(doc);

    /* rodapé prev/próxima — apenas entre diretrizes */
    if (cur.kind === "diretriz") {
      var prev = CHAPTER.diretrizes[cur.i - 1];
      var next = CHAPTER.diretrizes[cur.i + 1];
      var pnav = el('<nav class="page-nav" aria-label="Navegação entre diretrizes"></nav>');
      pnav.appendChild(el(prev
        ? '<a class="prev" href="' + prev.href + '"><span class="pn-dir">‹ Anterior</span>' +
          '<span class="pn-title">Diretriz ' + prev.num + ' · ' + prev.nav + '</span></a>'
        : '<a class="prev" href="diretrizes.html"><span class="pn-dir">‹ Voltar</span>' +
          '<span class="pn-title">Diretrizes</span></a>'));
      pnav.appendChild(el(next
        ? '<a class="next" href="' + next.href + '"><span class="pn-dir">Próxima ›</span>' +
          '<span class="pn-title">Diretriz ' + next.num + ' · ' + next.nav + '</span></a>'
        : '<a class="next empty" href="#"></a>'));
      content.appendChild(pnav);
    }

    document.body.appendChild(header);
    document.body.appendChild(topnav);
    document.body.appendChild(main);

    /* ---------- COMPORTAMENTOS ---------- */
    var root = document.documentElement;
    var themeBtn = header.querySelector("#themeToggle");
    function applyTheme(mode) {
      if (mode === "dark") { root.classList.add("app-dark"); themeBtn.innerHTML = ICON.sun; }
      else { root.classList.remove("app-dark"); themeBtn.innerHTML = ICON.moon; }
    }
    var savedTheme = null;
    try { savedTheme = localStorage.getItem("vc-theme"); } catch (e) {}
    applyTheme(savedTheme === "dark" || /[?&]theme=dark\b/.test(location.search) ? "dark" : "light");
    themeBtn.addEventListener("click", function () {
      var dark = !root.classList.contains("app-dark");
      applyTheme(dark ? "dark" : "light");
      try { localStorage.setItem("vc-theme", dark ? "dark" : "light"); } catch (e) {}
    });

    var spBtn = header.querySelector("#spToggle");
    function applySp(on) { document.body.classList.toggle("show-sp", on); spBtn.classList.toggle("is-on", on); }
    var savedSp = null;
    try { savedSp = localStorage.getItem("vc-sp"); } catch (e) {}
    applySp(savedSp === "1" || /[?&]sp=1\b/.test(location.search));
    spBtn.addEventListener("click", function () {
      var on = !document.body.classList.contains("show-sp");
      applySp(on);
      try { localStorage.setItem("vc-sp", on ? "1" : "0"); } catch (e) {}
    });

    var at = topnav.querySelector("a.is-active");
    if (at && at.scrollIntoView) { try { at.scrollIntoView({ inline: "center", block: "nearest" }); } catch (e) {} }

    var t = cur.kind === "diretriz" ? "Diretriz " + cur.page.num + " · " + cur.page.nav : cur.page.label;
    document.title = t + " · VIC";
  });
})();

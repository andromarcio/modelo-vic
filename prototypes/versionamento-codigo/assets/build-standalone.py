# Gera "versionamento-codigo-standalone.html": um único arquivo HTML
# autossuficiente (CSS, JS e ilustracoes SVG embutidos em base64) com todas as
# paginas do Modelo VIC navegaveis por ancora (#index, #praticas, #pratica-1 ...).
# Ideal para abrir no celular/offline sem descompactar.
# Uso (a partir desta pasta):  python3 assets/build-standalone.py
import re, base64, os

BASE = "."
CSS = open(os.path.join(BASE, "assets/chapter.css"), encoding="utf-8").read()

NAV = [
    ("index",    "index.html",                  "Visão Geral"),
    ("praticas", "praticas.html",               "Práticas Desejadas"),
    ("triade",   "triade-tecnica.html",         "Tríade Técnica"),
    ("analise",  "analise-acompanhamento.html", "Análise e Acompanhamento"),
]
PRATICAS = [
    ("1",  "pratica-1",  "pratica-1.html",  "Versões testadas e validadas para produção"),
    ("2",  "pratica-2",  "pratica-2.html",  "Modelo de flow (GitFlow / GitHub Flow)"),
    ("3",  "pratica-3",  "pratica-3.html",  "Integração contínua e sanitização"),
    ("4",  "pratica-4",  "pratica-4.html",  "Baixa divergência entre branches"),
    ("5",  "pratica-5",  "pratica-5.html",  "Sincronização ao final do ciclo"),
    ("6",  "pratica-6",  "pratica-6.html",  "Atuação efetiva do Integrador"),
    ("7",  "pratica-7",  "pratica-7.html",  "Branches permanentes protegidas"),
    ("8",  "pratica-8",  "pratica-8.html",  "Pull Request como instrumento central"),
    ("9",  "pratica-9",  "pratica-9.html",  "Versionamento semântico (SemVer)"),
    ("10", "pratica-10", "pratica-10.html", "Tagueamento de produção (VEC)"),
    ("11", "pratica-11", "pratica-11.html", "Padrões de nomenclatura"),
    ("12", "pratica-12", "pratica-12.html", "Políticas de push"),
    ("13", "pratica-13", "pratica-13.html", "Nota de versão (changelog)"),
]

ORDER = ["index.html", "praticas.html"] + [p[2] for p in PRATICAS] + ["triade-tecnica.html", "analise-acompanhamento.html"]
HREF2ID = {"index.html": "index", "praticas.html": "praticas", "triade-tecnica.html": "triade", "analise-acompanhamento.html": "analise"}
for num, pid, pfile, plabel in PRATICAS:
    HREF2ID[pfile] = pid

def inline_svgs(html):
    def repl(m):
        data = open(os.path.join(BASE, m.group(1)), "rb").read()
        return 'src="data:image/svg+xml;base64,%s"' % base64.b64encode(data).decode("ascii")
    return re.sub(r'src="(assets/img/[^"]+\.svg)"', repl, html)

def linkify(html):
    for fname, pid in HREF2ID.items():
        html = html.replace('href="%s"' % fname, 'href="#%s"' % pid)
    return html

articles = []
for fname in ORDER:
    raw = open(os.path.join(BASE, fname), encoding="utf-8").read()
    art = re.search(r'(<article id="doc".*?</article>)', raw, re.S).group(1)
    art = linkify(inline_svgs(art)).replace('<article id="doc"', '<article class="vc-page"', 1)
    articles.append(art)

tabs_html = "\n        ".join('<a href="#%s" data-page="%s">%s</a>' % (nid, nid, label) for nid, _, label in NAV)
NAV_JS  = ",".join('{id:"%s",label:"%s"}' % (nid, label) for nid, _, label in NAV)
PRAT_JS = ",".join('{num:"%s",id:"%s",nav:"%s"}' % (num, pid, plabel) for num, pid, _, plabel in PRATICAS)

ICON_BRAND = ('<svg viewBox="6 6 108 108" width="40" height="40" aria-hidden="true">'
  '<defs><linearGradient id="hvg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00437a"/><stop offset="1" stop-color="#0a78d6"/></linearGradient>'
  '<linearGradient id="hvs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'
  '<rect x="6" y="6" width="108" height="108" rx="27" fill="url(#hvg)"/><rect x="6" y="6" width="108" height="108" rx="27" fill="url(#hvs)"/>'
  '<g fill="none" stroke="#fff" stroke-width="6.5" stroke-linecap="round"><path d="M39 36 C39 56, 60 52, 60 66"/><path d="M81 36 C81 56, 60 52, 60 66"/><path d="M60 66 V76"/></g>'
  '<circle cx="39" cy="36" r="8.5" fill="#f39200"/><circle cx="81" cy="36" r="8.5" fill="#36e0c4"/>'
  '<circle cx="60" cy="66" r="7.5" fill="#00437a" stroke="#fff" stroke-width="3"/>'
  '<path d="M60 76 L45 84 V100 a5 5 0 0 0 5 5 H70 a5 5 0 0 0 5 -5 V84 Z" fill="#f39200"/><circle cx="60" cy="91" r="3.4" fill="#fff"/></svg>')
ICON_LAYOUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>'

EXTRA_CSS = """
/* --- single-file SPA --- */
.vc-page { display:none; }
.vc-page.is-active { display:block; animation: vcfade .18s ease; }
@keyframes vcfade { from{opacity:0; transform:translateY(4px);} to{opacity:1;transform:none;} }
"""

SCRIPT = """
(function(){
  "use strict";
  var NAV=[%s], PRAT=[%s];
  var root=document.documentElement, body=document.body;
  var arts=[].slice.call(document.querySelectorAll('.vc-page'));
  var tabs=[].slice.call(document.querySelectorAll('.topnav a'));
  var crumb=document.getElementById('crumb');
  var pnav=document.getElementById('pnav');

  function meta(id){
    var i;
    for(i=0;i<NAV.length;i++) if(NAV[i].id===id) return {kind:'nav', label:NAV[i].label, id:id};
    for(i=0;i<PRAT.length;i++) if(PRAT[i].id===id) return {kind:'pratica', i:i, p:PRAT[i]};
    return {kind:'nav', label:NAV[0].label, id:'index'};
  }
  function idxFromHash(){
    var h=(location.hash||'').replace('#','');
    for(var i=0;i<arts.length;i++) if(arts[i].getAttribute('data-page-id')===h) return h;
    return 'index';
  }
  function show(id){
    var m=meta(id);
    arts.forEach(function(a){ a.classList.toggle('is-active', a.getAttribute('data-page-id')===id); });
    var activeNav = m.kind==='pratica' ? 'praticas' : id;
    tabs.forEach(function(t){ t.classList.toggle('is-active', t.getAttribute('data-page')===activeNav); });

    if(m.kind==='pratica'){
      crumb.innerHTML='<a href="#index">VIC</a><span class="sep">/</span><a href="#praticas">Práticas Desejadas</a><span class="sep">/</span><span class="current">Prática '+m.p.num+'</span>';
    } else if(id==='index'){
      crumb.innerHTML='<span class="current">Visão Geral</span>';
    } else {
      crumb.innerHTML='<a href="#index">VIC</a><span class="sep">/</span><span class="current">'+m.label+'</span>';
    }

    pnav.innerHTML='';
    if(m.kind==='pratica'){
      var prev=PRAT[m.i-1], next=PRAT[m.i+1];
      pnav.innerHTML =
        (prev?'<a class="prev" href="#'+prev.id+'"><span class="pn-dir">‹ Anterior</span><span class="pn-title">Prática '+prev.num+' · '+prev.nav+'</span></a>'
             :'<a class="prev" href="#praticas"><span class="pn-dir">‹ Voltar</span><span class="pn-title">Práticas Desejadas</span></a>')+
        (next?'<a class="next" href="#'+next.id+'"><span class="pn-dir">Próxima ›</span><span class="pn-title">Prática '+next.num+' · '+next.nav+'</span></a>'
             :'<a class="next empty" href="#"></a>');
    }
    var t = m.kind==='pratica' ? 'Prática '+m.p.num+' · '+m.p.nav : m.label;
    document.title=t+' · VIC';
    var at=tabs.filter(function(x){return x.getAttribute('data-page')===activeNav;})[0];
    if(at&&at.scrollIntoView){ try{at.scrollIntoView({inline:'center',block:'nearest'});}catch(e){} }
  }
  function go(id){ if(location.hash!=='#'+id){ location.hash='#'+id; } else { show(id); } window.scrollTo(0,0); }

  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#"]'); if(!a) return;
    var id=a.getAttribute('href').slice(1); if(!id) return;
    for(var i=0;i<arts.length;i++){ if(arts[i].getAttribute('data-page-id')===id){ e.preventDefault(); go(id); return; } }
  });
  window.addEventListener('hashchange',function(){ show(idxFromHash()); window.scrollTo(0,0); });

  var themeBtn=document.getElementById('themeToggle');
  var SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  function applyTheme(d){ root.classList.toggle('app-dark',d); themeBtn.innerHTML=d?SUN:MOON; }
  var st=null; try{st=localStorage.getItem('vc-theme');}catch(e){}
  applyTheme(st==='dark' || /[?&]theme=dark\\b/.test(location.search));
  themeBtn.addEventListener('click',function(){ var d=!root.classList.contains('app-dark'); applyTheme(d); try{localStorage.setItem('vc-theme',d?'dark':'light');}catch(e){} });

  var spBtn=document.getElementById('spToggle');
  function applySp(on){ body.classList.toggle('show-sp',on); spBtn.classList.toggle('is-on',on); }
  var ss=null; try{ss=localStorage.getItem('vc-sp');}catch(e){}
  applySp(ss==='1' || /[?&]sp=1\\b/.test(location.search));
  spBtn.addEventListener('click',function(){ var on=!body.classList.contains('show-sp'); applySp(on); try{localStorage.setItem('vc-sp',on?'1':'0');}catch(e){} });

  show(idxFromHash());
})();
""" % (NAV_JS, PRAT_JS)

HTML = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Versionamento e Integração de Código · VIC</title>
<style>
%s
%s
</style>
</head>
<body>
<header class="app-header">
  <a class="brand" href="#index" aria-label="Início do modelo">
    <span class="brand-mark">%s</span>
    <span class="brand-text"><span class="eyebrow">Modelo VIC</span><span class="title">Versionamento e Integração de Código</span></span>
  </a>
  <span class="spacer"></span>
  <div class="actions">
    <button class="h-btn" id="spToggle" title="Destacar quais web parts do SharePoint montam cada bloco">%s<span class="label-long">Mapa SharePoint</span></button>
    <button class="h-btn h-btn--icon" id="themeToggle" title="Alternar tema claro/escuro" aria-label="Alternar tema"></button>
  </div>
</header>
<nav class="topnav" aria-label="Navegação do modelo">
  <div class="topnav-inner">
        %s
  </div>
</nav>
<main class="main"><div class="content">
  <nav class="breadcrumb" id="crumb"></nav>
  <div id="pages">
%s
  </div>
  <nav class="page-nav" id="pnav"></nav>
</div></main>
<script>
%s
</script>
</body>
</html>
""" % (CSS, EXTRA_CSS, ICON_BRAND, ICON_LAYOUT, tabs_html, "\n".join(articles), SCRIPT)

_fav = base64.b64encode(open(os.path.join(BASE, "assets/brand/vic-icon.svg"), "rb").read()).decode("ascii")
HTML = HTML.replace(
  "<title>Versionamento e Integração de Código · VIC</title>",
  '<title>Versionamento e Integração de Código · VIC</title>\n<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,%s">' % _fav)

out = "versionamento-codigo-standalone.html"
open(out, "w", encoding="utf-8").write(HTML)
print("Gerado:", out, len(HTML), "chars,", len(articles), "páginas")

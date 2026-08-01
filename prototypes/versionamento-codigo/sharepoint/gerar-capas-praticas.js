/**
 * Gera as 13 capas de prática para o web part "Imagem" do SharePoint.
 *
 * Reproduz o bloco .page-hero do assets/chapter.css em PNG, para trazer o azul
 * institucional exato (#00437A -> #005CA9) mesmo em tenant sem tema custom.
 * Os títulos são lidos de praticas.html, então não há texto duplicado aqui.
 *
 *   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node sharepoint/gerar-capas-praticas.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(__dirname, 'capas-praticas');

// .page-hero é desenhado sobre uma coluna de ~1000px; 1.6x deixa a arte nítida
// na largura típica de uma seção do SharePoint sem virar um arquivo pesado.
const K = 1.6;
const W = 1600;
const H = 232;

function slug(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function praticas() {
  const html = fs.readFileSync(path.join(ROOT, 'praticas.html'), 'utf8');
  const re = /<span class="ql-num">Prática (\d+)<\/span><\/div><h3>([^<]+)<\/h3>/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push({ n: m[1], titulo: m[2] });
  return out;
}

const page = (n, titulo) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:transparent;}
  .hero{
    width:${W}px; height:${H}px;
    box-sizing:border-box;
    display:flex; align-items:center; gap:${26 * K}px;
    padding:${36 * K}px ${40 * K}px;
    border-radius:${18 * K}px;
    background:linear-gradient(120deg,#00437a,#005ca9);
    color:#fff;
    font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;
    overflow:hidden;
  }
  .num{
    flex:0 0 auto;
    width:${72 * K}px; height:${72 * K}px;
    display:grid; place-items:center;
    border-radius:${18 * K}px;
    background:rgba(255,255,255,.12);
    border:1px solid rgba(255,255,255,.28);
    font-size:${34 * K}px; font-weight:700;
  }
  .txt{min-width:0;}
  .eyebrow{
    font-size:${12 * K}px; font-weight:700; letter-spacing:.14em;
    text-transform:uppercase; color:#ffd7a3; margin-bottom:${8 * K}px;
  }
  h1{
    margin:0; font-size:${27 * K}px; line-height:1.2; font-weight:700;
    white-space:nowrap;
  }
</style></head><body>
  <div class="hero">
    <div class="num">${n}</div>
    <div class="txt">
      <div class="eyebrow">Prática Desejada</div>
      <h1>${titulo}</h1>
    </div>
  </div>
</body></html>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const lista = praticas();
  if (lista.length !== 13) throw new Error(`esperava 13 práticas, achei ${lista.length}`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const p = await ctx.newPage();

  for (const { n, titulo } of lista) {
    await p.setContent(page(n, titulo));
    // white-space:nowrap não quebra linha: se estourar, o texto vaza o padding.
    const over = await p.evaluate((pad) => {
      const hero = document.querySelector('.hero');
      const h1 = document.querySelector('h1');
      return h1.getBoundingClientRect().right - (hero.getBoundingClientRect().right - pad);
    }, 40 * K);
    if (over > 0) throw new Error(`"${titulo}" estoura ${Math.ceil(over)}px`);

    const file = path.join(OUT, `pratica-${String(n).padStart(2, '0')}-${slug(titulo)}.png`);
    await p.locator('.hero').screenshot({ path: file, omitBackground: true });
    console.log(`${file}  ${titulo}`);
  }

  await browser.close();
})();

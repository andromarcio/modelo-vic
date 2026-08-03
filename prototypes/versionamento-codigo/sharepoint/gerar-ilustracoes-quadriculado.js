/**
 * Reexporta as ilustrações das diretrizes com o mesmo enquadramento que o
 * protótipo dá a elas: canvas #f6f9fc com malha de pontos, borda discreta e
 * cantos arredondados. Valores copiados de .fig-canvas / .figure no chapter.css.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const RAIZ = '/home/user/modelo-vic/prototypes/versionamento-codigo';
const SAIDA = path.join(RAIZ, 'sharepoint/ilustracoes-quadriculado');
const ESCALA = 3;          // 3x sobre o tamanho natural do viewBox
const PAD = 22;            // .fig-canvas padding
const BORDA = '#dbe5e8';   // --border
const RAIO = 12;           // --radius

// somente as ilustrações referenciadas pelas diretrizes
function ilustracoes() {
  const out = new Map();
  for (const f of fs.readdirSync(RAIZ).filter(x => /^diretriz-\d+\.html$/.test(x))) {
    const html = fs.readFileSync(path.join(RAIZ, f), 'utf8');
    for (const m of html.matchAll(/src="assets\/img\/([^"]+\.svg)"/g)) out.set(m[1], f);
  }
  return [...out.entries()].sort();
}

const pagina = (svg, w, h) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:transparent}
  .fig{
    display:inline-block; padding:${PAD}px;
    background-color:#f6f9fc;
    background-image:radial-gradient(#d4e2ec .9px, transparent .9px);
    background-size:18px 18px;
    background-position:-9px -9px;
    border:1px solid ${BORDA};
    border-radius:${RAIO}px;
    box-sizing:content-box;
  }
  .fig svg{display:block;width:${w}px;height:${h}px}
</style></head><body><div class="fig">${svg}</div></body></html>`;

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const lista = ilustracoes();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: ESCALA });
  const page = await ctx.newPage();

  for (const [arq, origem] of lista) {
    const svg = fs.readFileSync(path.join(RAIZ, 'assets/img', arq), 'utf8');
    const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
    if (!vb) throw new Error(`${arq}: sem viewBox`);
    const w = Math.round(+vb[1]), h = Math.round(+vb[2]);

    await page.setViewportSize({ width: w + PAD * 2 + 40, height: h + PAD * 2 + 40 });
    await page.setContent(pagina(svg, w, h));
    const destino = path.join(SAIDA, arq.replace(/\.svg$/, '.png'));
    await page.locator('.fig').screenshot({ path: destino, omitBackground: true });

    const px = fs.statSync(destino).size;
    console.log(`  ${origem.padEnd(16)} ${arq.padEnd(28)} ${w}x${h} → ${(w+PAD*2)*ESCALA}x${(h+PAD*2)*ESCALA}  ${(px/1024).toFixed(0)} KB`);
  }
  console.log(`\n${lista.length} ilustrações em ${ESCALA}x`);
  await browser.close();
})();

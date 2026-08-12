/**
 * Aviso de página em construção, para as páginas do site do Modelo VIC que
 * ainda não foram publicadas.
 *
 * Diferente dos demais geradores, aqui não há bloco equivalente no protótipo
 * para fotografar: a composição é nova. Os valores abaixo são os tokens do
 * chapter.css — canvas e malha de .fig-canvas, borda e raio de .figure, e a
 * paleta institucional — copiados, não inventados.
 *
 *   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node sharepoint/gerar-em-construcao.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const CSS = [800, 300];
const K = 2;

const AZUL = '#005ca9';        // --primary
const NAVY = '#00437a';        // --c-primary-110
const LARANJA = '#f39200';     // --c-accent
const TINTA = '#22292e';       // --c-ink
const CINZA = '#525f66';       // --c-gray-90
const BORDA = '#dbe5e8';       // --border
const CANVAS = '#f6f9fc';      // .fig-canvas
const PONTO = '#d4e2ec';       // malha de .fig-canvas
const PENDENTE = '#b9cfe0';    // trecho ainda não construído

// grafo: o percurso já publicado é sólido, o que falta segue pontilhado, e o
// laranja marca onde a construção está
const grafo = `<svg viewBox="0 0 360 24" width="360" height="24" fill="none">
  <line x1="12" y1="12" x2="180" y2="12" stroke="${AZUL}" stroke-width="3" stroke-linecap="round"/>
  <line x1="180" y1="12" x2="348" y2="12" stroke="${PENDENTE}" stroke-width="3"
        stroke-linecap="round" stroke-dasharray="2 12"/>
  <circle cx="12" cy="12" r="7" fill="${AZUL}"/>
  <circle cx="96" cy="12" r="7" fill="${AZUL}"/>
  <circle cx="180" cy="12" r="8" fill="${LARANJA}"/>
  <circle cx="264" cy="12" r="6.5" fill="#fff" stroke="${PENDENTE}" stroke-width="2.5"/>
  <circle cx="348" cy="12" r="6.5" fill="#fff" stroke="${PENDENTE}" stroke-width="2.5"/>
</svg>`;

const pagina = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:transparent}
  .aviso{
    width:${CSS[0]}px; height:${CSS[1]}px; box-sizing:border-box;
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px;
    padding:40px 56px; text-align:center;
    background-color:${CANVAS};
    background-image:radial-gradient(${PONTO} .9px, transparent .9px);
    background-size:18px 18px; background-position:-9px -9px;
    border:1px solid ${BORDA}; border-radius:12px;
    font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;
  }
  .pilula{
    font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase;
    color:#fff; background:${LARANJA}; padding:4px 12px; border-radius:999px;
  }
  h1{margin:0; font-size:30px; font-weight:700; color:${TINTA}; letter-spacing:-.01em}
  p{margin:0; font-size:15px; color:${CINZA}; line-height:1.5; max-width:440px}
  strong{color:${NAVY}}
</style></head><body>
  <div class="aviso">
    <span class="pilula">Em construção</span>
    <h1>Site do Modelo VIC</h1>
    <p>As páginas estão sendo publicadas gradualmente.
       Este conteúdo estará disponível em breve.</p>
    ${grafo}
  </div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const p = await browser.newPage({
    viewport: { width: CSS[0], height: CSS[1] },
    deviceScaleFactor: K,
  });
  await p.setContent(pagina);

  // texto que estoure a caixa sairia cortado em silêncio
  const vaza = await p.evaluate(() => {
    const a = document.querySelector('.aviso');
    const cs = getComputedStyle(a);
    const util = a.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const alto = [...a.children].reduce((s, e) => s + e.getBoundingClientRect().height, 0) +
      parseFloat(cs.rowGap) * (a.children.length - 1);
    return { estoura: alto > util + 0.5, alto: Math.round(alto), util: Math.round(util) };
  });
  if (vaza.estoura) throw new Error(`o aviso não cabe: ${vaza.alto}px em ${vaza.util}px`);

  const alvo = path.join(__dirname, `em-construcao-${CSS[0] * K}x${CSS[1] * K}.png`);
  await p.locator('.aviso').screenshot({ path: alvo, omitBackground: true });
  await browser.close();
  console.log(`  ${path.basename(alvo)}  ${(fs.statSync(alvo).size / 1024).toFixed(1)} KB`);
})();

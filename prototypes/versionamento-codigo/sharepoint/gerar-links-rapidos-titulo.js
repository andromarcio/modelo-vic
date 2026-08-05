/**
 * Variante das miniaturas de Links Rápidos com o título desenhado na arte.
 * Serve aos layouts que não exibem o título por fora, ou quando o cartão precisa
 * se identificar sozinho. Para o layout Bloco, prefira links-rapidos/ — ali o
 * web part já escreve o título abaixo da imagem e este ficaria duplicado.
 *
 *   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node sharepoint/gerar-links-rapidos-titulo.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const RAIZ = path.resolve(__dirname, '..');
const ORIGEM = path.join(RAIZ, 'assets/icons');
const SAIDA = path.join(__dirname, 'links-rapidos-titulo');

const W = 1200, H = 675;      // arte 16:9
const EXPORT = [800, 450];    // PNG: 3,4x o tamanho exibido no cartão

// o glifo vive no <g transform=...> do ícone, em coordenadas 24x24
function glifoDe(arquivo) {
  const svg = fs.readFileSync(path.join(ORIGEM, arquivo), 'utf8');
  const m = svg.match(/<g transform="translate\([^)]*\) scale\([^)]*\)"[\s\S]*?>([\s\S]*?)<\/g>\s*<\/svg>/);
  if (!m) throw new Error(`${arquivo}: não encontrei o glifo`);
  const rot = (svg.match(/aria-label="([^"]+)"/) || [, arquivo])[1];
  // Em "Versionamento — Git", o cartão leva só o rótulo da seção: é ele que
  // nomeia o item na Visão Geral. O nome da tecnologia fica para o texto da página.
  const titulo = rot.includes(' — ') ? rot.split(' — ')[0] : rot;
  return { glifo: m[1].trim(), titulo, rotulo: rot };
}

const pagina = ({ glifo, titulo }) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0}
  .tile{
    width:${W}px; height:${H}px; box-sizing:border-box; position:relative; overflow:hidden;
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px;
    padding:44px 56px;
    background:
      radial-gradient(120% 190% at 88% 0%, rgba(243,146,0,.30), transparent 62%),
      linear-gradient(125deg,#00437a 0%,#005ca9 55%,#0070cc 100%);
    font-family:'Segoe UI',system-ui,-apple-system,sans-serif; text-align:center;
  }
  .malha{
    position:absolute; inset:0;
    background-image:
      linear-gradient(rgba(255,255,255,.08) 1.5px, transparent 1.5px),
      linear-gradient(90deg, rgba(255,255,255,.08) 1.5px, transparent 1.5px);
    background-size:48px 48px;
  }
  .conteudo{position:relative; display:flex; flex-direction:column; align-items:center; gap:20px}
  /* sem limite de largura o título não quebra linha e vaza a arte; a folga extra
     mantém a medida abaixo do limite verificado adiante */
  h1{margin:0; max-width:${W - 160}px; font-size:96px; font-weight:700; line-height:1.12;
     color:#fff; letter-spacing:-.4px; text-wrap:balance}
  svg{width:112px; height:112px; display:block}
</style></head><body>
  <div class="tile"><div class="malha"></div>
    <div class="conteudo">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7"
           stroke-linecap="round" stroke-linejoin="round">${glifo}</svg>
      <h1>${titulo}</h1>
    </div>
  </div>
</body></html>`;

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const arquivos = fs.readdirSync(ORIGEM).filter(f => f.endsWith('.svg')).sort();
  if (!arquivos.length) throw new Error('nenhum ícone de origem');

  // a arte é composta em 1200x675 e sai direto no tamanho de entrega:
  // deviceScaleFactor fracionário evita um segundo passo de redução
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: EXPORT[0] / W,
  });

  for (const f of arquivos) {
    const dados = glifoDe(f);
    await page.setContent(pagina(dados));
    // título que estoura a arte seria cortado em silêncio; compara com a caixa
    // de conteúdo real do tile, descontando o padding, e não com folga arbitrária
    const vaza = await page.evaluate(() => {
      const tile = document.querySelector('.tile');
      const cs = getComputedStyle(tile);
      const dispW = tile.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const dispH = tile.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const c = document.querySelector('.conteudo').getBoundingClientRect();
      return { largo: c.width > dispW + 0.5, alto: c.height > dispH + 0.5,
               c: [Math.round(c.width), Math.round(c.height)], d: [Math.round(dispW), Math.round(dispH)] };
    });
    if (vaza.largo || vaza.alto) {
      throw new Error(`"${dados.titulo}" não cabe: conteúdo ${vaza.c.join('x')} em ${vaza.d.join('x')} disponíveis`);
    }

    const alvo = path.join(SAIDA, f.replace(/\.svg$/, '.png'));
    await page.locator('.tile').screenshot({ path: alvo });
    console.log(`  ${path.basename(alvo).padEnd(42)} ${dados.rotulo}  ${(fs.statSync(alvo).size / 1024).toFixed(0)} KB`);
  }
  await browser.close();

  // arquivos idênticos denunciam arte em branco — já aconteceu
  const tamanhos = new Set(fs.readdirSync(SAIDA).map(f => fs.statSync(path.join(SAIDA, f)).size));
  if (tamanhos.size < arquivos.length) throw new Error('miniaturas repetidas: a arte não renderizou');
  console.log(`\n${arquivos.length} miniaturas com título · ${EXPORT[0]}x${EXPORT[1]}`);
})();

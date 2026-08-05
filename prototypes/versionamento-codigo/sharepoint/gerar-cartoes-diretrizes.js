/**
 * Três conjuntos de imagens das 13 diretrizes, no padrão dos cartões de
 * diretrizes.html:
 *
 *   icones-diretrizes/            só o ícone, quadrado (mesma spec de .ql-icon)
 *   cartoes-diretrizes-numero/    cartão com ícone + "DIRETRIZ N"
 *   cartoes-diretrizes-titulo/    cartão com ícone + "DIRETRIZ N" + o título
 *
 * Os cartões são fotografados na própria página, com o chapter.css carregado,
 * para que cor, raio, borda e tipografia venham do estilo real e não de valores
 * recopiados. Os ícones saem do mesmo HTML, então nenhum path é redigitado.
 *
 *   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node sharepoint/gerar-cartoes-diretrizes.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const RAIZ = path.resolve(__dirname, '..');
const SAIDA = {
  icone: path.join(__dirname, 'icones-diretrizes'),
  numero: path.join(__dirname, 'cartoes-diretrizes-numero'),
  titulo: path.join(__dirname, 'cartoes-diretrizes-titulo'),
};

// O cartão é medido no tamanho em que aparece no protótipo (~330px de largura),
// para que os 16px do h3 tenham o mesmo peso do print. 336x189 é 16:9, a
// proporção que o web part Links Rápidos recorta no layout Bloco.
const CARD = [336, 189];
const EXPORT = [800, 450];

// mesma spec de .ql-icon: caixa 42px raio 11px, glifo 22px
const TILE = 120;
const RX = (11 / 42) * TILE;
const GLIFO = (22 / 42) * TILE;
const ESCALA = GLIFO / 24;
const OFF = (TILE - GLIFO) / 2;
const BG = '#e5f2fc';
const FG = '#00437a';

const r = (n) => Math.round(n * 100) / 100;
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function diretrizes() {
  const html = fs.readFileSync(path.join(RAIZ, 'diretrizes.html'), 'utf8');
  const re = /<span class="ql-icon">(<svg[\s\S]*?<\/svg>)<\/span><span class="ql-num">Diretriz (\d+)<\/span><\/div><h3>([^<]+)<\/h3>/g;
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push({ svg: m[1], n: m[2], titulo: m[3] });
  if (out.length !== 13) throw new Error(`esperava 13 diretrizes, achei ${out.length}`);
  return out;
}

// o desenho vive dentro do <svg viewBox="0 0 24 24">, em coordenadas 24x24
const glifoDe = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').trim();

const iconeSvg = (glifo, rotulo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}" role="img" aria-label="${rotulo}">
  <rect x="0" y="0" width="${TILE}" height="${TILE}" rx="${r(RX)}" fill="${BG}"/>
  <g transform="translate(${r(OFF)},${r(OFF)}) scale(${r(ESCALA)})"
     fill="none" stroke="${FG}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${glifo}
  </g>
</svg>
`;

(async () => {
  const lista = diretrizes();
  Object.values(SAIDA).forEach((d) => fs.mkdirSync(d, { recursive: true }));
  const browser = await chromium.launch();

  // ---- 1. ícones ----------------------------------------------------------
  const pIcone = await browser.newPage({
    viewport: { width: TILE, height: TILE },
    deviceScaleFactor: 240 / TILE,
  });
  for (const { svg, n, titulo } of lista) {
    const nome = `diretriz-${String(n).padStart(2, '0')}-${slug(titulo)}`;
    const arte = iconeSvg(glifoDe(svg), `Diretriz ${n} — ${titulo}`);
    fs.writeFileSync(path.join(SAIDA.icone, `${nome}.svg`), arte);
    await pIcone.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>html,body{margin:0;padding:0;background:transparent}svg{display:block}</style>
      </head><body>${arte}</body></html>`);
    await pIcone.locator('svg').screenshot({
      path: path.join(SAIDA.icone, `${nome}.png`), omitBackground: true,
    });
  }
  await pIcone.close();
  console.log(`icones-diretrizes/            ${lista.length} ícones 240x240`);

  // ---- 2 e 3. cartões -----------------------------------------------------
  // parte da página real: o cartão herda .ql-card do chapter.css sem cópia
  const pCard = await browser.newPage({
    viewport: { width: CARD[0], height: CARD[1] },
    deviceScaleFactor: EXPORT[0] / CARD[0],
    colorScheme: 'light',
  });
  await pCard.goto(`file://${path.join(RAIZ, 'diretrizes.html')}`);
  await pCard.evaluate(([w, h]) => {
    document.documentElement.classList.remove('app-dark');
    const s = document.createElement('style');
    // sem "Abrir" o conteúdo fica centrado: encostá-lo no topo deixaria um
    // vazio embaixo que o cartão original não tem, porque lá o link ocupa a base
    s.textContent = `html,body{margin:0;padding:0;background:transparent;overflow:hidden}
      #alvo{width:${w}px;height:${h}px;box-sizing:border-box;justify-content:center}
      /* só o ícone e o número, encostados à esquerda, deixariam metade do 16:9
         vazia; com o título embaixo o alinhamento à esquerda do print se mantém */
      #alvo.so-numero{align-items:center}`;
    document.head.appendChild(s);
  }, CARD);

  for (const conjunto of ['numero', 'titulo']) {
    for (const { svg, n, titulo } of lista) {
      const corpo = conjunto === 'titulo' ? `<h3>${titulo}</h3>` : '';
      const classe = conjunto === 'titulo' ? '' : ' so-numero';
      await pCard.evaluate(({ svg, n, corpo, classe }) => {
        document.body.innerHTML =
          `<div class="ql-card${classe}" id="alvo">
             <div class="ql-top"><span class="ql-icon">${svg}</span>` +
          `<span class="ql-num">Diretriz ${n}</span></div>${corpo}</div>`;
      }, { svg, n, corpo, classe });

      // texto que estoura o cartão sairia cortado em silêncio
      const vaza = await pCard.evaluate(() => {
        const c = document.getElementById('alvo');
        const cs = getComputedStyle(c);
        const util = c.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const alto = [...c.children].reduce((a, e) => a + e.getBoundingClientRect().height, 0) +
          parseFloat(cs.rowGap || 0) * (c.children.length - 1);
        return { estoura: alto > util + 0.5, alto: Math.round(alto), util: Math.round(util) };
      });
      if (vaza.estoura) throw new Error(`"${titulo}" não cabe: ${vaza.alto}px em ${vaza.util}px`);

      const nome = `diretriz-${String(n).padStart(2, '0')}-${slug(titulo)}.png`;
      await pCard.locator('#alvo').screenshot({
        path: path.join(SAIDA[conjunto], nome), omitBackground: true,
      });
    }
    console.log(`cartoes-diretrizes-${conjunto.padEnd(7)}   ${lista.length} cartões ${EXPORT.join('x')}`);
  }
  await browser.close();

  // Arte em branco sai como um lote inteiro de arquivos iguais — já aconteceu.
  // Um par isolado, porém, é duplicata legítima: D9 e D11 têm o mesmo desenho
  // no diretrizes.html. Por isso a repetição é relatada, e só o lote é erro.
  for (const [rotulo, dir] of Object.entries(SAIDA)) {
    const pngs = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
    const grupos = new Map();
    for (const f of pngs) {
      const chave = require('crypto').createHash('md5')
        .update(fs.readFileSync(path.join(dir, f))).digest('hex');
      grupos.set(chave, [...(grupos.get(chave) || []), f]);
    }
    for (const iguais of grupos.values()) {
      if (iguais.length > 2) throw new Error(`${rotulo}: ${iguais.length} imagens iguais, a arte não renderizou`);
      if (iguais.length === 2) console.log(`  ! ${rotulo}: ${iguais.join(' == ')}`);
    }
  }
})();

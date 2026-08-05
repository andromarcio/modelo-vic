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

// 336x189 é 16:9, a proporção que o web part Links Rápidos recorta no layout
// Bloco. O cartão do protótipo tem essa largura, mas é mais alto do que largo:
// aqui sobra altura, então ícone e tipografia crescem sobre a medida do print
// (42/12/16) para ocupar o cartão. 20px no h3 é o maior corpo em que os treze
// títulos ainda cabem em três linhas — com 21px o mais longo encosta na borda.
const CARD = [336, 189];
const EXPORT = [800, 450];
const PAD = 22;
const GAP = 15;
const CX_ICONE = 50;
const CORPO_NUM = 14;
const CORPO_TITULO = 20;
// sem título para dividir o espaço, ícone e rótulo crescem até quase encostar
// nas laterais: "DIRETRIZ 13" a 20px já é a linha mais larga que cabe
const CX_ICONE_SO = 78;
const CORPO_NUM_SO = 20;

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
  await pCard.evaluate((v) => {
    document.documentElement.classList.remove('app-dark');
    const s = document.createElement('style');
    s.textContent = `html,body{margin:0;padding:0;background:transparent;overflow:hidden}
      #alvo{width:${v.w}px;height:${v.h}px;box-sizing:border-box;padding:${v.PAD}px;gap:${v.GAP}px}
      #alvo .ql-icon{width:${v.CX_ICONE}px;height:${v.CX_ICONE}px;border-radius:${Math.round(v.CX_ICONE * 11 / 42)}px}
      #alvo .ql-icon svg{width:${Math.round(v.CX_ICONE * 22 / 42)}px;height:${Math.round(v.CX_ICONE * 22 / 42)}px}
      #alvo .ql-num{font-size:${v.CORPO_NUM}px}
      #alvo h3{font-size:${v.CORPO_TITULO}px;line-height:1.24}
      /* só o ícone e o número, encostados no canto, deixariam o 16:9 vazio;
         com o título embaixo vale o topo à esquerda do print */
      #alvo.so-numero{justify-content:center;align-items:center}
      #alvo.so-numero .ql-top{gap:18px}
      #alvo.so-numero .ql-icon{width:${v.CX_ICONE_SO}px;height:${v.CX_ICONE_SO}px;border-radius:${Math.round(v.CX_ICONE_SO * 11 / 42)}px}
      #alvo.so-numero .ql-icon svg{width:${Math.round(v.CX_ICONE_SO * 22 / 42)}px;height:${Math.round(v.CX_ICONE_SO * 22 / 42)}px}
      #alvo.so-numero .ql-num{font-size:${v.CORPO_NUM_SO}px}`;
    document.head.appendChild(s);
  }, { w: CARD[0], h: CARD[1], PAD, GAP, CX_ICONE, CORPO_NUM, CORPO_TITULO, CX_ICONE_SO, CORPO_NUM_SO });

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

      // texto que estoura o cartão sairia cortado em silêncio. A altura aperta
      // nos títulos longos; a largura, na linha "DIRETRIZ N" ampliada — por isso
      // as duas são medidas.
      const vaza = await pCard.evaluate(() => {
        const c = document.getElementById('alvo');
        const cs = getComputedStyle(c);
        const filhos = [...c.children];
        const utilY = c.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        const utilX = c.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const alto = filhos.reduce((a, e) => a + e.getBoundingClientRect().height, 0) +
          parseFloat(cs.rowGap || 0) * (filhos.length - 1);
        const largo = Math.max(...filhos.map((e) => e.getBoundingClientRect().width));
        return {
          estoura: alto > utilY + 0.5 || largo > utilX + 0.5,
          medida: `${Math.round(largo)}x${Math.round(alto)}`,
          util: `${Math.round(utilX)}x${Math.round(utilY)}`,
        };
      });
      if (vaza.estoura) throw new Error(`"${titulo}" não cabe: ${vaza.medida} em ${vaza.util}`);

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

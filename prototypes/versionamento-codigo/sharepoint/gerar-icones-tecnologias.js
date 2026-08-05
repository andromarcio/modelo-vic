/**
 * Exporta os ícones da seção "Tecnologias de referência" do index.html como
 * arquivos, no mesmo formato dos ícones de tópico já existentes em assets/icons.
 * Os paths são lidos do próprio index.html, não redigitados.
 */
const fs = require('fs');
const path = require('path');

const RAIZ = '/home/user/modelo-vic/prototypes/versionamento-codigo';
const SAIDA = path.join(RAIZ, 'assets/icons');

// espelha .ql-icon do chapter.css: caixa 42px raio 11px (#e5f2fc), glifo 22px navy
const TILE = 120;
const RX = (11 / 42) * TILE;
const ICON = (22 / 42) * TILE;
const SCALE = ICON / 24;
const OFF = (TILE - ICON) / 2;
const BG = '#e5f2fc';
const FG = '#00437a';

const r = (n) => Math.round(n * 100) / 100;
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const secao = html.split('<h2>Tecnologias de referência</h2>')[1].split('</section>')[0];

const cartoes = [...secao.matchAll(
  /<span class="ql-icon"><svg viewBox="0 0 24 24"[^>]*>([\s\S]*?)<\/svg><\/span><span class="ql-num">([^<]+)<\/span>[\s\S]*?<h3>([^<]+)<\/h3>/g
)];

if (cartoes.length !== 4) throw new Error(`esperava 4 cartões, achei ${cartoes.length}`);

cartoes.forEach(([, glifo, rotulo, titulo], i) => {
  const nome = `tec-${i + 1}-${slug(rotulo)}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}" role="img" aria-label="${rotulo} — ${titulo}">
  <rect x="0" y="0" width="${TILE}" height="${TILE}" rx="${r(RX)}" fill="${BG}"/>
  <g transform="translate(${r(OFF)},${r(OFF)}) scale(${r(SCALE)})"
     fill="none" stroke="${FG}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${glifo.trim()}
  </g>
</svg>
`;
  fs.writeFileSync(path.join(SAIDA, `${nome}.svg`), svg);
  console.log(`  ${nome}.svg   ${rotulo} — ${titulo}`);
});
console.log(`\n${cartoes.length} ícones`);

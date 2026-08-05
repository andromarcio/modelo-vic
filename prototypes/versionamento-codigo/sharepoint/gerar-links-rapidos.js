/**
 * Miniaturas para o web part "Links Rápidos" no layout Bloco, que exibe uma
 * imagem em paisagem com o título por fora. Reaproveita os glifos dos ícones já
 * versionados em assets/icons, extraindo-os dos próprios arquivos.
 */
const fs = require('fs');
const path = require('path');

const RAIZ = '/home/user/modelo-vic/prototypes/versionamento-codigo';
const ORIGEM = path.join(RAIZ, 'assets/icons');
const SAIDA = path.join(RAIZ, 'sharepoint/links-rapidos');

const W = 1200, H = 675;        // 16:9
const GLIFO = 250;              // altura do glifo na arte
const S = GLIFO / 24;
const OX = (W - GLIFO) / 2, OY = (H - GLIFO) / 2;
const r = (n) => Math.round(n * 100) / 100;

// o glifo mora dentro do <g transform=...> de cada ícone, em coordenadas 24x24
function glifoDe(arquivo) {
  const svg = fs.readFileSync(path.join(ORIGEM, arquivo), 'utf8');
  const m = svg.match(/<g transform="translate\([^)]*\) scale\([^)]*\)"[\s\S]*?>([\s\S]*?)<\/g>\s*<\/svg>/);
  if (!m) throw new Error(`${arquivo}: não encontrei o glifo`);
  return m[1].trim();
}

const tile = (glifo, rotulo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${rotulo}">
  <defs>
    <linearGradient id="fundo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#00437a"/><stop offset=".55" stop-color="#005ca9"/><stop offset="1" stop-color="#0070cc"/>
    </linearGradient>
    <pattern id="malha" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0 H0 V48" fill="none" stroke="#ffffff" stroke-opacity=".08" stroke-width="1.5"/>
    </pattern>
    <radialGradient id="brilho" gradientUnits="userSpaceOnUse" cx="${r(W * .88)}" cy="0" r="${r(H * 1.5)}">
      <stop offset="0" stop-color="#f39200" stop-opacity=".30"/>
      <stop offset="1" stop-color="#f39200" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#fundo)"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#malha)"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#brilho)"/>
  <g transform="translate(${r(OX)},${r(OY)}) scale(${r(S)})"
     fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    ${glifo}
  </g>
</svg>
`;

fs.mkdirSync(SAIDA, { recursive: true });
const arquivos = fs.readdirSync(ORIGEM).filter(f => f.endsWith('.svg')).sort();
if (!arquivos.length) throw new Error('nenhum ícone de origem');

for (const f of arquivos) {
  const rotulo = (fs.readFileSync(path.join(ORIGEM, f), 'utf8').match(/aria-label="([^"]+)"/) || [, f])[1];
  fs.writeFileSync(path.join(SAIDA, f), tile(glifoDe(f), rotulo));
  console.log(`  ${f.padEnd(42)} ${rotulo}`);
}
console.log(`\n${arquivos.length} miniaturas ${W}x${H}`);

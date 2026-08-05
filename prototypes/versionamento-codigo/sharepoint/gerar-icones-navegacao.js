/**
 * Ícones das quatro seções do modelo, para os links da tela inicial.
 * Mesma especificação de .ql-icon usada pelos demais ícones de assets/icons,
 * para que convivam no mesmo web part sem destoar.
 *
 *   node sharepoint/gerar-icones-navegacao.js
 */
const fs = require('fs');
const path = require('path');

const SAIDA = path.resolve(__dirname, '../assets/icons');

const TILE = 120;
const RX = (11 / 42) * TILE;
const ICON = (22 / 42) * TILE;
const SCALE = ICON / 24;
const OFF = (TILE - ICON) / 2;
const BG = '#e5f2fc';
const FG = '#00437a';
const r = (n) => Math.round(n * 100) / 100;

const SECOES = [
  {
    arquivo: 'nav-1-visao-geral',
    rotulo: 'Visão Geral',
    // livro aberto: o modelo como documento de referência
    glifo: `<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>`,
  },
  {
    arquivo: 'nav-2-diretrizes',
    rotulo: 'Diretrizes',
    // relação de itens: as 13 regras enumeradas
    glifo: `<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3.5" y1="6" x2="3.51" y2="6"/><line x1="3.5" y1="12" x2="3.51" y2="12"/>
    <line x1="3.5" y1="18" x2="3.51" y2="18"/>`,
  },
  {
    arquivo: 'nav-3-triade-tecnica',
    rotulo: 'Tríade Técnica',
    // três nós que se sustentam — o triângulo já é a marca da página no protótipo
    glifo: `<circle cx="12" cy="4.6" r="2.6"/><circle cx="4.6" cy="18.4" r="2.6"/>
    <circle cx="19.4" cy="18.4" r="2.6"/>
    <path d="M10.8 6.9 6.2 15.6"/><path d="M13.2 6.9l4.6 8.7"/><path d="M7.2 18.4h9.6"/>`,
  },
  {
    arquivo: 'nav-4-analise-acompanhamento',
    rotulo: 'Análise e Acompanhamento',
    // curva ascendente: maturidade acompanhada ao longo do tempo
    glifo: `<polyline points="22.5 6.5 14 15 9.5 10.5 1.5 18.5"/>
    <polyline points="16.5 6.5 22.5 6.5 22.5 12.5"/>`,
  },
];

for (const { arquivo, rotulo, glifo } of SECOES) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}" role="img" aria-label="${rotulo}">
  <rect x="0" y="0" width="${TILE}" height="${TILE}" rx="${r(RX)}" fill="${BG}"/>
  <g transform="translate(${r(OFF)},${r(OFF)}) scale(${r(SCALE)})"
     fill="none" stroke="${FG}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${glifo.trim()}
  </g>
</svg>
`;
  fs.writeFileSync(path.join(SAIDA, `${arquivo}.svg`), svg);
  console.log(`  ${arquivo}.svg   ${rotulo}`);
}
console.log(`\n${SECOES.length} ícones de seção`);

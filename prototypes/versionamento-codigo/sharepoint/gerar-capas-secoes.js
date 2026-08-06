/**
 * Capas das páginas de seção, no mesmo formato das 13 capas de diretriz:
 * 1600 x 232, cantos arredondados transparentes, para o web part "Imagem".
 *
 * Ao contrário de gerar-capas-diretrizes.js, que redesenha o .page-hero, aqui a
 * capa é fotografada na própria página com o chapter.css carregado — gradiente,
 * raio, sombra e tipografia vêm do estilo real.
 *
 *   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node sharepoint/gerar-capas-secoes.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const RAIZ = path.resolve(__dirname, '..');
const SAIDA = path.join(__dirname, 'capas-secoes');

// .page-hero é desenhado sobre uma coluna de ~1000px; 145px de altura é o que o
// badge de 72px mais os 36px de padding pedem. 1.6x chega aos 1600 x 232 das
// capas de diretriz, para que as duas famílias sejam intercambiáveis.
const COLUNA = [1000, 145];
const K = 1.6;

// O badge do .page-hero traz um caractere de texto nas duas páginas sem número
// (△ e ⌁), que ao lado dos numerais das capas de diretriz sai fino e miúdo. Na
// capa ele é substituído pelo ícone da seção, que já existe em assets/icons.
// "Diretrizes" fica com o 13, que é informação e não decoração.
const PAGINAS = [
  { pagina: 'triade-tecnica', icone: 'nav-3-triade-tecnica.svg' },
  { pagina: 'diretrizes' },
  { pagina: 'analise-acompanhamento', icone: 'nav-4-analise-acompanhamento.svg' },
];

// 38px num badge de 72px repete a proporção glifo/caixa de .ql-icon (22/42)
const CX_GLIFO = 38;

function glifoDe(arquivo) {
  const svg = fs.readFileSync(path.join(RAIZ, 'assets/icons', arquivo), 'utf8');
  const m = svg.match(/<g transform="translate\([^)]*\) scale\([^)]*\)"[\s\S]*?>([\s\S]*?)<\/g>\s*<\/svg>/);
  if (!m) throw new Error(`${arquivo}: não encontrei o glifo`);
  return m[1].trim();
}

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const browser = await chromium.launch();
  const p = await browser.newPage({
    viewport: { width: COLUNA[0], height: COLUNA[1] },
    deviceScaleFactor: K,
    colorScheme: 'light',
  });

  for (const { pagina, icone } of PAGINAS) {
    await p.goto(`file://${path.join(RAIZ, `${pagina}.html`)}`);
    const titulo = await p.evaluate(({ w, h, glifo, cx }) => {
      document.documentElement.classList.remove('app-dark');
      // o chip do "Mapa SharePoint" só aparece com body.show-sp, mas a capa não
      // pode depender disso: o estado fica guardado no navegador de quem gerou
      document.body.classList.remove('show-sp');
      // omitBackground só apaga o branco padrão do navegador, não o background
      // que o chapter.css declara no body — sem isto os cantos arredondados
      // saem opacos, ao contrário das capas de diretriz
      document.documentElement.style.background = 'transparent';
      document.body.style.background = 'transparent';
      const hero = document.querySelector('.page-hero');
      // fixo em 0,0: numa posição fracionária o recorte arredonda para fora e a
      // capa sai com um ou dois pixels a mais que as 1600x232 já existentes.
      // O z-index tira da frente o cabeçalho e o menu, que também são fixos.
      Object.assign(hero.style, {
        position: 'fixed', top: '0', left: '0', zIndex: '9999',
        width: `${w}px`, height: `${h}px`, boxSizing: 'border-box',
      });
      if (glifo) {
        hero.querySelector('.ph-num').innerHTML =
          `<svg viewBox="0 0 24 24" width="${cx}" height="${cx}" fill="none" stroke="#fff"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glifo}</svg>`;
      }
      return hero.querySelector('h1').textContent;
    }, { w: COLUNA[0], h: COLUNA[1], glifo: icone ? glifoDe(icone) : null, cx: CX_GLIFO });

    // h1 sem quebra prevista: se a linha crescer, o hero estica e a altura fixa
    // corta o texto em silêncio
    const vaza = await p.evaluate(() => {
      const hero = document.querySelector('.page-hero');
      const txt = hero.querySelector('.ph-text').getBoundingClientRect();
      const cs = getComputedStyle(hero);
      return txt.height > hero.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) + 0.5;
    });
    if (vaza) throw new Error(`"${titulo}" não cabe na capa`);

    const arquivo = path.join(SAIDA, `${pagina}.png`);
    await p.locator('.page-hero').screenshot({ path: arquivo, omitBackground: true });
    console.log(`  ${path.basename(arquivo).padEnd(28)} ${titulo}`);
  }

  await browser.close();
  console.log(`\n${PAGINAS.length} capas de seção · ${COLUNA[0] * K}x${COLUNA[1] * K}`);
})();

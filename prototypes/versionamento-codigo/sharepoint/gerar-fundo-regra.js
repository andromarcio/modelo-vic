/**
 * Fundo do bloco .regra — a moldura em que a regra impositiva de cada diretriz
 * é escrita — em duas versões: só o fundo e com o selo do lado esquerdo.
 *
 * Serve às páginas em que o texto da regra é digitado no SharePoint por cima de
 * uma imagem de fundo de seção, já que o bloco do protótipo não existe lá.
 * A moldura é fotografada em diretriz-4.html, com o chapter.css carregado, então
 * gradiente, borda, filete azul e raio vêm do estilo real.
 *
 *   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node sharepoint/gerar-fundo-regra.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const RAIZ = path.resolve(__dirname, '..');
const SAIDA = __dirname;
const ORIGEM = 'diretriz-4.html';

// O bloco é composto em 800x116 e sai a 2x, sem fator fracionário: assim a borda
// de 1px e o filete de 5px caem em pixel inteiro. 232px de altura é a mesma das
// capas de diretriz e de seção, para que os blocos da página fiquem na mesma
// medida — e cabem as duas ou três linhas que a regra do protótipo ocupa.
const CSS = [800, 116];
const K = 2;

const VERSOES = [
  { arquivo: 'regra-fundo', selo: false },
  { arquivo: 'regra-fundo-icone', selo: true },
];

(async () => {
  const browser = await chromium.launch();
  const p = await browser.newPage({
    viewport: { width: CSS[0], height: CSS[1] },
    deviceScaleFactor: K,
    colorScheme: 'light',
  });
  for (const { arquivo, selo } of VERSOES) {
    // recarrega a cada versão: a montagem remove nós do DOM e a seguinte não
    // pode herdar o bloco já desmontado
    await p.goto(`file://${path.join(RAIZ, ORIGEM)}`);
    await p.evaluate(({ w, h, selo }) => {
      document.documentElement.classList.remove('app-dark');
      document.body.classList.remove('show-sp');
      // omitBackground só apaga o branco padrão do navegador, não o background
      // declarado no body — sem isto os cantos arredondados saem opacos
      document.documentElement.style.background = 'transparent';
      document.body.style.background = 'transparent';

      const regra = document.querySelector('.regra');
      // O resto da página sai de cena. Sobrepor não basta: o cabeçalho e o menu
      // são chapas brancas opacas, e o canto arredondado revelaria esse branco
      // em vez de transparência — o que só aparece quando a imagem é usada sobre
      // fundo colorido. Os estilos de .regra não dependem de nenhum ancestral.
      document.body.replaceChildren(regra);
      // fixo em 0,0: numa posição fracionária o recorte arredonda para fora
      Object.assign(regra.style, {
        position: 'fixed', top: '0', left: '0',
        width: `${w}px`, height: `${h}px`, boxSizing: 'border-box', margin: '0',
      });
      // o texto da regra é o que será digitado no SharePoint; aqui sobra a moldura
      regra.querySelector('.r-body').remove();
      regra.querySelector('.r-badge').style.display = selo ? '' : 'none';
    }, { w: CSS[0], h: CSS[1], selo });

    const alvo = path.join(SAIDA, `${arquivo}-${CSS[0] * K}x${CSS[1] * K}.png`);
    await p.locator('.regra').screenshot({ path: alvo, omitBackground: true });
    console.log(`  ${path.basename(alvo).padEnd(34)} ${(fs.statSync(alvo).size / 1024).toFixed(0)} KB`);
  }

  await browser.close();
})();

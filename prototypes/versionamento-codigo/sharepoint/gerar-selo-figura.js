/**
 * O selo "FIGURA" — a pílula azul que abre o cabeçalho de cada figura — como
 * arquivo, para as páginas do SharePoint onde a marcação do protótipo não existe.
 *
 * Fotografado do .fig-tag em diretriz-2.html, com o chapter.css carregado: cor,
 * raio, corpo e espaçamento entre letras vêm do estilo real.
 *
 *   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node sharepoint/gerar-selo-figura.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const RAIZ = path.resolve(__dirname, '..');
const ORIGEM = 'diretriz-2.html';

// A pílula mede 69,84 x 24,14 no protótipo. Arredondar para 70 x 24 tira a
// fração — num tamanho quebrado o recorte arredonda para fora e sobra uma borda
// meio transparente na volta. O conteúdo continua cabendo.
const CSS = [70, 24];
const K = 6;

(async () => {
  const browser = await chromium.launch();
  const p = await browser.newPage({
    viewport: { width: CSS[0], height: CSS[1] },
    deviceScaleFactor: K,
    colorScheme: 'light',
  });
  await p.goto(`file://${path.join(RAIZ, ORIGEM)}`);

  const texto = await p.evaluate(([w, h]) => {
    document.documentElement.classList.remove('app-dark');
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    const selo = document.querySelector('.fig-tag');
    // A regra do selo é .figure .fig-head .fig-tag, descendente: isolar o
    // elemento sozinho quebraria a cadeia e ele sairia sem pílula nem cor. A
    // figura inteira fica de pé e só os fundos opacos são apagados, senão as
    // pontas arredondadas capturam o branco do cartão em vez de transparência.
    const figura = selo.closest('.figure');
    document.body.replaceChildren(figura);
    for (const e of [figura, figura.querySelector('.fig-head')]) {
      Object.assign(e.style, { background: 'transparent', border: '0', boxShadow: 'none' });
    }
    for (const e of figura.querySelectorAll('.fig-canvas, figcaption, .fig-title, .sp-chip')) {
      e.style.display = 'none';
    }
    Object.assign(selo.style, {
      position: 'fixed', top: '0', left: '0',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      boxSizing: 'border-box', width: `${w}px`, height: `${h}px`,
    });
    return selo.textContent.trim();
  }, CSS);

  const alvo = path.join(__dirname, `selo-figura-${CSS[0] * K}x${CSS[1] * K}.png`);
  await p.locator('.fig-tag').screenshot({ path: alvo, omitBackground: true });
  await browser.close();
  console.log(`  ${path.basename(alvo)}  "${texto}"  ${(fs.statSync(alvo).size / 1024).toFixed(1)} KB`);
})();

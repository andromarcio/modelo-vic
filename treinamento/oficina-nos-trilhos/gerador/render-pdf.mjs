// HTML (páginas .pagina em A4) → PDF. Sai com erro se alguma página transborda ou se uma
// fonte da marca não carregou: o PDF sairia com a fonte de reserva, de outro desenho.
// Uso: node render-pdf.mjs <arquivo.html> <saida.pdf> [prefixo-das-previas-png]
// CHROMIUM=<caminho> usa um Chromium já instalado no lugar do baixado pelo Playwright.
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
const [html, pdf, previa] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
await p.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
const r = await p.evaluate(() => ({
  transbordam: [...document.querySelectorAll('.pagina')].map((el, i) => [i + 1, el.scrollHeight - el.clientHeight]).filter(([, s]) => s > 0),
  faltam: ['Roboto', 'JetBrains Mono'].filter((f) => ![...document.fonts].some((x) => x.family.replace(/"/g, '') === f && x.status === 'loaded')),
  paginas: document.querySelectorAll('.pagina').length,
}));
await p.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
if (previa) { const els = await p.$$('.pagina'); for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: `${previa}-p${String(i + 1).padStart(2, '0')}.png` }); }
await b.close();
console.log(`${pdf}: ${r.paginas} página(s)`);
if (r.transbordam.length) { console.error('✗ transbordam: ' + r.transbordam.map(([i, s]) => `página ${i} (+${s}px)`).join(', ')); process.exitCode = 1; }
if (r.faltam.length) { console.error('✗ fontes da marca não carregadas: ' + r.faltam.join(', ')); process.exitCode = 1; }

// Grava as figuras de figuras.js em saida/figuras/: o SVG (para os PDFs) e o PNG em 3x (para slides e roteiro).
// O PNG sai do Chromium com a Roboto do Google Fonts, a mesma dos PDFs; falha se a fonte não carregar.
// Uso: node gera-figuras.mjs   (ou npm run figuras)
import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const aqui = dirname(fileURLToPath(import.meta.url));
const { figuras } = createRequire(import.meta.url)('./figuras.js');
const pasta = join(aqui, 'saida', 'figuras');
mkdirSync(pasta, { recursive: true });

const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const p = await b.newPage({ deviceScaleFactor: 3 });
for (const [nome, gera] of Object.entries(figuras)) {
  const s = gera();
  writeFileSync(join(pasta, nome + '.svg'), s);
  await p.setContent(`<!doctype html><html><head><style>
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;0,800;0,900;1,400&display=swap');
html,body{margin:0;background:transparent} svg{display:block}</style></head><body>${s}</body></html>`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const ok = await p.evaluate(() => [...document.fonts].some((f) => f.family.replace(/"/g, '') === 'Roboto' && f.status === 'loaded'));
  if (!ok) throw new Error('Roboto não carregou: a figura sairia com a fonte de reserva');
  await (await p.$('svg')).screenshot({ path: join(pasta, nome + '.png'), omitBackground: true });
}
await b.close();
console.log(`${Object.keys(figuras).length} figuras em saida/figuras/`);

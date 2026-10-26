// Figuras da oficina "Nos trilhos do GitFlow", em SVG.
// Parte 1, o trem: trilhos com dormentes (tracejado cinza sob o trilho colorido) e vagões sobre eles.
// Parte 2, o contrato: as mesmas linhas, sem dormentes, como linhas do tempo; cada bolinha é uma versão
// rubricada (commit) e cada etiqueta laranja, um número de versão (tag).
// As cores das branches são as das ilustrações do Modelo VIC (assets/img/gitflow.svg).
// gera-figuras.mjs grava os SVGs e os PNGs em saida/figuras/; os PDFs embutem o SVG, os slides e o roteiro usam o PNG.

const COR = {
  main: '#00437a', develop: '#005ca9', feature: '#21caaf', release: '#f39200', hotfix: '#d93636',
  tinta: '#22292e', muted: '#525f66', dormente: '#c2d2d6', fantasma: '#9eb2b8', branco: '#ffffff', alerta: '#d93636',
};
// texto escuro sobre turquesa e laranja; branco sobre os demais
const TEXTO_SOBRE = { [COR.feature]: COR.tinta, [COR.release]: COR.tinta };
const FONTE = "Roboto, 'Segoe UI', system-ui, sans-serif";

function svg(w, h, corpo, rotulo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${rotulo}" font-family="${FONTE}">${corpo}</svg>`;
}
// trilho da parte 1: dormentes e trilho colorido
function trilho(d, cor) {
  return `<path d="${d}" fill="none" stroke="${COR.dormente}" stroke-width="15" stroke-dasharray="3 8"/>` +
    `<path d="${d}" fill="none" stroke="${cor}" stroke-width="5" stroke-linecap="round"/>`;
}
// linha do tempo da parte 2: só a linha colorida, ou tracejada e apagada quando é uma cópia descartada
function linha(d, cor, o = {}) {
  if (o.fantasma) return `<path d="${d}" fill="none" stroke="${COR.fantasma}" stroke-width="4" stroke-dasharray="7 7" stroke-linecap="round" opacity=".7"/>`;
  return `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${o.grosso ? 8 : 5}" stroke-linecap="round"/>`;
}
// curva de uma linha para outra: sai na horizontal e chega na horizontal
function curva(x1, y1, x2, y2) {
  const m = (x1 + x2) / 2;
  return `M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}`;
}
function versao(x, y, cor, rotulo, o = {}) {
  const r = o.r || 11;
  const ty = o.acima ? y - r - 8 : y + r + 18;
  let s = '';
  if (o.fantasma) s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${COR.branco}" stroke="${COR.fantasma}" stroke-width="3" stroke-dasharray="4 3"/>`;
  else if (o.juncao) s += `<circle cx="${x}" cy="${y}" r="${r + 4}" fill="${COR.branco}" stroke="${cor}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r - 3}" fill="${cor}"/>`;
  else s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${COR.branco}" stroke="${cor}" stroke-width="4"/>`;
  if (o.alerta) s += `<circle cx="${x}" cy="${y}" r="${r + 4}" fill="${COR.alerta}"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="18" font-weight="900" fill="${COR.branco}">!</text>`;
  if (rotulo) s += `<text x="${x}" y="${ty}" text-anchor="middle" font-size="${o.fonte || 14}" font-weight="700" fill="${o.fantasma ? COR.fantasma : COR.tinta}">${rotulo}</text>`;
  return s;
}
// etiqueta com o número da versão (tag), presa à versão da main
function etiqueta(x, y, texto) {
  const w = Math.max(60, texto.length * 8.6 + 18);
  return `<line x1="${x}" y1="${y - 13}" x2="${x}" y2="${y - 32}" stroke="${COR.muted}" stroke-width="2.5"/>` +
    `<rect x="${x - w / 2}" y="${y - 56}" width="${w}" height="24" rx="5" fill="${COR.release}"/>` +
    `<text x="${x}" y="${y - 39}" text-anchor="middle" font-size="13" font-weight="800" fill="${COR.tinta}">${texto}</text>`;
}
function pilula(x, y, texto, cor, w = 120) {
  return `<rect x="${x}" y="${y - 13}" width="${w}" height="26" rx="13" fill="${cor}"/>` +
    `<text x="${x + w / 2}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="${TEXTO_SOBRE[cor] || COR.branco}">${texto}</text>`;
}
function nota(x, y, texto, o = {}) {
  return `<text x="${x}" y="${y}" text-anchor="${o.ancora || 'middle'}" font-size="${o.fonte || 13}" font-style="${o.italico === false ? 'normal' : 'italic'}" font-weight="${o.peso || 400}" fill="${o.cor || COR.muted}">${texto}</text>`;
}

// ── o trem: vagões e locomotiva sobre o trilho em y ─────────────────────────
function rodas(x, y, w, n) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${x + 11 + i * (w - 22) / (n - 1)}" cy="${y - 6}" r="5" fill="${COR.tinta}" stroke="${COR.branco}" stroke-width="1.5"/>`;
  return s;
}
function vagao(x, y, cor, rotulo, o = {}) {
  const w = o.w || 64, h = 30, topo = y - 10 - h;
  if (o.vazio) {
    return `<rect x="${x}" y="${topo}" width="${w}" height="${h}" rx="5" fill="none" stroke="${cor}" stroke-width="2" stroke-dasharray="5 4"/>` +
      `<text x="${x + w / 2}" y="${topo + 21}" text-anchor="middle" font-size="16" font-weight="700" fill="${cor}">+</text>`;
  }
  let s = `<rect x="${x}" y="${topo}" width="${w}" height="${h}" rx="5" fill="${cor}"/>`;
  const nj = 3, lj = (w - 14) / nj;
  for (let i = 0; i < nj; i++) s += `<rect x="${x + 7 + i * lj}" y="${topo + 5}" width="${lj - 4}" height="7" rx="1.5" fill="${COR.branco}" opacity=".85"/>`;
  s += rodas(x, y, w, 2);
  if (rotulo) s += `<text x="${x + w / 2}" y="${topo + 25}" text-anchor="middle" font-size="11" font-weight="700" fill="${TEXTO_SOBRE[cor] || COR.branco}">${rotulo}</text>`;
  if (o.defeito) s += `<circle cx="${x + w - 4}" cy="${topo - 4}" r="10" fill="${COR.alerta}" stroke="${COR.branco}" stroke-width="2"/><text x="${x + w - 4}" y="${topo + 2}" text-anchor="middle" font-size="14" font-weight="900" fill="${COR.branco}">!</text>`;
  return s;
}
// locomotiva virada para a direita: corpo, cabine com janela e farol
function locomotiva(x, y, cor, o = {}) {
  const w = o.w || 70, topo = y - 10 - 30;
  return `<rect x="${x}" y="${topo}" width="${w}" height="30" rx="6" fill="${cor}"/>` +
    `<rect x="${x + w - 30}" y="${topo - 10}" width="26" height="40" rx="5" fill="${cor}"/>` +
    `<rect x="${x + w - 24}" y="${topo - 4}" width="15" height="11" rx="2" fill="${COR.branco}" opacity=".85"/>` +
    `<circle cx="${x + w - 2}" cy="${topo + 20}" r="3.5" fill="#fcbe05"/>` + rodas(x, y, w, 3);
}
// composição: locomotiva na frente (à direita) e vagões atrás, da esquerda para a direita
function composicao(x, y, cor, rotulos, o = {}) {
  const w = o.w || 64, g = 6;
  let s = '';
  rotulos.forEach((r, i) => (s += vagao(x + i * (w + g), y, cor, r === '+' ? '' : r, { w, vazio: r === '+' })));
  return s + locomotiva(x + rotulos.length * (w + g), y, cor, { w: w + 6 });
}

function trem() {
  const y = 110;
  let c = trilho(`M20 ${y} H760`, COR.main);
  c += composicao(120, y, COR.main, ['Cartões', 'Extrato', 'Pix', 'Login']);
  c += nota(290, 40, 'cada vagão é uma funcionalidade', { italico: false, peso: 700, cor: COR.main });
  c += nota(500, y + 30, 'o trem é o software', { italico: false, peso: 700, cor: COR.main });
  return svg(780, 150, c, 'Um trem com quatro vagões, Cartões, Extrato, Pix e Login, e a locomotiva na frente');
}

// a oficina: o trem segue rodando enquanto um vagão é feito no desvio
function oficina() {
  const a = 90, b = 200;
  let c = trilho(`M20 ${a} H880`, COR.main);
  c += trilho(`${curva(110, a, 190, b)} H420`, COR.feature) + trilho(curva(420, b, 500, a), COR.feature);
  c += composicao(590, a, COR.main, ['Extrato', 'Pix', 'Login']);
  c += vagao(270, b, COR.feature, 'Cartões');
  c += nota(735, a - 60, 'o trem segue rodando, com passageiros →', { ancora: 'middle' });
  c += nota(305, b + 34, 'desvio: o vagão novo é feito na oficina', { italico: false, peso: 700, cor: '#216e62' });
  c += nota(478, b - 40, 'pronto, volta e é engatado', { ancora: 'start' });
  return svg(900, 250, c, 'O trem segue rodando na linha enquanto o vagão Cartões é feito num desvio e depois volta');
}

// a malha do GitFlow com o que roda em cada trilho
function malhaTrens() {
  const Y = { main: 90, hotfix: 180, release: 270, develop: 365, feature: 455 };
  const v = { w: 52 };
  let c = '';
  c += trilho(`M150 ${Y.main} H1085`, COR.main) + trilho(`M150 ${Y.develop} H1085`, COR.develop);
  // hotfix: sai da main, volta para a main e para a develop
  c += trilho(`${curva(240, Y.main, 290, Y.hotfix)} H410`, COR.hotfix);
  c += trilho(curva(410, Y.hotfix, 460, Y.main), COR.hotfix) + trilho(curva(410, Y.hotfix, 540, Y.develop), COR.hotfix);
  // feature: sai da develop e volta para a develop
  c += trilho(`${curva(360, Y.develop, 410, Y.feature)} H600`, COR.feature) + trilho(curva(600, Y.feature, 650, Y.develop), COR.feature);
  // release: sai da develop, vai para a main e volta para a develop
  c += trilho(`${curva(690, Y.develop, 740, Y.release)} H950`, COR.release);
  c += trilho(curva(950, Y.release, 1000, Y.main), COR.release) + trilho(curva(950, Y.release, 1050, Y.develop), COR.release);
  // o que roda em cada trilho
  c += composicao(560, Y.main, COR.main, ['Cartões', 'Extrato', 'Pix'], v);
  c += composicao(160, Y.develop, COR.develop, ['+', 'Pix'], v);
  c += composicao(762, Y.release, COR.release, ['Extrato', 'Pix'], v);
  c += vagao(479, Y.feature, COR.feature, 'Cartões', v);
  c += vagao(322, Y.hotfix, COR.hotfix, 'Pix', Object.assign({ defeito: true }, v));
  // rótulos
  c += pilula(14, Y.main, 'main', COR.main) + pilula(14, Y.hotfix, 'hotfix/*', COR.hotfix) + pilula(14, Y.release, 'release/*', COR.release);
  c += pilula(14, Y.develop, 'develop', COR.develop) + pilula(14, Y.feature, 'feature/*', COR.feature);
  c += nota(690, Y.main + 30, 'linha comercial: o trem com passageiros');
  c += nota(240, Y.develop + 30, 'pátio: a próxima composição');
  c += nota(505, Y.feature + 30, 'oficina: um vagão');
  c += nota(848, Y.release + 30, 'vistoria: a composição inteira');
  c += nota(348, Y.hotfix + 30, 'emergência: o vagão com defeito');
  return svg(1100, 500, c, 'A malha do GitFlow com o que roda em cada trilho: o trem comercial na main, a próxima composição na develop, um vagão na oficina, a composição em vistoria e o vagão com defeito');
}

// ── parte 2: a linha do tempo do contrato ───────────────────────────────────
function linhaDoTempo() {
  const a = 70, b = 160;
  let c = '';
  c += linha(`M40 ${a} H660`, COR.develop);
  c += linha(`${curva(190, a, 270, b)} H390`, COR.feature);
  c += linha(curva(390, b, 470, a), COR.feature);
  c += versao(100, a, COR.develop, 'A') + versao(190, a, COR.develop, 'B');
  c += versao(300, b, COR.feature, 'F1') + versao(370, b, COR.feature, 'F2');
  c += versao(470, a, COR.develop, 'M', { juncao: true }) + versao(580, a, COR.develop, 'C');
  c += nota(100, 30, 'versão rubricada = commit', { italico: false, peso: 700, cor: COR.develop });
  c += nota(330, b + 50, 'cópia de trabalho = branch', { italico: false, peso: 700, cor: '#216e62' });
  c += nota(470, 30, 'incorporação = merge', { italico: false, peso: 700, cor: COR.develop });
  c += nota(630, a - 24, 'linha do tempo →', { ancora: 'end' });
  return svg(700, 230, c, 'Uma linha do tempo com versões rubricadas, uma cópia que sai e volta a ser incorporada');
}

// a malha completa, agora com as versões e os números de versão
function malhaContrato() {
  const Y = { main: 80, hotfix: 160, release: 240, develop: 330, feature: 410 };
  let c = '';
  c += linha(`M150 ${Y.main} H970`, COR.main);
  c += linha(`M150 ${Y.develop} H970`, COR.develop);
  // feature/a: sai da develop em 190, volta em 350
  c += linha(`${curva(190, Y.develop, 240, Y.feature)} H300`, COR.feature) + linha(curva(300, Y.feature, 350, Y.develop), COR.feature);
  // feature/b: sai em 350, ainda em redação... volta em 760
  c += linha(`${curva(350, Y.develop, 400, Y.feature)} H710`, COR.feature) + linha(curva(710, Y.feature, 760, Y.develop), COR.feature);
  // release: sai em 350, vai para a main (570) e volta para a develop (650)
  c += linha(`${curva(350, Y.develop, 400, Y.release)} H520`, COR.release);
  c += linha(curva(520, Y.release, 570, Y.main), COR.release) + linha(curva(520, Y.release, 650, Y.develop), COR.release);
  // hotfix: sai da main em 570, volta para a main (800) e para a develop (870)
  c += linha(`${curva(570, Y.main, 620, Y.hotfix)} H730`, COR.hotfix);
  c += linha(curva(730, Y.hotfix, 800, Y.main), COR.hotfix) + linha(curva(730, Y.hotfix, 870, Y.develop), COR.hotfix);
  // versões
  c += versao(190, Y.main, COR.main, '', {}) + etiqueta(190, Y.main, 'v1.0.0.12');
  c += versao(570, Y.main, COR.main, '', { juncao: true }) + etiqueta(570, Y.main, 'v1.1.0.31');
  c += versao(800, Y.main, COR.main, '', { juncao: true }) + etiqueta(800, Y.main, 'v1.1.1.33');
  c += versao(670, Y.hotfix, COR.hotfix, '');
  c += versao(440, Y.release, COR.release, '') + versao(500, Y.release, COR.release, '');
  c += versao(190, Y.develop, COR.develop, '');
  [350, 650, 760, 870].forEach((x) => (c += versao(x, Y.develop, COR.develop, '', { juncao: true })));
  c += versao(255, Y.feature, COR.feature, '') + versao(290, Y.feature, COR.feature, '');
  c += versao(440, Y.feature, COR.feature, '') + versao(560, Y.feature, COR.feature, '') + versao(680, Y.feature, COR.feature, '');
  // rótulos das linhas
  c += pilula(14, Y.main, 'main', COR.main) + pilula(14, Y.hotfix, 'hotfix/*', COR.hotfix) + pilula(14, Y.release, 'release/*', COR.release);
  c += pilula(14, Y.develop, 'develop', COR.develop) + pilula(14, Y.feature, 'feature/*', COR.feature);
  c += nota(965, Y.main - 22, 'contrato vigente', { ancora: 'end' });
  c += nota(965, Y.develop - 22, 'minuta consolidada', { ancora: 'end' });
  c += nota(270, Y.feature + 40, 'cláusula A') + nota(560, Y.feature + 40, 'cláusula B') + nota(460, Y.release + 40, 'para assinatura') + nota(675, Y.hotfix + 40, 'aditivo urgente');
  return svg(990, 470, c, 'A malha do GitFlow como linha do tempo do contrato, com os números de versão na main');
}

// ── os tipos de merge ──────────────────────────────────────────────────────
const D = 70, F = 160; // y da develop e da cópia
function base() {
  return pilula(10, D, 'develop', COR.develop, 104) + pilula(10, F, 'feature/multa', COR.feature, 104);
}
function mergeAntesFF() {
  let c = base();
  c += linha(`M130 ${D} H260`, COR.develop);
  c += linha(`${curva(260, D, 330, F)} H500`, COR.feature);
  c += versao(170, D, COR.develop, 'A') + versao(260, D, COR.develop, 'B');
  c += versao(380, F, COR.feature, 'F1') + versao(470, F, COR.feature, 'F2');
  c += nota(380, D - 26, 'a develop não andou desde B', { italico: true });
  return svg(560, 220, c, 'Antes: a cópia saiu de B e a develop não andou');
}
function mergeFF() {
  let c = pilula(10, D, 'develop', COR.develop, 104);
  c += linha(`${curva(260, D, 330, F)} H470`, COR.feature, { fantasma: true });
  c += linha(`M130 ${D} H500`, COR.develop);
  c += versao(170, D, COR.develop, 'A') + versao(260, D, COR.develop, 'B');
  c += versao(380, D, COR.develop, 'F1') + versao(470, D, COR.develop, 'F2');
  c += nota(400, F + 36, 'a cópia virou a minuta');
  return svg(560, 220, c, 'Fast-forward: as versões da cópia passam a fazer parte da develop, em linha reta');
}
function mergeAntes() {
  let c = base();
  c += linha(`M130 ${D} H360`, COR.develop);
  c += linha(`${curva(260, D, 330, F)} H480`, COR.feature);
  c += versao(170, D, COR.develop, 'A') + versao(260, D, COR.develop, 'B') + versao(350, D, COR.develop, 'C', { acima: true });
  c += versao(380, F, COR.feature, 'F1') + versao(470, F, COR.feature, 'F2');
  c += nota(460, D - 26, 'a develop andou: C', { italico: true });
  return svg(560, 220, c, 'Antes: a cópia saiu de B e a develop recebeu C enquanto isso');
}
function mergeCommit() {
  let c = base();
  c += linha(`M130 ${D} H540`, COR.develop);
  c += linha(`${curva(260, D, 330, F)} H470`, COR.feature) + linha(curva(470, F, 520, D), COR.feature);
  c += versao(170, D, COR.develop, 'A') + versao(260, D, COR.develop, 'B') + versao(350, D, COR.develop, 'C', { acima: true });
  c += versao(380, F, COR.feature, 'F1') + versao(445, F, COR.feature, 'F2');
  c += versao(520, D, COR.develop, 'M', { juncao: true, acima: true });
  return svg(560, 220, c, 'Merge commit: uma versão de junção M liga as duas linhas e a cópia fica no histórico');
}
function mergeSquash() {
  let c = base();
  c += linha(`${curva(260, D, 330, F)} H480`, COR.feature, { fantasma: true });
  c += linha(`M130 ${D} H540`, COR.develop);
  c += versao(170, D, COR.develop, 'A') + versao(260, D, COR.develop, 'B') + versao(350, D, COR.develop, 'C', { acima: true });
  c += versao(380, F, COR.feature, 'F1', { fantasma: true }) + versao(470, F, COR.feature, 'F2', { fantasma: true });
  c += versao(470, D, COR.develop, 'F1+F2', { acima: true, r: 13 });
  return svg(560, 220, c, 'Squash: as versões F1 e F2 viram uma só versão na develop; a cópia some do histórico');
}
function mergeRebase() {
  let c = base();
  c += linha(`${curva(260, D, 330, F)} H470`, COR.feature, { fantasma: true });
  c += linha(`M130 ${D} H360`, COR.develop);
  c += linha(`${curva(350, D, 410, F)} H530`, COR.feature);
  c += versao(170, D, COR.develop, 'A') + versao(260, D, COR.develop, 'B') + versao(350, D, COR.develop, 'C', { acima: true });
  c += versao(440, F, COR.feature, 'F1′') + versao(515, F, COR.feature, 'F2′');
  c += nota(330, F + 40, 'cópia antiga, descartada');
  return svg(560, 220, c, 'Rebase: a cópia é refeita a partir de C, com versões novas F1′ e F2′');
}
function conflito() {
  let c = base();
  c += linha(`M130 ${D} H540`, COR.develop);
  c += linha(`${curva(260, D, 330, F)} H440`, COR.feature) + linha(curva(440, F, 510, D), COR.feature);
  c += versao(170, D, COR.develop, 'A') + versao(260, D, COR.develop, 'B');
  c += versao(360, D, COR.develop, 'multa 1%', { acima: true });
  c += versao(400, F, COR.feature, 'multa 2%');
  c += versao(510, D, COR.develop, '', { alerta: true });
  c += nota(510, D - 28, 'qual vale?', { italico: false, peso: 800, cor: COR.alerta, fonte: 15 });
  return svg(560, 220, c, 'Conflito: a develop mudou a multa para 1% e a cópia mudou a mesma multa para 2%');
}

// ── merge back: tudo o que chega à main volta para a develop ───────────────
function mergeBack() {
  const M = 70, R = 160, Dv = 250;
  let c = pilula(10, M, 'main', COR.main, 104) + pilula(10, R, 'release/1.4.0', COR.release, 104) + pilula(10, Dv, 'develop', COR.develop, 104);
  c += linha(`M130 ${M} H640`, COR.main);
  c += linha(`M130 ${Dv} H640`, COR.develop);
  c += linha(`${curva(190, Dv, 250, R)} H400`, COR.release);
  c += linha(curva(400, R, 460, M), COR.release);
  c += linha(curva(400, R, 540, Dv), COR.release, { grosso: true });
  c += versao(170, M, COR.main, '') + etiqueta(170, M, 'v1.3.0.54');
  c += versao(460, M, COR.main, '', { juncao: true }) + etiqueta(460, M, 'v1.4.0.61');
  c += versao(290, R, COR.release, '') + versao(370, R, COR.release, 'correção');
  c += versao(190, Dv, COR.develop, '') + versao(540, Dv, COR.develop, '', { juncao: true });
  c += `<text x="555" y="${R + 22}" font-size="15" font-weight="800" fill="${COR.release}">merge back</text>`;
  c += nota(660, Dv + 40, 'a correção também entra na minuta da próxima versão', { ancora: 'end' });
  return svg(680, 300, c, 'Merge back: a release entra na main com o número v1.4.0.61 e volta para a develop com a correção');
}

// ── o visto: nada entra na develop sem pull request ─────────────────────────
function vistoPR() {
  let c = pilula(10, D, 'develop', COR.develop, 104) + pilula(10, F, 'feature/multa', COR.feature, 104);
  c += linha(`M130 ${D} H560`, COR.develop);
  c += linha(`${curva(190, D, 250, F)} H380`, COR.feature) + linha(curva(380, F, 470, D), COR.feature);
  c += versao(190, D, COR.develop, '') + versao(290, F, COR.feature, 'F1') + versao(350, F, COR.feature, 'F2');
  c += `<rect x="400" y="${F - 62}" width="54" height="30" rx="15" fill="${COR.tinta}"/><text x="427" y="${F - 41}" text-anchor="middle" font-size="14" font-weight="800" fill="${COR.branco}">PR ✓</text>`;
  c += versao(470, D, COR.develop, 'merge', { juncao: true, acima: true });
  return svg(600, 210, c, 'O visto do pull request: a cópia só entra na develop depois da aprovação e da completude');
}

// ── gabarito da Dinâmica 3: a vida de uma versão ────────────────────────────
function gabaritoD3() {
  const Y = { main: 80, hotfix: 160, release: 240, develop: 330, f1: 410, f2: 480 };
  let c = '';
  c += linha(`M150 ${Y.main} H990`, COR.main) + linha(`M150 ${Y.develop} H990`, COR.develop);
  // 1. assinatura digital: sai em 190, volta em 380 (3)
  c += linha(`${curva(190, Y.develop, 240, Y.f1)} H330`, COR.feature) + linha(curva(330, Y.f1, 380, Y.develop), COR.feature);
  // 2. alerta de vencimento: sai em 230, volta em 900 (8)
  c += linha(`${curva(230, Y.develop, 280, Y.f2)} H850`, COR.feature) + linha(curva(850, Y.f2, 900, Y.develop), COR.feature);
  // 4-6. release/2.4.0: sai em 380, correção, entra na main (560) e volta (620)
  c += linha(`${curva(380, Y.develop, 430, Y.release)} H510`, COR.release);
  c += linha(curva(510, Y.release, 560, Y.main), COR.release) + linha(curva(510, Y.release, 620, Y.develop), COR.release);
  // 7. hotfix/2.4.1: sai da main em 560, entra na main (760) e na develop (820)
  c += linha(`${curva(560, Y.main, 610, Y.hotfix)} H700`, COR.hotfix);
  c += linha(curva(700, Y.hotfix, 760, Y.main), COR.hotfix) + linha(curva(700, Y.hotfix, 820, Y.develop), COR.hotfix);
  c += versao(190, Y.main, COR.main, '') + etiqueta(190, Y.main, 'v2.3.0.97');
  c += versao(560, Y.main, COR.main, '', { juncao: true }) + etiqueta(560, Y.main, 'v2.4.0.118');
  c += versao(760, Y.main, COR.main, '', { juncao: true }) + etiqueta(760, Y.main, 'v2.4.1.121');
  c += versao(655, Y.hotfix, COR.hotfix, '7', { acima: true });
  c += versao(470, Y.release, COR.release, '5', { acima: true });
  c += versao(190, Y.develop, COR.develop, '') + versao(230, Y.develop, COR.develop, '');
  [[380, '3'], [620, '6'], [820, '7'], [900, '8']].forEach(([x, n]) => (c += versao(x, Y.develop, COR.develop, n, { juncao: true })));
  c += versao(285, Y.f1, COR.feature, '1');
  c += versao(380, Y.f2, COR.feature, '2') + versao(600, Y.f2, COR.feature, '') + versao(800, Y.f2, COR.feature, '');
  c += pilula(14, Y.main, 'main', COR.main, 126) + pilula(14, Y.hotfix, 'hotfix/2.4.1', COR.hotfix, 126) + pilula(14, Y.release, 'release/2.4.0', COR.release, 126);
  c += pilula(14, Y.develop, 'develop', COR.develop, 126);
  c += pilula(14, Y.f1, 'feature/assinatura', COR.feature, 126) + pilula(14, Y.f2, 'feature/alerta', COR.feature, 126);
  return svg(1010, 520, c, 'Gabarito da Dinâmica 3: a linha do tempo do Contratos Online com os eventos numerados');
}

module.exports = {
  COR,
  figuras: {
    trem, oficina, 'malha-trens': malhaTrens,
    'linha-do-tempo': linhaDoTempo, 'malha-contrato': malhaContrato,
    'merge-antes-ff': mergeAntesFF, 'merge-ff': mergeFF, 'merge-antes': mergeAntes,
    'merge-commit': mergeCommit, 'merge-squash': mergeSquash, 'merge-rebase': mergeRebase, conflito,
    'merge-back': mergeBack, 'visto-pr': vistoPR, 'gabarito-d3': gabaritoD3,
  },
};

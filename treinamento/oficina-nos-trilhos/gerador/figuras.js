// Figuras da oficina "Nos trilhos do GitFlow": a ferrovia desenhada em SVG.
// Cada trilho tem dormentes (tracejado cinza) sob o trilho colorido; cada commit é uma estação;
// cada tag é uma placa. As cores das branches são as das ilustrações do Modelo VIC (assets/img/gitflow.svg).
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
function trilho(d, cor, o = {}) {
  if (o.fantasma) return `<path d="${d}" fill="none" stroke="${COR.fantasma}" stroke-width="4" stroke-dasharray="7 7" stroke-linecap="round" opacity=".7"/>`;
  return `<path d="${d}" fill="none" stroke="${COR.dormente}" stroke-width="15" stroke-dasharray="3 8"/>` +
    `<path d="${d}" fill="none" stroke="${cor}" stroke-width="${o.grosso ? 8 : 5}" stroke-linecap="round"/>`;
}
// curva de um trilho para outro: sai na horizontal e chega na horizontal
function curva(x1, y1, x2, y2) {
  const m = (x1 + x2) / 2;
  return `M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}`;
}
function estacao(x, y, cor, rotulo, o = {}) {
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
// placa de estação (tag de versão): poste e placa laranja acima do ponto
function placa(x, y, texto) {
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
// cancela de passagem de nível: poste e braço listrado
function cancela(x, y) {
  let s = `<rect x="${x - 5}" y="${y - 10}" width="10" height="44" rx="2" fill="${COR.muted}"/>`;
  for (let i = 0; i < 6; i++) s += `<rect x="${x + 4 + i * 14}" y="${y - 10}" width="14" height="9" fill="${i % 2 ? COR.branco : COR.alerta}" stroke="${COR.alerta}" stroke-width="1"/>`;
  return s;
}

// ── trilho único e desvio: os conceitos básicos ────────────────────────────
function desvio() {
  const a = 70, b = 160;
  let c = '';
  c += trilho(`M40 ${a} H660`, COR.develop);
  c += trilho(`${curva(190, a, 270, b)} H390`, COR.feature);
  c += trilho(curva(390, b, 470, a), COR.feature);
  c += estacao(100, a, COR.develop, 'A') + estacao(190, a, COR.develop, 'B');
  c += estacao(300, b, COR.feature, 'F1') + estacao(370, b, COR.feature, 'F2');
  c += estacao(470, a, COR.develop, 'M', { juncao: true }) + estacao(580, a, COR.develop, 'C');
  c += nota(100, 30, 'estação = commit', { italico: false, peso: 700, cor: COR.develop });
  c += nota(330, b + 50, 'desvio = branch', { italico: false, peso: 700, cor: '#216e62' });
  c += nota(470, 30, 'entroncamento = merge', { italico: false, peso: 700, cor: COR.develop });
  c += nota(630, a - 24, 'trilho = linha do tempo →', { ancora: 'end' });
  return svg(700, 230, c, 'Um trilho com estações, um desvio que sai e volta por um entroncamento');
}

// ── a malha completa do GitFlow ────────────────────────────────────────────
function malha() {
  const Y = { main: 80, hotfix: 160, release: 240, develop: 330, feature: 410 };
  let c = '';
  c += trilho(`M150 ${Y.main} H970`, COR.main);
  c += trilho(`M150 ${Y.develop} H970`, COR.develop);
  // feature/a: sai da develop em 190, volta em 350
  c += trilho(`${curva(190, Y.develop, 240, Y.feature)} H300`, COR.feature) + trilho(curva(300, Y.feature, 350, Y.develop), COR.feature);
  // feature/b: sai em 350, ainda em obras... volta em 760
  c += trilho(`${curva(350, Y.develop, 400, Y.feature)} H710`, COR.feature) + trilho(curva(710, Y.feature, 760, Y.develop), COR.feature);
  // release: sai em 350, vai para a main (570) e volta para a develop (650)
  c += trilho(`${curva(350, Y.develop, 400, Y.release)} H520`, COR.release);
  c += trilho(curva(520, Y.release, 570, Y.main), COR.release) + trilho(curva(520, Y.release, 650, Y.develop), COR.release);
  // hotfix: sai da main em 570, volta para a main (800) e para a develop (870)
  c += trilho(`${curva(570, Y.main, 620, Y.hotfix)} H730`, COR.hotfix);
  c += trilho(curva(730, Y.hotfix, 800, Y.main), COR.hotfix) + trilho(curva(730, Y.hotfix, 870, Y.develop), COR.hotfix);
  // estações
  c += estacao(190, Y.main, COR.main, '', {}) + placa(190, Y.main, 'v1.0.0.12');
  c += estacao(570, Y.main, COR.main, '', { juncao: true }) + placa(570, Y.main, 'v1.1.0.31');
  c += estacao(800, Y.main, COR.main, '', { juncao: true }) + placa(800, Y.main, 'v1.1.1.33');
  c += estacao(670, Y.hotfix, COR.hotfix, '');
  c += estacao(440, Y.release, COR.release, '') + estacao(500, Y.release, COR.release, '');
  [190].forEach((x) => (c += estacao(x, Y.develop, COR.develop, '')));
  [350, 650, 760, 870].forEach((x) => (c += estacao(x, Y.develop, COR.develop, '', { juncao: true })));
  c += estacao(255, Y.feature, COR.feature, '') + estacao(290, Y.feature, COR.feature, '');
  c += estacao(440, Y.feature, COR.feature, '') + estacao(560, Y.feature, COR.feature, '') + estacao(680, Y.feature, COR.feature, '');
  // rótulos das linhas
  c += pilula(14, Y.main, 'main', COR.main) + pilula(14, Y.hotfix, 'hotfix/*', COR.hotfix) + pilula(14, Y.release, 'release/*', COR.release);
  c += pilula(14, Y.develop, 'develop', COR.develop) + pilula(14, Y.feature, 'feature/*', COR.feature);
  c += nota(965, Y.main - 22, 'linha em operação', { ancora: 'end' });
  c += nota(965, Y.develop - 22, 'próxima composição', { ancora: 'end' });
  c += nota(270, Y.feature + 40, 'obra A') + nota(560, Y.feature + 40, 'obra B') + nota(460, Y.release + 40, 'vistoria') + nota(675, Y.hotfix + 40, 'emergência');
  return svg(990, 470, c, 'A malha do GitFlow: main, hotfix, release, develop e feature, com as placas de versão na main');
}

// ── os tipos de merge ──────────────────────────────────────────────────────
const D = 70, F = 160; // y da develop e do desvio
function base(o) {
  let c = pilula(10, D, 'develop', COR.develop, 104) + pilula(10, F, 'feature/multa', COR.feature, 104);
  return c;
}
function mergeAntesFF() {
  let c = base();
  c += trilho(`M130 ${D} H260`, COR.develop);
  c += trilho(`${curva(260, D, 330, F)} H500`, COR.feature);
  c += estacao(170, D, COR.develop, 'A') + estacao(260, D, COR.develop, 'B');
  c += estacao(380, F, COR.feature, 'F1') + estacao(470, F, COR.feature, 'F2');
  c += nota(380, D - 26, 'a develop não andou desde B', { italico: true });
  return svg(560, 220, c, 'Antes: o desvio saiu de B e a develop não andou');
}
function mergeFF() {
  let c = pilula(10, D, 'develop', COR.develop, 104);
  c += trilho(`${curva(260, D, 330, F)} H470`, COR.feature, { fantasma: true });
  c += trilho(`M130 ${D} H500`, COR.develop);
  c += estacao(170, D, COR.develop, 'A') + estacao(260, D, COR.develop, 'B');
  c += estacao(380, D, COR.develop, 'F1') + estacao(470, D, COR.develop, 'F2');
  c += nota(400, F + 36, 'o desvio virou parte da linha');
  return svg(560, 220, c, 'Fast-forward: as estações do desvio passam a fazer parte da linha, em linha reta');
}
function mergeAntes() {
  let c = base();
  c += trilho(`M130 ${D} H360`, COR.develop);
  c += trilho(`${curva(260, D, 330, F)} H480`, COR.feature);
  c += estacao(170, D, COR.develop, 'A') + estacao(260, D, COR.develop, 'B') + estacao(350, D, COR.develop, 'C', { acima: true });
  c += estacao(380, F, COR.feature, 'F1') + estacao(470, F, COR.feature, 'F2');
  c += nota(460, D - 26, 'a develop andou: C', { italico: true });
  return svg(560, 220, c, 'Antes: o desvio saiu de B e a develop recebeu C enquanto isso');
}
function mergeCommit() {
  let c = base();
  c += trilho(`M130 ${D} H540`, COR.develop);
  c += trilho(`${curva(260, D, 330, F)} H470`, COR.feature) + trilho(curva(470, F, 520, D), COR.feature);
  c += estacao(170, D, COR.develop, 'A') + estacao(260, D, COR.develop, 'B') + estacao(350, D, COR.develop, 'C', { acima: true });
  c += estacao(380, F, COR.feature, 'F1') + estacao(445, F, COR.feature, 'F2');
  c += estacao(520, D, COR.develop, 'M', { juncao: true, acima: true });
  return svg(560, 220, c, 'Merge commit: um entroncamento M liga os dois trilhos e o desvio fica no histórico');
}
function mergeSquash() {
  let c = base();
  c += trilho(`${curva(260, D, 330, F)} H480`, COR.feature, { fantasma: true });
  c += trilho(`M130 ${D} H540`, COR.develop);
  c += estacao(170, D, COR.develop, 'A') + estacao(260, D, COR.develop, 'B') + estacao(350, D, COR.develop, 'C', { acima: true });
  c += estacao(380, F, COR.feature, 'F1', { fantasma: true }) + estacao(470, F, COR.feature, 'F2', { fantasma: true });
  c += estacao(470, D, COR.develop, 'F1+F2', { acima: true, r: 13 });
  return svg(560, 220, c, 'Squash: as estações F1 e F2 viram uma só estação na develop; o desvio some do histórico');
}
function mergeRebase() {
  let c = base();
  c += trilho(`${curva(260, D, 330, F)} H470`, COR.feature, { fantasma: true });
  c += trilho(`M130 ${D} H360`, COR.develop);
  c += trilho(`${curva(350, D, 410, F)} H530`, COR.feature);
  c += estacao(170, D, COR.develop, 'A') + estacao(260, D, COR.develop, 'B') + estacao(350, D, COR.develop, 'C', { acima: true });
  c += estacao(440, F, COR.feature, 'F1′') + estacao(515, F, COR.feature, 'F2′');
  c += nota(330, F + 40, 'trilho antigo, desmontado');
  return svg(560, 220, c, 'Rebase: o desvio é reassentado a partir de C, com estações novas F1′ e F2′');
}
function conflito() {
  let c = base();
  c += trilho(`M130 ${D} H540`, COR.develop);
  c += trilho(`${curva(260, D, 330, F)} H440`, COR.feature) + trilho(curva(440, F, 510, D), COR.feature);
  c += estacao(170, D, COR.develop, 'A') + estacao(260, D, COR.develop, 'B');
  c += estacao(360, D, COR.develop, 'multa 1%', { acima: true });
  c += estacao(400, F, COR.feature, 'multa 2%');
  c += estacao(510, D, COR.develop, '', { alerta: true });
  c += nota(510, D - 28, 'qual vale?', { italico: false, peso: 800, cor: COR.alerta, fonte: 15 });
  return svg(560, 220, c, 'Conflito: a develop mudou a multa para 1% e o desvio mudou a mesma multa para 2%');
}

// ── merge back: tudo o que chega à main volta para a develop ───────────────
function mergeBack() {
  const M = 70, R = 160, Dv = 250;
  let c = pilula(10, M, 'main', COR.main, 104) + pilula(10, R, 'release/1.4.0', COR.release, 104) + pilula(10, Dv, 'develop', COR.develop, 104);
  c += trilho(`M130 ${M} H640`, COR.main);
  c += trilho(`M130 ${Dv} H640`, COR.develop);
  c += trilho(`${curva(190, Dv, 250, R)} H400`, COR.release);
  c += trilho(curva(400, R, 460, M), COR.release);
  c += trilho(curva(400, R, 540, Dv), COR.release, { grosso: true });
  c += estacao(170, M, COR.main, '') + placa(170, M, 'v1.3.0.54');
  c += estacao(460, M, COR.main, '', { juncao: true }) + placa(460, M, 'v1.4.0.61');
  c += estacao(290, R, COR.release, '') + estacao(370, R, COR.release, 'correção');
  c += estacao(190, Dv, COR.develop, '') + estacao(540, Dv, COR.develop, '', { juncao: true });
  c += `<text x="555" y="${R + 22}" font-size="15" font-weight="800" fill="${COR.release}">merge back</text>`;
  c += nota(660, Dv + 40, 'a correção também chega à próxima composição', { ancora: 'end' });
  return svg(680, 300, c, 'Merge back: a release entra na main com a placa v1.4.0 e volta para a develop com a correção');
}

// ── a cancela: ninguém entra na linha sem passar pelo pull request ─────────
function cancelaPR() {
  let c = pilula(10, D, 'develop', COR.develop, 104) + pilula(10, F, 'feature/multa', COR.feature, 104);
  c += trilho(`M130 ${D} H560`, COR.develop);
  c += trilho(`${curva(190, D, 250, F)} H380`, COR.feature) + trilho(curva(380, F, 470, D), COR.feature);
  c += estacao(190, D, COR.develop, '') + estacao(290, F, COR.feature, 'F1') + estacao(350, F, COR.feature, 'F2');
  c += cancela(420, F - 50);
  c += estacao(470, D, COR.develop, 'merge', { juncao: true, acima: true });
  return svg(600, 210, c, 'A cancela do pull request: o desvio só entra na develop depois da aprovação e da completude');
}

// ── gabarito da Dinâmica 3: a viagem do Contratos Online ───────────────────
function gabaritoD3() {
  const Y = { main: 80, hotfix: 160, release: 240, develop: 330, f1: 410, f2: 480 };
  let c = '';
  c += trilho(`M150 ${Y.main} H990`, COR.main) + trilho(`M150 ${Y.develop} H990`, COR.develop);
  // 1. assinatura digital: sai em 190, volta em 380 (3)
  c += trilho(`${curva(190, Y.develop, 240, Y.f1)} H330`, COR.feature) + trilho(curva(330, Y.f1, 380, Y.develop), COR.feature);
  // 2. alerta de vencimento: sai em 230, volta em 900 (8)
  c += trilho(`${curva(230, Y.develop, 280, Y.f2)} H850`, COR.feature) + trilho(curva(850, Y.f2, 900, Y.develop), COR.feature);
  // 4-6. release/2.4.0: sai em 380, correção, entra na main (560) e volta (620)
  c += trilho(`${curva(380, Y.develop, 430, Y.release)} H510`, COR.release);
  c += trilho(curva(510, Y.release, 560, Y.main), COR.release) + trilho(curva(510, Y.release, 620, Y.develop), COR.release);
  // 7. hotfix/2.4.1: sai da main em 560, entra na main (760) e na develop (820)
  c += trilho(`${curva(560, Y.main, 610, Y.hotfix)} H700`, COR.hotfix);
  c += trilho(curva(700, Y.hotfix, 760, Y.main), COR.hotfix) + trilho(curva(700, Y.hotfix, 820, Y.develop), COR.hotfix);
  c += estacao(190, Y.main, COR.main, '') + placa(190, Y.main, 'v2.3.0.97');
  c += estacao(560, Y.main, COR.main, '', { juncao: true }) + placa(560, Y.main, 'v2.4.0.118');
  c += estacao(760, Y.main, COR.main, '', { juncao: true }) + placa(760, Y.main, 'v2.4.1.121');
  c += estacao(655, Y.hotfix, COR.hotfix, '7', { acima: true });
  c += estacao(470, Y.release, COR.release, '5', { acima: true });
  c += estacao(190, Y.develop, COR.develop, '') + estacao(230, Y.develop, COR.develop, '');
  [[380, '3'], [620, '6'], [820, '7'], [900, '8']].forEach(([x, n]) => (c += estacao(x, Y.develop, COR.develop, n, { juncao: true })));
  c += estacao(285, Y.f1, COR.feature, '1');
  c += estacao(330 + 50, Y.f2, COR.feature, '2') + estacao(600, Y.f2, COR.feature, '') + estacao(800, Y.f2, COR.feature, '');
  c += pilula(14, Y.main, 'main', COR.main, 126) + pilula(14, Y.hotfix, 'hotfix/2.4.1', COR.hotfix, 126) + pilula(14, Y.release, 'release/2.4.0', COR.release, 126);
  c += pilula(14, Y.develop, 'develop', COR.develop, 126);
  c += pilula(14, Y.f1, 'feature/assinatura', COR.feature, 126) + pilula(14, Y.f2, 'feature/alerta', COR.feature, 126);
  return svg(1010, 520, c, 'Gabarito da Dinâmica 3: a malha do Contratos Online com os eventos numerados');
}

module.exports = {
  COR,
  figuras: {
    desvio, malha, 'merge-antes-ff': mergeAntesFF, 'merge-ff': mergeFF, 'merge-antes': mergeAntes,
    'merge-commit': mergeCommit, 'merge-squash': mergeSquash, 'merge-rebase': mergeRebase, conflito,
    'merge-back': mergeBack, 'cancela-pr': cancelaPR, 'gabarito-d3': gabaritoD3,
  },
};

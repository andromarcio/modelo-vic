// Gera os slides da oficina "Nos trilhos do GitFlow" na identidade do Modelo VIC.
// Uso: node gera-slides.js <saida.pptx>   (ou npm run slides; as figuras vêm antes, de npm run figuras)
const pptxgen = require('pptxgenjs');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const md = require('react-icons/md');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const SAIDA = process.argv[2];
const MARCA = path.join(__dirname, '..', '..', '..', 'prototypes', 'versionamento-codigo', 'assets', 'brand');
const FIGURAS = path.join(__dirname, 'saida', 'figuras');

// ── Identidade VIC (prototypes/versionamento-codigo/marca-vic.html) ────────
const HEX = {
  tinta: '22292E', escuro: '00437A', azul: '005CA9', laranja: 'F39200', teal: '21CAAF', vermelho: 'D93636',
  tint: 'E5F2FC', muted: '525F66', branco: 'FFFFFF', papel: 'F5F8FA',
};
const THEME = {
  name: 'Modelo VIC',
  headFontFace: 'Segoe UI',
  bodyFontFace: 'Segoe UI',
  colors: {
    dk1: HEX.tinta, lt1: HEX.branco, dk2: HEX.escuro, lt2: HEX.papel,
    accent1: HEX.azul, accent2: HEX.laranja, accent3: HEX.teal, accent4: HEX.vermelho,
    accent5: HEX.tint, accent6: HEX.muted, hlink: HEX.azul, folHlink: HEX.muted,
  },
};
const MONO = 'Consolas';

// O pptxgenjs não grava as cores do tema: sem isto, as cores de esquema (C.accent1…) saem
// com a paleta padrão do Office. Troca o esquema de cores e as fontes de cada theme*.xml.
async function aplicaTema(arquivo, tema) {
  const zip = await JSZip.loadAsync(fs.readFileSync(arquivo));
  const chaves = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
  const esquema = `<a:clrScheme name="${tema.name}">` + chaves.map((k) => `<a:${k}><a:srgbClr val="${tema.colors[k]}"/></a:${k}>`).join('') + '</a:clrScheme>';
  const temas = Object.keys(zip.files).filter((n) => /^ppt\/theme\/theme\d+\.xml$/.test(n));
  for (const n of temas) {
    const antes = await zip.file(n).async('string');
    const depois = antes
      .replace(/<a:clrScheme [^>]*>[\s\S]*?<\/a:clrScheme>/, esquema)
      .replace(/(<a:majorFont>\s*<a:latin typeface=")[^"]*"/, `$1${tema.headFontFace}"`)
      .replace(/(<a:minorFont>\s*<a:latin typeface=")[^"]*"/, `$1${tema.bodyFontFace}"`);
    if (!depois.includes(`val="${tema.colors.accent2}"`)) throw new Error('tema não aplicado em ' + n);
    zip.file(n, depois);
  }
  fs.writeFileSync(arquivo, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'Nos trilhos do GitFlow — branches, merges e o Modelo VIC';
pres.author = 'Modelo VIC';
pres.company = 'CAIXA';
const C = pres.SchemeColor;
const K = {
  tinta: C.text1, escuro: C.text2, azul: C.accent1, laranja: C.accent2, teal: C.accent3, vermelho: C.accent4,
  tint: C.accent5, muted: C.accent6, branco: C.background1, papel: C.background2,
};

const W = 13.333;
const logo = path.join(MARCA, 'vic-logo-horizontal.png');     // 3.605:1
const logoNeg = path.join(MARCA, 'vic-logo-negative.png');    // 3.605:1
const icone = path.join(MARCA, 'vic-icon.png');               // 1:1

// ── Ícones (react-icons → PNG) ─────────────────────────────────────────────
async function iconePng(nome, cor) {
  const Comp = md[nome];
  if (!Comp) throw new Error('ícone inexistente: ' + nome);
  const svg = renderToStaticMarkup(React.createElement(Comp, { color: '#' + cor, size: 256 }));
  const buf = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return 'image/png;base64,' + buf.toString('base64');
}

// ── Layouts ────────────────────────────────────────────────────────────────
// a linha de commits da marca: trilhos horizontais com estações; a última estação é o acento
function linhas(objetos, x, y, larg, corLinha, corEstacao, corAcento) {
  const trilhos = [[0, 1], [0.55, 0.78], [1.1, 0.56]];
  trilhos.forEach(([dy, p], i) => {
    const w = larg * p, x0 = x + larg - w;
    objetos.push({ rect: { x: x0, y: y + dy, w, h: 0.07, fill: { color: corLinha } } });
    [0.15, 0.5, 0.85].forEach((f, j) => {
      const acento = i === 2 && j === 2;
      objetos.push({ text: { text: '', options: { shape: pres.shapes.OVAL, x: x0 + w * f - 0.13, y: y + dy - 0.095, w: 0.26, h: 0.26, fill: { color: acento ? corAcento : corEstacao }, line: { color: corLinha, width: 2 } } } });
    });
  });
}

const objCapa = [
  { image: { path: logoNeg, x: 0.55, y: 0.5, w: 3.9, h: 3.9 / 3.605 } },
  { placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 2.1, w: 8.2, h: 1.8, fontSize: 54, bold: true, color: K.branco, align: 'left', valign: 'top', margin: 0 }, text: '' } },
  { placeholder: { options: { name: 'subtitulo', type: 'body', x: 0.7, y: 4.0, w: 7.6, h: 1.2, fontSize: 20, color: K.branco, valign: 'top', margin: 0 }, text: '' } },
  { placeholder: { options: { name: 'rodape', type: 'body', x: 0.7, y: 6.45, w: 7.4, h: 0.4, fontSize: 14, color: K.teal, fontFace: MONO, valign: 'top', margin: 0 }, text: '' } },
];
pres.defineSlideMaster({ title: 'CAPA', background: { color: K.escuro }, objects: objCapa });

const objDivisor = [
  { placeholder: { options: { name: 'numero', type: 'body', x: 0.8, y: 1.45, w: 3, h: 1.6, fontSize: 96, bold: true, color: K.laranja, align: 'left', valign: 'top', margin: 0 }, text: '' } },
  { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 3.2, w: 8.2, h: 1.2, fontSize: 44, bold: true, color: K.branco, align: 'left', valign: 'top', margin: 0 }, text: '' } },
  { placeholder: { options: { name: 'subtitulo', type: 'body', x: 0.8, y: 4.45, w: 8.2, h: 0.9, fontSize: 20, color: K.branco, align: 'left', valign: 'top', margin: 0 }, text: '' } },
];
linhas(objDivisor, 9.3, 2.6, 3.2, K.branco, K.azul, K.laranja);
// o intervalo não tem número: com o placeholder vazio, o PowerPoint mostraria "Clique para adicionar texto" a 96 pt.
// Cópia feita antes do DIVISOR: o defineSlideMaster reescreve os objetos que recebe (nome e índice do placeholder).
const objIntervalo = JSON.parse(JSON.stringify(objDivisor.slice(1)));
pres.defineSlideMaster({ title: 'DIVISOR', background: { color: K.azul }, objects: objDivisor });
pres.defineSlideMaster({ title: 'INTERVALO', background: { color: K.azul }, objects: objIntervalo });

pres.defineSlideMaster({
  title: 'CONTEUDO',
  background: { color: K.papel },
  margin: [0.5, 0.6, 0.7, 0.6],
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.42, w: 12.1, h: 0.9, fontSize: 32, bold: true, color: K.azul, align: 'left', valign: 'middle', margin: 0 }, text: '' } },
    { image: { path: icone, x: 0.6, y: 6.96, w: 0.32, h: 0.32 } },
    { text: { text: 'Modelo VIC · Nos trilhos do GitFlow', options: { x: 1.02, y: 6.97, w: 6, h: 0.3, fontSize: 10, color: K.muted, margin: 0, valign: 'middle' } } },
  ],
  slideNumber: { x: 12.2, y: 6.97, w: 0.5, h: 0.3, fontSize: 10, color: K.muted, align: 'right' },
});

pres.defineSlideMaster({
  title: 'FIM',
  background: { color: K.papel },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: 0.8, y: 1.9, w: 11.7, h: 1.5, fontSize: 60, bold: true, color: K.escuro, align: 'center', valign: 'middle', margin: 0 }, text: '' } },
    { placeholder: { options: { name: 'subtitulo', type: 'body', x: 0.8, y: 3.45, w: 11.7, h: 0.8, fontSize: 22, color: K.tinta, align: 'center', valign: 'top', margin: 0 }, text: '' } },
    { image: { path: logo, x: (W - 4.4) / 2, y: 5.0, w: 4.4, h: 4.4 / 3.605 } },
  ],
});

// ── Peças reutilizáveis ────────────────────────────────────────────────────
let secao = '';
function slide(layout) { return pres.addSlide({ masterName: layout, sectionTitle: secao }); }
function texto(s, t, o) { s.addText(t, Object.assign({ isTextBox: true, margin: 0, color: K.tinta, fontSize: 16, valign: 'top' }, o)); }
function cartao(s, x, y, w, h, cor, nome) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: cor || K.branco }, line: { type: 'none' }, rectRadius: 0.12, objectName: nome });
}
function moldura(s, x, y, w, h, cor, nome) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: K.branco }, line: { color: cor, width: 2 }, rectRadius: 0.12, objectName: nome });
}
// faixa colorida no topo de um cartão: identifica o trilho (main, develop, feature…)
function faixa(s, x, y, w, cor, t, corTexto) {
  s.addText(t, { isTextBox: true, x, y, w, h: 0.5, fill: { color: cor }, color: corTexto || K.branco, fontFace: MONO, fontSize: 18, bold: true, align: 'center', valign: 'middle', margin: 0, objectName: 'faixa ' + t });
}
async function bolinha(s, x, y, d, nomeIcone, corFundo, corIcone) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: corFundo || K.azul }, line: { type: 'none' }, objectName: 'circulo ' + nomeIcone });
  const p = d * 0.2;
  s.addImage({ data: await iconePng(nomeIcone, corIcone || HEX.branco), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, objectName: 'icone ' + nomeIcone });
}
function carimbo(s, t, x, y, w) {
  s.addText(t, { isTextBox: true, x, y, w, h: 0.5, fontFace: MONO, fontSize: 16, bold: true, color: K.azul, align: 'center', valign: 'middle', margin: 0,
    line: { color: K.azul, width: 1.5, dashType: 'dash' }, rotate: -2, objectName: 'carimbo' });
}
function numeroRedondo(s, x, y, d, n, cor, corTexto) {
  s.addText(String(n), { isTextBox: true, x, y, w: d, h: d, shape: pres.shapes.OVAL, fill: { color: cor || K.azul }, color: corTexto || K.branco, bold: true, fontSize: 18, align: 'center', valign: 'middle', margin: 0, objectName: 'numero ' + n });
}
const proporcao = {};
async function figura(s, nome, x, y, w, alt) {
  const arq = path.join(FIGURAS, nome + '.png');
  if (!proporcao[nome]) { const m = await sharp(arq).metadata(); proporcao[nome] = m.width / m.height; }
  s.addImage({ path: arq, x, y, w, h: w / proporcao[nome], altText: alt || nome, objectName: 'figura ' + nome });
  return w / proporcao[nome];
}
// os slides de cada tipo de merge têm o mesmo desenho: figura à esquerda, quatro blocos à direita
async function slideMerge(titulo, fig, blocos, notas) {
  const s = slide('CONTEUDO');
  s.addText(titulo, { placeholder: 'title' });
  cartao(s, 0.6, 1.55, 6.2, 4.3, K.branco, 'fundo figura');
  await figura(s, fig, 0.75, 2.2, 5.9);
  const cores = [K.azul, K.escuro, K.teal, K.vermelho];
  blocos.forEach(([rot, t], i) => {
    const y = 1.55 + i * 1.32;
    s.addShape(pres.shapes.RECTANGLE, { x: 7.15, y, w: 0.08, h: 1.12, fill: { color: cores[i] }, line: { type: 'none' }, objectName: 'barra ' + rot });
    texto(s, rot, { x: 7.4, y, w: 5.3, h: 0.35, fontSize: 14, bold: true, color: cores[i] === K.teal ? K.tinta : cores[i] });
    texto(s, t, { x: 7.4, y: y + 0.36, w: 5.3, h: 0.8, fontSize: 14 });
  });
  s.addNotes(notas);
  return s;
}
function tabela(s, linhas, o) {
  const cab = linhas[0].map((t) => ({ text: t, options: { bold: true, color: K.branco, fill: { color: K.azul } } }));
  const corpo = linhas.slice(1).map((l) => l.map((t) => (typeof t === 'string' ? { text: t } : t)));
  s.addTable([cab, ...corpo], Object.assign({ fontFace: 'Segoe UI', fontSize: 14, color: K.tinta, fill: { color: K.branco }, border: { type: 'solid', pt: 1, color: 'C2D2D6' }, margin: [4, 8, 4, 8], valign: 'middle' }, o));
}

(async () => {
  // ═══ ABERTURA ═══════════════════════════════════════════════════════════
  secao = 'Abertura';
  pres.addSection({ title: secao });
  {
    const s = slide('CAPA');
    s.addText('Nos trilhos do GitFlow', { placeholder: 'title' });
    s.addText('Branches, merges e o Modelo VIC — oficina para quem nunca escreveu uma linha de código', { placeholder: 'subtitulo' });
    s.addText('versionamento e integração de código', { placeholder: 'rodape' });
    // ilustração: a malha vista de cima, com as cores das branches
    const tr = [[1.6, HEX.branco, 9.2, 3.4], [2.6, HEX.laranja, 9.8, 2.6], [3.6, HEX.azul, 9.2, 3.4], [4.6, HEX.teal, 10.1, 2.2]];
    tr.forEach(([y, cor, x, w], i) => {
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.08, fill: { color: cor }, line: { type: 'none' }, objectName: 'trilho capa ' + i });
      for (let k = 0; k < 3; k++) s.addShape(pres.shapes.OVAL, { x: x + 0.3 + k * (w - 0.6) / 2 - 0.16, y: y - 0.12, w: 0.32, h: 0.32, fill: { color: HEX.escuro }, line: { color: cor, width: 3 }, objectName: 'estacao capa' });
    });
    s.addShape(pres.shapes.RECTANGLE, { x: 11.6, y: 0.95, w: 1.15, h: 0.42, fill: { color: HEX.laranja }, line: { type: 'none' }, rectRadius: 0.05, objectName: 'placa capa' });
    texto(s, 'v1.0', { x: 11.6, y: 0.95, w: 1.15, h: 0.42, fontSize: 16, bold: true, fontFace: MONO, align: 'center', valign: 'middle', color: K.tinta });
    s.addShape(pres.shapes.RECTANGLE, { x: 12.16, y: 1.37, w: 0.04, h: 0.23, fill: { color: HEX.branco }, line: { type: 'none' }, objectName: 'poste capa' });
    s.addNotes('Boas-vindas. A oficina tem 3 horas, com um intervalo, e três dinâmicas em grupo. Ninguém aqui precisa saber programar. Ela tem duas partes, uma em cima da outra: primeiro o trem, para entender os trilhos, as branches; depois o contrato, para entender o que fica registrado em cada trilho e como os trilhos se juntam.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Como vai ser', { placeholder: 'title' });
    const agenda = [
      ['0:00', 'Abertura', 'c'], ['', 'Parte 1 · O trem', 'p'], ['0:10', '1 · O trem e os trilhos', 'c'], ['0:35', 'Dinâmica 1 · Qual trilho?', 'd'],
      ['0:55', 'Intervalo', 'i'], ['', 'Parte 2 · O contrato', 'p'], ['1:05', '2 · O contrato: o que fica registrado', 'c'], ['1:25', '3 · Os tipos de merge', 'c'],
      ['1:55', 'Dinâmica 2 · Qual foi o merge?', 'd'], ['2:10', '4 · Versões e as regras do Modelo VIC', 'c'], ['2:25', 'Dinâmica 3 · A vida de uma versão', 'd'], ['2:50', 'Fechamento', 'c'],
    ];
    agenda.forEach(([hh, nome, tipo], i) => {
      const y = 1.5 + i * 0.43;
      if (tipo === 'p') { texto(s, nome, { x: 0.6, y, w: 6.9, h: 0.4, fontSize: 14, bold: true, color: K.laranja, valign: 'middle', charSpacing: 1 }); return; }
      texto(s, hh, { x: 0.6, y, w: 0.8, h: 0.4, fontSize: 14, fontFace: MONO, color: K.muted, valign: 'middle' });
      s.addShape(pres.shapes.OVAL, { x: 1.5, y: y + 0.08, w: 0.24, h: 0.24, fill: { color: tipo === 'd' ? K.laranja : tipo === 'i' ? K.tint : K.azul }, line: { type: 'none' }, objectName: 'marca ' + nome });
      texto(s, nome, { x: 1.95, y, w: 5.6, h: 0.4, fontSize: 16, bold: tipo === 'd', valign: 'middle' });
    });
    cartao(s, 7.9, 1.55, 4.8, 5.1, K.tint, 'combinados');
    texto(s, 'Combinados', { x: 8.2, y: 1.8, w: 4, h: 0.45, fontSize: 20, bold: true, color: K.azul });
    const comb = [
      ['MdVideocam', 'Câmera opcional'], ['MdMicOff', 'Microfone fechado fora das salas'],
      ['MdChat', 'Chat aberto o tempo todo: pergunte quando quiser'], ['MdGroups', 'Três dinâmicas em salas, em grupos de 4 ou 5'],
    ];
    for (let i = 0; i < comb.length; i++) {
      const cx = 8.2, cy = 2.5 + i * 1.0;
      await bolinha(s, cx, cy, 0.7, comb[i][0]);
      texto(s, comb[i][1], { x: cx + 0.95, y: cy, w: 3.4, h: 0.7, fontSize: 16, valign: 'middle' });
    }
    s.addNotes('Mostre as duas partes. A primeira só fala de trilhos, as branches, com um trem. A segunda troca de analogia: um contrato com as suas minutas, para falar do que fica registrado, de como os trilhos se juntam e do número da versão. Os horários são aproximados. Pergunta boba não existe: a oficina é para quem está vendo isso pela primeira vez.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Como reformar um vagão sem parar o trem?', { placeholder: 'title' });
    texto(s, 'O trem leva passageiros o dia todo. Um vagão precisa ser reformado, e outro, construído. Qual é o jeito certo?', { x: 0.6, y: 1.45, w: 12.1, h: 0.8, fontSize: 18 });
    const ops = [
      ['A', 'Parar o trem até a reforma acabar'],
      ['B', 'Reformar o vagão com o trem andando e os passageiros dentro'],
      ['C', 'Levar o vagão para um desvio, trabalhar lá e engatar de volta quando estiver pronto'],
      ['D', 'Comprar um trem novo a cada mudança'],
    ];
    ops.forEach(([l, t], i) => {
      const x = 0.6 + i * 3.07;
      cartao(s, x, 2.5, 2.87, 3.6, K.branco, 'opcao ' + l);
      texto(s, l, { x: x + 0.3, y: 2.7, w: 1, h: 0.9, fontSize: 48, bold: true, color: K.azul });
      texto(s, t, { x: x + 0.3, y: 3.75, w: 2.35, h: 2.2, fontSize: 17 });
    });
    texto(s, 'Responda na enquete. A resposta vem no fim.', { x: 0.6, y: 6.4, w: 12, h: 0.4, fontSize: 14, color: K.muted });
    s.addNotes('Abra a enquete com as quatro opções e dê um minuto. Não revele a resposta: ela volta no fechamento. Se alguém comentar, devolva a pergunta: e se duas equipes estiverem mexendo em vagões diferentes ao mesmo tempo?');
  }

  // ═══ PARTE 1 · BLOCO 1 ══════════════════════════════════════════════════
  secao = '1 · O trem e os trilhos';
  pres.addSection({ title: secao });
  {
    const s = slide('DIVISOR');
    s.addText('1', { placeholder: 'numero' });
    s.addText('O trem e os trilhos', { placeholder: 'title' });
    s.addText('Parte 1 · Para que servem as branches', { placeholder: 'subtitulo' });
    s.addNotes('Primeira parte: só trilhos. Nada de versão, de registro ou de tipos de junção; isso fica para a parte 2, com o contrato.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('O software é um trem', { placeholder: 'title' });
    cartao(s, 0.6, 1.5, 12.1, 2.7, K.branco, 'fundo figura');
    await figura(s, 'trem', 1.35, 1.6, 10.6, 'Um trem com quatro vagões, Cartões, Extrato, Pix e Login');
    const it = [
      ['MdTrain', 'O trem é o sistema', 'o app do banco, inteiro'],
      ['MdViewModule', 'Vagão é funcionalidade', 'Login, Pix, Extrato, Cartões'],
      ['MdGroups', 'O trem não pode parar', 'tem passageiros a bordo: os clientes'],
    ];
    for (let i = 0; i < it.length; i++) {
      const x = 0.6 + i * 4.1;
      await bolinha(s, x, 4.55, 0.8, it[i][0]);
      texto(s, it[i][1], { x: x + 1.0, y: 4.5, w: 3.0, h: 0.5, fontSize: 18, bold: true, color: K.azul });
      texto(s, it[i][2], { x: x + 1.0, y: 5.0, w: 3.0, h: 0.8, fontSize: 15, color: K.muted });
    }
    texto(s, 'Mudar o software é mexer nos vagões: ganhar um vagão novo, melhorar um vagão ou consertar um vagão com defeito.', { x: 0.6, y: 6.0, w: 12.1, h: 0.6, fontSize: 17 });
    s.addNotes('Combine a imagem com a turma: o trem é o sistema; cada vagão é uma funcionalidade. Toda mudança no software é uma destas três: um vagão novo, uma melhoria num vagão, ou o conserto de um vagão com defeito. E o trem está sempre rodando, com clientes dentro.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Um trilho para cada trabalho', { placeholder: 'title' });
    cartao(s, 0.6, 1.4, 12.1, 3.75, K.branco, 'fundo figura');
    await figura(s, 'oficina', 1.15, 1.5, 11.0, 'O trem segue rodando enquanto o vagão Cartões é feito num desvio e depois volta');
    const g = [
      ['Trilho', 'branch', 'cada linha onde algo roda ou é trabalhado'],
      ['Desvio', 'nova branch', 'um trilho que sai de outro, para trabalhar sem parar a linha'],
      ['Engatar de volta', 'merge', 'o trabalho pronto volta para a linha de onde saiu'],
    ];
    g.forEach(([fe, git, f], i) => {
      const x = 0.6 + i * 4.1;
      texto(s, [{ text: fe, options: { bold: true, color: K.azul } }, { text: '  ' + git, options: { fontFace: MONO, color: K.muted, fontSize: 13 } }], { x, y: 5.35, w: 3.9, h: 0.4, fontSize: 18 });
      texto(s, f, { x, y: 5.8, w: 3.8, h: 0.8, fontSize: 15 });
    });
    s.addNotes('Esta é a ideia central da parte 1. O trem continua rodando na linha; o vagão vai para um desvio, onde a equipe trabalha com calma, sem atrapalhar ninguém. Quando fica pronto, volta e é engatado. Branch é isso: um trilho separado para trabalhar. Por enquanto, "engatar de volta" basta; os jeitos de juntar ficam para a parte 2.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('GitFlow é o regulamento da ferrovia', { placeholder: 'title' });
    const pq = [
      ['MdCallSplit', 'Quais trilhos existem', 'dois permanentes e três temporários'],
      ['MdLogin', 'De onde cada um sai', 'e de que trilho tira o que leva'],
      ['MdLogout', 'Para onde cada um vai', 'e o que precisa voltar'],
      ['MdLock', 'Quem libera a passagem', 'ninguém entra nos trilhos permanentes sem autorização'],
    ];
    for (let i = 0; i < pq.length; i++) {
      const x = 0.6 + (i % 2) * 6.15, y = 1.6 + Math.floor(i / 2) * 1.85;
      cartao(s, x, y, 5.95, 1.65, K.branco, 'regra ' + (i + 1));
      await bolinha(s, x + 0.3, y + 0.42, 0.8, pq[i][0]);
      texto(s, pq[i][1], { x: x + 1.35, y: y + 0.3, w: 4.4, h: 0.5, fontSize: 20, bold: true, color: K.azul });
      texto(s, pq[i][2], { x: x + 1.35, y: y + 0.85, w: 4.4, h: 0.6, fontSize: 15, color: K.muted });
    }
    cartao(s, 0.6, 5.45, 12.1, 1.1, K.tint, 'vic');
    texto(s, [{ text: 'No Modelo VIC, é regra: ', options: { bold: true, color: K.azul } }, { text: 'o fluxo de todo repositório deve ser aderente ao GitFlow (Diretriz 2).' }], { x: 0.9, y: 5.45, w: 11.6, h: 1.1, fontSize: 18, valign: 'middle' });
    s.addNotes('O GitFlow é um modelo de mercado, publicado em 2010 por Vincent Driessen. Ele não é uma ferramenta: é um combinado, como o regulamento de uma ferrovia, que diz quais trilhos existem, de onde cada um sai, para onde vai e quem libera a passagem. No Modelo VIC, ele é regra.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Dois trilhos permanentes', { placeholder: 'title' });
    const pt = [
      ['main', K.escuro, 'A linha comercial', 'O trem completo, com passageiros.', 'É o que está em produção: o que o cliente usa hoje.'],
      ['develop', K.azul, 'O pátio de montagem', 'A próxima composição, com os vagões que já ficaram prontos.', 'É o que vai para a próxima entrega.'],
    ];
    pt.forEach(([nome, cor, t1, f, sis], i) => {
      const x = 0.6 + i * 6.15;
      moldura(s, x, 1.55, 5.95, 4.3, cor, 'cartao ' + nome);
      faixa(s, x, 1.55, 5.95, cor, nome);
      texto(s, t1, { x: x + 0.35, y: 2.3, w: 5.3, h: 0.5, fontSize: 24, bold: true, color: K.azul });
      texto(s, f, { x: x + 0.35, y: 3.0, w: 5.3, h: 1.0, fontSize: 19 });
      texto(s, [{ text: 'No sistema  ', options: { bold: true, color: K.muted, fontSize: 14 } }, { text: sis }], { x: x + 0.35, y: 4.3, w: 5.3, h: 1.0, fontSize: 17 });
    });
    texto(s, 'Os dois existem sempre e são protegidos: ninguém mexe neles direto (Diretrizes 2 e 7).', { x: 0.6, y: 6.15, w: 12.1, h: 0.4, fontSize: 15, color: K.muted });
    s.addNotes('A main é o trem que está na linha comercial, levando passageiros. A develop é o pátio onde a próxima composição vai sendo montada, com os vagões que já saíram prontos da oficina. Ninguém mexe direto em nenhum dos dois: tudo chega por um desvio, com autorização. Pergunta para a turma: quando a composição do pátio vai para a linha comercial? Resposta: depois da vistoria, o próximo slide.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Três trilhos temporários', { placeholder: 'title' });
    const tt = [
      ['feature/*', K.teal, K.tinta, 'A oficina', 'Um vagão: novo ou em melhoria.', 'Sai do pátio (develop) e volta para o pátio.'],
      ['release/*', K.laranja, K.tinta, 'A vistoria', 'A composição inteira para. Só se conserta; não entra vagão novo.', 'Sai do pátio, vai para a linha comercial (main) e volta para o pátio.'],
      ['hotfix/*', K.vermelho, K.branco, 'A emergência', 'Um vagão: o que deu defeito no trem comercial.', 'Sai da linha comercial, volta para ela e também para o pátio.'],
    ];
    tt.forEach(([nome, cor, ct, t1, f, rota], i) => {
      const x = 0.6 + i * 4.1;
      moldura(s, x, 1.55, 3.9, 4.75, cor, 'cartao ' + nome);
      faixa(s, x, 1.55, 3.9, cor, nome, ct);
      texto(s, t1, { x: x + 0.3, y: 2.25, w: 3.3, h: 0.5, fontSize: 21, bold: true, color: K.azul });
      texto(s, f, { x: x + 0.3, y: 2.9, w: 3.3, h: 1.4, fontSize: 17 });
      texto(s, rota, { x: x + 0.3, y: 4.5, w: 3.3, h: 1.4, fontSize: 15, bold: true, color: K.escuro });
    });
    texto(s, 'Temporário quer dizer: depois que o trabalho volta, o desvio é desmontado (Diretriz 3).', { x: 0.6, y: 6.45, w: 12.1, h: 0.4, fontSize: 15, color: K.muted });
    s.addNotes('O asterisco quer dizer "qualquer nome": feature/cartoes, feature/extrato. Repare no tamanho do que roda em cada um: a feature e o hotfix cuidam de um vagão só; a release cuida da composição inteira. Release e hotfix voltam para dois lugares; a feature, para um.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('A malha completa', { placeholder: 'title' });
    await figura(s, 'malha-trens', 0.95, 1.3, 11.4, 'A malha do GitFlow com o que roda em cada trilho');
    s.addNotes('Percorra a malha devagar. Em cima, a main: o trem comercial, com passageiros. Embaixo, a develop: o pátio, montando a próxima composição; o vagão tracejado é o lugar do que ainda está na oficina. Na feature, o vagão Cartões é construído e volta para o pátio. Quando a composição do pátio fica pronta, vai inteira para a vistoria, a release; aprovada, entra na linha comercial e também volta para o pátio. Quando um vagão do trem comercial dá defeito, ele vai para o desvio de emergência, o hotfix, e o conserto volta para o trem comercial e para o pátio.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('De onde sai, para onde vai', { placeholder: 'title' });
    const nome = (t, cor) => ({ text: t, options: { fontFace: MONO, bold: true, color: cor } });
    tabela(s, [
      ['Trilho', 'Na ferrovia', 'O que roda', 'Sai de', 'Vai para'],
      [nome('main', K.escuro), 'linha comercial', 'o trem completo', '—', '—'],
      [nome('develop', K.azul), 'pátio de montagem', 'a próxima composição', 'main', '—'],
      [nome('feature/*', K.tinta), 'oficina', 'um vagão', 'develop', 'develop'],
      [nome('release/*', K.tinta), 'vistoria', 'a composição inteira', 'develop', 'main e develop'],
      [nome('hotfix/*', K.vermelho), 'emergência', 'um vagão', 'main', 'main e develop'],
    ], { x: 0.6, y: 1.6, w: 12.1, colW: [2.2, 2.6, 3.1, 1.7, 2.5], rowH: 0.62, fontSize: 18 });
    cartao(s, 0.6, 5.65, 12.1, 0.95, K.tint, 'regra de ouro');
    texto(s, [{ text: 'Regra de ouro: ', options: { bold: true, color: K.azul } }, { text: 'o que entra na linha comercial volta também para o pátio. Senão, a próxima composição sai com o defeito de novo.' }], { x: 0.9, y: 5.65, w: 11.6, h: 0.95, fontSize: 18, valign: 'middle' });
    s.addNotes('É a tabela da Diretriz 2, em linguagem de trem. A regra de ouro: se o vagão consertado volta só para o trem comercial, a próxima composição, que está sendo montada no pátio com o vagão antigo, sai com o mesmo defeito. Na parte 2, essa volta ganha um nome: merge back.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('O nome diz o trilho', { placeholder: 'title' });
    const nomes = [
      ['main', K.escuro, 'a linha comercial'], ['develop', K.azul, 'o pátio de montagem'], ['feature/cartoes', K.teal, 'a oficina do vagão Cartões'],
      ['release/2.4.0', K.laranja, 'a vistoria da composição 2.4.0'], ['hotfix/2.4.1', K.vermelho, 'a emergência que gera a 2.4.1'],
    ];
    nomes.forEach(([n, cor, d], i) => {
      const y = 1.6 + i * 0.82;
      s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 0.62, fill: { color: cor }, line: { type: 'none' }, objectName: 'cor ' + n });
      texto(s, n, { x: 0.9, y, w: 4.6, h: 0.62, fontSize: 22, fontFace: MONO, bold: true, valign: 'middle' });
      texto(s, d, { x: 5.6, y, w: 7.0, h: 0.62, fontSize: 18, color: K.muted, valign: 'middle' });
    });
    cartao(s, 0.6, 5.85, 12.1, 0.8, K.tint, 'nomes');
    texto(s, 'Pelo nome, qualquer pessoa sabe o que o trilho é e de onde saiu. Os nomes seguem a Diretriz 11.', { x: 0.9, y: 5.85, w: 11.6, h: 0.8, fontSize: 17, valign: 'middle' });
    s.addNotes('O nome não é enfeite: é por ele que as ferramentas e os indicadores do Modelo VIC reconhecem cada trilho. Os números da release e do hotfix são números de versão; eles ficam para a parte 2.');
  }

  // ═══ DINÂMICA 1 ═════════════════════════════════════════════════════════
  {
    const s = slide('CONTEUDO');
    s.addText('Dinâmica 1 · Qual trilho?', { placeholder: 'title' });
    const passos = [
      'Nas salas, em grupos de 4 ou 5. Cada grupo tem um quadro com os cinco trilhos e um canto "Não pode!".',
      'São 12 cartas com situações do dia a dia de um sistema. Arraste cada carta para o trilho onde ela acontece.',
      'Em cada carta, cole uma etiqueta: de onde o trilho sai e para onde vai.',
    ];
    passos.forEach((t, i) => {
      numeroRedondo(s, 0.6, 1.7 + i * 1.05, 0.6, i + 1, K.laranja, K.tinta);
      texto(s, t, { x: 1.45, y: 1.65 + i * 1.05, w: 6.3, h: 0.9, fontSize: 18, valign: 'middle' });
    });
    texto(s, '12 min nas salas · 8 min de conversa', { x: 0.6, y: 5.1, w: 7, h: 0.45, fontSize: 18, bold: true, color: K.azul });
    const ex = ['Desde ontem, o app em produção cobra a tarifa em dobro', 'A versão 2.4 vai para a homologação; daqui em diante, só correção', 'Os clientes vão poder simular um empréstimo no app'];
    ex.forEach((t, i) => {
      moldura(s, 8.2 + (i % 2) * 0.25, 1.6 + i * 1.6, 4.2, 1.3, K.azul, 'carta exemplo ' + i);
      texto(s, t, { x: 8.45 + (i % 2) * 0.25, y: 1.6 + i * 1.6, w: 3.7, h: 1.3, fontSize: 16, bold: true, valign: 'middle' });
    });
    s.addNotes('Antes de abrir as salas, faça a primeira carta com a turma: "o app em produção cobra a tarifa em dobro" é um vagão com defeito no trem comercial: hotfix, sai da main e volta para a main e para a develop. Abra as salas com 12 minutos. Na volta, peça a cada grupo uma carta de que teve dúvida. O gabarito está no material das dinâmicas.');
  }
  {
    const s = slide('INTERVALO');
    s.addText('Intervalo', { placeholder: 'title' });
    s.addText('Na volta, trocamos o trem pelo contrato', { placeholder: 'subtitulo' });
    s.addNotes('Intervalo de 10 minutos. Deixe este slide na tela.');
  }

  // ═══ PARTE 2 · BLOCO 2 ══════════════════════════════════════════════════
  secao = '2 · O contrato';
  pres.addSection({ title: secao });
  {
    const s = slide('DIVISOR');
    s.addText('2', { placeholder: 'numero' });
    s.addText('O contrato', { placeholder: 'title' });
    s.addText('Parte 2 · O que fica registrado em cada trilho', { placeholder: 'subtitulo' });
    s.addNotes('Segunda parte. Os trilhos continuam os mesmos; agora a pergunta é outra: o que fica registrado neles, e como se juntam. Para isso, trocamos o trem por um contrato com as suas minutas.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Qual destes vale?', { placeholder: 'title' });
    const arqs = ['contrato_v1.docx', 'contrato_v2_juridico.docx', 'contrato_FINAL.docx', 'contrato_FINAL_v3_revisado.docx', 'contrato_FINAL_v3_JOAO_agora_vai.docx'];
    for (let i = 0; i < arqs.length; i++) {
      const y = 1.6 + i * 0.95;
      cartao(s, 0.6 + i * 0.18, y, 6.6, 0.75, K.branco, 'arquivo ' + i);
      await bolinha(s, 0.75 + i * 0.18, y + 0.1, 0.55, 'MdDescription', K.tint, HEX.azul);
      texto(s, arqs[i], { x: 1.45 + i * 0.18, y, w: 5.6, h: 0.75, fontSize: 15, fontFace: MONO, valign: 'middle', bold: i === 4 });
    }
    cartao(s, 8.0, 1.6, 4.7, 4.6, K.tint, 'perguntas');
    texto(s, 'Ninguém consegue responder', { x: 8.3, y: 1.85, w: 4.2, h: 0.45, fontSize: 18, bold: true, color: K.azul });
    const pq = ['Qual é a versão que vale?', 'Quem mudou a cláusula 7, quando e por quê?', 'A correção do jurídico entrou na versão assinada?', 'Dá para voltar à versão de antes?'];
    pq.forEach((t, i) => {
      numeroRedondo(s, 8.3, 2.55 + i * 0.88, 0.45, i + 1);
      texto(s, t, { x: 8.95, y: 2.5 + i * 0.88, w: 3.6, h: 0.6, fontSize: 16, valign: 'middle' });
    });
    s.addNotes('Todo mundo já viu essa pasta. Pergunte: qual destes é o contrato que vale? O problema não é falta de cuidado: é que arquivos copiados não guardam quem mudou, o quê e por quê, nem dizem qual cópia é a oficial. Com código é igual, só que com milhares de arquivos e dezenas de pessoas.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('O Git guarda cada versão, rubricada', { placeholder: 'title' });
    texto(s, 'Cada vez que alguém salva uma mudança no Git, nasce um commit: uma versão registrada, com quatro informações que nunca mais se perdem.', { x: 0.6, y: 1.45, w: 12.1, h: 0.8, fontSize: 18 });
    const q = [['MdPerson', 'Quem', 'Ana Souza'], ['MdSchedule', 'Quando', '12/10, 15h42'], ['MdEditNote', 'O quê', 'cláusula 7, multa por atraso'], ['MdChat', 'Por quê', 'multa de 2% pedida pelo jurídico']];
    for (let i = 0; i < q.length; i++) {
      const x = 0.6 + i * 3.07;
      cartao(s, x, 2.5, 2.87, 2.6, K.branco, 'commit ' + q[i][1]);
      await bolinha(s, x + 0.3, 2.75, 0.8, q[i][0]);
      texto(s, q[i][1], { x: x + 0.3, y: 3.7, w: 2.4, h: 0.45, fontSize: 20, bold: true, color: K.azul });
      texto(s, q[i][2], { x: x + 0.3, y: 4.2, w: 2.4, h: 0.8, fontSize: 15, color: K.muted });
    }
    carimbo(s, 'commit = versão rubricada', 0.6, 5.55, 4.0);
    texto(s, [{ text: 'Repositório ', options: { bold: true, color: K.azul } }, { text: 'é a pasta do contrato com todas as versões, para sempre. Dá para comparar duas versões e voltar a qualquer uma.' }], { x: 5.0, y: 5.45, w: 7.7, h: 0.8, fontSize: 16, valign: 'middle' });
    s.addNotes('O commit é a rubrica em cada página da minuta: quem, quando, o quê e por quê. O repositório é a pasta que guarda todas as versões. Isso já responde "quem mudou a cláusula 7?". As outras perguntas, qual versão vale e se a correção entrou, o GitFlow responde com os trilhos que vimos na parte 1.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Os trilhos viram linhas do tempo', { placeholder: 'title' });
    cartao(s, 0.6, 1.4, 12.1, 3.75, K.branco, 'fundo figura');
    await figura(s, 'linha-do-tempo', 1.6, 1.45, 10.1, 'Uma linha do tempo com versões rubricadas, uma cópia que sai e volta a ser incorporada');
    const g = [
      ['Linha', 'branch', 'uma cópia de trabalho do contrato'],
      ['Bolinha', 'commit', 'uma versão rubricada, na ordem do tempo'],
      ['Junção', 'merge', 'a cópia incorporada à linha de onde saiu'],
    ];
    g.forEach(([fe, git, f], i) => {
      const x = 0.6 + i * 4.1;
      texto(s, [{ text: fe, options: { bold: true, color: K.azul } }, { text: '  ' + git, options: { fontFace: MONO, color: K.muted, fontSize: 13 } }], { x, y: 5.35, w: 3.9, h: 0.4, fontSize: 18 });
      texto(s, f, { x, y: 5.8, w: 3.8, h: 0.8, fontSize: 15 });
    });
    s.addNotes('Esta é a ponte entre as duas partes. Tire os dormentes dos trilhos: cada trilho vira uma linha do tempo, e cada bolinha é uma versão rubricada, um commit. Leia da esquerda para a direita. Em B, alguém tira uma cópia para redigir uma cláusula; F1 e F2 são as versões dessa cópia; em M, a cópia é incorporada à minuta. Isso é o merge.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('A mesma malha, no contrato', { placeholder: 'title' });
    await figura(s, 'malha-contrato', 0.45, 1.35, 9.4, 'A malha do GitFlow como linha do tempo do contrato');
    texto(s, [{ text: 'O vagão virou cláusula. ', options: { bold: true, color: K.azul } }, { text: 'A feature é uma área redigindo uma cláusula; a release, a versão para assinatura; o hotfix, o aditivo urgente.' }], { x: 10.0, y: 1.6, w: 2.7, h: 2.6, fontSize: 15 });
    texto(s, [{ text: 'A etiqueta laranja ', options: { bold: true, color: K.azul } }, { text: 'é o número da versão que foi para produção: a tag.' }], { x: 10.0, y: 4.4, w: 2.7, h: 1.4, fontSize: 15 });
    s.addNotes('O mesmo desenho da malha dos trens, agora com as versões. Repare que o vagão virou cláusula: a feature é uma área redigindo uma cláusula; a release é a versão que vai para assinatura e só aceita correção de redação; o hotfix é o aditivo urgente sobre o contrato vigente. As etiquetas na main são os números das versões que foram para produção; voltam no bloco 4.');
  }

  // ═══ BLOCO 3 ════════════════════════════════════════════════════════════
  secao = '3 · Os tipos de merge';
  pres.addSection({ title: secao });
  {
    const s = slide('DIVISOR');
    s.addText('3', { placeholder: 'numero' });
    s.addText('Os tipos de merge', { placeholder: 'title' });
    s.addText('Quatro jeitos de incorporar uma cópia', { placeholder: 'subtitulo' });
    s.addNotes('Terceiro bloco: os jeitos de incorporar uma cópia à minuta. Todos levam o mesmo conteúdo; o que muda é a história que fica registrada.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Antes de juntar: a minuta andou?', { placeholder: 'title' });
    const lados = [
      ['merge-antes-ff', 'Não andou', 'Ninguém mexeu na develop desde que a cópia saiu de B. Basta a cópia virar a minuta.'],
      ['merge-antes', 'Andou', 'Enquanto a cláusula era redigida, a develop recebeu C. É preciso escolher como juntar.'],
    ];
    for (let i = 0; i < lados.length; i++) {
      const [fig, t, d] = lados[i];
      const x = 0.6 + i * 6.15;
      cartao(s, x, 1.55, 5.95, 4.3, K.branco, 'lado ' + t);
      await figura(s, fig, x + 0.2, 1.7, 5.55);
      texto(s, t, { x: x + 0.35, y: 4.0, w: 5.3, h: 0.5, fontSize: 22, bold: true, color: K.azul });
      texto(s, d, { x: x + 0.35, y: 4.5, w: 5.3, h: 1.2, fontSize: 17 });
    }
    texto(s, [{ text: 'A pergunta: ', options: { bold: true, color: K.azul } }, { text: 'alguém mexeu na minuta desde que você tirou a sua cópia?' }], { x: 0.6, y: 6.1, w: 12.1, h: 0.5, fontSize: 18 });
    s.addNotes('Esta é a pergunta que decide tudo. Se a minuta não andou, juntar é trivial: o fast-forward. Se andou, há três escolhas: merge commit, squash ou rebase. Vamos ver uma por uma, sempre com o mesmo desenho: a develop com A, B e C; a cópia da cláusula de multa com F1 e F2.');
  }
  await slideMerge('Fast-forward: a cópia vira a minuta', 'merge-ff', [
    ['No contrato', 'Ninguém mexeu na minuta desde a sua cópia: a sua cópia passa a ser a minuta.'],
    ['Fica no histórico', 'Uma linha reta: A, B, F1, F2. Não fica registro de que houve uma cópia.'],
    ['Bom para', 'Quando a minuta não andou. Nenhuma versão nova é criada.'],
    ['Cuidado', 'Some a informação de que F1 e F2 eram um bloco de trabalho.'],
  ], 'Fast-forward quer dizer avanço rápido: o marcador da develop só pula para a frente, até F2. Não há junção, porque não há o que juntar. Por isso o histórico fica reto e perde o desenho da cópia. No GitFlow original, as junções evitam o fast-forward justamente para que a cópia continue visível.');
  await slideMerge('Merge commit: a junção registrada', 'merge-commit', [
    ['No contrato', 'A cláusula entra com todas as versões e uma anotação: "incorporada em 12/10, aprovada por…".'],
    ['Fica no histórico', 'Tudo: A, B, C, F1, F2 e a junção M. Dá para ver quando a cópia saiu e quando voltou.'],
    ['Bom para', 'Rastrear quando e como cada cláusula entrou.'],
    ['Cuidado', 'Com muitas cópias, o histórico fica trançado e mais difícil de ler.'],
  ], 'É o jeito mais fiel: nada é reescrito, e a junção vira uma versão própria, o commit de merge. No GitFlow original, todas as junções são assim, com a opção que impede o fast-forward. O nome nos botões costuma ser "merge commit" ou "merge (no fast-forward)".');
  await slideMerge('Squash: passar a limpo', 'merge-squash', [
    ['No contrato', 'Entra só o texto final da cláusula, sem os rascunhos.'],
    ['Fica no histórico', 'A, B, C e uma versão nova, F1+F2. As versões intermediárias não aparecem na develop.'],
    ['Bom para', 'Cópias com muitas versões pequenas: "ajuste", "ajuste 2", "agora vai".'],
    ['Cuidado', 'Perde o passo a passo. E a cópia não deve ser usada depois: deve ser apagada.'],
  ], 'Squash quer dizer espremer. O histórico da develop fica limpo, uma versão por entrega. O preço é perder o detalhe, que continua registrado no pull request. Curiosidade do Modelo VIC: o squash reduz o número de commits sem reduzir a divergência real, por isso a Diretriz 4 não mede divergência só pela contagem.');
  await slideMerge('Rebase: refazer sobre a minuta atual', 'merge-rebase', [
    ['No contrato', 'Refazer a sua cópia em cima da minuta mais recente, antes de pedir o visto.'],
    ['Fica no histórico', 'Uma linha reta. F1′ e F2′ são versões novas: mesmo conteúdo, outra identidade e outra data.'],
    ['Bom para', 'Atualizar a própria cópia, que só você usa.'],
    ['Cuidado', 'Reescreve a história. Nunca numa linha que outras pessoas usam, como a main e a develop.'],
  ], 'Rebase quer dizer mudar a base. A cópia, que saía de B, passa a sair de C. As versões são refeitas, por isso ganham o apóstrofo: F1 linha e F2 linha. Depois do rebase, a junção vira um fast-forward. Atenção: só se faz rebase na própria cópia. Reescrever a história de uma linha compartilhada é como trocar as páginas de um contrato que outras pessoas estão lendo.');
  {
    const s = slide('CONTEUDO');
    s.addText('Lado a lado', { placeholder: 'title' });
    const tipo = (t) => ({ text: t, options: { bold: true, color: K.azul } });
    tabela(s, [
      ['Tipo', 'O histórico mostra', 'No contrato', 'Bom para', 'Cuidado'],
      [tipo('Fast-forward'), 'linha reta, sem a cópia', 'a cópia vira a minuta', 'quando a minuta não andou', 'perde o desenho da cópia'],
      [tipo('Merge commit'), 'tudo, com a junção', 'cláusula com todas as versões', 'rastrear quando e como entrou', 'histórico trançado'],
      [tipo('Squash'), 'uma versão por entrega', 'passar a limpo', 'cópias com muitas versões pequenas', 'perde o passo a passo'],
      [tipo('Rebase'), 'linha reta, versões novas', 'refazer sobre a minuta atual', 'atualizar a própria cópia', 'reescreve a história'],
    ], { x: 0.6, y: 1.6, w: 12.1, colW: [2.1, 2.6, 2.6, 2.7, 2.1], rowH: 0.75, fontSize: 15 });
    texto(s, 'Todos levam o mesmo conteúdo para a develop. O que muda é a história que fica registrada.', { x: 0.6, y: 5.75, w: 12.1, h: 0.6, fontSize: 18, bold: true, color: K.escuro });
    s.addNotes('Resumo para fotografar. A frase de baixo é a mais importante: nenhum tipo de merge perde a mudança em si. A escolha é sobre o que a história conta e sobre como fica fácil, depois, achar quando algo entrou.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Os botões que você vai ver', { placeholder: 'title' });
    const btn = (t) => ({ text: t, options: { fontFace: MONO, fontSize: 14 } });
    tabela(s, [
      ['Tipo', 'No GitHub', 'No Azure DevOps'],
      [{ text: 'Merge commit', options: { bold: true, color: K.azul } }, btn('Create a merge commit'), btn('Merge (no fast forward)')],
      [{ text: 'Squash', options: { bold: true, color: K.azul } }, btn('Squash and merge'), btn('Squash commit')],
      [{ text: 'Rebase + fast-forward', options: { bold: true, color: K.azul } }, btn('Rebase and merge'), btn('Rebase and fast-forward')],
      [{ text: 'Rebase + merge commit', options: { bold: true, color: K.azul } }, '—', btn('Semi-linear merge')],
    ], { x: 0.6, y: 1.6, w: 12.1, colW: [3.5, 4.3, 4.3], rowH: 0.62, fontSize: 16 });
    cartao(s, 0.6, 5.0, 12.1, 1.55, K.tint, 'quem decide');
    texto(s, [{ text: 'Quem escolhe o tipo? ', options: { bold: true, color: K.azul } }, { text: 'A política de cada repositório, que pode deixar só alguns botões ligados. No GitFlow original, as junções são merge commit. Na dúvida, pergunte ao Integrador (Diretriz 6).' }], { x: 0.9, y: 5.0, w: 11.6, h: 1.55, fontSize: 17, valign: 'middle' });
    s.addNotes('As plataformas do Modelo VIC são o GitHub e o Azure DevOps. Os botões aparecem na hora de concluir o pull request. O fast-forward puro não tem botão próprio: ele acontece quando a minuta não andou, ou depois de um rebase. O semi-linear, do Azure DevOps, faz o rebase e ainda cria a versão de junção.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Conflito: duas áreas na mesma cláusula', { placeholder: 'title' });
    cartao(s, 0.6, 1.55, 6.2, 4.3, K.branco, 'fundo figura');
    await figura(s, 'conflito', 0.75, 2.2, 5.9, 'Conflito: a develop mudou a multa para 1% e a cópia mudou a mesma multa para 2%');
    const it = [
      ['MdWarning', 'Mudou dos dois lados', 'O jurídico pôs multa de 2%; o comercial, de 1%. O Git não escolhe.'],
      ['MdQuestionAnswer', 'Quem decide é uma pessoa', 'Às vezes é técnico; muitas vezes é de negócio. Pode ser você.'],
      ['MdTimer', 'Cópia curta, menos conflito', 'Quanto mais tempo longe da minuta, maior a chance (Diretriz 4).'],
    ];
    for (let i = 0; i < it.length; i++) {
      const y = 1.6 + i * 1.45;
      await bolinha(s, 7.15, y, 0.75, it[i][0], i === 0 ? K.vermelho : K.azul);
      texto(s, it[i][1], { x: 8.1, y, w: 4.6, h: 0.45, fontSize: 18, bold: true, color: K.azul });
      texto(s, it[i][2], { x: 8.1, y: y + 0.45, w: 4.6, h: 0.85, fontSize: 15 });
    }
    texto(s, 'O Integrador é o ponto focal nos conflitos complexos (Diretriz 6).', { x: 0.6, y: 6.1, w: 12.1, h: 0.45, fontSize: 15, color: K.muted });
    s.addNotes('Conflito não é erro de ninguém: é o Git avisando que duas mudanças disputam o mesmo trecho e que ele não vai adivinhar qual vale. Pode acontecer em qualquer tipo de merge, inclusive no rebase. Ponto para o público de negócio: quando o conflito é de regra, como a multa, a decisão é de negócio; o time técnico vai precisar de você.');
  }

  // ═══ DINÂMICA 2 ═════════════════════════════════════════════════════════
  {
    const s = slide('CONTEUDO');
    s.addText('Dinâmica 2 · Qual foi o merge?', { placeholder: 'title' });
    texto(s, 'Rodadas 1 a 4: compare com os dois "antes" do slide da pergunta "a minuta andou?". Qual merge produziu cada "depois"?', { x: 0.6, y: 1.35, w: 12.1, h: 0.5, fontSize: 17 });
    const rod = ['merge-squash', 'merge-ff', 'merge-rebase', 'merge-commit'];
    for (let i = 0; i < rod.length; i++) {
      const x = 0.6 + (i % 2) * 6.15, y = 1.95 + Math.floor(i / 2) * 2.45;
      cartao(s, x, y, 5.95, 2.3, K.branco, 'rodada ' + (i + 1));
      numeroRedondo(s, x + 0.15, y + 0.15, 0.5, i + 1, K.laranja, K.tinta);
      await figura(s, rod[i], x + 0.8, y + 0.1, 4.6);
    }
    s.addNotes('Uma enquete por rodada, com as opções Fast-forward, Merge commit, Squash e Rebase. Respostas: 1 squash (F1+F2 numa versão só); 2 fast-forward (linha reta, sem C: a minuta não tinha andado); 3 rebase (F1 linha e F2 linha saindo de C); 4 merge commit (a junção M). A rodada 2 é a pegadinha: não tem C, porque partiu do "antes" em que a minuta não andou. Deixe na tela, ou cole no chat, os dois "antes".');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Rodadas 5 a 8: qual você escolheria?', { placeholder: 'title' });
    const sit = [
      'Quero que o histórico mostre quando a cláusula de multa entrou e todas as versões dela até ficar pronta.',
      'A minha cópia tem 14 versões chamadas "ajuste", "ajuste 2" e "agora vai". Quero que entre só o resultado.',
      'A develop andou muito desde que comecei. Antes de pedir a aprovação, quero refazer o meu trabalho em cima da versão mais recente.',
      'Ninguém mexeu na develop desde que comecei. Quero juntar sem criar versão nova.',
    ];
    sit.forEach((t, i) => {
      const x = 0.6 + (i % 2) * 6.15, y = 1.6 + Math.floor(i / 2) * 2.45;
      cartao(s, x, y, 5.95, 2.25, K.branco, 'situacao ' + (i + 5));
      numeroRedondo(s, x + 0.25, y + 0.25, 0.6, i + 5, K.laranja, K.tinta);
      texto(s, t, { x: x + 1.1, y: y + 0.2, w: 4.6, h: 1.85, fontSize: 17, valign: 'middle' });
    });
    texto(s, 'Fast-forward · Merge commit · Squash · Rebase', { x: 0.6, y: 6.5, w: 12.1, h: 0.35, fontSize: 14, color: K.muted, align: 'center' });
    s.addNotes('Respostas: 5 merge commit; 6 squash; 7 rebase; 8 fast-forward. Na 7, alguém pode dizer merge commit, trazendo a develop para dentro da cópia: também resolve, e é a resposta certa quando a cópia é compartilhada com outras pessoas. Reforce: rebase só na própria cópia.');
  }

  // ═══ BLOCO 4 ════════════════════════════════════════════════════════════
  secao = '4 · Versões e as regras do Modelo VIC';
  pres.addSection({ title: secao });
  {
    const s = slide('DIVISOR');
    s.addText('4', { placeholder: 'numero' });
    s.addText('Versões e regras', { placeholder: 'title' });
    s.addText('As regras do Modelo VIC: quem libera, o que volta e como se numera', { placeholder: 'subtitulo' });
    s.addNotes('Quarto bloco: as regras do Modelo VIC que envolvem o fluxo. É um bloco curto, com seis slides em 15 minutos.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Nada entra sem visto', { placeholder: 'title' });
    cartao(s, 0.6, 1.55, 6.2, 4.3, K.branco, 'fundo figura');
    await figura(s, 'visto-pr', 0.75, 2.05, 5.9, 'O visto do pull request: a cópia só entra na develop depois da aprovação e da completude');
    const it = [
      ['MdLock', 'Mudança direta é bloqueada', 'Ninguém escreve direto na main nem na develop (Diretriz 7).'],
      ['MdCheckCircle', '1 · Aprovação', 'Os revisores do time conferem o pull request, como o visto do jurídico.'],
      ['MdMergeType', '2 · Completude', 'O Integrador efetiva o merge, como quem protocola a versão (Diretriz 8).'],
    ];
    for (let i = 0; i < it.length; i++) {
      const y = 1.6 + i * 1.45;
      await bolinha(s, 7.15, y, 0.75, it[i][0], i === 0 ? K.vermelho : K.azul);
      texto(s, it[i][1], { x: 8.1, y, w: 4.6, h: 0.45, fontSize: 18, bold: true, color: K.azul });
      texto(s, it[i][2], { x: 8.1, y: y + 0.45, w: 4.6, h: 0.85, fontSize: 15 });
    }
    texto(s, [{ text: 'Pull request ', options: { bold: true, color: K.azul } }, { text: 'é o pedido de visto: fica guardado como a ata da decisão.' }], { x: 0.6, y: 6.1, w: 12.1, h: 0.45, fontSize: 16 });
    s.addNotes('O pull request, ou PR, é o pedido para levar uma cópia a uma linha permanente. Ele tem dois momentos, e o Modelo VIC separa quem faz cada um: os revisores aprovam; o Integrador conclui. É ali que se escolhe o tipo de merge. Tudo fica registrado: quem pediu, quem aprovou, o que se discutiu. É o "quem libera a passagem" do regulamento da ferrovia.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('A volta obrigatória: merge back', { placeholder: 'title' });
    cartao(s, 0.6, 1.55, 6.9, 4.5, K.branco, 'fundo figura');
    await figura(s, 'merge-back', 0.75, 1.75, 6.6, 'Merge back: a release entra na main e volta para a develop com a correção');
    texto(s, 'Toda release e todo hotfix que entram na main voltam para a develop.', { x: 7.85, y: 1.6, w: 4.85, h: 1.1, fontSize: 20, bold: true, color: K.azul });
    texto(s, [{ text: 'No contrato: ', options: { bold: true } }, { text: 'o aditivo assinado precisa entrar também na minuta da próxima versão. Senão, a próxima versão sai sem o aditivo.' }], { x: 7.85, y: 2.85, w: 4.85, h: 1.5, fontSize: 17 });
    texto(s, [{ text: 'Lembra do trem? ', options: { bold: true } }, { text: 'É a regra de ouro: o conserto volta também para o pátio.' }], { x: 7.85, y: 4.4, w: 4.85, h: 1.2, fontSize: 17 });
    texto(s, 'É obrigatório ao fim de cada ciclo (Diretriz 5).', { x: 0.6, y: 6.25, w: 12.1, h: 0.45, fontSize: 15, color: K.muted });
    s.addNotes('É a regra de ouro da parte 1, agora com nome. Pergunte: o que acontece se a correção feita na versão para assinatura não voltar para a minuta? A próxima versão é redigida a partir da minuta, então sai com o erro de novo. Isso se chama regressão.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('O número da versão', { placeholder: 'title' });
    const partes = [
      ['2', 'MAJOR', K.escuro, K.branco, 'Muda o que já valia: quem dependia precisa se adaptar.', 'um contrato renegociado'],
      ['4', 'MINOR', K.azul, K.branco, 'Novidade que não muda o que já existia.', 'uma cláusula nova'],
      ['1', 'PATCH', K.teal, K.tinta, 'Correção, sem novidade.', 'um erro de redação corrigido'],
      ['121', 'BUILD', K.laranja, K.tinta, 'Qual montagem daquela versão foi para produção.', 'o número da via protocolada'],
    ];
    partes.forEach(([n, nome, cor, ct, d, c], i) => {
      const x = 0.6 + i * 3.07;
      s.addText(n, { isTextBox: true, x, y: 1.55, w: 2.87, h: 1.2, fill: { color: cor }, color: ct, fontFace: MONO, fontSize: 48, bold: true, align: 'center', valign: 'middle', margin: 0, objectName: 'parte ' + nome });
      texto(s, nome, { x, y: 2.85, w: 2.87, h: 0.45, fontSize: 18, bold: true, fontFace: MONO, color: K.azul, align: 'center' });
      texto(s, d, { x: x + 0.1, y: 3.35, w: 2.67, h: 1.0, fontSize: 15, align: 'center' });
      texto(s, [{ text: 'contrato: ', options: { color: K.muted } }, { text: c, options: { italic: true } }], { x: x + 0.1, y: 4.4, w: 2.67, h: 0.7, fontSize: 14, align: 'center' });
    });
    cartao(s, 0.6, 5.3, 12.1, 1.3, K.tint, 'semver');
    texto(s, [{ text: 'v2.4.1.121 ', options: { fontFace: MONO, bold: true, color: K.azul } }, { text: 'As três primeiras partes são o SemVer (Diretriz 9); a quarta, o BUILD, completa o Padrão VEC, obrigatório em produção (Diretriz 10). Cada versão publicada tem a sua nota de versão (Diretriz 13).' }], { x: 0.9, y: 5.3, w: 11.6, h: 1.3, fontSize: 16, valign: 'middle' });
    s.addNotes('Basta lembrar: o número conta o tamanho da mudança. Primeiro número mudou, cuidado: algo que já existia mudou. Segundo número: novidade. Terceiro: correção. O quarto, o BUILD, identifica a montagem, e só versão com os quatro números vai para produção. A nota de versão é o quadro de alterações anexo ao contrato: adicionado, alterado, corrigido.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Cópia curta, junção frequente', { placeholder: 'title' });
    const it = [
      ['MdSync', 'Sincronize', 'Traga a develop para a sua cópia com frequência. Quanto mais a minuta anda sem você, maior o risco de conflito.'],
      ['MdMergeType', 'Junte cedo', 'Cópia que demora represa trabalho fora da minuta. Entregue em partes menores.'],
      ['MdDeleteSweep', 'Apague', 'Depois de juntar, a cópia é apagada. O repositório só tem branches em uso (Diretriz 3).'],
    ];
    for (let i = 0; i < it.length; i++) {
      const x = 0.6 + i * 4.1;
      cartao(s, x, 1.55, 3.9, 3.3, K.branco, 'pratica ' + it[i][1]);
      await bolinha(s, x + 0.3, 1.8, 0.8, it[i][0]);
      texto(s, it[i][1], { x: x + 0.3, y: 2.75, w: 3.3, h: 0.5, fontSize: 22, bold: true, color: K.azul });
      texto(s, it[i][2], { x: x + 0.3, y: 3.3, w: 3.3, h: 1.45, fontSize: 15 });
    }
    tabela(s, [
      ['Meta institucional (faixa 3, Diretriz 4)', 'feature/*', 'release/*', 'hotfix/*'],
      ['Vida total da branch', 'até 15 dias', 'até 10 dias', 'até 3 dias'],
      ['Tempo sem sincronizar com a develop', 'até 5 dias', '—', '—'],
    ], { x: 0.6, y: 5.1, w: 12.1, colW: [5.2, 2.3, 2.3, 2.3], rowH: 0.45, fontSize: 14 });
    s.addNotes('No contrato: quanto mais tempo uma área fica com a sua cópia sem olhar a minuta, mais difícil é juntar depois. O Modelo VIC mede isso, a divergência, e fixa limites por faixa de maturidade; a meta institucional é a faixa 3. Release e hotfix têm só o limite de vida, porque a release se afasta da develop por desenho.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('O que você viu hoje no Modelo VIC', { placeholder: 'title' });
    const d = (n) => ({ text: n, options: { bold: true, color: K.azul } });
    tabela(s, [
      ['Diretriz', 'Em uma frase'],
      [d('2 · Modelo GitFlow'), 'os cinco trilhos, de onde saem e para onde vão'],
      [d('3 · Integração contínua'), 'a branch temporária é apagada depois da junção'],
      [d('4 · Divergência'), 'cópia curta, junção frequente'],
      [d('5 · Merge back'), 'o que entra na main volta para a develop'],
      [d('6 e 8 · Integrador e PR'), 'nada entra sem visto: aprovação e completude'],
      [d('7 · Proteção'), 'ninguém mexe direto na main nem na develop'],
      [d('9, 10 e 11 · Versões e nomes'), 'o número da versão e o nome de cada trilho'],
      [d('13 · Nota de versão'), 'o quadro de alterações de cada versão'],
    ], { x: 0.6, y: 1.5, w: 12.1, colW: [4.4, 7.7], rowH: 0.52, fontSize: 15 });
    s.addNotes('Fechamento do bloco. Não leia a tabela inteira: escolha duas linhas e mostre que tudo o que vimos hoje, nas duas partes, está escrito nas diretrizes do Modelo VIC. As diretrizes 1 e 12 ficam de fora porque tratam de testes e do conteúdo dos arquivos, não do fluxo.');
  }

  // ═══ DINÂMICA 3 ═════════════════════════════════════════════════════════
  {
    const s = slide('CONTEUDO');
    s.addText('Dinâmica 3 · A vida de uma versão', { placeholder: 'title' });
    texto(s, 'Contratos Online, em produção na v2.3.0.97. Desenhe as linhas do tempo na ordem dos eventos.', { x: 0.6, y: 1.35, w: 12.1, h: 0.45, fontSize: 16, color: K.muted });
    const ev = [
      'A equipe A começa a assinatura digital.', 'A equipe B começa o alerta de vencimento.', 'A assinatura digital fica pronta; o PR é aprovado e concluído.',
      'A versão 2.4.0 vai para homologação, com a assinatura. O alerta ainda não está pronto.', 'Na homologação, aparece um erro de texto; é corrigido.',
      'A homologação aprova: a versão entra em produção (build 118).', 'No dia seguinte, a multa por atraso sai errada em produção; a correção sai no mesmo dia (build 121).',
      'O alerta de vencimento fica pronto e entra para a próxima versão.',
    ];
    ev.forEach((t, i) => {
      numeroRedondo(s, 0.6, 1.95 + i * 0.58, 0.42, i + 1, K.azul);
      texto(s, t, { x: 1.2, y: 1.93 + i * 0.58, w: 6.6, h: 0.5, fontSize: 14, valign: 'middle' });
    });
    cartao(s, 8.1, 1.95, 4.6, 4.6, K.tint, 'perguntas');
    texto(s, 'Responda também', { x: 8.4, y: 2.15, w: 4, h: 0.45, fontSize: 18, bold: true, color: K.azul });
    const pq = ['Que branches temporárias existiram, e com que nome?', 'Que números de versão a main recebeu?', 'Em que versão o alerta chega aos clientes?', 'O que aconteceria sem o merge back do evento 7?', 'Que tipo de merge você usaria no evento 3?'];
    texto(s, pq.map((t) => ({ text: t, options: { bullet: true, paraSpaceAfter: 6 } })), { x: 8.4, y: 2.65, w: 4.1, h: 3.8, fontSize: 15 });
    texto(s, '15 min nas salas · 10 min de conversa', { x: 0.6, y: 6.6, w: 7, h: 0.35, fontSize: 15, bold: true, color: K.azul });
    s.addNotes('Cada grupo tem no quadro as peças: linhas das cinco cores, bolinhas para as versões e etiquetas para os números. Peça que numerem cada bolinha com o número do evento. Na volta, um grupo mostra o desenho e os outros comparam; depois mostre o gabarito, que está no material das dinâmicas. Respostas: feature/assinatura, feature/alerta, release/2.4.0 e hotfix/2.4.1; números v2.4.0.118 e v2.4.1.121; o alerta chega na 2.5.0, a próxima release, MINOR porque é novidade; sem o merge back, a 2.5.0 voltaria a calcular a multa errada; no evento 3, a resposta é aberta.');
  }

  // ═══ FECHAMENTO ═════════════════════════════════════════════════════════
  secao = 'Fechamento';
  pres.addSection({ title: secao });
  {
    const s = slide('CONTEUDO');
    s.addText('Voltando à enquete', { placeholder: 'title' });
    const ops = [
      ['A', 'Parar o trem', 'os clientes ficam a pé', false],
      ['B', 'Reformar com o trem andando', 'é mexer direto em produção', false],
      ['C', 'Desvio e engate', 'é a branch', true],
      ['D', 'Trem novo a cada mudança', 'caro, e o problema volta', false],
    ];
    for (let i = 0; i < ops.length; i++) {
      const [l, t, v, ok] = ops[i];
      const x = 0.6 + i * 3.07;
      cartao(s, x, 1.65, 2.87, 4.6, ok ? K.laranja : K.branco, 'resposta ' + l);
      texto(s, l, { x: x + 0.3, y: 1.9, w: 1, h: 0.9, fontSize: 48, bold: true, color: ok ? K.tinta : K.azul });
      texto(s, t, { x: x + 0.3, y: 3.0, w: 2.35, h: 1.1, fontSize: 20, bold: true });
      s.addImage({ data: await iconePng(ok ? 'MdCheckCircle' : 'MdCancel', ok ? HEX.tinta : HEX.vermelho), x: x + 0.3, y: 4.4, w: 0.5, h: 0.5 });
      texto(s, v, { x: x + 0.9, y: 4.35, w: 1.85, h: 1.2, fontSize: 16, bold: true, color: ok ? K.tinta : K.vermelho });
    }
    texto(s, 'Repita a enquete e compare com o começo.', { x: 0.6, y: 6.45, w: 12, h: 0.4, fontSize: 14, color: K.muted });
    s.addNotes('Revele a resposta: C. O desvio é a branch, e o engate é o merge. A é parar o sistema: os clientes ficam sem atendimento. B é mexer direto em produção: o passageiro sente cada martelada, e é o que a proteção da main proíbe. D é refazer tudo: caro, e não resolve. Repita a enquete e mostre a diferença.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Perguntas que você já pode fazer ao time', { placeholder: 'title' });
    const pq = [
      ['Isso já está na main ou só na develop?', 'Já vale para o cliente, ou só na próxima versão?'],
      ['Entra nesta release ou na próxima?', 'A vistoria já começou? Então só entra correção.'],
      ['É hotfix ou pode esperar?', 'Hotfix é emergência em produção, não atalho.'],
      ['Qual é a versão em produção?', 'O número diz o tamanho da mudança.'],
      ['Fizeram o merge back?', 'Senão, a correção some na próxima versão.'],
      ['Há quanto tempo essa branch está aberta?', 'Cópia longa, junção difícil.'],
    ];
    pq.forEach(([p, r], i) => {
      const x = 0.6 + (i % 2) * 6.15, y = 1.55 + Math.floor(i / 2) * 1.6;
      cartao(s, x, y, 5.95, 1.4, K.branco, 'pergunta ' + (i + 1));
      texto(s, p, { x: x + 0.3, y: y + 0.18, w: 5.4, h: 0.5, fontSize: 18, bold: true, color: K.azul });
      texto(s, r, { x: x + 0.3, y: y + 0.7, w: 5.4, h: 0.5, fontSize: 15, color: K.muted });
    });
    s.addNotes('Este é o ganho prático para quem é de negócio: com estas seis perguntas, a pessoa acompanha uma entrega sem precisar abrir o código. Peça que cada um escolha a pergunta que vai fazer na próxima reunião com o time.');
  }
  {
    const s = slide('CONTEUDO');
    s.addText('Para levar', { placeholder: 'title' });
    const lev = [
      ['Cada trabalho no seu trilho:', 'a main é o trem com passageiros, a develop é a próxima composição, os desvios são temporários.'],
      ['Juntar é escolher a história:', 'fast-forward, merge commit, squash ou rebase levam o mesmo conteúdo.'],
      ['Tudo o que chega à main volta para a develop:', 'sem merge back, a correção se perde.'],
    ];
    lev.forEach(([a, b], i) => {
      const y = 1.7 + i * 1.5;
      texto(s, String(i + 1), { x: 0.6, y, w: 1.0, h: 1.2, fontSize: 60, bold: true, color: K.laranja, valign: 'middle' });
      texto(s, [{ text: a + ' ', options: { bold: true, color: K.azul } }, { text: b }], { x: 1.8, y, w: 10.9, h: 1.2, fontSize: 26, valign: 'middle' });
    });
    await bolinha(s, 0.6, 6.15, 0.6, 'MdDownload');
    texto(s, 'A cartilha de bolso vai no chat: os cinco trilhos, os quatro merges e o número da versão, numa página.', { x: 1.4, y: 6.15, w: 11.3, h: 0.6, fontSize: 16, valign: 'middle' });
    s.addNotes('Três frases para levar: a primeira é da parte 1, as outras duas, da parte 2. Envie a cartilha de bolso no chat.');
  }
  {
    const s = slide('FIM');
    s.addText('Cada trabalho no seu trilho.', { placeholder: 'title' });
    s.addText('Dúvidas? O chat continua aberto.', { placeholder: 'subtitulo' });
    s.addNotes('Encerramento. Agradeça e abra para dúvidas.');
  }

  await pres.writeFile({ fileName: SAIDA });
  await aplicaTema(SAIDA, THEME);
  console.log('ok', SAIDA);
})().catch((e) => { console.error(e); process.exit(1); });

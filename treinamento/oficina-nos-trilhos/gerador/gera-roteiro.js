// Gera o roteiro do facilitador da oficina "Nos trilhos do GitFlow" (Modelo VIC).
// Uso: node gera-roteiro.js <saida.docx>   (ou npm run roteiro; as figuras vêm antes, de npm run figuras)
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, Header, Footer, PageNumber, LevelFormat,
} = require('docx');

const SAIDA = process.argv[2];
const ESCURO = '00437A', AZUL = '005CA9', TINTA = '22292E', LARANJA = 'F39200', TINT = 'E5F2FC', MUTED = '525F66';
const FONTE = 'Segoe UI', MONO = 'Consolas';
const MARCA = path.join(__dirname, '..', '..', '..', 'prototypes', 'versionamento-codigo', 'assets', 'brand');
const FIGURAS = path.join(__dirname, 'saida', 'figuras');
const logo = fs.readFileSync(path.join(MARCA, 'vic-logo-horizontal.png'));

// ── blocos de construção ────────────────────────────────────────────────────
const runs = (t) => (Array.isArray(t) ? t : [t]).map((x) => new TextRun(x));
const P = (t, o = {}) => new Paragraph(Object.assign({ children: runs(t), spacing: { after: 120, line: 300 } }, o));
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)], pageBreakBefore: true });
const H1semQuebra = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const B = (t, nivel = 0) => new Paragraph({ children: runs(t), numbering: { reference: 'marcadores', level: nivel }, spacing: { after: 80, line: 290 } });
const N = (t, ref = 'passos') => new Paragraph({ children: runs(t), numbering: { reference: ref, level: 0 }, spacing: { after: 80, line: 290 } });
const fala = (t) => new Paragraph({
  children: [new TextRun({ text: t, italics: true, color: TINTA })],
  indent: { left: 360 }, spacing: { before: 60, after: 140, line: 300 },
  border: { left: { style: BorderStyle.SINGLE, size: 18, color: LARANJA, space: 12 } },
});
const b = (t) => ({ text: t, bold: true });
const m = (t) => ({ text: t, font: MONO });

// figura PNG de saida/figuras, com a largura em pontos e a altura pela proporção do arquivo
function figura(nome, largura) {
  const buf = fs.readFileSync(path.join(FIGURAS, nome + '.png'));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 160 }, children: [new ImageRun({ type: 'png', data: buf, transformation: { width: largura, height: Math.round(largura * h / w) } })] });
}

const LARG = 9026; // A4 com margens de 2,54 cm: 11906 - 2 * 1440
function tabela(cab, linhas, larguras) {
  const borda = { style: BorderStyle.SINGLE, size: 4, color: 'C2D2D6' };
  const bordas = { top: borda, bottom: borda, left: borda, right: borda };
  const cel = (t, w, cabecalho) => new TableCell({
    width: { size: w, type: WidthType.DXA }, borders: bordas,
    shading: cabecalho ? { fill: AZUL, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: runs(cabecalho ? { text: t, bold: true, color: 'FFFFFF' } : t), spacing: { after: 0, line: 270 } })],
  });
  return new Table({
    width: { size: LARG, type: WidthType.DXA }, columnWidths: larguras,
    rows: [
      new TableRow({ tableHeader: true, children: cab.map((t, i) => cel(t, larguras[i], true)) }),
      ...linhas.map((l) => new TableRow({ children: l.map((t, i) => cel(t, larguras[i], false)) })),
    ],
  });
}
const espaco = () => new Paragraph({ children: [], spacing: { after: 120 } });
function quadro(titulo, itens) {
  // caixa de destaque: fundo claro, uma célula
  return new Table({
    width: { size: LARG, type: WidthType.DXA }, columnWidths: [LARG],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: LARG, type: WidthType.DXA },
      shading: { fill: TINT, type: ShadingType.CLEAR, color: 'auto' },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
      margins: { top: 140, bottom: 140, left: 200, right: 200 },
      children: [new Paragraph({ children: [new TextRun({ text: titulo, bold: true, color: AZUL })], spacing: { after: 80 } }), ...itens],
    })] })],
  });
}

// ── conteúdo ────────────────────────────────────────────────────────────────
const capa = [
  new Paragraph({ children: [new ImageRun({ type: 'png', data: logo, transformation: { width: 300, height: Math.round(300 / 3.605) } })], spacing: { after: 1500 } }),
  new Paragraph({ children: [new TextRun({ text: 'Roteiro do facilitador', size: 28, color: MUTED })], spacing: { after: 120 } }),
  new Paragraph({ children: [new TextRun({ text: 'Nos trilhos do GitFlow', size: 64, bold: true, color: ESCURO })], spacing: { after: 160 } }),
  new Paragraph({ children: [new TextRun({ text: 'Branches, merges e o Modelo VIC — oficina para quem nunca escreveu uma linha de código', size: 28, color: TINTA })], spacing: { after: 600 } }),
  tabela(['Duração', 'Formato', 'Turma'], [['3 horas, com 10 minutos de intervalo', 'Remoto, no Teams', 'Até 25 pessoas, em grupos de 4 ou 5']], [3009, 3009, 3008]),
  espaco(),
  P([{ text: 'Acompanham este roteiro: os slides (PPTX, com notas do apresentador), o material das dinâmicas (PDF) e a cartilha de bolso (PDF).', color: MUTED }]),
  new Paragraph({ children: [new TextRun({ text: 'versionamento e integração de código', font: MONO, color: MUTED })], spacing: { before: 1200 } }),
];

const sumario = [
  H1semQuebra('Sumário'),
  ...[
    ['1. A oficina em uma página', 'objetivos, as duas partes e os papéis'],
    ['2. Preparação', 'o que montar uma semana antes, na véspera e no dia'],
    ['3. Cronograma', 'os 180 minutos, e o que cortar ou acrescentar'],
    ['4. Roteiro bloco a bloco', 'o que dizer em cada slide'],
    ['5. As dinâmicas', 'como conduzir as três e o que observar'],
    ['6. Perguntas frequentes', 'as dúvidas que costumam aparecer'],
    ['7. Glossário rápido', 'os termos da oficina'],
  ].map(([t, d]) => P([b(t), { text: ' — ' + d, color: MUTED }], { spacing: { after: 160 } })),
];

const visao = [
  H1('1. A oficina em uma página'),
  P('A oficina apresenta o GitFlow a quem nunca programou: a pessoa de negócio que acompanha entregas, conversa com o time técnico e ouve falar de branch, merge e release sem saber o que cada coisa quer dizer. Ao fim, ela entende para que servem as branches, os tipos de merge e as regras do Modelo VIC que tocam o seu dia a dia, e sabe que perguntas fazer ao time.'),
  H2('Objetivos de aprendizagem'),
  P('Ao fim da oficina, a pessoa consegue:'),
  N('Explicar para que serve uma branch: trabalhar num trilho separado sem parar o que está rodando.', 'objetivos'),
  N('Dizer para que serve cada um dos cinco trilhos do GitFlow (main, develop, feature, release e hotfix), de onde cada um sai e para onde vai.', 'objetivos'),
  N('Explicar em uma frase o que é um commit e um merge.', 'objetivos'),
  N('Reconhecer, num desenho, os quatro tipos de merge (fast-forward, merge commit, squash e rebase) e dizer o que cada um deixa no histórico.', 'objetivos'),
  N('Explicar o que é um conflito e por que a decisão pode ser de negócio.', 'objetivos'),
  N('Relacionar o fluxo com as regras do Modelo VIC: pull request, proteção das branches, merge back, número da versão e divergência.', 'objetivos'),
  H2('Duas partes, duas analogias'),
  P('A oficina ensina em degraus, e cada degrau tem a sua analogia. Não misture as duas: o trem não fala de versões nem de tipos de merge, e o contrato só entra depois do intervalo.'),
  P([b('Parte 1 — o trem, para entender as branches. '), 'O trem é o software, e cada vagão é uma funcionalidade. Mudar o software é mexer nos vagões: um vagão novo, uma melhoria num vagão ou o conserto de um vagão com defeito. O trem não pode parar, porque tem passageiros. Por isso o trabalho é feito em outros trilhos, e o que fica pronto é engatado de volta.']),
  tabela(['Trilho', 'Na ferrovia', 'O que roda', 'Sai de → vai para'], [
    [[m('main')], 'a linha comercial', 'o trem completo, com passageiros', 'permanente'],
    [[m('develop')], 'o pátio de montagem', 'a próxima composição, com os vagões já prontos', 'permanente'],
    [[m('feature/*')], 'a oficina', 'um vagão, novo ou em melhoria', 'develop → develop'],
    [[m('release/*')], 'a vistoria', 'a composição inteira; só se conserta', 'develop → main e develop'],
    [[m('hotfix/*')], 'a emergência', 'um vagão: o que deu defeito no trem comercial', 'main → main e develop'],
  ], [1500, 2000, 3226, 2300]),
  espaco(),
  P([b('Parte 2 — o contrato, para entender o que fica registrado e como os trilhos se juntam. '), 'Os trilhos viram linhas do tempo de um contrato. Cada bolinha é uma versão rubricada; cada linha, uma cópia de trabalho; o vagão vira cláusula. É com o contrato que entram o commit, os quatro merges, o conflito, o número da versão, o pull request e o merge back.']),
  tabela(['No Git', 'No contrato'], [
    [[b('Repositório')], 'a pasta do contrato, com todas as versões'],
    [[b('Commit')], 'uma versão rubricada: quem, quando, o quê e por quê'],
    [[b('Branch')], 'uma cópia de trabalho'],
    [[b('Merge')], 'a cópia incorporada à linha de onde saiu'],
    [[m('main')], 'o contrato assinado, em vigor'],
    [[m('develop')], 'a minuta consolidada da próxima versão'],
    [[m('feature/*')], 'a cláusula que uma área redige'],
    [[m('release/*')], 'a versão para assinatura: só correção'],
    [[m('hotfix/*')], 'o aditivo urgente'],
    [[b('Tag')], 'o número da versão que foi para produção'],
    [[b('Pull request')], 'o pedido de visto'],
    [[b('Integrador')], 'quem dá o visto final e protocola'],
    [[b('Conflito')], 'duas áreas mudaram a mesma cláusula'],
    [[b('Merge back')], 'o aditivo que também entra na minuta'],
  ], [2400, 6626]),
  espaco(),
  P('A ponte entre as partes é o slide 18, "Os trilhos viram linhas do tempo": o mesmo desenho dos trilhos, sem os dormentes e com as versões.'),
  H2('Papéis'),
  B([b('Facilitação: '), 'conduz os blocos e as conversas de volta das salas.']),
  B([b('Apoio (recomendado): '), 'abre e fecha as enquetes, monta e acompanha as salas, responde ao chat e avisa quando o tempo aperta. Sem uma segunda pessoa, deixe as enquetes prontas com antecedência e use o aviso automático das salas.']),
  B([b('Integrador convidado (opcional): '), 'uma pessoa que exerce o papel de Integrador num time de verdade enriquece o bloco 4 e as perguntas frequentes. Combine antes que ela fale em linguagem de negócio.']),
];

const preparo = [
  H1('2. Preparação'),
  H2('Uma semana antes'),
  B('Envie o convite do Teams com a duração completa (3 horas) e avise que haverá trabalho em grupo com câmera opcional.'),
  B('Peça que os participantes confirmem acesso ao quadro colaborativo (Whiteboard do Teams, Miro ou Mural) e, se possível, testem a entrada por um link.'),
  B('Leia as Diretrizes 2 a 11 e 13 do Modelo VIC. A oficina cita cada uma pelo número, e a turma costuma perguntar.'),
  H2('Na véspera'),
  N([b('Monte o quadro. '), 'Um frame por grupo para a Dinâmica 1: as 12 cartas misturadas, cinco raias (main, develop, feature/*, release/*, hotfix/*), um canto "Não pode!" e etiquetas em branco para "sai de / vai para". Um frame por grupo para a Dinâmica 3: os oito eventos e as peças da linha do tempo (linhas das cinco cores, bolinhas para as versões e etiquetas laranja para os números). Tudo está no material das dinâmicas.']),
  N([b('Crie as enquetes '), '(Forms no Teams). A enquete-gancho: "Como reformar um vagão sem parar o trem?", com as opções A) Parar o trem até a reforma acabar, B) Reformar o vagão com o trem andando, C) Levar o vagão para um desvio e engatar de volta quando estiver pronto, D) Comprar um trem novo a cada mudança. Para a Dinâmica 2, uma enquete com as quatro opções: Fast-forward, Merge commit, Squash e Rebase; dá para reaproveitar a mesma nas oito rodadas.']),
  N([b('Configure as salas simultâneas. '), 'Grupos de 4 ou 5, com o aviso de tempo ligado: 12 minutos na Dinâmica 1 e 15 na Dinâmica 3. Deixe os nomes dos grupos iguais aos dos frames do quadro.']),
  N([b('Separe a cartilha de bolso '), 'para enviar no chat no fechamento.']),
  H2('No dia, 15 minutos antes'),
  B('Abra os slides em modo apresentador, com as notas visíveis só para você.'),
  B('Deixe abertos, em abas: o quadro e as enquetes.'),
  B('Cole no chat o link do quadro assim que a turma começar a entrar.'),
];

const crono = [
  H1('3. Cronograma'),
  tabela(['Horário', 'Min', 'Bloco', 'Slides'], [
    ['0:00', '10', 'Abertura e enquete-gancho', '1–3'],
    [[b('Parte 1')], '', [b('O trem')], ''],
    ['0:10', '25', 'Bloco 1 — O trem e os trilhos', '4–12'],
    ['0:35', '20', [b('Dinâmica 1 — Qual trilho?')], '13'],
    ['0:55', '10', 'Intervalo', '14'],
    [[b('Parte 2')], '', [b('O contrato')], ''],
    ['1:05', '20', 'Bloco 2 — O contrato: o que fica registrado', '15–19'],
    ['1:25', '30', 'Bloco 3 — Os tipos de merge e o conflito', '20–28'],
    ['1:55', '15', [b('Dinâmica 2 — Qual foi o merge?')], '29–30'],
    ['2:10', '15', 'Bloco 4 — Versões e as regras do Modelo VIC', '31–36'],
    ['2:25', '25', [b('Dinâmica 3 — A vida de uma versão')], '37'],
    ['2:50', '10', 'Fechamento', '38–41'],
  ], [1100, 800, 5826, 1300]),
  espaco(),
  quadro('Se o tempo apertar', [
    B('No bloco 4, passe rápido pelos slides 35 (divergência) e 36 (o resumo das diretrizes): os dois servem de consulta depois.'),
    B('Na Dinâmica 2, faça só as rodadas 1 a 4, as dos desenhos.'),
    B('Na volta da Dinâmica 3, só um grupo apresenta, e você mostra o gabarito.'),
  ]),
  espaco(),
  quadro('Se sobrar tempo', [
    B('No fechamento, peça que cada pessoa escreva no chat a pergunta do slide 39 que vai fazer na próxima reunião com o time.'),
    B('Mostre, no GitHub ou no Azure DevOps de um repositório real, o desenho das branches e um pull request concluído. Escolha antes um repositório sem dado sensível.'),
  ]),
];

const blocos = [
  H1('4. Roteiro bloco a bloco'),
  P([{ text: 'Os trechos com a barra laranja são sugestões de fala. Use as suas palavras; o que importa é a ideia.', color: MUTED }]),

  H2('Abertura — 10 min (slides 1 a 3)'),
  P([b('Objetivo: '), 'acolher, combinar as regras do remoto, apresentar as duas partes e plantar a pergunta que fecha a oficina.']),
  N('Slide 1 — Boas-vindas. Apresente-se e diga o que a turma vai levar: entender o que o time técnico quer dizer com branch, merge e release, sem precisar programar.', 'abertura'),
  N('Slide 2 — Agenda e combinados. Mostre as duas partes: a primeira, com um trem, só fala de trilhos; a segunda troca para um contrato.', 'abertura'),
  N('Slide 3 — Abra a enquete-gancho, "Como reformar um vagão sem parar o trem?". Não comente a resposta.', 'abertura'),
  fala('Guardem a resposta de vocês. A gente volta a essa pergunta no fim.'),

  H2('Parte 1 · Bloco 1 — O trem e os trilhos — 25 min (slides 4 a 12)'),
  P([b('Objetivo: '), 'mostrar para que servem as branches e apresentar os cinco trilhos, de onde cada um sai e para onde vai. Nada de versão, de commit nem de tipo de merge: isso fica para a parte 2.']),
  P([b('Slide 5 — O software é um trem.')]),
  figura('trem', 380),
  fala('O trem é o sistema, o app do banco inteiro. Cada vagão é uma funcionalidade: Login, Pix, Extrato, Cartões. Mudar o software é mexer nos vagões: ganhar um vagão novo, melhorar um vagão ou consertar um vagão com defeito. E o trem está sempre rodando, com os clientes dentro.'),
  P([b('Slide 6 — Um trilho para cada trabalho.'), ' É a ideia central da parte 1.']),
  figura('oficina', 420),
  fala('O trem continua rodando na linha. O vagão novo vai para um desvio, onde a equipe trabalha com calma, sem atrapalhar ninguém. Quando fica pronto, volta e é engatado. Branch é isso: um trilho separado para trabalhar.'),
  P('Por enquanto, "engatar de volta" basta. Se alguém perguntar como se junta, diga que é o assunto da parte 2.'),
  P([b('Slide 7 — GitFlow é o regulamento da ferrovia.'), ' O GitFlow foi publicado em 2010 por Vincent Driessen e virou modelo de mercado. Não é uma ferramenta: é um combinado, que diz quais trilhos existem, de onde cada um sai, para onde vai e quem libera a passagem. No Modelo VIC, ele é regra (Diretriz 2).']),
  P([b('Slide 8 — Dois trilhos permanentes.'), ' A main é a linha comercial: o trem completo, com passageiros, o que está em produção. A develop é o pátio de montagem: a próxima composição, com os vagões que já saíram prontos da oficina. Ninguém mexe direto em nenhum dos dois (Diretriz 7).']),
  P([b('Pergunta para a turma: '), '"Quando a composição do pátio vai para a linha comercial?" (Depois da vistoria, a release: o próximo slide.)']),
  P([b('Slide 9 — Três trilhos temporários.'), ' Chame a atenção para o tamanho do que roda em cada um: a feature e o hotfix cuidam de um vagão só; a release cuida da composição inteira. A release e o hotfix voltam para dois lugares; a feature, para um. Temporário quer dizer que, depois que o trabalho volta, o desvio é desmontado (Diretriz 3).']),
  P([b('Slide 10 — A malha completa.'), ' Percorra o desenho devagar; é o slide mais importante do bloco.']),
  figura('malha-trens', 470),
  N('Em cima, a main: o trem comercial, com passageiros.', 'malha'),
  N('Embaixo, a develop: o pátio, montando a próxima composição. O vagão tracejado é o lugar do que ainda está na oficina.', 'malha'),
  N('Na feature, o vagão Cartões é construído e volta para o pátio, onde ocupa o lugar tracejado.', 'malha'),
  N('Quando a composição do pátio fica pronta, vai inteira para a vistoria, a release, já com o Cartões. Aprovada, entra na linha comercial e também volta para o pátio. O trem comercial ainda não tem o Cartões: ele só chega aos passageiros pela vistoria.', 'malha'),
  N('Quando um vagão do trem comercial dá defeito, ele vai para o desvio de emergência, o hotfix. O conserto volta para o trem comercial e para o pátio.', 'malha'),
  P([b('Slide 11 — De onde sai, para onde vai.'), ' É a tabela da Diretriz 2, em linguagem de trem. Insista na regra de ouro:']),
  fala('Se o vagão consertado volta só para o trem comercial, a próxima composição, que está sendo montada no pátio com o vagão antigo, sai com o mesmo defeito.'),
  P('Na parte 2, essa volta ganha um nome: merge back.'),
  P([b('Slide 12 — O nome diz o trilho.'), ' Os nomes seguem a Diretriz 11, e é por eles que as ferramentas e os indicadores reconhecem cada trilho. Os números da release e do hotfix são números de versão; eles ficam para a parte 2.']),

  H2('Dinâmica 1 — 20 min (slide 13)'),
  P('Conduza conforme a seção 5.'),

  H2('Intervalo — 10 min (slide 14)'),
  P('Antes de sair, deixe a enquete da Dinâmica 2 pronta. O slide avisa que, na volta, o trem dá lugar ao contrato.'),

  H2('Parte 2 · Bloco 2 — O contrato — 20 min (slides 15 a 19)'),
  P([b('Objetivo: '), 'mostrar o que fica registrado em cada trilho, com o contrato e as suas minutas, e ligar os trilhos da parte 1 às linhas do tempo.']),
  P([b('Slide 16 — Qual destes vale?')]),
  fala('Todo mundo já viu essa pasta. Qual destes é o contrato que vale? O problema não é falta de cuidado: arquivo copiado não diz quem mudou, o quê, nem por quê, e nenhum deles diz que é o oficial.'),
  P([b('Slide 17 — O Git guarda cada versão, rubricada.'), ' O commit é a rubrica: quem, quando, o quê e por quê. O repositório é a pasta com todas as versões, para sempre; dá para comparar duas e voltar a qualquer uma.']),
  P([b('Slide 18 — Os trilhos viram linhas do tempo.'), ' É a ponte entre as partes.']),
  figura('linha-do-tempo', 400),
  fala('Tirem os dormentes dos trilhos: cada trilho vira uma linha do tempo, e cada bolinha é uma versão rubricada, um commit. Em B, alguém tira uma cópia para redigir uma cláusula; F1 e F2 são as versões dessa cópia; em M, a cópia é incorporada à minuta. Isso é o merge.'),
  P([b('Slide 19 — A mesma malha, no contrato.'), ' O mesmo desenho da malha dos trens, agora com as versões. O vagão virou cláusula: a feature é uma área redigindo uma cláusula; a release é a versão para assinatura, que só aceita correção de redação; o hotfix é o aditivo urgente. As etiquetas laranja na main são os números das versões que foram para produção, as tags; voltam no bloco 4.']),

  H2('Bloco 3 — Os tipos de merge — 30 min (slides 20 a 28)'),
  P([b('Objetivo: '), 'mostrar que há quatro jeitos de incorporar uma cópia, que todos levam o mesmo conteúdo e que a diferença é a história que fica registrada.']),
  P([b('Slide 21 — Antes de juntar: a minuta andou?'), ' É a pergunta que decide tudo. Se ninguém mexeu na minuta desde que a cópia saiu, juntar é trivial. Se mexeu, há três escolhas. Os quatro slides seguintes usam sempre o mesmo desenho: a develop com A, B e C; a cópia da cláusula de multa com F1 e F2.']),
  figura('merge-antes', 300),
  P([b('Slide 22 — Fast-forward.'), ' O marcador da develop só pula para a frente, até F2: não há junção, porque não há o que juntar. O histórico fica reto e perde o desenho da cópia. No GitFlow original, as junções evitam o fast-forward justamente para que a cópia continue visível.']),
  fala('Ninguém mexeu na minuta desde que você tirou a sua cópia. Então a sua cópia passa a ser a minuta.'),
  P([b('Slide 23 — Merge commit.'), ' A junção vira uma versão própria, M. Nada é reescrito; o histórico guarda quando a cópia saiu e quando voltou. É o jeito do GitFlow original, em todas as junções.']),
  fala('A cláusula entra com todas as versões, e alguém anota "incorporada em 12/10, aprovada por fulano".'),
  P([b('Slide 24 — Squash.'), ' Espremer: as versões da cópia viram uma só. Útil quando a cópia tem muitas versões pequenas ("ajuste", "ajuste 2", "agora vai"). Perde o passo a passo, e a cópia deve ser apagada depois: ela não serve mais para continuar o trabalho. Curiosidade: por isso a Diretriz 4 não mede a divergência só pelo número de commits, que o squash reduz sem reduzir a divergência real.']),
  fala('Passar a limpo: entra o texto final da cláusula, sem os rascunhos.'),
  P([b('Slide 25 — Rebase.'), ' Mudar a base: a cópia, que saía de B, passa a sair de C. As versões são refeitas e ganham o apóstrofo (F1′, F2′): mesmo conteúdo, outra identidade e outra data. Depois do rebase, a junção vira um fast-forward.']),
  fala('Antes de pedir o visto, você refaz a sua cópia em cima da minuta mais recente. Só que ninguém faz isso numa cópia que outras pessoas estão lendo: seria trocar as páginas debaixo do nariz delas.'),
  P([b('Slide 26 — Lado a lado.'), ' Resumo para fotografar. Insista na frase de baixo: nenhum tipo de merge perde a mudança em si.']),
  P([b('Slide 27 — Os botões.'), ' As plataformas do Modelo VIC são o GitHub e o Azure DevOps, e os botões aparecem na conclusão do pull request. O fast-forward puro não tem botão próprio: acontece quando a minuta não andou ou depois de um rebase. O semi-linear, do Azure DevOps, faz o rebase e ainda cria a versão de junção. Quem escolhe o tipo é a política do repositório; na dúvida, o Integrador (Diretriz 6).']),
  P([b('Slide 28 — Conflito.'), ' Não é erro de ninguém: é o Git avisando que duas mudanças disputam o mesmo trecho e que ele não vai adivinhar qual vale. Pode acontecer em qualquer tipo de merge.']),
  fala('O jurídico pôs a multa em 2%; o comercial, em 1%. Quem decide? Não é o Git, e muitas vezes não é o time técnico: é o negócio. Quando o conflito é de regra, o time vai precisar de vocês.'),

  H2('Dinâmica 2 — 15 min (slides 29 e 30)'),
  P('Conduza conforme a seção 5.'),

  H2('Bloco 4 — Versões e as regras do Modelo VIC — 15 min (slides 31 a 36)'),
  P([b('Objetivo: '), 'ligar o fluxo às regras do Modelo VIC. São seis slides em 15 minutos: não se demore em nenhum.']),
  P([b('Slide 32 — Nada entra sem visto.'), ' Mudança direta na main e na develop é bloqueada (Diretriz 7). Toda mudança chega por pull request, o pedido de visto, em dois momentos (Diretriz 8): a aprovação, pelos revisores do time, e a completude, pelo Integrador, que efetiva o merge. É na completude que se escolhe o tipo de merge. O PR fica guardado como evidência para auditoria. É o "quem libera a passagem" do regulamento da ferrovia.']),
  P([b('Slide 33 — Merge back.'), ' Toda release e todo hotfix que entram na main voltam para a develop, ao fim de cada ciclo (Diretriz 5). É a regra de ouro da parte 1, agora com nome.']),
  fala('Se a correção feita na versão para assinatura não volta para a minuta, a próxima versão, que é redigida a partir da minuta, sai com o erro de novo. É o aditivo que ninguém passou para a minuta, ou o vagão consertado que não voltou para o pátio.'),
  P([b('Slide 34 — O número da versão.'), ' MAJOR muda o que já valia; MINOR traz novidade sem mudar o que existia; PATCH corrige. As três partes são o SemVer (Diretriz 9). A quarta, o BUILD, identifica a montagem, e só versão com os quatro números vai para produção: é o Padrão VEC (Diretriz 10). Cada versão publicada tem a sua nota de versão, com o que foi adicionado, alterado e corrigido (Diretriz 13).']),
  P([b('Slide 35 — Cópia curta, junção frequente.'), ' Quanto mais tempo uma área fica com a sua cópia sem olhar a minuta, mais difícil é juntar depois. O Modelo VIC mede isso, a divergência, e fixa limites por faixa de maturidade; os números do slide são os da faixa 3, a meta institucional (Diretriz 4).']),
  P([b('Slide 36 — O que você viu hoje.'), ' Não leia a tabela inteira: escolha duas linhas. As Diretrizes 1 e 12 ficam de fora porque tratam de testes e do conteúdo dos arquivos, não do fluxo.']),

  H2('Dinâmica 3 — 25 min (slide 37)'),
  P('Conduza conforme a seção 5.'),

  H2('Fechamento — 10 min (slides 38 a 41)'),
  P([b('Slide 38 — Voltando à enquete.'), ' A resposta é C: o desvio é a branch, e o engate é o merge. A é parar o sistema: os clientes ficam sem atendimento. B é mexer direto em produção: o passageiro sente cada martelada, e é o que a proteção da main proíbe. D é refazer tudo a cada mudança: caro, e não resolve. Repita a enquete e mostre a diferença em relação ao começo.']),
  P([b('Slide 39 — Perguntas que você já pode fazer ao time.'), ' É o ganho prático da oficina. Peça que cada pessoa escolha a pergunta que vai fazer na próxima reunião.']),
  P([b('Slide 40 — Para levar.'), ' Três frases, a primeira da parte 1 e as outras duas da parte 2: cada trabalho no seu trilho; juntar é escolher a história; tudo o que chega à main volta para a develop. Envie a cartilha de bolso no chat.']),
  P([b('Slide 41 — "Cada trabalho no seu trilho."'), ' Agradeça e abra para dúvidas.']),
];

const dinamicas = [
  H1('5. As dinâmicas'),
  H2('Dinâmica 1 — Qual trilho? (20 min)'),
  P([b('Objetivo: '), 'associar situações do dia a dia de um sistema ao trilho certo, com a origem e o destino.']),
  N('Faça a primeira carta com a turma, no slide 13: "Desde ontem, o app em produção cobra a tarifa em dobro" é um vagão com defeito no trem comercial: hotfix/*, sai da main e volta para a main e para a develop.', 'd1'),
  N('Abra as salas por 12 minutos. Cada grupo arrasta as 12 cartas para as cinco raias (ou para o canto "Não pode!") e cola em cada uma a etiqueta "sai de / vai para".', 'd1'),
  N('Visite as salas. Se um grupo travar, pergunte: "isso já está no trem com passageiros? É um vagão novo ou um conserto? Dá para esperar a próxima composição?".', 'd1'),
  N('Na volta (8 min), peça a cada grupo a carta de que teve mais dúvida.', 'd1'),
  P([b('Perguntas para a volta:')]),
  B('"Na homologação da 2.4, um texto da tela está errado": por que não abre uma feature? (A vistoria já começou: o conserto é feito na própria release.)'),
  B('"A correção urgente de ontem também precisa estar na próxima versão": que trilho é esse? (Nenhum novo: é a volta do hotfix para o pátio, a develop.)'),
  B('"Alterar direto a versão em produção, porque é rapidinho": por que não pode? (A main é protegida: ninguém mexe no trem comercial sem autorização.)'),
  P([b('Gabarito: '), 'no material das dinâmicas.']),

  H2('Dinâmica 2 — Qual foi o merge? (15 min)'),
  P([b('Objetivo: '), 'reconhecer os quatro tipos de merge pelo desenho e pela intenção.']),
  N('Slide 29, rodadas 1 a 4: uma rodada por vez, com a enquete das quatro opções e 30 segundos para votar. Mostre o resultado e comente em 30 segundos.', 'd2'),
  N('Slide 30, rodadas 5 a 8: a mesma enquete, agora com situações em texto: "qual você escolheria?".', 'd2'),
  P([b('Respostas: '), '1 squash; 2 fast-forward; 3 rebase; 4 merge commit; 5 merge commit; 6 squash; 7 rebase; 8 fast-forward.']),
  P([b('O que observar: '), 'a rodada 2 é a pegadinha: o desenho não tem C, porque partiu do "antes" em que a minuta não andou. Na rodada 7, quem responder merge commit (trazer a develop para dentro da cópia) também resolve, e é a resposta certa quando a cópia é compartilhada com outras pessoas; reforce que o rebase é só para a própria cópia.']),

  H2('Dinâmica 3 — A vida de uma versão (25 min)'),
  P([b('Objetivo: '), 'montar, em grupo, as linhas do tempo de um sistema a partir de uma história, com release, hotfix e merge back.']),
  P([b('Caso: '), 'o Contratos Online é um sistema fictício; em produção está a versão v2.3.0.97. Os oito eventos estão no slide 37 e no frame de cada grupo.']),
  N('Explique a tarefa: desenhar as linhas do tempo, na ordem dos eventos, numerando cada versão com o número do evento.', 'd3'),
  N('Salas por 15 minutos.', 'd3'),
  N('Na volta (10 min), um grupo mostra o desenho e os outros comparam. Depois, mostre o gabarito.', 'd3'),
  figura('gabarito-d3', 470),
  P([b('Respostas das perguntas:')]),
  B('Branches temporárias: feature/assinatura, feature/alerta, release/2.4.0 e hotfix/2.4.1.'),
  B('Números de versão na main: v2.4.0.118 (evento 6) e v2.4.1.121 (evento 7).'),
  B('O alerta de vencimento chega aos clientes na 2.5.0, a próxima release. É MINOR porque é novidade que não muda o que já existia.'),
  B('Sem o merge back do evento 7, a 2.5.0 sairia da develop sem a correção e voltaria a calcular a multa errada.'),
  B('Tipo de merge no evento 3: resposta aberta. No GitFlow original, merge commit, para a cópia ficar visível; squash, se a cópia tiver muitas versões pequenas. Quem decide é a política do repositório.'),
  P([b('Erros mais comuns, para comentar com carinho:')]),
  B('O hotfix saindo da develop: emergência sai da main, que é onde está o que o cliente usa.'),
  B('O alerta de vencimento entrando na release/2.4.0: a versão já estava em homologação; o alerta espera a próxima.'),
  B('Esquecer um dos dois destinos da release ou do hotfix.'),
  B('Número de versão na develop: o número só vai na main.'),
];

const faq = [
  H1('6. Perguntas frequentes'),
  ...[
    ['Por que duas analogias?', 'Porque cada uma explica bem uma parte. O trem mostra por que existem trilhos separados e para onde cada um leva. O contrato mostra o que fica registrado e como as cópias se juntam, coisas que o trem não explica: um trem de verdade não se copia nem guarda a história de cada vagão.'],
    ['O GitFlow é o mesmo que o Git?', 'Não. O Git é a ferramenta que guarda as versões; o GitFlow é um combinado de como usar as branches do Git. Dá para usar o Git sem o GitFlow; a Diretriz 2 do Modelo VIC adota o GitFlow.'],
    ['E o GitHub? E o Azure DevOps?', 'São as plataformas onde os repositórios ficam e onde se fazem os pull requests. O Modelo VIC adota as duas.'],
    ['Já ouvi falar de GitHub Flow. É outra coisa?', 'É um modelo mais simples, com a main e desvios curtos, sem develop nem release. O Modelo VIC cita os dois como modelos de mercado; esta oficina trata só do GitFlow, o modelo que a Diretriz 2 adota.'],
    ['Numa feature só existe um vagão?', 'Na analogia, sim: é a forma de dizer que a feature cuida de uma funcionalidade. No Git, a branch tem uma cópia do sistema inteiro, mas a equipe só mexe na parte dela.'],
    ['Qual é o melhor tipo de merge?', 'Não existe um melhor: cada um conta a história de um jeito. O que vale é a política do repositório, que o Integrador conhece. No GitFlow original, as junções são merge commit.'],
    ['O rebase é perigoso?', 'É seguro na própria cópia, que só você usa. Perigoso é reescrever a história de uma linha que outras pessoas usam; por isso a main e a develop são protegidas.'],
    ['O squash apaga o trabalho?', 'Não: o conteúdo inteiro entra na develop. Some só o passo a passo da cópia, que fica registrado no pull request.'],
    ['Por que a release não recebe novidade?', 'Porque ela está em vistoria. Se entrar vagão novo, o que foi testado deixa de ser o que vai para produção. Novidade espera a próxima release.'],
    ['Quem pode fazer o merge na main?', 'Os integradores do time, na completude do pull request, depois da aprovação dos revisores (Diretrizes 7 e 8).'],
    ['O que é o BUILD da versão?', 'A quarta parte do número, do Padrão VEC. Diferencia montagens sucessivas da mesma versão, e só versão com BUILD vai para produção (Diretriz 10).'],
  ].flatMap(([p, r]) => [H3(p), P(r)]),
];

const glossario = [
  espaco(),
  H1semQuebra('7. Glossário rápido'),
  tabela(['Termo', 'Significado'], [
    [[b('Git')], 'A ferramenta que guarda todas as versões dos arquivos, com quem mudou, quando e por quê.'],
    [[b('Repositório')], 'A pasta de um projeto, com todos os arquivos e todo o histórico.'],
    [[b('Branch')], 'Um trilho: uma linha de trabalho separada. No contrato, uma cópia de trabalho.'],
    [[b('Commit')], 'Uma versão registrada: a versão rubricada da minuta.'],
    [[b('Merge')], 'A junção de uma branch em outra: o engate do vagão, a cópia incorporada.'],
    [[b('GitFlow')], 'O modelo de branches com main, develop, feature, release e hotfix, adotado pelo Modelo VIC.'],
    [[b('Fast-forward')], 'Merge sem junção: a minuta não andou, e o marcador só avança.'],
    [[b('Merge commit')], 'Merge com uma versão de junção, que guarda a cópia no histórico.'],
    [[b('Squash')], 'Merge que junta todas as versões da cópia numa só.'],
    [[b('Rebase')], 'Refazer a cópia a partir da versão atual da linha, com versões novas.'],
    [[b('Conflito')], 'Quando as duas linhas mudaram o mesmo trecho e uma pessoa precisa decidir.'],
    [[b('Pull request (PR)')], 'O pedido para levar uma branch a outra, com revisão, aprovação e completude.'],
    [[b('Integrador')], 'O papel que zela pelas regras do Modelo VIC e conclui os pull requests.'],
    [[b('Merge back')], 'A volta obrigatória da release e do hotfix para a develop.'],
    [[b('Tag')], 'O número da versão, preso à versão da main que foi para produção.'],
    [[b('SemVer / VEC')], 'MAJOR.MINOR.PATCH, e o BUILD que o Padrão VEC acrescenta para produção.'],
  ], [2600, 6426]),
];

const doc = new Document({
  creator: 'Modelo VIC',
  title: 'Roteiro do facilitador — Nos trilhos do GitFlow',
  styles: {
    default: { document: { run: { font: FONTE, size: 21, color: TINTA } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 36, bold: true, color: AZUL, font: FONTE }, paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 27, bold: true, color: AZUL, font: FONTE }, paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 22, bold: true, color: TINTA, font: FONTE }, paragraph: { spacing: { before: 200, after: 60 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'marcadores', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 260 } } } }, { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 800, hanging: 260 } } } }] },
      ...['passos', 'objetivos', 'abertura', 'malha', 'd1', 'd2', 'd3'].map((reference) => ({ reference, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } }] })),
    ],
  },
  sections: [
    { properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children: capa },
    {
      properties: { page: { margin: { top: 1440, bottom: 1300, left: 1440, right: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new ImageRun({ type: 'png', data: logo, transformation: { width: 120, height: Math.round(120 / 3.605) } })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'Roteiro do facilitador · Nos trilhos do GitFlow · página ', color: MUTED, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 16 })] })] }) },
      children: [...sumario, ...visao, ...preparo, ...crono, ...blocos, ...dinamicas, ...faq, ...glossario],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(SAIDA, buf); console.log('ok', SAIDA); });

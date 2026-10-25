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
    ['1. A oficina em uma página', 'objetivos, as duas analogias e os papéis'],
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
  P('A oficina apresenta o GitFlow a quem nunca programou: a pessoa de negócio que acompanha entregas, conversa com o time técnico e ouve falar de branch, merge e release sem saber o que cada coisa quer dizer. Ao fim, ela entende o desenho do fluxo, os tipos de merge e as regras do Modelo VIC que tocam o seu dia a dia, e sabe que perguntas fazer ao time.'),
  H2('Objetivos de aprendizagem'),
  P('Ao fim da oficina, a pessoa consegue:'),
  N('Explicar em uma frase o que é um commit, uma branch e um merge.', 'objetivos'),
  N('Dizer para que serve cada um dos cinco trilhos do GitFlow (main, develop, feature, release e hotfix), de onde cada um sai e para onde vai.', 'objetivos'),
  N('Reconhecer, num desenho, os quatro tipos de merge (fast-forward, merge commit, squash e rebase) e dizer o que cada um deixa no histórico.', 'objetivos'),
  N('Explicar o que é um conflito e por que a decisão pode ser de negócio.', 'objetivos'),
  N('Relacionar o fluxo com as regras do Modelo VIC: pull request, proteção das branches, merge back, número da versão e divergência.', 'objetivos'),
  H2('As duas analogias'),
  P('A oficina usa duas lentes, sempre juntas e sempre com o mesmo papel. A ferrovia é a lente para ver: todo desenho é de trilhos. O contrato é a lente para entender o motivo: toda regra é explicada com as minutas de um contrato. Não troque os papéis no meio da oficina, e não traga uma terceira analogia.'),
  tabela(['No Git', 'Na ferrovia', 'No contrato'], [
    [[b('Repositório')], 'a malha ferroviária', 'a pasta do contrato, com todas as versões'],
    [[b('Commit')], 'uma estação', 'uma versão rubricada: quem, quando, o quê e por quê'],
    [[b('Branch')], 'um trilho; um desvio, quando sai de outro', 'uma cópia de trabalho'],
    [[b('Merge')], 'um entroncamento', 'a cópia incorporada ao original'],
    [[m('main')], 'a linha em operação', 'o contrato assinado, em vigor'],
    [[m('develop')], 'a linha da próxima composição', 'a minuta consolidada da próxima versão'],
    [[m('feature/*')], 'o desvio de obra', 'a cláusula que uma área redige'],
    [[m('release/*')], 'o pátio de vistoria', 'a versão para assinatura: só correção'],
    [[m('hotfix/*')], 'o desvio de emergência', 'o aditivo urgente'],
    [[b('Tag')], 'a placa da estação', 'o número da versão assinada'],
    [[b('Pull request')], 'o pedido de passagem pela cancela', 'o pedido de visto'],
    [[b('Integrador')], 'o controlador que libera a passagem', 'quem dá o visto final e protocola'],
    [[b('Conflito')], 'dois trens no mesmo trecho', 'duas áreas mudaram a mesma cláusula'],
    [[b('Merge back')], 'a volta obrigatória para a develop', 'o aditivo que também entra na minuta'],
  ], [2000, 3326, 3700]),
  espaco(),
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
  N([b('Monte o quadro. '), 'Um frame por grupo para a Dinâmica 1: as 12 cartas misturadas, cinco raias (main, develop, feature/*, release/*, hotfix/*), um canto "Não pode!" e etiquetas em branco para "sai de / vai para". Um frame por grupo para a Dinâmica 3: os oito eventos e as peças da malha (trilhos das cinco cores, estações redondas e placas laranja). Tudo está no material das dinâmicas.']),
  N([b('Crie as enquetes '), '(Forms no Teams). A enquete-gancho: "O que garante que nenhuma mudança se perde?", com as opções A) Cada um manda a sua versão por e-mail, B) Uma pessoa edita de cada vez, C) Cada área trabalha numa cópia, com regra para voltar, D) Todo mundo edita o mesmo arquivo. Para a Dinâmica 2, uma enquete com as quatro opções: Fast-forward, Merge commit, Squash e Rebase; dá para reaproveitar a mesma nas oito rodadas.']),
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
    ['0:10', '20', 'Bloco 1 — Por que versionar (o contrato)', '4–8'],
    ['0:30', '25', 'Bloco 2 — A malha ferroviária: os cinco trilhos', '9–15'],
    ['0:55', '20', [b('Dinâmica 1 — Qual trilho?')], '16'],
    ['1:15', '10', 'Intervalo', '17'],
    ['1:25', '30', 'Bloco 3 — Os tipos de merge e o conflito', '18–26'],
    ['1:55', '15', [b('Dinâmica 2 — Qual foi o merge?')], '27–28'],
    ['2:10', '15', 'Bloco 4 — A viagem no Modelo VIC', '29–34'],
    ['2:25', '25', [b('Dinâmica 3 — A viagem do Contratos Online')], '35'],
    ['2:50', '10', 'Fechamento', '36–39'],
  ], [1100, 800, 5826, 1300]),
  espaco(),
  quadro('Se o tempo apertar', [
    B('No bloco 4, passe rápido pelos slides 33 (divergência) e 34 (o resumo das diretrizes): os dois servem de consulta depois.'),
    B('Na Dinâmica 2, faça só as rodadas 1 a 4, as dos desenhos.'),
    B('Na volta da Dinâmica 3, só um grupo apresenta, e você mostra o gabarito.'),
  ]),
  espaco(),
  quadro('Se sobrar tempo', [
    B('No fechamento, peça que cada pessoa escreva no chat a pergunta do slide 37 que vai fazer na próxima reunião com o time.'),
    B('Mostre, no GitHub ou no Azure DevOps de um repositório real, o desenho das branches e um pull request concluído. Escolha antes um repositório sem dado sensível.'),
  ]),
];

const blocos = [
  H1('4. Roteiro bloco a bloco'),
  P([{ text: 'Os trechos com a barra laranja são sugestões de fala. Use as suas palavras; o que importa é a ideia.', color: MUTED }]),

  H2('Abertura — 10 min (slides 1 a 3)'),
  P([b('Objetivo: '), 'acolher, combinar as regras do remoto e plantar a pergunta que fecha a oficina.']),
  N('Slide 1 — Boas-vindas. Apresente-se e diga o que a turma vai levar: entender o que o time técnico quer dizer com branch, merge e release, sem precisar programar.', 'abertura'),
  N('Slide 2 — Agenda e combinados: câmera opcional, microfone fechado fora das salas, chat aberto o tempo todo.', 'abertura'),
  N('Slide 3 — Abra a enquete-gancho. Não comente a resposta.', 'abertura'),
  fala('Guardem a resposta de vocês. A gente volta a essa pergunta no fim, e cada opção conta um pedaço da história.'),

  H2('Bloco 1 — Por que versionar — 20 min (slides 4 a 8)'),
  P([b('Objetivo: '), 'mostrar o problema que o Git e o GitFlow resolvem, com o contrato e suas minutas.']),
  P([b('Slide 5 — Qual destes vale?')]),
  fala('Todo mundo já viu essa pasta. Qual destes é o contrato que vale? O problema não é falta de cuidado: arquivo copiado não diz quem mudou, o quê, nem por quê, e nenhum deles diz que é o oficial.'),
  P([b('Slide 6 — O Git guarda cada versão, rubricada.'), ' O commit é a rubrica: quem, quando, o quê e por quê. O repositório é a pasta com todas as versões, para sempre; dá para comparar duas e voltar a qualquer uma. Isso responde a pergunta 2 do slide anterior, mas não a 1 nem a 3.']),
  P([b('Slide 7 — O que o GitFlow responde.'), ' Duas perguntas: qual versão vale e como várias pessoas mudam ao mesmo tempo sem atropelar. O GitFlow foi publicado em 2010 por Vincent Driessen e virou modelo de mercado. No Modelo VIC, ele é regra: a Diretriz 2 exige aderência ao GitFlow, com a develop e a main presentes e protegidas.']),
  P([b('Slide 8 — Duas lentes.'), ' Combine com a turma o papel de cada analogia: a ferrovia para ver, o contrato para entender. A frase do fim resume a oficina:']),
  fala('GitFlow é o regulamento da ferrovia: diz quais trilhos existem, de onde cada um sai, para onde vai e quem libera a passagem.'),

  H2('Bloco 2 — A malha ferroviária — 25 min (slides 9 a 15)'),
  P([b('Objetivo: '), 'apresentar os cinco trilhos e a regra de origem e destino de cada um.']),
  P([b('Slide 10 — Trilho, estação, desvio e entroncamento.'), ' Leia o desenho da esquerda para a direita: o tempo corre para a direita.']),
  figura('desvio', 420),
  fala('A linha azul é um trilho. Cada bolinha é uma estação, um commit. Em B sai um desvio: alguém foi trabalhar separado, sem fechar a linha. F1 e F2 são as paradas desse trabalho. Em M, o desvio volta: isso é o merge.'),
  P([b('Slide 11 — Dois trilhos permanentes.'), ' A main é a linha em operação, o contrato assinado; a develop é a linha da próxima composição, a minuta consolidada. Ninguém escreve direto em nenhum dos dois (Diretriz 7).']),
  P([b('Pergunta para a turma: '), '"Se a develop é a minuta, quando ela vira contrato assinado?" (Quando passa pela vistoria, a release, e entra na main.)']),
  P([b('Slide 12 — Três trilhos temporários.'), ' O asterisco quer dizer "qualquer nome". Feature é obra: uma novidade. Release é vistoria: a versão para de receber novidades e só recebe correção. Hotfix é emergência em produção. Chame a atenção para a última linha de cada cartão: release e hotfix voltam para dois lugares. Temporário quer dizer que, depois da junção, o desvio é apagado (Diretriz 3).']),
  P([b('Slide 13 — A malha completa.'), ' Percorra o desenho devagar; é o slide mais importante do bloco.']),
  figura('malha', 470),
  N('A obra A sai da develop e volta.', 'malha'),
  N('Do mesmo ponto saem a vistoria (release) e a obra B.', 'malha'),
  N('A vistoria recebe uma correção, entra na main com a placa v1.1.0.31 e volta para a develop.', 'malha'),
  N('Uma emergência sai da main, entra na main com a placa v1.1.1.33 e também volta para a develop.', 'malha'),
  N('A obra B, mais longa, entra na develop e vai esperar a próxima vistoria.', 'malha'),
  P([b('Slide 14 — De onde sai, para onde vai.'), ' É a tabela da Diretriz 2. A regra de ouro, tudo o que entra na main volta para a develop, é o merge back, que volta no bloco 4.']),
  P([b('Slide 15 — O nome diz o trilho.'), ' Os nomes seguem a Diretriz 11, e é por eles que as ferramentas e os indicadores reconhecem cada trilho. A placa é a tag; o número de quatro partes é explicado no bloco 4. Por ora: placa na main é versão que foi para produção (Diretriz 10).']),

  H2('Dinâmica 1 — 20 min (slide 16)'),
  P('Conduza conforme a seção 5.'),

  H2('Intervalo — 10 min (slide 17)'),
  P('Antes de sair, deixe a enquete da Dinâmica 2 pronta.'),

  H2('Bloco 3 — Os tipos de merge — 30 min (slides 18 a 26)'),
  P([b('Objetivo: '), 'mostrar que há quatro jeitos de juntar um desvio, que todos levam o mesmo conteúdo e que a diferença é a história que fica registrada.']),
  P([b('Slide 19 — Antes de juntar: a linha andou?'), ' É a pergunta que decide tudo. Se a develop não andou desde que o desvio saiu, juntar é trivial. Se andou, há três escolhas. Os quatro slides seguintes usam sempre o mesmo desenho: develop com A, B e C; desvio com F1 e F2.']),
  figura('merge-antes', 300),
  P([b('Slide 20 — Fast-forward.'), ' O marcador da develop só pula para a frente, até F2: não há junção, porque não há o que juntar. O histórico fica reto e perde o desenho do desvio. No GitFlow original, as junções evitam o fast-forward justamente para que o desvio continue visível.']),
  fala('No contrato: ninguém mexeu na minuta desde que você pegou a sua cópia. Então a sua cópia passa a ser a minuta.'),
  P([b('Slide 21 — Merge commit.'), ' A junção vira uma estação própria, M. Nada é reescrito; o mapa guarda quando o desvio saiu e quando voltou. É o jeito do GitFlow original, em todas as junções.']),
  fala('No contrato: a cláusula entra com todas as versões, e alguém anota "incorporada em 12/10, aprovada por fulano".'),
  P([b('Slide 22 — Squash.'), ' Espremer: as paradas do desvio viram uma estação só. Útil quando o desvio tem muitas paradas pequenas ("ajuste", "ajuste 2", "agora vai"). Perde o passo a passo, e o desvio deve ser apagado depois: ele não serve mais para continuar o trabalho. Curiosidade: por isso a Diretriz 4 não mede a divergência só pelo número de commits, que o squash reduz sem reduzir a divergência real.']),
  fala('No contrato: passar a limpo. Entra o texto final da cláusula, sem os rascunhos.'),
  P([b('Slide 23 — Rebase.'), ' Mudar a base: o desvio, que saía de B, passa a sair de C. As estações são reconstruídas e ganham o apóstrofo (F1′, F2′): mesmo conteúdo, outra identidade e outra data. Depois do rebase, a junção vira um fast-forward.']),
  fala('No contrato: antes de pedir o visto, você refaz a sua cópia em cima da minuta mais recente. Só que ninguém faz isso numa cópia que outras pessoas estão lendo: seria trocar as páginas debaixo do nariz delas.'),
  P([b('Slide 24 — Lado a lado.'), ' Resumo para fotografar. Insista na frase de baixo: nenhum tipo de merge perde a mudança em si.']),
  P([b('Slide 25 — Os botões.'), ' As plataformas do Modelo VIC são o GitHub e o Azure DevOps, e os botões aparecem na conclusão do pull request. O fast-forward puro não tem botão próprio: acontece quando a linha não andou ou depois de um rebase. O semi-linear, do Azure DevOps, faz o rebase e ainda cria a estação de junção. Quem escolhe o tipo é a política do repositório; na dúvida, o Integrador (Diretriz 6).']),
  P([b('Slide 26 — Conflito.'), ' Não é erro de ninguém: é o Git avisando que duas mudanças disputam o mesmo trecho e que ele não vai adivinhar qual vale. Pode acontecer em qualquer tipo de merge.']),
  fala('O jurídico pôs a multa em 2%; o comercial, em 1%. Quem decide? Não é o Git, e muitas vezes não é o time técnico: é o negócio. Quando o conflito é de regra, o time vai precisar de vocês.'),

  H2('Dinâmica 2 — 15 min (slides 27 e 28)'),
  P('Conduza conforme a seção 5.'),

  H2('Bloco 4 — A viagem no Modelo VIC — 15 min (slides 29 a 34)'),
  P([b('Objetivo: '), 'ligar o fluxo às regras do Modelo VIC. São seis slides em 15 minutos: não se demore em nenhum.']),
  P([b('Slide 30 — A cancela.'), ' Push direto na main e na develop é bloqueado (Diretriz 7). Toda mudança chega por pull request, o pedido de passagem, em dois momentos (Diretriz 8): a aprovação, pelos revisores do time, e a completude, pelo Integrador, que efetiva o merge. É na completude que se escolhe o tipo de merge. O PR fica guardado como evidência para auditoria.']),
  P([b('Slide 31 — Merge back.'), ' Toda release e todo hotfix que entram na main voltam para a develop, ao fim de cada ciclo (Diretriz 5).']),
  fala('Se a correção feita na vistoria não volta para a develop, a próxima versão, que é montada a partir da develop, sai com o erro de novo. É o aditivo que ninguém passou para a minuta.'),
  P([b('Slide 32 — O número da versão.'), ' MAJOR muda o que já valia; MINOR traz novidade sem mudar o que existia; PATCH corrige. As três partes são o SemVer (Diretriz 9). A quarta, o BUILD, identifica a montagem, e só versão com os quatro números vai para produção: é o Padrão VEC (Diretriz 10). Cada versão publicada tem a sua nota de versão, com o que foi adicionado, alterado e corrigido (Diretriz 13).']),
  P([b('Slide 33 — Desvio curto, junção frequente.'), ' Quanto mais tempo uma área fica com a sua cópia sem olhar a minuta, mais difícil é juntar depois. O Modelo VIC mede isso, a divergência, e fixa limites por faixa de maturidade; os números do slide são os da faixa 3, a meta institucional (Diretriz 4).']),
  P([b('Slide 34 — O que você viu hoje.'), ' Não leia a tabela inteira: escolha duas linhas. As Diretrizes 1 e 12 ficam de fora porque tratam de testes e do conteúdo dos arquivos, não do fluxo.']),

  H2('Dinâmica 3 — 25 min (slide 35)'),
  P('Conduza conforme a seção 5.'),

  H2('Fechamento — 10 min (slides 36 a 39)'),
  P([b('Slide 36 — Voltando à enquete.'), ' A resposta é C: cada trilho é uma cópia, e o GitFlow é a regra de como e quando as cópias voltam. A é a pasta do FINAL_v3: ninguém sabe qual vale. B funciona, mas é uma fila: ninguém trabalha em paralelo. D é o atropelo: um salva por cima do outro. Repita a enquete e mostre a diferença em relação ao começo.']),
  P([b('Slide 37 — Perguntas que você já pode fazer ao time.'), ' É o ganho prático da oficina. Peça que cada pessoa escolha a pergunta que vai fazer na próxima reunião.']),
  P([b('Slide 38 — Para levar.'), ' Três frases: cada trem no seu trilho; juntar é escolher a história; tudo o que chega à main volta para a develop. Envie a cartilha de bolso no chat.']),
  P([b('Slide 39 — "Cada trem no seu trilho."'), ' Agradeça e abra para dúvidas.']),
];

const dinamicas = [
  H1('5. As dinâmicas'),
  H2('Dinâmica 1 — Qual trilho? (20 min)'),
  P([b('Objetivo: '), 'associar situações do dia a dia de um sistema ao trilho certo, com a origem e o destino.']),
  N('Faça a primeira carta com a turma, no slide 16: "Desde ontem, o app em produção cobra a tarifa em dobro" vai para hotfix/*, sai da main e volta para a main e para a develop.', 'd1'),
  N('Abra as salas por 12 minutos. Cada grupo arrasta as 12 cartas para as cinco raias (ou para o canto "Não pode!") e cola em cada uma a etiqueta "sai de / vai para".', 'd1'),
  N('Visite as salas. Se um grupo travar, pergunte: "isso já está com o cliente? É novidade ou é conserto? Dá para esperar a próxima versão?".', 'd1'),
  N('Na volta (8 min), peça a cada grupo a carta de que teve mais dúvida.', 'd1'),
  P([b('Perguntas para a volta:')]),
  B('"Na homologação da 2.4, um texto da tela está errado": por que não abre uma feature? (A vistoria já começou: correção entra na própria release.)'),
  B('"A correção urgente de ontem também precisa estar na próxima versão": que trilho é esse? (Nenhum novo: é o merge back do hotfix para a develop.)'),
  B('"Alterar direto a versão em produção, porque é rapidinho": por que não pode? (A main é protegida; tudo passa pela cancela do pull request.)'),
  P([b('Gabarito: '), 'no material das dinâmicas.']),

  H2('Dinâmica 2 — Qual foi o merge? (15 min)'),
  P([b('Objetivo: '), 'reconhecer os quatro tipos de merge pelo desenho e pela intenção.']),
  N('Slide 27, rodadas 1 a 4: uma rodada por vez, com a enquete das quatro opções e 30 segundos para votar. Mostre o resultado e comente em 30 segundos.', 'd2'),
  N('Slide 28, rodadas 5 a 8: a mesma enquete, agora com situações em texto: "qual você escolheria?".', 'd2'),
  P([b('Respostas: '), '1 squash; 2 fast-forward; 3 rebase; 4 merge commit; 5 merge commit; 6 squash; 7 rebase; 8 fast-forward.']),
  P([b('O que observar: '), 'a rodada 2 é a pegadinha: o desenho não tem C, porque partiu do "antes" em que a linha não andou. Na rodada 7, quem responder merge commit (trazer a develop para dentro do desvio) também resolve, e é a resposta certa quando o desvio é compartilhado com outras pessoas; reforce que o rebase é só para o próprio desvio.']),

  H2('Dinâmica 3 — A viagem do Contratos Online (25 min)'),
  P([b('Objetivo: '), 'montar, em grupo, uma malha completa a partir de uma história, com release, hotfix e merge back.']),
  P([b('Caso: '), 'o Contratos Online é um sistema fictício; em produção está a versão v2.3.0.97. Os oito eventos estão no slide 35 e no frame de cada grupo.']),
  N('Explique a tarefa: desenhar a malha, na ordem dos eventos, numerando cada estação com o número do evento.', 'd3'),
  N('Salas por 15 minutos.', 'd3'),
  N('Na volta (10 min), um grupo mostra a malha e os outros comparam. Depois, mostre o gabarito.', 'd3'),
  figura('gabarito-d3', 470),
  P([b('Respostas das perguntas:')]),
  B('Trilhos temporários: feature/assinatura, feature/alerta, release/2.4.0 e hotfix/2.4.1.'),
  B('Placas na main: v2.4.0.118 (evento 6) e v2.4.1.121 (evento 7).'),
  B('O alerta de vencimento chega aos clientes na 2.5.0, a próxima release. É MINOR porque é novidade que não muda o que já existia.'),
  B('Sem o merge back do evento 7, a 2.5.0 sairia da develop sem a correção e voltaria a calcular a multa errada.'),
  B('Tipo de merge no evento 3: resposta aberta. No GitFlow original, merge commit, para o desvio ficar visível; squash, se o desvio tiver muitas paradas pequenas. Quem decide é a política do repositório.'),
  P([b('Erros mais comuns, para comentar com carinho:')]),
  B('O hotfix saindo da develop: emergência sai da main, que é onde está o que o cliente usa.'),
  B('O alerta de vencimento entrando na release/2.4.0: a vistoria já tinha começado; o alerta espera a próxima.'),
  B('Esquecer um dos dois destinos da release ou do hotfix.'),
  B('Placa na develop: placa de versão só na main.'),
];

const faq = [
  H1('6. Perguntas frequentes'),
  ...[
    ['O GitFlow é o mesmo que o Git?', 'Não. O Git é a ferramenta que guarda as versões; o GitFlow é um combinado de como usar as branches do Git. Dá para usar o Git sem o GitFlow; a Diretriz 2 do Modelo VIC adota o GitFlow.'],
    ['E o GitHub? E o Azure DevOps?', 'São as plataformas onde os repositórios ficam e onde se fazem os pull requests. O Modelo VIC adota as duas.'],
    ['Já ouvi falar de GitHub Flow. É outra coisa?', 'É um modelo mais simples, com a main e desvios curtos, sem develop nem release. O Modelo VIC cita os dois como modelos de mercado; esta oficina trata só do GitFlow, o modelo que a Diretriz 2 adota.'],
    ['Qual é o melhor tipo de merge?', 'Não existe um melhor: cada um conta a história de um jeito. O que vale é a política do repositório, que o Integrador conhece. No GitFlow original, as junções são merge commit.'],
    ['O rebase é perigoso?', 'É seguro no próprio desvio, que só você usa. Perigoso é reescrever a história de um trilho que outras pessoas usam; por isso a main e a develop são protegidas.'],
    ['O squash apaga o trabalho?', 'Não: o conteúdo inteiro entra na develop. Some só o passo a passo do desvio, que fica registrado no pull request.'],
    ['Por que a release não recebe novidade?', 'Porque ela está em vistoria. Se entrar novidade, o que foi testado deixa de ser o que vai para produção. Novidade espera a próxima release.'],
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
    [[b('Commit')], 'Uma versão registrada: a estação da ferrovia, a rubrica da minuta.'],
    [[b('Branch')], 'Uma linha de trabalho: o trilho.'],
    [[b('Merge')], 'A junção de uma branch em outra: o entroncamento.'],
    [[b('GitFlow')], 'O modelo de branches com main, develop, feature, release e hotfix, adotado pelo Modelo VIC.'],
    [[b('Fast-forward')], 'Merge sem junção: a linha não andou, e o marcador só avança.'],
    [[b('Merge commit')], 'Merge com uma estação de junção, que guarda o desvio no histórico.'],
    [[b('Squash')], 'Merge que junta todas as estações do desvio numa só.'],
    [[b('Rebase')], 'Reassentar o desvio a partir do ponto atual da linha, com estações novas.'],
    [[b('Conflito')], 'Quando as duas linhas mudaram o mesmo trecho e uma pessoa precisa decidir.'],
    [[b('Pull request (PR)')], 'O pedido para levar uma branch a outra, com revisão, aprovação e completude.'],
    [[b('Integrador')], 'O papel que zela pelas regras do Modelo VIC e conclui os pull requests.'],
    [[b('Merge back')], 'A volta obrigatória da release e do hotfix para a develop.'],
    [[b('Tag')], 'A placa com o número da versão, na estação da main que foi para produção.'],
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

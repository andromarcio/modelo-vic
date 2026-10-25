"""Gera o HTML do material das dinâmicas e da cartilha de bolso (Modelo VIC).

Uso: python3 gera-pdfs.py <pasta-de-saida>   (ou npm run pdfs; as figuras vêm antes, de npm run figuras)
Os PDFs saem do HTML pelo Chromium (render-pdf.mjs). As fontes vêm do Google Fonts: a Roboto, que está na
pilha de fontes do Modelo VIC, e a JetBrains Mono, que está na pilha monoespaçada.
"""
import html
import sys
from pathlib import Path

SAIDA = Path(sys.argv[1])
SAIDA.mkdir(parents=True, exist_ok=True)
AQUI = Path(__file__).parent.resolve()
MARCA = (AQUI / '..' / '..' / '..' / 'prototypes' / 'versionamento-codigo' / 'assets' / 'brand').resolve()
FIGURAS = AQUI / 'saida' / 'figuras'
e = html.escape


def fig(nome, classe='fig'):
    return f'<div class="{classe}">{(FIGURAS / (nome + ".svg")).read_text(encoding="utf8")}</div>'


CSS = """
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@400;700&display=swap');
@page { size: A4; margin: 0; }
:root {
  --tinta: #22292e; --escuro: #00437a; --azul: #005ca9; --laranja: #f39200; --teal: #21caaf; --teal-escuro: #216e62;
  --vermelho: #d93636; --papel: #f5f8fa; --tint: #e5f2fc; --muted: #525f66; --linha: #c2d2d6;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: 'Roboto', 'Segoe UI', system-ui, sans-serif; color: var(--tinta); background: var(--papel);
  -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 10.5pt; line-height: 1.45; }
.pagina { width: 210mm; height: 297mm; padding: 14mm 16mm 13mm; position: relative; overflow: hidden;
  page-break-after: always; display: flex; flex-direction: column; background: var(--papel); }
.pagina:last-child { page-break-after: auto; }
.topo { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6mm; }
.topo img { height: 10mm; }
.topo .rotulo { font-family: 'JetBrains Mono', Consolas, monospace; font-size: 8pt; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }
.rodape { margin-top: auto; padding-top: 4mm; display: flex; justify-content: space-between; font-size: 7.5pt; color: var(--muted); }
h1, h2, h3 { color: var(--azul); margin: 0; line-height: 1.15; }
h1 { font-size: 23pt; font-weight: 800; margin-bottom: 3mm; color: var(--escuro); }
h2 { font-size: 14pt; font-weight: 700; margin: 5mm 0 2.5mm; }
h3 { font-size: 11pt; font-weight: 700; margin: 3.5mm 0 1.5mm; color: var(--tinta); }
p { margin: 0 0 2.2mm; }
.lead { font-size: 11.5pt; }
.muted { color: var(--muted); }
.mono { font-family: 'JetBrains Mono', Consolas, monospace; }
.carimbo { display: inline-block; font-family: 'JetBrains Mono', Consolas, monospace; font-weight: 700; font-size: 9pt;
  color: var(--azul); border: 1.4px dashed var(--azul); padding: 1.2mm 3mm; transform: rotate(-2deg); letter-spacing: .05em; margin-bottom: 3mm; align-self: flex-start; }
.caixa { background: var(--tint); border-radius: 3mm; padding: 4mm 5mm; margin: 2mm 0 3mm; }
.caixa.branca { background: #fff; border: 1px solid var(--linha); }
ol, ul { margin: 0 0 2mm; padding-left: 5.5mm; }
li { margin-bottom: 1.2mm; }
table { width: 100%; border-collapse: collapse; margin: 1.5mm 0 3mm; font-size: 9.5pt; }
th { background: var(--azul); color: #fff; text-align: left; padding: 1.8mm 2.5mm; font-weight: 700; }
td { border-bottom: 1px solid var(--linha); padding: 1.6mm 2.5mm; vertical-align: top; background: #fff; }
.fig svg { width: 100%; height: auto; display: block; }
.fig { background: #fff; border: 1px solid var(--linha); border-radius: 3mm; padding: 2mm 3mm; margin: 1mm 0 3mm; }
/* trilhos: a cor de cada branch */
.t { font-family: 'JetBrains Mono', Consolas, monospace; font-weight: 700; padding: .3mm 1.8mm; border-radius: 3mm; white-space: nowrap; font-size: .92em; }
.t-main { background: var(--escuro); color: #fff; } .t-develop { background: var(--azul); color: #fff; }
.t-feature { background: var(--teal); color: var(--tinta); } .t-release { background: var(--laranja); color: var(--tinta); }
.t-hotfix { background: var(--vermelho); color: #fff; } .t-nao { background: var(--tinta); color: #fff; }
.cartas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-top: 2mm; }
.carta { background: #fff; border: 1.2px solid var(--azul); border-radius: 2.5mm; min-height: 27mm; padding: 3mm;
  display: flex; flex-direction: column; justify-content: space-between; font-weight: 700; font-size: 11pt; line-height: 1.3; }
.carta .n { font-family: 'JetBrains Mono', Consolas, monospace; font-size: 7.5pt; color: var(--muted); font-weight: 400; }
.etiquetas { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5mm; margin-top: 2mm; }
.etiqueta { background: #fff9e6; border: 1px dashed var(--muted); border-radius: 2mm; padding: 2mm; font-size: 8.5pt; color: var(--muted); }
.quadro { display: grid; grid-template-columns: repeat(5, 1fr) 1fr; gap: 2mm; margin: 2mm 0 3mm; }
.raia { background: #fff; border: 1px solid var(--linha); border-radius: 2mm; min-height: 30mm; padding: 2mm; font-size: 8.5pt; }
.raia .t { display: inline-block; margin-bottom: 1.5mm; }
.raia.canto { background: var(--tint); border-style: dashed; }
.rodadas { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
.rodada { position: relative; }
.rodada .num, .num { display: inline-flex; align-items: center; justify-content: center; width: 7mm; height: 7mm; border-radius: 50%;
  background: var(--laranja); color: var(--tinta); font-weight: 800; font-size: 10pt; flex: none; }
.rodada .num { position: absolute; left: 2mm; top: 2mm; }
.rodada .fig { margin: 0; padding: 1mm 2mm 0 9mm; }
.situacoes { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
.situacao { display: flex; gap: 3mm; background: #fff; border: 1px solid var(--linha); border-radius: 2.5mm; padding: 3mm; font-size: 10pt; }
.eventos { counter-reset: ev; list-style: none; padding: 0; }
.eventos li { display: flex; gap: 3mm; align-items: flex-start; margin-bottom: 1.8mm; }
.eventos li .num { background: var(--azul); color: #fff; width: 6mm; height: 6mm; font-size: 9pt; }
.pecas { display: flex; gap: 4mm; align-items: center; flex-wrap: wrap; background: #fff; border: 1px solid var(--linha); border-radius: 3mm; padding: 3mm 4mm; }
.peca-trilho { width: 22mm; height: 2.2mm; border-radius: 1mm; }
.peca-estacao { width: 6mm; height: 6mm; border-radius: 50%; background: #fff; border: 1.6mm solid var(--azul); box-sizing: border-box; }
.peca-placa { background: var(--laranja); font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 8pt; padding: .8mm 2mm; border-radius: 1mm; }
/* cartilha */
.compacta { font-size: 9.2pt; line-height: 1.38; }
.compacta h1 { font-size: 17pt; margin-bottom: 1mm; }
.compacta h2 { margin: 2.6mm 0 1.2mm; font-size: 11.5pt; }
.compacta table { font-size: 8.6pt; margin: 1mm 0 1mm; }
.compacta td, .compacta th { padding: 1mm 2mm; }
.compacta .fig { padding: 1mm 2mm; margin: 0 0 1mm; }
.merges { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2mm; }
.merge { background: #fff; border: 1px solid var(--linha); border-radius: 2.5mm; padding: 1.6mm 2mm; font-size: 8pt; line-height: 1.3; }
.merge b { color: var(--azul); font-size: 9pt; display: block; }
.merge .fig { border: 0; padding: 0; margin: .5mm 0 0; }
.versao { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5mm; }
.versao div { border-radius: 2mm; padding: 1.4mm 2mm; font-size: 8.2pt; }
.versao .n { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 12pt; display: block; }
.levar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5mm; }
.levar div { background: #fff; border: 1px solid var(--linha); border-radius: 2.5mm; padding: 2mm 3mm; font-size: 8.8pt; }
.levar span { font-weight: 900; color: var(--laranja); font-size: 15pt; line-height: 1; display: block; margin-bottom: .8mm; }
.compacta .malha { width: 118mm; margin: 0 auto 1mm; }
.duas { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; }
"""


def pagina(conteudo, rotulo, rodape_esq):
    return f"""<section class="pagina">
  <div class="topo"><img src="file://{MARCA}/vic-logo-horizontal.png" alt="VIC — Versionamento e Integração de Código"><span class="rotulo">{e(rotulo)}</span></div>
  {conteudo}
  <div class="rodape"><span>{e(rodape_esq)}</span><span class="mono">versionamento e integração de código</span></div>
</section>"""


def doc(titulo, paginas):
    return f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{e(titulo)}</title><style>{CSS}</style></head>
<body>{''.join(paginas)}</body></html>"""


def t(nome):
    classe = {'main': 'main', 'develop': 'develop'}.get(nome, nome.split('/')[0])
    return f'<span class="t t-{classe}">{e(nome)}</span>'


# ── dados (os mesmos dos slides e do roteiro) ──────────────────────────────
CARTAS_D1 = [
    ('Os clientes vão poder simular um empréstimo no app', 'feature/*', 'develop → develop', 'é novidade: uma obra'),
    ('Desde ontem, o app em produção cobra a tarifa em dobro', 'hotfix/*', 'main → main e develop', 'emergência no que o cliente já usa'),
    ('A versão 2.4 vai para a homologação; daqui em diante, só correção', 'release/*', 'develop → main e develop', 'a vistoria começou'),
    ('A versão que os clientes usam hoje', 'main', 'permanente', 'a linha em operação'),
    ('Onde se juntam as novidades prontas para a próxima versão', 'develop', 'permanente', 'a próxima composição'),
    ('Na homologação da 2.4, um texto da tela está errado', 'release/*', 'corrige na própria release', 'a vistoria só recebe correção'),
    ('Relatório novo que a diretoria pediu para o próximo trimestre', 'feature/*', 'develop → develop', 'é novidade, sem pressa de emergência'),
    ('Erro no cálculo de juros em produção: precisa sair hoje', 'hotfix/*', 'main → main e develop', 'não dá para esperar a próxima versão'),
    ('A 2.4 foi aprovada na homologação', 'release/*', 'vai para a main, com a placa, e volta para a develop', 'fim da vistoria, com merge back'),
    ('Duas equipes, duas novidades diferentes, ao mesmo tempo', 'feature/*', 'uma para cada equipe', 'cada obra no seu desvio'),
    ('A correção urgente de ontem também precisa estar na próxima versão', 'develop', 'merge back do hotfix', 'não é trilho novo: é a volta'),
    ('Alterar direto a versão em produção, sem revisão, porque é rapidinho', 'Não pode!', '—', 'a main é protegida: tudo passa pelo PR'),
]
assert len(CARTAS_D1) == 12

RODADAS_D2 = [('merge-squash', 'Squash', 'F1 e F2 viraram uma estação só'), ('merge-ff', 'Fast-forward', 'linha reta e sem C: a linha não tinha andado'),
              ('merge-rebase', 'Rebase', 'F1′ e F2′, estações novas saindo de C'), ('merge-commit', 'Merge commit', 'a estação de junção M')]
SITUACOES_D2 = [
    ('Quero que o histórico mostre quando a cláusula de multa entrou e todas as versões dela até ficar pronta.', 'Merge commit', 'guarda o desvio e a junção'),
    ('Meu desvio tem 14 estações chamadas "ajuste", "ajuste 2" e "agora vai". Quero que entre só o resultado.', 'Squash', 'passa a limpo'),
    ('A develop andou muito desde que comecei. Antes de pedir a aprovação, quero refazer o meu trabalho em cima da versão mais recente.', 'Rebase', 'reassenta o próprio desvio; merge commit da develop para o desvio também resolve, e é o certo se o desvio é compartilhado'),
    ('Ninguém mexeu na develop desde que comecei. Quero juntar sem criar estação nova.', 'Fast-forward', 'a linha não andou'),
]
EVENTOS_D3 = [
    'A equipe A começa a assinatura digital.',
    'A equipe B começa o alerta de vencimento.',
    'A assinatura digital fica pronta; o PR é aprovado e o Integrador conclui o merge.',
    'A versão 2.4.0 vai para homologação, com a assinatura digital. O alerta ainda não está pronto.',
    'Na homologação, aparece um erro de texto na tela de assinatura; é corrigido.',
    'A homologação aprova: a versão entra em produção (build 118).',
    'No dia seguinte, a multa por atraso sai calculada errada em produção. A correção sai no mesmo dia (build 121).',
    'O alerta de vencimento fica pronto e entra para a próxima versão.',
]
PERGUNTAS_D3 = [
    ('Que trilhos temporários existiram, e com que nome?', f'{t("feature/assinatura")} {t("feature/alerta")} {t("release/2.4.0")} {t("hotfix/2.4.1")}'),
    ('Que placas a main recebeu?', '<span class="mono">v2.4.0.118</span> (evento 6) e <span class="mono">v2.4.1.121</span> (evento 7)'),
    ('Em que versão o alerta de vencimento chega aos clientes?', 'Na 2.5.0, a próxima release: MINOR, porque é novidade que não muda o que já existia'),
    ('O que aconteceria sem o merge back do evento 7?', 'A 2.5.0 sairia da develop sem a correção e voltaria a calcular a multa errada'),
    ('Que tipo de merge você usaria no evento 3?', 'Aberta. No GitFlow original, merge commit; squash, se o desvio tiver muitas paradas pequenas. A política do repositório decide'),
]

# ── material das dinâmicas ─────────────────────────────────────────────────
M = 'Material das dinâmicas'
RM = 'Nos trilhos do GitFlow · material das dinâmicas'
mat = []
raias = ''.join(f'<div class="raia">{t(n)}<br>{e(d)}</div>' for n, d in [
    ('main', 'a linha em operação'), ('develop', 'a próxima composição'), ('feature/*', 'o desvio de obra'),
    ('release/*', 'o pátio de vistoria'), ('hotfix/*', 'o desvio de emergência')])
mat.append(pagina(f"""
  <h1>Material das dinâmicas</h1>
  <p class="lead">Oficina <b>Nos trilhos do GitFlow</b> — branches, merges e o Modelo VIC. Tudo o que o facilitador precisa para montar o quadro colaborativo e conduzir as três dinâmicas.</p>
  <h2>O que tem aqui</h2>
  <ol>
    <li><b>Como montar o quadro</b> — os frames de cada grupo.</li>
    <li><b>Dinâmica 1 — Qual trilho?</b>: as 12 cartas, as etiquetas e o gabarito.</li>
    <li><b>Dinâmica 2 — Qual foi o merge?</b>: as oito rodadas e o gabarito.</li>
    <li><b>Dinâmica 3 — A viagem do Contratos Online</b>: os eventos, as peças e o gabarito.</li>
  </ol>
  <h2>Como montar o quadro</h2>
  <p>Use o Whiteboard do Teams, o Miro ou o Mural. Crie <b>um frame por grupo</b> para a Dinâmica 1 e outro para a Dinâmica 3, com o mesmo nome das salas simultâneas (Grupo 1, Grupo 2…).</p>
  <h3>Frame da Dinâmica 1</h3>
  <div class="quadro">{raias}<div class="raia canto"><span class="t t-nao">Não pode!</span><br>o que o Modelo VIC não permite</div></div>
  <p>Embaixo das raias, espalhe as 12 cartas misturadas, na ordem da página 2, e uma pilha de etiquetas "sai de / vai para" em branco.</p>
  <div class="caixa"><b>Importante:</b> faça todas as cartas na <b>mesma cor</b>, branca. Se a carta tiver a cor do trilho, o quadro entrega a resposta.</div>
  <h3>Frame da Dinâmica 3</h3>
  <p>À esquerda, os oito eventos da página 6. À direita, uma área livre com duas linhas já desenhadas, a {t('main')} em cima e a {t('develop')} embaixo, e um estoque de peças para copiar: trilhos das cinco cores, estações e placas.</p>
  <h3>Dinâmica 2</h3>
  <p>Não precisa de frame: as rodadas estão nos slides 27 e 28. Uma enquete com as quatro opções (Fast-forward, Merge commit, Squash e Rebase) serve para as oito rodadas.</p>
""", M, RM))

cartas = ''.join(f'<div class="carta"><span>{e(c)}</span><span class="n">{i:02d}</span></div>' for i, (c, *_) in enumerate(CARTAS_D1, 1))
etiquetas = ''.join('<div class="etiqueta">sai de: ________<br>vai para: ________</div>' for _ in range(8))
mat.append(pagina(f"""
  <span class="carimbo">DINÂMICA 1 · 20 MIN</span>
  <h1>Qual trilho?</h1>
  <p class="lead">Arraste cada carta para o trilho onde a situação acontece, ou para o canto "Não pode!". Depois, cole em cada carta uma etiqueta: de onde o trilho sai e para onde vai.</p>
  <p class="muted">12 minutos nas salas · 8 minutos de conversa na volta</p>
  <div class="cartas">{cartas}</div>
  <h3>Etiquetas para copiar</h3>
  <div class="etiquetas">{etiquetas}</div>
""", 'Dinâmica 1 · cartas', RM))

NAO_PODE = '<span class="t t-nao">Não pode!</span>'
linhas_d1 = ''.join(
    f'<tr><td class="mono">{i:02d}</td><td>{e(c)}</td><td>{t(r) if r != "Não pode!" else NAO_PODE}</td><td>{e(rota)}</td><td>{e(p)}</td></tr>'
    for i, (c, r, rota, p) in enumerate(CARTAS_D1, 1))
mat.append(pagina(f"""
  <span class="carimbo">DINÂMICA 1 · GABARITO</span>
  <h1>As respostas</h1>
  <table>
    <tr><th style="width:5%">#</th><th style="width:36%">Carta</th><th style="width:14%">Trilho</th><th style="width:22%">Sai de → vai para</th><th>Por quê</th></tr>
    {linhas_d1}
  </table>
  <h3>Para a conversa na volta</h3>
  <ul>
    <li><b>Carta 06:</b> por que não abre uma feature? A vistoria já começou: correção entra na própria release.</li>
    <li><b>Carta 11:</b> que trilho é esse? Nenhum novo: é o merge back do hotfix para a develop (Diretriz 5).</li>
    <li><b>Carta 12:</b> por que não pode? A main é protegida: push direto é bloqueado e tudo passa pelo pull request (Diretrizes 7 e 8).</li>
  </ul>
""", 'Dinâmica 1 · gabarito', RM))

rodadas = ''.join(f'<div class="rodada"><span class="num">{i}</span>{fig(n)}</div>' for i, (n, *_) in enumerate(RODADAS_D2, 1))
situacoes = ''.join(f'<div class="situacao"><span class="num">{i}</span><span>{e(s)}</span></div>' for i, (s, *_) in enumerate(SITUACOES_D2, 5))
mat.append(pagina(f"""
  <span class="carimbo">DINÂMICA 2 · 15 MIN</span>
  <h1>Qual foi o merge?</h1>
  <p class="lead">Uma rodada por vez. A turma vota na enquete; depois, 30 segundos de conversa.</p>
  <p><b>Opções da enquete:</b> Fast-forward · Merge commit · Squash · Rebase</p>
  <h2>Os dois "antes"</h2>
  <div class="duas">{fig('merge-antes-ff')}{fig('merge-antes')}</div>
  <h2>Rodadas 1 a 4: qual merge produziu cada "depois"?</h2>
  <div class="rodadas">{rodadas}</div>
  <h2>Rodadas 5 a 8: qual você escolheria?</h2>
  <div class="situacoes">{situacoes}</div>
""", 'Dinâmica 2 · rodadas', RM))

linhas_d2 = ''.join(f'<tr><td class="mono">{i}</td><td>desenho {i}</td><td><b>{e(r)}</b></td><td>{e(p)}</td></tr>' for i, (_, r, p) in enumerate(RODADAS_D2, 1))
linhas_d2 += ''.join(f'<tr><td class="mono">{i}</td><td>{e(s)}</td><td><b>{e(r)}</b></td><td>{e(p)}</td></tr>' for i, (s, r, p) in enumerate(SITUACOES_D2, 5))
mat.append(pagina(f"""
  <span class="carimbo">DINÂMICA 2 · GABARITO</span>
  <h1>As respostas</h1>
  <table>
    <tr><th style="width:5%">#</th><th style="width:44%">Rodada</th><th style="width:16%">Resposta</th><th>Por quê</th></tr>
    {linhas_d2}
  </table>
  <div class="caixa"><b>O que observar:</b> a rodada 2 é a pegadinha. O desenho não tem C porque partiu do "antes" em que a linha não andou; se alguém notar, elogie. Na rodada 7, reforce: rebase só no próprio desvio, nunca num trilho que outras pessoas usam.</div>
  <h2>Os quatro merges, lado a lado</h2>
  <table>
    <tr><th style="width:17%">Tipo</th><th style="width:27%">O histórico mostra</th><th style="width:27%">No contrato</th><th>Cuidado</th></tr>
    <tr><td><b>Fast-forward</b></td><td>linha reta, sem desvio</td><td>a cópia vira a minuta</td><td>só quando a linha não andou</td></tr>
    <tr><td><b>Merge commit</b></td><td>tudo, com a estação de junção</td><td>a cláusula com todas as versões</td><td>mapa trançado</td></tr>
    <tr><td><b>Squash</b></td><td>uma estação por entrega</td><td>passar a limpo</td><td>perde o passo a passo</td></tr>
    <tr><td><b>Rebase</b></td><td>linha reta, com estações novas</td><td>refazer sobre a minuta atual</td><td>reescreve a história</td></tr>
  </table>
""", 'Dinâmica 2 · gabarito', RM))

eventos = ''.join(f'<li><span class="num">{i}</span><span>{e(ev)}</span></li>' for i, ev in enumerate(EVENTOS_D3, 1))
perguntas = ''.join(f'<li>{e(p)}</li>' for p, _ in PERGUNTAS_D3)
pecas = ''.join(f'<span class="peca-trilho" style="background:var(--{c})"></span>' for c in ['escuro', 'azul', 'teal', 'laranja', 'vermelho'])
mat.append(pagina(f"""
  <span class="carimbo">DINÂMICA 3 · 25 MIN</span>
  <h1>A viagem do Contratos Online</h1>
  <p class="lead">O <b>Contratos Online</b> é um sistema fictício. Em produção está a versão <span class="mono">v2.3.0.97</span>. Desenhem a malha no quadro, na ordem dos eventos, e numerem cada estação com o número do evento.</p>
  <p class="muted">15 minutos nas salas · 10 minutos de conversa na volta</p>
  <h2>Os eventos</h2>
  <ul class="eventos">{eventos}</ul>
  <h2>Respondam também</h2>
  <ol>{perguntas}</ol>
  <h2>As peças</h2>
  <div class="pecas">{pecas}<span class="peca-estacao"></span><span class="peca-placa">v_._._._</span>
    <span class="muted" style="font-size:8.5pt">trilhos: main · develop · feature · release · hotfix — estação — placa (só na main)</span></div>
  <div class="caixa"><b>Antes de apresentar, confiram:</b> cada trilho temporário saiu do lugar certo? A release e o hotfix voltaram para os dois destinos? As placas estão só na main?</div>
""", 'Dinâmica 3 · eventos', RM))

respostas = ''.join(f'<tr><td>{e(p)}</td><td>{r}</td></tr>' for p, r in PERGUNTAS_D3)
mat.append(pagina(f"""
  <span class="carimbo">DINÂMICA 3 · GABARITO</span>
  <h1>A malha do Contratos Online</h1>
  {fig('gabarito-d3')}
  <table>
    <tr><th style="width:42%">Pergunta</th><th>Resposta</th></tr>
    {respostas}
  </table>
  <h2>Erros mais comuns</h2>
  <ul>
    <li><b>O hotfix saindo da develop:</b> emergência sai da main, que é onde está o que o cliente usa.</li>
    <li><b>O alerta entrando na release/2.4.0:</b> a vistoria já tinha começado; o alerta espera a próxima.</li>
    <li><b>Um destino esquecido:</b> a release e o hotfix voltam para a main e para a develop.</li>
    <li><b>Placa na develop:</b> placa de versão só na main.</li>
  </ul>
""", 'Dinâmica 3 · gabarito', RM))

(SAIDA / 'material-das-dinamicas.html').write_text(doc('Material das dinâmicas — Nos trilhos do GitFlow', mat), encoding='utf8')

# ── cartilha de bolso (1 página) ───────────────────────────────────────────
merges = ''.join(f'<div class="merge"><b>{n}</b>{d}{fig(f, "fig")}</div>' for n, d, f in [
    ('Fast-forward', 'a linha não andou: só seguir em frente', 'merge-ff'),
    ('Merge commit', 'o entroncamento com placa: guarda o desvio', 'merge-commit'),
    ('Squash', 'junta os vagões: uma estação por entrega', 'merge-squash'),
    ('Rebase', 'reassenta o desvio: estações novas', 'merge-rebase'),
])
cartilha = pagina(f"""
<div class="compacta">
  <h1>Nos trilhos do GitFlow, numa página</h1>
  <p style="margin-bottom:0">A <b>ferrovia</b> mostra o como; o <b>contrato</b> explica o porquê. Cada <b>commit</b> é uma estação (uma versão rubricada); cada <b>branch</b>, um trilho (uma cópia de trabalho); cada <b>merge</b>, um entroncamento.</p>
  <h2>Os cinco trilhos</h2>
  {fig('malha', 'fig malha')}
  <table>
    <tr><th style="width:15%">Trilho</th><th style="width:25%">Na ferrovia</th><th style="width:31%">No contrato</th><th>Sai de → vai para</th></tr>
    <tr><td>{t('main')}</td><td>a linha em operação</td><td>o contrato assinado, em vigor</td><td>permanente e protegida</td></tr>
    <tr><td>{t('develop')}</td><td>a próxima composição</td><td>a minuta consolidada</td><td>permanente e protegida</td></tr>
    <tr><td>{t('feature/*')}</td><td>o desvio de obra</td><td>a cláusula em redação</td><td>develop → develop</td></tr>
    <tr><td>{t('release/*')}</td><td>o pátio de vistoria</td><td>a versão para assinatura</td><td>develop → main e develop</td></tr>
    <tr><td>{t('hotfix/*')}</td><td>o desvio de emergência</td><td>o aditivo urgente</td><td>main → main e develop</td></tr>
  </table>
  <h2>Os quatro merges: o conteúdo é o mesmo, muda a história que fica</h2>
  <div class="merges">{merges}</div>
  <p style="margin:1.4mm 0 0"><b>Conflito</b> são dois trens no mesmo trecho: os dois lados mudaram o mesmo ponto, e uma pessoa decide. Muitas vezes, a decisão é de negócio.</p>
  <h2>O número da versão · v2.4.1.121</h2>
  <div class="versao">
    <div style="background:var(--escuro);color:#fff"><span class="n">2 · MAJOR</span>muda o que já valia</div>
    <div style="background:var(--azul);color:#fff"><span class="n">4 · MINOR</span>novidade</div>
    <div style="background:var(--teal)"><span class="n">1 · PATCH</span>correção</div>
    <div style="background:var(--laranja)"><span class="n">121 · BUILD</span>a montagem que foi para produção</div>
  </div>
  <h2>Perguntas para fazer ao time</h2>
  <p style="margin:0">Já está na main ou só na develop? · Entra nesta release ou na próxima? · É hotfix ou pode esperar? · Qual é a placa da versão em produção? · Fizeram o merge back? · Há quanto tempo esse desvio está aberto?</p>
  <h2>Para levar</h2>
  <div class="levar">
    <div><span>1</span>Cada trem no seu trilho: a main é o que vale, a develop é o que vem, os desvios são temporários.</div>
    <div><span>2</span>Juntar é escolher a história: fast-forward, merge commit, squash ou rebase.</div>
    <div><span>3</span>Tudo o que chega à main volta para a develop: sem merge back, a correção se perde.</div>
  </div>
</div>
""", 'Cartilha de bolso', 'Nos trilhos do GitFlow · cartilha de bolso')
(SAIDA / 'cartilha-de-bolso.html').write_text(doc('Cartilha de bolso — Nos trilhos do GitFlow', [cartilha]), encoding='utf8')
print('ok')

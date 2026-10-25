# Oficina "Nos trilhos do GitFlow"

Oficina de 3 horas, remota (Teams), para quem nunca escreveu uma linha de código: a pessoa de negócio que acompanha entregas e ouve falar de branch, merge e release. Explica o GitFlow, os quatro tipos de merge (fast-forward, merge commit, squash e rebase), o conflito e as regras do Modelo VIC que tocam o fluxo, com duas analogias do dia a dia: a **ferrovia**, para ver o fluxo, e o **contrato com suas minutas**, para entender por que ele existe.

## As peças

| Arquivo | O que é |
|---|---|
| `1-slides-nos-trilhos.pptx` | 39 slides, com notas do apresentador |
| `2-roteiro-do-facilitador.docx` | as duas analogias lado a lado, preparação no Teams, cronograma, o que dizer em cada slide, condução das dinâmicas, perguntas frequentes e glossário |
| `3-material-das-dinamicas.pdf` | como montar o quadro colaborativo, as cartas, as rodadas e os gabaritos das três dinâmicas |
| `4-cartilha-de-bolso.pdf` | uma página para os participantes levarem |

As peças seguem a identidade do Modelo VIC ([`marca-vic.html`](../../prototypes/versionamento-codigo/marca-vic.html)) e usam a logomarca de [`assets/brand/`](../../prototypes/versionamento-codigo/assets/brand/). As cores dos trilhos são as das ilustrações das diretrizes: `main` azul-escuro, `develop` azul, `feature/*` turquesa, `release/*` laranja e `hotfix/*` vermelho. Os slides e o roteiro usam Segoe UI e Consolas, que estão em qualquer Windows; os PDFs e as figuras embutem a Roboto e a JetBrains Mono, que estão nas pilhas de fontes do modelo.

## Regenerar

O conteúdo vive nos geradores, em `gerador/`: `figuras.js` (os desenhos da ferrovia), `gera-slides.js` (slides), `gera-roteiro.js` (roteiro) e `gera-pdfs.py` (material das dinâmicas e cartilha). Para mudar um texto ou um desenho, edite o gerador e gere de novo; editar o arquivo de saída à mão se perde na geração seguinte.

Precisa de Node 20 ou mais novo, Python 3, o Chromium do Playwright (`npx playwright install chromium`) e acesso ao Google Fonts, de onde as figuras e os PDFs carregam as fontes.

```bash
cd treinamento/oficina-nos-trilhos/gerador
npm ci
npm run gera
```

O `npm run gera` desenha as figuras em `gerador/saida/figuras/` e grava as quatro peças nesta pasta. A geração falha se uma fonte não carregar, porque a peça sairia com a fonte de reserva, e os PDFs falham também se alguma página passar do A4. Com um Chromium já instalado, aponte para ele: `CHROMIUM=/caminho/do/chrome npm run gera`.

## Quando o modelo mudar

As peças ensinam o GitFlow como as diretrizes do Modelo VIC o descrevem. Revise-as quando mudar algum destes pontos: as branches e a tabela de origem e destino (Diretriz 2), o merge back (Diretriz 5), o pull request e o papel do Integrador (Diretrizes 6 a 8), o SemVer e o Padrão VEC (Diretrizes 9 e 10), a nomenclatura (Diretriz 11), a nota de versão (Diretriz 13) e os limites da faixa 3 de divergência (Diretriz 4), que o slide 33 cita. O slide 25 cita os nomes dos botões de merge do GitHub e do Azure DevOps; confira-os se as plataformas mudarem. O sistema Contratos Online e as versões das dinâmicas são didáticos.

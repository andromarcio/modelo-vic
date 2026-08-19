#!/usr/bin/env node
/* Juiz de requisitos — validação NEGOCIAL de artefatos N3 (PoC).
 *
 * Cascata em três estágios:
 *   A) heurísticas determinísticas (zero tokens) — geram suspeitas;
 *   B) triagem com claude-haiku-4-5 — julga o artefato contra as rubricas;
 *   C) escalação com claude-opus-5 — confirma/refuta achados "bloqueia"
 *      ou de confiança baixa.
 *
 * Uso:
 *   node scripts/juiz/juiz-requisitos.mjs [--sem-ia] [--saida arq.md] arq1.md [arq2.md ...]
 *
 * Sai com código 1 se houver achado confirmado com severidade "bloqueia".
 * Requer ANTHROPIC_API_KEY (exceto com --sem-ia).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RUBRICAS = fs.readFileSync(path.join(AQUI, "rubricas.md"), "utf8");

const MODELO_TRIAGEM = "claude-haiku-4-5";
const MODELO_ESCALACAO = "claude-opus-5";
// USD por milhão de tokens (entrada, saída) — manter alinhado à tabela de preços
const PRECO = {
  [MODELO_TRIAGEM]: { in: 1.0, out: 5.0 },
  [MODELO_ESCALACAO]: { in: 5.0, out: 25.0 },
};
const LIMIAR_CONFIANCA = 0.7;

/* ---------- Estágio A · heurísticas (zero tokens) ---------- */

function heuristicas(texto) {
  const suspeitas = [];
  const secao = (titulo) => {
    const m = texto.match(new RegExp(`^## ${titulo}\\s*$([\\s\\S]*?)(?=^## |\\Z)`, "m"));
    return m ? m[1] : "";
  };
  const regras = secao("Regras de negócio");
  for (const [re, defeito] of [
    [/bot[ãa]o|clica|toast|desabilita|habilita|foco|m[áa]scara/i, "comportamento_de_tela"],
    [/exibe (a )?mensagem|aviso em|em vermelho/i, "mensagem_embutida"],
    [/simples|intuitiv|amig[áa]vel|f[áa]cil de usar/i, "desejo"],
    [/segundos|desempenho|performance|disponibilidade/i, "nfr_disfarçada"],
    [/o sistema deve (contar|verificar|ocultar|bloquear|impedir que)/i, "instrucao_disfarçada"],
  ]) {
    if (re.test(regras)) suspeitas.push({ rubrica: "R1", defeito, onde: "Regras de negócio" });
  }
  const cenarios = secao("Cenários");
  for (const bloco of cenarios.split(/(?=Scenario:)/).slice(1)) {
    const nome = bloco.match(/Scenario:\s*(.+)/)?.[1]?.trim() ?? "?";
    const whens = (bloco.match(/^\s*When /gm) || []).length;
    if (whens > 1) suspeitas.push({ rubrica: "R2", defeito: "multiplo", onde: `Cenário "${nome}"` });
    const temValor = /"[^"]+"|\d/.test(bloco);
    const importaCanonico = /# ← FIELD-DICTIONARY/.test(cenarios);
    if (!temValor && !importaCanonico)
      suspeitas.push({ rubrica: "R2", defeito: "generico", onde: `Cenário "${nome}"` });
  }
  if (/\|\s*—\s*⚠️?\s*\|/.test(secao("Origem")))
    suspeitas.push({ rubrica: "R4", defeito: "sem_origem", onde: "Origem" });
  return suspeitas;
}

/* ---------- Estágios B e C · LLM ---------- */

const SCHEMA_ACHADOS = {
  type: "json_schema",
  schema: {
    type: "object",
    properties: {
      achados: {
        type: "array",
        items: {
          type: "object",
          properties: {
            rubrica: { type: "string", enum: ["R1", "R2", "R3", "R4", "R5"] },
            defeito: { type: "string" },
            onde: { type: "string" },
            severidade: { type: "string", enum: ["bloqueia", "avisa"] },
            confianca: { type: "number" },
            explicacao: { type: "string" },
            sugestao: { type: "string" },
          },
          required: ["rubrica", "defeito", "onde", "severidade", "confianca", "explicacao", "sugestao"],
          additionalProperties: false,
        },
      },
    },
    required: ["achados"],
    additionalProperties: false,
  },
};

const custo = { entrada: {}, saida: {} };
function contabiliza(modelo, usage) {
  custo.entrada[modelo] = (custo.entrada[modelo] || 0) + usage.input_tokens +
    (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0);
  custo.saida[modelo] = (custo.saida[modelo] || 0) + usage.output_tokens;
}
function custoUSD() {
  let total = 0;
  for (const m of Object.keys(PRECO)) {
    total += ((custo.entrada[m] || 0) * PRECO[m].in + (custo.saida[m] || 0) * PRECO[m].out) / 1e6;
  }
  return total;
}

function sistema() {
  return [{ type: "text", text: RUBRICAS, cache_control: { type: "ephemeral" } }];
}

async function julgar(client, arquivo, texto, suspeitas) {
  const dica = suspeitas.length
    ? `\n\nHeurísticas automáticas levantaram estas suspeitas (verifique-as, mas não se limite a elas):\n${JSON.stringify(suspeitas)}`
    : "";
  const resp = await client.messages.create({
    model: MODELO_TRIAGEM,
    max_tokens: 4000,
    system: sistema(),
    messages: [{
      role: "user",
      content: `Julgue o artefato N3 abaixo (arquivo ${arquivo}) contra as rubricas R1–R5. Liste só defeitos reais.${dica}\n\n<artefato>\n${texto}\n</artefato>`,
    }],
    output_config: { format: SCHEMA_ACHADOS },
  });
  contabiliza(MODELO_TRIAGEM, resp.usage);
  const bloco = resp.content.find((b) => b.type === "text");
  return JSON.parse(bloco.text).achados;
}

async function escalar(client, arquivo, texto, achados) {
  const resp = await client.messages.create({
    model: MODELO_ESCALACAO,
    max_tokens: 8000,
    system: sistema(),
    messages: [{
      role: "user",
      content: `Um modelo de triagem apontou os achados abaixo no artefato N3 (arquivo ${arquivo}). Reavalie cada um contra as rubricas: mantenha só os defensáveis (pode ajustar severidade, explicação e sugestão) e descarte falsos positivos. Responda com a lista final.\n\n<achados_triagem>\n${JSON.stringify(achados, null, 2)}\n</achados_triagem>\n\n<artefato>\n${texto}\n</artefato>`,
    }],
    output_config: { format: SCHEMA_ACHADOS },
  });
  contabiliza(MODELO_ESCALACAO, resp.usage);
  const bloco = resp.content.find((b) => b.type === "text");
  return JSON.parse(bloco.text).achados;
}

/* ---------- Relatório ---------- */

function relatorio(porArquivo, semIA) {
  const linhas = ["## ⚖️ Juiz de requisitos — validação negocial", ""];
  let bloqueios = 0;
  for (const { arquivo, achados, suspeitas } of porArquivo) {
    linhas.push(`### \`${arquivo}\``, "");
    const lista = semIA
      ? suspeitas.map((s) => ({ ...s, severidade: "avisa", confianca: 0,
          explicacao: "suspeita heurística (rode com IA para julgamento)", sugestao: "" }))
      : achados;
    if (!lista.length) { linhas.push("Nenhum achado. ✅", ""); continue; }
    for (const a of lista) {
      if (a.severidade === "bloqueia") bloqueios++;
      const icone = a.severidade === "bloqueia" ? "🛑" : "⚠️";
      linhas.push(`- ${icone} **${a.onde}** — \`${a.rubrica}·${a.defeito}\`` +
        (a.confianca ? ` (confiança ${a.confianca.toFixed(2)})` : ""));
      if (a.explicacao) linhas.push(`  ${a.explicacao}`);
      if (a.sugestao) linhas.push(`  **Sugestão:** ${a.sugestao}`);
    }
    linhas.push("");
  }
  if (!semIA) {
    const fmt = (o) => Object.entries(o).map(([m, t]) => `${m}: ${t}`).join(" · ");
    linhas.push("---",
      `*Custo desta execução: US$ ${custoUSD().toFixed(4)} — tokens de entrada (${fmt(custo.entrada)}), saída (${fmt(custo.saida)}).*`);
  } else {
    linhas.push("---", "*Execução sem IA (apenas heurísticas determinísticas — custo zero).*");
  }
  return { texto: linhas.join("\n"), bloqueios };
}

/* ---------- Main ---------- */

const args = process.argv.slice(2);
const semIA = args.includes("--sem-ia");
const iSaida = args.indexOf("--saida");
const saida = iSaida >= 0 ? args[iSaida + 1] : null;
const arquivos = args.filter((a, i) => !a.startsWith("--") && i !== iSaida + 1);
if (!arquivos.length) {
  console.error("uso: juiz-requisitos.mjs [--sem-ia] [--saida arq.md] artefato.md ...");
  process.exit(2);
}

let client = null;
if (!semIA) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  client = new Anthropic();
}

const porArquivo = [];
for (const arquivo of arquivos) {
  const texto = fs.readFileSync(arquivo, "utf8");
  const suspeitas = heuristicas(texto);
  let achados = [];
  if (!semIA) {
    achados = await julgar(client, arquivo, texto, suspeitas);
    const escalaveis = achados.filter(
      (a) => a.severidade === "bloqueia" || a.confianca < LIMIAR_CONFIANCA);
    if (escalaveis.length) {
      const confirmados = await escalar(client, arquivo, texto, escalaveis);
      achados = [...achados.filter((a) => !escalaveis.includes(a)), ...confirmados];
    }
  }
  porArquivo.push({ arquivo, suspeitas, achados });
}

const { texto, bloqueios } = relatorio(porArquivo, semIA);
if (saida) fs.writeFileSync(saida, texto);
else console.log(texto);
if (saida) console.log(`relatório em ${saida} — ${bloqueios} bloqueio(s)`);
process.exit(bloqueios > 0 && !semIA ? 1 : 0);

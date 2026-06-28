// Gera assets/tree.js: lista de arquivos .md (com conteúdo embutido para
// funcionar até em file://) e os protótipos HTML (apenas o caminho).
// Uso (a partir da raiz do repositório):  node assets/generate-tree.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');    // raiz do repositório
const OUT = path.join(__dirname, 'tree.js');    // assets/tree.js

const excludeDirs = new Set([
  '.git', '.github', '.claude', '.gemini', '.vscode', '.tsupgrader',
  'node_modules', 'venv', 'env', '__pycache__', 'build', 'dist', 'assets'
]);

const mdFiles = [];
const mdContents = {};

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // Pula diretórios excluídos ou iniciados com ponto (ex.: .github, .claude)
    if (entry.isDirectory()) {
      if (excludeDirs.has(entry.name) || entry.name.startsWith('.')) continue;
      walk(path.join(dir, entry.name));
    } else if (entry.isFile()) {
      const lower = entry.name.toLowerCase();
      const rel = path.relative(ROOT, path.join(dir, entry.name)).split(path.sep).join('/');
      if (lower.endsWith('.md')) {
        mdFiles.push(rel);
        try {
          mdContents[rel] = fs.readFileSync(path.join(dir, entry.name), 'utf8');
        } catch (e) {
          console.warn(`Aviso: não foi possível ler ${rel}: ${e}`);
          mdContents[rel] = `# Erro ao ler arquivo\n\nNão foi possível ler o conteúdo deste arquivo: ${e}`;
        }
      } else if (lower.endsWith('.html') && rel.startsWith('prototypes/')) {
        // Protótipos: apenas o caminho (carregados via iframe src), sem embutir conteúdo
        mdFiles.push(rel);
      }
    }
  }
}

walk(ROOT);
mdFiles.sort();

const js =
  '// Gerado automaticamente por assets/generate-tree.js. Não edite manualmente.\n' +
  `const repoFiles = ${JSON.stringify(mdFiles, null, 2)};\n\n` +
  `const repoFilesContent = ${JSON.stringify(mdContents, null, 2)};\n`;

fs.writeFileSync(OUT, js);
console.log(`Sucesso! Gerados ${mdFiles.length} arquivos em 'assets/tree.js' com conteúdo embutido.`);

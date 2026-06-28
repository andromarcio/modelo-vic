#!/usr/bin/env python3
# Gera assets/tree.js: lista de arquivos .md (com conteúdo embutido para
# funcionar até em file://) e os protótipos HTML (apenas o caminho).
# Uso (a partir da raiz do repositório):  python assets/generate-tree.py
import os
import json

HERE = os.path.dirname(os.path.abspath(__file__))   # assets/
ROOT = os.path.abspath(os.path.join(HERE, '..'))     # raiz do repositório
OUT = os.path.join(HERE, 'tree.js')                  # assets/tree.js


def generate_file_list():
    exclude_dirs = {
        '.git', '.github', '.claude', '.gemini', '.vscode', '.tsupgrader',
        'node_modules', 'venv', 'env', '__pycache__', 'build', 'dist', 'assets'
    }

    md_files = []
    md_contents = {}

    for root, dirs, files in os.walk(ROOT):
        # Não descer em diretórios excluídos ou iniciados com ponto (ex.: .github)
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]

        for file in files:
            lower = file.lower()
            # Caminho relativo à raiz, com barra normal / (compatível com web)
            rel_path = os.path.relpath(os.path.join(root, file), ROOT).replace('\\', '/')

            if lower.endswith('.md'):
                md_files.append(rel_path)
                try:
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as mf:
                        md_contents[rel_path] = mf.read()
                except Exception as e:
                    print(f"Aviso: não foi possível ler {rel_path}: {e}")
                    md_contents[rel_path] = f"# Erro ao ler arquivo\n\nNão foi possível ler o conteúdo deste arquivo: {e}"
            elif lower.endswith('.html') and rel_path.startswith('prototypes/'):
                # Protótipos: apenas o caminho (carregados via iframe), sem embutir conteúdo
                md_files.append(rel_path)

    md_files.sort()

    js_content = (
        "// Gerado automaticamente por assets/generate-tree.py. Não edite manualmente.\n"
        f"const repoFiles = {json.dumps(md_files, indent=2, ensure_ascii=False)};\n\n"
        f"const repoFilesContent = {json.dumps(md_contents, indent=2, ensure_ascii=False)};\n"
    )

    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"Sucesso! Gerados {len(md_files)} arquivos em 'assets/tree.js' com conteúdo embutido.")


if __name__ == '__main__':
    generate_file_list()

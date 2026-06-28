# Repositórios do sistema

| Repositório | URL | Responsabilidade | Stack | Responsável |
|---|---|---|---|---|
| [nome-docs] | [URL] | Documentação e especificações | Markdown | [nome] |
| [nome-backend] | [URL] | [responsabilidade] | [stack] | [nome] |
| [nome-frontend] | [URL] | [responsabilidade] | [stack] | [nome] |
| [nome-workers] | [URL] | [responsabilidade] | [stack] | [nome] |

---

## Como rodar cada repositório

| Repositório | Comando | Porta | Pré-requisitos |
|---|---|---|---|
| [nome-backend] | `[comando]` | [porta] | [ex: Node 20, PostgreSQL 15] |
| [nome-frontend] | `[comando]` | [porta] | [ex: Node 20] |
| [nome-workers] | `[comando]` | — | [ex: Redis] |

---

## Variáveis de ambiente

| Variável | Repositório(s) | Descrição | Exemplo |
|---|---|---|---|
| `[VARIAVEL]` | [repo] | [descrição] | `[exemplo]` |

---

## Relação entre repositórios

```
[nome-frontend]  ──→  [nome-backend]  ──→  [banco]
                            │
                            └──→  [nome-workers]  ──→  [fila/serviço]
```

---

## Padrão de branches

| Branch | Propósito | Merge via |
|---|---|---|
| `main` | Produção | PR aprovado |
| `develop` | Desenvolvimento | PR aprovado |
| `feature/[nome]` | Nova feature | PR para develop |
| `fix/[nome]` | Correção de bug | PR para develop |
| `hotfix/[nome]` | Correção urgente | PR para main e develop |

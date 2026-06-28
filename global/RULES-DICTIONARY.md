<!-- doc-template-engine: 1.0.0 | prompt: PROMPT_3A | atualizado: 2026-06-23 -->
# RULES-DICTIONARY.md
> Dicionário de regras de negócio canônicas do sistema.
> Regras listadas aqui se repetem em múltiplas features e têm
> comportamento definido e aprovado. Referencie em vez de repetir.
>
> Notação de referência no N3:
> `→ ver RULES-DICTIONARY: [nome da regra]`
>
> Para adicionar uma nova regra: abrir PR com a seção preenchida
> e aprovação de ao menos um dev e um PO antes do merge.

> ⚠️ **Esqueleto** — ficaram apenas algumas **regras genéricas de exemplo**.
> Preencha as demais conforme forem identificadas (uma regra entra aqui quando
> aparece em três ou mais features). Use o *Template para nova regra canônica* no rodapé.

---

## Quando usar este dicionário

Use RULES-DICTIONARY quando uma regra:
- É **funcional** — descreve um comportamento/invariante de negócio
  (requisitos não-funcionais vão no NFR.md), E
- Aparece em três ou mais features distintas, E
- Não é global do sistema (essas vão no MASTER.md), E
- Não é exclusiva de um domínio (essas vão no N1 como regra transversal)

Exemplos do que NÃO entra aqui:
- "Todo registro tem exclusão lógica (soft delete)" → MASTER.md (global)
- "O CPF é único entre clientes" → N1/N3 do domínio (regra de domínio)
- "Importação aceita apenas arquivos .csv" → N3 da feature (específica)
- "Resposta síncrona em até 500 ms" → NFR.md (não-funcional: desempenho)
- "Ações críticas ficam auditadas" → NFR.md (não-funcional: auditoria)

> **Regra de negócio × NFR**: regra de negócio é um *invariante de domínio*
> ("o CPF não pode repetir"); NFR é uma *qualidade do sistema* ("a resposta
> volta em 500 ms"). Se o requisito diz *quão bem* o sistema faz algo, é NFR.

---

## Índice de regras canônicas

| Regra | Categoria | Features onde aparece |
|---|---|---|
| [Arquivo com tamanho máximo](#arquivo-com-tamanho-máximo) | Upload | Importação de XML |
| [Registro não pode ser excluído se vinculado](#registro-não-pode-ser-excluído-se-vinculado) | Integridade | Exclusão de registros referenciados |

---

## Regras canônicas

---

### Arquivo com tamanho máximo

**Descrição**: Uploads de arquivo têm restrições de tamanho e tipo
que devem ser validadas antes do envio ao servidor.

**Onde se aplica**: qualquer feature que receba upload de arquivo
(ex.: importação de planilha .csv de clientes).

#### Como referenciar no N3
```markdown
## Regras de negócio
1. O arquivo deve respeitar os limites de tipo e tamanho.
   → ver RULES-DICTIONARY: Arquivo com tamanho máximo
   (tipos aceitos: .xml; tamanho máximo: 10 MB)
```

#### Parâmetros obrigatórios no N3
- **Tipos aceitos**: lista de extensões (ex: `.xml`, `.pdf`, `.csv`).
- **Tamanho máximo**: em MB.

#### Regras de negócio
1. Validar tipo e tamanho no cliente antes de iniciar o upload
   para evitar tráfego desnecessário.
2. Revalidar no servidor — nunca confiar apenas na validação do cliente.
3. Exibir o tamanho máximo permitido na área de upload, sem o usuário
   precisar tentar e falhar para descobrir.

#### Cenários Gherkin
```gherkin
# ── Arquivo com tamanho máximo ─────────────────────────────────

Scenario: Arquivo válido aceito
  Given que o arquivo tem extensão aceita e tamanho dentro do limite
  When o usuário faz o upload
  Then o arquivo é aceito e o processamento continua

Scenario: Extensão não aceita
  When o usuário tenta enviar um arquivo com extensão não permitida
  Then o sistema rejeita antes do upload
  And exibe: "Apenas arquivos [extensões aceitas] são aceitos."

Scenario: Arquivo acima do tamanho máximo
  When o usuário tenta enviar um arquivo maior que [N] MB
  Then o sistema rejeita antes do upload
  And exibe: "O arquivo não pode exceder [N] MB."
```

---

### Registro não pode ser excluído se vinculado

**Descrição**: Certos registros não podem ser excluídos enquanto
existirem outros registros que os referenciam ativamente.

**Onde se aplica**: exclusão de registros referenciados por outros
registros ativos.

#### Como referenciar no N3
```markdown
## Regras de negócio
3. O registro não pode ser excluído se ainda houver vínculos ativos.
   → ver RULES-DICTIONARY: Registro não pode ser excluído se vinculado
   (entidade vinculada: [entidade].[campo])
```

#### Parâmetro obrigatório no N3
O N3 deve declarar **qual entidade referencia o registro**
e o **comportamento alternativo** (bloquear completamente ou
oferecer opção de desvinculação em lote antes de excluir).

#### Cenários Gherkin
```gherkin
# ── Registro com vínculos ──────────────────────────────────────

Scenario: Exclusão de registro sem vínculos
  Given que o registro não está referenciado por nenhum outro registro ativo
  When o usuário confirma a exclusão
  Then o registro é excluído com sucesso

Scenario: Tentativa de excluir registro com vínculos ativos
  Given que o registro está referenciado por [N] registro(s) ativo(s)
  When o usuário tenta excluir
  Then o sistema bloqueia a exclusão
  And exibe: "Este registro está em uso por [N] [entidade(s)] e não pode ser excluído.
    Remova os vínculos antes de excluir."

Scenario: Exclusão com opção de desvincular em lote (se o N3 permitir)
  Given que o registro tem vínculos ativos
  When o usuário tenta excluir
  Then o sistema exibe um modal de confirmação com a opção:
    "Remover de todos os [N] [entidades] e excluir"
  And aguarda confirmação antes de prosseguir
```

---

## Template para nova regra canônica

```markdown
### [Nome da regra]

**Descrição**: [o que esta regra define — uma frase]

**Onde se aplica**: [lista de features]

#### Como referenciar no N3
[trecho de exemplo de como citar no N3]

#### Parâmetros obrigatórios no N3 (se houver)
[o que o N3 deve declarar que o dicionário não impõe]

#### Regras de negócio
1. [regra]

#### Cenários Gherkin
[cenários completos com grupos]

#### Mensagens de erro
| Situação | Mensagem |
|---|---|
| [situação] | "[mensagem]" |
```

---

## Instrução para a LLM

Ao identificar uma regra de negócio em um N3 que coincide com
uma regra deste dicionário:

1. No **Modo PO**: não faça perguntas sobre o comportamento da regra —
   ele já está definido. Pergunte apenas sobre os **parâmetros**
   que o dicionário deixa em aberto para o N3 declarar.

2. No **Modo DEV** (PROMPT 3B): ao gerar endpoints e serviços,
   implemente a regra conforme definida aqui. Não reescreva
   os cenários Gherkin — use o marcador:
   `# ← RULES-DICTIONARY: [nome da regra] (importar cenários)`

3. Na **geração do SDD**: ao mapear regras de negócio para métodos
   de service, referencie o dicionário:
   `// → RULES-DICTIONARY: [nome da regra]`

4. Na **revisão de consistência**: verificar se implementações da
   mesma regra canônica em features diferentes estão alinhadas
   com este dicionário.

#CLAUDE.md
## 1. Pense Antes de Codar

**Não assuma. Não esconda dúvidas. Torne os tradeoffs explícitos.**

Antes de implementar:
- Declare suas suposições explicitamente. Se estiver incerto, pergunte.
- Se houver múltiplas interpretações, apresente-as — não escolha silenciosamente.
- Se existir uma abordagem mais simples, diga isso. Questione quando necessário.
- Se algo não estiver claro, pare. Nomeie o que está confuso. Pergunte.

## 2. Simplicidade Primeiro

**O mínimo de código que resolve o problema. Nada especulativo.**

- Nenhuma funcionalidade além do que foi solicitado.
- Nenhuma abstração para código de uso único.
- Nenhuma “flexibilidade” ou “configurabilidade” que não foi pedida.
- Nenhum tratamento de erro para cenários impossíveis.
- Se você escreveu 200 linhas e poderia ser 50, reescreva.

Pergunte-se: “Um engenheiro sênior diria que isso está complicado demais?” Se sim, simplifique.

## 3. Mudanças Cirúrgicas

**Altere apenas o necessário. Limpe apenas o seu próprio impacto.**

Ao editar código existente:
- Não “melhore” código adjacente, comentários ou formatação.
- Não refatore coisas que não estão quebradas.
- Siga o estilo existente, mesmo se faria diferente.
- Se notar código morto não relacionado, mencione — não remova.

Quando suas mudanças criarem resíduos:
- Remova imports/variáveis/funções que SUAS mudanças tornaram inúteis.
- Não remova código morto pré-existente, a menos que seja solicitado.

O teste: Cada linha alterada deve estar diretamente ligada à solicitação do usuário.

## 4. Execução Orientada a Objetivos

**Defina critérios de sucesso. Itere até verificar.**

Transforme tarefas em objetivos verificáveis:
- “Adicionar validação” → “Escrever testes para entradas inválidas e fazê-los passar”
- “Corrigir o bug” → “Criar um teste que reproduz o problema e fazê-lo passar”
- “Refatorar X” → “Garantir que os testes passam antes e depois”

Para tarefas com múltiplas etapas, defina um plano breve:
```
1. [Passo] → verificar: [checagem]
2. [Passo] → verificar: [checagem]
3. [Passo] → verificar: [checagem]
```

Critérios de sucesso fortes permitem iteração independente. Critérios fracos (“fazer funcionar”) exigem esclarecimento constante.

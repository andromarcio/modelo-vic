# PROMPT — Geração de SDD (Software Design Document)

> **Modo**: DEV
> **Entrada**: arquivos globais + N1s + N2s + N3s aprovados
> **Saída**: SDD completo pronto para guiar a implementação
> **Pré-requisito**: todos os N3 da feature ou módulo a ser implementado
> devem estar com status `📋 Especificado` no INDEX.md

---

## INSTRUÇÕES PARA O CLAUDE

Você é um arquiteto de software sênior. Com base nas especificações
fornecidas, você vai gerar um SDD (Software Design Document) que serve
como ponte entre as especificações de negócio e o código a ser escrito.

O SDD não repete o que está nas specs — ele traduz as specs em decisões
de design, estruturas de código e contratos técnicos que o dev pode
seguir diretamente para implementar.

### Regras de geração

1. **Referência, não repetição.** Sempre que uma regra ou campo já
   estiver definido nas specs, referencie o artefato de origem em vez
   de copiar o conteúdo. Use a notação: `→ ver [arquivo]: [seção]`

2. **Decisões explícitas.** Toda escolha de design que não esteja
   determinada pelas specs deve ser declarada como decisão, com
   justificativa. Use o marcador 🏛️ para decisões de arquitetura.

3. **Nível de detalhe suficiente para implementar.** O dev não deve
   precisar tomar nenhuma decisão estrutural ao ler o SDD. Decisões
   de estilo (formatação de código, nomes de variáveis locais) ficam
   fora do escopo.

4. **Pseudocódigo quando necessário.** Para lógicas complexas
   (algoritmos, fluxos assíncronos, regras de negócio com múltiplas
   condições), use pseudocódigo em TypeScript para eliminar ambiguidade.

5. **Sinalize lacunas.** Se alguma informação necessária para o design
   não estiver nas specs, sinalize com ❓ e liste ao final como
   "Pontos a resolver antes de implementar".

6. **Escopo declarado.** Ao iniciar, liste explicitamente quais
   domínios, Feature Sets e features o SDD cobre, com base nos
   artefatos fornecidos.

---

## CONTEXTO DO PROJETO

=== MASTER.md ===
[cole aqui o conteúdo do MASTER.md]

=== DESIGN-SYSTEM.md ===
[cole aqui o conteúdo do DESIGN-SYSTEM.md]

=== DATA-MODEL.md ===
[cole aqui o conteúdo do DATA-MODEL.md]

=== API-PATTERNS.md ===
[cole aqui o conteúdo do API-PATTERNS.md]

=== FIELD-DICTIONARY.md ===
[cole aqui o conteúdo do FIELD-DICTIONARY.md]

=== N1(s) — DOMÍNIOS ===
[cole aqui os README.md dos domínios envolvidos]

=== N2(s) — FEATURE SETS ===
[cole aqui os README.md dos Feature Sets envolvidos]

=== N3(s) — FEATURES ===
[cole aqui os .md de todas as features a implementar]

---

## ESTRUTURA DO SDD A GERAR

Gere o SDD completo seguindo exatamente as seções abaixo,
na ordem apresentada.

---

```markdown
# SDD — [Nome do projeto / módulo]
> Software Design Document
> Versão: [1.0]
> Data: [data de geração]
> Baseado nas specs: [listar N3s de origem com seus status]
> Repositórios envolvidos: [listar repos do MASTER.md]

---

## 1. Escopo deste documento

### 1.1 O que este SDD cobre
[Lista de domínios, Feature Sets e features incluídos,
com link para cada N3 de origem.]

| Feature | N3 de origem | Status da spec |
|---|---|---|
| [feature] | [link] | 📋 Especificado |

### 1.2 O que está fora do escopo
[Features ou domínios explicitamente excluídos e por quê.]

### 1.3 Dependências com outros módulos
[Módulos ou serviços externos que este SDD pressupõe existentes,
com referência ao N1 de origem de cada dependência.]

---

## 2. Visão geral da arquitetura

### 2.1 Diagrama de componentes
[Diagrama em texto (ASCII ou Mermaid) mostrando os componentes
principais e suas relações para o escopo deste SDD.]

```
[Frontend]
    │  HTTP/REST
    ▼
[API Layer]  ──→  [Database]
    │
    └──→  [Worker/Queue]  ──→  [Serviços externos]
```

### 2.2 Padrão arquitetural adotado
🏛️ **Decisão**: [ex: "Layered Architecture com separação em
controller → service → repository"]
**Justificativa**: [por que esta escolha para este contexto]

### 2.3 Fluxo de uma requisição (ponta a ponta)
[Descrever o caminho de uma requisição desde o frontend até
o banco e de volta, identificando cada camada e sua responsabilidade.]

```
Request → [Middleware de Auth] → [Route Handler]
       → [Validation (Zod)] → [Service] → [Repository]
       → [Database] → [Response]
```

---

## 3. Design do banco de dados

### 3.1 Diagrama entidade-relacionamento
[Diagrama em texto das entidades cobertas por este SDD,
com seus campos e relacionamentos.]

```
[Entidade A]                    [Entidade B]
├── id (uuid, PK)               ├── id (uuid, PK)
├── organization_id (FK)        ├── organization_id (FK)
├── [campo] ([tipo])    1──N    ├── entity_a_id (FK)
└── ...                         └── ...
```

### 3.2 Tabelas

Para cada tabela envolvida no escopo:

#### [nome_da_tabela]
→ Entidade de origem: ver [N1/domínio]: [Entidade]

| Campo | Tipo | Constraints | Índice | Notas |
|---|---|---|---|---|
| id | uuid | PK, NOT NULL | PK | Gerado pelo banco |
| organization_id | uuid | FK, NOT NULL | INDEX | → organizations.id |
| [campo] | [tipo] | [constraints] | [sim/não] | [notas] |

**Índices adicionais**:
```sql
CREATE INDEX idx_[tabela]_[campo] ON [tabela]([campo]);
-- Justificativa: [por que este índice é necessário]
```

**Enums**:
```sql
CREATE TYPE [nome_enum] AS ENUM ('[valor1]', '[valor2]');
-- Usado em: [tabela].[campo]
-- → ver FIELD-DICTIONARY: [campo] (se aplicável)
```

### 3.3 Migrations

Lista de migrations a criar, em ordem de execução:

| Ordem | Arquivo | O que faz |
|---|---|---|
| 001 | [timestamp]_create_[tabela].ts | Cria tabela [tabela] com campos base |
| 002 | [timestamp]_create_[tabela]_indexes.ts | Índices de [tabela] |
| 003 | [timestamp]_create_enum_[nome].ts | Enum [nome] |

---

## 4. Design da API

### 4.1 Autenticação e autorização
→ Padrão global: ver API-PATTERNS.md: Autenticação e autorização

**Middleware de auth** (`lib/middleware/auth.ts`):
[Descrever o que o middleware valida e o que injeta no contexto
da requisição — ex: organizationId, userId, role.]

**Verificação de role por endpoint**:
[Como será implementada a verificação de role — decorator,
middleware específico, verificação no service.]

### 4.2 Endpoints

Para cada endpoint coberto por este SDD:

#### [MÉTODO] [/api/v1/rota]
→ Especificação de origem: ver [N3]: API: [endpoint]

**Handler** (`app/api/v1/[rota]/route.ts`):
```typescript
// Pseudocódigo do handler
export async function [METHOD](req: Request) {
  // 1. Extrair contexto da sessão
  const { organizationId, userId, role } = await getSession(req)

  // 2. Validar body/params com Zod
  const body = schema.[feature]Schema.parse(await req.json())

  // 3. Chamar service
  const result = await [feature]Service.[acao](organizationId, userId, body)

  // 4. Retornar resposta
  return Response.json({ data: result, meta: null }, { status: [código] })
}
```

**Schema de validação Zod** (`lib/validations/[feature].ts`):
```typescript
export const [feature]Schema = z.object({
  [campo]: z.[tipo]([validações]),  // → FIELD-DICTIONARY: [campo] se canônico
})
```

**Mapeamento de erros**:
→ Erros globais: ver API-PATTERNS.md: Códigos de erro globais

| Situação | Code | HTTP | Onde é lançado |
|---|---|---|---|
| [situação] | `[ENTIDADE_ERRO]` | [código] | [service/repository] |

---

## 5. Design dos serviços (camada de negócio)

Para cada serviço a ser criado:

### [NomeDoModulo]Service (`lib/services/[modulo].service.ts`)

**Responsabilidade**: [o que este service faz — uma frase]
→ Regras de negócio: ver [N3]: Regras de negócio

#### Método: [nomeDoMetodo]

**Assinatura**:
```typescript
async [nomeDoMetodo](
  organizationId: string,
  userId: string,
  data: [TipoDoInput]
): Promise<[TipoDoRetorno]>
```

**Pseudocódigo**:
```typescript
async [nomeDoMetodo](organizationId, userId, data) {
  // → Regra N: [descrição da regra] — ver [N3]: Regras de negócio: [N]
  const [validação] = await this.[repository].[método](...)
  if ([condição de erro]) {
    throw new AppError('[ENTIDADE_ERRO]', [httpStatus])
  }

  // → Regra N: [descrição]
  const resultado = await this.[repository].create({
    ...data,
    organizationId,
    source: '[valor automático]',
  })

  // → Regra N: publicar evento — ver [N3]: Eventos
  await publishEvent('[entidade.acao]', {
    organizationId,
    [entidade]Id: resultado.id,
  })

  // → Regra N: auditoria — ver [N3]: AuditLog
  await logAction({
    organizationId,
    userId,
    action: '[entidade.acao]',
    targetEntity: '[Entidade]',
    targetId: resultado.id,
    metadata: { [campos relevantes] },
  })

  return resultado
}
```

**Casos de erro mapeados**:
| Condição | Code lançado | Origem na spec |
|---|---|---|
| [condição] | `[ENTIDADE_ERRO]` | → [N3]: Regra [N] |

---

## 6. Design dos repositórios (camada de dados)

Para cada repositório a ser criado:

### [NomeDoModulo]Repository (`lib/repositories/[modulo].repository.ts`)

**Responsabilidade**: acesso a dados da entidade [Entidade] — sem lógica de negócio.

#### Método: [nomeDoMetodo]

```typescript
async [nomeDoMetodo](
  organizationId: string,
  [params]: [tipos]
): Promise<[Entidade] | null> {
  return prisma.[tabela].findFirst({
    where: {
      organization_id: organizationId,  // isolamento obrigatório
      deleted_at: null,                  // soft delete
      [filtros adicionais],
    },
  })
}
```

---

## 7. Design dos componentes de frontend

Para cada tela ou componente coberto por este SDD:

### [NomeDaTela] (`app/(auth)/[rota]/page.tsx`)
→ Especificação de origem: ver [N3]: Comportamento de tela

**Estado local necessário**:
```typescript
// Estados que este componente precisa gerenciar
const [dados, setDados] = useState<[Tipo][]>([])
const [loading, setLoading] = useState(false)
const [erro, setErro] = useState<string | null>(null)
```

**Estrutura de componentes**:
```
[NomeDaTela]
├── [ComponenteA]          → components/[modulo]/[ComponenteA].tsx
│   └── [SubComponente]    → components/ui/[SubComponente].tsx
└── [ComponenteB]          → components/[modulo]/[ComponenteB].tsx
```

**Chamadas de API**:
| Ação do usuário | Endpoint chamado | Tratamento de erro |
|---|---|---|
| [ação] | [MÉTODO] /api/v1/[rota] | [como tratar na UI] |

**Estados obrigatórios**:
→ Padrão de estados: ver DESIGN-SYSTEM.md: Estados obrigatórios de tela

| Estado | Componente responsável | O que renderiza |
|---|---|---|
| Loading | [componente] | Skeleton de [N] linhas |
| Empty | [componente] | [ícone + mensagem + botão] |
| Error | [componente] | [mensagem + botão retry] |
| Success | Toast | "[mensagem de sucesso]" |

---

## 8. Design de jobs assíncronos

*(Incluir apenas se houver processamento assíncrono nas features do escopo)*

### [NomeDoJob] (`lib/workers/[job].worker.ts`)
→ Especificação de origem: ver [N3]: [seção relevante]

**Trigger**: [o que dispara este job — evento, schedule, requisição]
**Fila**: [nome da fila no BullMQ/similar]
**Timeout**: [tempo máximo de execução]
**Retries**: [número de tentativas em caso de falha]

**Pseudocódigo**:
```typescript
async function [nomeDoJob](payload: [TipoDoPayload]) {
  await updateStatus(payload.jobId, 'processing')

  try {
    // lógica principal
    for (const item of items) {
      // processar item
      // publicar evento por item se necessário
    }

    await updateStatus(payload.jobId, 'done', resultado)
    await publishEvent('[job].completed', { ...resultado })

  } catch (error) {
    await updateStatus(payload.jobId, 'failed', { error: error.message })
    await publishEvent('[job].failed', { jobId: payload.jobId })
  }
}
```

---

## 9. Design de eventos internos

### Mapa de eventos deste SDD

| Evento | Publicado por | Consumido por | Payload |
|---|---|---|---|
| `[entidade.acao]` | [Service] | [Handler/Worker] | `{ organizationId, [id] }` |

### Implementação dos handlers de evento

Para cada evento consumido:

```typescript
// lib/events/handlers/[evento].handler.ts
onEvent('[entidade.acao]', async (payload) => {
  // → ver [N3]: Eventos consumidos: [evento]
  await [service].[metodo](payload)
})
```

---

## 10. Estrutura de arquivos

Lista completa de arquivos a criar ou alterar,
agrupada por repositório:

### [nome-do-repositorio]

```
[caminho/arquivo]                     [criar/alterar] — [o que faz]

── Banco de dados ─────────────────────────────────────────────
prisma/migrations/[ts]_[nome].ts      criar — [descrição da migration]
prisma/schema.prisma                  alterar — adicionar [entidade(s)]

── Validações ─────────────────────────────────────────────────
lib/validations/[modulo].ts           criar — schemas Zod de [feature(s)]

── Repositórios ───────────────────────────────────────────────
lib/repositories/[modulo].repository.ts  criar — acesso a dados de [Entidade]

── Serviços ───────────────────────────────────────────────────
lib/services/[modulo].service.ts      criar — lógica de negócio de [feature(s)]

── Eventos ────────────────────────────────────────────────────
lib/events/handlers/[evento].handler.ts  criar — handler de [evento]

── API ────────────────────────────────────────────────────────
app/api/v1/[rota]/route.ts            criar — endpoint(s) de [feature]

── Frontend ───────────────────────────────────────────────────
app/(auth)/[rota]/page.tsx            criar — tela de [feature]
components/[modulo]/[Componente].tsx  criar — [descrição]
components/ui/[Componente].tsx        criar/alterar — [descrição]

── Workers ────────────────────────────────────────────────────
lib/workers/[job].worker.ts           criar — job de [feature]
```

---

## 11. Sequência de implementação

Ordem recomendada para implementar sem travar em dependências:

| Fase | O que implementar | Pré-requisito |
|---|---|---|
| 1 | Migrations e schema Prisma | — |
| 2 | Repositórios | Migration concluída |
| 3 | Schemas de validação (Zod) | — |
| 4 | Serviços | Repositórios + validações |
| 5 | Handlers de eventos | Serviços |
| 6 | Endpoints de API | Serviços + validações |
| 7 | Workers/Jobs | Serviços + eventos |
| 8 | Componentes de UI base | Design System |
| 9 | Telas (pages) | Componentes + endpoints |
| 10 | Testes | Tudo acima |

---

## 12. Design de testes

### Cobertura mínima esperada

| Tipo | O que testar | Arquivo |
|---|---|---|
| Unitário | Service: cada método com todos os cenários Gherkin negociais | `[modulo].service.spec.ts` |
| Unitário | Validação Zod: campos válidos e inválidos | `[modulo].validation.spec.ts` |
| Integração | Endpoint: request → response com banco real | `[rota].integration.spec.ts` |
| Integração | Job: processamento completo com casos de erro | `[job].worker.spec.ts` |

### Mapeamento cenários Gherkin → testes

Para cada grupo de cenários do N3:

| Cenário Gherkin | Tipo de teste | Método de teste |
|---|---|---|
| [descrição do cenário] | Unitário / Integração | `it('[should...]')` |

---

## 13. Checklist de implementação

O dev deve marcar cada item ao concluir:

### Banco de dados
- [ ] Migration criada e testada em ambiente local
- [ ] Schema Prisma atualizado e gerado (`prisma generate`)
- [ ] Índices criados conforme seção 3.2

### Backend
- [ ] Repositório implementado com isolamento por `organizationId`
- [ ] Service implementado cobrindo todas as regras do N3
- [ ] Validação Zod cobre todos os campos e formatos do N3
- [ ] Todos os endpoints retornam o envelope padrão do API-PATTERNS.md
- [ ] Todos os códigos de erro do N3 estão implementados
- [ ] Eventos publicados em todos os pontos definidos no N3
- [ ] AuditLog registrado conforme definido no N3
- [ ] Soft delete respeitado em todas as queries

### Frontend
- [ ] Todos os estados de tela implementados (loading, error, empty, success)
- [ ] Mensagens de erro do N3 estão exibidas nos campos corretos
- [ ] Toasts implementados conforme DESIGN-SYSTEM.md
- [ ] Campos canônicos usando componentes/validações do FIELD-DICTIONARY.md

### Testes
- [ ] Testes unitários cobrindo todos os cenários Gherkin negociais
- [ ] Testes de integração cobrindo os endpoints principais
- [ ] Todos os casos de erro testados

### Finalização
- [ ] Seção "Implementação" preenchida em cada N3 (repositório + caminho)
- [ ] Status atualizado para ✅ Implementado no INDEX.md
- [ ] PR referencia os N3 implementados

---

## 14. Pontos a resolver antes de implementar

*(Gerado automaticamente — lista de ❓ identificados durante a geração do SDD)*

| # | Ponto em aberto | Artefato de origem | Impacto |
|---|---|---|---|
| 1 | ❓ [descrição da lacuna] | [N3/N2/N1]: [seção] | [Alto/Médio/Baixo] |

> Resolva os itens de impacto Alto antes de iniciar.
> Itens de impacto Médio e Baixo podem ser resolvidos durante a implementação
> com decisão documentada em um ADR.

---

## 15. Decisões de arquitetura registradas

*(Lista de todas as decisões marcadas com 🏛️ neste documento)*

| # | Decisão | Justificativa | Alternativa descartada |
|---|---|---|---|
| 1 | 🏛️ [decisão] | [justificativa] | [alternativa e por que não] |

> Decisões com impacto sistêmico devem ser formalizadas em um ADR
> na pasta `decisions/` do repositório de docs.
```

---

## INSTRUÇÕES FINAIS PARA O CLAUDE

Após gerar o SDD completo:

1. **Liste os N3 cobertos** e confirme se todos estão com status
   `📋 Especificado` — alertar se algum estiver com lacunas pendentes.

2. **Contabilize os pontos em aberto** (seção 14) e classifique
   por impacto. Se houver itens de impacto Alto, recomende
   resolver antes de iniciar a implementação.

3. **Identifique decisões que merecem ADR** (seção 15) e sugira
   abrir os ADRs correspondentes na pasta `decisions/`.

4. **Estime complexidade por fase** da sequência de implementação
   (seção 11), sinalizando as fases com maior risco técnico.

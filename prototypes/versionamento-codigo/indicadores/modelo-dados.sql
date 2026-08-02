-- =============================================================================
-- Modelo VIC — Versionamento e Integração de Código
-- Modelo de dados dos indicadores de governança (PostgreSQL >= 14)
--
-- Fonte dos dados: GitHub Enterprise (REST/GraphQL + audit log).
-- Objetivo: sustentar os indicadores das 13 Diretrizes e responder, como
--           consulta de primeira classe, "quantos e quais commits, por
--           usuário e por repositório".
--
-- Princípios estruturais (ver modelo-dados.md):
--   1. FATO IMUTÁVEL x ESTADO MUTÁVEL. Commit, PR, revisão, tag e nota de
--      versão são fatos: carregados uma vez, nunca reescritos. Divergência de
--      branch e proteção de branch são estados: gravados como SNAPSHOT datado,
--      um por coleta, para que a maturidade seja uma série temporal.
--   2. CHAVE NATURAL EM TUDO. SHA, (repositório, número), id do GitHub e
--      node_id são as chaves de conflito do UPSERT. A coleta é idempotente.
--   3. GRANULARIDADE MÁXIMA. Nenhum indicador é armazenado apenas agregado;
--      vic.medicao_indicador guarda o resultado, mas o fato que o originou
--      permanece consultável para recortes novos.
--
-- Execução:  psql -v ON_ERROR_STOP=1 -f modelo-dados.sql
-- =============================================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS vic;

COMMENT ON SCHEMA vic IS
  'Modelo VIC: dados extraídos do GitHub Enterprise que sustentam os indicadores das 13 Diretrizes.';


-- =============================================================================
-- 1. TIPOS ENUMERADOS
-- =============================================================================

CREATE TYPE vic.classe_branch AS ENUM (
  'main', 'develop', 'feature', 'release', 'hotfix', 'bugfix', 'support', 'outra'
);
COMMENT ON TYPE vic.classe_branch IS
  'Classificação da branch pelo nome (D2/D11). main e develop são permanentes; as demais são temporárias.';

CREATE TYPE vic.modelo_flow AS ENUM ('gitflow', 'github_flow', 'indefinido');
COMMENT ON TYPE vic.modelo_flow IS
  'D2: gitflow exige main+develop; github_flow exige apenas main; indefinido = não classificado.';

CREATE TYPE vic.estado_pr AS ENUM ('aberto', 'fechado', 'mergeado');

CREATE TYPE vic.estado_revisao AS ENUM (
  'aprovado', 'mudancas_solicitadas', 'comentario', 'descartado', 'pendente'
);

CREATE TYPE vic.conclusao_verificacao AS ENUM (
  'sucesso', 'falha', 'neutro', 'cancelado', 'pulado', 'timeout',
  'acao_requerida', 'pendente', 'em_execucao'
);
COMMENT ON TYPE vic.conclusao_verificacao IS
  'Resultado de um check run ou commit status. Somente ''sucesso'' satisfaz a D1.';

CREATE TYPE vic.origem_verificacao AS ENUM ('check_run', 'commit_status');

CREATE TYPE vic.tipo_tag AS ENUM ('leve', 'anotada');

CREATE TYPE vic.tipo_conta_github AS ENUM ('usuario', 'robo', 'organizacao');

CREATE TYPE vic.metodo_resolucao AS ENUM (
  'api_github',             -- o próprio GitHub associou o commit a uma conta
  'noreply_github',         -- e-mail id+login@users.noreply.github.com
  'diretorio_corporativo',  -- e-mail bate com o diretório (LDAP/AD/Entra)
  'email_identico',         -- mesmo e-mail já resolvido em outro repositório
  'heuristica_nome',        -- mesmo nome normalizado; exige curadoria
  'curadoria_manual',       -- vínculo confirmado por pessoa
  'nao_resolvido'
);
COMMENT ON TYPE vic.metodo_resolucao IS
  'Como a identidade Git/GitHub foi ligada a uma pessoa. Ordem de precedência decrescente na lista.';

CREATE TYPE vic.verificacao_assinatura AS ENUM (
  'verificada', 'nao_assinada', 'invalida', 'chave_desconhecida', 'expirada'
);

CREATE TYPE vic.status_arquivo_commit AS ENUM (
  'adicionado', 'modificado', 'removido', 'renomeado', 'copiado', 'alterado', 'inalterado'
);

CREATE TYPE vic.status_coleta AS ENUM ('em_andamento', 'concluida', 'parcial', 'falhou');

CREATE TYPE vic.papel_vic AS ENUM ('integrador', 'desenvolvedor', 'revisor', 'administrador');
COMMENT ON TYPE vic.papel_vic IS
  'D6: o papel de Integrador é permissionado por time e é quem pode concluir PR em branch permanente.';

CREATE TYPE vic.gravidade AS ENUM ('alta', 'media', 'baixa');

CREATE TYPE vic.situacao_conformidade AS ENUM (
  'conforme', 'nao_conforme', 'nao_aplicavel', 'sem_dados'
);


-- =============================================================================
-- 2. FUNÇÕES DE CLASSIFICAÇÃO (IMMUTABLE — usadas em colunas geradas)
--
-- Regra de conformidade textual mora no banco, não no coletor: assim a
-- classificação nunca diverge entre carga histórica e carga nova.
-- =============================================================================

CREATE OR REPLACE FUNCTION vic.classificar_branch(p_nome TEXT)
RETURNS vic.classe_branch
LANGUAGE sql IMMUTABLE STRICT AS $fn$
  SELECT CASE
    WHEN lower(p_nome) IN ('main', 'master') THEN 'main'
    WHEN lower(p_nome) = 'develop'           THEN 'develop'
    WHEN p_nome ~ '^feature/'                THEN 'feature'
    WHEN p_nome ~ '^release/'                THEN 'release'
    WHEN p_nome ~ '^hotfix/'                 THEN 'hotfix'
    WHEN p_nome ~ '^bugfix/'                 THEN 'bugfix'
    WHEN p_nome ~ '^support/'                THEN 'support'
    ELSE 'outra'
  END::vic.classe_branch;
$fn$;
COMMENT ON FUNCTION vic.classificar_branch(TEXT) IS
  'D2/D11: deriva a classe da branch a partir do nome. Usada em coluna gerada de vic.branch.';

CREATE OR REPLACE FUNCTION vic.branch_nome_conforme(p_nome TEXT)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE STRICT AS $fn$
  SELECT p_nome ~ '^(main|develop|(feature|release|hotfix)/[a-z0-9][a-z0-9._-]*)$';
$fn$;
COMMENT ON FUNCTION vic.branch_nome_conforme(TEXT) IS
  'D11: expressão idêntica à publicada na Diretriz 11. O modelo VIC define apenas '
  'main e develop como permanentes e apenas feature, release e hotfix como prefixos '
  'temporários — master, bugfix e support NÃO pertencem ao modelo e são não conformes.';

CREATE OR REPLACE FUNCTION vic.eh_semver(p_versao TEXT)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE STRICT AS $fn$
  SELECT p_versao ~ (
      '^[vV]?(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)'
   || '(-(0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)'
   || '(\.(0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*)?'
   || '(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$');
$fn$;
COMMENT ON FUNCTION vic.eh_semver(TEXT) IS
  'D9: MAJOR.MINOR.PATCH com pré-lançamento e metadados opcionais. O prefixo "v" é tolerado por convenção de tag Git.';

CREATE OR REPLACE FUNCTION vic.eh_vec(p_versao TEXT)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE STRICT AS $fn$
  SELECT p_versao ~ '^[vV]?(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$';
$fn$;
COMMENT ON FUNCTION vic.eh_vec(TEXT) IS
  'D10: Padrão VEC = MAJOR.MINOR.PATCH.BUILD. Obrigatório para tags de produção.';

CREATE OR REPLACE FUNCTION vic.repo_nome_conforme(p_nome TEXT)
RETURNS BOOLEAN
LANGUAGE sql IMMUTABLE STRICT AS $fn$
  SELECT p_nome ~ '^[A-Z][A-Z0-9]{1,9}-[a-z0-9]+(-[a-z0-9]+)*$';
$fn$;
COMMENT ON FUNCTION vic.repo_nome_conforme(TEXT) IS
  'D11: expressão idêntica à publicada na Diretriz 11. Sigla de 2 a 10 caracteres '
  'maiúsculos e hífen como único separador — ponto e sublinhado são rejeitados de '
  'propósito, ainda que o GitHub os aceite em nome de repositório.';

CREATE OR REPLACE FUNCTION vic.extensao_de(p_caminho TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE STRICT AS $fn$
  SELECT lower(nullif(substring(p_caminho from '\.([A-Za-z0-9]+)$'), ''));
$fn$;
COMMENT ON FUNCTION vic.extensao_de(TEXT) IS
  'D12: extensão do arquivo em minúsculas, sem o ponto. NULL quando não há extensão.';


-- =============================================================================
-- 3. CATÁLOGO E IDENTIDADE
-- =============================================================================

CREATE TABLE vic.organizacao (
  id            BIGINT       PRIMARY KEY,
  node_id       TEXT         NOT NULL UNIQUE,
  login         TEXT         NOT NULL UNIQUE,
  nome          TEXT,
  url_api       TEXT,
  criada_em     TIMESTAMPTZ,
  coletada_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
COMMENT ON TABLE  vic.organizacao IS 'Organização do GitHub Enterprise. Escopo máximo de consolidação dos indicadores.';
COMMENT ON COLUMN vic.organizacao.id IS 'Chave natural: id numérico da org no GitHub. Nunca reciclado — serve de chave de UPSERT.';
COMMENT ON COLUMN vic.organizacao.node_id IS 'Identificador GraphQL (node_id). Estável mesmo se o login for renomeado.';


CREATE TABLE vic.pessoa (
  id                  BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chave_corporativa   TEXT        UNIQUE,
  nome_completo       TEXT        NOT NULL,
  email_corporativo   TEXT        UNIQUE,
  eh_robo             BOOLEAN     NOT NULL DEFAULT FALSE,
  ativa               BOOLEAN     NOT NULL DEFAULT TRUE,
  criada_em           TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizada_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  vic.pessoa IS
  'Pessoa canônica: o ser humano (ou robô) por trás de N identidades Git e M contas GitHub. Alvo final de "commits por usuário".';
COMMENT ON COLUMN vic.pessoa.chave_corporativa IS
  'Matrícula/UPN no diretório corporativo. Única âncora estável fora do GitHub; permite reconciliar quem sai e volta.';
COMMENT ON COLUMN vic.pessoa.eh_robo IS
  'TRUE para contas de automação (dependabot, service accounts). Excluídas por padrão dos indicadores de autoria.';


CREATE TABLE vic.usuario_github (
  id                BIGINT      PRIMARY KEY,
  node_id           TEXT        UNIQUE,
  login             TEXT        NOT NULL UNIQUE,
  nome              TEXT,
  email_publico     TEXT,
  tipo              vic.tipo_conta_github NOT NULL DEFAULT 'usuario',
  pessoa_id         BIGINT      REFERENCES vic.pessoa(id) ON DELETE SET NULL,
  metodo_resolucao  vic.metodo_resolucao NOT NULL DEFAULT 'nao_resolvido',
  confianca         NUMERIC(3,2) NOT NULL DEFAULT 0
                    CHECK (confianca >= 0 AND confianca <= 1),
  resolvida_em      TIMESTAMPTZ,
  coletada_em       TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE  vic.usuario_github IS
  'Conta do GitHub (login). Um humano pode ter mais de uma; por isso o vínculo com vic.pessoa é N:1 e não identidade.';
COMMENT ON COLUMN vic.usuario_github.id IS 'Chave natural: id numérico da conta. O login pode ser renomeado — o id, não.';
COMMENT ON COLUMN vic.usuario_github.confianca IS 'Confiança do vínculo com a pessoa, 0..1. Abaixo de 0,80 entra na fila de curadoria.';


CREATE TABLE vic.identidade_git (
  id                     BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email                  TEXT        NOT NULL,
  email_normalizado      TEXT        GENERATED ALWAYS AS (lower(btrim(email))) STORED,
  nome_observado         TEXT,
  pessoa_id              BIGINT      REFERENCES vic.pessoa(id) ON DELETE SET NULL,
  usuario_github_id      BIGINT      REFERENCES vic.usuario_github(id) ON DELETE SET NULL,
  metodo_resolucao       vic.metodo_resolucao NOT NULL DEFAULT 'nao_resolvido',
  confianca              NUMERIC(3,2) NOT NULL DEFAULT 0
                         CHECK (confianca >= 0 AND confianca <= 1),
  revisada_por           TEXT,
  revisada_em            TIMESTAMPTZ,
  primeira_ocorrencia_em TIMESTAMPTZ,
  ultima_ocorrencia_em   TIMESTAMPTZ,
  qtd_commits_observados BIGINT      NOT NULL DEFAULT 0,
  CONSTRAINT uq_identidade_git_email UNIQUE (email_normalizado)
);
COMMENT ON TABLE  vic.identidade_git IS
  'Identidade de autoria do Git: o par nome/e-mail que o desenvolvedor configurou na máquina. É texto arbitrário, NÃO é o login do GitHub. Esta tabela é a ponte e-mail -> pessoa.';
COMMENT ON COLUMN vic.identidade_git.email_normalizado IS
  'Chave de deduplicação (lower + trim). Chave de conflito do UPSERT da carga.';
COMMENT ON COLUMN vic.identidade_git.nome_observado IS
  'Último nome visto com este e-mail. Não é chave: o mesmo e-mail aparece com grafias diferentes.';
COMMENT ON COLUMN vic.identidade_git.qtd_commits_observados IS
  'Contador de apoio à curadoria: prioriza a resolução dos e-mails que mais impactam os indicadores.';


CREATE TABLE vic.repositorio (
  id               BIGINT      PRIMARY KEY,
  node_id          TEXT        NOT NULL UNIQUE,
  organizacao_id   BIGINT      NOT NULL REFERENCES vic.organizacao(id) ON DELETE CASCADE,
  nome             TEXT        NOT NULL,
  nome_completo    TEXT        NOT NULL UNIQUE,
  descricao        TEXT,
  branch_padrao    TEXT,
  privado          BOOLEAN     NOT NULL DEFAULT TRUE,
  arquivado        BOOLEAN     NOT NULL DEFAULT FALSE,
  desabilitado     BOOLEAN     NOT NULL DEFAULT FALSE,
  criado_em        TIMESTAMPTZ,
  atualizado_em    TIMESTAMPTZ,
  modelo_flow      vic.modelo_flow NOT NULL DEFAULT 'indefinido',
  sistema          TEXT        GENERATED ALWAYS AS (split_part(nome, '-', 1)) STORED,
  modulo           TEXT        GENERATED ALWAYS AS (
                       nullif(substr(nome, strpos(nome, '-') + 1), nome)
                   ) STORED,
  nome_conforme    BOOLEAN     GENERATED ALWAYS AS (vic.repo_nome_conforme(nome)) STORED,
  em_escopo_vic    BOOLEAN     NOT NULL DEFAULT TRUE,
  coletado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organizacao_id, nome)
);
COMMENT ON TABLE  vic.repositorio IS 'Repositório do GitHub Enterprise. Unidade de recorte de praticamente todo indicador.';
COMMENT ON COLUMN vic.repositorio.sistema IS 'D11: parte anterior ao primeiro hífen do nome (SISTEMA).';
COMMENT ON COLUMN vic.repositorio.modulo IS 'D11: parte posterior ao primeiro hífen. NULL quando o nome não tem hífen (não conforme).';
COMMENT ON COLUMN vic.repositorio.nome_conforme IS 'D11: TRUE quando o nome adere ao padrão SISTEMA-modulo. Calculado pelo banco.';
COMMENT ON COLUMN vic.repositorio.modelo_flow IS 'D2: modelo declarado/inferido. A verificação por coleta fica em vic.snapshot_repositorio.';
COMMENT ON COLUMN vic.repositorio.em_escopo_vic IS 'FALSE para repositórios excluídos da apuração (sandbox, fork externo, arquivado por decisão).';


CREATE TABLE vic.equipe (
  id                    BIGINT  PRIMARY KEY,
  node_id               TEXT    UNIQUE,
  organizacao_id        BIGINT  NOT NULL REFERENCES vic.organizacao(id) ON DELETE CASCADE,
  slug                  TEXT    NOT NULL,
  nome                  TEXT,
  eh_grupo_integradores BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (organizacao_id, slug)
);
COMMENT ON TABLE  vic.equipe IS 'Time (team) do GitHub. Fonte primária do grupo de Integradores exigido pela D6.';
COMMENT ON COLUMN vic.equipe.eh_grupo_integradores IS
  'Marca o time cujos membros exercem o papel de Integrador. Alimenta vic.atribuicao_papel.';


CREATE TABLE vic.equipe_membro (
  equipe_id         BIGINT NOT NULL REFERENCES vic.equipe(id) ON DELETE CASCADE,
  usuario_github_id BIGINT NOT NULL REFERENCES vic.usuario_github(id) ON DELETE CASCADE,
  papel_github      TEXT,
  vigente_desde     DATE   NOT NULL DEFAULT CURRENT_DATE,
  vigente_ate       DATE,
  PRIMARY KEY (equipe_id, usuario_github_id, vigente_desde),
  CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_desde)
);
COMMENT ON TABLE vic.equipe_membro IS
  'Vínculo temporal pessoa-time. Historiado: saber quem era integrador NA DATA do merge é requisito da D6.';


CREATE TABLE vic.atribuicao_papel (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organizacao_id    BIGINT REFERENCES vic.organizacao(id) ON DELETE CASCADE,
  repositorio_id    BIGINT REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  usuario_github_id BIGINT NOT NULL REFERENCES vic.usuario_github(id) ON DELETE CASCADE,
  papel             vic.papel_vic NOT NULL,
  origem            TEXT   NOT NULL DEFAULT 'equipe_github'
                    CHECK (origem IN ('equipe_github', 'colaborador_repo', 'cadastro_manual')),
  vigente_desde     DATE   NOT NULL,
  vigente_ate       DATE,
  CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_desde),
  CHECK (organizacao_id IS NOT NULL OR repositorio_id IS NOT NULL)
);
COMMENT ON TABLE vic.atribuicao_papel IS
  'D6: quem exerce cada papel VIC, em que escopo e em que período. repositorio_id NULL = papel válido em toda a organização.';

CREATE UNIQUE INDEX uq_atribuicao_papel
  ON vic.atribuicao_papel (
       coalesce(repositorio_id, 0), coalesce(organizacao_id, 0),
       usuario_github_id, papel, vigente_desde);

CREATE INDEX ix_atribuicao_papel_vigencia
  ON vic.atribuicao_papel (papel, vigente_desde, vigente_ate);


-- =============================================================================
-- 4. COLETA (eixo temporal de todo snapshot)
-- =============================================================================

CREATE TABLE vic.coleta (
  id               BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organizacao_id   BIGINT      NOT NULL REFERENCES vic.organizacao(id) ON DELETE CASCADE,
  data_referencia  DATE        NOT NULL,
  escopo           TEXT        NOT NULL DEFAULT 'completa'
                   CHECK (escopo IN ('completa', 'incremental', 'repositorio')),
  iniciada_em      TIMESTAMPTZ NOT NULL DEFAULT now(),
  concluida_em     TIMESTAMPTZ,
  status           vic.status_coleta NOT NULL DEFAULT 'em_andamento',
  versao_coletor   TEXT,
  qtd_repositorios INTEGER,
  observacao       TEXT,
  CONSTRAINT uq_coleta_dia UNIQUE (organizacao_id, data_referencia, escopo)
);
COMMENT ON TABLE  vic.coleta IS
  'Execução do coletor. Todo snapshot pendura aqui: é a coluna vertebral da série temporal e a fronteira de idempotência (rodar duas vezes no mesmo dia atualiza, não duplica).';
COMMENT ON COLUMN vic.coleta.data_referencia IS
  'Dia a que a fotografia se refere. Ponto de corte das séries — não use iniciada_em para agrupar.';


CREATE TABLE vic.coleta_erro (
  id             BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  coleta_id      BIGINT      NOT NULL REFERENCES vic.coleta(id) ON DELETE CASCADE,
  repositorio_id BIGINT      REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  recurso        TEXT        NOT NULL,
  mensagem       TEXT        NOT NULL,
  http_status    INTEGER,
  ocorrido_em    TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE vic.coleta_erro IS
  'Falhas por recurso. Sem isto, um indicador cai por falta de dado e parece piora de conformidade.';


-- =============================================================================
-- 5. FATOS IMUTÁVEIS
-- =============================================================================

CREATE TABLE vic.branch (
  repositorio_id          BIGINT      NOT NULL REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  nome                    TEXT        NOT NULL,
  classe                  vic.classe_branch GENERATED ALWAYS AS (vic.classificar_branch(nome)) STORED,
  permanente              BOOLEAN     GENERATED ALWAYS AS (
                              vic.classificar_branch(nome)
                                IN ('main'::vic.classe_branch, 'develop'::vic.classe_branch)
                          ) STORED,
  nome_conforme           BOOLEAN     GENERATED ALWAYS AS (vic.branch_nome_conforme(nome)) STORED,
  branch_base             TEXT,
  criada_em               TIMESTAMPTZ,
  primeira_observacao_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultima_observacao_em    TIMESTAMPTZ NOT NULL DEFAULT now(),
  mergeada_em             TIMESTAMPTZ,
  removida_em             TIMESTAMPTZ,
  pr_numero               INTEGER,
  PRIMARY KEY (repositorio_id, nome)
);
COMMENT ON TABLE  vic.branch IS
  'Identidade da branch ao longo do tempo (entidade de vida longa, não fato nem snapshot). O estado que muda a cada coleta — ahead/behind, merge-base — mora em vic.snapshot_branch.';
COMMENT ON COLUMN vic.branch.criada_em IS
  'Data do primeiro commit exclusivo da branch. D4 proíbe usar a data de criação da ref como idade: rebase e recriação zeram aquela data.';
COMMENT ON COLUMN vic.branch.mergeada_em IS 'D3/D5: momento da integração na permanente. NULL = ainda não integrada.';
COMMENT ON COLUMN vic.branch.removida_em IS
  'D3: momento em que a ref deixou de existir (sanitização). Mergeada e não removida = branch obsoleta.';
COMMENT ON COLUMN vic.branch.branch_base IS 'Branch permanente contra a qual a divergência é medida (develop no GitFlow, main no GitHub Flow).';

CREATE INDEX ix_branch_classe ON vic.branch (repositorio_id, classe);
CREATE INDEX ix_branch_obsoleta ON vic.branch (repositorio_id, mergeada_em)
  WHERE mergeada_em IS NOT NULL AND removida_em IS NULL;


CREATE TABLE vic.pull_request (
  repositorio_id                 BIGINT      NOT NULL REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  numero                         INTEGER     NOT NULL,
  id_github                      BIGINT      NOT NULL,
  node_id                        TEXT        NOT NULL,
  titulo                         TEXT,
  corpo                          TEXT,
  estado                         vic.estado_pr NOT NULL,
  rascunho                       BOOLEAN     NOT NULL DEFAULT FALSE,
  branch_origem                  TEXT        NOT NULL,
  branch_destino                 TEXT        NOT NULL,
  classe_origem                  vic.classe_branch GENERATED ALWAYS AS (vic.classificar_branch(branch_origem)) STORED,
  classe_destino                 vic.classe_branch GENERATED ALWAYS AS (vic.classificar_branch(branch_destino)) STORED,
  sha_head                       TEXT,
  sha_base                       TEXT,
  sha_merge_commit               TEXT,
  metodo_merge                   TEXT        CHECK (metodo_merge IN ('merge', 'squash', 'rebase')),
  autor_usuario_github_id        BIGINT      REFERENCES vic.usuario_github(id) ON DELETE SET NULL,
  mergeado_por_usuario_github_id BIGINT      REFERENCES vic.usuario_github(id) ON DELETE SET NULL,
  criado_em                      TIMESTAMPTZ NOT NULL,
  atualizado_em                  TIMESTAMPTZ,
  fechado_em                     TIMESTAMPTZ,
  mergeado_em                    TIMESTAMPTZ,
  qtd_commits                    INTEGER,
  adicoes                        INTEGER,
  delecoes                       INTEGER,
  arquivos_alterados             INTEGER,
  qtd_aprovacoes                 INTEGER     NOT NULL DEFAULT 0,
  coleta_ultima_id               BIGINT      REFERENCES vic.coleta(id) ON DELETE SET NULL,
  PRIMARY KEY (repositorio_id, numero),
  UNIQUE (node_id),
  UNIQUE (id_github),
  CHECK (estado <> 'mergeado' OR mergeado_em IS NOT NULL)
);
COMMENT ON TABLE  vic.pull_request IS
  'D8: instrumento central de integração. Fato de vida curta — muda enquanto aberto, congela ao ser mergeado. A carga faz UPSERT por (repositorio_id, numero).';
COMMENT ON COLUMN vic.pull_request.mergeado_por_usuario_github_id IS
  'D6: quem executou a COMPLETUDE. É este campo, e não o autor, que responde "o merge foi concluído por um Integrador?".';
COMMENT ON COLUMN vic.pull_request.metodo_merge IS
  'merge | squash | rebase. Determina como localizar na branch permanente os commits originados deste PR (ver vic.commit.origem_pr_numero).';
COMMENT ON COLUMN vic.pull_request.qtd_aprovacoes IS
  'Derivado de vic.pull_request_revisao (fonte de verdade). Materializado aqui só para consulta rápida da D8.';

CREATE INDEX ix_pr_mergeado ON vic.pull_request (repositorio_id, mergeado_em DESC)
  WHERE estado = 'mergeado';
CREATE INDEX ix_pr_destino ON vic.pull_request (repositorio_id, branch_destino, mergeado_em DESC);
CREATE INDEX ix_pr_integrador ON vic.pull_request (mergeado_por_usuario_github_id, mergeado_em DESC);
CREATE INDEX ix_pr_autor ON vic.pull_request (autor_usuario_github_id, criado_em DESC);


CREATE TABLE vic.commit (
  repositorio_id              BIGINT      NOT NULL REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  sha                         TEXT        NOT NULL CHECK (sha ~ '^[0-9a-f]{40}$'),
  node_id                     TEXT,
  mensagem                    TEXT,
  assunto                     TEXT        GENERATED ALWAYS AS (
                                  left(split_part(coalesce(mensagem, ''), E'\n', 1), 300)
                              ) STORED,
  autor_nome                  TEXT,
  autor_email                 TEXT,
  autor_data                  TIMESTAMPTZ NOT NULL,
  committer_nome              TEXT,
  committer_email             TEXT,
  committer_data              TIMESTAMPTZ,
  identidade_autor_id         BIGINT      REFERENCES vic.identidade_git(id) ON DELETE SET NULL,
  identidade_committer_id     BIGINT      REFERENCES vic.identidade_git(id) ON DELETE SET NULL,
  usuario_github_autor_id     BIGINT      REFERENCES vic.usuario_github(id) ON DELETE SET NULL,
  usuario_github_committer_id BIGINT      REFERENCES vic.usuario_github(id) ON DELETE SET NULL,
  pessoa_autor_id             BIGINT      REFERENCES vic.pessoa(id) ON DELETE SET NULL,
  pessoa_committer_id         BIGINT      REFERENCES vic.pessoa(id) ON DELETE SET NULL,
  qtd_pais                    SMALLINT    NOT NULL DEFAULT 1 CHECK (qtd_pais >= 0),
  eh_merge                    BOOLEAN     GENERATED ALWAYS AS (qtd_pais > 1) STORED,
  arvore_sha                  TEXT,
  assinatura                  vic.verificacao_assinatura NOT NULL DEFAULT 'nao_assinada',
  assinatura_motivo           TEXT,
  adicoes                     INTEGER,
  delecoes                    INTEGER,
  arquivos_alterados          INTEGER,
  origem_pr_numero            INTEGER,
  coleta_primeira_id          BIGINT      REFERENCES vic.coleta(id) ON DELETE SET NULL,
  coleta_ultima_id            BIGINT      REFERENCES vic.coleta(id) ON DELETE SET NULL,
  registrado_em               TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (repositorio_id, sha)
);
COMMENT ON TABLE  vic.commit IS
  'ENTIDADE DE PRIMEIRA CLASSE. Um commit por repositório, identificado pelo SHA. Responde "quantos" e "quais" commits por pessoa, repositório e período — nenhum volume é guardado apenas agregado. Fato imutável: o SHA não muda; recarregar é UPSERT idempotente.';
COMMENT ON COLUMN vic.commit.sha IS
  'Chave natural. O mesmo SHA pode existir em repositórios distintos (fork/cherry-pick), por isso a PK é composta com repositorio_id.';
COMMENT ON COLUMN vic.commit.autor_email IS
  'E-mail bruto do author do Git, como veio do commit. Preservado para auditoria; a atribuição a pessoa passa por identidade_autor_id.';
COMMENT ON COLUMN vic.commit.pessoa_autor_id IS
  'Pessoa resolvida a partir do AUTHOR. É a coluna oficial de "commits por usuário" — o author sobrevive a rebase, cherry-pick e squash; o committer, não.';
COMMENT ON COLUMN vic.commit.pessoa_committer_id IS
  'Pessoa resolvida a partir do COMMITTER. Usada em métricas de integração/operação, nunca em volume de autoria.';
COMMENT ON COLUMN vic.commit.autor_data IS
  'Data de autoria (quando a mudança foi escrita). É o eixo temporal do volume de commits.';
COMMENT ON COLUMN vic.commit.committer_data IS
  'Data de aplicação. Difere de autor_data em rebase/cherry-pick; é a data que ordena o histórico da branch.';
COMMENT ON COLUMN vic.commit.eh_merge IS
  'TRUE quando qtd_pais > 1. Merges são excluídos do volume de autoria por padrão (não representam trabalho escrito).';
COMMENT ON COLUMN vic.commit.assinatura IS 'D12: somente ''verificada'' satisfaz a exigência de autoria rastreável.';
COMMENT ON COLUMN vic.commit.origem_pr_numero IS
  'D8: PR que trouxe este commit para a branch permanente. Resolvido pela carga via vic.pull_request_commit (merge/rebase) ou por sha_merge_commit (merge commit/squash). NULL em commit de push direto.';
COMMENT ON COLUMN vic.commit.coleta_primeira_id IS 'Coleta que viu o commit pela primeira vez. Nunca é reescrita — permite auditar a latência da coleta.';

CREATE INDEX ix_commit_repo_data     ON vic.commit (repositorio_id, autor_data DESC);
CREATE INDEX ix_commit_pessoa_data   ON vic.commit (pessoa_autor_id, autor_data DESC)
  WHERE pessoa_autor_id IS NOT NULL;
CREATE INDEX ix_commit_repo_pessoa   ON vic.commit (repositorio_id, pessoa_autor_id, autor_data DESC);
CREATE INDEX ix_commit_identidade    ON vic.commit (identidade_autor_id);
CREATE INDEX ix_commit_committer     ON vic.commit (pessoa_committer_id, committer_data DESC);
CREATE INDEX ix_commit_data_brin     ON vic.commit USING brin (autor_data);
CREATE INDEX ix_commit_sem_assinatura ON vic.commit (repositorio_id, autor_data DESC)
  WHERE assinatura <> 'verificada';
CREATE INDEX ix_commit_origem_pr     ON vic.commit (repositorio_id, origem_pr_numero)
  WHERE origem_pr_numero IS NOT NULL;
CREATE INDEX ix_commit_nao_merge     ON vic.commit (repositorio_id, autor_data DESC)
  WHERE qtd_pais <= 1;


CREATE TABLE vic.commit_pai (
  repositorio_id BIGINT   NOT NULL,
  sha            TEXT     NOT NULL,
  ordem          SMALLINT NOT NULL CHECK (ordem >= 1),
  sha_pai        TEXT     NOT NULL CHECK (sha_pai ~ '^[0-9a-f]{40}$'),
  PRIMARY KEY (repositorio_id, sha, ordem),
  FOREIGN KEY (repositorio_id, sha) REFERENCES vic.commit(repositorio_id, sha) ON DELETE CASCADE
);
COMMENT ON TABLE  vic.commit_pai IS
  'Arestas do DAG. Permite caminhar por first-parent (ordem = 1) e distinguir o lado integrado de um merge.';
COMMENT ON COLUMN vic.commit_pai.sha_pai IS
  'Sem FK de propósito: o pai pode estar fora da janela coletada (clone raso/histórico truncado) sem invalidar o filho.';

CREATE INDEX ix_commit_pai_reverso ON vic.commit_pai (repositorio_id, sha_pai);


CREATE TABLE vic.commit_arquivo (
  repositorio_id   BIGINT  NOT NULL,
  sha              TEXT    NOT NULL,
  caminho          TEXT    NOT NULL,
  status           vic.status_arquivo_commit NOT NULL,
  extensao         TEXT    GENERATED ALWAYS AS (vic.extensao_de(caminho)) STORED,
  tamanho_bytes    BIGINT,
  blob_sha         TEXT,
  adicoes          INTEGER,
  delecoes         INTEGER,
  caminho_anterior TEXT,
  PRIMARY KEY (repositorio_id, sha, caminho),
  FOREIGN KEY (repositorio_id, sha) REFERENCES vic.commit(repositorio_id, sha) ON DELETE CASCADE
);
COMMENT ON TABLE  vic.commit_arquivo IS
  'D12: arquivos tocados por commit. Guarda a violação HISTÓRICA (arquivo proibido que entrou e depois saiu) — o estado atual da árvore fica em vic.snapshot_blob_irregular.';
COMMENT ON COLUMN vic.commit_arquivo.extensao IS 'Derivada do caminho pelo banco; cruzada com vic.extensao_proibida.';

CREATE INDEX ix_commit_arquivo_extensao ON vic.commit_arquivo (extensao)
  WHERE extensao IS NOT NULL;
CREATE INDEX ix_commit_arquivo_tamanho ON vic.commit_arquivo (repositorio_id, tamanho_bytes DESC)
  WHERE tamanho_bytes IS NOT NULL;


CREATE TABLE vic.commit_branch (
  repositorio_id         BIGINT      NOT NULL,
  branch_nome            TEXT        NOT NULL,
  sha                    TEXT        NOT NULL,
  primeira_observacao_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  ultima_observacao_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  coleta_primeira_id     BIGINT      REFERENCES vic.coleta(id) ON DELETE SET NULL,
  PRIMARY KEY (repositorio_id, branch_nome, sha),
  FOREIGN KEY (repositorio_id, sha) REFERENCES vic.commit(repositorio_id, sha) ON DELETE CASCADE,
  FOREIGN KEY (repositorio_id, branch_nome) REFERENCES vic.branch(repositorio_id, nome) ON DELETE CASCADE
);
COMMENT ON TABLE vic.commit_branch IS
  'Alcançabilidade observada: o commit foi visto acessível a partir desta branch. Associação de vida longa (com primeira/última observação), não snapshot por coleta — gravar a lista completa a cada coleta multiplicaria o histórico sem ganho analítico.';

CREATE INDEX ix_commit_branch_sha ON vic.commit_branch (repositorio_id, sha);


CREATE TABLE vic.pull_request_commit (
  repositorio_id BIGINT  NOT NULL,
  pr_numero      INTEGER NOT NULL,
  sha            TEXT    NOT NULL CHECK (sha ~ '^[0-9a-f]{40}$'),
  ordem          INTEGER,
  PRIMARY KEY (repositorio_id, pr_numero, sha),
  FOREIGN KEY (repositorio_id, pr_numero)
    REFERENCES vic.pull_request(repositorio_id, numero) ON DELETE CASCADE
);
COMMENT ON TABLE  vic.pull_request_commit IS
  'Commits que compunham o PR. Base para resolver vic.commit.origem_pr_numero (D8).';
COMMENT ON COLUMN vic.pull_request_commit.sha IS
  'Sem FK para vic.commit: após squash, os commits originais deixam de ser alcançáveis por qualquer branch e não são coletados, mas o vínculo continua sendo evidência válida.';

CREATE INDEX ix_pr_commit_sha ON vic.pull_request_commit (repositorio_id, sha);


CREATE TABLE vic.pull_request_revisao (
  id_github                BIGINT      PRIMARY KEY,
  node_id                  TEXT        UNIQUE,
  repositorio_id           BIGINT      NOT NULL,
  pr_numero                INTEGER     NOT NULL,
  revisor_usuario_github_id BIGINT     REFERENCES vic.usuario_github(id) ON DELETE SET NULL,
  estado                   vic.estado_revisao NOT NULL,
  corpo                    TEXT,
  sha_commit               TEXT,
  submetida_em             TIMESTAMPTZ,
  FOREIGN KEY (repositorio_id, pr_numero)
    REFERENCES vic.pull_request(repositorio_id, numero) ON DELETE CASCADE
);
COMMENT ON TABLE vic.pull_request_revisao IS
  'D8: cada evento de revisão. Fato imutável — uma aprovação dada e depois descartada continua registrada, com o descarte como novo evento.';

CREATE INDEX ix_pr_revisao_pr ON vic.pull_request_revisao (repositorio_id, pr_numero, estado);
CREATE INDEX ix_pr_revisao_revisor ON vic.pull_request_revisao (revisor_usuario_github_id, submetida_em DESC);


CREATE TABLE vic.verificacao_commit (
  repositorio_id         BIGINT      NOT NULL,
  sha                    TEXT        NOT NULL,
  origem                 vic.origem_verificacao NOT NULL,
  identificador_externo  TEXT        NOT NULL,
  nome                   TEXT        NOT NULL,
  conclusao              vic.conclusao_verificacao NOT NULL,
  aplicacao              TEXT,
  iniciada_em            TIMESTAMPTZ,
  concluida_em           TIMESTAMPTZ,
  url_detalhe            TEXT,
  coleta_ultima_id       BIGINT      REFERENCES vic.coleta(id) ON DELETE SET NULL,
  PRIMARY KEY (repositorio_id, sha, origem, identificador_externo),
  FOREIGN KEY (repositorio_id, sha) REFERENCES vic.commit(repositorio_id, sha) ON DELETE CASCADE
);
COMMENT ON TABLE  vic.verificacao_commit IS
  'D1: resultado de cada check run / commit status do commit. A lista do que é OBRIGATÓRIO não está aqui — vem de vic.snapshot_protecao_check, porque a exigência muda com o tempo.';
COMMENT ON COLUMN vic.verificacao_commit.identificador_externo IS
  'check_run.id para check runs; o context para commit status (o último estado de cada context vence no UPSERT).';
COMMENT ON COLUMN vic.verificacao_commit.nome IS
  'Nome do check / context. É por este texto que se casa com o contexto obrigatório da proteção de branch.';

CREATE INDEX ix_verificacao_nome ON vic.verificacao_commit (repositorio_id, nome, conclusao);


CREATE TABLE vic.tag (
  repositorio_id          BIGINT      NOT NULL REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  nome                    TEXT        NOT NULL,
  tipo                    vic.tipo_tag NOT NULL DEFAULT 'leve',
  sha_commit              TEXT        NOT NULL CHECK (sha_commit ~ '^[0-9a-f]{40}$'),
  sha_objeto              TEXT,
  mensagem                TEXT,
  tagueador_nome          TEXT,
  tagueador_email         TEXT,
  tagueada_em             TIMESTAMPTZ,
  identidade_tagueador_id BIGINT      REFERENCES vic.identidade_git(id) ON DELETE SET NULL,
  semver_valida           BOOLEAN     GENERATED ALWAYS AS (vic.eh_semver(nome)) STORED,
  vec_valida              BOOLEAN     GENERATED ALWAYS AS (vic.eh_vec(nome)) STORED,
  major                   INTEGER     GENERATED ALWAYS AS (
                              nullif(substring(nome from '^[vV]?([0-9]+)\.'), '')::INTEGER
                          ) STORED,
  minor                   INTEGER     GENERATED ALWAYS AS (
                              nullif(substring(nome from '^[vV]?[0-9]+\.([0-9]+)'), '')::INTEGER
                          ) STORED,
  patch                   INTEGER     GENERATED ALWAYS AS (
                              nullif(substring(nome from '^[vV]?[0-9]+\.[0-9]+\.([0-9]+)'), '')::INTEGER
                          ) STORED,
  build                   INTEGER     GENERATED ALWAYS AS (
                              nullif(substring(nome from '^[vV]?[0-9]+\.[0-9]+\.[0-9]+\.([0-9]+)'), '')::INTEGER
                          ) STORED,
  de_producao             BOOLEAN     NOT NULL DEFAULT FALSE,
  coleta_primeira_id      BIGINT      REFERENCES vic.coleta(id) ON DELETE SET NULL,
  PRIMARY KEY (repositorio_id, nome)
);
COMMENT ON TABLE  vic.tag IS
  'D9/D10/D11: tags do repositório, com a conformidade SemVer/VEC calculada pelo banco no momento da gravação.';
COMMENT ON COLUMN vic.tag.de_producao IS
  'D1/D10: TRUE quando a tag identifica uma versão promovida a produção — definido pela carga (commit alcançável pela branch permanente e/ou publicação de release não pré-lançamento).';
COMMENT ON COLUMN vic.tag.build IS 'D10: quarto componente do Padrão VEC. NULL em tag apenas SemVer.';

CREATE INDEX ix_tag_repo_data ON vic.tag (repositorio_id, tagueada_em DESC);
CREATE INDEX ix_tag_commit ON vic.tag (repositorio_id, sha_commit);
CREATE INDEX ix_tag_nao_conforme ON vic.tag (repositorio_id)
  WHERE NOT vic.eh_semver(nome);
CREATE INDEX ix_tag_producao ON vic.tag (repositorio_id, tagueada_em DESC)
  WHERE de_producao;


CREATE TABLE vic.nota_versao (
  repositorio_id          BIGINT      NOT NULL REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  id_github               BIGINT      NOT NULL,
  node_id                 TEXT        UNIQUE,
  tag_nome                TEXT        NOT NULL,
  titulo                  TEXT,
  corpo                   TEXT,
  corpo_preenchido        BOOLEAN     GENERATED ALWAYS AS (btrim(coalesce(corpo, '')) <> '') STORED,
  rascunho                BOOLEAN     NOT NULL DEFAULT FALSE,
  pre_lancamento          BOOLEAN     NOT NULL DEFAULT FALSE,
  criada_em               TIMESTAMPTZ,
  publicada_em            TIMESTAMPTZ,
  autor_usuario_github_id BIGINT      REFERENCES vic.usuario_github(id) ON DELETE SET NULL,
  PRIMARY KEY (repositorio_id, id_github),
  UNIQUE (repositorio_id, tag_nome)
);
COMMENT ON TABLE  vic.nota_versao IS
  'D13: nota de versão (release do GitHub). Sem FK para vic.tag: a release pode apontar para tag fora da janela coletada.';
COMMENT ON COLUMN vic.nota_versao.corpo_preenchido IS
  'D13: indicador direto — a nota existe e não está vazia. Calculado pelo banco.';

CREATE INDEX ix_nota_versao_publicada ON vic.nota_versao (repositorio_id, publicada_em DESC);


CREATE TABLE vic.evento_push (
  id                BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  chave_evento      TEXT        NOT NULL UNIQUE,
  repositorio_id    BIGINT      NOT NULL REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  ref               TEXT        NOT NULL,
  branch_nome       TEXT,
  sha_antes         TEXT,
  sha_depois        TEXT,
  forcado           BOOLEAN     NOT NULL DEFAULT FALSE,
  criou_ref         BOOLEAN     NOT NULL DEFAULT FALSE,
  removeu_ref       BOOLEAN     NOT NULL DEFAULT FALSE,
  qtd_commits       INTEGER,
  usuario_github_id BIGINT      REFERENCES vic.usuario_github(id) ON DELETE SET NULL,
  ocorrido_em       TIMESTAMPTZ NOT NULL
);
COMMENT ON TABLE  vic.evento_push IS
  'D7/D12: pushes captados no audit log/webhook. Evidência direta de push direto e de force-push em branch permanente — o que a proteção deveria impedir.';
COMMENT ON COLUMN vic.evento_push.chave_evento IS
  'Chave natural do evento na origem (id do audit log ou X-GitHub-Delivery). Garante idempotência do reprocessamento.';

CREATE INDEX ix_evento_push_repo ON vic.evento_push (repositorio_id, ocorrido_em DESC);
CREATE INDEX ix_evento_push_branch ON vic.evento_push (repositorio_id, branch_nome, ocorrido_em DESC);


-- =============================================================================
-- 6. ESTADOS MUTÁVEIS — SNAPSHOTS DATADOS
--
-- Tudo aqui é "como estava no dia X". A PK sempre começa por coleta_id:
-- reprocessar a mesma coleta sobrescreve; coletas diferentes acumulam série.
-- =============================================================================

CREATE TABLE vic.snapshot_repositorio (
  coleta_id                           BIGINT  NOT NULL REFERENCES vic.coleta(id) ON DELETE CASCADE,
  repositorio_id                      BIGINT  NOT NULL REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  data_referencia                     DATE    NOT NULL,
  possui_main                         BOOLEAN NOT NULL DEFAULT FALSE,
  possui_develop                      BOOLEAN NOT NULL DEFAULT FALSE,
  main_protegida                      BOOLEAN NOT NULL DEFAULT FALSE,
  develop_protegida                   BOOLEAN NOT NULL DEFAULT FALSE,
  modelo_flow                         vic.modelo_flow NOT NULL DEFAULT 'indefinido',
  qtd_branches                        INTEGER NOT NULL DEFAULT 0,
  qtd_branches_temporarias            INTEGER NOT NULL DEFAULT 0,
  qtd_branches_mergeadas_nao_removidas INTEGER NOT NULL DEFAULT 0,
  idade_max_branch_obsoleta_dias      INTEGER,
  qtd_tags                            INTEGER NOT NULL DEFAULT 0,
  qtd_releases                        INTEGER NOT NULL DEFAULT 0,
  qtd_blobs_irregulares               INTEGER NOT NULL DEFAULT 0,
  qtd_commits_periodo                 INTEGER,
  ultimo_commit_em                    TIMESTAMPTZ,
  PRIMARY KEY (coleta_id, repositorio_id)
);
COMMENT ON TABLE  vic.snapshot_repositorio IS
  'Fotografia do repositório na data da coleta. Alimenta D2 (flow), D3 (sanitização) e o painel de evolução por repositório.';
COMMENT ON COLUMN vic.snapshot_repositorio.data_referencia IS
  'Repetido de vic.coleta de propósito: evita join em toda consulta de série e permite particionar por data no futuro.';
COMMENT ON COLUMN vic.snapshot_repositorio.idade_max_branch_obsoleta_dias IS
  'D3: idade da branch mergeada e não deletada mais antiga, em dias. NULL quando não há nenhuma.';


CREATE TABLE vic.snapshot_branch (
  coleta_id             BIGINT  NOT NULL REFERENCES vic.coleta(id) ON DELETE CASCADE,
  repositorio_id        BIGINT  NOT NULL,
  branch_nome           TEXT    NOT NULL,
  data_referencia       DATE    NOT NULL,
  existe                BOOLEAN NOT NULL DEFAULT TRUE,
  sha_head              TEXT,
  branch_base           TEXT,
  sha_merge_base        TEXT,
  data_merge_base       TIMESTAMPTZ,
  dias_desde_merge_base INTEGER,
  ahead_by              INTEGER,
  behind_by             INTEGER,
  data_primeiro_commit  TIMESTAMPTZ,
  dias_vida_total       INTEGER,
  mergeada              BOOLEAN NOT NULL DEFAULT FALSE,
  ahead_contra_main     INTEGER,
  ahead_contra_develop  INTEGER,
  nivel_faixa_sync      SMALLINT CHECK (nivel_faixa_sync BETWEEN 1 AND 4),
  nivel_faixa_ahead     SMALLINT CHECK (nivel_faixa_ahead BETWEEN 1 AND 4),
  nivel_faixa_vida      SMALLINT CHECK (nivel_faixa_vida BETWEEN 1 AND 4),
  PRIMARY KEY (coleta_id, repositorio_id, branch_nome),
  FOREIGN KEY (repositorio_id, branch_nome)
    REFERENCES vic.branch(repositorio_id, nome) ON DELETE CASCADE,
  CHECK (ahead_by IS NULL OR ahead_by >= 0),
  CHECK (behind_by IS NULL OR behind_by >= 0)
);
COMMENT ON TABLE  vic.snapshot_branch IS
  'D3/D4/D5: divergência da branch na data da coleta. É O estado mutável por excelência — a mesma branch tem um valor diferente a cada dia, e a maturidade é a curva desses valores, não o último ponto.';
COMMENT ON COLUMN vic.snapshot_branch.data_merge_base IS
  'Data do merge-base com a branch base (compare.merge_base_commit.commit.committer.date). Origem da medida canônica da D4.';
COMMENT ON COLUMN vic.snapshot_branch.dias_desde_merge_base IS
  'MEDIDA CANÔNICA DA D4: dias desde o último alinhamento com a linha principal. Preferida sobre contagem de commits, que um squash reduz sem reduzir a divergência real. Calculada na carga (a conversão timestamptz->date depende de fuso e não pode ser coluna gerada).';
COMMENT ON COLUMN vic.snapshot_branch.ahead_by IS
  'Commits na temporária ainda não integrados — mede o TAMANHO DO LOTE. Limite próprio, distinto do behind.';
COMMENT ON COLUMN vic.snapshot_branch.behind_by IS
  'Commits da linha principal ainda não incorporados — mede RISCO DE CONFLITO. Não se aplica a release/* e hotfix/*, que divergem por desenho.';
COMMENT ON COLUMN vic.snapshot_branch.dias_vida_total IS
  'Dias entre o primeiro commit exclusivo e a data de referência. Limite obrigatório para release/* (<=10) e hotfix/* (<=3).';
COMMENT ON COLUMN vic.snapshot_branch.ahead_contra_main IS
  'D5: commits da branch ausentes na main. Zero no encerramento = merge back completo.';
COMMENT ON COLUMN vic.snapshot_branch.ahead_contra_develop IS
  'D5: commits da branch ausentes na develop. Zero no encerramento = merge back completo.';

CREATE INDEX ix_snapshot_branch_data ON vic.snapshot_branch (data_referencia, repositorio_id);
CREATE INDEX ix_snapshot_branch_serie ON vic.snapshot_branch (repositorio_id, branch_nome, data_referencia DESC);
CREATE INDEX ix_snapshot_branch_divergencia ON vic.snapshot_branch (data_referencia, dias_desde_merge_base DESC)
  WHERE existe;


CREATE TABLE vic.snapshot_protecao_branch (
  coleta_id                      BIGINT  NOT NULL REFERENCES vic.coleta(id) ON DELETE CASCADE,
  repositorio_id                 BIGINT  NOT NULL,
  branch_nome                    TEXT    NOT NULL,
  data_referencia                DATE    NOT NULL,
  protegida                      BOOLEAN NOT NULL DEFAULT FALSE,
  push_direto_bloqueado          BOOLEAN NOT NULL DEFAULT FALSE,
  pr_obrigatorio                 BOOLEAN NOT NULL DEFAULT FALSE,
  revisoes_minimas               SMALLINT NOT NULL DEFAULT 0 CHECK (revisoes_minimas >= 0),
  descartar_aprovacoes_obsoletas BOOLEAN NOT NULL DEFAULT FALSE,
  exigir_code_owners             BOOLEAN NOT NULL DEFAULT FALSE,
  exigir_status_checks           BOOLEAN NOT NULL DEFAULT FALSE,
  status_checks_estritos         BOOLEAN NOT NULL DEFAULT FALSE,
  exigir_conversas_resolvidas    BOOLEAN NOT NULL DEFAULT FALSE,
  exigir_assinatura_commits      BOOLEAN NOT NULL DEFAULT FALSE,
  force_push_bloqueado           BOOLEAN NOT NULL DEFAULT FALSE,
  delecao_bloqueada              BOOLEAN NOT NULL DEFAULT FALSE,
  restricao_conclusao_ativa      BOOLEAN NOT NULL DEFAULT FALSE,
  aplica_a_administradores       BOOLEAN NOT NULL DEFAULT FALSE,
  protecao_efetiva               BOOLEAN GENERATED ALWAYS AS (
                                     protegida
                                 AND push_direto_bloqueado
                                 AND pr_obrigatorio
                                 AND revisoes_minimas >= 1
                                 AND exigir_status_checks
                                 ) STORED,
  PRIMARY KEY (coleta_id, repositorio_id, branch_nome),
  FOREIGN KEY (repositorio_id, branch_nome)
    REFERENCES vic.branch(repositorio_id, nome) ON DELETE CASCADE
);
COMMENT ON TABLE  vic.snapshot_protecao_branch IS
  'D7: regras de proteção vigentes na data da coleta. Snapshot porque a proteção é alterável a qualquer momento — e o histórico é justamente o que prova governança contínua.';
COMMENT ON COLUMN vic.snapshot_protecao_branch.protecao_efetiva IS
  'D7: conjunção mínima exigida — protegida + push direto bloqueado + PR obrigatório + ao menos 1 revisão + status checks obrigatórios.';
COMMENT ON COLUMN vic.snapshot_protecao_branch.restricao_conclusao_ativa IS
  'D6/D8: existe restrição de quem pode concluir o merge (lista de integradores). Sem isto, a completude não é exclusiva do Integrador.';


CREATE TABLE vic.snapshot_protecao_check (
  coleta_id      BIGINT NOT NULL,
  repositorio_id BIGINT NOT NULL,
  branch_nome    TEXT   NOT NULL,
  contexto       TEXT   NOT NULL,
  aplicacao_id   BIGINT,
  PRIMARY KEY (coleta_id, repositorio_id, branch_nome, contexto),
  FOREIGN KEY (coleta_id, repositorio_id, branch_nome)
    REFERENCES vic.snapshot_protecao_branch(coleta_id, repositorio_id, branch_nome) ON DELETE CASCADE
);
COMMENT ON TABLE vic.snapshot_protecao_check IS
  'D1: contextos de status check OBRIGATÓRIOS na data da coleta. Uma tag antiga deve ser avaliada contra a exigência da época, não contra a de hoje.';


CREATE TABLE vic.snapshot_blob_irregular (
  coleta_id      BIGINT NOT NULL REFERENCES vic.coleta(id) ON DELETE CASCADE,
  repositorio_id BIGINT NOT NULL REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  branch_nome    TEXT   NOT NULL,
  caminho        TEXT   NOT NULL,
  blob_sha       TEXT,
  tamanho_bytes  BIGINT NOT NULL DEFAULT 0,
  extensao       TEXT   GENERATED ALWAYS AS (vic.extensao_de(caminho)) STORED,
  motivo         TEXT   NOT NULL
                 CHECK (motivo IN ('extensao_proibida', 'tamanho_excedido', 'ambos')),
  PRIMARY KEY (coleta_id, repositorio_id, branch_nome, caminho)
);
COMMENT ON TABLE vic.snapshot_blob_irregular IS
  'D12: arquivos da árvore da branch que violam formato ou tamanho na data da coleta. Só as violações são gravadas — a árvore inteira seria volume sem uso analítico.';


-- =============================================================================
-- 7. DIRETRIZES, INDICADORES E POLÍTICA DE MATURIDADE
-- =============================================================================

CREATE TABLE vic.diretriz (
  codigo     TEXT     PRIMARY KEY CHECK (codigo ~ '^D([1-9]|1[0-3])$'),
  numero     SMALLINT NOT NULL UNIQUE CHECK (numero BETWEEN 1 AND 13),
  titulo     TEXT     NOT NULL,
  resumo     TEXT,
  url_pagina TEXT
);
COMMENT ON TABLE vic.diretriz IS 'As 13 diretrizes normativas do Modelo VIC.';


CREATE TABLE vic.indicador (
  codigo          TEXT    PRIMARY KEY,
  diretriz_codigo TEXT    NOT NULL REFERENCES vic.diretriz(codigo) ON DELETE CASCADE,
  nome            TEXT    NOT NULL,
  descricao       TEXT,
  unidade         TEXT    NOT NULL DEFAULT 'percentual'
                  CHECK (unidade IN ('percentual', 'contagem', 'dias', 'razao')),
  melhor_sentido  TEXT    NOT NULL DEFAULT 'maior'
                  CHECK (melhor_sentido IN ('maior', 'menor')),
  granularidade   TEXT    NOT NULL DEFAULT 'repositorio'
                  CHECK (granularidade IN ('organizacao', 'repositorio', 'branch', 'pessoa')),
  formula         TEXT,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE  vic.indicador IS 'Catálogo dos indicadores. Uma diretriz pode ter mais de um (D4 tem três dimensões independentes).';
COMMENT ON COLUMN vic.indicador.melhor_sentido IS '''maior'' para percentuais de conformidade; ''menor'' para dias e contagens de divergência.';


CREATE TABLE vic.faixa_maturidade (
  indicador_codigo TEXT     NOT NULL REFERENCES vic.indicador(codigo) ON DELETE CASCADE,
  nivel            SMALLINT NOT NULL CHECK (nivel BETWEEN 1 AND 4),
  rotulo           TEXT     NOT NULL,
  limite_min       NUMERIC,
  limite_max       NUMERIC,
  PRIMARY KEY (indicador_codigo, nivel),
  CHECK (limite_min IS NOT NULL OR limite_max IS NOT NULL)
);
COMMENT ON TABLE  vic.faixa_maturidade IS
  'Faixas 1 Inicial, 2 Gerenciado, 3 Definido (meta institucional), 4 Otimizado. Para indicadores "menor é melhor" usa-se limite_max; para percentuais, limite_min.';


CREATE TABLE vic.politica_indicador (
  id               BIGINT   GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  indicador_codigo TEXT     NOT NULL REFERENCES vic.indicador(codigo) ON DELETE CASCADE,
  organizacao_id   BIGINT   REFERENCES vic.organizacao(id) ON DELETE CASCADE,
  repositorio_id   BIGINT   REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  nivel_vigente    SMALLINT NOT NULL CHECK (nivel_vigente BETWEEN 1 AND 4),
  vigente_desde    DATE     NOT NULL,
  vigente_ate      DATE,
  aprovado_por     TEXT,
  observacao       TEXT,
  CHECK (vigente_ate IS NULL OR vigente_ate >= vigente_desde)
);
COMMENT ON TABLE  vic.politica_indicador IS
  'D4: faixa VIGENTE por escopo e período. A governança avança uma faixa por trimestre; o histórico fica aqui para que uma medição antiga seja lida contra a exigência da época.';
COMMENT ON COLUMN vic.politica_indicador.repositorio_id IS
  'NULL = política da organização. Preenchido = exceção autorizada para um repositório.';

CREATE UNIQUE INDEX uq_politica_indicador
  ON vic.politica_indicador (
       indicador_codigo, coalesce(repositorio_id, 0), coalesce(organizacao_id, 0), vigente_desde);


CREATE TABLE vic.extensao_proibida (
  extensao    TEXT    PRIMARY KEY CHECK (extensao = lower(extensao)),
  descricao   TEXT,
  ativa       BOOLEAN NOT NULL DEFAULT TRUE,
  definida_em DATE    NOT NULL DEFAULT CURRENT_DATE
);
COMMENT ON TABLE vic.extensao_proibida IS
  'D12: lista normativa de extensões não versionáveis. Tabela, não constante no código: a lista é revisável pela governança sem alterar o coletor.';


CREATE TABLE vic.parametro_politica (
  chave       TEXT        PRIMARY KEY,
  valor       TEXT        NOT NULL,
  descricao   TEXT,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE vic.parametro_politica IS
  'Parâmetros numéricos das diretrizes (ex.: tamanho máximo de arquivo da D12), versionáveis sem alterar o esquema.';


CREATE TABLE vic.medicao_indicador (
  id               BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  coleta_id        BIGINT      NOT NULL REFERENCES vic.coleta(id) ON DELETE CASCADE,
  indicador_codigo TEXT        NOT NULL REFERENCES vic.indicador(codigo) ON DELETE CASCADE,
  data_referencia  DATE        NOT NULL,
  organizacao_id   BIGINT      NOT NULL REFERENCES vic.organizacao(id) ON DELETE CASCADE,
  repositorio_id   BIGINT      REFERENCES vic.repositorio(id) ON DELETE CASCADE,
  numerador        NUMERIC,
  denominador      NUMERIC,
  valor            NUMERIC,
  situacao         vic.situacao_conformidade NOT NULL DEFAULT 'sem_dados',
  nivel_maturidade SMALLINT    CHECK (nivel_maturidade BETWEEN 1 AND 4),
  nivel_exigido    SMALLINT    CHECK (nivel_exigido BETWEEN 1 AND 4),
  detalhe          JSONB       NOT NULL DEFAULT '{}'::JSONB,
  calculada_em     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (denominador IS NULL OR denominador >= 0)
);
COMMENT ON TABLE  vic.medicao_indicador IS
  'Série temporal dos indicadores. É resultado, não fonte: todo valor aqui é reconstruível a partir dos fatos e snapshots — o que permite recalcular o histórico quando uma regra muda.';
COMMENT ON COLUMN vic.medicao_indicador.repositorio_id IS 'NULL = medição consolidada da organização.';
COMMENT ON COLUMN vic.medicao_indicador.detalhe IS
  'Contexto de apuração (percentis, limites aplicados, itens avaliados). Evita criar coluna nova para cada indicador.';

CREATE UNIQUE INDEX uq_medicao_indicador
  ON vic.medicao_indicador (coleta_id, indicador_codigo, coalesce(repositorio_id, 0));
CREATE INDEX ix_medicao_serie ON vic.medicao_indicador (indicador_codigo, data_referencia DESC);
CREATE INDEX ix_medicao_repo ON vic.medicao_indicador (repositorio_id, data_referencia DESC);


CREATE TABLE vic.ocorrencia_nao_conformidade (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  medicao_id   BIGINT NOT NULL REFERENCES vic.medicao_indicador(id) ON DELETE CASCADE,
  tipo_objeto  TEXT   NOT NULL
               CHECK (tipo_objeto IN ('repositorio', 'branch', 'commit', 'tag',
                                      'pull_request', 'nota_versao', 'arquivo', 'pessoa')),
  chave_objeto TEXT   NOT NULL,
  descricao    TEXT   NOT NULL,
  gravidade    vic.gravidade NOT NULL DEFAULT 'media',
  UNIQUE (medicao_id, tipo_objeto, chave_objeto)
);
COMMENT ON TABLE vic.ocorrencia_nao_conformidade IS
  'Evidência granular por trás de cada medição: qual branch, qual tag, qual commit reprovou. Sem isto o indicador é um número sem plano de ação.';


-- =============================================================================
-- 8. INTEGRIDADE DELIBERADAMENTE NÃO DECLARADA
--
-- Três vínculos existem no modelo sem FOREIGN KEY, sempre pelo mesmo motivo:
-- a JANELA DE COLETA. O objeto referenciado pode ser legítimo e simplesmente
-- estar fora do recorte carregado; uma FK transformaria isso em erro de carga.
--
--   vic.commit_pai.sha_pai        -> o pai pode estar além do histórico coletado
--   vic.pull_request_commit.sha   -> após squash, o commit original deixa de ser
--                                    alcançável e não é coletado
--   vic.commit.origem_pr_numero   -> carga incremental de PR com histórico de
--                                    commit completo
--
-- Em todos os casos há índice para o join e a consistência é verificada pela
-- consulta de auditoria abaixo, executada ao fim de cada coleta.
-- =============================================================================

CREATE OR REPLACE VIEW vic.vw_auditoria_referencia_orfa AS
SELECT 'commit.origem_pr_numero' AS vinculo,
       c.repositorio_id,
       c.sha        AS chave,
       c.origem_pr_numero::TEXT AS referencia
FROM vic.commit c
LEFT JOIN vic.pull_request pr
       ON pr.repositorio_id = c.repositorio_id
      AND pr.numero = c.origem_pr_numero
WHERE c.origem_pr_numero IS NOT NULL
  AND pr.numero IS NULL
UNION ALL
SELECT 'commit_pai.sha_pai',
       cp.repositorio_id,
       cp.sha,
       cp.sha_pai
FROM vic.commit_pai cp
LEFT JOIN vic.commit c
       ON c.repositorio_id = cp.repositorio_id
      AND c.sha = cp.sha_pai
WHERE c.sha IS NULL;

COMMENT ON VIEW vic.vw_auditoria_referencia_orfa IS
  'Referências apontando para objetos ausentes. Esperado > 0 em carga incremental; deve ser 0 após coleta completa.';


-- =============================================================================
-- 9. VISÕES DE CONSULTA
-- =============================================================================

CREATE OR REPLACE VIEW vic.vw_commit_autoria AS
SELECT
  c.repositorio_id,
  r.nome_completo                                   AS repositorio,
  r.sistema,
  r.modulo,
  c.sha,
  left(c.sha, 8)                                    AS sha_curto,
  c.assunto,
  c.autor_data,
  c.committer_data,
  c.eh_merge,
  c.assinatura,
  c.adicoes,
  c.delecoes,
  c.arquivos_alterados,
  c.origem_pr_numero,
  c.autor_nome,
  c.autor_email,
  ig.email_normalizado                              AS autor_email_normalizado,
  ig.metodo_resolucao                               AS metodo_resolucao_autor,
  ig.confianca                                      AS confianca_resolucao,
  p.id                                              AS pessoa_id,
  p.nome_completo                                   AS pessoa_nome,
  p.eh_robo,
  ug.login                                          AS login_github,
  (p.id IS NOT NULL)                                AS autoria_resolvida
FROM vic.commit c
JOIN vic.repositorio r ON r.id = c.repositorio_id
LEFT JOIN vic.identidade_git ig ON ig.id = c.identidade_autor_id
LEFT JOIN vic.pessoa p ON p.id = c.pessoa_autor_id
LEFT JOIN vic.usuario_github ug ON ug.id = c.usuario_github_autor_id;

COMMENT ON VIEW vic.vw_commit_autoria IS
  'Commit já resolvido a pessoa e repositório. Ponto de entrada padrão para "quais commits, por usuário e por repositório".';


CREATE OR REPLACE VIEW vic.vw_identidade_pendente_curadoria AS
SELECT
  ig.id,
  ig.email,
  ig.nome_observado,
  ig.metodo_resolucao,
  ig.confianca,
  ig.qtd_commits_observados,
  ig.primeira_ocorrencia_em,
  ig.ultima_ocorrencia_em
FROM vic.identidade_git ig
WHERE ig.pessoa_id IS NULL
   OR ig.confianca < 0.80
ORDER BY ig.qtd_commits_observados DESC;

COMMENT ON VIEW vic.vw_identidade_pendente_curadoria IS
  'Fila de curadoria de identidade, ordenada por impacto. Enquanto houver e-mail relevante aqui, "commits por usuário" está subestimado.';


CREATE OR REPLACE VIEW vic.vw_ultima_coleta AS
SELECT DISTINCT ON (organizacao_id) *
FROM vic.coleta
WHERE status IN ('concluida', 'parcial')
ORDER BY organizacao_id, data_referencia DESC, id DESC;

COMMENT ON VIEW vic.vw_ultima_coleta IS 'Coleta válida mais recente por organização — base dos painéis "hoje".';


CREATE MATERIALIZED VIEW vic.mv_commit_dia AS
SELECT
  c.repositorio_id,
  (c.autor_data AT TIME ZONE 'America/Sao_Paulo')::DATE AS dia,
  COALESCE(c.pessoa_autor_id, 0)                        AS pessoa_id,
  count(*) FILTER (WHERE NOT c.eh_merge)                AS qtd_commits,
  count(*) FILTER (WHERE c.eh_merge)                    AS qtd_merges,
  COALESCE(sum(c.adicoes) FILTER (WHERE NOT c.eh_merge), 0)  AS adicoes,
  COALESCE(sum(c.delecoes) FILTER (WHERE NOT c.eh_merge), 0) AS delecoes
FROM vic.commit c
GROUP BY 1, 2, 3;

COMMENT ON MATERIALIZED VIEW vic.mv_commit_dia IS
  'Agregado de conveniência do volume diário por pessoa e repositório (pessoa_id = 0 significa autoria não resolvida). É cache, não fonte: vic.commit continua sendo o fato. REFRESH MATERIALIZED VIEW CONCURRENTLY vic.mv_commit_dia; ao fim de cada coleta.';

CREATE UNIQUE INDEX uq_mv_commit_dia ON vic.mv_commit_dia (repositorio_id, dia, pessoa_id);
CREATE INDEX ix_mv_commit_dia_pessoa ON vic.mv_commit_dia (pessoa_id, dia DESC);


-- =============================================================================
-- 10. CARGA NORMATIVA (diretrizes, indicadores, faixas e políticas)
-- =============================================================================

INSERT INTO vic.diretriz (codigo, numero, titulo, url_pagina) VALUES
  ('D1',  1,  'Versões promovidas para produção devem ser efetivamente testadas e validadas', 'diretriz-1.html'),
  ('D2',  2,  'O modelo de flow adotado deve ser aderente ao GitFlow ou GitHub Flow',         'diretriz-2.html'),
  ('D3',  3,  'A integração do código deve ser contínua, com sanitização dos repositórios',   'diretriz-3.html'),
  ('D4',  4,  'As branches protegidas devem apresentar baixo índice de divergência',          'diretriz-4.html'),
  ('D5',  5,  'A sincronização entre branches principais deve ser garantida a cada ciclo',    'diretriz-5.html'),
  ('D6',  6,  'O papel de Integrador deve ser exercido de forma efetiva',                     'diretriz-6.html'),
  ('D7',  7,  'As branches permanentes devem ser protegidas',                                 'diretriz-7.html'),
  ('D8',  8,  'Pull Request deve ser o instrumento central de integração e validação',        'diretriz-8.html'),
  ('D9',  9,  'O versionamento semântico deve ser adotado em todos os elementos da versão',   'diretriz-9.html'),
  ('D10', 10, 'O tagueamento deve ser formalizado para commits de produção (Padrão VEC)',     'diretriz-10.html'),
  ('D11', 11, 'Repositórios, branches e versões devem apresentar padrões de nomenclatura',    'diretriz-11.html'),
  ('D12', 12, 'Formato, tamanho e autoria devem aderir às políticas de push',                 'diretriz-12.html'),
  ('D13', 13, 'Cada mudança do produto deve ter publicada uma nota de versão',                'diretriz-13.html')
ON CONFLICT (codigo) DO UPDATE
  SET titulo = EXCLUDED.titulo, url_pagina = EXCLUDED.url_pagina;


INSERT INTO vic.indicador (codigo, diretriz_codigo, nome, descricao, unidade, melhor_sentido, granularidade, formula) VALUES
  ('D1.VALIDACAO_PRODUCAO', 'D1',
   'Validação de produção',
   'Percentual de tags de produção cujo commit teve todos os checks obrigatórios concluídos com sucesso.',
   'percentual', 'maior', 'repositorio',
   'tags de producao com todos os contextos obrigatorios em sucesso / tags de producao'),

  ('D2.ADERENCIA_FLOW', 'D2',
   'Aderência ao flow',
   'Percentual de repositórios com as branches permanentes exigidas pelo flow presentes e protegidas.',
   'percentual', 'maior', 'organizacao',
   'repositorios com permanentes presentes e protegidas / repositorios em escopo'),

  ('D3.SANITIZACAO', 'D3',
   'Sanitização de branches',
   'Percentual de branches temporárias mergeadas que foram deletadas.',
   'percentual', 'maior', 'repositorio',
   '1 - (branches mergeadas nao removidas / branches mergeadas)'),

  ('D3.IDADE_OBSOLETA', 'D3',
   'Idade da branch obsoleta mais antiga',
   'Dias desde o merge da branch mergeada e não deletada mais antiga.',
   'dias', 'menor', 'repositorio',
   'max(data_referencia - mergeada_em) entre branches mergeadas e nao removidas'),

  ('D4.DIAS_SYNC', 'D4',
   'Dias desde o merge-base',
   'MEDIDA CANÔNICA da divergência: dias desde o último alinhamento da branch temporária com a linha principal. Aplicável a feature/*.',
   'dias', 'menor', 'branch',
   'data_referencia - data(merge_base)'),

  ('D4.AHEAD', 'D4',
   'Commits ahead',
   'Volume de trabalho represado fora da linha principal. Aplicável a feature/*.',
   'contagem', 'menor', 'branch',
   'compare(base...branch).ahead_by'),

  ('D4.VIDA_TOTAL', 'D4',
   'Vida total da branch',
   'Dias entre o primeiro commit exclusivo e a data de referência. Limite obrigatório também para release/* (<=10) e hotfix/* (<=3).',
   'dias', 'menor', 'branch',
   'data_referencia - data(primeiro commit exclusivo)'),

  ('D5.MERGE_BACK', 'D5',
   'Merge back completo',
   'Percentual de branches release/* e hotfix/* encerradas que foram integradas tanto na main quanto na develop.',
   'percentual', 'maior', 'repositorio',
   'release/hotfix com ahead_contra_main = 0 e ahead_contra_develop = 0 / release/hotfix encerradas'),

  ('D6.COMPLETUDE_INTEGRADOR', 'D6',
   'Completude pelo Integrador',
   'Percentual de PRs mergeados em branch permanente cuja completude foi executada por um Integrador vigente na data do merge.',
   'percentual', 'maior', 'repositorio',
   'PRs mergeados em permanente por integrador / PRs mergeados em permanente'),

  ('D7.PROTECAO_EFETIVA', 'D7',
   'Proteção efetiva',
   'Percentual de branches permanentes com push direto bloqueado, PR obrigatório, revisão exigida e status checks obrigatórios.',
   'percentual', 'maior', 'repositorio',
   'permanentes com protecao_efetiva / permanentes'),

  ('D8.COBERTURA_PR', 'D8',
   'Cobertura de Pull Request',
   'Percentual de commits em branch permanente originados de um Pull Request.',
   'percentual', 'maior', 'repositorio',
   'commits em permanente com origem_pr_numero / commits em permanente'),

  ('D8.APROVACAO_PR', 'D8',
   'Aprovação de Pull Request',
   'Percentual de PRs mergeados com pelo menos uma aprovação registrada.',
   'percentual', 'maior', 'repositorio',
   'PRs mergeados com >= 1 aprovacao / PRs mergeados'),

  ('D9.SEMVER', 'D9',
   'Conformidade SemVer',
   'Percentual de tags aderentes a MAJOR.MINOR.PATCH.',
   'percentual', 'maior', 'repositorio',
   'tags com semver_valida / tags'),

  ('D10.VEC', 'D10',
   'Rastreabilidade VEC',
   'Percentual de tags de produção no formato MAJOR.MINOR.PATCH.BUILD.',
   'percentual', 'maior', 'repositorio',
   'tags de producao com vec_valida / tags de producao'),

  ('D11.NOME_REPOSITORIO', 'D11',
   'Nomenclatura de repositório',
   'Percentual de repositórios aderentes ao padrão SISTEMA-modulo.',
   'percentual', 'maior', 'organizacao',
   'repositorios com nome_conforme / repositorios em escopo'),

  ('D11.NOME_BRANCH', 'D11',
   'Nomenclatura de branch',
   'Percentual de branches existentes aderentes a feature|release|hotfix/* ou permanentes.',
   'percentual', 'maior', 'repositorio',
   'branches com nome_conforme / branches existentes'),

  ('D11.NOME_VERSAO', 'D11',
   'Nomenclatura de versão',
   'Percentual de tags aderentes a SemVer ou ao Padrão VEC.',
   'percentual', 'maior', 'repositorio',
   'tags com semver_valida ou vec_valida / tags'),

  ('D12.FORMATO_ARQUIVO', 'D12',
   'Formato de arquivo',
   'Percentual de repositórios sem blobs de extensão proibida na árvore das branches permanentes.',
   'percentual', 'maior', 'repositorio',
   '1 - (blobs com extensao proibida / blobs avaliados)'),

  ('D12.TAMANHO_ARQUIVO', 'D12',
   'Tamanho de arquivo',
   'Percentual de blobs dentro do limite institucional de tamanho.',
   'percentual', 'maior', 'repositorio',
   '1 - (blobs acima do limite / blobs avaliados)'),

  ('D12.ASSINATURA_COMMIT', 'D12',
   'Assinatura de commit',
   'Percentual de commits do período com assinatura verificada.',
   'percentual', 'maior', 'repositorio',
   'commits com assinatura verificada / commits do periodo'),

  ('D13.NOTA_VERSAO', 'D13',
   'Nota de versão publicada',
   'Percentual de releases publicadas com corpo (changelog) preenchido.',
   'percentual', 'maior', 'repositorio',
   'releases com corpo_preenchido / releases publicadas')
ON CONFLICT (codigo) DO UPDATE
  SET nome = EXCLUDED.nome, descricao = EXCLUDED.descricao, formula = EXCLUDED.formula;


-- Faixas dos indicadores percentuais: quanto maior, melhor.
INSERT INTO vic.faixa_maturidade (indicador_codigo, nivel, rotulo, limite_min)
SELECT i.codigo, f.nivel, f.rotulo, f.limite_min
FROM vic.indicador i
CROSS JOIN (VALUES
    (1::SMALLINT, 'Inicial',    60::NUMERIC),
    (2::SMALLINT, 'Gerenciado', 80::NUMERIC),
    (3::SMALLINT, 'Definido',   95::NUMERIC),
    (4::SMALLINT, 'Otimizado', 100::NUMERIC)
) AS f(nivel, rotulo, limite_min)
WHERE i.unidade = 'percentual'
ON CONFLICT (indicador_codigo, nivel) DO NOTHING;

-- Faixas da D4, transcritas da tabela normativa da Diretriz 4 (quanto menor, melhor).
INSERT INTO vic.faixa_maturidade (indicador_codigo, nivel, rotulo, limite_max) VALUES
  ('D4.DIAS_SYNC',  1, 'Inicial',     20),
  ('D4.DIAS_SYNC',  2, 'Gerenciado',  10),
  ('D4.DIAS_SYNC',  3, 'Definido',     5),
  ('D4.DIAS_SYNC',  4, 'Otimizado',    2),
  ('D4.AHEAD',      1, 'Inicial',    100),
  ('D4.AHEAD',      2, 'Gerenciado',  50),
  ('D4.AHEAD',      3, 'Definido',    25),
  ('D4.AHEAD',      4, 'Otimizado',   10),
  ('D4.VIDA_TOTAL', 1, 'Inicial',     45),
  ('D4.VIDA_TOTAL', 2, 'Gerenciado',  30),
  ('D4.VIDA_TOTAL', 3, 'Definido',    15),
  ('D4.VIDA_TOTAL', 4, 'Otimizado',    5),
  ('D3.IDADE_OBSOLETA', 1, 'Inicial',    60),
  ('D3.IDADE_OBSOLETA', 2, 'Gerenciado', 30),
  ('D3.IDADE_OBSOLETA', 3, 'Definido',   15),
  ('D3.IDADE_OBSOLETA', 4, 'Otimizado',   5)
ON CONFLICT (indicador_codigo, nivel) DO UPDATE
  SET limite_max = EXCLUDED.limite_max, rotulo = EXCLUDED.rotulo;


-- Política inicial global: faixa 1 até que 60 dias de coleta sem limiar
-- permitam fixar o limite no percentil 75 observado (regra da Diretriz 4).
INSERT INTO vic.politica_indicador (indicador_codigo, nivel_vigente, vigente_desde, observacao)
SELECT i.codigo, 1, CURRENT_DATE,
       'Linha de base. Rever após 60 dias de coleta sem limiar, fixando no P75 observado; avançar uma faixa por trimestre até a faixa 3.'
FROM vic.indicador i
WHERE i.ativo;


INSERT INTO vic.extensao_proibida (extensao, descricao) VALUES
  ('zip',  'Arquivo compactado'),
  ('rar',  'Arquivo compactado'),
  ('jar',  'Binário Java empacotado'),
  ('ear',  'Binário Java corporativo'),
  ('war',  'Binário Java web'),
  ('jpg',  'Imagem raster'),
  ('jpeg', 'Imagem raster'),
  ('bmp',  'Imagem raster'),
  ('pdf',  'Documento binário'),
  ('docx', 'Documento binário'),
  ('xlsx', 'Planilha binária'),
  ('exe',  'Executável'),
  ('dll',  'Biblioteca binária')
ON CONFLICT (extensao) DO UPDATE SET descricao = EXCLUDED.descricao;


INSERT INTO vic.parametro_politica (chave, valor, descricao) VALUES
  ('d12.tamanho_max_bytes',        '10485760', 'D12: tamanho máximo por arquivo versionado (10 MB).'),
  ('d4.vida_max_release_dias',     '10',       'D4: vida total máxima de uma branch release/*.'),
  ('d4.vida_max_hotfix_dias',      '3',        'D4: vida total máxima de uma branch hotfix/*.'),
  ('d8.aprovacoes_minimas',        '1',        'D8: aprovações exigidas antes da completude.'),
  ('vic.fuso_horario',             'America/Sao_Paulo', 'Fuso usado para converter instantes em dias nos agregados.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, atualizado_em = now();

COMMIT;

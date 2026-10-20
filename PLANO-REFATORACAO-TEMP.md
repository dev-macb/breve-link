# Plano temporário — Refatoração e interface do Breve Link

Data: 19/10/2026.
Status: Etapa 4 concluída: build React servido pelo Express, rotas e cache separados, erros públicos HTML/JSON e sessão validada no mesmo origin. Documentação em docs/FASE-4-INTEGRACAO.md. Próxima etapa: Docker e implantação.

Este documento reúne o plano original e os ajustes identificados na avaliação do código. Os itens desmarcados representam trabalho planejado, não funcionalidades já verificadas. Manter este arquivo durante a refatoração e removê-lo ou incorporar seu conteúdo à documentação definitiva ao concluir.

## Objetivo e escopo

Corrigir problemas de segurança e consistência da API, reorganizar o projeto em `server/` e `web/`, criar uma interface administrativa em PT-BR e entregar uma implantação reproduzível com Docker e SQLite.

Premissa inicial: painel administrativo, com gerenciamento de links restrito a administradores, e redirecionamento público. A implantação inicial terá uma única instância da aplicação com banco SQLite persistido em volume local.

## Decisões de arquitetura

| Tema | Direção |
| --- | --- |
| Organização | Monorepo com npm workspaces, `server/` e `web/`, lockfile na raiz e comandos de desenvolvimento, build, testes e lint na raiz. |
| Backend | Manter Node.js, TypeScript, Express 5, Knex e convenções em português. |
| Frontend | Vite, React, TypeScript, Tailwind v4 e React Router. Recharts para estatísticas. |
| Publicação | API e SPA no mesmo origin; Express serve os arquivos produzidos pelo build do frontend. |
| Rotas | API em `/api/*`; links públicos em `/:slug`; páginas administrativas com caminhos reservados. |
| Banco | SQLite em desenvolvimento e produção; banco isolado nos testes. Remover configuração PostgreSQL sem suporte funcional. |
| Autenticação | JWT em cookie `httpOnly`, sem token no corpo da resposta. Completar política de sessão antes da implementação. |
| Erros | Classes de domínio e handler central; resposta `{ erro: string, detalhes?: string[] }`. |
| Paginação | `{ itens, total, pagina, limite, totalPaginas }`, com limite máximo de 100 e ordenação determinística. |
| Qualidade | Testes de regressão e integração junto de cada entrega; lint e build como verificações obrigatórias. |

## Contratos a fechar antes das etapas dependentes

- [x] Sessão definida em uma hora, com validade alinhada no JWT e cookie.
- [x] Estado e privilégios atuais consultados por requisição; versão de sessão invalida todas as sessões após logout, troca de senha, mudança de ativo ou administrador.
- [x] CSRF definido com X-Breve-CSRF: 1, JSON, allowlist de Origin, bloqueio de Sec-Fetch-Site cross-site e cookie Strict.
- [x] Autenticação em POST /api/auth/login, POST /api/auth/logout e GET /api/auth/me; usuários em /api/usuarios.
- [x] Backend responde 404 para inexistente e 410 para inativo/expirado, sem registrar acesso; páginas HTML ficam para a interface.
- [x] Slugs diferenciam maiúsculas; comparação de nomes reservados ignora maiúsculas.
- [x] Definir apresentação das estatísticas: gráfico dos últimos 30 dias UTC, dias sem acesso preenchidos com zero e distribuições de todo o histórico. Instantes armazenados em UTC e datas de formulário convertidas para apresentação local.
- [ ] Adicionar limites e filtros de intervalo na consulta de estatísticas; a API atual ainda consulta o histórico completo.
- [x] Falha de analytics preserva redirect, registra log seguro e reverte integralmente evento e contador.
- [x] Preservada GET /links/redirecionar/:urlCurta; gerenciamento antigo removido.
- [x] APP_ORIGEM define a origem pública; frontend deverá usá-la ao montar links, sem confiar em Host recebido.

## Etapa 0 — Baseline e proteção dos dados

- [x] Registrar resultado inicial: 6 suítes/74 testes passando; build com três erros de tipagem no LoggerMiddleware.
- [x] Inventariar banco local e caminhos configurados: nenhum arquivo SQLite encontrado no checkout; histórico de ambiente implantado ainda não verificado.
- [ ] Fazer backup antes de alterar estrutura ou caminho do banco.
- [x] Inventariar contratos atuais e documentar mudanças incompatíveis: prefixo `/api`, cookie, paginação e respostas públicas.
- [x] Conferir uso real antes de remover código aparentemente morto.

Critério de conclusão: estado inicial conhecido, dados preservados e contratos pendentes resolvidos para a próxima etapa.

## Etapa 1 — Correções e segurança do backend

### Usuários e autenticação

- [x] Aplicar hash bcrypt no cadastro usando `HashUtil`; unificar o hash usado também na atualização.
- [x] Criar DTOs públicos como `UsuarioResposta`; nunca devolver senha ou hash, inclusive na exclusão.
- [x] Aguardar a remoção do usuário e verificar seu resultado.
- [x] Normalizar e-mail com `trim().toLowerCase()` em cadastro, atualização e login.
- [x] Permitir atualizar o usuário mantendo o próprio e-mail.
- [x] Tratar unicidade de e-mail também no banco, incluindo concorrência e possíveis conflitos em dados existentes após normalização.
- [x] Validar usuário ativo no login e aplicar a política de invalidação durante requisições autenticadas.
- [x] Validar senha no cadastro e PATCH: mínimo de 8 caracteres e máximo compatível com os 72 bytes do bcrypt, considerando UTF-8.
- [x] Corrigir o limite incorreto `max(5)` do nome no PATCH.
- [x] Enviar cookie no login por `Set-Cookie`; responder com dados públicos ou sem corpo, conforme contrato definido.
- [x] Implementar leitura do cookie no middleware, `/api/auth/me` e logout com os mesmos atributos usados ao definir o cookie.
- [x] Usar `httpOnly`, `sameSite` definido pela política, `secure` em produção e `path` consistente.
- [x] Aplicar a proteção contra CSRF definida no contrato.
- [x] Remover credencial fixa da seed; exigir `ADMIN_SENHA` na inicialização de produção e evitar registrar senha em logs.
- [x] Tornar o bootstrap administrativo idempotente, sem redefinir a senha a cada inicialização.

### Links e acessos

- [x] Verificar `ativo` e `expiraEm` antes do redirecionamento.
- [x] Emitir redirecionamento 302 explicitamente e definir política de cache compatível com links editáveis e expirados.
- [x] Garantir transação única para inserir acesso e incrementar contador; a unidade transacional fica no AcessoRepository, com a mesma conexão para as duas operações.
- [x] Remover a duplicação entre registros de acesso dos serviços.
- [x] Gerar slugs com `crypto` em vez de `Math.random`.
- [x] Validar slug customizado no POST e PATCH; preservar restrição `UNIQUE` e converter colisão em 409.
- [x] Repetir geração automática em colisões de insert, com limite de tentativas.
- [x] Centralizar slugs reservados e aplicá-los no POST, PATCH e gerador.
- [x] Unificar comprimento e caracteres permitidos entre validação, banco e redirecionamento; limite de 50 alinhado na validação e declaração da migration; SQLite não impõe tamanho de VARCHAR.
- [x] Restringir URLs de destino a protocolos HTTP e HTTPS.
- [x] Retirar `acessos` dos campos editáveis da API.
- [x] Validar expiração em relação ao horário da requisição, permitindo limpar o campo com `null`.

### Erros, validação e proteção operacional

- [x] Criar classes `RecursoNaoEncontrado`, `Conflito`, `NaoAutenticado`, `Proibido` e `RequisicaoInvalida`.
- [x] Centralizar conversão para 401/403/404/409/422/500 e demais status definidos pelos contratos.
- [x] Propagar erros dos controllers ao handler central, mantendo mensagens úteis de domínio e resposta genérica para falhas internas inesperadas em produção.
- [x] Padronizar erros de JSON inválido, validação e endpoints inexistentes.
- [x] Aplicar dados convertidos e `stripUnknown` pelo Yup. Usar campo próprio para entrada validada, respeitando `req.query` como getter no Express 5.
- [x] Aplicar limite de paginação e ordenação estável; calcular total usando os mesmos filtros da lista.
- [x] Adicionar Helmet e configurar limites de tamanho de requisição.
- [x] Configurar CORS somente conforme origens necessárias, com credenciais quando aplicável e sem wildcard nesse caso.
- [x] Limitar login com maior rigor; definir limites separados para API administrativa e redirects para evitar bloquear visitantes legítimos.
- [x] Configurar `trust proxy` conforme proxies efetivamente existentes; Docker sozinho não justifica confiar em um salto.
- [x] Remover dados sensíveis dos logs, incluindo DTOs com senha, cookies e cabeçalhos de autenticação.
- [x] Remover tokens reais dos arquivos `.http`; usar variáveis/exemplos. Se forem credenciais válidas expostas, invalidá-las.

Critério de conclusão: correções cobertas por regressões, contratos de autenticação funcionando e nenhuma senha/token em respostas públicas ou logs previstos.

## Etapa 2 — Estrutura, configuração e inicialização

- [x] Mover backend para `server/` e criar workspace `web/`, preservando histórico e dados locais.
- [x] Ajustar imports, TypeScript, Jest, scripts Knex e caminhos de migrations/seeds após a mudança.
- [x] Carregar ambiente antes dos módulos que consultam configuração, inclusive nos comandos de migrations e seeds.
- [x] Unificar `NODE_ENV` em `development`, `test` e `production`.
- [x] Remover configuração PostgreSQL e `ssl: rejectUnauthorized: false`.
- [x] Mover `sqlite3` para dependências de produção.
- [x] Configurar caminho do SQLite absoluto ou relativo à raiz por `BD_ARQUIVO`, preservando `base.sqlite` na raiz como padrão. O volume `data/` será configurado na etapa de Docker.
- [x] Definir execução de migrations compiladas antes de aceitar tráfego e falhar claramente se a migração falhar.
- [x] Validar `JWT_SEGREDO` e demais configurações obrigatórias no boot.
- [x] Separar criação do app de abertura da porta para permitir testes com Supertest.
- [x] Implementar `GET /api/saude` sem detalhes sensíveis e definir se inclui verificação simples do banco.
- [x] Implementar shutdown com fechamento do servidor, espera limitada por requisições e `knex.destroy()`.
- [x] Instalar ESLint com flat config e typescript-eslint; configurar lint para ambos os workspaces.
- [x] Completar tipagem Knex, incluindo tabela de links.
- [x] Remover código morto confirmado: middleware comentado, validadores/utilitários sem uso e imports obsoletos.

Critério de conclusão: instalação e comandos na raiz reproduzíveis; build, lint e testes funcionam com a nova estrutura; banco existente permanece acessível.

## Etapa 3 — Interface administrativa

### Base e sessão

- [x] Configurar Vite, React, TypeScript, Tailwind v4 e React Router.
- [x] Criar cliente HTTP com envio de cookies e tratamento uniforme dos erros.
- [x] Restaurar sessão via `/api/auth/me`; distinguir carregamento, sessão ausente e falha de rede.
- [x] Tratar 401 sem criar loop na tela de login; tratar 403 como falta de permissão.
- [x] Proteger páginas administrativas e implementar logout.
- [x] Configurar proxy de desenvolvimento para API e estratégia explícita para redirects públicos, sem capturar rotas do frontend.

### Páginas

- [x] Login com formulário acessível, mensagens úteis e estado de envio.
- [x] Dashboard com busca, paginação, lista vazia, carregamento, erro e nova tentativa.
- [x] Criar e editar link com destino, slug customizado, ativação e expiração.
- [x] Confirmar exclusão e atualizar listagem após operações.
- [x] Copiar link público com feedback e tratamento de falha da área de transferência.
- [x] Estatísticas em `/links/:id`: total, série diária e distribuições de navegadores, sistemas, dispositivos, países e referrers.
- [x] Exibir dias sem acesso, valores desconhecidos e ausência de dados de forma consistente.
- [x] Criar páginas para link indisponível e rota inexistente conforme contratos.

### Apresentação

- [x] Interface PT-BR, minimalista, com tema escuro como ponto de partida e comportamento de tema definido.
- [x] Tokens de cor, superfícies, tipografia, bordas e estados de foco consistentes.
- [x] Layout responsivo; formulários, modal/sheet e confirmações operáveis por teclado.
- [x] Respeitar preferência por movimento reduzido e manter contraste legível.

Critério de conclusão: fluxo login → criar → copiar → editar → excluir → consultar estatísticas utilizável, inclusive com falhas de rede e em tela pequena.

## Etapa 4 — Integração API, arquivos e SPA

- [x] Gerar frontend em `web/dist/`, incluído no runtime junto de `server/build/`, com caminho absoluto independente do cwd.
- [x] Montar API sob `/api` e devolver 404 JSON para endpoints desconhecidos antes do fallback da SPA.
- [x] Servir arquivos estáticos com cache apropriado; arquivo inexistente deve ter 404, não HTML da SPA.
- [x] Resolver páginas reservadas antes de tratar um segmento como slug.
- [x] Validar slug com middleware ou rota `RegExp`, sem regex embutida em string de rota incompatível com Express 5.
- [x] Implementar fallback de navegação compatível com Express 5, limitado aos métodos e caminhos apropriados.
- [x] Garantir acesso direto e atualização de `/login`, `/dashboard` e `/links/:id`.
- [x] Aplicar política acordada para mounts antigos e links públicos já divulgados.
- [x] Revisar CSP do Helmet com os recursos efetivamente usados pela interface.

Critério de conclusão: testar a matriz de rotas em desenvolvimento e no build servido pelo Express; API e arquivos ausentes nunca retornam a SPA por engano.

## Etapa 5 — Docker e implantação

- [ ] Criar Dockerfile multi-stage com `npm ci`, build dos dois workspaces e runtime com dependências de produção.
- [ ] Usar versão de Node definida e estágios compatíveis com dependências nativas como bcrypt e sqlite3.
- [ ] Incluir arquivos estáticos, migrations e seed compilados no runtime.
- [ ] Executar processo com usuário sem privilégios e conceder escrita somente onde necessário.
- [ ] Criar Compose com porta, volume persistente `data/`, variáveis e healthcheck.
- [ ] Adicionar `.dockerignore` para credenciais, bancos locais e artefatos desnecessários.
- [ ] Disponibilizar configuração opcional com Caddy para HTTPS; documentar domínio, persistência de certificados e topologia de proxy.
- [ ] Garantir acesso HTTPS no cenário de produção com cookie `secure`; documentar configuração local.
- [ ] Documentar backup e restauração consistentes do SQLite.
- [ ] Validar persistência após recriar container e ausência de reset da senha administrativa.

Critério de conclusão: instalação limpa via Compose e reinicialização com dados existentes passam pelo fluxo completo; saúde, HTTPS e persistência verificados.

## Verificações contínuas e aceitação final

Os testes acompanham cada etapa; esta lista é uma matriz de cobertura, não uma fase adiada para o fim.

- [ ] Hash no cadastro/PATCH, normalização e unicidade de e-mail, manutenção do próprio e-mail e DTO sem senha.
- [ ] Login inválido, usuário inativo, cookie, restauração de sessão, 401/403 e invalidação conforme contrato.
- [ ] Proteção contra CSRF e configuração de cookie nos ambientes previstos.
- [ ] Link ativo, inativo, expirado, inexistente e comportamento no limite da expiração.
- [ ] Slugs reservados, formato, colisões no POST/PATCH e retry de geração automática.
- [ ] Transação de acesso com rollback se uma das operações falhar e consistência após acessos concorrentes.
- [ ] Paginação, filtros, ordenação e limite máximo.
- [ ] Handler central, mensagens de domínio e ausência de vazamento em produção.
- [ ] Estatísticas com zero acessos, intervalo, fuso e agrupamentos.
- [ ] Integração Supertest com SQLite isolado, migrations reais, limpeza e fechamento de conexões.
- [ ] Fluxo login → criar link → redirect → stats → logout.
- [ ] Matriz API/SPA/arquivos/slug, incluindo acesso direto às páginas e respostas 404 corretas.
- [ ] Build, lint e suíte completos; smoke test da interface e da imagem Docker.

## Etapa 6 — Documentação e encerramento

- [ ] Atualizar README com arquitetura, premissas, setup local, comandos na raiz e Docker.
- [ ] Documentar endpoints, exemplos, paginação, erros e mudanças incompatíveis.
- [ ] Atualizar `.env.example` completo, sem credenciais reais; remover variáveis PostgreSQL sem uso.
- [ ] Explicar bootstrap do administrador, sessão, HTTPS, proxy, banco, migrations e backup/restauração.
- [ ] Corrigir referência incorreta a `npm run knex:seeds`.
- [ ] Documentar quais dados de acesso são armazenados e definir política de retenção, incluindo IP e referrer.
- [ ] Registrar limitações conhecidas, especialmente SQLite em instância única e significado das métricas de acesso.
- [ ] Revisar documentação contra uma instalação limpa.
- [ ] Incorporar decisões duráveis ao README/documentação e remover este arquivo temporário quando deixar de ser necessário.

## Ordem de entrega

1. Baseline, dados e contratos necessários.
2. Correções de backend com regressões e integração básica.
3. Monorepo, configuração e boot reproduzível.
4. Interface administrativa e contratos de estatísticas.
5. Integração das rotas e validação do build completo.
6. Docker, persistência e operação.
7. Documentação final e revisão dos critérios de aceitação.

## Registro de decisões durante a execução

Adicionar aqui decisões que alterem escopo ou contratos, com motivo e impacto. Atualizar as seções correspondentes para manter um único plano consistente.

| Data | Decisão | Motivo / impacto |
| --- | --- | --- |
| 19/10/2026 | Consolidar plano original com avaliação do código. | Antecipar testes e explicitar contratos de sessão, rotas, concorrência e persistência. |
| 19/10/2026 | Entregar Etapa 1 em blocos; primeiro bloco cobre usuários. | Hash, DTO, e-mail, remoção, validação e bloqueio de login inativo implementados; 91 testes em 8 suítes passaram naquela entrega. Os demais itens foram concluídos no bloco seguinte. |
| 19/10/2026 | Concluir núcleo da Etapa 1 e antecipar configuração/boot da Etapa 2. | Cookies com sessão de uma hora e revogação global, CSRF, erros, paginação, unicidade, transações e SQLite de produção. Reestruturação e ESLint permanecem na Etapa 2. |
| 19/10/2026 | Concluir Etapa 2 com workspaces, lint e caminhos independentes do diretório de execução. | Instalação limpa, build, tipos e lint aprovados; 108 testes em 12 suítes. Smoke confirmou CLI, bootstrap e runtime compilado no mesmo banco temporário, sem alterar dados ou nomes históricos de migrations. Frontend reservado para a Etapa 3. |

| 19/10/2026 | Concluir Etapa 3 com interface administrativa, temas e métricas reais. | Sessão por cookie, formulários, busca/paginação e gráficos validados em desktop/celular. Origem pública autenticada e redirect canônico antecipados; servir a SPA no Express permanece na Etapa 4. |


| 19/10/2026 | Concluir Etapa 4 mantendo web/dist no runtime. | Express serve API e interface no mesmo origin; fallback limitado às páginas conhecidas, 404/410 públicos preservados e HEAD sem registrar acessos. Docker deve copiar web/dist junto de server/build. |

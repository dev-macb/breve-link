# Fase 1 — Correções e segurança do backend

## Entrega

A API administrativa usa /api/usuarios e /api/links. Login em POST /api/auth/login retorna 204 e define breve_sessao; GET /api/auth/me restaura a sessão e POST /api/auth/logout a encerra. Não há mais autenticação Bearer nos endpoints administrativos.

A sessão dura uma hora. O cookie é HttpOnly, SameSite=Strict, Path=/ e Secure em produção. A aplicação verifica usuário ativo, privilégios atuais e versão de sessão no banco em cada requisição. Logout, alteração de senha, ativo ou administrador invalidam todas as sessões anteriores da conta. O DTO público não inclui hash nem versão da sessão.

Operações de escrita exigem X-Breve-CSRF: 1. POST e PATCH exigem application/json, assim como logout com corpo {}. A combinação de cabeçalho não simples, allowlist de Origin, bloqueio de Sec-Fetch-Site cross-site e cookie Strict impede envio autenticado por formulários externos e fetch sem preflight autorizado. Clientes de terminal podem omitir Origin, mas precisam enviar o cabeçalho. O frontend deverá usar credentials: include.

Login admite 10 falhas por IP a cada 15 minutos. API: 300 requisições/IP/minuto. Redirect legado: 1000/IP/minuto. Stores em memória são adequados à premissa de uma única instância.

## Links e dados

- Slugs diferenciam maiúsculas, têm 3–50 caracteres ASCII alfanuméricos, hífen ou underscore; nomes reservados são comparados sem diferenciar maiúsculas.
- UNIQUE no banco resolve disputas concorrentes; slug customizado duplicado retorna 409 e geração automática repete até 10 tentativas.
- Somente destinos HTTP/HTTPS sem credenciais, de até 500 caracteres.
- Expiração nova é persistida em ISO UTC. Expiração inválida, vencida ou link inativo retorna 410; inexistente retorna 404.
- Redirect retorna 302 com Cache-Control: no-store; a rota pública /links/redirecionar/:urlCurta foi preservada. A rota /:slug ficará para integração com a SPA.
- Registro de acesso e incremento do contador são uma transação no AcessoRepository. Em falha ocorre rollback e o redirect continua, com log sem parâmetros sensíveis. O contador não é editável pela API.
- E-mails são normalizados no serviço e protegidos por índice único sobre lower(trim(email)).
- A migration 004 interrompe a execução se encontrar colisões de e-mail normalizado; exige resolução explícita antes de continuar, sem escolher uma conta para apagar.
- A declaração de slug da migration inicial foi alinhada para 50. SQLite não impõe o tamanho declarado em VARCHAR; a validação da aplicação aplica o limite também em bases existentes.

## Contratos de resposta

Listagens: { itens, total, pagina, limite, totalPaginas }, com limite máximo de 100, filtros consistentes e ordem decrescente de ID.

Erros: { erro, detalhes? }. Classes de domínio preservam 401/403/404/409/410/422; JSON inválido retorna 400 e corpo excessivo retorna 413. Falhas inesperadas retornam mensagem genérica e um identificador interno é registrado, sem SQL, senha ou token.

A validação remove campos desconhecidos, aplica body e params convertidos e mantém query convertida em res.locals.validado, respeitando o getter do Express 5.

## Configuração e execução

1. Instalar com npm ci.
2. Copiar .env.example para .env; configurar APP_ORIGEM, segredo JWT aleatório com pelo menos 32 bytes, ADMIN_EMAIL e ADMIN_SENHA.
3. Executar npm run knex:migrate e npm run knex:seed para o primeiro administrador.
4. Executar npm run dev, ou npm run build seguido de npm start.

O boot valida a configuração e executa migrations antes de escutar. A seed é explícita e idempotente: não redefine a senha de usuários existentes. Produção exige APP_ORIGEM HTTPS para o cookie Secure. TRUST_PROXY recebe somente IPs/CIDRs confiáveis; vazio não confia em cabeçalhos encaminhados. CORS_ORIGENS contém origens exatas, sem wildcard.

NODE_ENV aceita development/test/production. SQLite é dependência de produção. BD_ARQUIVO configura o arquivo; vazio preserva base.sqlite na raiz nesta fase. O diretório deve existir e ser gravável. PostgreSQL foi removido. GET /api/saude verifica o banco sem expor sua configuração. SIGTERM/SIGINT fecham HTTP e Knex, com prazo máximo de dez segundos.

Não foi executada migração em banco de produção nesta entrega. Os testes usam SQLite em memória. Antes de implantar sobre uma base existente, fazer backup e revisar colisões de e-mail e datas legadas. Senhas em texto simples gravadas pelo bug antigo precisam de redefinição; não serão aceitas como hash bcrypt nem convertidas silenciosamente.

## Verificação

Build TypeScript aprovado e 106 testes passando em 11 suítes, com Supertest, SQLite e bcrypt reais. Cobertura inclui colisões concorrentes, rollback por trigger de falha, sessões revogadas, CSRF, autorização, paginação, validação e ausência de segredos nas respostas. Smoke do backend compilado em modo produção também confirmou migrations e health check com banco temporário, removido ao final.

A reorganização em `server/` e `web/` e o lint estão documentados na [Fase 2](FASE-2-MONOREPO.md).
A interface, o fallback SPA e Docker seguem nas próximas etapas. Os exemplos HTTP agora ficam em `server/tests/`.

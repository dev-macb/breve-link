# Breve Link

Encurtador de URLs com painel administrativo e estatísticas locais em SQLite.

## Stack

- `api/`: Node.js, TypeScript, Express 5, Inversify, Knex e SQLite.
- `app/`: React, TypeScript e Vite.
- `database/`: arquivo SQLite local (ignorado pelo Git).
- npm workspaces; comandos executados na raiz.

## Configuração e execução

Requisitos: Node.js `^22.13.0 || >=24` e npm `>=10`.

```sh
npm ci
```

Copie `.env.example` para `.env` na raiz e configure:

| Variável                     | Finalidade                                                         |
| ---------------------------- | ------------------------------------------------------------------ |
| `NODE_ENV`                   | `development`, `test` ou `production`                              |
| `APP_HOST`, `APP_PORTA`      | Escuta HTTP; padrões `0.0.0.0` e `3000`                            |
| `APP_ORIGEM`                 | Origem pública exata, sem barra final; HTTPS em produção           |
| `JWT_SEGREDO`                | Segredo de sessão com pelo menos 32 bytes aleatórios               |
| `ADMIN_EMAIL`, `ADMIN_SENHA` | Bootstrap do administrador; senha de 8 caracteres a 72 bytes UTF-8 |
| `BD_ARQUIVO`                 | Arquivo SQLite; padrão `database/base.sqlite`, relativo à raiz     |
| `CORS_ORIGENS`               | Origens adicionais permitidas, separadas por vírgula               |
| `WEB_API_DESTINO`            | Destino do proxy Vite; padrão no exemplo: `http://127.0.0.1:3000`  |
| `TRUST_PROXY`                | IPs/CIDRs dos proxies confiáveis, separados por vírgula            |
| `LOG_LEVEL`                  | Nível de logs                                                      |

Gere o segredo:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Inicialize o banco e a conta administrativa:

```sh
npm run knex:migrate
npm run knex:seed
npm run dev
```

Painel em [localhost:5173](http://localhost:5173); API na porta 3000 por padrão.
Os links curtos usam `APP_ORIGEM`. O seed não altera contas existentes.
Para iniciar separadamente: `npm run dev:api` ou `npm run dev:app`.

Produção:

```sh
npm run build
npm start
```

O Express serve `app/dist/` e a API. O backend compilado fica em `api/build/`.
O servidor aplica migrations ao iniciar. Configure HTTPS no proxy, restrinja
`TRUST_PROXY` aos proxies reais e mantenha o SQLite em armazenamento persistente.
Antes de atualizar, pare a aplicação e faça backup do banco. A restauração deve
usar uma versão do código compatível com o schema do backup.

## API

Corpos JSON. Mutações em `/api` exigem `X-Breve-CSRF: 1`; POST/PATCH também
exigem `Content-Type: application/json`. Origens devem estar na configuração
permitida. Clientes web devem enviar cookies (`credentials: 'include'`).

| Método               | Rota                                | Acesso / função                                          |
| -------------------- | ----------------------------------- | -------------------------------------------------------- |
| GET                  | `/api/saude`                        | Público; testa conexão com o banco                       |
| POST                 | `/api/auth/login`                   | Público; recebe `email` e `senha`                        |
| GET                  | `/api/auth/me`                      | Autenticado; usuário atual                               |
| POST                 | `/api/auth/logout`                  | Autenticado; revoga todas as sessões do usuário          |
| GET                  | `/api/configuracao`                 | Autenticado; retorna `origemPublica`                     |
| GET / POST           | `/api/links`                        | Administrador; listar / criar                            |
| GET / PATCH / DELETE | `/api/links/:id`                    | Administrador; consultar / alterar / excluir             |
| GET                  | `/api/links/:id/stats`              | Administrador; estatísticas do link                      |
| GET / POST           | `/api/usuarios`                     | Administrador; listar / criar                            |
| GET / PATCH / DELETE | `/api/usuarios/:id`                 | Administrador; consultar / alterar / excluir             |
| GET / HEAD           | `/:urlCurta`                        | Público; redirect HTTP 302                               |
| GET / HEAD           | `/links/redirecionar/:urlCurta`     | Compatibilidade com URLs antigas                         |
| GET / HEAD           | `/api/links/redirecionar/:urlCurta` | Alias público de redirect                                |
| POST                 | `/collect`                          | Compatibilidade de coleta; exige token temporário válido |

Listagens recebem `pagina` (padrão 1), `limite` (padrão 10, máximo 100) e
`filtro`. Retornam `itens`, `total`, `pagina`, `limite` e `totalPaginas`.

Criação de link:

```json
{
    "urlOriginal": "https://example.com/produto",
    "urlCurta": "produto",
    "expiraEm": null
}
```

`urlOriginal` é obrigatória: HTTP/HTTPS, até 500 caracteres e sem credenciais.
`urlCurta` é opcional na criação; aceita 3–50 letras ASCII, números, `_` e `-`,
com distinção entre maiúsculas/minúsculas e rejeição de nomes reservados.
Sem slug, gera 7 caracteres. PATCH também aceita `ativo`; `expiraEm` aceita data
futura ou `null` para remover a expiração. `geo` permanece aceito por
compatibilidade, mas não altera o redirect nem ativa captura no navegador.

Usuários: criação recebe `nome`, `email`, `senha`, `ativo` e `administrador`;
PATCH aceita esses campos parcialmente. E-mails são normalizados e senhas usam bcrypt.

Autenticação via JWT de 1 hora no cookie `breve_sessao`, HttpOnly, SameSite=Strict
e Secure em produção. As requisições autenticadas revalidam estado e versão de
sessão no banco. Operações administrativas exigem `administrador=true`.

## Persistência e coleta

Tabelas principais: `usuarios`, `links` e `acessos`. Migrations versionadas em
`api/src/migrations/`; testes usam SQLite em memória, com chaves estrangeiras
habilitadas. O registro do acesso e o incremento do contador são transacionais.

GET de link válido registra IP, cliente, referrer, headers técnicos e localização
aproximada via GeoIP local. Bots e previews também contam; HEAD não registra.
Links inexistentes retornam 404; inativos ou expirados, 410. Falhas de coleta não
impedem o redirect. Não há página intermediária nem solicitação de geolocalização.

`hashDispositivo` é SHA-256 de User-Agent, Accept-Language e Accept-Encoding.
Não representa uma pessoa única; não é gerado com DNT=1, GPC=1 ou sem User-Agent.
As estatísticas incluem distribuições, últimos 100 eventos e os 20 hashes mais
frequentes, agregados sobre todo o histórico do link.

O schema de coordenadas e os dados históricos foram preservados. `/collect`
atualiza apenas o clique associado a um token de uso único ainda válido; novos
redirects não emitem tokens. `geolocalizacao` nas estatísticas mantém contagens,
estados, taxa de capturas sobre resultados recebidos e agrupamento aproximado
por células de 0,01 grau. A aplicação não acompanha a navegação no destino.

## Organização do código

No backend, rotas e controllers tratam HTTP, services coordenam regras de negócio
e repositories concentram consultas ao banco. Utilitários de coleta montam os
dados do acesso; o controller preserva o redirect em caso de falha.

No frontend, páginas compõem a interface. Componentes e hooks específicos ficam
em `app/src/funcionalidades/`; hooks de consulta controlam carregamento,
cancelamento e erros. Elementos compartilhados ficam em `componentes/`.

Use `npm run format` para aplicar a formatação e `npm run format:check` para
verificá-la. Prettier e EditorConfig padronizam indentação e quebras de linha;
ESLint exige blocos explícitos nos condicionais. Migrations existentes não são
reformatadas.

## Verificação

```sh
npm run format:check
npm run typecheck
npm run lint
npm test -- --runInBand
npm run test:app
npm run build
```

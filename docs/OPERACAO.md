# Operação

## Configuração

O `.env` fica na raiz, tanto em desenvolvimento quanto na execução compilada.
Variáveis fornecidas pelo ambiente têm prioridade sobre o arquivo.

| Variável | Configuração |
| --- | --- |
| `NODE_ENV` | `development`, `test` ou `production`; padrão `development` |
| `APP_HOST` | Endereço de escuta; padrão `0.0.0.0` |
| `APP_PORTA` | Porta HTTP; padrão `3000` |
| `APP_ORIGEM` | Origem pública exata, sem caminho nem barra final; HTTPS em produção |
| `JWT_SEGREDO` | Segredo aleatório de pelo menos 32 bytes |
| `CORS_ORIGENS` | Origens adicionais exatas, separadas por vírgula |
| `WEB_API_DESTINO` | Destino do proxy Vite; padrão `http://127.0.0.1:3000` |
| `TRUST_PROXY` | IPs/CIDRs de proxies confiáveis, separados por vírgula; vazio sem proxy |
| `BD_ARQUIVO` | Caminho SQLite; padrão `base.sqlite` na raiz |
| `LOG_LEVEL` | Nível de log; exemplo `info` |
| `ADMIN_EMAIL` / `ADMIN_SENHA` | Credenciais usadas pelo bootstrap explícito |

Caminhos relativos do banco são resolvidos a partir da raiz do projeto. O
diretório deve existir e ser gravável. Em `NODE_ENV=test`, o banco é em memória.
A seed cria o administrador, mas não redefine credenciais de uma conta existente.

## Desenvolvimento

Siga a instalação do [README](../README.md). `npm run dev` inicia Express e Vite.
O Vite usa `localhost:5173` e encaminha `/api` e `/links/redirecionar/` para a API.
O endereço público `/:slug` deve ser acessado pela origem da API.

Se alterar a porta da API, ajuste `APP_PORTA`, `APP_ORIGEM` e `WEB_API_DESTINO`.
A origem do frontend deve constar em `CORS_ORIGENS`. Não use wildcard.

## Produção

1. Instale as dependências com `npm ci` e configure o ambiente.
2. Execute `npm run build`; mantenha `server/build/` e `web/dist/` junto ao runtime.
3. Na primeira instalação, execute `npm run knex:migrate` e `npm run knex:seed`.
4. Inicie com `npm start`, usando `NODE_ENV=production` e `APP_ORIGEM` HTTPS.

O boot valida a configuração, exige a interface compilada em produção e aplica
migrations antes de abrir a porta. A seed não roda automaticamente.

Se houver proxy reverso, termine HTTPS nele e encaminhe para a porta HTTP da
aplicação. Restrinja `TRUST_PROXY` aos proxies realmente presentes. Isso define
como `req.ip` interpreta os headers de encaminhamento e afeta coleta e limites
por IP. O repositório não inclui Docker ou configuração pronta de proxy.

Mantenha uma instância com SQLite persistente. Os limites de requisição ficam em
memória por processo. `GET /api/saude` verifica a conexão com o banco. SIGINT e
SIGTERM encerram HTTP e Knex, com prazo máximo de dez segundos.

## Atualizações e backup

Antes de atualizar uma instalação com dados, pare a aplicação e faça uma cópia
consistente do arquivo SQLite. Preserve o `.env` e o caminho de `BD_ARQUIVO`.
Depois compile e aplique `npm run knex:migrate` antes de reiniciar. Não substitua
um banco existente por um banco vazio para contornar erro de migration.

A migration 004 interrompe a atualização se houver colisões de e-mail após
normalização; resolva as contas duplicadas antes de continuar. Senhas antigas
armazenadas sem bcrypt precisam ser redefinidas.

`npm run knex:rollback` desfaz o último lote; `npm run knex:rollback-all` desfaz
todos. Rollbacks podem remover tabelas, colunas e dados e não substituem backup.

## Respostas e cache

- Redirects válidos: `302`, sem cache.
- Links inexistentes: `404`; pausados ou expirados: `410`.
- Erros públicos de navegação oferecem HTML; clientes de API recebem JSON.
- Rotas `/api` desconhecidas sempre retornam JSON.
- Páginas da interface usam `no-store`; assets com hash usam cache de um ano e
  `immutable`; demais arquivos estáticos usam `no-cache`.
- O fallback da interface só atende páginas conhecidas; arquivos ausentes não
  recebem o HTML da aplicação como sucesso.

Veja também [API](API.md) e [coleta local](ACESSOS-FINGERPRINT.md).

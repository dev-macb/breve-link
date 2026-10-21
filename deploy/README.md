# Deploy na VPS

O Nginx e o Certbot pertencem a `/srv/infra`. Este projeto sobe somente a aplicação,
sem portas publicadas no host. O contrato atual usa domínio próprio na raiz:

| Item          | Valor                                    |
| ------------- | ---------------------------------------- |
| Domínio       | https://breve-link.macb.tech             |
| Rede externa  | proxy                                    |
| Alias e porta | breve-link-http:6001                     |
| Prefixo       | vazio, tanto no build quanto na execução |
| Dados         | /srv/data/breve-link → /app/database     |
| Banco         | /app/database/base.sqlite                |

O Compose define `APP_ORIGEM`, porta, prefixo e produção. Configure `.env` com
`JWT_SEGREDO` aleatório de pelo menos 32 bytes, `CORS_ORIGENS=` e `TRUST_PROXY`
contendo IPs/CIDRs autorizados da rede real. O Nginx atual tem IP dinâmico; a VPS
orienta registrar o CIDR da rede `proxy`. Confiar nesse CIDR inclui os outros
contêineres conectados. Para restringir ao IP `/32` do Nginx, primeiro reserve um
IP estável na infraestrutura. Não use `true`, nomes de redes ou CIDR `/0`.

## Preparar e iniciar

```sh
cd /srv/apps/breve-link
git switch dev
cp .env.example .env
# Preencher .env sem substituir um ambiente existente.
docker network inspect proxy
docker compose config --quiet
docker compose build
install -d -m 750 /srv/data/breve-link
docker compose run --rm --no-deps --entrypoint id breve-link
# Aplicar chown UID:GID usando os números verificados na imagem.
docker compose up -d
docker compose ps
docker compose exec -T breve-link node -e "fetch('http://127.0.0.1:6001/api/saude').then(r=>{if(!r.ok)process.exit(1)})"
```

A pasta deve existir e ser gravável pelo usuário da imagem. Não usar modo 777.
As migrations são automáticas. Para criar o administrador, preencher `ADMIN_EMAIL`
e `ADMIN_SENHA` antes de iniciar e executar:

```sh
docker compose exec -T breve-link node -e "const {Knex}=require('./api/build/config/knex');const {seed}=require('./api/build/seeds/001_InserirUsuarioAdministrador');seed(Knex).then(()=>Knex.destroy()).catch(e=>{console.error(e.message);process.exit(1)})"
```

O seed não redefine contas existentes. Remover `ADMIN_SENHA` do ambiente e recriar
com `docker compose up -d --force-recreate` após o bootstrap.

## Proxy e validação

A VPS já fornece o modelo `/srv/infra/nginx/sites-available/breve-link.https.conf`.
A ativação TLS segue o manual da infraestrutura, após emissão do certificado.
O deploy desta aplicação não instala rotas nem reinicia Nginx.

Validar `/`, `/dashboard`, `/api/saude`, login/logout, assets e um link curto
`https://breve-link.macb.tech/SLUG`. Confirmar IP e HTTPS pelo proxy e persistência
após recriar o contêiner. A configuração antiga com `/breve-link` exige migrar as
URLs públicas existentes; não há redirecionamento automático do domínio antigo.

## Atualização e backup

Construir a nova imagem antes de parar. Com os escritores parados, copiar o
conteúdo completo de `/srv/data/breve-link`, incluindo auxiliares SQLite, para
um backup datado e protegido. Só subir após confirmar o backup. Guardar imagem e
commit anteriores e uma cópia externa. Para restaurar, parar a aplicação, preservar
os dados atuais e repor uma cópia consistente com dono correto e código compatível.
Não misturar bancos ou arquivos WAL de instâncias diferentes.

```sh
docker compose build
docker compose stop breve-link
# Fazer e verificar o backup consistente antes de continuar.
docker compose up -d
docker compose logs --tail=50 breve-link
```

Para desenvolvimento, os padrões continuam sendo porta 3000 e prefixo vazio.
O suporte opcional a `APP_CAMINHO_BASE=/breve-link` continua disponível fora deste
contrato; exige o mesmo prefixo no build do frontend e na execução da API.

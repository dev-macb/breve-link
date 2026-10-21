# Deploy na VPS

O breve-link tem seu próprio Docker Compose, sem Nginx ou Certbot. O servidor
administra domínio, HTTPS e rotas em `/srv/infra/proxy`. Atualizar a aplicação
não altera nem reinicia o proxy ou as demais aplicações.

## Contrato com o servidor

| Item                      | Configuração                             |
| ------------------------- | ---------------------------------------- |
| Código                    | `/srv/apps/breve-link`                   |
| Dados persistentes        | `/srv/data/breve-link` → `/app/database` |
| Banco                     | `/app/database/base.sqlite`              |
| Rede externa              | `vps-proxy`, previamente criada pela VPS |
| Destino HTTP interno      | `breve-link:3000`                        |
| Prefixo público           | `/breve-link`, preservado pelo proxy     |
| Portas publicadas no host | Nenhuma                                  |

O servidor decide quando instalar a rota pública. O alias `breve-link` deve ser
único na rede. Serviços de banco de outras aplicações não precisam entrar nela.

## Preparar a aplicação

No servidor, clonar o projeto em `/srv/apps/breve-link`. Copiar `.env.example`
para `.env` e configurar:

- `APP_ORIGEM=https://SEU_DOMINIO`, somente a origem, sem `/breve-link`.
- `JWT_SEGREDO` aleatório com pelo menos 32 bytes.
- `ADMIN_EMAIL` e `ADMIN_SENHA` para criar o administrador explicitamente.
- `CORS_ORIGENS` vazio, usando painel e API no mesmo domínio.
- `TRUST_PROXY` com o IP/CIDR exato do Nginx autorizado pela VPS. Por exemplo,
  `172.30.42.2/32` somente se esse for o IP real e fixo do proxy. Não confiar
  na rede inteira quando bastar confiar no proxy.

O Compose exige `TRUST_PROXY` preenchido e define produção, escuta em
`0.0.0.0:3000`, caminho do banco e `/breve-link` no build e na execução.
Não colocar segredos nos argumentos de build. O arquivo `.env` não entra na imagem.

Confirme que a infraestrutura do servidor criou a rede:

```sh
docker network inspect vps-proxy
cd /srv/apps/breve-link
docker compose config --quiet
docker compose build
```

Prepare o bind mount com o proprietário da imagem, usando privilégios de
administração na VPS. O usuário padrão `node` da imagem tem UID/GID 1000;
confirme na imagem construída antes de aplicar permissões:

```sh
install -d -m 750 /srv/data/breve-link
docker compose run --rm --no-deps --entrypoint id breve-link
chown 1000:1000 /srv/data/breve-link
```

Se a imagem utilizar outro UID/GID, adaptar o comando. Para um diretório com
dados existentes, verificar e corrigir também o proprietário dos arquivos,
sem sobrescrever o banco. O Compose falha se a pasta estiver ausente, evitando
criar silenciosamente um destino incorreto. Não usar permissões 777.

## Inicializar

```sh
docker compose up -d
docker compose ps
docker compose logs --tail=50 breve-link
```

As migrations são automáticas ao iniciar. Espere o container ficar saudável antes
de criar o administrador:

```sh
docker compose exec -T breve-link node -e "const {Knex}=require('./api/build/config/knex');const {seed}=require('./api/build/seeds/001_InserirUsuarioAdministrador');seed(Knex).then(()=>Knex.destroy()).catch(e=>{console.error(e.message);process.exit(1)})"
```

O seed não redefine contas existentes. Após o bootstrap, remover `ADMIN_SENHA`
do `.env` de produção e recriar o container para retirar a senha de seu ambiente.
Manter as credenciais em local apropriado para acesso administrativo.

## Instalar a rota na VPS

O arquivo [nginx-breve-link.conf](nginx-breve-link.conf) é um modelo para o
administrador instalar em `/srv/infra/proxy/rotas/breve-link.conf`.
O deploy da aplicação não copia esse arquivo automaticamente.

Remover primeiro os locations que reservavam `/breve-link` com 404, caso existam.
Incluir o arquivo dentro do `server` HTTPS compartilhado; preservar as demais
rotas e a configuração de certificados da VPS. O proxy precisa estar na rede
`vps-proxy`. O modelo usa o DNS Docker, preserva o prefixo e sobrescreve headers
de cliente, pressupondo entrada direta da internet. Se existir CDN ou outro proxy
anterior, revisar essa topologia e as origens confiáveis antes de implantar.

```sh
cd /srv/infra/proxy
docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload
```

Executar o reload somente se a validação passar. Estes comandos pressupõem o
serviço `nginx` e o diretório de rotas montado no proxy conforme o contrato da VPS.

## Validar

- Painel em `https://SEU_DOMINIO/breve-link/` e login/logout funcionando.
- Acesso direto e atualização de `/breve-link/dashboard` e páginas internas.
- Saúde em `/breve-link/api/saude`, assets e páginas públicas de erro acessíveis.
- Criar um link e abrir `https://SEU_DOMINIO/breve-link/SLUG`.
- Confirmar IP do cliente e HTTPS através do proxy.
- Recriar a aplicação e conferir persistência e resolução pelo proxy.
- Confirmar que `/` e `/lembrei-de-maria` continuam funcionando.

## Atualizar e fazer backup

Construir antes de parar a aplicação. Depois, com escrita interrompida, copiar
o diretório inteiro do SQLite para um backup datado, incluindo auxiliares:

```sh
cd /srv/apps/breve-link
git pull --ff-only
docker compose build
instante=$(date +%Y%m%d-%H%M%S)
backup_dir="/srv/backups/breve-link-$instante"
install -d -m 700 "$backup_dir"
docker compose stop breve-link
cp -a /srv/data/breve-link/. "$backup_dir/"
docker compose up -d
docker compose ps
```

Somente prosseguir ao subir se o backup tiver concluído. Preservar a imagem/commit
anterior e uma cópia protegida fora da VPS. Não copiar somente o banco durante
escrita. Atualizar a aplicação não exige reiniciar o proxy.

Para restaurar, parar a aplicação, preservar os dados atuais e repor o diretório
consistente do backup, com proprietário correto e uma versão do código compatível
com o schema. Não misturar arquivos auxiliares de instâncias diferentes.
Não executar limpeza global de volumes ou de `/srv/data` durante o deploy.

## Desenvolvimento e uso sem subdiretório

Fora do Compose, `APP_CAMINHO_BASE` vazio mantém a aplicação na raiz. Para
desenvolver com prefixo, definir `/breve-link` no `.env` e abrir o painel nesse
caminho no Vite. Alterar o prefixo exige recompilar o frontend e manter o mesmo
valor na execução da API. `APP_ORIGEM` continua sendo somente a origem.

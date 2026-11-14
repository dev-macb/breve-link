# Deploy automático

## Pipeline

Arquivo: `.github/workflows/ci.yml`.

| Evento                  | CI  | Deploy         |
| ----------------------- | --- | -------------- |
| Push em qualquer branch | Sim | Somente `main` |
| Pull request            | Sim | Não            |
| `workflow_dispatch`     | Sim | Somente `main` |

O deploy depende de `build-e-testes`, usa o environment `production` e não cancela uma execução em andamento. O CI executa as verificações da aplicação, `bash -n .github/scripts/deploy.sh` e build da imagem Docker.

## GitHub

Criar o environment `production`, restringir a `main` e configurar:

| Secret            | Conteúdo                                         |
| ----------------- | ------------------------------------------------ |
| `VPS_HOST`        | `187.77.63.198`                                  |
| `VPS_USER`        | `macb`                                           |
| `VPS_PORT`        | Porta SSH; padrão `22`                           |
| `VPS_SSH_KEY`     | Chave privada de deploy sem senha                |
| `VPS_KNOWN_HOSTS` | Chave pública do servidor em formato known_hosts |

Instalar a chave pública de deploy em `~/.ssh/authorized_keys` na VPS. Verificar a impressão digital do servidor pelo console da Hostinger; para porta não padrão, usar `[host]:porta` no known_hosts. SSH usa `StrictHostKeyChecking=yes` e autenticação não interativa.

Para deploy sem intervenção, desabilitar aprovação manual no environment. Proteger `main` exigindo `build-e-testes`. Push direto em `main` também publica após CI aprovado.

## VPS

- Checkout: `/srv/apps/breve-link`, branch `main`, árvore limpa e `origin` correspondente ao repositório.
- Git, Bash, `flock`, Docker e Compose com `--wait` e `--wait-timeout`.
- Acesso Docker sem sudo interativo; escrita no checkout e no home.
- `.env` configurado, rede externa `proxy` e `/srv/data/breve-link` com permissões para o usuário da imagem.
- Repositório privado: credencial de leitura do GitHub na VPS para `git fetch`.
- Mesmo usuário SSH nos dois projetos para compartilhar `$HOME/.hostinger-deploy.lock`.

## Execução

1. Actions envia `.github/scripts/deploy.sh` por SSH com `GITHUB_SHA`.
2. O script adquire o lock compartilhado; espera até 1.800 segundos.
3. Verifica branch, árvore Git, `.env`, diretório de dados, Docker, rede e suporte do Compose.
4. Busca `origin/main`; ignora a execução se o SHA solicitado não for mais o topo remoto.
5. Atualiza o checkout por fast-forward e confirma o SHA.
6. Valida o Compose e compila a imagem.
7. Executa `docker compose up -d --no-build --wait --wait-timeout 180`.
8. Exibe o estado dos serviços. Falhas retornam código diferente de zero.

## Reexecução

Em Actions → CI e deploy → Run workflow, selecionar `main`. A execução refaz CI e build antes do deploy. Selecionar outra branch executa apenas CI.

## Limitações

- Sem configuração automática de secrets, SSH ou environment.
- Sem transferência de `.env`, criação de rede/dados ou alteração de Nginx/TLS.
- Sem backup ou rollback automático; migrations podem alterar o banco.
- Healthcheck interno; não verifica DNS ou acesso HTTPS público.
- O SHA é comparado ao topo remoto antes do build; um push posterior será publicado por outra execução.
- Build na VPS usa tags e dependências do Dockerfile; não transfere a imagem construída no CI.

Em falha, consultar Actions e `docker compose ps` na VPS. Fazer backup consistente antes da publicação; restaurar código e banco compatíveis quando necessário.

# Deploy automático na main

O workflow `.github/workflows/ci.yml` valida os pushes e pull requests. Somente
um push na `main` (incluindo merge de PR) publica na VPS, após todas as
verificações passarem. Proteger a `main` exigindo o job `build-e-testes` evita
merges com CI falhando. Push direto na main também dispara deploy.

## Configuração única no GitHub

Em cada repositório, criar o environment `production`, restringir a branch a
`main` e cadastrar estes secrets (Settings → Environments → production):

| Secret            | Valor                                                       |
| ----------------- | ----------------------------------------------------------- |
| `VPS_HOST`        | `187.77.63.198`                                             |
| `VPS_USER`        | `macb`                                                      |
| `VPS_PORT`        | Porta SSH; opcional, padrão `22`                            |
| `VPS_SSH_KEY`     | Chave privada exclusiva para o deploy, sem senha            |
| `VPS_KNOWN_HOSTS` | Linha de known_hosts da VPS, verificada por canal confiável |

Adicionar a chave pública correspondente ao `~/.ssh/authorized_keys` do usuário
na VPS. A chave privada fica somente no GitHub. Confirmar a impressão digital
da chave do servidor pelo console da Hostinger antes de cadastrar known_hosts;
para porta diferente de 22, o registro deve usar `[host]:porta`.
Para publicação automática, o environment não pode exigir aprovação manual.

## Preparação da VPS

O usuário SSH precisa de Git, Bash, `flock`, Docker e Docker Compose com suporte
a `up --wait --wait-timeout`, acesso ao Docker sem sudo interativo e escrita no
checkout `/srv/apps/breve-link` e no próprio home. Os dois projetos devem usar o
mesmo usuário, pois compartilham o lock de build para a VPS de 1 CPU.

O checkout deve estar limpo, na branch `main`, com o remoto `origin` apontando
para este repositório. Conferir e preservar alterações locais antes de trocar
de branch; não executar reset ou clean para preparar o servidor. Se o repositório
for privado, configurar uma deploy key de leitura na VPS para o fetch do GitHub;
essa credencial é independente da chave usada pelo Actions para entrar na VPS.

Manter `.env`, rede `proxy`, diretórios de dados e permissões conforme a
documentação da aplicação. Fazer backup consistente dos dados antes da primeira
publicação. O workflow não transfere arquivos de ambiente nem altera Nginx/TLS.

## Execução e falhas

O Actions envia `.github/scripts/deploy.sh` por SSH e informa o SHA que passou
no CI. O script exige checkout limpo na main, faz fetch explícito da main e
ignora execuções cujo SHA já foi substituído por outro push. Atualiza somente
por fast-forward, valida o Compose recebido, compila e aguarda a saúde dos
contêineres por até 180 segundos. Erros fazem o job falhar. Builds das duas
aplicações são serializados na VPS; um deploy em andamento não é cancelado.

Sem rollback ou backup automático. Migrations da aplicação podem modificar o
banco: em falha, investigar logs na VPS e restaurar versão e banco compatíveis
conforme o procedimento operacional. O healthcheck verifica o contêiner; validar
também o domínio HTTPS após a primeira publicação.

Após enviar estes arquivos e fazer merge na main, acompanhar Actions → CI e
deploy → deploy. Enquanto os secrets e o checkout da VPS não estiverem prontos,
a publicação falhará explicitamente, sem solicitar senha interativa.

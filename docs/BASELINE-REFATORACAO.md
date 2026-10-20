# Fase 0 — Estado inicial da refatoração

Registro em 19/10/2026. Esta fase documenta o sistema existente; não altera contratos nem executa migrations ou seeds.

## Ambiente e verificações

- Node disponível: `v25.6.1`; npm: `11.9.0`.
- O checkout começou sem `node_modules`.
- `npm run build`: não pôde compilar porque `tsc` não estava instalado.
- `npm test -- --runInBand`: não pôde executar porque `jest` não estava instalado.
- Esses resultados são bloqueios de ambiente, não evidência de falha ou sucesso do código.
- A instalação inicial falhou com erro interno do npm e a segunda tentativa restrita falhou com `EPERM`. Instalação concluída fora da restrição, usando cache local: 598 pacotes instalados pelo lockfile.
- Após instalar: `npm test -- --runInBand` passou com **6 suítes e 74 testes**. A suíte atual não demonstra cobertura dos problemas apontados; regressões deverão acompanhar as correções.
- Após instalar: `npm run build` falhou com três erros TS2339 em `src/middlewares/LoggerMiddleware.ts`, linhas 17–19: `query`, `params` e `ip` não existem no tipo `IncomingMessage`. Falha preexistente registrada para correção na Etapa 1.
- Não existe script de lint no estado inicial.
- `package-lock.json` está versionado, embora conste no `.gitignore`; corrigir essa inconsistência na reorganização.

## Dados e inicialização

Não foi encontrado arquivo `.sqlite`, `.sqlite3` ou `.db` no checkout durante o inventário anterior à instalação. Portanto, não havia banco local identificado para copiar ou consultar migrations aplicadas. Isso não permite concluir que não exista banco em um ambiente implantado.

O desenvolvimento aponta para `base.sqlite` na raiz. Antes de mover o backend, preservar explicitamente esse caminho ou migrar o arquivo com backup. Não inicializar um banco vazio como substituto silencioso de um banco existente.

Há três migrations no código: usuários, links e acessos. O histórico aplicado não pôde ser consultado sem um banco existente. A tabela de acessos referencia links com exclusão em cascata.

Inconsistência de ambiente confirmada:

- Knex seleciona PostgreSQL apenas com `NODE_ENV=prod`.
- O boot executa migrations apenas com `NODE_ENV=producao`.
- `NODE_ENV=production` cai na configuração de desenvolvimento e não executa migrations no boot.

Não executar seeds de produção no baseline: o bootstrap administrativo será revisado para remover credenciais fixas e não redefinir senhas existentes.

## Contratos atuais

| Operação | Rota atual | Autenticação |
| --- | --- | --- |
| Login | `POST /usuarios/entrar` | Pública |
| Listar/criar usuários | `GET/POST /usuarios` | Bearer JWT de administrador |
| Consultar/editar/remover usuário | `GET/PATCH/DELETE /usuarios/:id` | Bearer JWT de administrador |
| Listar/criar links | `GET/POST /links` | Bearer JWT de administrador |
| Consultar/editar/remover link | `GET/PATCH/DELETE /links/:id` | Bearer JWT de administrador |
| Estatísticas | `GET /links/:id/stats` | Bearer JWT de administrador |
| Redirecionamento | `GET /links/redirecionar/:urlCurta` | Pública |

- O login responde com uma string JSON contendo o JWT; não configura cookie.
- O JWT atual expira em uma hora e carrega `id` e `administrador`.
- Não há rotas de logout, sessão atual ou saúde.
- Listagens respondem com arrays, sem metadados de paginação.
- Controllers de usuários retornam objetos do serviço sem DTO público.
- Erros variam entre `erro`, `error` e `msg`; exceções de domínio frequentemente viram 500.
- O controller de redirect usa `status(PERMANENT_REDIRECT).redirect(...)`; a emissão correta de 302 deve ser explícita e verificada por integração, sem presumir o status final dessa cadeia.

## Mudanças incompatíveis previstas

1. Prefixar gerenciamento com `/api` e consolidar autenticação em `/api/auth`.
2. Substituir Bearer no fluxo da interface por cookie `httpOnly` e restauração de sessão.
3. Retornar DTOs públicos e envelope de paginação.
4. Uniformizar corpo e status de erros.
5. Adicionar redirect na raiz e decidir preservação da rota pública antiga.
6. Padronizar ambiente e caminho do SQLite antes de implantar.

## Próxima entrega

Executar a Etapa 1 em blocos verificáveis: primeiro usuários (hash, DTO, normalização, remoção e logs), depois links/acessos, e então autenticação e proteção operacional. Testes de regressão acompanham cada bloco. A mudança de pastas continua reservada à Etapa 2.

O inventário e as verificações iniciais estão concluídos. As decisões ainda abertas estão no plano temporário e devem ser fechadas antes dos respectivos blocos dependentes; não impedem começar as correções de usuários.

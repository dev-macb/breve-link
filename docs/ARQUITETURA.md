# Arquitetura e banco

## Estrutura

```text
server/src/
  app.ts          Express sem abertura de porta
  index.ts        Configuração, migrations, inicialização e encerramento
  config/         Ambiente, sessão, injeção de dependências e Knex
  routes/         Rotas públicas e administrativas
  controllers/    Contratos HTTP
  validators/     Validação de entradas
  middlewares/    Autenticação, CSRF e erros
  services/       Regras de negócio e estatísticas
  repositories/   Persistência e agregações
  models/         Modelos e DTOs
  migrations/     Evolução do schema
  seeds/          Bootstrap explícito
  utils/          Parsing e fingerprint
server/tests/     Testes e exemplos HTTP
web/src/          Interface React
web/public/       Favicon e estilos de erro público
```

O monorepo usa npm workspaces, instalação e lockfile únicos na raiz. Backend em
TypeScript/CommonJS com Express, Inversify, Knex e SQLite. Frontend em React,
TypeScript, Vite, React Router, Tailwind, Lucide e Recharts.

O Express serve `/api`, redirects públicos e o build da interface. O fallback
HTML atende somente `/`, `/login`, `/dashboard`, `/links/:id` e `/indisponivel`.
A CSP restringe scripts e conexões à própria origem; estilos inline são permitidos
para gráficos. Não são carregadas fontes ou scripts de terceiros no painel.

## Fluxo de acesso

1. Validar o endereço e buscar o link.
2. Verificar ativação e expiração.
3. Em GET, interpretar headers, consultar a base GeoIP local e calcular o hash.
4. Gravar acesso e incrementar o contador em uma transação.
5. Enviar `302` ao destino; falhas de coleta/gravação são registradas e não bloqueiam o redirect.

Não há página intermediária ou JavaScript de coleta no redirect. A análise
refere-se à requisição recebida e não acompanha a navegação no destino.

## Schema SQLite

| Tabela | Campos e relações |
| --- | --- |
| `usuarios` | `id`, `nome`, `email`, `senha` (bcrypt), `ativo`, `administrador`, `versaoSessao`, `criadoEm`, `atualizadoEm` |
| `links` | `id`, `urlOriginal`, `urlCurta` único, `acessos`, `ativo`, `expiraEm` anulável, `criadoEm`, `atualizadoEm` |
| `acessos` | `id`, `linkId` → links com exclusão em cascata, `criadoEm` e campos técnicos abaixo |

Campos técnicos anuláveis de `acessos`: `ip`, `navegador`, `sistemaOperacional`,
`dispositivo`, `referrer`, `pais`, `cidade`, `userAgent`, `idioma`,
`versaoNavegador`, `versaoSistemaOperacional`, `metodo`, `caminho`, `clientHints`,
`fetchSite`, `fetchMode`, `fetchDest`, `dnt`, `gpc` e `hashDispositivo`.

Há índice para o histórico por `(linkId, id)` e índice único de e-mail normalizado.
As chaves estrangeiras são ativadas em cada conexão. As colunas UTM da migration
006 permanecem como legado; não são coletadas nem expostas na API atual.

## Migrations

As migrations 001–003 criam as tabelas; 004 normaliza e-mails e adiciona versão de
sessão; 005 detalha clientes; 006 acrescenta headers técnicos e hash.

`FonteMigrations` preserva nomes históricos `.ts`/`.js` e usa identidade `.ts` para
novas migrations, inclusive no build compilado. Assim, alternar entre fonte e
build não reaplica migrations. Arquivos ausentes e cópias ambíguas continuam
causando erro. Crie migrations em `server/src/migrations` e recompile o runtime.

```sh
npm run knex:make:migrate -- NomeDaMigration
npm run knex:migrate
```

Veja [operação](OPERACAO.md) para localização do banco, backup e atualização.

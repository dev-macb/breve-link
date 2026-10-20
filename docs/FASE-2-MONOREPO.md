# Fase 2 — Monorepo e ferramentas

Este documento registra a entrega da Fase 2. A interface e a execução conjunta
de API/frontend já estão disponíveis e são descritas na [Fase 3](FASE-3-INTERFACE.md).

## Estrutura atual

```text
breve-link/
├── server/
│   ├── src/
│   │   ├── app.ts                 # Express, sem abrir porta
│   │   ├── index.ts               # Boot, migrations e shutdown
│   │   ├── config/
│   │   │   ├── Ambiente.ts        # Raiz e leitura do .env
│   │   │   └── knex/
│   │   ├── controllers/
│   │   ├── dtos/
│   │   ├── erros/
│   │   ├── interfaces/
│   │   ├── middlewares/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── seeds/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── tests/                     # Unitários, integração e exemplos HTTP
│   ├── build/                     # Gerado; não versionado
│   ├── jest.config.ts
│   ├── knexfile.ts                 # Configuração do CLI
│   ├── tsconfig.json
│   ├── tsconfig.test.json
│   └── package.json
├── web/
│   ├── package.json               # Workspace reservado para a Fase 3
│   └── README.md
├── docs/
├── .env.example
├── eslint.config.mjs
├── tsconfig.base.json
├── package.json
└── package-lock.json              # Lockfile único
```

Os workspaces são privados e se chamam `@breve-link/server` e `@breve-link/web`.
Dependências de execução e testes do backend ficam em `server/package.json`;
ferramentas comuns de lint ficam na raiz. A instalação é feita uma vez, na raiz.

## Comandos na raiz

| Comando | Comportamento |
| --- | --- |
| `npm ci` | Instala os workspaces pelo lockfile único. |
| `npm run dev` | Inicia o backend em desenvolvimento. |
| `npm run build` | Executa os builds disponíveis; nesta etapa, somente backend. |
| `npm start` | Executa `server/build/index.js`. |
| `npm test -- --runInBand` | Executa os testes do backend, repassando argumentos ao Jest. |
| `npm run typecheck` | Checa backend, testes e configuração do Jest sem gerar arquivos. |
| `npm run lint` | Verifica código e configurações com ESLint; warnings falham a execução. |
| `npm run lint:fix` | Aplica correções automáticas disponíveis. |
| `npm run knex:migrate` | Aplica migrations pelo workspace do backend. |
| `npm run knex:seed` | Executa o bootstrap explícito do administrador. |
| `npm run knex:make:migrate -- nome` | Cria uma migration TypeScript em `server/src/migrations`. |
| `npm run knex:make:seed -- nome` | Cria uma seed em `server/src/seeds`. |
| `npm run knex:rollback` | Desfaz o último lote de migrations. |
| `npm run knex:rollback-all` | Desfaz todos os lotes; remove os dados das tabelas revertidas. |

Também é possível executar comandos diretamente com `npm run <comando> --workspace @breve-link/server`.
O workspace web ainda não tem servidor ou build: a interface será implementada na Fase 3.

## Ambiente e persistência

O `.env` continua na raiz. `server/src/config/Ambiente.ts` resolve o caminho pela
localização do código, com o mesmo resultado para `src/` e `build/`, sem depender
do diretório de execução do comando. Variáveis fornecidas pelo ambiente têm prioridade.

Sem `BD_ARQUIVO`, o SQLite continua em `base.sqlite` na raiz do repositório.
Um valor relativo de `BD_ARQUIVO`, como `data/base.sqlite`, também é relativo à raiz,
mesmo quando o comando roda dentro de `server/`. Caminhos absolutos continuam válidos.
O diretório do banco deve existir. O volume persistente do Docker fica para a etapa de implantação.

Nenhum banco existente foi movido. Não havia SQLite local no inventário desta refatoração.
Antes de aplicar em um ambiente com dados, manter backup conforme o plano.

## Migrations entre fonte e build

O Knex normalmente identifica migrations pelo nome completo do arquivo. Trocar
`.ts` por `.js` após compilar pode fazer uma migration já aplicada parecer ausente.
`FonteMigrations` separa o arquivo carregado de sua identidade no histórico:

- Nomes históricos `.ts` ou `.js` são preservados, sem reescrever a tabela de histórico.
- Novas migrations têm identidade estável com sufixo `.ts`, inclusive no build compilado.
- O arquivo executado é o que existe no diretório atual: fonte TS ou build JS.
- A consulta do histórico em banco de arquivo usa uma conexão curta somente de leitura.
- Migrations ausentes continuam causando erro; a validação do histórico não foi desligada.
- Cópias TS/JS da mesma migration no mesmo diretório são rejeitadas para evitar ambiguidade.

Os testes de regressão verificam as duas extensões legadas, manutenção dos dados e rollback.
Migrations e seeds novas devem ser criadas em `src/` e compiladas antes de executar o runtime.

## Qualidade

ESLint usa flat config, regras recomendadas de JavaScript e TypeScript e ambientes
distintos para backend, testes e frontend. Artefatos de build, cobertura e dependências
são ignorados. `any` explícito continua permitido para compatibilidade com os contratos
legados; checagem estrita de tipos e regras de variáveis não usadas permanecem ativas.

TypeScript compartilha as opções gerais em `tsconfig.base.json`; decorators e CommonJS
ficam no backend. Os testes possuem configuração própria e não entram no build de produção.
O projeto declara Node `^22.13.0 || >=24` e npm `>=10`.

## Verificação da entrega

- Instalação limpa com `npm ci` usando o lockfile único.
- Build, checagem de tipos e lint aprovados.
- 108 testes em 12 suítes aprovados, incluindo as duas extensões legadas de migrations.
- Smoke com migrations e seed pelos comandos da raiz, seguido de boot compilado em
  `server/` com o mesmo SQLite temporário: health check, dados e histórico preservados.
- Bancos e arquivos temporários de verificação removidos ao final.

## Próxima etapa

Scaffold de React/Vite, autenticação da interface, dashboard e estatísticas no workspace `web/`.
O plano temporário contém os critérios de aceitação dessas entregas.

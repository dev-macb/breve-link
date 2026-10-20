# Breve Link

Redirecionador pessoal de URLs com painel privado para gerenciar links e estudar
os acessos. Dados e fingerprints ficam no SQLite local; o redirecionamento não
consulta serviços externos.

## Instalação

Requisitos: Node.js `^22.13.0 || >=24` e npm `>=10`.

```sh
git clone https://github.com/dev-macb/breve-link
cd breve-link
npm ci
```

Copie `.env.example` para `.env` na raiz. Configure `APP_ORIGEM`, `JWT_SEGREDO`,
`ADMIN_EMAIL` e `ADMIN_SENHA`. Troque as credenciais de exemplo. Para gerar um
segredo de sessão:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Inicialize o banco e o administrador:

```sh
npm run knex:migrate
npm run knex:seed
npm run dev
```

Abra [o painel local](http://localhost:5173). A API usa a porta 3000 por padrão.
Os links copiados usam `APP_ORIGEM`, independentemente da porta do painel.

## Uso

- Crie um link com destino HTTP/HTTPS e endereço curto opcional.
- Copie, edite, pause, defina expiração ou exclua pelo dashboard.
- Abra as estatísticas para inspecionar IP, cliente, headers e fingerprint.
- Expanda um evento para ver seus detalhes técnicos; a tabela de fingerprints
  reúne os 20 hashes mais frequentes do link, com primeiro e último acesso.

O painel usa visual de console, azul como destaque e temas escuro, claro e sistema.
Os contadores de ativos e acessos do dashboard consideram a página exibida.

## Execução compilada

```sh
npm run build
npm start
```

O Express serve API e interface em `APP_ORIGEM`. O build produz `server/build/`
e `web/dist/`. Em produção, configure HTTPS e persistência do banco conforme
[o guia de operação](docs/OPERACAO.md).

## Desenvolvimento

O projeto usa npm workspaces: `server/` para Express/TypeScript e `web/` para
React/Vite. `.env`, comandos e lockfile ficam na raiz.

| Comando | Uso |
| --- | --- |
| `npm run dev` | API e interface em desenvolvimento |
| `npm run dev:server` / `npm run dev:web` | Iniciar apenas um workspace |
| `npm run build` | Compilar backend e interface |
| `npm run typecheck` | Verificar tipos, incluindo testes |
| `npm run lint` | Verificar código e configurações |
| `npm test -- --runInBand` | Testes do backend |
| `npm run test:web` | Testes da interface |

## Documentação

- [Operação e configuração](docs/OPERACAO.md)
- [API e autenticação](docs/API.md)
- [Arquitetura e banco](docs/ARQUITETURA.md)
- [Interface e navegação](docs/INTERFACE.md)
- [Coleta e fingerprints](docs/ACESSOS-FINGERPRINT.md)
- [Identidade visual](docs/IDENTIDADE-VISUAL.md)

A coleta é feita na requisição ao redirecionador, sem acompanhar a navegação no
destino. GET inclui bots e previews; HEAD não contabiliza acesso. O fingerprint
correlaciona headers e não identifica pessoas. Falhas de coleta podem deixar o
histórico incompleto, mas não bloqueiam o destino.

Licença [MIT](LICENSE).

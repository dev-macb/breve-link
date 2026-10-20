# Fase 3 — Interface administrativa

## Entrega

Interface local em React, TypeScript, Vite, Tailwind v4 e React Router no workspace
`web/`, com ícones Lucide e gráficos Recharts. Os textos estão em PT-BR. Tema escuro
como padrão, com opções claro e sistema; a preferência fica no navegador.

### Telas e fluxos

- Login com credenciais, mensagem de erro, visualização opcional de senha e estado de envio.
- Restauração de sessão via cookie, proteção das páginas, logout e retorno à rota original após login.
- Usuários sem papel de administrador recebem uma página de acesso restrito.
- Dashboard com busca por endereço curto ou URL de destino, paginação e tamanho de página.
- Criação com endereço personalizado opcional e expiração; edição de destino, endereço, ativação e expiração.
- Cópia com feedback e tratamento de falha da área de transferência.
- Exclusão com confirmação explícita, indicação da perda de estatísticas e tratamento de erro.
- Estatísticas por link, gráfico diário e distribuições de navegadores, sistemas, dispositivos, países e referrers.
- Estados de carregamento, lista vazia, busca sem resultados, falha com nova tentativa e registro inexistente.
- Página `/indisponivel` preparada para a integração pública da próxima etapa.

Os modais usam `dialog` nativo, mantêm o foco dentro da janela, posicionam o foco
inicial no formulário ou no cancelamento e permitem fechar com Escape quando não
há operação pendente. Inputs têm labels, ações com ícones têm nomes acessíveis e
avisos usam regiões de anúncio. O layout se adapta ao celular e respeita redução de movimento.

## Executar localmente

Na raiz do projeto:

```sh
npm ci
```

Copiar `.env.example` para `.env` e preencher `JWT_SEGREDO`, `ADMIN_EMAIL` e
`ADMIN_SENHA`. A origem pública padrão é `http://localhost:3000` e a interface usa
`http://localhost:5173`. Depois:

```sh
npm run knex:migrate
npm run knex:seed
npm run dev
```

`npm run dev` inicia API e frontend juntos. Os comandos separados são
`npm run dev:server` e `npm run dev:web`. O proxy do Vite encaminha somente `/api`
e a rota legada de redirect, preservando as rotas React.

Se a porta da API mudar, ajustar `APP_PORTA`, `APP_ORIGEM` e `WEB_API_DESTINO`.
`CORS_ORIGENS` deve incluir a origem exata da interface; o exemplo contempla o
desenvolvimento na porta 5173 e o preview de build na porta 4173.

O cliente envia cookies e o cabeçalho de proteção CSRF nas operações de escrita.
Tokens não são retornados ao JavaScript nem gravados em localStorage. Somente a
preferência de tema usa esse armazenamento. Respostas 401 das operações autenticadas
encerram a sessão da interface; erros de login permanecem no formulário, sem loop.

## Estrutura do frontend

```text
web/
├── src/
│   ├── main.tsx
│   ├── app/                 # Rotas, sessão e avisos
│   ├── componentes/         # Layout, modal e estados compartilhados
│   ├── funcionalidades/
│   │   └── links/           # Formulário de criação/edição
│   ├── paginas/             # Login, dashboard e estatísticas
│   ├── services/            # HTTP autenticado e testes
│   ├── tipos/               # Contratos públicos usados pela interface
│   ├── utils/               # Datas, URLs, estados e testes
│   └── estilos/             # Tailwind e tokens visuais
├── public/favicon.svg
├── index.html
├── tsconfig.json
└── vite.config.ts
```

Dashboard e estatísticas são carregados sob demanda. A biblioteca de gráficos não
entra no carregamento inicial do login. O build sai em `web/dist/`.

## Ajustes da API para a interface

- `GET /api/configuracao`, autenticado e sem cache, informa `origemPublica` a partir de
  `APP_ORIGEM`. Os links copiados usam essa origem, mesmo com frontend em outra porta.
- `GET /:urlCurta` foi antecipado da Fase 4 para tornar os links copiados utilizáveis.
  Aplica validação, reserva de nomes, limite de requisições e as regras de redirect existentes.
- A rota pública anterior `/links/redirecionar/:urlCurta` continua funcionando.
- Busca e contagem de links consideram endereço curto e destino com os mesmos filtros.
- `indisponivel` passou a integrar a lista de nomes reservados.

## Significado das métricas

No dashboard, o total corresponde à lista/busca inteira. Os indicadores de links
ativos e acessos têm rótulo explícito de **página atual**; não simulam um resumo global.

O gráfico cobre os últimos 30 dias, incluindo hoje, com agrupamento em UTC e dias
sem acessos preenchidos com zero. Total de acessos e distribuições consideram todo
o histórico. Países identificados não contam a categoria desconhecida. Localização
é aproximada e acessos podem incluir robôs, não representando pessoas únicas.

Formulários de expiração usam o horário local do dispositivo e enviam ISO UTC.
Remover a data envia `null`. Datas antigas de um link expirado não são reenviadas
ao editar apenas seu destino. A API ainda retorna a série histórica inteira; filtros
e limites adicionais de consulta podem ser tratados na evolução das estatísticas.

## Verificação

```sh
npm run lint
npm run typecheck
npm test -- --runInBand
npm run test:web
npm run build
```

- Backend: 109 testes em 12 suítes.
- Frontend: 11 testes em duas suítes, cobrindo cookies/CSRF, tratamento de 401/403,
  cancelamento de buscas, mensagens de erro, estados e limites de datas UTC.
- Navegador: login inválido/válido, restauração de sessão, criação, slug reservado,
  cópia, edição, pausa, expiração e remoção da data, busca por destino, paginação,
  confirmação/cancelamento da exclusão, estatísticas vazias e com acessos, páginas
  de erro, temas, foco, Escape, logout, rota protegida e revogação de sessão.
- Desktop em 1366×900 e celular em 390×844, sem transbordamento horizontal observado.
- Exclusão efetiva verificada por HTTP, somente no banco temporário de QA.

O QA usa uma conta sintética e um SQLite temporário, sem dados de produção. Os
processos e dados temporários são removidos ao encerrar a verificação.

## Filtros da listagem na URL

A listagem usa os parâmetros `filtro`, `pagina` e `limite`, por exemplo:
`/dashboard?filtro=docs&pagina=2&limite=20`. Abrir ou atualizar esse endereço
restaura os controles e a consulta, assim como voltar/avançar no navegador.

Busca vazia, página 1 e limite 10 são omitidos da URL. Alterar a busca ou o
limite retorna à primeira página. A busca atualiza o endereço sem criar uma
entrada de histórico por tecla e mantém o intervalo de 300 ms entre alterações
antes de consultar a API; paginação e tamanho da lista criam entradas no histórico.
Páginas inválidas usam 1, limites fora de 10/20/50 usam 10 e o filtro aceita até
200 caracteres. Parâmetros adicionais são preservados.

## Integração do build

A integração foi concluída na [Fase 4](FASE-4-INTEGRACAO.md): após `npm run build`,
`npm start` serve frontend e API pelo Express. O desenvolvimento com Vite continua
disponível em `npm run dev`. Redirects preservam JSON para clientes de API e
oferecem páginas HTML de 404/410 para navegação no navegador.

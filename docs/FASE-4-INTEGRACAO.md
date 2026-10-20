# Fase 4 — Frontend e API no Express

O build completo agora é servido pelo Express. Não é necessário manter o Vite
em execução para usar a aplicação compilada.

## Executar

Após instalar dependências e configurar `.env` conforme o README:

```sh
npm run build
npm start
```

Abra `APP_ORIGEM` (por padrão local, `http://localhost:3000`). O build gera
`server/build/` e `web/dist/`; ambos devem acompanhar o runtime. O caminho da
interface é absoluto e independe do diretório de execução. Em produção, a
inicialização exige `web/dist/index.html`, além das validações existentes de
HTTPS, segredo de sessão e banco. As migrations continuam automáticas no boot;
o bootstrap inicial do administrador permanece via `npm run knex:seed`.

`npm run dev` continua iniciando API e Vite separadamente, com atualização
automática da interface e proxy de API. O endereço público copiado pelo painel
continua vindo de `APP_ORIGEM`, não da porta do Vite.

## Ordem e contratos das rotas

| Requisição | Resposta |
| --- | --- |
| `/api/*` | API; endpoint desconhecido devolve 404 JSON, inclusive quando o cliente pede HTML. |
| `/links/redirecionar/:slug` | Redirect legado mantido. |
| Arquivo existente em `web/dist/` | Conteúdo estático com MIME correto. Arquivos ocultos não são servidos. |
| `/`, `/login`, `/dashboard`, `/links/:id`, `/indisponivel` | `index.html` para navegação GET/HEAD que aceita HTML; React restaura a sessão e controla o acesso. |
| `/:slug` válido e não reservado | Redirect público 302, com `Cache-Control: no-store`. |
| Link ausente | 404; HTML para navegação que pede `text/html`, JSON para demais clientes. |
| Link pausado ou expirado | 410, com a mesma negociação HTML/JSON e sem registrar acesso. |
| Outras rotas ou arquivos ausentes | 404, sem devolver o HTML da SPA como sucesso. |

O fallback é uma lista explícita de páginas, compatível com Express 5. Ele não
captura a API, arquivos inexistentes, métodos de escrita ou slugs desconhecidos.
Mounts administrativos antigos não são reintroduzidos; somente o redirect
legado permanece público. GET registra o acesso ao redirecionar; HEAD verifica
disponibilidade e destino sem aumentar o contador.

## Cache e segurança do navegador

- Navegação da SPA, redirects e páginas públicas de erro usam `no-store`.
- Arquivos gerados em `assets/` usam cache de um ano e `immutable`; Vite inclui
  hashes nos nomes. Os demais arquivos estáticos usam `no-cache` para revalidação.
- A CSP mantém scripts e conexões na própria origem, sem scripts inline nem
  `eval`. Estilos inline continuam permitidos para os componentes de gráficos;
  não são carregadas fontes ou folhas de estilo de terceiros.
- `upgrade-insecure-requests` permanece em produção e fica desativado no
  desenvolvimento HTTP local. Cookies seguros de produção continuam exigindo HTTPS.
- As páginas públicas de erro funcionam sem JavaScript e usam `/erro.css`.

## Verificação

```sh
npm run lint
npm run typecheck
npm run build
npm test -- --runInBand
npm run test:web
```

123 testes de backend em 13 suítes e 11 testes de frontend passaram. A suíte
de interface usa arquivos temporários para verificar navegação direta, HEAD,
cache, API/arquivos ausentes, 404/410 e exclusão dos métodos de escrita do fallback.
A suíte de API verifica que HEAD nos redirects canônico e legado não registra
acessos e que GET preserva a contagem sob concorrência.

O smoke do backend compilado, com SQLite temporário, validou a matriz principal
de rotas. No navegador, o build servido pelo Express foi verificado com login,
painel, atualização direta com restauração de sessão e página pública 410, sem
avisos ou erros no console. Nenhum dado local existente foi usado nesse QA.

Referências: [Express 5](https://expressjs.com/en/5x/api/),
[configuração e CSP do Helmet](https://helmet.js.org/).

Próxima fase: Docker, persistência e implantação.

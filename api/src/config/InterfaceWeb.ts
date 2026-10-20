import express, { ErrorRequestHandler, RequestHandler } from 'express';
import path from 'path';
import { existsSync } from 'fs';
import { RAIZ_PROJETO } from './Ambiente';
import { ErroDominio, RecursoNaoEncontrado } from '../erros';

export const DIRETORIO_WEB = path.join(RAIZ_PROJETO, 'app', 'dist');

// Somente páginas conhecidas recebem index.html. Arquivos e slugs nunca usam fallback.
export function interfaceWeb(diretorio = DIRETORIO_WEB): RequestHandler {
    const router = express.Router();
    router.use(
        express.static(diretorio, {
            index: false,
            redirect: false,
            dotfiles: 'deny',
            setHeaders(res, arquivo) {
                const versionado = path.dirname(arquivo) === path.join(diretorio, 'assets');
                res.setHeader(
                    'Cache-Control',
                    versionado ? 'public, max-age=31536000, immutable' : 'no-cache'
                );
            }
        })
    );
    router.get(['/', '/login', '/dashboard', '/links/:id', '/indisponivel'], (req, res, next) => {
        if (!req.accepts('html')) {
            return next(new RecursoNaoEncontrado('Rota não encontrada'));
        }
        if (!existsSync(path.join(diretorio, 'index.html'))) {
            return next(new RecursoNaoEncontrado('Interface não compilada; execute npm run build'));
        }
        res.set('Cache-Control', 'no-store');
        res.sendFile(path.join(diretorio, 'index.html'));
    });
    return router;
}

// Erros públicos mantêm o status HTTP e funcionam mesmo sem JavaScript/build.
export const erroPublico: ErrorRequestHandler = (erro, req, res, next) => {
    if (
        res.headersSent ||
        /^\/api(?:\/|$)/i.test(req.path) ||
        !['GET', 'HEAD'].includes(req.method) ||
        !req.get('Accept')?.includes('text/html') ||
        !req.accepts('html') ||
        !(erro instanceof ErroDominio) ||
        ![404, 410].includes(erro.status)
    ) {
        return next(erro);
    }
    const indisponivel = erro.status === 410;
    const titulo = indisponivel ? 'Esta conexão está em pausa.' : 'Esse caminho não existe.';
    const mensagem = indisponivel
        ? 'O link pode ter expirado ou sido desativado. Peça um novo endereço a quem o compartilhou.'
        : 'Verifique o endereço ou volte aos seus links para continuar.';
    res.status(erro.status)
        .set('Cache-Control', 'no-store')
        .type('html')
        .send(
            `<!doctype html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${titulo} — Breve Link</title>
    <script src="/tema.js"></script>
    <link rel="stylesheet" href="/erro.css">
</head>
<body>
    <main aria-labelledby="pagina-titulo">
        <div class="public-panel">
            <a class="marca" href="/" aria-label="Breve Link, início"><span class="marca-simbolo" aria-hidden="true">[b]</span><span>breve_link<span class="marca-ponto">/</span></span></a>
            <h1 id="pagina-titulo">${titulo}</h1>
            <p>${mensagem}</p>
            <a class="public-page-action" href="/">Voltar ao início</a>
        </div>
    </main>
</body>
</html>`
        );
};

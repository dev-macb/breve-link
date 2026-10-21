import { origensPermitidas } from './config/Origens';
import './config/Ambiente';
import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { acessoRouter, usuarioRouter, linkRouter } from './routes';
import { autenticacaoRouter } from './routes/AutenticacaoRouter';
import { CsrfMiddleware } from './middlewares/CsrfMiddleware';
import { ErroMiddleware } from './middlewares/ErroMiddleware';
import { Proibido, RecursoNaoEncontrado } from './erros';
import { Knex } from './config/knex';
import { container } from './config/Conteiner';
import { TIPOS } from './config/Constantes';
import { LinkController } from './controllers/LinkController';
import { ILinkValidator } from './interfaces';
import { AutenticacaoMiddleware } from './middlewares/AutenticacaoMiddleware';
import { SlugUtil } from './utils/SlugUtil';
import { interfaceWeb, erroPublico } from './config/InterfaceWeb';
import { GeolocalizacaoService } from './services/GeolocalizacaoService';
import { CAMINHO_BASE } from './config/CaminhoBase';

const servidor = express();
const rotas = express.Router();
// Configurar somente os proxies realmente presentes na implantação.
if (process.env.TRUST_PROXY) {
    servidor.set(
        'trust proxy',
        process.env.TRUST_PROXY.split(',').map((item) => item.trim())
    );
}
servidor.disable('x-powered-by');
servidor.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
            }
        }
    })
);
servidor.use(
    cors({
        credentials: true,
        origin(origem, callback) {
            const permitidas = origensPermitidas();
            callback(
                origem && !permitidas.includes(origem)
                    ? new Proibido('Origem não permitida')
                    : null,
                true
            );
        }
    })
);
servidor.use(express.json({ limit: '32kb' }));
servidor.use(cookieParser());
rotas.post(
    '/collect',
    rateLimit({ windowMs: 60000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false }),
    async (req, res) => {
        await GeolocalizacaoService.coletar(req.body);
        res.status(204).end();
    }
);
rotas.use(
    '/api',
    rateLimit({
        windowMs: 60 * 1000,
        limit: 300,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { erro: 'Limite de requisições excedido' }
    }),
    CsrfMiddleware
);
rotas.get('/api/saude', async (_req, res) => {
    await Knex.raw('SELECT 1');
    res.json({ status: 'ok' });
});
rotas.get('/api/configuracao', AutenticacaoMiddleware.Autenticado, (_req, res) => {
    res.set('Cache-Control', 'no-store').json({
        origemPublica: process.env.APP_ORIGEM + CAMINHO_BASE
    });
});
rotas.use('/api/auth', autenticacaoRouter);
rotas.use('/api/usuarios', usuarioRouter);
rotas.use('/api/links', linkRouter);
rotas.use('/api/links', acessoRouter);
rotas.use('/api', (_req, _res, next) => next(new RecursoNaoEncontrado('Rota não encontrada')));
// Compatibilidade com URLs públicas compartilhadas antes da refatoração.
const controllerRedirect = container.get<LinkController>(TIPOS.LinkController);
rotas.get(
    '/links/redirecionar/:urlCurta',
    rateLimit({
        windowMs: 60 * 1000,
        limit: 1000,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { erro: 'Limite de redirecionamentos excedido' }
    }),
    container.get<ILinkValidator>(TIPOS.ILinkValidator).redirecionar(),
    controllerRedirect.redirecionar.bind(controllerRedirect)
);
rotas.use(interfaceWeb());
// A interface usa a origem pública configurada, inclusive no desenvolvimento.
rotas.get(
    '/:urlCurta',
    (req, res, next) => {
        if (!SlugUtil.permitido(req.params.urlCurta)) {
            return next('route');
        }
        return container.get<ILinkValidator>(TIPOS.ILinkValidator).redirecionar()(req, res, next);
    },
    rateLimit({
        windowMs: 60 * 1000,
        limit: 1000,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { erro: 'Limite de redirecionamentos excedido' }
    }),
    controllerRedirect.redirecionar.bind(controllerRedirect)
);
rotas.use((_req, _res, next) => next(new RecursoNaoEncontrado('Rota não encontrada')));
rotas.use(erroPublico);
servidor.use(CAMINHO_BASE || '/', rotas);
// Erros anteriores ao router (JSON, CORS) também recebem o contrato JSON.
servidor.use(ErroMiddleware);
export { servidor };

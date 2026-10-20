import { RequestHandler } from 'express';
import { Proibido } from '../erros';

export const CsrfMiddleware: RequestHandler = (req, _res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    // Cabeçalho não simples exige preflight em requisições de outro origin.
    // A combinação de JSON, allowlist de Origin e SameSite também cobre login CSRF.
    if (req.get('X-Breve-CSRF') !== '1') return next(new Proibido('Cabeçalho de proteção CSRF ausente'));
    if (req.get('Sec-Fetch-Site') === 'cross-site') return next(new Proibido('Origem não permitida'));
    const origem = req.get('Origin');
    const permitidas = [process.env.APP_ORIGEM, ...(process.env.CORS_ORIGENS ?? '').split(',')].filter(Boolean);
    if (origem && !permitidas.includes(origem)) return next(new Proibido('Origem não permitida'));
    if (req.method !== 'DELETE' && !req.is('application/json')) return next(new Proibido('Use Content-Type application/json'));
    next();
};

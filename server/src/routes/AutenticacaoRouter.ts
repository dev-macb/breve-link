import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { container } from '../config/Conteiner';
import { TIPOS } from '../config/Constantes';
import { UsuarioController } from '../controllers/UsuarioController';
import { IUsuarioValidator } from '../interfaces';
import { AutenticacaoMiddleware } from '../middlewares/AutenticacaoMiddleware';
import { Knex } from '../config/knex';
import { Usuario } from '../models/Usuario';
import { usuarioResposta } from '../dtos/UsuarioResposta';
import { NOME_COOKIE, opcoesCookie } from '../config/Sessao';
import { NaoAutenticado } from '../erros';

export const autenticacaoRouter = Router();
const controller = container.get<UsuarioController>(TIPOS.UsuarioController);
const validator = container.get<IUsuarioValidator>(TIPOS.IUsuarioValidator);
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true,
    standardHeaders: 'draft-8', legacyHeaders: false,
    message: { erro: 'Muitas tentativas de login. Tente novamente mais tarde.' }
});
autenticacaoRouter.post('/login', limiteLogin, validator.entrar(), controller.entrar.bind(controller));
autenticacaoRouter.get('/me', AutenticacaoMiddleware.Autenticado, async (req, res) => {
    const usuario = await Knex<Usuario>('usuarios').where({ id: req.usuario!.id }).first();
    if (!usuario) throw new NaoAutenticado();
    res.set('Cache-Control', 'no-store').json(usuarioResposta(usuario));
});
autenticacaoRouter.post('/logout', AutenticacaoMiddleware.Autenticado, async (req, res) => {
    // Logout encerra todas as sessões do usuário, inclusive cookies já copiados.
    await Knex('usuarios').where({ id: req.usuario!.id }).increment('versaoSessao', 1);
    res.clearCookie(NOME_COOKIE, opcoesCookie()).status(204).end();
});

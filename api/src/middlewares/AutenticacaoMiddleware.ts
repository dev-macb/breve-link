import { RequestHandler } from 'express';
import { JwtUtil, IPayload } from '../utils/JwtUtil';
import { Knex } from '../config/knex';
import { NaoAutenticado, Proibido } from '../erros';
import { NOME_COOKIE } from '../config/Sessao';
import { Usuario } from '../models/Usuario';

declare module 'express-serve-static-core' {
    interface Request {
        usuario?: IPayload;
    }
}
export class AutenticacaoMiddleware {
    static Autenticado: RequestHandler = async (req, _res, next) => {
        let payload: IPayload;
        try {
            const token = req.cookies?.[NOME_COOKIE];
            if (!token) {
                throw new Error('Token ausente');
            }
            payload = JwtUtil.Autenticar(token);
        } catch {
            throw new NaoAutenticado('Sessão ausente ou expirada');
        }
        const usuario = await Knex<Usuario>('usuarios').where({ id: payload.id }).first();
        if (!usuario?.ativo || (usuario.versaoSessao ?? 0) !== payload.versaoSessao) {
            throw new NaoAutenticado('Sessão inválida');
        }
        req.usuario = {
            id: usuario.id,
            administrador: !!usuario.administrador,
            versaoSessao: usuario.versaoSessao ?? 0
        };
        next();
    };
    static Administrador: RequestHandler = async (req, res, next) => {
        await AutenticacaoMiddleware.Autenticado(req, res, (erro) => {
            if (erro) {
                return next(erro);
            }
            if (!req.usuario?.administrador) {
                return next(new Proibido());
            }
            next();
        });
    };
}

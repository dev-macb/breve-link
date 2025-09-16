// src/middleware/AutenticacaoMiddleware.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { JwtUtil } from '../utils/JwtUtil';
import { StatusCodes } from 'http-status-codes';

interface IPayload {
    id: number;
    administrador: boolean;
}

class AutenticacaoMiddleware {
    static Administrador: RequestHandler = (requisicao: Request<{}, {}, {}, IPayload>, resposta: Response, proximaFuncao: NextFunction) => {
        try {
            const tokenDeAcesso = requisicao.headers.authorization?.split(' ')[1];
            if (!tokenDeAcesso) return resposta.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Token necessário' });

            const payload = JwtUtil.Autenticar(tokenDeAcesso);
            if (!payload.administrador) return resposta.status(StatusCodes.FORBIDDEN).json({ erro: 'Acesso negado' });

            requisicao.usuario = payload;
            proximaFuncao();
        } 
        catch {
            resposta.status(401).json({ erro: 'Token inválido' });
        }
    };
}

export { AutenticacaoMiddleware };
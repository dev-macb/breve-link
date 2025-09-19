import { logger } from '../config/Logger';
import { JwtUtil } from '../utils/JwtUtil';
import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction, RequestHandler } from 'express';


interface IPayload {
    id: number;
    administrador: boolean;
}

declare module 'express-serve-static-core' {
    interface Request {
        usuario?: IPayload;
    }
}

class AutenticacaoMiddleware {
    static Administrador: RequestHandler = (requisicao: Request, resposta: Response, proximaFuncao: NextFunction) => {
        try {
            const tokenDeAcesso = requisicao.headers.authorization?.split(' ')[1];
            if (!tokenDeAcesso) {
                logger.warn(`Token ausente - ${requisicao.method} ${requisicao.originalUrl}`);
                return resposta.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Token ausente' });
            }

            const payload = JwtUtil.Autenticar(tokenDeAcesso);

            if (!payload.administrador) {
                logger.warn(`Acesso negado para usuário ${payload.id}`);
                return resposta.status(StatusCodes.FORBIDDEN).json({ erro: 'Acesso negado' });
            }

            requisicao.usuario = payload;
            logger.info(`Usuário { ${payload.id} } autenticado como administrador`);
            proximaFuncao();
        } 
        catch (erro) {
            logger.error(`Token inválido - rota ${requisicao.method} ${requisicao.originalUrl}`);
            return resposta.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Token inválido' });
        }
    };
}


export { AutenticacaoMiddleware };
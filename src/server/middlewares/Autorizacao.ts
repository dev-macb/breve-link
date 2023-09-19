// Importação de módulos
import { StatusCodes } from 'http-status-codes';
import { JWTService } from '../services/JWTService';
import { Request, Response, NextFunction, RequestHandler } from 'express';


const autorizacao: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    const cabecalho = request.headers;
    if (!cabecalho.authorization) return response.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Não autenticado.' });

    const [tipo, token] = cabecalho.authorization.split(' ');
    if (tipo !== 'Bearer') return response.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Não autenticado.' });

    const dadoJWT = JWTService.autenticar(token);
    
    if (dadoJWT === 'JWT_SEGREDO_NAO_ENCONTRADO') return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erro: 'Erro ao verificar o token de acesso' });
    else if (dadoJWT === 'TOKEN_INVALIDO') return response.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Não autorizado!' });

    request.headers.id = dadoJWT.id.toString();

    return next();
};


export { autorizacao };

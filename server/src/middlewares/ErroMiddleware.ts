import { ErrorRequestHandler } from 'express';
import { randomUUID } from 'crypto';
import { ErroDominio } from '../erros';
import { logger } from '../config/Logger';

export const ErroMiddleware: ErrorRequestHandler = (erro, requisicao, resposta, proxima) => {
    if (resposta.headersSent) return proxima(erro);
    if (erro instanceof ErroDominio) {
        resposta.status(erro.status).json({ erro: erro.message, ...(erro.detalhes ? { detalhes: erro.detalhes } : {}) });
        return;
    }
    if (erro?.type === 'entity.parse.failed') {
        resposta.status(400).json({ erro: 'JSON inválido' });
        return;
    }
    if (erro?.type === 'entity.too.large') {
        resposta.status(413).json({ erro: 'Requisição muito grande' });
        return;
    }
    // Erros de banco podem conter SQL, senhas e parâmetros em message/stack.
    const identificador = randomUUID();
    logger.error({ identificador, metodo: requisicao.method }, 'Falha interna na requisição');
    resposta.status(500).json({ erro: 'Erro interno do servidor' });
};

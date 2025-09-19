import { RequestHandler } from 'express';

export interface ILinkValidator {
    obterTodos(): RequestHandler;
    obterPorId(): RequestHandler;
    cadastrar(): RequestHandler;
    atualizar(): RequestHandler;
    remover(): RequestHandler;
    redirecionar(): RequestHandler;
}
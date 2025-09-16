import { RequestHandler } from 'express';

export interface IUsuarioValidator {
    obterTodos(): RequestHandler;
    obterPorId(): RequestHandler;
    cadastrar(): RequestHandler;
    atualizar(): RequestHandler;
    remover(): RequestHandler;
    entrar(): RequestHandler;
}
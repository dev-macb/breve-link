import { CookieOptions } from 'express';

export const NOME_COOKIE = 'breve_sessao';
export const DURACAO_SESSAO_MS = 60 * 60 * 1000;
export function opcoesCookie(): CookieOptions {
    return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' };
}

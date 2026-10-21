import express, { Request, Response } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { ErroMiddleware } from '../../src/middlewares/ErroMiddleware';
import { Conflito } from '../../src/erros';
import { JwtUtil } from '../../src/utils/JwtUtil';
import { UsuarioController } from '../../src/controllers/UsuarioController';
import { IUsuarioService } from '../../src/interfaces';
import { ParserUtil } from '../../src/utils/ParserUtil';

describe('Contratos de seguranca', () => {
    it('nao confia diretamente no X-Forwarded-For', () => {
        expect(
            ParserUtil.extrairIp({ ip: '127.0.0.1', headers: { 'x-forwarded-for': '8.8.8.8' } })
        ).toBe('127.0.0.1');
    });
    it('handler preserva erro de dominio e oculta SQL/senha de falhas internas', async () => {
        const app = express();
        app.get('/dominio', () => {
            throw new Conflito('Slug em uso');
        });
        app.get('/interno', () => {
            throw new Error('SQL senha=segredo-interno');
        });
        app.use(ErroMiddleware);
        const dominio = await request(app).get('/dominio').expect(409);
        expect(dominio.body).toEqual({ erro: 'Slug em uso' });
        const interno = await request(app).get('/interno').expect(500);
        expect(interno.body).toEqual({ erro: 'Erro interno do servidor' });
        expect(interno.text).not.toMatch(/SQL|segredo/);
    });

    it('cookie de producao e Secure, HttpOnly e tem duracao alinhada', async () => {
        const ambienteAnterior = process.env.NODE_ENV;
        try {
            process.env.NODE_ENV = 'production';
            const servico = {
                entrar: jest.fn().mockResolvedValue('token-teste')
            } as unknown as IUsuarioService;
            const res = {
                cookie: jest.fn(),
                status: jest.fn().mockReturnThis(),
                end: jest.fn()
            } as unknown as Response;
            await new UsuarioController(servico).entrar({ body: {} } as Request, res);
            expect(res.cookie).toHaveBeenCalledWith(
                'breve_sessao',
                'token-teste',
                expect.objectContaining({ secure: true, httpOnly: true, maxAge: 3600000 })
            );
        } finally {
            process.env.NODE_ENV = ambienteAnterior;
        }
    });

    it('rejeita token expirado, assinatura incorreta e payload sem versao', () => {
        const segredoAnterior = process.env.JWT_SEGREDO;
        process.env.JWT_SEGREDO = 'segredo-teste-com-pelo-menos-trinta-e-dois-bytes';
        try {
            const payload = { id: 1, administrador: true, versaoSessao: 0 };
            const valido = JwtUtil.Gerar(payload);
            expect(JwtUtil.Autenticar(valido)).toMatchObject(payload);
            expect(() =>
                JwtUtil.Autenticar(jwt.sign(payload, process.env.JWT_SEGREDO!, { expiresIn: -1 }))
            ).toThrow();
            expect(() => JwtUtil.Autenticar(jwt.sign(payload, 'outro-segredo'))).toThrow();
            expect(() =>
                JwtUtil.Autenticar(
                    jwt.sign({ id: 1, administrador: true }, process.env.JWT_SEGREDO!)
                )
            ).toThrow();
        } finally {
            if (segredoAnterior === undefined) {
                delete process.env.JWT_SEGREDO;
            } else {
                process.env.JWT_SEGREDO = segredoAnterior;
            }
        }
    });
});

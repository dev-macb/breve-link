import { Request, Response } from 'express';
import { UsuarioController } from '../../src/controllers/UsuarioController';
import { IUsuarioService } from '../../src/interfaces';
import { Usuario } from '../../src/models';
import { usuarioResposta } from '../../src/dtos/UsuarioResposta';
import { NOME_COOKIE } from '../../src/config/Sessao';
import { Conflito, NaoAutenticado, RecursoNaoEncontrado } from '../../src/erros';

const usuario: Usuario = { id: 1, nome: 'Teste', email: 'teste@example.com', senha: 'hash', ativo: true, administrador: false, criadoEm: new Date(), atualizadoEm: new Date(), versaoSessao: 3 };
const servico: jest.Mocked<IUsuarioService> = { obterTodos: jest.fn(), obterPorId: jest.fn(), cadastrar: jest.fn(), atualizar: jest.fn(), remover: jest.fn(), entrar: jest.fn() };
const controller = new UsuarioController(servico);
function resposta() {
    return { locals: {}, status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), cookie: jest.fn().mockReturnThis(), end: jest.fn().mockReturnThis() } as unknown as Response;
}
const req = { body: { nome: 'Novo' }, params: { id: 1 }, query: { pagina: '1', limite: '10' } } as unknown as Request;

describe('UsuarioController', () => {
    beforeEach(() => jest.resetAllMocks());
    it('lista pagina com DTOs sem senha e sem versao de sessao', async () => {
        const res = resposta();
        servico.obterTodos.mockResolvedValue({ itens: [usuario], total: 1, pagina: 1, limite: 10, totalPaginas: 1 });
        await controller.obterTodos(req, res);
        expect(servico.obterTodos).toHaveBeenCalledWith({ pagina: 1, limite: 10, filtro: '' });
        expect(res.json).toHaveBeenCalledWith({ itens: [usuarioResposta(usuario)], total: 1, pagina: 1, limite: 10, totalPaginas: 1 });
        expect(JSON.stringify((res.json as jest.Mock).mock.calls)).not.toMatch(/senha|versaoSessao/);
    });
    it.each(['obterPorId', 'cadastrar', 'atualizar', 'remover'] as const)('retorna DTO publico em %s', async metodo => {
        servico[metodo].mockResolvedValue(usuario);
        const res = resposta();
        await controller[metodo](req, res);
        expect(res.json).toHaveBeenCalledWith(usuarioResposta(usuario));
        expect(JSON.stringify((res.json as jest.Mock).mock.calls)).not.toMatch(/senha|versaoSessao/);
        if (metodo === 'cadastrar') expect(res.status).toHaveBeenCalledWith(201);
    });
    it.each(['obterPorId', 'atualizar', 'remover'] as const)('propaga 404 de %s para handler central', async metodo => {
        servico[metodo].mockResolvedValue(null);
        await expect(controller[metodo](req, resposta())).rejects.toBeInstanceOf(RecursoNaoEncontrado);
    });
    it('propaga conflito do servico sem converter em 500', async () => {
        const erro = new Conflito('Email já registrado');
        servico.cadastrar.mockRejectedValue(erro);
        await expect(controller.cadastrar(req, resposta())).rejects.toBe(erro);
    });
    it('propaga falha inesperada para handler central', async () => {
        const erro = new Error('Falha interna');
        servico.obterTodos.mockRejectedValue(erro);
        await expect(controller.obterTodos(req, resposta())).rejects.toBe(erro);
    });
    it('login envia cookie HttpOnly e nenhum token no corpo', async () => {
        const res = resposta();
        servico.entrar.mockResolvedValue('jwt-teste');
        await controller.entrar(req, res);
        expect(res.cookie).toHaveBeenCalledWith(NOME_COOKIE, 'jwt-teste', expect.objectContaining({ httpOnly: true, sameSite: 'strict', path: '/', maxAge: 3600000 }));
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).not.toHaveBeenCalled();
    });
    it('login sem token resulta em 401', async () => {
        servico.entrar.mockResolvedValue(null);
        await expect(controller.entrar(req, resposta())).rejects.toBeInstanceOf(NaoAutenticado);
    });
});

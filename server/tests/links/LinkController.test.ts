import { Request, Response } from 'express';
import { LinkController } from '../../src/controllers/LinkController';
import { ILinkService } from '../../src/interfaces';
import { Link } from '../../src/models';
import { LinkIndisponivel, RecursoNaoEncontrado } from '../../src/erros';

const link: Link = { id: 1, urlOriginal: 'https://example.com', urlCurta: 'abc123', acessos: 0, ativo: true, expiraEm: null, criadoEm: new Date(), atualizadoEm: new Date() };
const servico: jest.Mocked<ILinkService> = { obterTodos: jest.fn(), obterPorId: jest.fn(), obterPorUrlCurta: jest.fn(), cadastrar: jest.fn(), atualizar: jest.fn(), remover: jest.fn(), registrarAcesso: jest.fn() };
const controller = new LinkController(servico);
function resposta() {
    return { locals: {}, status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis(), set: jest.fn().mockReturnThis(), redirect: jest.fn() } as unknown as Response;
}
const req = { body: { urlOriginal: link.urlOriginal }, params: { id: 1, urlCurta: 'abc123' }, query: {}, headers: {}, get: jest.fn() } as unknown as Request;
describe('LinkController', () => {
    beforeEach(() => jest.resetAllMocks());
    it('retorna pagina de links', async () => {
        const pagina = { itens: [link], total: 1, pagina: 1, limite: 10, totalPaginas: 1 };
        servico.obterTodos.mockResolvedValue(pagina);
        const res = resposta();
        await controller.obterTodos(req, res);
        expect(res.json).toHaveBeenCalledWith(pagina);
    });
    it.each(['obterPorId', 'cadastrar', 'atualizar', 'remover'] as const)('retorna link em %s', async metodo => {
        servico[metodo].mockResolvedValue(link);
        const res = resposta();
        await controller[metodo](req, res);
        expect(res.json).toHaveBeenCalledWith(link);
        if (metodo === 'cadastrar') expect(res.status).toHaveBeenCalledWith(201);
    });
    it.each(['obterPorId', 'atualizar', 'remover'] as const)('propaga recurso ausente de %s', async metodo => {
        servico[metodo].mockResolvedValue(null);
        await expect(controller[metodo](req, resposta())).rejects.toBeInstanceOf(RecursoNaoEncontrado);
    });
    it('emite 302 sem cache e aguarda registro de acesso', async () => {
        servico.obterPorUrlCurta.mockResolvedValue(link);
        const res = resposta();
        await controller.redirecionar(req, res);
        expect(servico.registrarAcesso).toHaveBeenCalledWith(1, expect.objectContaining({ ip: null }));
        expect(res.redirect).toHaveBeenCalledWith(302, link.urlOriginal);
        expect(res.set).toHaveBeenCalledWith('Cache-Control', 'no-store');
    });
    it.each([
        { ativo: false, expiraEm: null },
        { ativo: true, expiraEm: new Date(0) },
        { ativo: true, expiraEm: 0 as unknown as Date },
        { ativo: true, expiraEm: 'invalido' as unknown as Date },
        { ativo: true, expiraEm: new Date(Date.now()) }
    ])('nao registra acesso de link indisponivel: %j', async estado => {
        servico.obterPorUrlCurta.mockResolvedValue({ ...link, ...estado });
        await expect(controller.redirecionar(req, resposta())).rejects.toBeInstanceOf(LinkIndisponivel);
        expect(servico.registrarAcesso).not.toHaveBeenCalled();
    });
    it('redirect ausente resulta em 404', async () => {
        servico.obterPorUrlCurta.mockResolvedValue(null);
        await expect(controller.redirecionar(req, resposta())).rejects.toBeInstanceOf(RecursoNaoEncontrado);
    });
    it('propaga falha inesperada do servico', async () => {
        const erro = new Error('Falha interna');
        servico.obterTodos.mockRejectedValue(erro);
        await expect(controller.obterTodos(req, resposta())).rejects.toBe(erro);
    });
});

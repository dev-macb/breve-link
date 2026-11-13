import { Request, Response } from 'express';
import { AcessoController } from '../../src/controllers/AcessoController';
import { IAcessoService } from '../../src/interfaces';
import { RecursoNaoEncontrado } from '../../src/erros';
const servico = { obterEstatisticas: jest.fn() } as jest.Mocked<IAcessoService>;
const controller = new AcessoController(servico);
const req = { params: { id: 1 } } as unknown as Request;
describe('AcessoController', () => {
    const origemAnterior = process.env.APP_ORIGEM;
    beforeEach(() => {
        jest.resetAllMocks();
        process.env.APP_ORIGEM = 'https://breve.example';
    });
    afterEach(() => {
        if (origemAnterior === undefined) {
            delete process.env.APP_ORIGEM;
        } else {
            process.env.APP_ORIGEM = origemAnterior;
        }
    });
    it('retorna as estatisticas', async () => {
        const stats = { totalAcessos: 3, link: { urlCurta: 'abc123' } } as any;
        servico.obterEstatisticas.mockResolvedValue(stats);
        const res = { json: jest.fn() } as unknown as Response;
        await controller.obterEstatisticas(req, res);
        expect(servico.obterEstatisticas).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith({
            ...stats,
            link: { ...stats.link, qrCode: expect.stringMatching(/^data:image\/png;base64,/) }
        });
    });
    it('propaga 404 para link inexistente', async () => {
        servico.obterEstatisticas.mockResolvedValue(null);
        await expect(controller.obterEstatisticas(req, {} as Response)).rejects.toBeInstanceOf(
            RecursoNaoEncontrado
        );
    });
    it('propaga falha inesperada', async () => {
        const erro = new Error('Erro de banco');
        servico.obterEstatisticas.mockRejectedValue(erro);
        await expect(controller.obterEstatisticas(req, {} as Response)).rejects.toBe(erro);
    });
});

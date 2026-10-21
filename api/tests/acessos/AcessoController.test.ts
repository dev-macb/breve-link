import { Request, Response } from 'express';
import { AcessoController } from '../../src/controllers/AcessoController';
import { IAcessoService } from '../../src/interfaces';
import { RecursoNaoEncontrado } from '../../src/erros';
const servico = { obterEstatisticas: jest.fn() } as jest.Mocked<IAcessoService>;
const controller = new AcessoController(servico);
const req = { params: { id: 1 } } as unknown as Request;
describe('AcessoController', () => {
    beforeEach(() => jest.resetAllMocks());
    it('retorna as estatisticas', async () => {
        const stats = { totalAcessos: 3 } as any;
        servico.obterEstatisticas.mockResolvedValue(stats);
        const res = { json: jest.fn() } as unknown as Response;
        await controller.obterEstatisticas(req, res);
        expect(servico.obterEstatisticas).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith(stats);
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

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IAcessoService } from '../../src/interfaces';
import { AcessoController } from '../../src/controllers';


const mockResponse = () => {
    const resposta: Partial<Response> = {};
    resposta.status = jest.fn().mockReturnValue(resposta);
    resposta.json = jest.fn().mockReturnValue(resposta);
    return resposta as Response;
};


const mockRequest = (params: any = {}) => {
    return { params } as unknown as Request;
};


const estatisticasMock = {
    link: { id: 1, urlOriginal: 'https://example.com', urlCurta: 'abc123', criadoEm: new Date() },
    totalAcessos: 10,
    acessosPorDia: [{ data: '2026-07-10', acessos: 5 }],
    dispositivos: {
        navegadores: [{ nome: 'Chrome', acessos: 8, percentual: 80 }],
        sistemasOperacionais: [{ nome: 'Windows', acessos: 10, percentual: 100 }],
        tipos: [{ tipo: 'desktop', acessos: 10, percentual: 100 }]
    },
    referrers: [{ origem: 'https://google.com', acessos: 6, percentual: 60 }],
    localizacao: {
        paises: [{ pais: 'BR', acessos: 10, percentual: 100 }],
        cidades: [{ cidade: 'Sao Paulo', pais: 'BR', acessos: 10, percentual: 100 }]
    }
};


const mockAcessoService: jest.Mocked<IAcessoService> = {
    registrar: jest.fn(),
    obterEstatisticas: jest.fn()
};


describe('AcessoController', () => {
    let resposta: Response;
    let acessoController: AcessoController;

    beforeEach(() => {
        resposta = mockResponse();
        acessoController = new AcessoController(mockAcessoService);
        jest.clearAllMocks();
    });

    describe('obterEstatisticas', () => {
        it('deve retornar estatisticas com status 200', async () => {
            mockAcessoService.obterEstatisticas.mockResolvedValue(estatisticasMock);
            const requisicao = mockRequest({ id: 1 });

            await acessoController.obterEstatisticas(requisicao, resposta);

            expect(mockAcessoService.obterEstatisticas).toHaveBeenCalledWith(1);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(estatisticasMock);
        });

        it('deve retornar 404 quando link nao for encontrado', async () => {
            mockAcessoService.obterEstatisticas.mockResolvedValue(null);
            const requisicao = mockRequest({ id: 999 });

            await acessoController.obterEstatisticas(requisicao, resposta);

            expect(mockAcessoService.obterEstatisticas).toHaveBeenCalledWith(999);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(resposta.json).toHaveBeenCalledWith({ error: 'Link não encontrado' });
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Erro ao buscar estatísticas';
            mockAcessoService.obterEstatisticas.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({ id: 1 });

            await acessoController.obterEstatisticas(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });
});

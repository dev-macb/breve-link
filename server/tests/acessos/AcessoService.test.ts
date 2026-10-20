import { Link } from '../../src/models';
import { IAcessoRepository, ILinkRepository } from '../../src/interfaces';
import { AcessoService } from '../../src/services';


const linkMock: Link = {
    id: 1,
    urlOriginal: 'https://example.com',
    urlCurta: 'abc123',
    acessos: 10,
    ativo: true,
    expiraEm: null,
    criadoEm: new Date(),
    atualizadoEm: new Date()
};


const mockAcessoRepository: jest.Mocked<IAcessoRepository> = {
    cadastrar: jest.fn(),
    contarTotalPorLinkId: jest.fn(),
    contarPorDia: jest.fn(),
    contarPorNavegador: jest.fn(),
    contarPorSistemaOperacional: jest.fn(),
    contarPorDispositivo: jest.fn(),
    contarPorReferrer: jest.fn(),
    contarPorPais: jest.fn(),
    contarPorCidade: jest.fn()
};


const mockLinkRepository: jest.Mocked<ILinkRepository> = {
    contar: jest.fn().mockResolvedValue(1),
    obterTodos: jest.fn(),
    obterPorId: jest.fn(),
    obterPorUrlCurta: jest.fn(),
    cadastrar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
    urlCurtaExiste: jest.fn()
};


describe('AcessoService', () => {
    let acessoService: AcessoService;

    beforeEach(() => {
        acessoService = new AcessoService(mockAcessoRepository, mockLinkRepository);
        jest.clearAllMocks();
    });

    describe('obterEstatisticas', () => {
        it('deve retornar estatisticas completas quando link existir', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(linkMock);
            mockAcessoRepository.contarTotalPorLinkId.mockResolvedValue(10);
            mockAcessoRepository.contarPorDia.mockResolvedValue([
                { data: '2026-07-10', acessos: 5 },
                { data: '2026-07-09', acessos: 5 }
            ]);
            mockAcessoRepository.contarPorNavegador.mockResolvedValue([
                { campo: 'Chrome', acessos: 8 }
            ]);
            mockAcessoRepository.contarPorSistemaOperacional.mockResolvedValue([
                { campo: 'Windows', acessos: 10 }
            ]);
            mockAcessoRepository.contarPorDispositivo.mockResolvedValue([
                { campo: 'desktop', acessos: 10 }
            ]);
            mockAcessoRepository.contarPorReferrer.mockResolvedValue([
                { campo: 'https://google.com', acessos: 6 }
            ]);
            mockAcessoRepository.contarPorPais.mockResolvedValue([
                { campo: 'BR', acessos: 10 }
            ]);
            mockAcessoRepository.contarPorCidade.mockResolvedValue([
                { cidade: 'Sao Paulo', pais: 'BR', acessos: 10 }
            ]);

            const resultado = await acessoService.obterEstatisticas(1);

            expect(resultado).not.toBeNull();
            expect(resultado!.link.id).toBe(1);
            expect(resultado!.link.urlOriginal).toBe('https://example.com');
            expect(resultado!.totalAcessos).toBe(10);
            expect(resultado!.acessosPorDia).toHaveLength(2);
            expect(resultado!.dispositivos.navegadores[0].nome).toBe('Chrome');
            expect(resultado!.dispositivos.navegadores[0].percentual).toBe(80);
            expect(resultado!.dispositivos.tipos[0].tipo).toBe('desktop');
            expect(resultado!.referrers[0].origem).toBe('https://google.com');
            expect(resultado!.localizacao.paises[0].pais).toBe('BR');
            expect(resultado!.localizacao.cidades[0].cidade).toBe('Sao Paulo');
        });

        it('deve retornar null quando link nao existir', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(null);

            const resultado = await acessoService.obterEstatisticas(999);

            expect(resultado).toBeNull();
            expect(mockAcessoRepository.contarTotalPorLinkId).not.toHaveBeenCalled();
        });

        it('deve calcular percentuais corretamente', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(linkMock);
            mockAcessoRepository.contarTotalPorLinkId.mockResolvedValue(20);
            mockAcessoRepository.contarPorDia.mockResolvedValue([]);
            mockAcessoRepository.contarPorNavegador.mockResolvedValue([
                { campo: 'Chrome', acessos: 15 },
                { campo: 'Firefox', acessos: 5 }
            ]);
            mockAcessoRepository.contarPorSistemaOperacional.mockResolvedValue([]);
            mockAcessoRepository.contarPorDispositivo.mockResolvedValue([]);
            mockAcessoRepository.contarPorReferrer.mockResolvedValue([]);
            mockAcessoRepository.contarPorPais.mockResolvedValue([]);
            mockAcessoRepository.contarPorCidade.mockResolvedValue([]);

            const resultado = await acessoService.obterEstatisticas(1);

            expect(resultado!.dispositivos.navegadores[0].percentual).toBe(75);
            expect(resultado!.dispositivos.navegadores[1].percentual).toBe(25);
        });

        it('deve tratar campos nulos como "Desconhecido"', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(linkMock);
            mockAcessoRepository.contarTotalPorLinkId.mockResolvedValue(1);
            mockAcessoRepository.contarPorDia.mockResolvedValue([]);
            mockAcessoRepository.contarPorNavegador.mockResolvedValue([
                { campo: null as any, acessos: 1 }
            ]);
            mockAcessoRepository.contarPorSistemaOperacional.mockResolvedValue([]);
            mockAcessoRepository.contarPorDispositivo.mockResolvedValue([]);
            mockAcessoRepository.contarPorReferrer.mockResolvedValue([]);
            mockAcessoRepository.contarPorPais.mockResolvedValue([]);
            mockAcessoRepository.contarPorCidade.mockResolvedValue([]);

            const resultado = await acessoService.obterEstatisticas(1);

            expect(resultado!.dispositivos.navegadores[0].nome).toBe('Desconhecido');
        });

        it('deve retornar percentual 0 quando total de acessos for 0', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(linkMock);
            mockAcessoRepository.contarTotalPorLinkId.mockResolvedValue(0);
            mockAcessoRepository.contarPorDia.mockResolvedValue([]);
            mockAcessoRepository.contarPorNavegador.mockResolvedValue([]);
            mockAcessoRepository.contarPorSistemaOperacional.mockResolvedValue([]);
            mockAcessoRepository.contarPorDispositivo.mockResolvedValue([]);
            mockAcessoRepository.contarPorReferrer.mockResolvedValue([]);
            mockAcessoRepository.contarPorPais.mockResolvedValue([]);
            mockAcessoRepository.contarPorCidade.mockResolvedValue([]);

            const resultado = await acessoService.obterEstatisticas(1);

            expect(resultado!.totalAcessos).toBe(0);
        });
    });
});

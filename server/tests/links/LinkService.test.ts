import { Link, CadastrarLinkDto, AtualizarLinkDto } from '../../src/models';
import { ILinkRepository, IAcessoRepository } from '../../src/interfaces';
import { LinkService } from '../../src/services';
import { UrlUtil } from '../../src/utils/UrlUtil';
import { Conflito } from '../../src/erros';


const linkMock: Link = {
    id: 1,
    urlOriginal: 'https://example.com',
    urlCurta: 'abc123',
    acessos: 0,
    ativo: true,
    expiraEm: null,
    criadoEm: new Date(),
    atualizadoEm: new Date()
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


const mockAcessoRepository: jest.Mocked<IAcessoRepository> = {
    obterRecentes: jest.fn().mockResolvedValue([]),
    cadastrar: jest.fn(),
    contarTotalPorLinkId: jest.fn(),
    contarPorDia: jest.fn(),
    contarPorNavegador: jest.fn(),
    contarPorSistemaOperacional: jest.fn(),
    contarPorDispositivo: jest.fn(),
    contarPorReferrer: jest.fn(),
    contarPorPais: jest.fn(),
    obterFingerprint: jest.fn().mockResolvedValue({ hashesDistintos: 0, acessosComHash: 0, grupos: [] }),
    contarPorCidade: jest.fn()
};


const mockUrlUtil = UrlUtil;


describe('LinkService', () => {
    let linkService: LinkService;

    beforeEach(() => {
        linkService = new LinkService(mockLinkRepository, mockAcessoRepository, mockUrlUtil);
        jest.clearAllMocks();
    });

    describe('obterTodos', () => {
        it('deve retornar lista de links', async () => {
            const linksMock: Link[] = [linkMock];
            mockLinkRepository.obterTodos.mockResolvedValue(linksMock);

            const resultado = await linkService.obterTodos({ pagina: 1, limite: 10, filtro: '' });

            expect(mockLinkRepository.obterTodos).toHaveBeenCalledWith({ pagina: 1, limite: 10, filtro: '' });
            expect(resultado).toEqual({ itens: linksMock, total: 1, pagina: 1, limite: 10, totalPaginas: 1 });
        });
    });

    describe('obterPorId', () => {
        it('deve retornar link por ID', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(linkMock);

            const resultado = await linkService.obterPorId(1);

            expect(mockLinkRepository.obterPorId).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(linkMock);
        });

        it('deve retornar null quando link nao for encontrado', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(null);

            const resultado = await linkService.obterPorId(999);

            expect(resultado).toBeNull();
        });
    });

    describe('obterPorUrlCurta', () => {
        it('deve retornar link por URL curta', async () => {
            mockLinkRepository.obterPorUrlCurta.mockResolvedValue(linkMock);

            const resultado = await linkService.obterPorUrlCurta('abc123');

            expect(mockLinkRepository.obterPorUrlCurta).toHaveBeenCalledWith('abc123');
            expect(resultado).toEqual(linkMock);
        });

        it('deve retornar null quando URL curta nao for encontrada', async () => {
            mockLinkRepository.obterPorUrlCurta.mockResolvedValue(null);

            const resultado = await linkService.obterPorUrlCurta('inexistente');

            expect(resultado).toBeNull();
        });
    });

    describe('cadastrar', () => {
        it('repete geracao quando a colisao ocorre no insert', async () => {
            const gerar = jest.spyOn(UrlUtil, 'Gerar').mockReturnValueOnce('primeiro').mockReturnValueOnce('segundo');
            mockLinkRepository.urlCurtaExiste.mockResolvedValue(false);
            mockLinkRepository.cadastrar.mockRejectedValueOnce(new Conflito('UrlCurta já registrada'))
                .mockResolvedValueOnce({ ...linkMock, urlCurta: 'segundo' });
            try {
                const resultado = await linkService.cadastrar({ urlOriginal: 'https://example.com' });
                expect(resultado.urlCurta).toBe('segundo');
                expect(mockLinkRepository.cadastrar).toHaveBeenCalledTimes(2);
            } finally { gerar.mockRestore(); }
        });

        it('limita tentativas de geracao em colisoes repetidas', async () => {
            const gerar = jest.spyOn(UrlUtil, 'Gerar').mockReturnValue('colisao');
            mockLinkRepository.urlCurtaExiste.mockResolvedValue(true);
            try {
                await expect(linkService.cadastrar({ urlOriginal: 'https://example.com' })).rejects.toThrow('após múltiplas tentativas');
                expect(gerar).toHaveBeenCalledTimes(10);
                expect(mockLinkRepository.cadastrar).not.toHaveBeenCalled();
            } finally { gerar.mockRestore(); mockLinkRepository.urlCurtaExiste.mockResolvedValue(false); }
        });

        it('deve criar link com urlCurta fornecida', async () => {
            const dto: CadastrarLinkDto = {
                urlOriginal: 'https://example.com',
                urlCurta: 'meuLink',
                expiraEm: null
            };

            mockLinkRepository.cadastrar.mockResolvedValue({ ...linkMock, urlCurta: 'meuLink' });

            const resultado = await linkService.cadastrar(dto);

            expect(mockLinkRepository.cadastrar).toHaveBeenCalledWith(dto);
            expect(resultado.urlCurta).toBe('meuLink');
        });

        it('deve gerar urlCurta automaticamente quando nao fornecida', async () => {
            const dto = {
                urlOriginal: 'https://example.com',
                expiraEm: null
            } as CadastrarLinkDto;

            mockLinkRepository.urlCurtaExiste.mockResolvedValue(false);
            mockLinkRepository.cadastrar.mockResolvedValue({ ...linkMock, urlCurta: 'gerada1' });

            const resultado = await linkService.cadastrar(dto);

            expect(mockLinkRepository.urlCurtaExiste).toHaveBeenCalled();
            expect(mockLinkRepository.cadastrar).toHaveBeenCalledWith(
                expect.objectContaining({ urlOriginal: 'https://example.com' })
            );
            expect(resultado).toBeDefined();
        });

        it('deve lancar erro quando repository retornar null', async () => {
            const dto: CadastrarLinkDto = {
                urlOriginal: 'https://example.com',
                urlCurta: 'abc123',
                expiraEm: null
            };

            mockLinkRepository.cadastrar.mockResolvedValue(null);

            await expect(linkService.cadastrar(dto)).rejects.toThrow('Falha ao cadastrar link');
        });
    });

    describe('atualizar', () => {
        it('deve atualizar link com sucesso', async () => {
            const dto: AtualizarLinkDto = { urlCurta: 'novo123' };
            mockLinkRepository.obterPorId.mockResolvedValue(linkMock);
            mockLinkRepository.atualizar.mockResolvedValue({ ...linkMock, ...dto });

            const resultado = await linkService.atualizar(1, dto);

            expect(mockLinkRepository.atualizar).toHaveBeenCalledWith(1, dto);
            expect(resultado?.urlCurta).toBe('novo123');
        });

        it('deve lancar erro quando link nao for encontrado', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(null);

            await expect(linkService.atualizar(999, { urlCurta: 'novo' }))
                .rejects.toThrow('Link não encontrado');
        });

        it('deve lancar erro quando urlCurta ja estiver em uso por outro link', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(linkMock);
            mockLinkRepository.obterPorUrlCurta.mockResolvedValue({ ...linkMock, id: 2, urlCurta: 'duplicado' });

            await expect(linkService.atualizar(1, { urlCurta: 'duplicado' }))
                .rejects.toThrow('UrlCurta já registrada');
        });

        it('deve permitir manter a mesma urlCurta no proprio link', async () => {
            const dto: AtualizarLinkDto = { urlCurta: 'abc123' };
            mockLinkRepository.obterPorId.mockResolvedValue(linkMock);
            mockLinkRepository.obterPorUrlCurta.mockResolvedValue(linkMock);
            mockLinkRepository.atualizar.mockResolvedValue(linkMock);

            const resultado = await linkService.atualizar(1, dto);

            expect(resultado).toEqual(linkMock);
        });
    });

    describe('remover', () => {
        it('deve remover link com sucesso', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(linkMock);
            mockLinkRepository.remover.mockResolvedValue(true);

            const resultado = await linkService.remover(1);

            expect(mockLinkRepository.remover).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(linkMock);
        });

        it('deve lancar erro quando link nao for encontrado', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(null);

            await expect(linkService.remover(999)).rejects.toThrow('Link não encontrado');
        });

        it('deve lancar erro quando repository falhar ao remover', async () => {
            mockLinkRepository.obterPorId.mockResolvedValue(linkMock);
            mockLinkRepository.remover.mockResolvedValue(false);

            await expect(linkService.remover(1)).rejects.toThrow('Falha ao remover link');
        });
    });

    describe('registrarAcesso', () => {
        it('deve registrar acesso e incrementar contador', async () => {
            mockAcessoRepository.cadastrar.mockResolvedValue(undefined);

            await linkService.registrarAcesso(1, {
                ip: '127.0.0.1',
                navegador: 'Chrome',
                sistemaOperacional: 'Windows',
                dispositivo: 'desktop',
                referrer: null,
                pais: null,
                cidade: null
            });

            expect(mockAcessoRepository.cadastrar).toHaveBeenCalledWith(
                expect.objectContaining({ linkId: 1, ip: '127.0.0.1' })
            );
        });

        it('deve engolir erro quando repository falhar', async () => {
            mockAcessoRepository.cadastrar.mockRejectedValue(new Error('DB error'));

            await expect(linkService.registrarAcesso(1, {
                ip: null,
                navegador: null,
                sistemaOperacional: null,
                dispositivo: null,
                referrer: null,
                pais: null,
                cidade: null
            })).resolves.toBeUndefined();
        });
    });
});

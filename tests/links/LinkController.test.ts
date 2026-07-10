import { CadastrarLinkDto, Link, AtualizarLinkDto } from '../../src/models';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ILinkService } from '../../src/interfaces';
import { LinkController } from '../../src/controllers';


const mockResponse = () => {
    const resposta: Partial<Response> = {};
    resposta.status = jest.fn().mockReturnValue(resposta);
    resposta.json = jest.fn().mockReturnValue(resposta);
    resposta.redirect = jest.fn().mockReturnValue(resposta);
    return resposta as Response;
};


const mockRequest = (body: any = {}, params: any = {}, query: any = {}, headers: any = {}) => {
    return { body, params, query, headers } as unknown as Request;
};


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


const mockLinkService: jest.Mocked<ILinkService> = {
    obterTodos: jest.fn(),
    obterPorId: jest.fn(),
    obterPorUrlCurta: jest.fn(),
    cadastrar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
    registrarAcesso: jest.fn()
};


describe('LinkController', () => {
    let resposta: Response;
    let linkController: LinkController;

    beforeEach(() => {
        resposta = mockResponse();
        linkController = new LinkController(mockLinkService);
        jest.clearAllMocks();
    });

    describe('obterTodos', () => {
        it('deve retornar lista de links com status 200', async () => {
            const linksMock: Link[] = [linkMock];
            mockLinkService.obterTodos.mockResolvedValue(linksMock);
            const requisicao = mockRequest({}, {}, { pagina: '1', limite: '10', filtro: 'test' });

            await linkController.obterTodos(requisicao, resposta);

            expect(mockLinkService.obterTodos).toHaveBeenCalledWith({
                pagina: 1,
                limite: 10,
                filtro: 'test'
            });
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(linksMock);
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Erro ao buscar links';
            mockLinkService.obterTodos.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({}, {}, {});

            await linkController.obterTodos(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('obterPorId', () => {
        it('deve retornar link por ID com status 200', async () => {
            mockLinkService.obterPorId.mockResolvedValue(linkMock);
            const requisicao = mockRequest({}, { id: 1 }, {});

            await linkController.obterPorId(requisicao, resposta);

            expect(mockLinkService.obterPorId).toHaveBeenCalledWith(1);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(linkMock);
        });

        it('deve retornar 404 quando link nao for encontrado', async () => {
            mockLinkService.obterPorId.mockResolvedValue(null);
            const requisicao = mockRequest({}, { id: 999 }, {});

            await linkController.obterPorId(requisicao, resposta);

            expect(mockLinkService.obterPorId).toHaveBeenCalledWith(999);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(resposta.json).toHaveBeenCalledWith({ error: 'Link não encontrado' });
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Erro ao buscar link';
            mockLinkService.obterPorId.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({}, { id: 1 }, {});

            await linkController.obterPorId(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });

    describe('cadastrar', () => {
        it('deve criar novo link com status 201', async () => {
            const novoLinkDto: CadastrarLinkDto = {
                urlOriginal: 'https://example.com',
                urlCurta: 'abc123',
                expiraEm: null
            };

            mockLinkService.cadastrar.mockResolvedValue(linkMock);
            const requisicao = mockRequest(novoLinkDto, {}, {});

            await linkController.cadastrar(requisicao, resposta);

            expect(mockLinkService.cadastrar).toHaveBeenCalledWith(novoLinkDto);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.CREATED);
            expect(resposta.json).toHaveBeenCalledWith(linkMock);
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Falha ao cadastrar link';
            mockLinkService.cadastrar.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({ urlOriginal: 'https://example.com', urlCurta: 'abc123' }, {}, {});

            await linkController.cadastrar(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });

    describe('atualizar', () => {
        it('deve atualizar link com status 200', async () => {
            const atualizarLinkDto: AtualizarLinkDto = { urlCurta: 'novo123' };
            const linkAtualizado: Link = { ...linkMock, ...atualizarLinkDto };

            mockLinkService.atualizar.mockResolvedValue(linkAtualizado);
            const requisicao = mockRequest(atualizarLinkDto, { id: 1 }, {});

            await linkController.atualizar(requisicao, resposta);

            expect(mockLinkService.atualizar).toHaveBeenCalledWith(1, atualizarLinkDto);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(linkAtualizado);
        });

        it('deve retornar 404 quando link nao for encontrado', async () => {
            mockLinkService.atualizar.mockResolvedValue(null);
            const requisicao = mockRequest({ urlCurta: 'novo123' }, { id: 999 }, {});

            await linkController.atualizar(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(resposta.json).toHaveBeenCalledWith({ msg: 'Link não encontrado' });
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'UrlCurta já registrada';
            mockLinkService.atualizar.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({ urlCurta: 'duplicado' }, { id: 1 }, {});

            await linkController.atualizar(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });

    describe('remover', () => {
        it('deve remover link com status 200', async () => {
            mockLinkService.remover.mockResolvedValue(linkMock);
            const requisicao = mockRequest({}, { id: 1 }, {});

            await linkController.remover(requisicao, resposta);

            expect(mockLinkService.remover).toHaveBeenCalledWith(1);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(linkMock);
        });

        it('deve retornar 404 quando link nao for encontrado', async () => {
            mockLinkService.remover.mockResolvedValue(null);
            const requisicao = mockRequest({}, { id: 999 }, {});

            await linkController.remover(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(resposta.json).toHaveBeenCalledWith({ msg: 'Link não encontrado' });
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Falha ao remover link';
            mockLinkService.remover.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({}, { id: 1 }, {});

            await linkController.remover(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });

    describe('redirecionar', () => {
        it('deve redirecionar para URL original quando encontrada', async () => {
            mockLinkService.obterPorUrlCurta.mockResolvedValue(linkMock);
            mockLinkService.registrarAcesso.mockResolvedValue(undefined);
            const requisicao = {
                params: { urlCurta: 'abc123' },
                headers: { 'user-agent': 'Mozilla/5.0', referer: 'https://google.com' },
                ip: '127.0.0.1'
            } as unknown as Request;

            await linkController.redirecionar(requisicao, resposta);

            expect(mockLinkService.obterPorUrlCurta).toHaveBeenCalledWith('abc123');
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.PERMANENT_REDIRECT);
            expect(resposta.redirect).toHaveBeenCalledWith('https://example.com');
        });

        it('deve retornar 404 quando URL curta nao for encontrada', async () => {
            mockLinkService.obterPorUrlCurta.mockResolvedValue(null);
            const requisicao = {
                params: { urlCurta: 'inexistente' },
                headers: {},
                ip: '127.0.0.1'
            } as unknown as Request;

            await linkController.redirecionar(requisicao, resposta);

            expect(mockLinkService.obterPorUrlCurta).toHaveBeenCalledWith('inexistente');
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(resposta.json).toHaveBeenCalledWith({ msg: 'UrlCurta não encontrada' });
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Erro interno';
            mockLinkService.obterPorUrlCurta.mockRejectedValue(new Error(errorMessage));
            const requisicao = {
                params: { urlCurta: 'abc123' },
                headers: {},
                ip: '127.0.0.1'
            } as unknown as Request;

            await linkController.redirecionar(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });
});

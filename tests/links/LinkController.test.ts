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


const mockRequest = (body: any = {}, params: any = {}, query: any = {}) => {
    return { body, params, query } as Request;
};


const mockLinkService: jest.Mocked<ILinkService> = {
    obterTodos: jest.fn(),
    obterPorId: jest.fn(),
    obterPorUrlCurta: jest.fn(),
    cadastrar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn()
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
            // Arrange
            const linksMock: Link[] = [
                { 
                    id: 1, 
                    urlOriginal: 'https://example.com', 
                    urlCurta: 'abc123', 
                    acessos: 0, 
                    ativo: true, 
                    expiraEm: null, 
                    criadoEm: new Date(), 
                    atualizadoEm: new Date() 
                }
            ];

            mockLinkService.obterTodos.mockResolvedValue(linksMock);
            const requisicao = mockRequest({}, {}, { pagina: '1', limite: '10', filtro: 'test' });

            // Act
            await linkController.obterTodos(requisicao, resposta);

            // Assert
            expect(mockLinkService.obterTodos).toHaveBeenCalledWith({
                pagina: 1,
                limite: 10,
                filtro: 'test'
            });
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(linksMock);
        });
    });

    describe('obterPorId', () => {
        it('deve retornar link por ID com status 200', async () => {
            // Arrange
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

            mockLinkService.obterPorId.mockResolvedValue(linkMock);
            const requisicao = mockRequest({}, { id: 1 }, {});

            // Act
            await linkController.obterPorId(requisicao, resposta);

            // Assert
            expect(mockLinkService.obterPorId).toHaveBeenCalledWith(1);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(linkMock);
        });
    });

    describe('cadastrar', () => {
        it('deve criar novo link com status 201', async () => {
            // Arrange
            const novoLinkDto: CadastrarLinkDto = { 
                urlOriginal: 'https://example.com', 
                urlCurta: 'abc123', 
                expiraEm: null 
            };

            const linkCriado: Link = { 
                id: 1, 
                ...novoLinkDto, 
                acessos: 0, 
                ativo: true, 
                criadoEm: new Date(), 
                atualizadoEm: new Date() 
            };

            mockLinkService.cadastrar.mockResolvedValue(linkCriado);
            const req = mockRequest(novoLinkDto, {}, {});

            // Act
            await linkController.cadastrar(req, resposta);

            // Assert
            expect(mockLinkService.cadastrar).toHaveBeenCalledWith(novoLinkDto);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.CREATED);
            expect(resposta.json).toHaveBeenCalledWith(linkCriado);
        });
    });

    describe('atualizar', () => {
        it('deve atualizar link com status 200', async () => {
            // Arrange
            const atualizarLinkDto: AtualizarLinkDto = { 
                urlCurta: 'novo123',
                acessos: 5
            };

            const linkAtualizado: Link = { 
                id: 1, 
                urlOriginal: 'https://example.com', 
                urlCurta: 'novo123', 
                acessos: 5, 
                ativo: true, 
                expiraEm: null, 
                criadoEm: new Date(), 
                atualizadoEm: new Date() 
            };

            mockLinkService.atualizar.mockResolvedValue(linkAtualizado);
            const requisicao = mockRequest(atualizarLinkDto, { id: 1 }, {});

            // Act
            await linkController.atualizar(requisicao, resposta);

            // Assert
            expect(mockLinkService.atualizar).toHaveBeenCalledWith(1, atualizarLinkDto);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(linkAtualizado);
        });
    });

    describe('remover', () => {
        it('deve remover link com status 200', async () => {
            // Arrange
            const linkRemovido: Link = { 
                id: 1, 
                urlOriginal: 'https://example.com', 
                urlCurta: 'abc123', 
                acessos: 0, 
                ativo: true, 
                expiraEm: null, 
                criadoEm: new Date(), 
                atualizadoEm: new Date() 
            };

            mockLinkService.remover.mockResolvedValue(linkRemovido);
            const req = mockRequest({}, { id: 1 }, {});

            // Act
            await linkController.remover(req, resposta);

            // Assert
            expect(mockLinkService.remover).toHaveBeenCalledWith(1);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(linkRemovido);
        });
    });

    describe('redirecionar', () => {
        it('deve redirecionar para URL original quando encontrada', async () => {
            // Arrange
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

            mockLinkService.obterPorUrlCurta.mockResolvedValue(linkMock);
            
            // Correção: usar params em vez de body
            const requisicao = {
                params: { urlCurta: 'abc123' }
            } as unknown as Request;

            // Act
            await linkController.redirecionar(requisicao, resposta);

            // Assert
            expect(mockLinkService.obterPorUrlCurta).toHaveBeenCalledWith('abc123');
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.PERMANENT_REDIRECT);
            expect(resposta.redirect).toHaveBeenCalledWith('https://example.com');
        });

        it('deve retornar 404 quando URL curta não for encontrada', async () => {
            // Arrange
            mockLinkService.obterPorUrlCurta.mockResolvedValue(null);
            const requisicao = {
                params: { urlCurta: 'inexistente' }
            } as unknown as Request;

            // Act
            await linkController.redirecionar(requisicao, resposta);

            // Assert
            expect(mockLinkService.obterPorUrlCurta).toHaveBeenCalledWith('inexistente');
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(resposta.json).toHaveBeenCalledWith({ msg: 'UrlCurta não encontrada' });
        });

        it('deve retornar erro 500 quando service falhar', async () => {
            // Arrange
            const errorMessage = "Cannot read properties of undefined (reading 'urlCurta')";
            mockLinkService.obterPorUrlCurta.mockRejectedValue(new Error(errorMessage));
            const requisicao = {
                params: { urlCurta: 'abc123' }
            } as unknown as Request;

            // Act
            await linkController.redirecionar(requisicao, resposta);

            // Assert
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });
});
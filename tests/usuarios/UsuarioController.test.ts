import { CadastrarUsuarioDto, Usuario } from '../../src/models';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IUsuarioService } from '../../src/interfaces';
import { UsuarioController } from '../../src/controllers';


const mockResponse = () => {
    const resposta: Partial<Response> = {};
    resposta.status = jest.fn().mockReturnValue(resposta);
    resposta.json = jest.fn().mockReturnValue(resposta);
    return resposta as Response;
};


const mockRequest = (body: any = {}, params: any = {}, query: any = {}) => {
    return { body, params, query } as Request;
};


const mockUsuarioService: IUsuarioService = {
    obterTodos: jest.fn(),
    obterPorId: jest.fn(),
    cadastrar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
    entrar: jest.fn()
};


describe('UsuarioController', () => {
    let resposta: Response;
    let usuarioController: UsuarioController;

    beforeEach(() => {
        resposta = mockResponse();
        usuarioController = new UsuarioController(mockUsuarioService);

        jest.clearAllMocks();
    });

    describe('obterTodos', () => {
        it('deve retornar lista de usuários com status 200', async () => {
            // Arrange
            const usuariosMock: Usuario[] = [
                { id: 1, nome: 'Usuario 1', email: 'usuario1@email.com', senha: 'hash123', ativo: true, administrador: false, criadoEm: new Date(), atualizadoEm: new Date() },
                { id: 2, nome: 'Usuario 2', email: 'usuario2@email.com', senha: 'hash456', ativo: true, administrador: true, criadoEm: new Date(), atualizadoEm: new Date() }
            ];

            (mockUsuarioService.obterTodos as jest.Mock).mockResolvedValue(usuariosMock);
            const requisicao = mockRequest({}, {}, { pagina: '1', limite: '10' });

            // Act
            await usuarioController.obterTodos(requisicao, resposta);

            // Assert
            expect(mockUsuarioService.obterTodos).toHaveBeenCalledWith({
                pagina: 1,
                limite: 10,
                filtro: ''
            });
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(usuariosMock);
        });

        it('deve retornar erro 500 quando service falhar', async () => {
            // Arrange
            const errorMessage = 'Erro ao buscar usuários';
            (mockUsuarioService.obterTodos as jest.Mock).mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({}, {}, {});

            // Act
            await usuarioController.obterTodos(requisicao, resposta);

            // Assert
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('obterPorId', () => {
        it('deve retornar usuário por ID com status 200', async () => {
            // Arrange
            const usuarioMock: Usuario = { 
                id: 1, 
                nome: 'Usuario Teste', 
                email: 'teste@email.com', 
                senha: 'hash123', 
                ativo: true, 
                administrador: false,
                criadoEm: new Date(),
                atualizadoEm: new Date()
            };

            (mockUsuarioService.obterPorId as jest.Mock).mockResolvedValue(usuarioMock);
            const req = mockRequest({}, { id: 1 }, {});

            // Act
            await usuarioController.obterPorId(req, resposta);

            // Assert
            expect(mockUsuarioService.obterPorId).toHaveBeenCalledWith(1);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(usuarioMock);
        });

        it('deve retornar 404 quando usuário não for encontrado', async () => {
            // Arrange
            (mockUsuarioService.obterPorId as jest.Mock).mockResolvedValue(null);
            const req = mockRequest({}, { id: '999' }, {});

            // Act
            await usuarioController.obterPorId(req, resposta);

            // Assert
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(resposta.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
        });
    });

    describe('cadastrar', () => {
        it('deve criar novo usuário com status 201', async () => {
            // Arrange
            const novoUsuario: CadastrarUsuarioDto = { 
                nome: 'Novo Usuario', 
                email: 'novo@email.com', 
                senha: 'hash123', 
                ativo: true, 
                administrador: false 
            };

            (mockUsuarioService.cadastrar as jest.Mock).mockResolvedValue(novoUsuario);
            const req = mockRequest({
                nome: 'Novo Usuario',
                email: 'novo@email.com',
                senha: 'senha123',
                ativo: true,
                administrador: false
            }, {}, {});

            // Act
            await usuarioController.cadastrar(req, resposta);

            // Assert
            expect(mockUsuarioService.cadastrar).toHaveBeenCalledWith({
                nome: 'Novo Usuario',
                email: 'novo@email.com',
                senha: 'senha123',
                ativo: true,
                administrador: false
            });
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.CREATED);
            expect(resposta.json).toHaveBeenCalledWith(novoUsuario);
        });
    });

    describe('entrar', () => {
        it('deve retornar token e usuário ao fazer login', async () => {
            // Arrange
            const loginResponse = {
                usuario: { 
                id: 1, 
                nome: 'Usuario Teste', 
                email: 'teste@email.com', 
                senha: 'hash123', 
                ativo: true, 
                administrador: false 
                },
                token: 'jwt-token-123'
            };

            (mockUsuarioService.entrar as jest.Mock).mockResolvedValue(loginResponse);
            const req = mockRequest({
                email: 'teste@email.com',
                senha: 'senha123'
            }, {}, {});

            // Act
            await usuarioController.entrar(req, resposta);

            // Assert
            expect(mockUsuarioService.entrar).toHaveBeenCalledWith({
                email: 'teste@email.com',
                senha: 'senha123'
            });
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(loginResponse);
        });
    });
});
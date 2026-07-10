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


const mockUsuarioService: jest.Mocked<IUsuarioService> = {
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
        it('deve retornar lista de usuarios com status 200', async () => {
            const usuariosMock: Usuario[] = [usuarioMock];
            mockUsuarioService.obterTodos.mockResolvedValue(usuariosMock);
            const requisicao = mockRequest({}, {}, { pagina: '1', limite: '10' });

            await usuarioController.obterTodos(requisicao, resposta);

            expect(mockUsuarioService.obterTodos).toHaveBeenCalledWith({
                pagina: 1,
                limite: 10,
                filtro: ''
            });
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(usuariosMock);
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Erro ao buscar usuários';
            mockUsuarioService.obterTodos.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({}, {}, {});

            await usuarioController.obterTodos(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('obterPorId', () => {
        it('deve retornar usuario por ID com status 200', async () => {
            mockUsuarioService.obterPorId.mockResolvedValue(usuarioMock);
            const requisicao = mockRequest({}, { id: 1 }, {});

            await usuarioController.obterPorId(requisicao, resposta);

            expect(mockUsuarioService.obterPorId).toHaveBeenCalledWith(1);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(usuarioMock);
        });

        it('deve retornar 404 quando usuario nao for encontrado', async () => {
            mockUsuarioService.obterPorId.mockResolvedValue(null);
            const requisicao = mockRequest({}, { id: 999 }, {});

            await usuarioController.obterPorId(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(resposta.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Erro ao buscar usuário';
            mockUsuarioService.obterPorId.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({}, { id: 1 }, {});

            await usuarioController.obterPorId(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });

    describe('cadastrar', () => {
        it('deve criar novo usuario com status 201', async () => {
            const novoUsuarioDto: CadastrarUsuarioDto = {
                nome: 'Novo Usuario',
                email: 'novo@email.com',
                senha: 'senha123',
                ativo: true,
                administrador: false
            };

            const usuarioCriado: Usuario = { ...usuarioMock, ...novoUsuarioDto };
            mockUsuarioService.cadastrar.mockResolvedValue(usuarioCriado);
            const requisicao = mockRequest(novoUsuarioDto, {}, {});

            await usuarioController.cadastrar(requisicao, resposta);

            expect(mockUsuarioService.cadastrar).toHaveBeenCalledWith(novoUsuarioDto);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.CREATED);
            expect(resposta.json).toHaveBeenCalledWith(usuarioCriado);
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Email já registrado';
            mockUsuarioService.cadastrar.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({
                nome: 'Teste',
                email: 'existente@email.com',
                senha: 'senha123',
                ativo: true,
                administrador: false
            }, {}, {});

            await usuarioController.cadastrar(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });

    describe('atualizar', () => {
        it('deve atualizar usuario com status 200', async () => {
            const usuarioAtualizado: Usuario = { ...usuarioMock, nome: 'Nome Atualizado' };
            mockUsuarioService.atualizar.mockResolvedValue(usuarioAtualizado);
            const requisicao = mockRequest({ nome: 'Nome Atualizado' }, { id: 1 }, {});

            await usuarioController.atualizar(requisicao, resposta);

            expect(mockUsuarioService.atualizar).toHaveBeenCalledWith(1, { nome: 'Nome Atualizado' });
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(usuarioAtualizado);
        });

        it('deve retornar 404 quando usuario nao for encontrado', async () => {
            mockUsuarioService.atualizar.mockResolvedValue(null);
            const requisicao = mockRequest({ nome: 'Teste' }, { id: 999 }, {});

            await usuarioController.atualizar(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(resposta.json).toHaveBeenCalledWith({ msg: 'Usuário não encontrado' });
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Email já registrado';
            mockUsuarioService.atualizar.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({ email: 'duplicado@email.com' }, { id: 1 }, {});

            await usuarioController.atualizar(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });

    describe('remover', () => {
        it('deve remover usuario com status 200', async () => {
            mockUsuarioService.remover.mockResolvedValue(usuarioMock);
            const requisicao = mockRequest({}, { id: 1 }, {});

            await usuarioController.remover(requisicao, resposta);

            expect(mockUsuarioService.remover).toHaveBeenCalledWith(1);
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(usuarioMock);
        });

        it('deve retornar 404 quando usuario nao for encontrado', async () => {
            mockUsuarioService.remover.mockResolvedValue(null);
            const requisicao = mockRequest({}, { id: 999 }, {});

            await usuarioController.remover(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
            expect(resposta.json).toHaveBeenCalledWith({ msg: 'Usuário não encontrado' });
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Falha ao remover usuário';
            mockUsuarioService.remover.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({}, { id: 1 }, {});

            await usuarioController.remover(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });

    describe('entrar', () => {
        it('deve retornar token ao fazer login com credenciais validas', async () => {
            const tokenEsperado = { usuario: usuarioMock, token: 'jwt-token-123' };
            mockUsuarioService.entrar.mockResolvedValue(tokenEsperado as any);
            const requisicao = mockRequest({
                email: 'teste@email.com',
                senha: 'senha123'
            }, {}, {});

            await usuarioController.entrar(requisicao, resposta);

            expect(mockUsuarioService.entrar).toHaveBeenCalledWith({
                email: 'teste@email.com',
                senha: 'senha123'
            });
            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.OK);
            expect(resposta.json).toHaveBeenCalledWith(tokenEsperado);
        });

        it('deve retornar 401 quando credenciais forem invalidas', async () => {
            mockUsuarioService.entrar.mockResolvedValue(null);
            const requisicao = mockRequest({
                email: 'invalido@email.com',
                senha: 'senhaerrada'
            }, {}, {});

            await usuarioController.entrar(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
            expect(resposta.json).toHaveBeenCalledWith({ msg: 'Email ou senha inválidos' });
        });

        it('deve retornar 500 quando service falhar', async () => {
            const errorMessage = 'Erro ao autenticar';
            mockUsuarioService.entrar.mockRejectedValue(new Error(errorMessage));
            const requisicao = mockRequest({
                email: 'teste@email.com',
                senha: 'senha123'
            }, {}, {});

            await usuarioController.entrar(requisicao, resposta);

            expect(resposta.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(resposta.json).toHaveBeenCalledWith({ msg: errorMessage });
        });
    });
});

import { Usuario, CadastrarUsuarioDto, AtualizarUsuarioDto } from '../../src/models';
import { IUsuarioRepository } from '../../src/interfaces';
import { UsuarioService } from '../../src/services';
import { HashUtil, JwtUtil } from '../../src/utils';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hash-criptografado')
}));


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


const mockUsuarioRepository: jest.Mocked<IUsuarioRepository> = {
    obterTodos: jest.fn(),
    obterPorId: jest.fn(),
    obterPorEmail: jest.fn(),
    cadastrar: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn()
};


const mockJwtUtil = {
    Gerar: jest.fn().mockReturnValue('jwt-token-mock'),
    Autenticar: jest.fn()
};


const mockHashUtil = {
    Criptografar: jest.fn().mockResolvedValue('hash-criptografado'),
    Comparar: jest.fn()
};


describe('UsuarioService', () => {
    let usuarioService: UsuarioService;

    beforeEach(() => {
        usuarioService = new UsuarioService(mockJwtUtil as any, mockHashUtil as any, mockUsuarioRepository);
        jest.clearAllMocks();
    });

    describe('obterTodos', () => {
        it('deve retornar lista de usuarios', async () => {
            mockUsuarioRepository.obterTodos.mockResolvedValue([usuarioMock]);

            const resultado = await usuarioService.obterTodos({ pagina: 1, limite: 10, filtro: '' });

            expect(mockUsuarioRepository.obterTodos).toHaveBeenCalledWith({ pagina: 1, limite: 10, filtro: '' });
            expect(resultado).toEqual([usuarioMock]);
        });
    });

    describe('obterPorId', () => {
        it('deve retornar usuario por ID', async () => {
            mockUsuarioRepository.obterPorId.mockResolvedValue(usuarioMock);

            const resultado = await usuarioService.obterPorId(1);

            expect(mockUsuarioRepository.obterPorId).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(usuarioMock);
        });

        it('deve retornar null quando usuario nao for encontrado', async () => {
            mockUsuarioRepository.obterPorId.mockResolvedValue(null);

            const resultado = await usuarioService.obterPorId(999);

            expect(resultado).toBeNull();
        });
    });

    describe('cadastrar', () => {
        it('deve criar usuario com sucesso', async () => {
            const dto: CadastrarUsuarioDto = {
                nome: 'Novo Usuario',
                email: 'novo@email.com',
                senha: 'senha123',
                ativo: true,
                administrador: false
            };

            mockUsuarioRepository.obterPorEmail.mockResolvedValue(null);
            mockUsuarioRepository.cadastrar.mockResolvedValue({ ...usuarioMock, ...dto });

            const resultado = await usuarioService.cadastrar(dto);

            expect(mockUsuarioRepository.obterPorEmail).toHaveBeenCalledWith('novo@email.com');
            expect(mockUsuarioRepository.cadastrar).toHaveBeenCalledWith(dto);
            expect(resultado).toBeDefined();
        });

        it('deve lancar erro quando email ja estiver em uso', async () => {
            const dto: CadastrarUsuarioDto = {
                nome: 'Novo Usuario',
                email: 'existente@email.com',
                senha: 'senha123',
                ativo: true,
                administrador: false
            };

            mockUsuarioRepository.obterPorEmail.mockResolvedValue(usuarioMock);

            await expect(usuarioService.cadastrar(dto)).rejects.toThrow('Email já registrado');
        });

        it('deve lancar erro quando repository retornar null', async () => {
            const dto: CadastrarUsuarioDto = {
                nome: 'Novo Usuario',
                email: 'novo@email.com',
                senha: 'senha123',
                ativo: true,
                administrador: false
            };

            mockUsuarioRepository.obterPorEmail.mockResolvedValue(null);
            mockUsuarioRepository.cadastrar.mockResolvedValue(null);

            await expect(usuarioService.cadastrar(dto)).rejects.toThrow('Falha ao cadastrar usuário');
        });
    });

    describe('atualizar', () => {
        it('deve atualizar usuario com sucesso', async () => {
            const dto: AtualizarUsuarioDto = { nome: 'Nome Atualizado' };
            mockUsuarioRepository.obterPorId.mockResolvedValue(usuarioMock);
            mockUsuarioRepository.atualizar.mockResolvedValue({ ...usuarioMock, ...dto });

            const resultado = await usuarioService.atualizar(1, dto);

            expect(mockUsuarioRepository.atualizar).toHaveBeenCalledWith(1, dto);
            expect(resultado?.nome).toBe('Nome Atualizado');
        });

        it('deve lancar erro quando usuario nao for encontrado', async () => {
            mockUsuarioRepository.obterPorId.mockResolvedValue(null);

            await expect(usuarioService.atualizar(999, { nome: 'Teste' }))
                .rejects.toThrow('Usuário não encontrado');
        });

        it('deve lancar erro quando email ja estiver em uso por outro usuario', async () => {
            mockUsuarioRepository.obterPorId.mockResolvedValue(usuarioMock);
            mockUsuarioRepository.obterPorEmail.mockResolvedValue({ ...usuarioMock, id: 2 });

            await expect(usuarioService.atualizar(1, { email: 'duplicado@email.com' }))
                .rejects.toThrow('Email já registrado');
        });

        it('deve criptografar senha quando fornecida na atualizacao', async () => {
            mockUsuarioRepository.obterPorId.mockResolvedValue(usuarioMock);
            mockUsuarioRepository.atualizar.mockResolvedValue(usuarioMock);

            await usuarioService.atualizar(1, { senha: 'novasenha' });

            expect(mockUsuarioRepository.atualizar).toHaveBeenCalledWith(1,
                expect.objectContaining({ senha: 'hash-criptografado' })
            );
        });
    });

    describe('remover', () => {
        it('deve remover usuario com sucesso', async () => {
            mockUsuarioRepository.obterPorId.mockResolvedValue(usuarioMock);
            mockUsuarioRepository.remover.mockResolvedValue(true);

            const resultado = await usuarioService.remover(1);

            expect(mockUsuarioRepository.remover).toHaveBeenCalledWith(1);
            expect(resultado).toEqual(usuarioMock);
        });

        it('deve lancar erro quando usuario nao for encontrado', async () => {
            mockUsuarioRepository.obterPorId.mockResolvedValue(null);

            await expect(usuarioService.remover(999)).rejects.toThrow('Usuário não encontrado');
        });
    });

    describe('entrar', () => {
        it('deve retornar token ao fazer login com credenciais validas', async () => {
            mockUsuarioRepository.obterPorEmail.mockResolvedValue(usuarioMock);
            mockHashUtil.Comparar.mockResolvedValue(true as any);

            const resultado = await usuarioService.entrar({
                email: 'teste@email.com',
                senha: 'senha123'
            });

            expect(mockUsuarioRepository.obterPorEmail).toHaveBeenCalledWith('teste@email.com');
            expect(mockHashUtil.Comparar).toHaveBeenCalledWith('senha123', 'hash123');
            expect(mockJwtUtil.Gerar).toHaveBeenCalledWith({ id: 1, administrador: false });
            expect(resultado).toBe('jwt-token-mock');
        });

        it('deve lancar erro quando email nao existir', async () => {
            mockUsuarioRepository.obterPorEmail.mockResolvedValue(null);

            await expect(usuarioService.entrar({
                email: 'inexistente@email.com',
                senha: 'senha123'
            })).rejects.toThrow('Credenciais inválidas');
        });

        it('deve lancar erro quando senha estiver incorreta', async () => {
            mockUsuarioRepository.obterPorEmail.mockResolvedValue(usuarioMock);
            mockHashUtil.Comparar.mockResolvedValue(false as any);

            await expect(usuarioService.entrar({
                email: 'teste@email.com',
                senha: 'senhaerrada'
            })).rejects.toThrow('Credenciais inválidas');
        });
    });
});

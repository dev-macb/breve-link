import 'reflect-metadata';
import { Knex } from '../../src/config/knex';
import { UsuarioRepository } from '../../src/repositories/UsuarioRepository';
import { UsuarioService } from '../../src/services/UsuarioService';
import { HashUtil, JwtUtil } from '../../src/utils';
import { up } from '../../src/migrations/001_CriarTabelaUsuarios';
import { up as migrarSessao } from '../../src/migrations/004_NormalizarUsuariosESessoes';
import { usuarioResposta } from '../../src/dtos/UsuarioResposta';

describe('Usuarios com SQLite e bcrypt reais', () => {
    const repositorio = new UsuarioRepository();
    const jwt = { Gerar: jest.fn().mockReturnValue('token-teste'), Autenticar: jest.fn() };
    const servico = new UsuarioService(jwt as unknown as typeof JwtUtil, HashUtil, repositorio);

    beforeAll(async () => {
        await up(Knex);
        await migrarSessao(Knex);
    });
    afterAll(async () => {
        await Knex.destroy();
    });

    it('persiste hash, autentica, troca senha e remove o usuario', async () => {
        const dto = {
            nome: 'Teste',
            email: '  TESTE@EXAMPLE.COM ',
            senha: 'senha-original',
            ativo: true,
            administrador: false
        };
        const usuario = await servico.cadastrar(dto);
        const persistido = await repositorio.obterPorId(usuario.id);
        expect(persistido?.email).toBe('teste@example.com');
        expect(persistido?.senha).not.toBe(dto.senha);
        expect(await HashUtil.Comparar(dto.senha, persistido!.senha)).toBe(true);
        expect(usuarioResposta(usuario)).not.toHaveProperty('senha');
        await expect(servico.entrar({ email: dto.email, senha: dto.senha })).resolves.toBe(
            'token-teste'
        );

        await servico.atualizar(usuario.id, { email: dto.email, senha: 'nova-senha-segura' });
        await expect(servico.entrar({ email: dto.email, senha: dto.senha })).rejects.toThrow(
            'Credenciais inválidas'
        );
        await expect(
            servico.entrar({ email: dto.email, senha: 'nova-senha-segura' })
        ).resolves.toBe('token-teste');

        await servico.atualizar(usuario.id, { ativo: false });
        jwt.Gerar.mockClear();
        await expect(
            servico.entrar({ email: dto.email, senha: 'nova-senha-segura' })
        ).rejects.toThrow('Credenciais inválidas');
        expect(jwt.Gerar).not.toHaveBeenCalled();
        await servico.remover(usuario.id);
        expect(await repositorio.obterPorId(usuario.id)).toBeNull();
    });
});

import bcrypt from 'bcrypt';
import { logger } from '../config/Logger';
import { HashUtil, JwtUtil } from '../utils';
import { inject, injectable } from 'inversify';
import { COMPLEXIDADE_HASH, TIPOS } from '../config/Constantes';
import { IFiltros, IUsuarioRepository, IUsuarioService } from '../interfaces';
import { Usuario, CadastrarUsuarioDto, AtualizarUsuarioDto, EntrarUsuarioDto } from '../models';


@injectable()
class UsuarioService implements IUsuarioService {
    constructor(
        @inject(TIPOS.IJwtUtil) 
        private readonly jwtUtil: typeof JwtUtil,

        @inject(TIPOS.IHashUtil) 
        private readonly hashUtil: typeof HashUtil,

        @inject(TIPOS.IUsuarioRepository) 
        private readonly usuarioRepository: IUsuarioRepository,
    ) {}

    async obterTodos(filtros: IFiltros): Promise<Usuario[]> {
        return this.usuarioRepository.obterTodos(filtros) || [];
    }

    async obterPorId(id: number): Promise<Usuario | null> {
        return this.usuarioRepository.obterPorId(id);
    }

    async obterPorEmail(email: string): Promise<Usuario | null> {
        return this.usuarioRepository.obterPorEmail(email);
    }

    async cadastrar(cadastrarUsuarioDto: CadastrarUsuarioDto): Promise<Usuario> {
        if (cadastrarUsuarioDto.email) {
            const emailEmUso = await this.usuarioRepository.obterPorEmail(cadastrarUsuarioDto.email);
            if (emailEmUso) {
                logger.warn('Tentativa de cadastro com email já em uso');
                throw new Error("Email já registrado");
            }
        }

        const novoUsuario = await this.usuarioRepository.cadastrar(cadastrarUsuarioDto);
        if (!novoUsuario) {
            logger.error({ email: cadastrarUsuarioDto.email }, 'Falha ao cadastrar usuário');
            throw new Error("Falha ao cadastrar usuário");
        }

        return novoUsuario;
    }

    async atualizar(id: number, atualizarUsuarioDto: AtualizarUsuarioDto): Promise<Usuario | null> {
        const usuarioExistente = await this.usuarioRepository.obterPorId(id);
        if (!usuarioExistente) {
            logger.warn({ id }, 'Tentativa de atualizar usuário inexistente');
            throw new Error("Usuário não encontrado");
        }

        if (atualizarUsuarioDto.email) {
            const emailEmUso = await this.usuarioRepository.obterPorEmail(atualizarUsuarioDto.email);
            if (emailEmUso) {
                logger.warn({ email: atualizarUsuarioDto.email }, 'Tentativa de atualizar com email já em uso');
                throw new Error("Email já registrado");
            }
        }
        
        if (atualizarUsuarioDto.senha) {
            atualizarUsuarioDto.senha = await bcrypt.hash(atualizarUsuarioDto.senha, COMPLEXIDADE_HASH);
        }

        const usuarioAtualizado = await this.usuarioRepository.atualizar(id, atualizarUsuarioDto);

        logger.info({ id, atualizado: !!usuarioAtualizado }, 'Usuário atualizado');

        return usuarioAtualizado;
    }

    async remover(id: number): Promise<Usuario | null> {
        const usuarioExistente = await this.usuarioRepository.obterPorId(id);
        if (!usuarioExistente) {
            logger.warn({ id }, 'Tentativa de remover usuário inexistente');
            throw new Error("Usuário não encontrado");
        }

        const usuarioRemovido = this.usuarioRepository.remover(id);
        if (!usuarioRemovido) {
            logger.error({ id }, 'Falha ao remover usuário');
            throw new Error("Falha ao remover usuário");
        }

        logger.info({ id }, 'Usuário removido com sucesso');
        return usuarioExistente;
    }

    async entrar(credenciais: EntrarUsuarioDto): Promise<string | null> {
        const usuarioComEmail = await this.usuarioRepository.obterPorEmail(credenciais.email);
        if (!usuarioComEmail) {
            logger.warn('E-mail inválido!');
            throw new Error("Credenciais inválidas");
        }

        const senhaCorreta = await this.hashUtil.Comparar(credenciais.senha, usuarioComEmail.senha);
        if (!senhaCorreta) {
            logger.warn('Senha inválida!');
            throw new Error("Credenciais inválidas");
        }

        const payload = { id: usuarioComEmail.id, administrador: usuarioComEmail.administrador };
        const token = this.jwtUtil.Gerar(payload);

        
        
        return token;
    }
}


export { UsuarioService };
import { logger } from '../config/Logger';
import { HashUtil, JwtUtil } from '../utils';
import { inject, injectable } from 'inversify';
import { TIPOS } from '../config/Constantes';
import { IFiltros, IUsuarioRepository, IUsuarioService } from '../interfaces';
import { Usuario, CadastrarUsuarioDto, AtualizarUsuarioDto, EntrarUsuarioDto } from '../models';
import { Conflito, NaoAutenticado, RecursoNaoEncontrado } from '../erros';
import { Pagina } from '../dtos/Pagina';


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

    async obterTodos(filtros: IFiltros): Promise<Pagina<Usuario>> {
        const { pagina = 1, limite = 10 } = filtros;
        const itens = await this.usuarioRepository.obterTodos(filtros);
        const total = await this.usuarioRepository.contar(filtros);
        return { itens, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
    }

    async obterPorId(id: number): Promise<Usuario | null> {
        return this.usuarioRepository.obterPorId(id);
    }

    async obterPorEmail(email: string): Promise<Usuario | null> {
        return this.usuarioRepository.obterPorEmail(email.trim().toLowerCase());
    }

    async cadastrar(cadastrarUsuarioDto: CadastrarUsuarioDto): Promise<Usuario> {
        cadastrarUsuarioDto = { ...cadastrarUsuarioDto, email: cadastrarUsuarioDto.email.trim().toLowerCase() };
        if (cadastrarUsuarioDto.email) {
            const emailEmUso = await this.usuarioRepository.obterPorEmail(cadastrarUsuarioDto.email);
            if (emailEmUso) {
                logger.warn('Tentativa de cadastro com email já em uso');
                throw new Conflito("Email já registrado");
            }
        }

        const senha = await this.hashUtil.Criptografar(cadastrarUsuarioDto.senha);
        const novoUsuario = await this.usuarioRepository.cadastrar({ ...cadastrarUsuarioDto, senha });
        if (!novoUsuario) {
            logger.error({ email: cadastrarUsuarioDto.email }, 'Falha ao cadastrar usuário');
            throw new Error("Falha ao cadastrar usuário");
        }

        return novoUsuario;
    }

    async atualizar(id: number, atualizarUsuarioDto: AtualizarUsuarioDto): Promise<Usuario | null> {
        atualizarUsuarioDto = { ...atualizarUsuarioDto };
        if (atualizarUsuarioDto.email !== undefined) {
            atualizarUsuarioDto.email = atualizarUsuarioDto.email.trim().toLowerCase();
        }
        const usuarioExistente = await this.usuarioRepository.obterPorId(id);
        if (!usuarioExistente) {
            logger.warn({ id }, 'Tentativa de atualizar usuário inexistente');
            throw new RecursoNaoEncontrado("Usuário não encontrado");
        }

        if (atualizarUsuarioDto.email) {
            const emailEmUso = await this.usuarioRepository.obterPorEmail(atualizarUsuarioDto.email);
            if (emailEmUso && emailEmUso.id !== id) {
                logger.warn({ email: atualizarUsuarioDto.email }, 'Tentativa de atualizar com email já em uso');
                throw new Conflito("Email já registrado");
            }
        }
        
        if (atualizarUsuarioDto.senha) {
            atualizarUsuarioDto.senha = await this.hashUtil.Criptografar(atualizarUsuarioDto.senha);
        }

        const usuarioAtualizado = await this.usuarioRepository.atualizar(id, atualizarUsuarioDto);

        logger.info({ id, atualizado: !!usuarioAtualizado }, 'Usuário atualizado');

        return usuarioAtualizado;
    }

    async remover(id: number): Promise<Usuario | null> {
        const usuarioExistente = await this.usuarioRepository.obterPorId(id);
        if (!usuarioExistente) {
            logger.warn({ id }, 'Tentativa de remover usuário inexistente');
            throw new RecursoNaoEncontrado("Usuário não encontrado");
        }

        const usuarioRemovido = await this.usuarioRepository.remover(id);
        if (!usuarioRemovido) {
            logger.error({ id }, 'Falha ao remover usuário');
            throw new Error("Falha ao remover usuário");
        }

        logger.info({ id }, 'Usuário removido com sucesso');
        return usuarioExistente;
    }

    async entrar(credenciais: EntrarUsuarioDto): Promise<string | null> {
        const usuarioComEmail = await this.obterPorEmail(credenciais.email);
        if (!usuarioComEmail || !usuarioComEmail.ativo) {
            logger.warn('E-mail inválido!');
            throw new NaoAutenticado("Credenciais inválidas");
        }

        const senhaCorreta = await this.hashUtil.Comparar(credenciais.senha, usuarioComEmail.senha);
        if (!senhaCorreta) {
            logger.warn('Senha inválida!');
            throw new NaoAutenticado("Credenciais inválidas");
        }

        const payload = { id: usuarioComEmail.id, administrador: !!usuarioComEmail.administrador, versaoSessao: usuarioComEmail.versaoSessao ?? 0 };
        const token = this.jwtUtil.Gerar(payload);

        
        
        return token;
    }
}


export { UsuarioService };

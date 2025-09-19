import { logger } from '../config/Logger';
import { Request, Response } from 'express';
import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { IId, IFiltros, IUsuarioService } from '../interfaces';
import { AtualizarUsuarioDto, CadastrarUsuarioDto, EntrarUsuarioDto } from '../models';


@injectable()
class UsuarioController {
    constructor(
        @inject(TIPOS.IUsuarioService) 
        private readonly usuarioService: IUsuarioService
    ) {}
    
    async obterTodos(requisicao: Request<{}, {}, {}, IFiltros>, resposta: Response): Promise<Response> {
        try {
            const { pagina, limite, filtro } = requisicao.query;
            const filtros = {
                pagina: pagina ? Number(pagina) : 1,
                limite: limite ? Number(limite) : 10,
                filtro: filtro ?? ''
            };

            const usuarios = await this.usuarioService.obterTodos(filtros);

            logger.info(`Retornando ${usuarios.length} usuários`);
            return resposta.status(StatusCodes.OK).json(usuarios);
        } 
        catch (erro: any) {
            logger.error(erro, 'Erro ao buscar usuários');
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: erro.message });
        }
    }

    async obterPorId(requisicao: Request<IId>, resposta: Response): Promise<Response> {
        try {
            const { id } = requisicao.params;

            const usuario = await this.usuarioService.obterPorId(id!);
            if (!usuario) {
                logger.warn({ usuarioId: id }, 'Usuário não encontrado');
                return resposta.status(StatusCodes.NOT_FOUND).json({ error: 'Usuário não encontrado' });
            }

            return resposta.status(StatusCodes.OK).json(usuario);
        } 
        catch (erro: any) {
            logger.error(erro, 'Erro ao buscar usuário por ID');
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: erro.message });
        }
    }

    async cadastrar(requisicao: Request<{}, {}, CadastrarUsuarioDto>, resposta: Response): Promise<Response> {
        try {
            const dados = requisicao.body;

            const novoUsuario = await this.usuarioService.cadastrar(dados);
            logger.info({ usuarioId: novoUsuario.id, email: novoUsuario.email }, 'Usuário cadastrado com sucesso');

            return resposta.status(StatusCodes.CREATED).json(novoUsuario);
        } 
        catch (erro: any) {
            logger.error(erro, 'Erro ao cadastrar usuário');
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: erro.message });
        }
    }

    async atualizar(requisicao: Request<IId, {}, AtualizarUsuarioDto>, resposta: Response): Promise<Response> {
        try {
            const { id } = requisicao.params;
            const usuarioEditado = requisicao.body;

            const usuarioAtualizado = await this.usuarioService.atualizar(id!, usuarioEditado);
            if (!usuarioAtualizado) {
                logger.warn({ usuarioId: id }, 'Usuário não encontrado para atualização');
                return resposta.status(StatusCodes.NOT_FOUND).json({ msg: 'Usuário não encontrado' });
            }
            
            logger.info({ usuarioId: id }, 'Usuário atualizado com sucesso');
            return resposta.status(StatusCodes.OK).json(usuarioAtualizado);
        } 
        catch (erro: any) {
            logger.error(erro, 'Erro ao atualizar usuário');
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: erro.message });
        }
    }

    async remover(requisicao: Request<IId>, resposta: Response): Promise<Response> {
        try {
            const { id } = requisicao.params;

            const usuarioRemovido = await this.usuarioService.remover(id!);
            if (!usuarioRemovido) {
                logger.warn({ usuarioId: id }, 'Usuário não encontrado para remoção');
                return resposta.status(StatusCodes.NOT_FOUND).json({ msg: 'Usuário não encontrado' });
            }
            
            logger.info({ usuarioId: id }, 'Usuário removido com sucesso');
            return resposta.status(StatusCodes.OK).json(usuarioRemovido);
        } 
        catch (erro: any) {
            logger.error(erro, 'Erro ao remover usuário');
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: erro.message });
        }
    }

    async entrar(requisicao: Request<{}, {}, EntrarUsuarioDto>, resposta: Response): Promise<Response> {
        try {
            const dados = requisicao.body;
            
            const tokenDeAutenticacao = await this.usuarioService.entrar(dados);
            if (!tokenDeAutenticacao) {
                logger.warn({ email: dados.email }, 'Login falhou - Credenciais inválidas');
                return resposta.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Email ou senha inválidos' });
            }

            return resposta.status(StatusCodes.OK).json(tokenDeAutenticacao);
        } 
        catch (erro: any) {
            logger.error(erro, 'Erro ao autenticar');
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: erro.message });
        }
    }
}


export { UsuarioController };
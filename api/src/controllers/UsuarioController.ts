import { Request, Response } from 'express';
import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import { IId, IFiltros, IUsuarioService } from '../interfaces';
import { AtualizarUsuarioDto, CadastrarUsuarioDto, EntrarUsuarioDto } from '../models';
import { usuarioResposta } from '../dtos/UsuarioResposta';
import { RecursoNaoEncontrado, NaoAutenticado } from '../erros';
import { NOME_COOKIE, opcoesCookie, DURACAO_SESSAO_MS } from '../config/Sessao';

@injectable()
export class UsuarioController {
    constructor(@inject(TIPOS.IUsuarioService) private readonly usuarioService: IUsuarioService) {}
    async obterTodos(req: Request<{}, {}, {}, IFiltros>, res: Response): Promise<Response> {
        const { pagina = 1, limite = 10, filtro = '' } = res.locals.validado?.query ?? req.query;
        const resultado = await this.usuarioService.obterTodos({
            pagina: Number(pagina),
            limite: Number(limite),
            filtro
        });
        return res.json({ ...resultado, itens: resultado.itens.map(usuarioResposta) });
    }
    async obterPorId(req: Request<IId>, res: Response): Promise<Response> {
        const usuario = await this.usuarioService.obterPorId(req.params.id!);
        if (!usuario) {
            throw new RecursoNaoEncontrado('Usuário não encontrado');
        }
        return res.json(usuarioResposta(usuario));
    }
    async cadastrar(req: Request<{}, {}, CadastrarUsuarioDto>, res: Response): Promise<Response> {
        return res.status(201).json(usuarioResposta(await this.usuarioService.cadastrar(req.body)));
    }
    async atualizar(req: Request<IId, {}, AtualizarUsuarioDto>, res: Response): Promise<Response> {
        const usuario = await this.usuarioService.atualizar(req.params.id!, req.body);
        if (!usuario) {
            throw new RecursoNaoEncontrado('Usuário não encontrado');
        }
        return res.json(usuarioResposta(usuario));
    }
    async remover(req: Request<IId>, res: Response): Promise<Response> {
        const usuario = await this.usuarioService.remover(req.params.id!);
        if (!usuario) {
            throw new RecursoNaoEncontrado('Usuário não encontrado');
        }
        return res.json(usuarioResposta(usuario));
    }
    async entrar(req: Request<{}, {}, EntrarUsuarioDto>, res: Response): Promise<Response> {
        const token = await this.usuarioService.entrar(req.body);
        if (!token) {
            throw new NaoAutenticado('Credenciais inválidas');
        }
        res.cookie(NOME_COOKIE, token, { ...opcoesCookie(), maxAge: DURACAO_SESSAO_MS });
        return res.status(204).end();
    }
}

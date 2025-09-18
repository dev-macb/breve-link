import { Request, Response } from 'express';
import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { IId, IFiltros, ILinkService } from '../interfaces';
import { AtualizarLinkDto, CadastrarLinkDto, RedirecionarLinkDto } from '../models';


@injectable()
class LinkController {
    constructor(
        @inject(TIPOS.ILinkService) 
        private readonly linkService: ILinkService
    ) {}
    
    async obterTodos(requisicao: Request<{}, {}, {}, IFiltros>, resposta: Response): Promise<Response> {
        try {
            const { pagina, limite, filtro } = requisicao.query;
            const filtros = {
                pagina: pagina ? Number(pagina) : 1,
                limite: limite ? Number(limite) : 10,
                filtro: filtro ?? ''
            };

            const links = await this.linkService.obterTodos(filtros);

            return resposta.status(StatusCodes.OK).json(links);
        } 
        catch (erro: any) {
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: erro.message });
        }
    }

    async obterPorId(requisicao: Request<IId>, resposta: Response): Promise<Response> {
        try {
            const { id } = requisicao.params;

            const link = await this.linkService.obterPorId(id!);
            if (!link) {
                return resposta.status(StatusCodes.NOT_FOUND).json({ error: 'Usuário não encontrado' });
            }
            
            return resposta.status(StatusCodes.OK).json(link);
        } 
        catch (erro: any) {
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: erro.message });
        }
    }

    async cadastrar(requisicao: Request<{}, {}, CadastrarLinkDto>, resposta: Response): Promise<Response> {
        try {
            const dados = requisicao.body;

            const novoLink = await this.linkService.cadastrar(dados);
            
            return resposta.status(StatusCodes.CREATED).json(novoLink);
        } 
        catch (erro: any) {
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: erro.message });
        }
    }

    async atualizar(requisicao: Request<IId, {}, AtualizarLinkDto>, resposta: Response): Promise<Response> {
        try {
            const { id } = requisicao.params;
            const linkEditado = requisicao.body;

            const linkAtualizado = await this.linkService.atualizar(id!, linkEditado);
            if (!linkAtualizado) {
                return resposta.status(StatusCodes.NOT_FOUND).json({ msg: 'Link não encontrado' });
            }
            
            return resposta.status(StatusCodes.OK).json(linkAtualizado);
        } 
        catch (erro: any) {
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: erro.message });
        }
    }

    async remover(requisicao: Request<IId>, resposta: Response): Promise<Response> {
        try {
            const { id } = requisicao.params;

            const linkRemovido = await this.linkService.remover(id!);
            if (!linkRemovido) {
                return resposta.status(StatusCodes.NOT_FOUND).json({ msg: 'Usuário não encontrado' });
            }
            
            return resposta.status(StatusCodes.OK).json(linkRemovido);
        } 
        catch (erro: any) {
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: erro.message });
        }
    }

    async redirecionar(requisicao: Request<RedirecionarLinkDto>, resposta: Response): Promise<Response> {
        try {
            const dados = requisicao.params;
            
            const link = await this.linkService.obterPorUrlCurta(dados.urlCurta!);
            if (!link) {
                return resposta.status(StatusCodes.NOT_FOUND).json({ msg: 'UrlCurta não encontrada' });
            }

            resposta.status(StatusCodes.PERMANENT_REDIRECT).redirect(link.urlOriginal);
            return resposta; 
        } 
        catch (erro: any) {
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: erro.message });
        }
    }
}


export { LinkController };
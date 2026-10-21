import { Request, Response } from 'express';
import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import { IId, IFiltros, ILinkService } from '../interfaces';
import { AtualizarLinkDto, CadastrarLinkDto, RedirecionarLinkDto, Link } from '../models';
import { ColetaAcessoUtil } from '../utils/ColetaAcessoUtil';
import { logger } from '../config/Logger';
import { RecursoNaoEncontrado, LinkIndisponivel } from '../erros';

@injectable()
export class LinkController {
    constructor(@inject(TIPOS.ILinkService) private readonly linkService: ILinkService) {}
    async obterTodos(req: Request<{}, {}, {}, IFiltros>, res: Response): Promise<Response> {
        const { pagina = 1, limite = 10, filtro = '' } = res.locals.validado?.query ?? req.query;
        return res.json(
            await this.linkService.obterTodos({
                pagina: Number(pagina),
                limite: Number(limite),
                filtro
            })
        );
    }
    async obterPorId(req: Request<IId>, res: Response): Promise<Response> {
        const link = await this.linkService.obterPorId(req.params.id!);
        if (!link) {
            throw new RecursoNaoEncontrado('Link não encontrado');
        }
        return res.json(link);
    }
    async cadastrar(req: Request<{}, {}, CadastrarLinkDto>, res: Response): Promise<Response> {
        return res.status(201).json(await this.linkService.cadastrar(req.body));
    }
    async atualizar(req: Request<IId, {}, AtualizarLinkDto>, res: Response): Promise<Response> {
        const link = await this.linkService.atualizar(req.params.id!, req.body);
        if (!link) {
            throw new RecursoNaoEncontrado('Link não encontrado');
        }
        return res.json(link);
    }
    async remover(req: Request<IId>, res: Response): Promise<Response> {
        const link = await this.linkService.remover(req.params.id!);
        if (!link) {
            throw new RecursoNaoEncontrado('Link não encontrado');
        }
        return res.json(link);
    }
    async redirecionar(req: Request<RedirecionarLinkDto>, res: Response): Promise<Response> {
        res.set('Cache-Control', 'no-store');
        const link = await this.linkService.obterPorUrlCurta(req.params.urlCurta!);
        if (!link) {
            throw new RecursoNaoEncontrado('UrlCurta não encontrada');
        }
        this.validarDisponibilidade(link);
        if (req.method !== 'HEAD') {
            await this.registrarAcesso(req, link.id);
        }
        res.redirect(302, link.urlOriginal);
        return res;
    }

    private validarDisponibilidade(link: Link): void {
        if (!link.ativo) {
            throw new LinkIndisponivel();
        }
        if (link.expiraEm == null) {
            return;
        }

        const expiracao = new Date(link.expiraEm).getTime();
        if (!Number.isFinite(expiracao) || expiracao <= Date.now()) {
            throw new LinkIndisponivel();
        }
    }

    private async registrarAcesso(req: Request, linkId: number): Promise<void> {
        try {
            const acesso = ColetaAcessoUtil.coletar(req, linkId);
            await this.linkService.registrarAcesso(linkId, acesso);
        } catch {
            // A coleta é auxiliar: falhas não podem impedir o redirecionamento.
            logger.error({ linkId }, 'Erro ao coletar audiência');
        }
    }
}

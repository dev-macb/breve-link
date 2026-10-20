import { Request, Response } from 'express';
import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import { IId, IFiltros, ILinkService } from '../interfaces';
import { AtualizarLinkDto, CadastrarLinkDto, RedirecionarLinkDto } from '../models';
import { ParserUtil } from '../utils/ParserUtil';
import { AudienciaUtil } from '../utils/AudienciaUtil';
import { logger } from '../config/Logger';
import { RecursoNaoEncontrado, LinkIndisponivel } from '../erros';

@injectable()
export class LinkController {
    constructor(@inject(TIPOS.ILinkService) private readonly linkService: ILinkService) {}
    async obterTodos(req: Request<{}, {}, {}, IFiltros>, res: Response): Promise<Response> {
        const { pagina = 1, limite = 10, filtro = '' } = res.locals.validado?.query ?? req.query;
        return res.json(await this.linkService.obterTodos({ pagina: Number(pagina), limite: Number(limite), filtro }));
    }
    async obterPorId(req: Request<IId>, res: Response): Promise<Response> {
        const link = await this.linkService.obterPorId(req.params.id!);
        if (!link) throw new RecursoNaoEncontrado('Link não encontrado');
        return res.json(link);
    }
    async cadastrar(req: Request<{}, {}, CadastrarLinkDto>, res: Response): Promise<Response> {
        return res.status(201).json(await this.linkService.cadastrar(req.body));
    }
    async atualizar(req: Request<IId, {}, AtualizarLinkDto>, res: Response): Promise<Response> {
        const link = await this.linkService.atualizar(req.params.id!, req.body);
        if (!link) throw new RecursoNaoEncontrado('Link não encontrado');
        return res.json(link);
    }
    async remover(req: Request<IId>, res: Response): Promise<Response> {
        const link = await this.linkService.remover(req.params.id!);
        if (!link) throw new RecursoNaoEncontrado('Link não encontrado');
        return res.json(link);
    }
    async redirecionar(req: Request<RedirecionarLinkDto>, res: Response): Promise<Response> {
        res.set('Cache-Control', 'no-store');
        const link = await this.linkService.obterPorUrlCurta(req.params.urlCurta!);
        if (!link) throw new RecursoNaoEncontrado('UrlCurta não encontrada');
        const expiraEm = link.expiraEm == null ? null : new Date(link.expiraEm).getTime();
        if (!link.ativo || (expiraEm !== null && (!Number.isFinite(expiraEm) || expiraEm <= Date.now()))) throw new LinkIndisponivel();
        try {
            const ip = ParserUtil.extrairIp(req);
            const navegador = ParserUtil.parsearUserAgent(req.headers['user-agent']);
            const geo = ParserUtil.obterGeolocalizacao(ip);
            if (req.method !== 'HEAD') await this.linkService.registrarAcesso(link.id, {
                ip, ...navegador, ...geo, ...AudienciaUtil.coletar(req),
                userAgent: req.headers['user-agent']?.slice(0, 2048) || null,
                idioma: req.get('accept-language')?.slice(0, 256) || null,
                referrer: (req.get('referer') ?? req.get('referrer') ?? '').slice(0, 500) || null
            });
        } catch {
            // Falhas inclusive no enriquecimento não podem bloquear o destino.
            logger.error({ linkId: link.id }, 'Erro ao coletar audiência');
        }
        res.redirect(302, link.urlOriginal);
        return res;
    }
}

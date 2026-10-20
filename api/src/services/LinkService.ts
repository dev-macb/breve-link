import { logger } from '../config/Logger';
import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import { CadastrarAcessoDto, Link, CadastrarLinkDto, AtualizarLinkDto } from '../models';
import { IFiltros, ILinkRepository, ILinkService, IAcessoRepository } from '../interfaces';
import { UrlUtil } from '../utils/UrlUtil';
import { SlugUtil } from '../utils/SlugUtil';
import { Conflito, RecursoNaoEncontrado } from '../erros';
import { Pagina } from '../dtos/Pagina';

@injectable()
export class LinkService implements ILinkService {
    constructor(
        @inject(TIPOS.ILinkRepository) private readonly linkRepository: ILinkRepository,
        @inject(TIPOS.IAcessoRepository) private readonly acessoRepository: IAcessoRepository,
        @inject(TIPOS.IUrlUtil) private readonly urlUtil: typeof UrlUtil
    ) {}
    async obterTodos(filtros: IFiltros): Promise<Pagina<Link>> {
        const { pagina = 1, limite = 10 } = filtros;
        const itens = await this.linkRepository.obterTodos(filtros);
        const total = await this.linkRepository.contar(filtros);
        return { itens, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
    }
    async obterPorId(id: number): Promise<Link | null> {
        return this.linkRepository.obterPorId(id);
    }
    async obterPorUrlCurta(urlCurta: string): Promise<Link | null> {
        return this.linkRepository.obterPorUrlCurta(urlCurta);
    }
    async cadastrar(dto: CadastrarLinkDto): Promise<Link> {
        if (dto.urlCurta !== undefined) {
            SlugUtil.validar(dto.urlCurta);
            if (await this.linkRepository.urlCurtaExiste(dto.urlCurta)) {
                throw new Conflito('UrlCurta já registrada');
            }
            const link = await this.linkRepository.cadastrar(dto);
            if (!link) {
                throw new Error('Falha ao cadastrar link');
            }
            return link;
        }
        for (let tentativa = 0; tentativa < 10; tentativa++) {
            const urlCurta = this.urlUtil.Gerar(7);
            if (
                !SlugUtil.permitido(urlCurta) ||
                (await this.linkRepository.urlCurtaExiste(urlCurta))
            ) {
                continue;
            }
            try {
                const link = await this.linkRepository.cadastrar({ ...dto, urlCurta });
                if (!link) {
                    throw new Error('Falha ao cadastrar link');
                }
                return link;
            } catch (erro) {
                if (!(erro instanceof Conflito)) {
                    throw erro;
                }
            }
        }
        throw new Error('Não foi possível gerar uma URL curta única após múltiplas tentativas');
    }
    async atualizar(id: number, dto: AtualizarLinkDto): Promise<Link | null> {
        if (!(await this.linkRepository.obterPorId(id))) {
            throw new RecursoNaoEncontrado('Link não encontrado');
        }
        if (dto.urlCurta !== undefined) {
            SlugUtil.validar(dto.urlCurta);
            const existente = await this.linkRepository.obterPorUrlCurta(dto.urlCurta);
            if (existente && existente.id !== id) {
                throw new Conflito('UrlCurta já registrada');
            }
        }
        return this.linkRepository.atualizar(id, dto);
    }
    async remover(id: number): Promise<Link | null> {
        const existente = await this.linkRepository.obterPorId(id);
        if (!existente) {
            throw new RecursoNaoEncontrado('Link não encontrado');
        }
        if (!(await this.linkRepository.remover(id))) {
            throw new Error('Falha ao remover link');
        }
        return existente;
    }
    async registrarAcesso(linkId: number, dto: Omit<CadastrarAcessoDto, 'linkId'>): Promise<void> {
        try {
            // O repositório é a unidade transacional para registro e contador.
            await this.acessoRepository.cadastrar({ ...dto, linkId });
        } catch {
            logger.error({ linkId }, 'Erro ao registrar acesso');
        }
    }
}

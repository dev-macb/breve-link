import { logger } from '../config/Logger';
import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import { CadastrarAcessoDto, Link, CadastrarLinkDto, AtualizarLinkDto } from '../models';
import { IFiltros, ILinkRepository, ILinkService, IAcessoRepository } from '../interfaces';
import { UrlUtil } from '../utils/UrlUtil';


@injectable()
class LinkService implements ILinkService {
    constructor(
        @inject(TIPOS.ILinkRepository) 
        private readonly linkRepository: ILinkRepository,
        @inject(TIPOS.IAcessoRepository)
        private readonly acessoRepository: IAcessoRepository,
        @inject(TIPOS.IUrlUtil)
        private readonly urlUtil: typeof UrlUtil
    ) {}

    async obterTodos(filtros: IFiltros): Promise<Link[]> {
        return this.linkRepository.obterTodos(filtros) || [];
    }

    async obterPorId(id: number): Promise<Link | null> {
        return this.linkRepository.obterPorId(id);
    }

    async obterPorUrlCurta(urlCurta: string): Promise<Link | null> {
        return this.linkRepository.obterPorUrlCurta(urlCurta);
    }

    async cadastrar(cadastrarLinkDto: CadastrarLinkDto): Promise<Link> {
        let urlCurta = cadastrarLinkDto.urlCurta;

        if (!urlCurta) {
            urlCurta = await this.gerarUrlCurtaUnica();
        }

        const linkComUrlCurta = { ...cadastrarLinkDto, urlCurta };
        const novoLink = await this.linkRepository.cadastrar(linkComUrlCurta);
        
        if (!novoLink) {
            logger.error({ urlCurta }, 'Falha ao cadastrar link');
            throw new Error("Falha ao cadastrar link");
        }

        logger.info({ id: novoLink.id, urlCurta: novoLink.urlCurta }, 'Link cadastrado com sucesso');
        return novoLink;
    }

    async atualizar(id: number, atualizarLinkDto: AtualizarLinkDto): Promise<Link | null> {
        const linkExistente = await this.linkRepository.obterPorId(id);
        if (!linkExistente) {
            logger.warn({ id }, 'Tentativa de atualizar link inexistente');
            throw new Error("Link não encontrado");
        }

        if (atualizarLinkDto.urlCurta) {
            const urlCurtaEmUso = await this.linkRepository.obterPorUrlCurta(atualizarLinkDto.urlCurta);
            if (urlCurtaEmUso && urlCurtaEmUso.id !== id) {
                logger.warn({ urlCurta: atualizarLinkDto.urlCurta }, 'Tentativa de atualizar link com urlCurta já em uso');
                throw new Error("UrlCurta já registrada");
            }
        }

        const atualizado = await this.linkRepository.atualizar(id, atualizarLinkDto);
        logger.info({ id, atualizado: !!atualizado }, 'Link atualizado');
        return atualizado;
    }

    async remover(id: number): Promise<Link | null> {
        const linkExistente = await this.linkRepository.obterPorId(id);
        if (!linkExistente) {
            logger.warn({ id }, 'Tentativa de remover link inexistente');
            throw new Error("Link não encontrado");
        }

        const removido = await this.linkRepository.remover(id);
        if (!removido) {
            logger.error({ id }, 'Falha ao remover link');
            throw new Error("Falha ao remover link");
        }

        logger.info({ id }, 'Link removido com sucesso');

        return linkExistente;
    }

    async registrarAcesso(linkId: number, cadastrarAcessoDto: Omit<CadastrarAcessoDto, 'linkId'>): Promise<void> {
        try {
            await this.acessoRepository.cadastrar({ ...cadastrarAcessoDto, linkId });
            await this.linkRepository.incrementarAcessos(linkId);
        }
        catch (erro: any) {
            logger.error({ erro, linkId }, 'Erro ao registrar acesso');
        }
    }

    private async gerarUrlCurtaUnica(tamanho: number = 7, maxTentativas: number = 10): Promise<string> {
        for (let i = 0; i < maxTentativas; i++) {
            const candidata = this.urlUtil.Gerar(tamanho);
            const existe = await this.linkRepository.urlCurtaExiste(candidata);
            if (!existe) {
                return candidata;
            }
        }
        throw new Error("Não foi possível gerar uma URL curta única após múltiplas tentativas");
    }
}


export { LinkService };

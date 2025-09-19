import { logger } from '../config/Logger';
import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import { Link, CadastrarLinkDto, AtualizarLinkDto } from '../models';
import { IFiltros, ILinkRepository, ILinkService } from '../interfaces';


@injectable()
class LinkService implements ILinkService {
    constructor(
        @inject(TIPOS.ILinkRepository) 
        private readonly linkRepository: ILinkRepository,
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
        const novoLink = await this.linkRepository.cadastrar(cadastrarLinkDto);
        
        if (!novoLink) {
            logger.error({ urlCurta: cadastrarLinkDto.urlCurta }, 'Falha ao cadastrar link');
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
            if (urlCurtaEmUso) {
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
}


export { LinkService };
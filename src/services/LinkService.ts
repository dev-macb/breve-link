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
            throw new Error("Falha ao cadastrar Link");
        }

        return novoLink;
    }

    async atualizar(id: number, atualizarLinkDto: AtualizarLinkDto): Promise<Link | null> {
        const linkExistente = await this.linkRepository.obterPorId(id);
        if (!linkExistente) {
            throw new Error("Usuário não encontrado");
        }

        if (atualizarLinkDto.urlCurta) {
            const urlCurtaEmUso = await this.linkRepository.obterPorUrlCurta(atualizarLinkDto.urlCurta);
            if (urlCurtaEmUso) {
                throw new Error("UrlCurta já registrado");
            }
        }

        return this.linkRepository.atualizar(id, atualizarLinkDto);
    }

    async remover(id: number): Promise<Link | null> {
        const linkExistente = await this.linkRepository.obterPorId(id);
        if (!linkExistente) {
            throw new Error("Link não encontrado");
        }

        const linkRemovido = this.linkRepository.remover(id);
        if (!linkRemovido) {
            throw new Error("Falha ao remover link");
        }

        return linkExistente;
    }
}


export { LinkService };
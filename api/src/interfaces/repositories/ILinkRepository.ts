import { IFiltros } from '../common/IFiltros';
import { Link, CadastrarLinkDto, AtualizarLinkDto } from '../../models';

export interface ILinkRepository {
    contar(filtros: IFiltros): Promise<number>;
    obterTodos(filtros: IFiltros): Promise<Link[]>;
    obterPorId(id: number): Promise<Link | null>;
    obterPorUrlCurta(urlCurta: string): Promise<Link | null>;
    cadastrar(cadastrarLinkDto: CadastrarLinkDto): Promise<Link | null>;
    atualizar(id: number, atualizarLinkDto: AtualizarLinkDto): Promise<Link | null>;
    remover(id: number): Promise<boolean>;
    urlCurtaExiste(urlCurta: string): Promise<boolean>;
}

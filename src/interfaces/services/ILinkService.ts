import { IFiltros } from '../common/IFiltros';
import { Link, CadastrarLinkDto, AtualizarLinkDto } from '../../models/Link';


interface ILinkService {
    obterTodos(filtros: IFiltros): Promise<Link[]>;
    obterPorId(id: number): Promise<Link | null>;
    obterPorUrlCurta(urlCurta: string): Promise<Link | null>;
    cadastrar(usuarioDto: CadastrarLinkDto): Promise<Link>;
    atualizar(id: number, usuarioDto: AtualizarLinkDto): Promise<Link | null>;
    remover(id: number): Promise<Link | null>;
}


export { ILinkService };
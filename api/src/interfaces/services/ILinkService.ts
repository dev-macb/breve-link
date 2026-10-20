import { IFiltros } from '../common/IFiltros';
import { Link, CadastrarLinkDto, AtualizarLinkDto } from '../../models/Link';
import { CadastrarAcessoDto } from '../../models/Acesso';

interface ILinkService {
    obterTodos(filtros: IFiltros): Promise<import('../../dtos/Pagina').Pagina<Link>>;
    obterPorId(id: number): Promise<Link | null>;
    obterPorUrlCurta(urlCurta: string): Promise<Link | null>;
    cadastrar(usuarioDto: CadastrarLinkDto): Promise<Link>;
    atualizar(id: number, usuarioDto: AtualizarLinkDto): Promise<Link | null>;
    remover(id: number): Promise<Link | null>;
    registrarAcesso(
        linkId: number,
        cadastrarAcessoDto: Omit<CadastrarAcessoDto, 'linkId'>
    ): Promise<void>;
}

export { ILinkService };

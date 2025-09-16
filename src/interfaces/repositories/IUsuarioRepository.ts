import { IFiltros } from '../common/IFiltros';
import { Usuario, CadastrarUsuarioDto, AtualizarUsuarioDto } from '../../models/Usuario';

export interface IUsuarioRepository {
    obterTodos(filtros: IFiltros): Promise<Usuario[]>;
    obterPorId(id: number): Promise<Usuario | null>;
    obterPorEmail(email: string): Promise<Usuario | null>;
    cadastrar(cadastrarUsuarioDto: CadastrarUsuarioDto): Promise<Usuario | null>;
    atualizar(id: number, atualizarUsuarioDto: AtualizarUsuarioDto): Promise<Usuario | null>;
    remover(id: number): Promise<boolean>;
}
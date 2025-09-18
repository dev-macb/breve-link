import { IFiltros } from '../common/IFiltros';
import { Usuario, CadastrarUsuarioDto, AtualizarUsuarioDto, EntrarUsuarioDto } from '../../models/Usuario';


interface IUsuarioService {
    obterTodos(filtros: IFiltros): Promise<Usuario[]>;
    obterPorId(id: number): Promise<Usuario | null>;
    cadastrar(usuarioDto: CadastrarUsuarioDto): Promise<Usuario>;
    atualizar(id: number, usuarioDto: AtualizarUsuarioDto): Promise<Usuario | null>;
    remover(id: number): Promise<Usuario | null>;
    entrar(credenciais: EntrarUsuarioDto): Promise<string | null>;
}


export { IUsuarioService };
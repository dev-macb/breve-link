// Importação de módulos
import * as novo from './Novo';
import * as editar from './Editar';
import * as excluir from './Excluir';
import * as autenticar from './Autenticar';
import * as buscarPorId from './BuscarPorId';
import * as buscarTodos from './BuscarTodos';


const UsuarioController = {
    ...novo,
    ...editar,
    ...excluir,
    ...autenticar,
    ...buscarPorId,
    ...buscarTodos
};


export { UsuarioController };

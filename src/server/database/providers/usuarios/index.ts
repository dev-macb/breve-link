// Importação de mmódulos
import * as novo from './Novo';
import * as contar from './Contar';
import * as editar from './Editar';
import * as excluir from './Excluir';
import * as autenticar from './Autenticar';
import * as buscarPorId from './BuscarPorId';
import * as buscarTodos from './BuscarTodos';


const UsuarioProvider = {
    ...novo,
    ...contar,
    ...editar,
    ...excluir,
    ...autenticar,
    ...buscarPorId,
    ...buscarTodos
};


export { UsuarioProvider };

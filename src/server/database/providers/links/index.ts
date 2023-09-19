// Importação de mmódulos
import * as novo from './Novo';
import * as contar from './Contar';
import * as editar from './Editar';
import * as excluir from './Excluir';
import * as abreviar from './Abreviar';
import * as buscarPorId from './BuscarPorId';
import * as buscarTodos from './BuscarTodos';
import * as buscarPorCodigo from './BuscarPorCodigo';


const LinkProvider = {
    ...novo,
    ...contar,
    ...editar,
    ...excluir,
    ...abreviar,
    ...buscarPorId,
    ...buscarTodos,
    ...buscarPorCodigo
};


export { LinkProvider };

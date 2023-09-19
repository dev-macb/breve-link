// Importação de módulos
import * as novo from './Novo';
import * as editar from './Editar';
import * as excluir from './Excluir';
import * as abreviar from './Abreviar';
import * as buscarPorId from './BuscarPorId';
import * as buscarTodos from './BuscarTodos';
import * as redirecionar from './Redirecionar';



const LinkController = {
    ...novo,
    ...editar,
    ...excluir,
    ...abreviar,
    ...buscarPorId,
    ...buscarTodos,
    ...redirecionar
};


export { LinkController };

// Importação de módulos
import { Router } from 'express';
import { autorizacao } from '../middlewares/Autorizacao';  
import { LinkController, UsuarioController } from '../controllers';


const rotiador = Router();


rotiador.post('/links', autorizacao, LinkController.validarNovo, LinkController.novo);
rotiador.put('/links/:id', autorizacao, LinkController.validarEditar, LinkController.editar);
rotiador.delete('/links/:id', autorizacao, LinkController.validarExcluir, LinkController.excluir);
rotiador.get('/links', autorizacao, LinkController.validarBuscarTodos, LinkController.buscarTodos);
rotiador.get('/links/:id', autorizacao, LinkController.validarBuscarPorId, LinkController.buscarPorId);


rotiador.post('/usuarios', autorizacao, UsuarioController.validarNovo, UsuarioController.novo);
rotiador.put('/usuarios/:id', autorizacao, UsuarioController.validarEditar, UsuarioController.editar);
rotiador.delete('/usuarios/:id', autorizacao, UsuarioController.validarExcluir, UsuarioController.excluir);
rotiador.get('/usuarios', autorizacao, UsuarioController.validarBuscarTodos, UsuarioController.buscarTodos);
rotiador.get('/usuarios/:id', autorizacao, UsuarioController.validarBuscarPorId, UsuarioController.buscarPorId);


rotiador.post('/', LinkController.validarAbreviar, LinkController.abreviar);
rotiador.get('/:codigo', LinkController.validarRedirecionar, LinkController.redirecionar);
rotiador.post('/entrar', UsuarioController.validarAutenticar, UsuarioController.autenticar);


export { rotiador };

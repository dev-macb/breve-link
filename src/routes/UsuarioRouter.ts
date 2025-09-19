import { Router } from 'express';
import { TIPOS } from '../config/Constantes';
import { container } from '../config/Conteiner';
import { IUsuarioValidator } from '../interfaces';
import { UsuarioController } from '../controllers';
import { AutenticacaoMiddleware } from '../middlewares';


const usuarioRouter = Router();
const usuarioController = container.get<UsuarioController>(TIPOS.UsuarioController);
const usuarioValidator = container.get<IUsuarioValidator>(TIPOS.IUsuarioValidator);

usuarioRouter.post('/entrar', usuarioValidator.entrar(), usuarioController.entrar.bind(usuarioController));
usuarioRouter.get('/', AutenticacaoMiddleware.Administrador, usuarioValidator.obterTodos(), usuarioController.obterTodos.bind(usuarioController));
usuarioRouter.get('/:id', AutenticacaoMiddleware.Administrador, usuarioValidator.obterPorId(), usuarioController.obterPorId.bind(usuarioController));
usuarioRouter.post('/', AutenticacaoMiddleware.Administrador, usuarioValidator.cadastrar(), usuarioController.cadastrar.bind(usuarioController));
usuarioRouter.patch('/:id', AutenticacaoMiddleware.Administrador, usuarioValidator.atualizar(), usuarioController.atualizar.bind(usuarioController));
usuarioRouter.delete('/:id', AutenticacaoMiddleware.Administrador, usuarioValidator.remover(), usuarioController.remover.bind(usuarioController));


export { usuarioRouter };
import { Router } from 'express';
import { TIPOS } from '../config/Constantes';
import { ILinkValidator } from '../interfaces';
import { LinkController } from '../controllers';
import { container } from '../config/Conteiner';
import { AutenticacaoMiddleware } from '../middlewares';


const linkRouter = Router();
const linkController = container.get<LinkController>(TIPOS.LinkController);
const linkValidator = container.get<ILinkValidator>(TIPOS.ILinkValidator);

linkRouter.get('/redirecionar/:urlCurta', linkValidator.redirecionar(), linkController.redirecionar.bind(linkController));
linkRouter.get('/', AutenticacaoMiddleware.Administrador, linkValidator.obterTodos(), linkController.obterTodos.bind(linkController));
linkRouter.get('/:id', AutenticacaoMiddleware.Administrador, linkValidator.obterPorId(), linkController.obterPorId.bind(linkController));
linkRouter.post('/', AutenticacaoMiddleware.Administrador, linkValidator.cadastrar(), linkController.cadastrar.bind(linkController));
linkRouter.patch('/:id', AutenticacaoMiddleware.Administrador, linkValidator.atualizar(), linkController.atualizar.bind(linkController));
linkRouter.delete('/:id', AutenticacaoMiddleware.Administrador, linkValidator.remover(), linkController.remover.bind(linkController));


export { linkRouter };
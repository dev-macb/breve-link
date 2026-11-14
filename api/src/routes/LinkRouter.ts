import { Router } from 'express';
import { TIPOS } from '../config/Constantes';
import { ILinkValidator } from '../interfaces';
import { LinkController } from '../controllers';
import { container } from '../config/Conteiner';
import { AutenticacaoMiddleware } from '../middlewares';

const linkRouter = Router();
const linkController = container.get<LinkController>(TIPOS.LinkController);
const linkValidator = container.get<ILinkValidator>(TIPOS.ILinkValidator);

linkRouter.get(
    '/redirecionar/:urlCurta',
    linkValidator.redirecionar(),
    linkController.redirecionar.bind(linkController)
);
linkRouter.get(
    '/',
    AutenticacaoMiddleware.Autenticado,
    linkValidator.obterTodos(),
    linkController.obterTodos.bind(linkController)
);
linkRouter.get(
    '/:id',
    AutenticacaoMiddleware.Autenticado,
    linkValidator.obterPorId(),
    linkController.obterPorId.bind(linkController)
);
linkRouter.post(
    '/',
    AutenticacaoMiddleware.Autenticado,
    linkValidator.cadastrar(),
    linkController.cadastrar.bind(linkController)
);
linkRouter.patch(
    '/:id',
    AutenticacaoMiddleware.Autenticado,
    linkValidator.atualizar(),
    linkController.atualizar.bind(linkController)
);
linkRouter.delete(
    '/:id',
    AutenticacaoMiddleware.Administrador,
    linkValidator.remover(),
    linkController.remover.bind(linkController)
);

export { linkRouter };

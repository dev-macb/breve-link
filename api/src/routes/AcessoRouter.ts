import { Router } from 'express';
import { TIPOS } from '../config/Constantes';
import { IAcessoValidator } from '../interfaces';
import { AcessoController } from '../controllers';
import { container } from '../config/Conteiner';
import { AutenticacaoMiddleware } from '../middlewares';

const acessoRouter = Router();
const acessoController = container.get<AcessoController>(TIPOS.AcessoController);
const acessoValidator = container.get<IAcessoValidator>(TIPOS.IAcessoValidator);

acessoRouter.get(
    '/:id/stats',
    AutenticacaoMiddleware.Administrador,
    acessoValidator.obterEstatisticas(),
    acessoController.obterEstatisticas.bind(acessoController)
);

export { acessoRouter };

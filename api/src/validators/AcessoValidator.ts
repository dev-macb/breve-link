import * as yup from 'yup';
import { injectable } from 'inversify';
import { IId } from '../interfaces';
import { IAcessoValidator } from '../interfaces/validators/IAcessoValidator';
import { YupMiddleware } from '../middlewares/YupMiddleware';

@injectable()
class AcessoValidator implements IAcessoValidator {
    obterEstatisticas() {
        return YupMiddleware.validarConsulta((esquema) => ({
            params: esquema<IId>(
                yup.object().shape({
                    id: yup.number().integer().required().moreThan(0)
                })
            )
        }));
    }
}

export { AcessoValidator };

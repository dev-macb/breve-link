import * as yup from 'yup';
import { injectable } from 'inversify';
import { IFiltros, IId } from "../interfaces";
import { ILinkValidator } from '../interfaces/validators/ILinkValidator';
import { YupMiddleware } from "../middlewares/YupMiddleware";
import { AtualizarLinkDto, CadastrarLinkDto, RedirecionarLinkDto } from '../models';


@injectable()
class LinkValidator implements ILinkValidator {
    obterTodos() {
        return YupMiddleware.validarConsulta(esquema => ({
            query: esquema<IFiltros>(yup.object().shape({
                pagina: yup.number().integer().optional().moreThan(0).default(1),
                limite: yup.number().integer().optional().moreThan(0).default(7),
                filtro: yup.string().optional().default('')
            }))
        }));
    }

    obterPorId() {
        return YupMiddleware.validarConsulta(esquema => ({
            params: esquema<IId>(yup.object().shape({
                id: yup.number().integer().required().moreThan(0)
            }))
        }));
    }

    obterPorUrlCurta() {
        return YupMiddleware.validarConsulta(esquema => ({
            params: esquema<RedirecionarLinkDto>(yup.object().shape({
                urlCurta: yup.string().required().min(3).max(50).matches(
                    /^[a-zA-Z0-9_-]+$/,
                    'URL curta pode conter apenas letras, números, hífens e underscores'
                )
            }))
        }));
    }

    cadastrar() {
        return YupMiddleware.validarConsulta(esquema => ({
            body: esquema<CadastrarLinkDto>(yup.object().shape({
                urlOriginal: yup.string().required().url('URL original deve ser uma URL válida'),
                urlCurta: yup.string().required().min(3).max(50).matches(/^[a-zA-Z0-9_-]+$/, 'URL curta pode conter apenas letras, números, hífens e underscores'),
                expiraEm: yup.date().optional().nullable().min(new Date(), 'Data de expiração não pode ser no passado')
            }))
        }));
    }

    atualizar() {
        return YupMiddleware.validarConsulta(esquema => ({
            params: esquema<IId>(yup.object().shape({
                id: yup.number().integer().required().moreThan(0),
            })),
            body: esquema<AtualizarLinkDto>(yup.object().shape({
                urlOriginal: yup.string().optional().url('URL original deve ser uma URL válida'),
                urlCurta: yup.string().optional().min(3).max(50).matches(/^[a-zA-Z0-9_-]+$/, 'URL curta pode conter apenas letras, números, hífens e underscores'),
                acessos: yup.number().integer().optional().min(0),
                ativo: yup.bool().optional(),
                expiraEm: yup.date().optional().nullable().min(new Date(), 'Data de expiração não pode ser no passado')
            }))
        }));
    }

    remover() {
        return YupMiddleware.validarConsulta(esquema => ({
            params: esquema<IId>(yup.object().shape({
                id: yup.number().integer().required().moreThan(0),
            }))
        }));
    }

    redirecionar() {
        return YupMiddleware.validarConsulta(esquema => ({
            params: esquema<RedirecionarLinkDto>(yup.object().shape({
                urlCurta: yup.string().optional().min(3).max(50).matches(/^[a-zA-Z0-9_-]+$/, 'URL curta pode conter apenas letras, números, hífens e underscores')
            }))
        }));
    }
}

export { LinkValidator };
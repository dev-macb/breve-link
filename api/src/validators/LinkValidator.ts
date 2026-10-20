import * as yup from 'yup';
import { injectable } from 'inversify';
import { IFiltros, IId, ILinkValidator } from '../interfaces';
import { YupMiddleware } from '../middlewares/YupMiddleware';
import { SlugUtil } from '../utils/SlugUtil';

const slug = () =>
    yup
        .string()
        .strict()
        .test(
            'slug',
            'Slug inválido ou reservado',
            (valor) => valor === undefined || SlugUtil.permitido(valor)
        );
const destino = () =>
    yup
        .string()
        .strict()
        .max(500)
        .test('http', 'Informe uma URL HTTP ou HTTPS válida', (valor) => {
            if (valor === undefined) {
                return true;
            }
            try {
                const url = new URL(valor);
                return (
                    ['http:', 'https:'].includes(url.protocol) &&
                    !!url.hostname &&
                    !url.username &&
                    !url.password
                );
            } catch {
                return false;
            }
        });
const expiracao = () =>
    yup
        .date()
        .nullable()
        .test(
            'futuro',
            'Data de expiração deve estar no futuro',
            (valor) => !valor || valor.getTime() > Date.now()
        );
const id = () => yup.object({ id: yup.number().integer().positive().required() });

@injectable()
export class LinkValidator implements ILinkValidator {
    obterTodos() {
        return YupMiddleware.validarConsulta((esquema) => ({
            query: esquema<IFiltros>(
                yup.object({
                    pagina: yup.number().integer().positive().default(1),
                    limite: yup.number().integer().positive().max(100).default(10),
                    filtro: yup.string().max(200).default('')
                })
            )
        }));
    }
    obterPorId() {
        return YupMiddleware.validarConsulta((esquema) => ({ params: esquema<IId>(id()) }));
    }
    cadastrar() {
        return YupMiddleware.validarConsulta((esquema) => ({
            body: esquema(
                yup.object({
                    geo: yup.boolean().strict().optional(),
                    urlOriginal: destino().required(),
                    urlCurta: slug().optional(),
                    expiraEm: expiracao().optional()
                })
            )
        }));
    }
    atualizar() {
        return YupMiddleware.validarConsulta((esquema) => ({
            params: esquema<IId>(id()),
            body: esquema(
                yup.object({
                    urlOriginal: destino().optional(),
                    urlCurta: slug().optional(),
                    geo: yup.boolean().strict().optional(),
                    ativo: yup.boolean().strict().optional(),
                    expiraEm: expiracao().optional()
                })
            )
        }));
    }
    remover() {
        return this.obterPorId();
    }
    redirecionar() {
        return YupMiddleware.validarConsulta((esquema) => ({
            params: esquema(
                yup.object({
                    urlCurta: yup
                        .string()
                        .required()
                        .matches(/^[a-zA-Z0-9_-]{3,50}$/)
                })
            )
        }));
    }
}

import { RequestHandler } from 'express';
import { Maybe, AnyObject, ObjectSchema, ValidationError } from 'yup';
import { RequisicaoInvalida } from '../erros';

type TPropriedades = 'body' | 'header' | 'params' | 'query';
type TObterEsquema = <T extends Maybe<AnyObject>>(esquema: ObjectSchema<T>) => ObjectSchema<T>;
type TObterTodosEsquemas = (getSchema: TObterEsquema) => Partial<Record<TPropriedades, ObjectSchema<any>>>;

export class YupMiddleware {
    static validarConsulta(obterEsquemas: TObterTodosEsquemas): RequestHandler {
        return (req, res, next) => {
            const validados: Partial<Record<TPropriedades, unknown>> = {};
            const detalhes: string[] = [];
            for (const [chave, esquema] of Object.entries(obterEsquemas(esquema => esquema))) {
                try {
                    const entrada = chave === 'header' ? req.headers : req[chave as 'body' | 'params' | 'query'];
                    validados[chave as TPropriedades] = esquema.validateSync(entrada, { abortEarly: false, stripUnknown: true });
                } catch (erro) {
                    if (!(erro instanceof ValidationError)) return next(erro);
                    detalhes.push(...(erro.inner.length ? erro.inner : [erro]).map(item => chave + '.' + (item.path ?? '') + ': ' + item.message));
                }
            }
            if (detalhes.length) return next(new RequisicaoInvalida('Dados inválidos', detalhes));
            res.locals.validado = validados;
            if (validados.body !== undefined) req.body = validados.body;
            if (validados.params !== undefined) req.params = validados.params as typeof req.params;
            next();
        };
    }
}

// Importação de módulos
import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Maybe, AnyObject, ObjectSchema, ValidationError } from 'yup';


// Definição de tipagens
type TPropriedades = 'body' | 'header' | 'params' | 'query';
type TObterEsquema = <T extends Maybe<AnyObject>>(esquema: ObjectSchema<T>) => ObjectSchema<T>
type TTodosEsquemas = Record<TPropriedades, ObjectSchema<any>>;
type TObterTodosEsquemas = (getSchema: TObterEsquema) => Partial<TTodosEsquemas>;
type TValidar = (getAllSchemas: TObterTodosEsquemas) => RequestHandler;


// Validação de esquemas e tratagem de erros
const ValidarConsulta: TValidar = (obterTodosEsquemas) => async (request, response, next) => { 
    const esquemas = obterTodosEsquemas((esquema) => esquema);
    const erroResultados: Record<string, Record<string, string>> = {};

    Object.entries(esquemas).forEach(([chave, esquema]) => {
        try {
            esquema.validateSync(request[chave as TPropriedades], {abortEarly: false});
        }
        catch (erroYup) {
            const erro = erroYup as ValidationError;
            const erros: Record<string, string> = {};
    
            erro.inner.forEach((error) => {
                if (!error.path) return;
                erros[error.path] = error.message;
            });

            erroResultados[chave] = erros ;
        }
    });

    if (Object.entries(erroResultados).length === 0) return next();
    else return response.status(StatusCodes.BAD_REQUEST).json({ erros: erroResultados });
};


export { ValidarConsulta };

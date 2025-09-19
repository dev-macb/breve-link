import { RequestHandler } from 'express';
import { logger } from '../config/Logger';
import { StatusCodes } from 'http-status-codes';
import { Maybe, AnyObject, ObjectSchema, ValidationError } from 'yup';


type TPropriedades = 'body' | 'header' | 'params' | 'query';
type TObterEsquema = <T extends Maybe<AnyObject>>(esquema: ObjectSchema<T>) => ObjectSchema<T>;
type TTodosEsquemas = Record<TPropriedades, ObjectSchema<any>>;
type TObterTodosEsquemas = (getSchema: TObterEsquema) => Partial<TTodosEsquemas>;
type TValidar = (getAllSchemas: TObterTodosEsquemas) => RequestHandler;

class YupMiddleware {
    static validarConsulta: TValidar = (obterTodosEsquemas) => async (requisicao, resposta, proximaFuncao) => { 
        const esquemas = obterTodosEsquemas((esquema) => esquema);
        const erroResultados: Record<string, Record<string, string>> = {};

        Object.entries(esquemas).forEach(([chave, esquema]) => {
            try {
                esquema.validateSync(requisicao[chave as TPropriedades], { abortEarly: false });
            }
            catch (erroYup) {
                const erro = erroYup as ValidationError;
                const erros: Record<string, string> = {};
        
                erro.inner.forEach((error: any) => {
                    if (!error.path) return;
                    erros[error.path] = error.message;
                });

                erroResultados[chave] = erros;
                logger.warn(`Erros de validação em ${chave}`);
            }
        });

        if (Object.entries(erroResultados).length === 0) {
            logger.info('Dados da requisição foram validados com sucesso');
            return proximaFuncao();
        } 
        else {
            logger.error('Falha na validação dos dados da requisição');
            return resposta.status(StatusCodes.BAD_REQUEST).json({ erros: erroResultados });
        }
    };
}


export { YupMiddleware };
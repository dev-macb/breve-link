// Importação de módulos
import * as yup from 'yup';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ValidarConsulta } from '../../middlewares';
import { LinkProvider } from '../../database/providers/links';


// Declaração de interface
interface IParametro { codigo?: string; }


const validarRedirecionar = ValidarConsulta(obterEsquema => ({
    params: obterEsquema<IParametro>(yup.object().shape({
        codigo: yup.string().strict().required().min(6).max(6)
    })),
}));


const redirecionar = async (request: Request<IParametro>, response: Response) => {
    const codigo = request.params.codigo;

    if (!codigo) return response.status(StatusCodes.BAD_REQUEST).json({ erro: 'O parâmetro "codigo" precisa ser informado.' });

    const resultado = await LinkProvider.buscarPorCodigo(codigo);

    if (resultado instanceof Error) return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erro: resultado.message });
    else return response.status(StatusCodes.OK).redirect(resultado.url_original);
};


export { validarRedirecionar, redirecionar };
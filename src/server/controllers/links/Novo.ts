// Importação de módulos
import * as yup from 'yup';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { LinkModel } from '../../database/models';
import { ValidarConsulta } from '../../middlewares';
import { LinkProvider } from '../../database/providers/links';


interface ICorpo extends Omit<LinkModel, 'id_link' | 'url_curta' | 'acessos' | 'expira_em' | 'criado_em' | 'atualizado_em'> { }


const validarNovo = ValidarConsulta((obterEsquema) => ({
    body: obterEsquema<ICorpo>(yup.object().shape({
        url_original: yup.string().strict().required()
    }))
}));


const novo = async(request: Request<{}, {}, ICorpo>, response: Response) => {
    const dados: ICorpo = request.body;

    const resultado = await LinkProvider.novo(dados);

    if (resultado instanceof Error) return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erro: resultado.message });
    else return response.status(StatusCodes.CREATED).json(resultado);
};


export { validarNovo, novo };

// Importação de módulos
import * as yup from 'yup';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { LinkModel } from '../../database/models';
import { LinkProvider } from '../../database/providers/links';
import { ValidarConsulta } from '../../middlewares/ValidarConsulta';



// Declaração de interfaces
interface IParametro { id?: number; }
interface ICorpo extends Omit<LinkModel, 'id_link' | 'url_curta' | 'acessos' | 'expira_em' | 'criado_em' | 'atualizado_em'> { }


const validarEditar = ValidarConsulta((obterEsquema) => ({
    params: obterEsquema<IParametro>(yup.object().shape({
        id: yup.number().integer().required().moreThan(0),
    })),
    body: obterEsquema<ICorpo>(yup.object().shape({
        url_original: yup.string().strict().required(),
        url_curta: yup.string().strict().required().min(6).max(6),
        expira_em: yup.date().optional()
    }))
}));


const editar = async (request: Request<IParametro, {}, ICorpo>, response: Response) => {
    const id = request.params.id;
    const dados: ICorpo = request.body;
    
    if (!id) return response.status(StatusCodes.BAD_REQUEST).json({ erro: 'O parâmetro "id" precisa ser informado.' });

    const resultado = await LinkProvider.editar(id, dados);

    if (resultado instanceof Error) return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erro: resultado.message });
    else return response.status(StatusCodes.NO_CONTENT).json(resultado);
};


export { validarEditar, editar };
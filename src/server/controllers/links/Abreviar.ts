// Importação de módulos
import * as yup from 'yup';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { LinkModel } from '../../database/models';
import { ValidarConsulta } from '../../middlewares';
import { LinkProvider } from '../../database/providers/links';


interface IBodyProps extends Omit<LinkModel, 'id_link' | 'url_curta' | 'acessos' | 'expira_em' | 'criado_em' | 'atualizado_em'> { }


const validarAbreviar = ValidarConsulta((obterEsquema) => ({
    body: obterEsquema<IBodyProps>(yup.object().shape({
        url_original: yup.string().strict().required()
    }))
}));


const abreviar = async(request: Request<{}, {}, IBodyProps>, response: Response) => {
    const dados: IBodyProps = request.body;

    const resultado = await LinkProvider.abreviar(dados);

    if (resultado instanceof Error) return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erro: resultado.message });
    else return response.status(StatusCodes.CREATED).json(resultado);
};


export { validarAbreviar, abreviar };

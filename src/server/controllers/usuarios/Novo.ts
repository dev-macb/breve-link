// Importação de módulos
import * as yup from 'yup';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UsuarioModel } from '../../database/models';
import { ValidarConsulta } from '../../middlewares';
import { UsuarioProvider } from '../../database/providers/usuarios';


interface ICorpo extends Omit<UsuarioModel, 'id_usuario' | 'criado_em' | 'atualizado_em'> { }


const validarNovo = ValidarConsulta((obterEsquema) => ({
    body: obterEsquema<ICorpo>(yup.object().shape({
        nome: yup.string().strict().required(),
        email: yup.string().strict().required().email(),
        senha: yup.string().strict().required()
    }))
}));


const novo = async(request: Request<{}, {}, ICorpo>, response: Response) => {
    const dados: ICorpo = request.body;

    const resultado = await UsuarioProvider.novo(dados);

    if (resultado instanceof Error) return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erro: resultado.message });
    else return response.status(StatusCodes.CREATED).json(resultado);
};


export { validarNovo, novo };
// Importação de módulos
import * as yup from 'yup';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UsuarioModel } from '../../database/models';
import { UsuarioProvider } from '../../database/providers/usuarios';
import { ValidarConsulta } from '../../middlewares/ValidarConsulta';



// Declaração de interfaces
interface IParametro { id?: number; }
interface ICorpo extends Omit<UsuarioModel, 'id_usuario' | 'criado_em' | 'atualizado_em'> { }


const validarEditar = ValidarConsulta((obterEsquema) => ({
    params: obterEsquema<IParametro>(yup.object().shape({
        id: yup.number().integer().required().moreThan(0),
    })),
    body: obterEsquema<ICorpo>(yup.object().shape({
        nome: yup.string().strict().required(),
        email: yup.string().strict().required().email(),
        senha: yup.string().strict().required()
    }))
}));


const editar = async (request: Request<IParametro, {}, ICorpo>, response: Response) => {
    const id = request.params.id;
    const dados: ICorpo = request.body;
    
    if (!id) return response.status(StatusCodes.BAD_REQUEST).json({ erro: 'O parâmetro "id" precisa ser informado.' });

    const resultado = await UsuarioProvider.editar(id, dados);

    if (resultado instanceof Error) return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erro: resultado.message });
    else return response.status(StatusCodes.NO_CONTENT).json(resultado);
};


export { validarEditar, editar };
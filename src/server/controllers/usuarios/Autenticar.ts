// Importação de módulos
import * as yup from 'yup';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ValidarConsulta } from '../../middlewares';
import { UsuarioModel } from '../../database/models';
import { UsuarioProvider } from '../../database/providers/usuarios';

import { JWTService, HashService } from '../../services';


interface ICorpo extends Omit<UsuarioModel, 'id_usuario' | 'nome' | 'criado_em' | 'atualizado_em'> { }


const validarAutenticar = ValidarConsulta((obterEsquema) => ({
    body: obterEsquema<ICorpo>(yup.object().shape({
        email: yup.string().strict().required().email(),
        senha: yup.string().strict().required().min(6)
    })),
}));


const autenticar = async (request: Request<{}, {}, ICorpo>, response: Response) => {
    const dados = request.body;
    const usuario = await UsuarioProvider.autenticar(dados.email);

    if (usuario instanceof Error) return response.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Email ou senha são inválidos' });

    const senhaCorreta = await HashService.comparar(dados.senha, usuario.senha);
    if (senhaCorreta) {
        const tokenAcesso = JWTService.gerar({ id: usuario.id_usuario });
        
        if (tokenAcesso === 'JWT_SECRET_NOT_FOUND') return response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ erros: 'Erro ao gerar o token de acesso' });
        else return response.status(StatusCodes.OK).json({ tokenAcesso });
    }

    return response.status(StatusCodes.UNAUTHORIZED).json({ erro: 'Apelido ou senha inválidos' });
};


export { validarAutenticar, autenticar };
import * as yup from 'yup';
import { injectable } from 'inversify';
import { IFiltros, IId } from '../interfaces';
import { YupMiddleware } from '../middlewares/YupMiddleware';
import { AtualizarUsuarioDto, CadastrarUsuarioDto, EntrarUsuarioDto } from '../models';
import { IUsuarioValidator } from '../interfaces';

const senhaSegura = () =>
    yup
        .string()
        .strict()
        .min(8)
        .test(
            'limite-bcrypt',
            'Senha deve ter no máximo 72 bytes em UTF-8',
            (valor) => valor === undefined || Buffer.byteLength(valor, 'utf8') <= 72
        );

const emailValido = () =>
    yup
        .string()
        .strict()
        .test(
            'email-normalizado',
            'E-mail inválido',
            (valor) =>
                valor === undefined ||
                yup.string().required().email().isValidSync(valor.trim().toLowerCase())
        );

@injectable()
class UsuarioValidator implements IUsuarioValidator {
    obterTodos() {
        return YupMiddleware.validarConsulta((esquema) => ({
            query: esquema<IFiltros>(
                yup.object().shape({
                    pagina: yup.number().integer().optional().moreThan(0).default(1),
                    limite: yup.number().integer().optional().moreThan(0).max(100).default(10),
                    filtro: yup.string().optional().default('')
                })
            )
        }));
    }

    obterPorId() {
        return YupMiddleware.validarConsulta((esquema) => ({
            params: esquema<IId>(
                yup.object().shape({
                    id: yup.number().integer().required().moreThan(0)
                })
            )
        }));
    }

    cadastrar() {
        return YupMiddleware.validarConsulta((esquema) => ({
            body: esquema<CadastrarUsuarioDto>(
                yup.object().shape({
                    nome: yup.string().strict().required().max(30),
                    email: emailValido().required(),
                    senha: senhaSegura().required(),
                    ativo: yup.bool().required(),
                    administrador: yup.bool().required()
                })
            )
        }));
    }

    atualizar() {
        return YupMiddleware.validarConsulta((esquema) => ({
            params: esquema<IId>(
                yup.object().shape({
                    id: yup.number().integer().required().moreThan(0)
                })
            ),
            body: esquema<AtualizarUsuarioDto>(
                yup.object().shape({
                    nome: yup.string().strict().optional().min(1).max(30),
                    email: emailValido().optional(),
                    senha: senhaSegura().optional(),
                    ativo: yup.bool().optional(),
                    administrador: yup.bool().optional()
                })
            )
        }));
    }

    remover() {
        return YupMiddleware.validarConsulta((esquema) => ({
            params: esquema<IId>(
                yup.object().shape({
                    id: yup.number().integer().required().moreThan(0)
                })
            )
        }));
    }

    entrar() {
        return YupMiddleware.validarConsulta((esquema) => ({
            body: esquema<EntrarUsuarioDto>(
                yup.object().shape({
                    email: emailValido().required(),
                    senha: yup.string().strict().required().min(6)
                })
            )
        }));
    }
}

export { UsuarioValidator };

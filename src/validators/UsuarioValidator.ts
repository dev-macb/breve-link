import * as yup from 'yup';
import { injectable } from 'inversify';
import { IFiltros, IId } from "../interfaces";
import { YupMiddleware } from "../middlewares/YupMiddleware";
import { AtualizarUsuarioDto, CadastrarUsuarioDto, EntrarUsuarioDto } from '../models';
import { IUsuarioValidator } from '../interfaces';

@injectable()
class UsuarioValidator implements IUsuarioValidator {
    obterTodos() {
        return YupMiddleware.validarConsulta(esquema => ({
            query: esquema<IFiltros>(yup.object().shape({
                pagina: yup.number().integer().optional().moreThan(0).default(1),
                limite: yup.number().integer().optional().moreThan(0).default(7),
                filtro: yup.string().optional().default('')
            }))
        }));
    }

    obterPorId() {
        return YupMiddleware.validarConsulta(esquema => ({
            params: esquema<IId>(yup.object().shape({
                id: yup.number().integer().required().moreThan(0)
            }))
        }));
    }

    cadastrar() {
        return YupMiddleware.validarConsulta(esquema => ({
            body: esquema<CadastrarUsuarioDto>(yup.object().shape({
                nome: yup.string().strict().required(),
                email: yup.string().strict().required().email(),
                senha: yup.string().strict().required(),
                ativo: yup.bool().required(),
                administrador: yup.bool().required()
            }))
        }));
    }

    atualizar() {
        return YupMiddleware.validarConsulta(esquema => ({
            params: esquema<IId>(yup.object().shape({
                id: yup.number().integer().required().moreThan(0),
            })),
            body: esquema<AtualizarUsuarioDto>(yup.object().shape({
                nome: yup.string().strict().optional().max(5),
                email: yup.string().strict().optional().email(),
                senha: yup.string().strict().optional(),
                ativo: yup.bool().optional(),
                administrador: yup.bool().optional()
            }))
        }));
    }

    remover() {
        return YupMiddleware.validarConsulta(esquema => ({
            params: esquema<IId>(yup.object().shape({
                id: yup.number().integer().required().moreThan(0),
            }))
        }));
    }

    entrar() {
        return YupMiddleware.validarConsulta(esquema => ({
            body: esquema<EntrarUsuarioDto>(yup.object().shape({
                email: yup.string().strict().required().email(),
                senha: yup.string().strict().required().min(6)
            }))
        }));
    }
}

export { UsuarioValidator };
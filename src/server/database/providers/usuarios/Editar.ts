// Importação de módulos
import { Knex } from '../../knex';
import { UsuarioModel } from '../../models';
import { ENomeTabelas } from '../../ENomeTabelas';
import { HashService } from '../../../services/HashService';


interface IUsuario extends Omit<UsuarioModel, 'id_usuario' | 'criado_em' | 'atualizado_em'> { }


const editar = async (id: number, usuario: IUsuario): Promise<void | Error> => {
    try {
        const [{ contador }] = await Knex(ENomeTabelas.usuarios).where('id_usuario', '=', id).count<[{ contador: number }]>('* as contador');
        if (contador === 0) return new Error('Registro não foi encontrado');

        const hash = await HashService.criptografar(usuario.senha);
        const resultado = await Knex(ENomeTabelas.usuarios)
            .update({ ...usuario, senha: hash, atualizado_em: Knex.fn.now()})
            .where('id_usuario', '=', id);

        if (resultado > 0) return;
        else return new Error('Erro ao atualizar o registro');
    } 
    catch (error) {
        console.log(error);
        return new Error('Erro ao atualizar o registro');
    }
};


export { editar };

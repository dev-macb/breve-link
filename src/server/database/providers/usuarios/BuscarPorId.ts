// Importação de módulos
import { Knex } from '../../knex';
import { ENomeTabelas } from '../../ENomeTabelas';
import { UsuarioModel } from '../../models/UsuarioModel';


const buscarPorId = async (id: number): Promise<UsuarioModel | Error> => {
    try {
        const resultado = await Knex(ENomeTabelas.usuarios).select('*').where('id_usuario', '=', id).first();

        if (resultado) return resultado;
        else return new Error('Registro não encontrado');
    } 
    catch (erro) {
        console.log(erro);
        return new Error('Erro ao consultar o registro');
    }
};

export { buscarPorId };
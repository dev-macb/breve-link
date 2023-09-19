// Importação de módulos
import { Knex } from '../../knex';
import { ENomeTabelas } from '../../ENomeTabelas';
import { LinkModel } from '../../models/LinkModel';


const buscarPorId = async (id: number): Promise<LinkModel | Error> => {
    try {
        const resultado = await Knex(ENomeTabelas.links).select('*').where('id_link', '=', id).first();

        if (resultado) return resultado;
        else return new Error('Registro não encontrado');
    } 
    catch (erro) {
        console.log(erro);
        return new Error('Erro ao consultar o registro');
    }
};

export { buscarPorId };
// Importação de módulos
import { Knex } from '../../knex';
import { ENomeTabelas } from '../../ENomeTabelas';
import { LinkModel } from '../../models/LinkModel';


const buscarPorCodigo = async (codigo: string): Promise<LinkModel | Error> => {
    try {
        const resultado = await Knex(ENomeTabelas.links).select('*').where('url_curta', '=', codigo).first();

        if (resultado) return resultado;
        else return new Error('Registro não encontrado');
    } 
    catch (erro) {
        console.log(erro);
        return new Error('Erro ao consultar o registro');
    }
};

export { buscarPorCodigo };
// Importação de módulos
import { Knex } from '../../knex';
import { ENomeTabelas } from '../../ENomeTabelas';
import { LinkModel } from '../../models/LinkModel';


const buscarPorCodigo = async (codigo: string): Promise<LinkModel | Error> => {
    try {
        const linkExistente = await Knex(ENomeTabelas.links).select('*').where('url_curta', '=', codigo).first();
        if (!linkExistente) return new Error('Registro não encontrado');

        const atualizarAcesso = await Knex(ENomeTabelas.links).update({ acessos: linkExistente.acessos + 1 }).where('id_link', '=', linkExistente.id_link);
        if (!atualizarAcesso) return new Error('Erro na atualização do registro');

        return linkExistente;
    } 
    catch (erro) {
        console.log(erro);
        return new Error('Erro ao consultar o registro');
    }
};

export { buscarPorCodigo };
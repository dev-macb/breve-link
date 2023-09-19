// Importação de módulos
import { Knex } from '../../knex';
import { LinkModel } from '../../models';
import { ENomeTabelas } from '../../ENomeTabelas';


const novo = async (link: Omit<LinkModel, 'id_link' | 'criado_em' | 'atualizado_em'>): Promise<number | Error> => {
    try {
        const dataExpira = new Date();
        dataExpira.setDate(dataExpira.getDate() + 10); // Adicione 10 dias à data atual
        const dataFormatada = dataExpira.toISOString().slice(0, 19).replace('T', ' ');

        const [resultado] = await Knex(ENomeTabelas.links).insert({ ...link, expira_em: dataFormatada }).returning('id_link');

        if (typeof resultado === 'object') return resultado.id_link;
        else if (typeof resultado === 'number') return resultado;
        else return new Error('Erro ao cadastrar o registro');
    }
    catch (erro) {
        console.log(erro);
        return new Error('Erro ao cadastrar o registro');
    }
};


export { novo };
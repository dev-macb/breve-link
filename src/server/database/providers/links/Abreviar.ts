// Importação de módulos
import { Knex } from '../../knex';
import { LinkModel } from '../../models';
import { ENomeTabelas } from '../../ENomeTabelas';
import { URLService } from '../../../services/URLService';


const abreviar = async (link: Omit<LinkModel, 'id_link' | 'url_curta' | 'expira_em' | 'criado_em' | 'atualizado_em'>): Promise<number | Error> => {
    try {
        const dataExpira = new Date();
        dataExpira.setDate(dataExpira.getDate() + 10); // Adicione 10 dias à data atual
        const dataFormatada = dataExpira.toISOString().slice(0, 19).replace('T', ' ');

        const [resultado] = await Knex(ENomeTabelas.links)
            .insert({ url_original: link.url_original, url_curta: URLService.gerar(6), expira_em: dataFormatada })
            .returning('id_link');

        if (typeof resultado === 'object') return resultado.id_link;
        else if (typeof resultado === 'number') return resultado;
        else return new Error('Erro ao cadastrar o registro');
    }
    catch (erro) {
        console.log(erro);
        return new Error('Erro ao cadastrar o registro');
    }
};


export { abreviar };
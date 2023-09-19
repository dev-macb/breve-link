// Importação de módulos
import { Knex } from '../../knex';
import { LinkModel } from '../../models';
import { ENomeTabelas } from '../../ENomeTabelas';


interface ILink extends Omit<LinkModel, 'id_link' | 'url_curta' | 'acessos' | 'expira_em' | 'criado_em' | 'atualizado_em'> { }


const editar = async (id: number, link: ILink): Promise<void | Error> => {
    try {
        const [{ contador }] = await Knex(ENomeTabelas.links)
            .where('id_link', '=', id)
            .count<[{ contador: number }]>('* as contador');

        if (contador === 0) {
            return new Error('A cidade usada no cadastro não foi encontrada');
        }

        const resultado = await Knex(ENomeTabelas.links)
            .update({ ...link, atualizado_em: Knex.fn.now()})
            .where('id_link', '=', id);

        if (resultado > 0) return;
        else return new Error('Erro ao atualizar o registro');
    } 
    catch (error) {
        console.log(error);
        return new Error('Erro ao atualizar o registro');
    }
};


export { editar };

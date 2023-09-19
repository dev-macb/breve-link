// Importação de módulos
import { Knex } from '../../knex';
import { ENomeTabelas } from '../../ENomeTabelas';


const contar = async (filtro = ''): Promise<number | Error> => {
    try {
        const [{ contagem }] = await Knex(ENomeTabelas.links)
            .where('url_curta', 'like', `%${filtro}%`)
            .count<[{ contagem: number }]>('* as contagem');

        if (Number.isInteger(Number(contagem))) return Number(contagem);
        else return new Error('Erro ao consultar a quantidade total de registros');
    } 
    catch (erro) {
        console.log(erro);
        return new Error('Erro ao consultar a quantidade total de registros');
    }
};


export { contar };
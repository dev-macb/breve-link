// Importação de módulos
import { Knex } from '../../knex';
import { ENomeTabelas } from '../../ENomeTabelas';


const excluir = async (id: number): Promise<void | Error> => {
    try {
        const resultado = await Knex(ENomeTabelas.usuarios).where('id_usuario', '=', id).del();

        if (resultado > 0) return;
        else return new Error('Erro ao apagar o registro');
    } 
    catch (erro) {
        console.log(erro);
        return new Error('Erro ao apagar o registro');
    }
};


export { excluir };

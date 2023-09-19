// Importação de módulos
import { Knex } from '../../knex';
import { UsuarioModel } from '../../models';
import { ENomeTabelas } from '../../ENomeTabelas';
import { HashService } from '../../../services/HashService';


const novo = async (usuario: Omit<UsuarioModel, 'id_usuario' | 'criado_em' | 'atualizado_em'>): Promise<number | Error> => {
    try {
        const hash = await HashService.criptografar(usuario.senha);
        const [ resultado ] = await Knex(ENomeTabelas.usuarios).insert({ ...usuario, senha: hash }).returning('id_usuario');

        if (typeof resultado === 'object') return resultado.id_usuario;
        else if (typeof resultado === 'number') return resultado;
        else return new Error('Erro ao cadastrar o registro');
    } 
    catch (erro) {
        console.log(erro);
        return new Error('Erro ao cadastrar o registro');
    }
};


export { novo };
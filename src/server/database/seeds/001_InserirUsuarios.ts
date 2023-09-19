import { Knex } from 'knex';
import { ENomeTabelas } from '../ENomeTabelas';


const listaUsuario = [
    {
        nome: 'administrador',
        email: 'dev.macb@gmail.com',
        senha: 'S3nh4F4c!l'
    }
];


const usuarioSeed = async (knex: Knex) => {
    const [{ quantidade }] = await knex(ENomeTabelas.usuarios).count<[{ quantidade: number}]>('* as quantidade');
    if (!Number.isInteger(quantidade) || Number(quantidade) > 0) return;
    
    await knex(ENomeTabelas.usuarios).insert(listaUsuario);
};


export { usuarioSeed };

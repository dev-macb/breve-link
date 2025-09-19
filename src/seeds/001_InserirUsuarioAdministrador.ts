import bcrypt from 'bcrypt';
import { Knex } from 'knex';
import { ETabela } from '../enums';
import { COMPLEXIDADE_HASH } from '../config/Constantes';


const listaUsuario = [
    {
        nome: 'administrador',
        email: 'administrador@email.com',
        senha: 'Senha@123',
        administrador: true
    }
];

const seed = async (knex: Knex) => {
    const usuariosComSenhaCriptografada = await Promise.all(
        listaUsuario.map(async (usuario) => {
            const hash = await bcrypt.hash(usuario.senha, COMPLEXIDADE_HASH);
            return { ...usuario, senha: hash };
        })
    );

    await knex(ETabela.usuarios).insert(usuariosComSenhaCriptografada);
};


export { seed };
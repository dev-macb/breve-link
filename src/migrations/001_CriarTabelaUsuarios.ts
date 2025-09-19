import { Knex } from 'knex';
import { ETabela } from '../enums';


async function up(knex: Knex): Promise<void> {
    return knex.schema
        .createTable(ETabela.usuarios, tabela => {
            tabela.bigIncrements('id').primary().index();
            tabela.string('nome', 30).notNullable(),
            tabela.string('email', 200).notNullable().unique().index();
            tabela.string('senha', 200).notNullable();
            tabela.boolean('ativo').notNullable().defaultTo(true);
            tabela.boolean('administrador').notNullable().defaultTo(false);
            tabela.timestamp('criadoEm').notNullable().defaultTo(knex.fn.now());
            tabela.timestamp('atualizadoEm').notNullable().defaultTo(knex.fn.now());
        })
        .then(() => {
            console.log(`[*] Tabela "usuarios" foi criada.`);
        });
}


async function down(knex: Knex): Promise<void> {
    return knex.schema
        .dropTable(ETabela.usuarios)
        .then(() => { console.log(`[*] A tabela "usuarios" foi deletada.`); });
}


export { up, down };
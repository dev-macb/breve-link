import { Knex } from 'knex';
import { ETabela } from '../enums';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .createTable(ETabela.links, (tabela) => {
            tabela.bigIncrements('id').primary().index();
            tabela.string('urlOriginal', 500).notNullable();
            tabela.string('urlCurta', 30).notNullable().unique().index();
            tabela.integer('acessos').notNullable().defaultTo(0);
            tabela.boolean('ativo').notNullable().defaultTo(true);
            tabela.timestamp('expiraEm').nullable();
            tabela.timestamp('criadoEm').notNullable().defaultTo(knex.fn.now());
            tabela.timestamp('atualizadoEm').notNullable().defaultTo(knex.fn.now());
        })
        .then(() => {
            console.log(`[*] Tabela "${ETabela.links}" foi criada.`);
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .dropTable(ETabela.links)
        .then(() => { 
            console.log(`[*] A tabela "${ETabela.links}" foi deletada.`); 
        });
}
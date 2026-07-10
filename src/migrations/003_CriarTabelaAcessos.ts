import { Knex } from 'knex';
import { ETabela } from '../enums';

export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .createTable(ETabela.acessos, (tabela) => {
            tabela.bigIncrements('id').primary().index();
            tabela.bigInteger('linkId').notNullable().index();
            tabela.foreign('linkId').references('id').inTable(ETabela.links).onDelete('CASCADE');
            tabela.string('ip', 45).nullable();
            tabela.string('navegador', 100).nullable();
            tabela.string('sistemaOperacional', 100).nullable();
            tabela.string('dispositivo', 50).nullable();
            tabela.string('referrer', 500).nullable();
            tabela.string('pais', 100).nullable();
            tabela.string('cidade', 100).nullable();
            tabela.timestamp('criadoEm').notNullable().defaultTo(knex.fn.now());
        })
        .then(() => {
            console.log(`[*] Tabela "${ETabela.acessos}" foi criada.`);
        });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .dropTable(ETabela.acessos)
        .then(() => {
            console.log(`[*] A tabela "${ETabela.acessos}" foi deletada.`);
        });
}

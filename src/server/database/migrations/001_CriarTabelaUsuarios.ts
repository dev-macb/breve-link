// Importação de módulos
import { Knex } from 'knex';
import { ENomeTabelas } from '../ENomeTabelas';


async function up(knex: Knex): Promise<void> {
    return knex.schema
        .createTable(ENomeTabelas.usuarios, tabela => {
            tabela.bigIncrements('id_usuario').primary().index();
            tabela.string('nome', 30).notNullable().checkLength('>=', 4),
            tabela.string('email', 200).notNullable().checkLength('>=', 4).unique().index();
            tabela.string('senha', 200).notNullable().checkLength('>=', 6);
            tabela.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
            tabela.timestamp('atualizado_em').notNullable().defaultTo(knex.fn.now());
        })
        .then(() => {
            console.log(`[*] Tabela "${ENomeTabelas.usuarios}" foi criada.`);
        });
}


async function down(knex: Knex): Promise<void> {
    return knex.schema
        .dropTable(ENomeTabelas.usuarios)
        .then(() => { console.log(`[*] A tabela "${ENomeTabelas.usuarios}" foi deletada.`); });
}


export { up, down };
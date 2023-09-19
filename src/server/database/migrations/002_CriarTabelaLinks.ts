// Importação de módulos
import { Knex } from 'knex';
import { ENomeTabelas } from '../ENomeTabelas';


async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(ENomeTabelas.links, tabela => {
        tabela.bigIncrements('id_link').primary().index();
        tabela.string('url_original', 30).notNullable(),
        tabela.string('url_curta', 200).notNullable().checkLength('=', 6).index();
        tabela.integer('acessos').notNullable().defaultTo(0);
        tabela.timestamp('expira_em').notNullable();
        tabela.timestamp('criado_em').notNullable().defaultTo(knex.fn.now());
        tabela.timestamp('atualizado_em').notNullable().defaultTo(knex.fn.now());
    }).then(() => {
        console.log(`[*] Tabela "${ENomeTabelas.links}" foi criada.`);
    });
}


async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable(ENomeTabelas.links)
        .then(() => { console.log(`[*] A tabela "${ENomeTabelas.links}" foi deletada.`); });
}


export { up, down };
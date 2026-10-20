import { Knex } from 'knex';
import { ETabela } from '../enums';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable(ETabela.acessos, tabela => {
        tabela.text('userAgent').nullable();
        tabela.string('versaoNavegador', 100).nullable();
        tabela.string('versaoSistemaOperacional', 100).nullable();
        tabela.string('idioma', 256).nullable();
        tabela.index(['linkId', 'id'], 'acessos_link_historico');
    });
}
export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable(ETabela.acessos, tabela => {
        tabela.dropIndex(['linkId', 'id'], 'acessos_link_historico');
        tabela.dropColumns('userAgent', 'idioma', 'versaoNavegador', 'versaoSistemaOperacional');
    });
}

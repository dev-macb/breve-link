import { Knex } from 'knex';
import { ETabela } from '../enums';

const campos = ['metodo', 'caminho', 'utmSource', 'utmMedium', 'utmCampaign', 'utmTerm',
    'utmContent', 'clientHints', 'fetchSite', 'fetchMode', 'fetchDest', 'dnt', 'gpc', 'hashDispositivo'];

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable(ETabela.acessos, tabela => {
        for (const campo of campos) tabela.text(campo).nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable(ETabela.acessos, tabela => tabela.dropColumns(...campos));
}

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    const duplicados = await knex('usuarios').select(knex.raw('lower(trim(email)) as email'))
        .groupByRaw('lower(trim(email))').havingRaw('count(*) > 1');
    if (duplicados.length) throw new Error('Há e-mails duplicados após normalização; resolva antes de migrar');
    await knex('usuarios').update({ email: knex.raw('lower(trim(email))') });
    await knex.raw('CREATE UNIQUE INDEX usuarios_email_normalizado ON usuarios(lower(trim(email)))');
    await knex.schema.alterTable('usuarios', tabela => { tabela.integer('versaoSessao').notNullable().defaultTo(0); });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('usuarios', tabela => { tabela.dropColumn('versaoSessao'); });
    await knex.raw('DROP INDEX usuarios_email_normalizado');
}

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('links', t => { t.boolean('geo').notNullable().defaultTo(false); });
    await knex.schema.alterTable('acessos', t => {
        for (const nome of ['lat', 'lon', 'accuracy', 'altitude', 'heading', 'speed', 'positionTimestamp']) t.double(nome).nullable();
        t.string('geo_status').nullable();
        t.string('sessionUid').nullable();
        t.string('geoToken', 64).nullable().unique();
        t.bigInteger('geoExpiraEm').nullable();
    });
}
export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('acessos', t => {
        t.dropUnique(['geoToken']);
        t.dropColumns('lat', 'lon', 'accuracy', 'altitude', 'heading', 'speed', 'positionTimestamp', 'geo_status', 'sessionUid', 'geoToken', 'geoExpiraEm');
    });
    await knex.schema.alterTable('links', t => { t.dropColumn('geo'); });
}

import { Knex } from 'knex';
import { ETabela } from '../enums';

const campos = ['accept', 'acceptEncoding', 'versaoHttp', 'clientHintsMobile',
    'clientHintsPlataforma', 'clientHintsVersaoPlataforma', 'clientHintsArquitetura',
    'clientHintsModelo', 'clientHintsVersaoCompleta', 'fetchUser', 'purpose', 'secPurpose', 'saveData'];

export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable(ETabela.acessos, tabela => {
        for (const campo of campos) tabela.text(campo).nullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable(ETabela.acessos, tabela => tabela.dropColumns(...campos));
}

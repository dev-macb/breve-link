import { knex } from 'knex';
import { up as criarUsuarios } from '../../src/migrations/001_CriarTabelaUsuarios';
import { up as migrarUsuarios } from '../../src/migrations/004_NormalizarUsuariosESessoes';

describe('Migracao de normalizacao e sessoes', () => {
    const banco = knex({ client: 'sqlite3', connection: { filename: ':memory:' }, useNullAsDefault: true, pool: { min: 1, max: 1 } });
    beforeAll(async () => { await criarUsuarios(banco); });
    afterAll(async () => { await banco.destroy(); });

    it('interrompe migracao quando normalizacao produzir duplicados, sem apagar dados', async () => {
        await banco('usuarios').insert([
            { nome: 'Primeiro', email: 'TESTE@example.com', senha: 'hash' },
            { nome: 'Segundo', email: 'teste@example.com', senha: 'hash' }
        ]);
        await expect(banco.transaction(trx => migrarUsuarios(trx))).rejects.toThrow('e-mails duplicados');
        expect(await banco('usuarios').select('email').orderBy('id')).toEqual([{ email: 'TESTE@example.com' }, { email: 'teste@example.com' }]);
        expect(await banco.schema.hasColumn('usuarios', 'versaoSessao')).toBe(false);
    });

    it('normaliza dados existentes e protege unicidade mesmo em escrita direta', async () => {
        await banco('usuarios').where({ email: 'teste@example.com' }).del();
        await banco.transaction(trx => migrarUsuarios(trx));
        const usuario = await banco('usuarios').first();
        expect(usuario!.email).toBe('teste@example.com');
        expect(usuario!.versaoSessao).toBe(0);
        await expect(banco('usuarios').insert({ nome: 'Outro', email: ' TESTE@EXAMPLE.COM ', senha: 'hash' })).rejects.toThrow('UNIQUE');
    });
});

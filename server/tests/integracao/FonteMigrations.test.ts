import { mkdtemp, mkdir, writeFile, unlink, rmdir } from 'fs/promises';
import os from 'os';
import path from 'path';
import { knex } from 'knex';
import { FonteMigrations } from '../../src/config/knex/FonteMigrations';

describe('Identidade das migrations entre TypeScript e JavaScript', () => {
    it.each(['ts', 'js'])('preserva dados e historico legado %s ao mudar de formato', async extensao => {
        const temporario = await mkdtemp(path.join(os.tmpdir(), 'breve-migrations-'));
        const fonte = path.join(temporario, 'fonte');
        const compilado = path.join(temporario, 'compilado');
        await mkdir(fonte);
        await mkdir(compilado);
        const nome = '001_CriarDados';
        const conteudo = `exports.up = async function (db) { await db.schema.createTable('dados', t => { t.increments('id'); t.string('valor'); }); };
exports.down = async function (db) { await db.schema.dropTable('dados'); };`;
        const original = path.join(fonte, `${nome}.${extensao}`);
        const convertido = path.join(compilado, `${nome}.${extensao === 'ts' ? 'js' : 'ts'}`);
        const conteudoTS = conteudo.replaceAll('function (db)', 'function (db: any)').replace(' t =>', ' (t: any) =>');
        await writeFile(original, extensao === 'ts' ? conteudoTS : conteudo);
        await writeFile(convertido, extensao === 'ts' ? conteudo : conteudoTS);
        const arquivoBanco = path.join(temporario, 'base.sqlite');
        const banco = knex({ client: 'sqlite3', useNullAsDefault: true, connection: { filename: arquivoBanco }, pool: { min: 1, max: 1 } });
        try {
            await banco.migrate.latest({ directory: fonte, loadExtensions: [`.${extensao}`] });
            await banco('dados').insert({ valor: 'preservar' });
            const historico = await banco('knex_migrations').select('name');
            const resultado = await banco.migrate.latest({ migrationSource: new FonteMigrations(compilado, arquivoBanco) });
            expect(resultado[1]).toEqual([]);
            expect(await banco('dados').select('valor')).toEqual([{ valor: 'preservar' }]);
            expect(await banco('knex_migrations').select('name')).toEqual(historico);
            await banco.migrate.rollback({ migrationSource: new FonteMigrations(compilado, arquivoBanco) }, true);
            expect(await banco.schema.hasTable('dados')).toBe(false);
        } finally {
            await banco.destroy();
            await unlink(original);
            await unlink(convertido);
            for (const sufixo of ['', '-journal', '-wal', '-shm']) {
                await unlink(arquivoBanco + sufixo).catch((erro: NodeJS.ErrnoException) => { if (erro.code !== 'ENOENT') throw erro; });
            }
            await rmdir(fonte);
            await rmdir(compilado);
            await rmdir(temporario);
        }
    });
});

import { resolverCaminhoProjeto } from '../Ambiente';
import path from 'path';
import { mkdirSync } from 'fs';
import { Knex } from 'knex';
import { FonteMigrations } from './FonteMigrations';

const arquivoBanco = resolverCaminhoProjeto(process.env.BD_ARQUIVO || 'database/base.sqlite');
mkdirSync(path.dirname(arquivoBanco), { recursive: true });
const diretorioMigrations = path.resolve(__dirname, '..', '..', 'migrations');

const development: Knex.Config = {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: { filename: arquivoBanco },
    migrations: { migrationSource: new FonteMigrations(diretorioMigrations, arquivoBanco) },
    seeds: { directory: path.resolve(__dirname, '..', '..', 'seeds') },
    pool: {
        min: 1,
        max: 1,
        afterCreate: (connection: any, done: (erro: Error | null, connection: unknown) => void) => {
            connection.run('PRAGMA foreign_keys = ON', (erro: Error | null) =>
                done(erro, connection)
            );
        }
    }
};
const test: Knex.Config = {
    ...development,
    connection: { filename: ':memory:' },
    migrations: { migrationSource: new FonteMigrations(diretorioMigrations, ':memory:') }
};
const production: Knex.Config = { ...development };
export { development, test, production };

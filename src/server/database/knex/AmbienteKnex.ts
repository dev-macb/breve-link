// Importação de módulos
import path from 'path';
import { Knex } from 'knex';


const development: Knex.Config = {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: path.resolve(__dirname, '..', '..', '..', '..', 'database.sqlite')
    },
    migrations: {
        directory: path.resolve(__dirname, '..', 'migrations')
    },
    seeds: {
        directory: path.resolve(__dirname, '..', 'seeds')
    },
    pool: {
        afterCreate: (connection: any, done: Function) => {
            connection.run('PRAGMA foreign_keys = ON');
            done();
        }
    }
};


const test: Knex.Config = {
    ...development,
    connection: ':memory:'
};


const production: Knex.Config = {
    client: 'pg',
    connection: {
        host: process.env.BD_HOST,
        port: Number(process.env.BD_PORT || 5432),
        database: process.env.BD_NAME,
        user: process.env.BD_USER,
        password: process.env.BD_PASS,
        ssl: { rejectUnauthorized: false }
    },
    seeds: { directory: path.resolve(__dirname, '..', 'seeds') },
    migrations: { directory: path.resolve(__dirname, '..', 'migrations') }
};


export { development, test, production };
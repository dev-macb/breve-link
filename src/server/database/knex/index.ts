// Importação módulos
import { knex } from 'knex';
import { development, test, production } from './AmbienteKnex';


const obterAmbiente = () => {
    switch (process.env.NODE_ENV) {
        case 'test': return test;
        case 'prod': return production;
        default:     return development;
    }
};


const Knex = knex(obterAmbiente());


export { Knex };
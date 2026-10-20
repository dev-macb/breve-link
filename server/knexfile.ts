import path from 'path';
import { Knex } from 'knex';
import { development, test, production } from './src/config/knex/Ambiente';

function configuracaoCLI(configuracao: Knex.Config): Knex.Config {
    // O gerador precisa de diretório; a execução usa a fonte com identidade estável.
    // Knex descarta migrationSource quando directory é fornecido no mesmo objeto.
    if (!process.argv.includes('migrate:make')) return configuracao;
    return { ...configuracao, migrations: { directory: path.resolve(__dirname, 'src/migrations'), extension: 'ts' } };
}

export default {
    development: configuracaoCLI(development),
    test: configuracaoCLI(test),
    production: configuracaoCLI(production)
};

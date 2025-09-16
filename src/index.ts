import { Knex } from './config/knex';
import { servidor } from './config/Servidor';


const iniciarServidor = () => {
    console.clear();
    console.log('╔╗ ┬─┐┌─┐┬  ┬┌─┐  ╦  ┬┌┐┌┬┌─');
    console.log('╠╩╗├┬┘├┤ └┐┌┘├┤   ║  ││││├┴┐');
    console.log('╚═╝┴└─└─┘ └┘ └─┘  ╩═╝┴┘└┘┴ ┴');
    console.log('@dev_macb             v1.1.0\n');

    if (process.env.NODE_ENV === 'producao') {
        console.log('[*] Rodando migrations...');
        Knex.migrate.latest().then(() => {
            Knex.seed.run().then(() => {
                iniciarServidor();
            }).catch(console.log);
        });
    }

    servidor.listen(process.env.APP_PORTA || 3333, () => {
        console.log('[*] O servidor HTTP está rodando...');
        console.log(`[*] Aplicação escutando em 127.0.0.1 : ${process.env.APP_PORTA || 3333}\n`);
    });
};


iniciarServidor();
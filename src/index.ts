import { Knex } from './config/knex';
import { servidor } from './config/Servidor';
import { logger } from './config/Logger';

const iniciarServidor = async () => {
    try {
        console.clear();
        console.log('╔╗ ┬─┐┌─┐┬  ┬┌─┐  ╦  ┬┌┐┌┬┌─');
        console.log('╠╩╗├┬┘├┤ └┐┌┘├┤   ║  ││││├┴┐');
        console.log('╚═╝┴└─└─┘ └┘ └─┘  ╩═╝┴┘└┘┴ ┴');
        console.log('@dev_macb             v1.1.0\n');
        
        if (process.env.NODE_ENV === 'producao') {
            logger.info('Executando migrations...');
            await Knex.migrate.latest();
            logger.info('Migrations executadas');
        }

        const porta = process.env.APP_PORTA || 3333;
        servidor.listen(porta, () => {
            logger.info('O servidor HTTP está rodando...')
            logger.info(`Aplicação escutando em localhost : ${porta}`);
        });
    } 
    catch (erro: any) {
        logger.error('Erro ao iniciar servidor:', erro);
        process.exit(1);
    }
};

iniciarServidor();
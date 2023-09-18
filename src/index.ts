// Importação de módulos
import { servidor } from './server/Servidor';


function banner() { 
    console.clear();
    console.log('╔╗ ┬─┐┌─┐┬  ┬┌─┐  ╦  ┬┌┐┌┬┌─');
    console.log('╠╩╗├┬┘├┤ └┐┌┘├┤   ║  ││││├┴┐');
    console.log('╚═╝┴└─└─┘ └┘ └─┘  ╩═╝┴┘└┘┴ ┴');
    console.log('@dev_macb             v1.0.0\n');
}


const iniciarServidor = () => {
    banner();
    servidor.listen(process.env.APP_PORTA || 3333, () => {
        console.log('[*] O servidor HTTP está rodando...');
        console.log(`[*] Aplicação escutando em 127.0.0.1 : ${process.env.APP_PORTA || 3333}\n`);
    });
};


iniciarServidor();
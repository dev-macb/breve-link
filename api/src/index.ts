import './config/Ambiente';
import { Knex } from './config/knex';
import { servidor } from './app';
import { logger } from './config/Logger';
import { existsSync } from 'fs';
import path from 'path';
import { DIRETORIO_WEB } from './config/InterfaceWeb';

class ErroConfiguracao extends Error {}

async function iniciarServidor(): Promise<void> {
    try {
        if (
            !['development', 'test', 'production'].includes(process.env.NODE_ENV || 'development')
        ) {
            throw new ErroConfiguracao('NODE_ENV inválido');
        }
        if (Buffer.byteLength(process.env.JWT_SEGREDO ?? '', 'utf8') < 32) {
            throw new ErroConfiguracao('JWT_SEGREDO deve conter ao menos 32 bytes aleatórios');
        }
        const porta = Number(process.env.APP_PORTA || 3000);
        if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
            throw new ErroConfiguracao('APP_PORTA inválida');
        }
        if (!process.env.APP_ORIGEM) {
            throw new ErroConfiguracao('Defina APP_ORIGEM com a origem pública da aplicação');
        }
        const origem = new URL(process.env.APP_ORIGEM);
        if (
            !['http:', 'https:'].includes(origem.protocol) ||
            origem.origin !== process.env.APP_ORIGEM
        ) {
            throw new ErroConfiguracao('APP_ORIGEM inválida');
        }
        if (process.env.NODE_ENV === 'production' && origem.protocol !== 'https:') {
            throw new ErroConfiguracao('Produção requer APP_ORIGEM HTTPS');
        }
        if (
            process.env.NODE_ENV === 'production' &&
            !existsSync(path.join(DIRETORIO_WEB, 'index.html'))
        ) {
            throw new ErroConfiguracao('Interface não compilada; execute npm run build');
        }
        await Knex.migrate.latest();
        const http = servidor.listen(porta, process.env.APP_HOST || '0.0.0.0', () =>
            logger.info({ porta }, 'Servidor iniciado')
        );
        http.on('error', async () => {
            logger.error('Falha ao abrir servidor HTTP');
            await Knex.destroy();
            process.exitCode = 1;
        });
        let encerrando = false;
        const encerrar = () => {
            if (encerrando) {
                return;
            }
            encerrando = true;
            logger.info('Encerrando servidor');
            const prazo = setTimeout(() => process.exit(1), 10000);
            prazo.unref();
            http.close(async () => {
                try {
                    await Knex.destroy();
                } finally {
                    clearTimeout(prazo);
                }
            });
        };
        process.on('SIGTERM', encerrar);
        process.on('SIGINT', encerrar);
    } catch (erro) {
        // Configuração tem mensagens controladas; não registrar objetos/SQL de falhas de banco.
        logger.error(
            {
                motivo:
                    erro instanceof ErroConfiguracao
                        ? erro.message
                        : 'Falha na inicialização ou migrations'
            },
            'Servidor não iniciado'
        );
        await Knex.destroy();
        process.exitCode = 1;
    }
}
void iniciarServidor();

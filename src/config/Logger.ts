import pino from 'pino';


const logger = pino({
    level: process.env.LOG_LEVEL || 'debug',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'dd-mm-yyyy HH:MM:ss',
            ignore: 'pid,hostname'
        }
    }
});

export { logger };
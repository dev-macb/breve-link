import './Ambiente';
import pino from 'pino';


const logger = pino({
    redact: {
        paths: ['senha', '*.senha', 'req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
        censor: '[REDACTED]'
    },
    level: process.env.LOG_LEVEL || 'debug',
    transport: process.env.NODE_ENV === 'production' ? undefined : {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'dd-mm-yyyy HH:MM:ss',
            ignore: 'pid,hostname'
        }
    }
});

export { logger };

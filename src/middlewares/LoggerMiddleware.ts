import pinoHttp from 'pino-http';
import { logger } from '../config/Logger';

const LoggerMiddleware = pinoHttp({
    logger,
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
    },
    customSuccessMessage: (req, res) => {
        // Log manual para ver tudo
        logger.info({
            req: {
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
                ip: req.ip,
                userAgent: req.headers['user-agent']
            },
            res: {
                status: res.statusCode,
                responseTime: res.getHeader('x-response-time')
            }
        }, `${res.statusCode} ${req.method} ${req.url}`);
        
        return `${res.statusCode} ${req.method} ${req.url}`;
    }
});

export { LoggerMiddleware };
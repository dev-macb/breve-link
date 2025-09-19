import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import pinoHttp from 'pino-http';
import { logger } from './Logger';
import { usuarioRouter, linkRouter } from '../routes';
import { LoggerMiddleware } from '../middlewares/LoggerMiddleware';


const servidor = express();

if (process.env.LOG_LEVEL === 'debug') {
    // servidor.use(LoggerMiddleware);
    // servidor.use(pinoHttp({ logger }));
}

servidor.use(express.json());
servidor.use(express.urlencoded({ extended: true }));

servidor.use('/usuarios', usuarioRouter);
servidor.use('/links', linkRouter);


export { servidor };
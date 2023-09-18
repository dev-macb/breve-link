// Importação de módulos
import 'dotenv/config';
import express from 'express';
import { rotiador } from './routes';


const servidor = express();
servidor.use(express.json());
servidor.use('/api', rotiador);
servidor.use(express.urlencoded({ extended: true }));


export { servidor };

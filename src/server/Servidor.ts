// Importação de módulos
import 'dotenv/config';
import express from 'express';
import { rotiador } from './routes';


const servidor = express();
servidor.use(express.json());
servidor.use(express.urlencoded({ extended: true }));
servidor.use('/api', rotiador);


export { servidor };

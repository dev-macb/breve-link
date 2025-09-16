import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import { usuarioRouter } from '../routes';


const servidor = express();
servidor.use(express.json());
servidor.use(express.urlencoded({ extended: true }));

servidor.use('/usuarios', usuarioRouter);


export { servidor };
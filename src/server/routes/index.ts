// Importação de módulos
import { Router } from 'express';


const rotiador = Router();


rotiador.get('/', (_, response) => response.send('Olá Mundo!') );


export { rotiador };

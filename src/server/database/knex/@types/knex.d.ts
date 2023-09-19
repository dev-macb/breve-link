// Importação de módulos
import { UsuarioModel } from '../../models/UsuarioModel';


declare module 'knex/types/tables' {
    interface Tables {
        produtos: UsuarioModel;
    }
}
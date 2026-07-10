import { Acesso } from "../../../models/Acesso";
import { Usuario } from "../../../models/Usuario";


declare module 'knex/types/tables' {
    interface Tables {
        usuarios: Usuario;
        acessos: Acesso;
    }
}
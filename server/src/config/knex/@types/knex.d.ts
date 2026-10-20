import { Acesso } from "../../../models/Acesso";
import { Usuario } from "../../../models/Usuario";
import { Link } from '../../../models/Link';


declare module 'knex/types/tables' {
    interface Tables {
        usuarios: Usuario;
        links: Link;
        acessos: Acesso;
    }
}

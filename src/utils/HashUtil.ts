import { hash, compare } from 'bcrypt';
import { COMPLEXIDADE_HASH } from '../config/Constantes';


class HashUtil {
    static async Criptografar(texto: string) {
        return await hash(texto, COMPLEXIDADE_HASH);
    }

    static async Comparar(texto: string, senha: string) {
        return await compare(texto, senha);
    }
}


export { HashUtil }
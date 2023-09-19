// Importação de módulos
import { hash, compare, genSalt } from 'bcryptjs';


const COMPLEXIDADE = 8;


const criptografar = async (senhaPura: string) => {
    const salt = await genSalt(COMPLEXIDADE);
    return await hash(senhaPura, salt);
};


const comparar = async (senhaPura: string, senhaHash: string) => {
    return await compare(senhaPura, senhaHash);
};


export const HashService = { criptografar, comparar };

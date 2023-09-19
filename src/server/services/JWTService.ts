// Importação de módulos
import * as jwt from 'jsonwebtoken';


interface IDados {
    id: number;
}


const gerar = (dados: IDados): string | 'JWT_SEGREDO_NAO_ENCONTRADO' => {
    if(!process.env.JWT_SEGREDO) return 'JWT_SEGREDO_NAO_ENCONTRADO';
    
    return jwt.sign(
        dados, 
        process.env.JWT_SEGREDO,
        { expiresIn: '1h'}
    );
};


const autenticar = (token: string): IDados | 'TOKEN_INVALIDO' | 'JWT_SEGREDO_NAO_ENCONTRADO' => {
    if(!process.env.JWT_SEGREDO) return 'JWT_SEGREDO_NAO_ENCONTRADO';

    try {
        const decoded = jwt.verify(token, process.env.JWT_SEGREDO);

        if(typeof decoded === 'string') return 'TOKEN_INVALIDO';
        else return decoded as IDados;
    }
    catch (erro) {
        return 'TOKEN_INVALIDO';
    }
};


export const JWTService = { gerar, autenticar };

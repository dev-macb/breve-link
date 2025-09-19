import * as jwt from 'jsonwebtoken';

interface IPayload {
    id: number;
    administrador: boolean;
}

class JwtUtil {
    static Gerar(payload: IPayload): string {
        if (!process.env.JWT_SEGREDO) throw new Error('Segredo JWT não encontrado');
        
        return jwt.sign(payload, process.env.JWT_SEGREDO, { expiresIn: '1h' });
    }

    static Autenticar(token: string): IPayload {
        if (!process.env.JWT_SEGREDO) throw new Error('Segredo JWT não encontrado');

        const decoded = jwt.verify(token, process.env.JWT_SEGREDO);
        return decoded as IPayload;
    }
}

export { JwtUtil };
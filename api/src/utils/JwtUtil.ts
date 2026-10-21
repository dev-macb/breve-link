import * as jwt from 'jsonwebtoken';

export interface IPayload {
    id: number;
    administrador: boolean;
    versaoSessao: number;
}
export class JwtUtil {
    static Gerar(payload: IPayload): string {
        if (!process.env.JWT_SEGREDO) {
            throw new Error('Segredo JWT não encontrado');
        }
        return jwt.sign(payload, process.env.JWT_SEGREDO, { expiresIn: '1h', algorithm: 'HS256' });
    }
    static Autenticar(token: string): IPayload {
        if (!process.env.JWT_SEGREDO) {
            throw new Error('Segredo JWT não encontrado');
        }
        const decoded = jwt.verify(token, process.env.JWT_SEGREDO, { algorithms: ['HS256'] });
        if (
            typeof decoded === 'string' ||
            !Number.isInteger(decoded.id) ||
            decoded.id <= 0 ||
            !Number.isInteger(decoded.versaoSessao) ||
            typeof decoded.administrador !== 'boolean'
        ) {
            throw new Error('Payload JWT inválido');
        }
        return decoded as IPayload;
    }
}

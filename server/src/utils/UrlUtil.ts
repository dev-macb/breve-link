import { randomInt } from 'crypto';
export class UrlUtil {
    private static readonly caracteres = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    static Gerar(tamanho: number): string {
        return Array.from({ length: tamanho }, () => this.caracteres[randomInt(this.caracteres.length)]).join('');
    }
}

import { RequisicaoInvalida } from '../erros';

const reservados = new Set(['api', 'auth', 'login', 'logout', 'dashboard', 'links', 'usuarios', 'stats', 'assets', 'saude', 'admin', 'indisponivel']);
export class SlugUtil {
    static permitido(slug: string): boolean {
        return /^[a-zA-Z0-9_-]{3,50}$/.test(slug) && !reservados.has(slug.toLowerCase());
    }
    static validar(slug: string): void {
        if (!this.permitido(slug)) throw new RequisicaoInvalida('Slug inválido ou reservado');
    }
}

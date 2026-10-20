import type { LinkCurto } from '../tipos';
export const numero = (valor: number) => new Intl.NumberFormat('pt-BR').format(valor);
export function dataApi(valor: string | number): Date {
    if (typeof valor !== 'string' || !/^\d{4}-\d\d-\d\d \d\d:\d\d/.test(valor)) return new Date(valor);
    const iso = valor.replace(' ', 'T');
    return new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso) ? iso : iso + 'Z');
}
export function dataCurta(valor: string | number): string {
    const data = dataApi(valor);
    return Number.isNaN(data.getTime()) ? 'Data indisponível' : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(data);
}
export function dataFormulario(valor?: string | number | null): string {
    if (valor == null) return '';
    const data = dataApi(valor);
    if (!Number.isFinite(data.getTime())) return '';
    const local = new Date(data.getTime() - data.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}
export function estadoLink(link: LinkCurto): 'Ativo' | 'Pausado' | 'Expirado' {
    if (link.expiraEm != null && !(dataApi(link.expiraEm).getTime() > Date.now())) return 'Expirado';
    return link.ativo ? 'Ativo' : 'Pausado';
}
export function enderecoCurto(origem: string, slug: string): string { return origem.replace(/\/$/, '') + '/' + encodeURIComponent(slug); }
export function dominio(url: string): string {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}
export function nomePais(codigo: string): string {
    if (codigo === 'Desconhecido') return 'Não identificado';
    try { return new Intl.DisplayNames(['pt-BR'], { type: 'region' }).of(codigo) ?? codigo; }
    catch { return codigo; }
}
export function serieDiaria(registros: { data: string; acessos: number }[], dias = 30, agora = new Date()) {
    const indice = new Map(registros.map(registro => [registro.data, Number(registro.acessos)]));
    const hoje = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate());
    return Array.from({ length: dias }, (_, i) => {
        const dia = new Date(hoje - (dias - 1 - i) * 86400000);
        const data = dia.toISOString().slice(0, 10);
        const rotulo = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(dia).replace('.', '');
        return { data, rotulo, acessos: indice.get(data) ?? 0 };
    });
}

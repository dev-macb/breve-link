export interface Pagina<T> {
    itens: T[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
}

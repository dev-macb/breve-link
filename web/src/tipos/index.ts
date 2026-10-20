export interface Usuario {
    id: number; nome: string; email: string; ativo: boolean; administrador: boolean;
}
export interface LinkCurto {
    id: number; urlOriginal: string; urlCurta: string; acessos: number; ativo: boolean;
    expiraEm?: string | number | null; criadoEm: string | number; atualizadoEm: string | number;
}
export interface Pagina<T> { itens: T[]; total: number; pagina: number; limite: number; totalPaginas: number; }
export interface DadosLink { urlOriginal: string; urlCurta?: string; expiraEm: string | null; ativo?: boolean; }
export interface Estatisticas {
    link: Pick<LinkCurto, 'id' | 'urlOriginal' | 'urlCurta' | 'criadoEm'>;
    totalAcessos: number; acessosPorDia: { data: string; acessos: number }[];
    dispositivos: {
        navegadores: { nome: string; acessos: number; percentual: number }[];
        sistemasOperacionais: { nome: string; acessos: number; percentual: number }[];
        tipos: { tipo: string; acessos: number; percentual: number }[];
    };
    referrers: { origem: string; acessos: number; percentual: number }[];
    localizacao: { paises: { pais: string; acessos: number; percentual: number }[]; cidades: { cidade: string; pais: string; acessos: number; percentual: number }[]; };
}

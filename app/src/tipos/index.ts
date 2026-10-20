export interface Usuario {
    id: number;
    nome: string;
    email: string;
    ativo: boolean;
    administrador: boolean;
}

export interface LinkCurto {
    geo?: boolean;
    id: number;
    urlOriginal: string;
    urlCurta: string;
    acessos: number;
    ativo: boolean;
    expiraEm?: string | number | null;
    criadoEm: string | number;
    atualizadoEm: string | number;
}

export interface Pagina<T> {
    itens: T[];
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
}

export interface DadosLink {
    geo?: boolean;
    urlOriginal: string;
    urlCurta?: string;
    expiraEm: string | null;
    ativo?: boolean;
}

export interface Estatisticas {
    geolocalizacao?: {
        capturadas: number;
        total: number;
        taxaAprovacao: number;
        porStatus: Record<string, number>;
        clusters: { lat: number; lon: number; total: number }[];
    };
    fingerprint: {
        hashesDistintos: number;
        acessosComHash: number;
        grupos: {
            hashDispositivo: string;
            acessos: number;
            primeiroAcesso: string;
            ultimoAcesso: string;
        }[];
    };
    acessosRecentes: {
        id: number;
        criadoEm: string | number;
        ip: string | null;
        navegador: string | null;
        sistemaOperacional: string | null;
        dispositivo: string | null;
        pais: string | null;
        cidade: string | null;
        referrer: string | null;
        userAgent: string | null;
        idioma: string | null;
        versaoNavegador: string | null;
        versaoSistemaOperacional: string | null;
        hashDispositivo: string | null;
        metodo: string | null;
        caminho: string | null;
        clientHints: string | null;
        fetchSite: string | null;
        fetchMode: string | null;
        fetchDest: string | null;
        accept: string | null;
        acceptEncoding: string | null;
        versaoHttp: string | null;
        clientHintsMobile: string | null;
        clientHintsPlataforma: string | null;
        clientHintsVersaoPlataforma: string | null;
        clientHintsArquitetura: string | null;
        clientHintsModelo: string | null;
        clientHintsVersaoCompleta: string | null;
        fetchUser: string | null;
        purpose: string | null;
        secPurpose: string | null;
        saveData: string | null;
        dnt: string | null;
        gpc: string | null;
    }[];
    link: Pick<LinkCurto, 'id' | 'urlOriginal' | 'urlCurta' | 'criadoEm'>;
    totalAcessos: number;
    acessosPorDia: { data: string; acessos: number }[];
    dispositivos: {
        navegadores: { nome: string; acessos: number; percentual: number }[];
        sistemasOperacionais: { nome: string; acessos: number; percentual: number }[];
        tipos: { tipo: string; acessos: number; percentual: number }[];
    };
    referrers: { origem: string; acessos: number; percentual: number }[];
    localizacao: {
        paises: { pais: string; acessos: number; percentual: number }[];
        cidades: { cidade: string; pais: string; acessos: number; percentual: number }[];
    };
}

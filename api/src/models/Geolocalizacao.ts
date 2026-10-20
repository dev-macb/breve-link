export interface ContagemGeoStatus {
    geo_status: string;
    total: number;
}

export interface ClusterGeografico {
    lat: number;
    lon: number;
    total: number;
}

export interface EstatisticasGeolocalizacao {
    capturadas: number;
    total: number;
    taxaAprovacao: number;
    porStatus: Record<string, number>;
    clusters: ClusterGeografico[];
}

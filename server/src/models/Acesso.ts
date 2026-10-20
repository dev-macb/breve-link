export interface Acesso {
    id: number;
    linkId: number;
    ip: string | null;
    navegador: string | null;
    sistemaOperacional: string | null;
    dispositivo: string | null;
    referrer: string | null;
    pais: string | null;
    cidade: string | null;
    criadoEm: Date;
    userAgent?: string | null;
    idioma?: string | null;
    metodo?: string | null;
    caminho?: string | null;
    clientHints?: string | null;
    fetchSite?: string | null;
    fetchMode?: string | null;
    fetchDest?: string | null;
    dnt?: string | null;
    gpc?: string | null;
    hashDispositivo?: string | null;
    versaoNavegador?: string | null;
    versaoSistemaOperacional?: string | null;
}

export type CadastrarAcessoDto = Omit<Acesso, 'id' | 'criadoEm'>;

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
}

export type CadastrarAcessoDto = Omit<Acesso, 'id' | 'criadoEm'>;

export interface Link {
    id: number;
    urlOriginal: string;
    urlCurta: string;
    acessos: number;
    ativo: boolean;
    expiraEm?: Date | null;
    criadoEm: Date;
    atualizadoEm: Date;
}

export type CadastrarLinkDto = Omit<Link, 'id' | 'acessos' | 'ativo' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarLinkDto = Partial<Omit<Link, 'id' | 'criadoEm' | 'atualizadoEm'>>;
export type RedirecionarLinkDto = Partial<Omit<Link, 'id' | 'urlOriginal' | 'acessos' | 'ativo' | 'expiraEm' | 'criadoEm' | 'atualizadoEm'>>;
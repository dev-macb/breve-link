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

export type CadastrarLinkDto = Omit<Link, 'id' | 'urlCurta' | 'acessos' | 'ativo' | 'criadoEm' | 'atualizadoEm'> & { urlCurta?: string };
export type AtualizarLinkDto = Partial<Omit<Link, 'id' | 'acessos' | 'criadoEm' | 'atualizadoEm'>>;
export type RedirecionarLinkDto = Partial<Omit<Link, 'id' | 'urlOriginal' | 'acessos' | 'ativo' | 'expiraEm' | 'criadoEm' | 'atualizadoEm'>>;

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha: string;
    versaoSessao?: number;
    ativo: boolean;
    administrador: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
}

export type CadastrarUsuarioDto = Omit<Usuario, 'id' | 'criadoEm' | 'atualizadoEm' | 'versaoSessao'>;
export type AtualizarUsuarioDto = Partial<CadastrarUsuarioDto>;
export type EntrarUsuarioDto = Pick<Usuario, 'email' | 'senha'>;

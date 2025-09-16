export interface Usuario {
    id: number;
    nome: string;
    email: string;
    senha: string;
    ativo: boolean;
    administrador: boolean;
    criadoEm: Date;
    atualizadoEm: Date;
}

export type CadastrarUsuarioDto = Omit<Usuario, 'id' | 'criadoEm' | 'atualizadoEm'>;
export type AtualizarUsuarioDto = Partial<Omit<Usuario, 'id' | 'criadoEm' | 'atualizadoEm'>>;
export type EntrarUsuarioDto = Omit<Usuario, 'id' | 'nome' | 'administrador' | 'ativo' | 'criadoEm' | 'atualizadoEm'>;
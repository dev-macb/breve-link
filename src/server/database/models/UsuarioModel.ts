// Declaração de inteface
interface UsuarioModel {
    id_usuario: number;
    nome: string;
    email: string;
    senha: string;
    criado_em: Date;
    atualizado_em: Date;
}

export { UsuarioModel };
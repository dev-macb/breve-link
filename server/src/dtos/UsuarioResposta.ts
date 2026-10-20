import { Usuario } from '../models/Usuario';

export type UsuarioResposta = Omit<Usuario, 'senha' | 'versaoSessao'>;

export function usuarioResposta(usuario: Usuario): UsuarioResposta {
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        ativo: !!usuario.ativo,
        administrador: !!usuario.administrador,
        criadoEm: usuario.criadoEm,
        atualizadoEm: usuario.atualizadoEm
    };
}

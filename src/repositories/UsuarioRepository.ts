import { ETabela } from '../enums';
import { Knex } from '../config/knex';
import { injectable } from 'inversify';
import { logger } from '../config/Logger';
import { IFiltros, IUsuarioRepository } from '../interfaces';
import { AtualizarUsuarioDto, CadastrarUsuarioDto, Usuario } from '../models';


@injectable()
class UsuarioRepository implements IUsuarioRepository {
    async obterTodos(filtros: IFiltros): Promise<Usuario[]> {
        try {
            const propriedadeAlvo = 'nome';
            const { pagina = 1, limite = 10, filtro = '' } = filtros;

            return await Knex<Usuario>(ETabela.usuarios)
                .select('*')
                .where(propriedadeAlvo, 'like', `%${filtro}%`)
                .offset((pagina - 1) * limite)
                .limit(limite);
        } 
        catch (erro: any) {
            logger.error({ erro }, 'Erro ao obter todos os usuários');
            throw erro;
        }
    }

    async obterPorId(id: number): Promise<Usuario | null> {
        try {
            return await Knex<Usuario>(ETabela.usuarios)
                .where({ id })
                .first() || null;
        } 
        catch (erro: any) {
            logger.error({ erro, id }, 'Erro ao buscar usuário por ID');
            throw erro;
        }
    }

    async obterPorEmail(email: string): Promise<Usuario | null> {
        try {
            return await Knex<Usuario>(ETabela.usuarios)
                .where({ email })
                .first() || null;
        } 
        catch (erro: any) {
            logger.error({ erro, email }, 'Erro ao buscar usuário por e-mail');
            throw erro;
        }
    }

    async cadastrar(cadastrarUsuarioDto: CadastrarUsuarioDto): Promise<Usuario | null> {
        try {
            const [usuario] = await Knex<Usuario>(ETabela.usuarios)
                .insert(cadastrarUsuarioDto)
                .returning('*');

            return usuario || null;
        } 
        catch (erro: any) {
            logger.error({ erro, cadastrarUsuarioDto }, 'Erro ao cadastrar usuário');
            throw erro;
        }
    }

    async atualizar(id: number, atualizarUsuarioDto: AtualizarUsuarioDto): Promise<Usuario | null> {
        try {
            const [usuario] = await Knex<Usuario>(ETabela.usuarios)
                .where({ id })
                .update({ ...atualizarUsuarioDto, atualizadoEm: Knex.fn.now() })
                .returning('*');

            return usuario || null;
        } 
        catch (erro: any) {
            logger.error({ erro, id, atualizarUsuarioDto }, 'Erro ao atualizar usuário');
            throw erro;
        }
    }

    async remover(id: number): Promise<boolean> {
        try {
            const usuariosRemovidos = await Knex<Usuario>(ETabela.usuarios)
                .where({ id })
                .del();

            return usuariosRemovidos > 0;
        } 
        catch (erro: any) {
            logger.error({ erro, id }, 'Erro ao remover usuário');
            throw erro;
        }
    }
}


export { UsuarioRepository };
import { ETabela } from '../enums';
import { Knex } from '../config/knex';
import { injectable } from 'inversify';
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
            throw erro;
        }
    }

    async obterPorId(id: number): Promise<Usuario | null> {
        try {
            return (await Knex<Usuario>(ETabela.usuarios)
                .where({ id })
                .first()) || null;
        } 
        catch (erro: any) {
            throw erro;
        }
    }

    async obterPorEmail(email: string): Promise<Usuario | null> {
        try {
            return (await Knex<Usuario>(ETabela.usuarios)
                .where({ email })
                .first()) || null;
        } 
        catch (erro: any) {
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
            throw erro;
        }
    }
}


export { UsuarioRepository };
import { ETabela } from '../enums';
import { Knex } from '../config/knex';
import { injectable } from 'inversify';
import { IFiltros, ILinkRepository } from '../interfaces';
import { AtualizarLinkDto, CadastrarLinkDto, Link } from '../models';


@injectable()
class LinkRepository implements ILinkRepository {
    async obterTodos(filtros: IFiltros): Promise<Link[]> {
        try {
            const propriedadeAlvo = 'urlCurta';
            const { pagina = 1, limite = 10, filtro = '' } = filtros;
            
            return await Knex<Link>(ETabela.links)
                .select('*')
                .where(propriedadeAlvo, 'like', `%${filtro}%`)
                .offset((pagina - 1) * limite)
                .limit(limite);
        } 
        catch (erro: any) {
            throw erro;
        }
    }

    async obterPorId(id: number): Promise<Link | null> {
        try {
            return (await Knex<Link>(ETabela.links)
                .where({ id })
                .first()) || null;
        } 
        catch (erro: any) {
            throw erro;
        }
    }

    async obterPorUrlCurta(urlCurta: string): Promise<Link | null> {
        try {
            return await Knex<Link>(ETabela.links)
                .where({ urlCurta })
                .first() || null;
        } 
        catch (erro: any) {
            throw erro;
        }
    }

    async cadastrar(cadastrarLinkDto: CadastrarLinkDto): Promise<Link | null> {
        try {
            const [link] = await Knex<Link>(ETabela.links)
                .insert(cadastrarLinkDto)
                .returning('*');

            return link || null;
        } 
        catch (erro: any) {
            throw erro;
        }
    }

    async atualizar(id: number, atualizarLinkDto: AtualizarLinkDto): Promise<Link | null> {
        try {
            const [link] = await Knex<Link>(ETabela.links)
                .where({ id })
                .update({ ...atualizarLinkDto, atualizadoEm: Knex.fn.now() })
                .returning('*');

            return link || null;
        } 
        catch (erro: any) {
            throw erro;
        }
    }

    async remover(id: number): Promise<boolean> {
        try {
            const linksRemovidos = await Knex<Link>(ETabela.links)
                .where({ id })
                .del();

            return linksRemovidos > 0;
        } 
        catch (erro: any) {
            throw erro;
        }
    }
}


export { LinkRepository };
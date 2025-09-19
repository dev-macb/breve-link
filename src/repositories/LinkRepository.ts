import { ETabela } from '../enums';
import { Knex } from '../config/knex';
import { injectable } from 'inversify';
import { logger } from '../config/Logger';
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
            logger.error({ erro }, 'Erro ao obter todos os links');
            throw erro;
        }
    }

    async obterPorId(id: number): Promise<Link | null> {
        try {
            const link = await Knex<Link>(ETabela.links)
                .where({ id })
                .first() || null;

            return link;
        } 
        catch (erro: any) {
            logger.error({ erro, id }, 'Erro ao buscar link por ID');
            throw erro;
        }
    }

    async obterPorUrlCurta(urlCurta: string): Promise<Link | null> {
        try {
            const link = await Knex<Link>(ETabela.links)
                .where({ urlCurta })
                .first() || null;

            return link;
        } 
        catch (erro: any) {
            logger.error({ erro, urlCurta }, 'Erro ao buscar link por URL curta');
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
            logger.error({ erro, cadastrarLinkDto }, 'Erro ao cadastrar link');
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
            logger.error({ erro, id, atualizarLinkDto }, 'Erro ao atualizar link');
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
            logger.error({ erro, id }, 'Erro ao remover link');
            throw erro;
        }
    }
}


export { LinkRepository };
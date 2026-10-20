import { ETabela } from '../enums';
import { Knex } from '../config/knex';
import { injectable } from 'inversify';
import { logger } from '../config/Logger';
import { IFiltros, ILinkRepository } from '../interfaces';
import { AtualizarLinkDto, CadastrarLinkDto, Link } from '../models';
import { Conflito, conflitoUnico } from '../erros';


@injectable()
class LinkRepository implements ILinkRepository {
    async contar({ filtro = '' }: IFiltros): Promise<number> {
        const resultado = await Knex(ETabela.links).where(consulta => consulta.where('urlCurta', 'like', `%${filtro}%`).orWhere('urlOriginal', 'like', `%${filtro}%`)).count<{ total: number }>('* as total').first();
        return Number(resultado?.total ?? 0);
    }
    async obterTodos(filtros: IFiltros): Promise<Link[]> {
        try {
            const { pagina = 1, limite = 10, filtro = '' } = filtros;

            return await Knex<Link>(ETabela.links)
                .select('*')
                .where(consulta => consulta.where('urlCurta', 'like', `%${filtro}%`).orWhere('urlOriginal', 'like', `%${filtro}%`))
                .orderBy('id', 'desc')
                .offset((pagina - 1) * limite)
                .limit(limite);
        } 
        catch (erro: any) {
            logger.error('Erro ao obter todos os links');
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
            logger.error({ id }, 'Erro ao buscar link por ID');
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
            logger.error({ urlCurta }, 'Erro ao buscar link por URL curta');
            throw erro;
        }
    }

    async cadastrar(cadastrarLinkDto: CadastrarLinkDto): Promise<Link | null> {
        try {
            const [link] = await Knex<Link>(ETabela.links)
                .insert({ ...cadastrarLinkDto, ...(cadastrarLinkDto.expiraEm ? { expiraEm: Knex.raw('?', [cadastrarLinkDto.expiraEm.toISOString()]) } : {}) })
                .returning('*');

            return link || null;
        } 
        catch (erro: any) {
            if (conflitoUnico(erro)) throw new Conflito('UrlCurta já registrada');
            logger.error('Erro ao cadastrar link');
            throw erro;
        }
    }

    async atualizar(id: number, atualizarLinkDto: AtualizarLinkDto): Promise<Link | null> {
        try {
            const [link] = await Knex<Link>(ETabela.links)
                .where({ id })
                .update({ ...atualizarLinkDto, ...(atualizarLinkDto.expiraEm ? { expiraEm: Knex.raw('?', [atualizarLinkDto.expiraEm.toISOString()]) } : {}), atualizadoEm: Knex.fn.now() })
                .returning('*');

            return link || null;
        } 
        catch (erro: any) {
            if (conflitoUnico(erro)) throw new Conflito('UrlCurta já registrada');
            logger.error({ id }, 'Erro ao atualizar link');
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
            logger.error({ id }, 'Erro ao remover link');
            throw erro;
        }
    }

    async urlCurtaExiste(urlCurta: string): Promise<boolean> {
        try {
            const resultado = await Knex<Link>(ETabela.links)
                .where({ urlCurta })
                .first();

            return !!resultado;
        }
        catch (erro: any) {
            logger.error({ urlCurta }, 'Erro ao verificar urlCurta');
            throw erro;
        }
    }
}


export { LinkRepository };

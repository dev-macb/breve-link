import { ETabela } from '../enums';
import { Knex } from '../config/knex';
import { injectable } from 'inversify';
import { logger } from '../config/Logger';
import { Acesso, CadastrarAcessoDto } from '../models';
import { ContagemCidade, ContagemPorCampo, IAcessoRepository, RegistroAcessoDiario, ResumoFingerprint } from '../interfaces/repositories/IAcessoRepository';


@injectable()
class AcessoRepository implements IAcessoRepository {
    async obterFingerprint(linkId: number): Promise<ResumoFingerprint> {
        // Agrega todo o histórico no SQLite, independentemente dos 100 eventos recentes.
        const resumo = await Knex(ETabela.acessos).where({ linkId })
            .countDistinct('hashDispositivo as hashesDistintos')
            .count('hashDispositivo as acessosComHash').first<{ hashesDistintos: number; acessosComHash: number }>();
        const grupos = await Knex(ETabela.acessos).where({ linkId }).whereNotNull('hashDispositivo')
            .select('hashDispositivo').count('id as acessos')
            .min('criadoEm as primeiroAcesso').max('criadoEm as ultimoAcesso')
            .groupBy('hashDispositivo').orderBy('acessos', 'desc').orderBy('hashDispositivo')
            .limit(20) as unknown as ResumoFingerprint['grupos'];
        return {
            hashesDistintos: Number(resumo?.hashesDistintos) || 0,
            acessosComHash: Number(resumo?.acessosComHash) || 0,
            grupos: grupos.map(grupo => ({ ...grupo, acessos: Number(grupo.acessos) }))
        };
    }

    async obterRecentes(linkId: number): Promise<Acesso[]> {
        // Lista explícita mantém campos legados de campanha fora da API.
        return Knex<Acesso>(ETabela.acessos).select('id', 'linkId', 'ip', 'navegador',
            'sistemaOperacional', 'dispositivo', 'referrer', 'pais', 'cidade', 'criadoEm',
            'userAgent', 'idioma', 'versaoNavegador', 'versaoSistemaOperacional',
            'metodo', 'caminho', 'clientHints', 'fetchSite', 'fetchMode', 'fetchDest',
            'dnt', 'gpc', 'hashDispositivo').where({ linkId }).orderBy('id', 'desc').limit(100);
    }

    async cadastrar(cadastrarAcessoDto: CadastrarAcessoDto): Promise<void> {
        try {
            await Knex.transaction(async transacao => {
                await transacao<Acesso>(ETabela.acessos).insert(cadastrarAcessoDto);
                const alterados = await transacao(ETabela.links).where({ id: cadastrarAcessoDto.linkId }).increment('acessos', 1);
                if (alterados !== 1) throw new Error('Link não encontrado ao registrar acesso');
            });
        }
        catch (erro: any) {
            logger.error({ linkId: cadastrarAcessoDto.linkId }, 'Erro ao registrar acesso');
            throw erro;
        }
    }

    async contarTotalPorLinkId(linkId: number): Promise<number> {
        try {
            const resultado = await Knex(ETabela.acessos)
                .where({ linkId })
                .count('id as total')
                .first() as any;

            return Number(resultado?.total) || 0;
        }
        catch (erro: any) {
            logger.error({ linkId }, 'Erro ao contar acessos totais');
            throw erro;
        }
    }

    async contarPorDia(linkId: number): Promise<RegistroAcessoDiario[]> {
        try {
            return await Knex<Acesso>(ETabela.acessos)
                .where({ linkId })
                .select(Knex.raw("date(criadoEm) as data"))
                .count('id as acessos')
                .groupBy(Knex.raw("date(criadoEm)"))
                .orderBy('data', 'desc');
        }
        catch (erro: any) {
            logger.error({ linkId }, 'Erro ao contar acessos por dia');
            throw erro;
        }
    }

    async contarPorNavegador(linkId: number): Promise<ContagemPorCampo[]> {
        try {
            return await Knex<Acesso>(ETabela.acessos)
                .where({ linkId })
                .select('navegador as campo')
                .count('id as acessos')
                .groupBy('navegador')
                .orderBy('acessos', 'desc');
        }
        catch (erro: any) {
            logger.error({ linkId }, 'Erro ao contar acessos por navegador');
            throw erro;
        }
    }

    async contarPorSistemaOperacional(linkId: number): Promise<ContagemPorCampo[]> {
        try {
            return await Knex<Acesso>(ETabela.acessos)
                .where({ linkId })
                .select('sistemaOperacional as campo')
                .count('id as acessos')
                .groupBy('sistemaOperacional')
                .orderBy('acessos', 'desc');
        }
        catch (erro: any) {
            logger.error({ linkId }, 'Erro ao contar acessos por SO');
            throw erro;
        }
    }

    async contarPorDispositivo(linkId: number): Promise<ContagemPorCampo[]> {
        try {
            return await Knex<Acesso>(ETabela.acessos)
                .where({ linkId })
                .select('dispositivo as campo')
                .count('id as acessos')
                .groupBy('dispositivo')
                .orderBy('acessos', 'desc');
        }
        catch (erro: any) {
            logger.error({ linkId }, 'Erro ao contar acessos por dispositivo');
            throw erro;
        }
    }

    async contarPorReferrer(linkId: number): Promise<ContagemPorCampo[]> {
        try {
            return await Knex<Acesso>(ETabela.acessos)
                .where({ linkId })
                .select('referrer as campo')
                .count('id as acessos')
                .groupBy('referrer')
                .orderBy('acessos', 'desc');
        }
        catch (erro: any) {
            logger.error({ linkId }, 'Erro ao contar acessos por referrer');
            throw erro;
        }
    }

    async contarPorPais(linkId: number): Promise<ContagemPorCampo[]> {
        try {
            return await Knex<Acesso>(ETabela.acessos)
                .where({ linkId })
                .select('pais as campo')
                .count('id as acessos')
                .groupBy('pais')
                .orderBy('acessos', 'desc');
        }
        catch (erro: any) {
            logger.error({ linkId }, 'Erro ao contar acessos por país');
            throw erro;
        }
    }

    async contarPorCidade(linkId: number): Promise<ContagemCidade[]> {
        try {
            const resultados = await Knex(ETabela.acessos)
                .where({ linkId })
                .select('cidade', 'pais')
                .count('id as acessos')
                .groupBy('cidade', 'pais')
                .orderBy('acessos', 'desc');

            return resultados.map((r: any) => ({
                cidade: r.cidade,
                pais: r.pais,
                acessos: Number(r.acessos)
            }));
        }
        catch (erro: any) {
            logger.error({ linkId }, 'Erro ao contar acessos por cidade');
            throw erro;
        }
    }
}


export { AcessoRepository };

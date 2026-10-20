import { ETabela } from '../enums';
import { Knex } from '../config/knex';
import { injectable } from 'inversify';
import { logger } from '../config/Logger';
import { Acesso, CadastrarAcessoDto } from '../models';
import {
    ContagemCidade,
    ContagemPorCampo,
    IAcessoRepository,
    RegistroAcessoDiario,
    ResumoFingerprint
} from '../interfaces/repositories/IAcessoRepository';

@injectable()
class AcessoRepository implements IAcessoRepository {
    async obterFingerprint(linkId: number): Promise<ResumoFingerprint> {
        // Agrega todo o histórico no SQLite, independentemente dos 100 eventos recentes.
        const resumo = await Knex(ETabela.acessos)
            .where({ linkId })
            .countDistinct('hashDispositivo as hashesDistintos')
            .count('hashDispositivo as acessosComHash')
            .first<{ hashesDistintos: number; acessosComHash: number }>();
        const grupos = (await Knex(ETabela.acessos)
            .where({ linkId })
            .whereNotNull('hashDispositivo')
            .select('hashDispositivo')
            .count('id as acessos')
            .min('criadoEm as primeiroAcesso')
            .max('criadoEm as ultimoAcesso')
            .groupBy('hashDispositivo')
            .orderBy('acessos', 'desc')
            .orderBy('hashDispositivo')
            .limit(20)) as unknown as ResumoFingerprint['grupos'];
        return {
            hashesDistintos: Number(resumo?.hashesDistintos) || 0,
            acessosComHash: Number(resumo?.acessosComHash) || 0,
            grupos: grupos.map((grupo) => ({ ...grupo, acessos: Number(grupo.acessos) }))
        };
    }

    async obterRecentes(linkId: number): Promise<Acesso[]> {
        // Lista explícita mantém campos legados de campanha fora da API.
        return Knex<Acesso>(ETabela.acessos)
            .select(
                'lat',
                'lon',
                'accuracy',
                'altitude',
                'heading',
                'speed',
                'positionTimestamp',
                'geo_status',
                'sessionUid',
                'id',
                'linkId',
                'ip',
                'navegador',
                'sistemaOperacional',
                'dispositivo',
                'referrer',
                'pais',
                'cidade',
                'criadoEm',
                'userAgent',
                'idioma',
                'versaoNavegador',
                'versaoSistemaOperacional',
                'metodo',
                'caminho',
                'clientHints',
                'fetchSite',
                'fetchMode',
                'fetchDest',
                'dnt',
                'gpc',
                'hashDispositivo',
                'accept',
                'acceptEncoding',
                'versaoHttp',
                'clientHintsMobile',
                'clientHintsPlataforma',
                'clientHintsVersaoPlataforma',
                'clientHintsArquitetura',
                'clientHintsModelo',
                'clientHintsVersaoCompleta',
                'fetchUser',
                'purpose',
                'secPurpose',
                'saveData'
            )
            .where({ linkId })
            .orderBy('id', 'desc')
            .limit(100);
    }

    async cadastrar(cadastrarAcessoDto: CadastrarAcessoDto): Promise<void> {
        try {
            await Knex.transaction(async (transacao) => {
                await transacao<Acesso>(ETabela.acessos).insert(cadastrarAcessoDto);
                const alterados = await transacao(ETabela.links)
                    .where({ id: cadastrarAcessoDto.linkId })
                    .increment('acessos', 1);
                if (alterados !== 1) {
                    throw new Error('Link não encontrado ao registrar acesso');
                }
            });
        } catch (erro) {
            logger.error({ linkId: cadastrarAcessoDto.linkId }, 'Erro ao registrar acesso');
            throw erro;
        }
    }

    async contarTotalPorLinkId(linkId: number): Promise<number> {
        try {
            const resultado = await Knex(ETabela.acessos)
                .where({ linkId })
                .count('id as total')
                .first<{ total: number }>();

            return Number(resultado?.total) || 0;
        } catch (erro) {
            logger.error({ linkId }, 'Erro ao contar acessos totais');
            throw erro;
        }
    }

    async contarPorDia(linkId: number): Promise<RegistroAcessoDiario[]> {
        try {
            return await Knex<Acesso>(ETabela.acessos)
                .where({ linkId })
                .select(Knex.raw('date(criadoEm) as data'))
                .count('id as acessos')
                .groupBy(Knex.raw('date(criadoEm)'))
                .orderBy('data', 'desc');
        } catch (erro) {
            logger.error({ linkId }, 'Erro ao contar acessos por dia');
            throw erro;
        }
    }

    async contarPorNavegador(linkId: number): Promise<ContagemPorCampo[]> {
        return this.contarPorCampo(linkId, 'navegador', 'Erro ao contar acessos por navegador');
    }

    async contarPorSistemaOperacional(linkId: number): Promise<ContagemPorCampo[]> {
        return this.contarPorCampo(linkId, 'sistemaOperacional', 'Erro ao contar acessos por SO');
    }

    async contarPorDispositivo(linkId: number): Promise<ContagemPorCampo[]> {
        return this.contarPorCampo(linkId, 'dispositivo', 'Erro ao contar acessos por dispositivo');
    }

    async contarPorReferrer(linkId: number): Promise<ContagemPorCampo[]> {
        return this.contarPorCampo(linkId, 'referrer', 'Erro ao contar acessos por referrer');
    }

    async contarPorPais(linkId: number): Promise<ContagemPorCampo[]> {
        return this.contarPorCampo(linkId, 'pais', 'Erro ao contar acessos por país');
    }

    async contarPorCidade(linkId: number): Promise<ContagemCidade[]> {
        try {
            const resultados = await Knex(ETabela.acessos)
                .where({ linkId })
                .select('cidade', 'pais')
                .count<ContagemCidade[]>('id as acessos')
                .groupBy('cidade', 'pais')
                .orderBy('acessos', 'desc');

            return resultados.map((resultado) => ({
                cidade: resultado.cidade,
                pais: resultado.pais,
                acessos: Number(resultado.acessos)
            }));
        } catch (erro) {
            logger.error({ linkId }, 'Erro ao contar acessos por cidade');
            throw erro;
        }
    }

    private async contarPorCampo(
        linkId: number,
        campo: 'navegador' | 'sistemaOperacional' | 'dispositivo' | 'referrer' | 'pais',
        mensagemErro: string
    ): Promise<ContagemPorCampo[]> {
        try {
            return await Knex<Acesso>(ETabela.acessos)
                .where({ linkId })
                .select(campo + ' as campo')
                .count('id as acessos')
                .groupBy(campo)
                .orderBy('acessos', 'desc');
        } catch (erro) {
            logger.error({ linkId }, mensagemErro);
            throw erro;
        }
    }
}

export { AcessoRepository };

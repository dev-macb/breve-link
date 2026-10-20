import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import { IAcessoRepository, IAcessoService, ILinkRepository, EstatisticasLink } from '../interfaces';


@injectable()
class AcessoService implements IAcessoService {
    constructor(
        @inject(TIPOS.IAcessoRepository)
        private readonly acessoRepository: IAcessoRepository,
        @inject(TIPOS.ILinkRepository)
        private readonly linkRepository: ILinkRepository
    ) {}

    async obterEstatisticas(linkId: number): Promise<EstatisticasLink | null> {
        const link = await this.linkRepository.obterPorId(linkId);
        if (!link) {
            return null;
        }

        const totalAcessos = await this.acessoRepository.contarTotalPorLinkId(linkId);
        const acessosPorDia = await this.acessoRepository.contarPorDia(linkId);
        const navegadores = await this.acessoRepository.contarPorNavegador(linkId);
        const sistemasOperacionais = await this.acessoRepository.contarPorSistemaOperacional(linkId);
        const tipos = await this.acessoRepository.contarPorDispositivo(linkId);
        const referrers = await this.acessoRepository.contarPorReferrer(linkId);
        const paises = await this.acessoRepository.contarPorPais(linkId);
        const cidades = await this.acessoRepository.contarPorCidade(linkId);

        return {
            link: {
                id: link.id,
                urlOriginal: link.urlOriginal,
                urlCurta: link.urlCurta,
                criadoEm: link.criadoEm
            },
            totalAcessos,
            acessosPorDia,
            dispositivos: {
                navegadores: navegadores.map(n => ({
                    nome: n.campo || 'Desconhecido',
                    acessos: n.acessos,
                    percentual: totalAcessos > 0 ? Math.round((n.acessos / totalAcessos) * 1000) / 10 : 0
                })),
                sistemasOperacionais: sistemasOperacionais.map(s => ({
                    nome: s.campo || 'Desconhecido',
                    acessos: s.acessos,
                    percentual: totalAcessos > 0 ? Math.round((s.acessos / totalAcessos) * 1000) / 10 : 0
                })),
                tipos: tipos.map(t => ({
                    tipo: t.campo || 'desktop',
                    acessos: t.acessos,
                    percentual: totalAcessos > 0 ? Math.round((t.acessos / totalAcessos) * 1000) / 10 : 0
                }))
            },
            referrers: referrers.map(r => ({
                origem: r.campo || 'Direto',
                acessos: r.acessos,
                percentual: totalAcessos > 0 ? Math.round((r.acessos / totalAcessos) * 1000) / 10 : 0
            })),
            localizacao: {
                paises: paises.map(p => ({
                    pais: p.campo || 'Desconhecido',
                    acessos: p.acessos,
                    percentual: totalAcessos > 0 ? Math.round((p.acessos / totalAcessos) * 1000) / 10 : 0
                })),
                cidades: cidades.map(c => ({
                    cidade: c.cidade || 'Desconhecida',
                    pais: c.pais || 'Desconhecido',
                    acessos: c.acessos,
                    percentual: totalAcessos > 0 ? Math.round((c.acessos / totalAcessos) * 1000) / 10 : 0
                }))
            }
        };
    }
}


export { AcessoService };

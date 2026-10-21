import { GeolocalizacaoService } from './GeolocalizacaoService';
import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import {
    IAcessoRepository,
    IAcessoService,
    ILinkRepository,
    EstatisticasLink
} from '../interfaces';

function percentualAcessos(acessos: number, total: number): number {
    return total > 0 ? Math.round((acessos / total) * 1000) / 10 : 0;
}

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
        const sistemasOperacionais =
            await this.acessoRepository.contarPorSistemaOperacional(linkId);
        const tipos = await this.acessoRepository.contarPorDispositivo(linkId);
        const referrers = await this.acessoRepository.contarPorReferrer(linkId);
        const paises = await this.acessoRepository.contarPorPais(linkId);
        const cidades = await this.acessoRepository.contarPorCidade(linkId);
        const fingerprint = await this.acessoRepository.obterFingerprint(linkId);

        return {
            geolocalizacao: await GeolocalizacaoService.estatisticas(linkId),
            fingerprint,
            acessosRecentes: await this.acessoRepository.obterRecentes(linkId),
            link: {
                id: link.id,
                urlOriginal: link.urlOriginal,
                urlCurta: link.urlCurta,
                criadoEm: link.criadoEm
            },
            totalAcessos,
            acessosPorDia,
            dispositivos: {
                navegadores: navegadores.map((navegador) => ({
                    nome: navegador.campo || 'Desconhecido',
                    acessos: navegador.acessos,
                    percentual: percentualAcessos(navegador.acessos, totalAcessos)
                })),
                sistemasOperacionais: sistemasOperacionais.map((sistema) => ({
                    nome: sistema.campo || 'Desconhecido',
                    acessos: sistema.acessos,
                    percentual: percentualAcessos(sistema.acessos, totalAcessos)
                })),
                tipos: tipos.map((dispositivo) => ({
                    tipo: dispositivo.campo || 'desktop',
                    acessos: dispositivo.acessos,
                    percentual: percentualAcessos(dispositivo.acessos, totalAcessos)
                }))
            },
            referrers: referrers.map((referrer) => ({
                origem: referrer.campo || 'Direto',
                acessos: referrer.acessos,
                percentual: percentualAcessos(referrer.acessos, totalAcessos)
            })),
            localizacao: {
                paises: paises.map((pais) => ({
                    pais: pais.campo || 'Desconhecido',
                    acessos: pais.acessos,
                    percentual: percentualAcessos(pais.acessos, totalAcessos)
                })),
                cidades: cidades.map((cidade) => ({
                    cidade: cidade.cidade || 'Desconhecida',
                    pais: cidade.pais || 'Desconhecido',
                    acessos: cidade.acessos,
                    percentual: percentualAcessos(cidade.acessos, totalAcessos)
                }))
            }
        };
    }
}

export { AcessoService };

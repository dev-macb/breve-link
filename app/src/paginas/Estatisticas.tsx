import { useEstatisticas } from '../funcionalidades/estatisticas/useEstatisticas';
import { Distribuicao } from '../funcionalidades/estatisticas/Distribuicao';
import { EventosAcesso } from '../funcionalidades/estatisticas/EventosAcesso';
import { GraficoTrafego } from '../funcionalidades/estatisticas/GraficoTrafego';
import { ResumoGeolocalizacao } from '../funcionalidades/estatisticas/ResumoGeolocalizacao';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowUpRight,
    Copy,
    Globe2,
    Laptop,
    Link2,
    Monitor,
    Smartphone,
    RefreshCw
} from 'lucide-react';
import { useSessao } from '../app/Sessao';
import { useAviso } from '../app/Avisos';
import { Carregando, Falha, NaoEncontrado } from '../componentes/Comuns';
import { dataCurta, enderecoCurto, nomePais, numero, serieDiaria } from '../utils/formatar';
import { Fingerprints } from '../componentes/Fingerprints';

export function EstatisticasPagina() {
    const { id = '' } = useParams();
    const { origemPublica } = useSessao();
    const aviso = useAviso();
    const [versao, setVersao] = useState(0);
    const { dados, erro, ausente, carregando, valido } = useEstatisticas(id, versao);
    if (!valido || ausente) {
        return <NaoEncontrado integrada />;
    }
    if (carregando) {
        return <Carregando texto="Lendo registros…" />;
    }
    if (erro || !dados) {
        return (
            <Falha
                texto={erro || 'Estatísticas indisponíveis.'}
                tentar={() => setVersao(versao + 1)}
            />
        );
    }
    const serie = serieDiaria(dados.acessosPorDia);
    const totalPeriodo = serie.reduce((soma, dia) => soma + dia.acessos, 0);
    const paises = dados.localizacao.paises.filter((pais) => pais.pais !== 'Desconhecido').length;
    async function copiar() {
        try {
            await navigator.clipboard.writeText(enderecoCurto(origemPublica, dados!.link.urlCurta));
            aviso('Link copiado.');
        } catch {
            aviso('Não foi possível copiar. Selecione o endereço para copiá-lo manualmente.', true);
        }
    }
    return (
        <div className="access-console">
            <Link className="back-link" to="/dashboard">
                <ArrowLeft size={15} />
                ../links
            </Link>
            <header className="page-heading stats-heading">
                <div>
                    <span className="eyebrow">BREVE / ACCESS LOG</span>
                    <h1>
                        <span className="console-prompt">&gt;_</span> acessos
                    </h1>
                </div>
                <div className="console-actions">
                    <button className="button secondary" onClick={() => setVersao(versao + 1)}>
                        <RefreshCw size={14} />
                        Atualizar
                    </button>
                    <button
                        className="button secondary"
                        onClick={() => {
                            void copiar();
                        }}
                    >
                        <Copy size={14} />
                        Copiar
                    </button>
                </div>
            </header>
            <div className="stats-link-strip">
                <span className="link-tile">
                    <Link2 size={20} />
                </span>
                <div>
                    <a
                        href={enderecoCurto(origemPublica, dados.link.urlCurta)}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {origemPublica.replace(/^https?:\/\//, '')}
                        <strong>/{dados.link.urlCurta}</strong>
                        <ArrowUpRight size={14} />
                    </a>
                    <span>{dados.link.urlOriginal}</span>
                </div>
                <small>Criado em {dataCurta(dados.link.criadoEm)}</small>
            </div>
            <section className="console-counters" aria-label="Resumo dos acessos">
                <div>
                    <span>ACESSOS / TOTAL</span>
                    <strong>{numero(dados.totalAcessos)}</strong>
                </div>
                <div>
                    <span>ACESSOS / 30D UTC</span>
                    <strong>{numero(totalPeriodo)}</strong>
                </div>
                <div>
                    <span>PAÍSES / IP</span>
                    <strong>{numero(paises)}</strong>
                </div>
                <div title="Hashes distintos de headers; não representam pessoas únicas.">
                    <span>HASHES / DISTINTOS</span>
                    <strong>{numero(dados.fingerprint.hashesDistintos)}</strong>
                </div>
            </section>
            <ResumoGeolocalizacao dados={dados.geolocalizacao} />
            <GraficoTrafego serie={serie} totalPeriodo={totalPeriodo} />
            <EventosAcesso acessos={dados.acessosRecentes} />
            <details className="console-section">
                <summary>03 / clientes e origens</summary>
                <div className="distributions">
                    <Distribuicao
                        titulo="Navegadores"
                        icone={Monitor}
                        itens={dados.dispositivos.navegadores}
                    />
                    <Distribuicao
                        titulo="Sistemas operacionais"
                        icone={Laptop}
                        itens={dados.dispositivos.sistemasOperacionais}
                    />
                    <Distribuicao
                        titulo="Dispositivos"
                        icone={Smartphone}
                        itens={dados.dispositivos.tipos.map((item) => ({
                            ...item,
                            nome:
                                (
                                    {
                                        desktop: 'Computador',
                                        mobile: 'Celular',
                                        tablet: 'Tablet'
                                    } as Record<string, string>
                                )[item.tipo] ?? item.tipo
                        }))}
                    />
                    <Distribuicao
                        titulo="Países"
                        icone={Globe2}
                        itens={dados.localizacao.paises.map((item) => ({
                            ...item,
                            nome: nomePais(item.pais)
                        }))}
                    />
                    <Distribuicao
                        titulo="Referers"
                        icone={ArrowUpRight}
                        itens={dados.referrers.map((item) => ({ ...item, nome: item.origem }))}
                    />
                </div>
            </details>
            <Fingerprints dados={dados.fingerprint} total={dados.totalAcessos} />
            <footer className="console-foot">
                UTC · inclui bots · hashes ≠ pessoas · geo por IP aproximada · hash em{' '}
                {numero(dados.fingerprint.acessosComHash)} acessos
            </footer>
        </div>
    );
}

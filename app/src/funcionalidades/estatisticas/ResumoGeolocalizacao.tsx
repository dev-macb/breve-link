import type { Estatisticas } from '../../tipos';
import { numero } from '../../utils/formatar';

export function ResumoGeolocalizacao({ dados }: { dados: Estatisticas['geolocalizacao'] }) {
    if (!dados) {
        return null;
    }
    return (
        <section className="chart-panel">
            <header>
                <h2>Localização do visitante</h2>
            </header>
            <p>
                {numero(dados.capturadas)} coordenadas capturadas · {dados.taxaAprovacao.toFixed(1)}
                % de aprovação
            </p>
            <p>Percentual sobre coletas recebidas, incluindo erros e navegadores sem suporte.</p>
            <details>
                <summary>Regiões aproximadas (células de 0,01 grau)</summary>
                {dados.clusters.map((c) => (
                    <p key={c.lat + ':' + c.lon}>
                        {c.lat}, {c.lon}: {numero(c.total)} acessos
                    </p>
                ))}
            </details>
        </section>
    );
}

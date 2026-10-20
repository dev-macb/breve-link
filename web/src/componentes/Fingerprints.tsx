import type { Estatisticas } from '../tipos';
import { dataApi, numero } from '../utils/formatar';

export function Fingerprints({ dados, total }: { dados: Estatisticas['fingerprint']; total: number }) {
    const horario = (valor: string) => dataApi(valor).toLocaleString('pt-BR', { timeZone: 'UTC' });
    return <section className="chart-panel">
        <header><h2>04 / fingerprints</h2><span className="muted-label">TOP 20 · UTC</span></header>
        <p className="console-foot">{numero(dados.hashesDistintos)} distintos · {numero(dados.acessosComHash)} de {numero(total)} acessos com hash</p>
        {!dados.grupos.length ? <p className="distribution-empty">Sem fingerprints.</p> : <div className="fingerprint-table-wrap"><table className="fingerprint-table" aria-label="Fingerprints por frequência">
            <thead><tr><th scope="col">SHA-256</th><th scope="col">Primeiro acesso</th><th scope="col">Último acesso</th><th scope="col">Acessos</th></tr></thead>
            <tbody>{dados.grupos.map(grupo => <tr key={grupo.hashDispositivo}>
                <td><code>{grupo.hashDispositivo}</code></td><td>{horario(grupo.primeiroAcesso)}</td><td>{horario(grupo.ultimoAcesso)}</td><td>{numero(grupo.acessos)}</td>
            </tr>)}</tbody>
        </table></div>}
    </section>;
}

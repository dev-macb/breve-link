import type { Estatisticas } from '../../tipos';
import { dataApi, nomePais } from '../../utils/formatar';
import { Fingerprints } from '../../componentes/Fingerprints';

export function EventosAcesso({
    acessos,
    fingerprint,
    total
}: {
    acessos: Estatisticas['acessosRecentes'];
    fingerprint: Estatisticas['fingerprint'];
    total: number;
}) {
    return (
        <section className="chart-panel console-log">
            <header>
                <h2>03 / eventos e fingerprints</h2>
                <span className="muted-label">ÚLTIMOS 100 · UTC</span>
            </header>
            {!acessos?.length ? (
                <p>Nenhum registro disponível.</p>
            ) : (
                acessos.map((acesso) => (
                    <details key={acesso.id} className="access-event">
                        <summary>
                            <time>
                                {dataApi(acesso.criadoEm).toLocaleString('pt-BR', {
                                    timeZone: 'UTC'
                                })}
                            </time>
                            <span className="event-ip">{acesso.ip || '—'}</span>
                            <span>
                                {acesso.navegador || '—'} {acesso.versaoNavegador}
                            </span>
                            <span className="event-location">
                                {acesso.pais || '—'} / {acesso.dispositivo || '—'}
                            </span>
                        </summary>
                        <dl>
                            <dt>Sistema</dt>
                            <dd>
                                {[acesso.sistemaOperacional, acesso.versaoSistemaOperacional]
                                    .filter(Boolean)
                                    .join(' ') || 'Desconhecido'}
                            </dd>
                            <dt>Dispositivo</dt>
                            <dd>{acesso.dispositivo || 'Desconhecido'}</dd>
                            <dt>Geo / IP</dt>
                            <dd>
                                {[acesso.cidade, acesso.pais && nomePais(acesso.pais)]
                                    .filter(Boolean)
                                    .join(' · ') || 'Não identificada'}
                            </dd>
                            <dt>Origem</dt>
                            <dd>{acesso.referrer || 'Não informada'}</dd>
                            <dt>Accept-Language</dt>
                            <dd>{acesso.idioma || 'Não informados'}</dd>
                            <dt>Fingerprint</dt>
                            <dd>
                                <code>{acesso.hashDispositivo || '—'}</code>
                            </dd>
                            <dt>Requisição</dt>
                            <dd>
                                {acesso.metodo || '—'} {acesso.caminho}
                            </dd>
                            <dt>Sec-CH-UA</dt>
                            <dd>{acesso.clientHints || '—'}</dd>
                            <dt>Accept</dt>
                            <dd>{acesso.accept || '—'}</dd>
                            <dt>Accept-Encoding</dt>
                            <dd>{acesso.acceptEncoding || '—'}</dd>
                            <dt>HTTP</dt>
                            <dd>{acesso.versaoHttp || '—'}</dd>
                            <dt>CH / Mobile</dt>
                            <dd>{acesso.clientHintsMobile || '—'}</dd>
                            <dt>CH / Plataforma</dt>
                            <dd>
                                {acesso.clientHintsPlataforma || '—'}{' '}
                                {acesso.clientHintsVersaoPlataforma}
                            </dd>
                            <dt>CH / Arquitetura</dt>
                            <dd>{acesso.clientHintsArquitetura || '—'}</dd>
                            <dt>CH / Modelo</dt>
                            <dd>{acesso.clientHintsModelo || '—'}</dd>
                            <dt>CH / Versões</dt>
                            <dd>{acesso.clientHintsVersaoCompleta || '—'}</dd>
                            <dt>Sec-Fetch</dt>
                            <dd>
                                {[acesso.fetchSite, acesso.fetchMode, acesso.fetchDest]
                                    .filter(Boolean)
                                    .join(' / ') || '—'}
                            </dd>
                            <dt>Sec-Fetch-User</dt>
                            <dd>{acesso.fetchUser || '—'}</dd>
                            <dt>Purpose</dt>
                            <dd>{acesso.purpose || '—'}</dd>
                            <dt>Sec-Purpose</dt>
                            <dd>{acesso.secPurpose || '—'}</dd>
                            <dt>Save-Data</dt>
                            <dd>{acesso.saveData || '—'}</dd>
                            <dt>DNT / GPC</dt>
                            <dd>
                                {acesso.dnt || '—'} / {acesso.gpc || '—'}
                            </dd>
                            <dt>User-Agent</dt>
                            <dd>{acesso.userAgent || 'Não informado'}</dd>
                        </dl>
                    </details>
                ))
            )}
            <Fingerprints dados={fingerprint} total={total} />
        </section>
    );
}

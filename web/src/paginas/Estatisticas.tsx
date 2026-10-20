import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft, ArrowUpRight, Copy, Globe2, Laptop, Link2, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSessao } from '../app/Sessao';
import { useAviso } from '../app/Avisos';
import { Carregando, Falha, NaoEncontrado } from '../componentes/Comuns';
import { ErroHttp, http, mensagemErro } from '../services/http';
import { dataApi, dataCurta, enderecoCurto, nomePais, numero, serieDiaria } from '../utils/formatar';
import type { Estatisticas } from '../tipos';
import { Fingerprints } from '../componentes/Fingerprints';

function Distribuicao({ titulo, icone: Icone, itens }: { titulo: string; icone: LucideIcon; itens: { nome: string; acessos: number; percentual: number }[] }) {
    const [expandido, setExpandido] = useState(false);
    const visiveis = expandido ? itens : itens.slice(0, 5);
    return <section className="distribution-card"><header><h2><Icone size={16} />{titulo}</h2><span className="muted-label">ACESSOS</span></header>{!itens.length ? <p className="distribution-empty">Sem dados.</p> : <div className="distribution-list">{visiveis.map((item, indice) => <div className="distribution-item" key={item.nome + indice}><div className="distribution-label"><span title={item.nome}>{item.nome}</span><strong>{numero(Number(item.acessos))} <small>{item.percentual.toLocaleString('pt-BR')}%</small></strong></div><div className="distribution-track"><span style={{ width: Math.min(100, Math.max(0, item.percentual)) + '%' }} /></div></div>)}</div>}{itens.length > 5 && <button className="text-button" onClick={() => setExpandido(!expandido)}>{expandido ? 'Mostrar menos' : 'Ver todos (' + itens.length + ')'}</button>}</section>;
}
export function EstatisticasPagina() {
    const { id = '' } = useParams();
    const valido = /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
    const { origemPublica } = useSessao();
    const aviso = useAviso();
    const [dados, setDados] = useState<Estatisticas | null>(null);
    const [erro, setErro] = useState('');
    const [ausente, setAusente] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [versao, setVersao] = useState(0);
    useEffect(() => {
        if (!valido) return;
        const controle = new AbortController();
        setCarregando(true); setErro(''); setAusente(false); setDados(null);
        http<Estatisticas>('/links/' + id + '/stats', { signal: controle.signal })
            .then(resultado => { if (!controle.signal.aborted) setDados(resultado); })
            .catch(causa => { if (controle.signal.aborted) return; if (causa instanceof ErroHttp && causa.status === 404) setAusente(true); else setErro(mensagemErro(causa)); })
            .finally(() => { if (!controle.signal.aborted) setCarregando(false); });
        return () => controle.abort();
    }, [id, valido, versao]);
    if (!valido || ausente) return <NaoEncontrado integrada />;
    if (carregando) return <Carregando texto="Lendo registros…" />;
    if (erro || !dados) return <Falha texto={erro || 'Estatísticas indisponíveis.'} tentar={() => setVersao(versao + 1)} />;
    const serie = serieDiaria(dados.acessosPorDia);
    const totalPeriodo = serie.reduce((soma, dia) => soma + dia.acessos, 0);
    const paises = dados.localizacao.paises.filter(pais => pais.pais !== 'Desconhecido').length;
    async function copiar() {
        try { await navigator.clipboard.writeText(enderecoCurto(origemPublica, dados!.link.urlCurta)); aviso('Link copiado.'); }
        catch { aviso('Não foi possível copiar. Selecione o endereço para copiá-lo manualmente.', true); }
    }
    return <div className="access-console">
        <Link className="back-link" to="/dashboard"><ArrowLeft size={15} />../links</Link>
        <header className="page-heading stats-heading"><div><span className="eyebrow">BREVE / ACCESS LOG</span><h1><span className="console-prompt">&gt;_</span> acessos</h1></div><div className="console-actions"><button className="button secondary" onClick={() => setVersao(versao + 1)}><RefreshCw size={14} />Atualizar</button><button className="button secondary" onClick={() => { void copiar(); }}><Copy size={14} />Copiar</button></div></header>
        <div className="stats-link-strip"><span className="link-tile"><Link2 size={20} /></span><div><a href={enderecoCurto(origemPublica, dados.link.urlCurta)} target="_blank" rel="noreferrer">{origemPublica.replace(/^https?:\/\//, '')}<strong>/{dados.link.urlCurta}</strong><ArrowUpRight size={14} /></a><span>{dados.link.urlOriginal}</span></div><small>Criado em {dataCurta(dados.link.criadoEm)}</small></div>
        <section className="console-counters" aria-label="Resumo dos acessos">
            <div><span>ACESSOS / TOTAL</span><strong>{numero(dados.totalAcessos)}</strong></div>
            <div><span>ACESSOS / 30D UTC</span><strong>{numero(totalPeriodo)}</strong></div>
            <div><span>PAÍSES / IP</span><strong>{numero(paises)}</strong></div>
            <div title="Hashes distintos de headers; não representam pessoas únicas."><span>HASHES / DISTINTOS</span><strong>{numero(dados.fingerprint.hashesDistintos)}</strong></div>
        </section>
        <section className="chart-panel"><header><h2>01 / tráfego</h2><span className="muted-label">30 DIAS · UTC</span></header><div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}><AreaChart data={serie} margin={{ top: 18, right: 12, left: -25, bottom: 2 }}><defs><linearGradient id="acessos-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--chart)" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="4 5" vertical={false} /><XAxis dataKey="rotulo" minTickGap={30} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} dy={12} /><YAxis allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 0, color: 'var(--text)', fontSize: 12 }} formatter={valor => [numero(Number(valor)), 'Acessos']} /><Area type="stepAfter" dataKey="acessos" stroke="var(--chart)" strokeWidth={2.5} fill="url(#acessos-gradient)" isAnimationActive={false} /></AreaChart></ResponsiveContainer>
        </div>{totalPeriodo === 0 && <p className="chart-empty">Sem eventos no período.</p>}</section>
        <section className="chart-panel console-log"><header><h2>02 / eventos</h2><span className="muted-label">ÚLTIMOS 100 · UTC</span></header>
            {!dados.acessosRecentes?.length ? <p>Nenhum registro disponível.</p> : dados.acessosRecentes.map(acesso => <details key={acesso.id} className="access-event">
                <summary><time>{dataApi(acesso.criadoEm).toLocaleString('pt-BR', { timeZone: 'UTC' })}</time><span className="event-ip">{acesso.ip || '—'}</span><span>{acesso.navegador || '—'} {acesso.versaoNavegador}</span><span className="event-location">{acesso.pais || '—'} / {acesso.dispositivo || '—'}</span></summary>
                <dl><dt>Sistema</dt><dd>{[acesso.sistemaOperacional, acesso.versaoSistemaOperacional].filter(Boolean).join(' ') || 'Desconhecido'}</dd>
                    <dt>Dispositivo</dt><dd>{acesso.dispositivo || 'Desconhecido'}</dd>
                    <dt>Geo / IP</dt><dd>{[acesso.cidade, acesso.pais && nomePais(acesso.pais)].filter(Boolean).join(' · ') || 'Não identificada'}</dd>
                    <dt>Origem</dt><dd>{acesso.referrer || 'Não informada'}</dd>
                    <dt>Accept-Language</dt><dd>{acesso.idioma || 'Não informados'}</dd>
                    <dt>Fingerprint</dt><dd><code>{acesso.hashDispositivo || '—'}</code></dd>
                    <dt>Requisição</dt><dd>{acesso.metodo || '—'} {acesso.caminho}</dd>
                    <dt>Sec-CH-UA</dt><dd>{acesso.clientHints || '—'}</dd>
                    <dt>Sec-Fetch</dt><dd>{[acesso.fetchSite, acesso.fetchMode, acesso.fetchDest].filter(Boolean).join(' / ') || '—'}</dd>
                    <dt>DNT / GPC</dt><dd>{acesso.dnt || '—'} / {acesso.gpc || '—'}</dd>
                    <dt>User-Agent</dt><dd>{acesso.userAgent || 'Não informado'}</dd></dl>
            </details>)}
        </section>
        <details className="console-section"><summary>03 / clientes e origens</summary><div className="distributions"><Distribuicao titulo="Navegadores" icone={Monitor} itens={dados.dispositivos.navegadores} /><Distribuicao titulo="Sistemas operacionais" icone={Laptop} itens={dados.dispositivos.sistemasOperacionais} /><Distribuicao titulo="Dispositivos" icone={Smartphone} itens={dados.dispositivos.tipos.map(item => ({ ...item, nome: ({ desktop: 'Computador', mobile: 'Celular', tablet: 'Tablet' } as Record<string, string>)[item.tipo] ?? item.tipo }))} /><Distribuicao titulo="Países" icone={Globe2} itens={dados.localizacao.paises.map(item => ({ ...item, nome: nomePais(item.pais) }))} /><Distribuicao titulo="Referers" icone={ArrowUpRight} itens={dados.referrers.map(item => ({ ...item, nome: item.origem }))} /></div></details>
        <Fingerprints dados={dados.fingerprint} total={dados.totalAcessos} />
        <footer className="console-foot">UTC · inclui bots · hashes ≠ pessoas · geo por IP aproximada · hash em {numero(dados.fingerprint.acessosComHash)} acessos</footer>
    </div>;
}

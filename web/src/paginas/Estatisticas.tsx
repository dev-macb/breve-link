import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft, ArrowUpRight, BarChart3, Copy, MousePointerClick, Globe2, Laptop, Link2, Monitor, Smartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSessao } from '../app/Sessao';
import { useAviso } from '../app/Avisos';
import { Carregando, Falha, NaoEncontrado } from '../componentes/Comuns';
import { ErroHttp, http, mensagemErro } from '../services/http';
import { dataCurta, enderecoCurto, nomePais, numero, serieDiaria } from '../utils/formatar';
import type { Estatisticas } from '../tipos';

function Distribuicao({ titulo, icone: Icone, itens }: { titulo: string; icone: LucideIcon; itens: { nome: string; acessos: number; percentual: number }[] }) {
    const [expandido, setExpandido] = useState(false);
    const visiveis = expandido ? itens : itens.slice(0, 5);
    return <section className="distribution-card"><header><h2><Icone size={16} />{titulo}</h2><span className="muted-label">ACESSOS</span></header>{!itens.length ? <p className="distribution-empty">Os dados aparecerão após os primeiros acessos.</p> : <div className="distribution-list">{visiveis.map((item, indice) => <div className="distribution-item" key={item.nome + indice}><div className="distribution-label"><span title={item.nome}>{item.nome}</span><strong>{numero(Number(item.acessos))} <small>{item.percentual.toLocaleString('pt-BR')}%</small></strong></div><div className="distribution-track"><span style={{ width: Math.min(100, Math.max(0, item.percentual)) + '%' }} /></div></div>)}</div>}{itens.length > 5 && <button className="text-button" onClick={() => setExpandido(!expandido)}>{expandido ? 'Mostrar menos' : 'Ver todos (' + itens.length + ')'}</button>}</section>;
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
    if (carregando) return <Carregando texto="Reunindo suas estatísticas…" />;
    if (erro || !dados) return <Falha texto={erro || 'Estatísticas indisponíveis.'} tentar={() => setVersao(versao + 1)} />;
    const serie = serieDiaria(dados.acessosPorDia);
    const totalPeriodo = serie.reduce((soma, dia) => soma + dia.acessos, 0);
    const paises = dados.localizacao.paises.filter(pais => pais.pais !== 'Desconhecido').length;
    async function copiar() {
        try { await navigator.clipboard.writeText(enderecoCurto(origemPublica, dados!.link.urlCurta)); aviso('Link copiado.'); }
        catch { aviso('Não foi possível copiar. Selecione o endereço para copiá-lo manualmente.', true); }
    }
    return <>
        <Link className="back-link" to="/dashboard"><ArrowLeft size={15} />Voltar aos meus links</Link>
        <header className="page-heading stats-heading"><div><span className="eyebrow">// REGISTRO DE ACESSOS</span><h1>Estatísticas<span className="heading-dot">.</span></h1><p>Movimento registrado neste endereço.</p></div><button className="button secondary" onClick={() => { void copiar(); }}><Copy size={16} />Copiar link</button></header>
        <div className="stats-link-strip"><span className="link-tile"><Link2 size={20} /></span><div><a href={enderecoCurto(origemPublica, dados.link.urlCurta)} target="_blank" rel="noreferrer">{origemPublica.replace(/^https?:\/\//, '')}<strong>/{dados.link.urlCurta}</strong><ArrowUpRight size={14} /></a><span>{dados.link.urlOriginal}</span></div><small>Criado em {dataCurta(dados.link.criadoEm)}</small></div>
        <section className="metrics" aria-label="Resumo dos acessos"><div className="metric-card"><div className="metric-label">Total de acessos<span className="metric-icon lime"><MousePointerClick size={18} /></span></div><strong>{numero(dados.totalAcessos)}</strong><span className="metric-foot">Todo o histórico deste link</span></div><div className="metric-card"><div className="metric-label">Últimos 30 dias<span className="metric-icon blue"><BarChart3 size={18} /></span></div><strong>{numero(totalPeriodo)}</strong><span className="metric-foot">Inclui o dia de hoje · UTC</span></div><div className="metric-card"><div className="metric-label">Países identificados<span className="metric-icon peach"><Globe2 size={18} /></span></div><strong>{numero(paises)}</strong><span className="metric-foot">Todo o histórico · localização aproximada</span></div></section>
        <section className="chart-panel"><header><div><h2>Acessos por dia</h2><p>Contagem diária em UTC.</p></div><span className="period-badge"><span className="tiny-dot" /> Últimos 30 dias · UTC</span></header><div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}><AreaChart data={serie} margin={{ top: 18, right: 12, left: -25, bottom: 2 }}><defs><linearGradient id="acessos-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--chart)" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="4 5" vertical={false} /><XAxis dataKey="rotulo" minTickGap={30} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} dy={12} /><YAxis allowDecimals={false} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 0, color: 'var(--text)', fontSize: 12 }} formatter={valor => [numero(Number(valor)), 'Acessos']} /><Area type="stepAfter" dataKey="acessos" stroke="var(--chart)" strokeWidth={2.5} fill="url(#acessos-gradient)" isAnimationActive={false} /></AreaChart></ResponsiveContainer>
        </div>{totalPeriodo === 0 && <p className="chart-empty">Nenhum acesso nos últimos 30 dias. Compartilhe seu link para começar.</p>}</section>
        <div className="distributions"><Distribuicao titulo="Navegadores" icone={Monitor} itens={dados.dispositivos.navegadores} /><Distribuicao titulo="Sistemas operacionais" icone={Laptop} itens={dados.dispositivos.sistemasOperacionais} /><Distribuicao titulo="Dispositivos" icone={Smartphone} itens={dados.dispositivos.tipos.map(item => ({ ...item, nome: ({ desktop: 'Computador', mobile: 'Celular', tablet: 'Tablet' } as Record<string, string>)[item.tipo] ?? item.tipo }))} /><Distribuicao titulo="Países" icone={Globe2} itens={dados.localizacao.paises.map(item => ({ ...item, nome: nomePais(item.pais) }))} /><Distribuicao titulo="De onde vêm os acessos" icone={ArrowUpRight} itens={dados.referrers.map(item => ({ ...item, nome: item.origem }))} /></div>
        <p className="stats-note">As distribuições consideram todo o histórico. Acessos incluem requisições de robôs e não representam pessoas únicas. A localização pode não ser identificada.</p>
    </>;
}

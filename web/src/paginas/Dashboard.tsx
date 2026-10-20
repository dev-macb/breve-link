import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BarChart3, Check, ChevronLeft, ChevronRight, Copy, MousePointerClick, Link2, Loader2, Pencil, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { useSessao } from '../app/Sessao';
import { useAviso } from '../app/Avisos';
import { Carregando, Falha, Modal } from '../componentes/Comuns';
import { FormularioLink } from '../funcionalidades/links/FormularioLink';
import { http, mensagemErro } from '../services/http';
import { dataCurta, dominio, enderecoCurto, estadoLink, numero } from '../utils/formatar';
import type { LinkCurto, Pagina } from '../tipos';

export function Dashboard() {
    const { origemPublica } = useSessao();
    const aviso = useAviso();
    const [dados, setDados] = useState<Pagina<LinkCurto> | null>(null);
    const [busca, setBusca] = useState('');
    const [filtro, setFiltro] = useState('');
    const [pagina, setPagina] = useState(1);
    const [limite, setLimite] = useState(10);
    const [versao, setVersao] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [editando, setEditando] = useState<LinkCurto | null | undefined>();
    const [excluindo, setExcluindo] = useState<LinkCurto | null>(null);
    const [removendo, setRemovendo] = useState(false);
    const [erroExcluir, setErroExcluir] = useState('');
    const [copiado, setCopiado] = useState<number | null>(null);
    useEffect(() => {
        const tempo = setTimeout(() => { setFiltro(busca.trim()); setPagina(1); }, 300);
        return () => clearTimeout(tempo);
    }, [busca]);
    useEffect(() => {
        const controle = new AbortController();
        setCarregando(true); setErro('');
        const consulta = new URLSearchParams({ pagina: String(pagina), limite: String(limite), filtro });
        http<Pagina<LinkCurto>>('/links?' + consulta, { signal: controle.signal })
            .then(resultado => { if (!controle.signal.aborted) setDados(resultado); })
            .catch(causa => { if (!controle.signal.aborted) setErro(mensagemErro(causa)); })
            .finally(() => { if (!controle.signal.aborted) setCarregando(false); });
        return () => controle.abort();
    }, [pagina, limite, filtro, versao]);
    useEffect(() => { if (copiado == null) return; const tempo = setTimeout(() => setCopiado(null), 2000); return () => clearTimeout(tempo); }, [copiado]);
    const links = dados?.itens ?? [];
    const ativos = links.filter(link => estadoLink(link) === 'Ativo').length;
    const acessos = links.reduce((soma, link) => soma + Number(link.acessos), 0);
    async function copiar(link: LinkCurto) {
        try { await navigator.clipboard.writeText(enderecoCurto(origemPublica, link.urlCurta)); setCopiado(link.id); aviso('Link copiado.'); }
        catch { aviso('Não foi possível copiar. Selecione o endereço do link e copie manualmente.', true); }
    }
    async function remover() {
        if (!excluindo) return;
        setRemovendo(true); setErroExcluir('');
        try {
            await http('/links/' + excluindo.id, { method: 'DELETE' });
            setExcluindo(null); aviso('Link excluído.');
            if (links.length === 1 && pagina > 1) setPagina(pagina - 1); else setVersao(versao + 1);
        } catch (causa) { setErroExcluir(mensagemErro(causa)); }
        finally { setRemovendo(false); }
    }
    function salvo() { aviso(editando ? 'Link atualizado.' : 'Link criado.'); setEditando(undefined); setVersao(versao + 1); }
    return <>
        <header className="page-heading"><div><span className="eyebrow">// ARQUIVO DE ENDEREÇOS</span><h1>Meus links<span className="heading-dot">.</span></h1><p>Destinos, estado e acessos.</p></div><button className="button primary" onClick={() => setEditando(null)}><Plus size={18} /> Criar link</button></header>
        <section className="metrics" aria-label="Resumo dos links">
            <div className="metric-card"><div className="metric-label">{filtro ? 'Links encontrados' : 'Links cadastrados'}<span className="metric-icon lime"><Link2 size={18} /></span></div><strong>{carregando || erro ? '—' : numero(dados?.total ?? 0)}</strong><span className="metric-foot">{filtro ? 'Correspondentes à sua busca' : 'Total de registros'}</span></div>
            <div className="metric-card"><div className="metric-label">Ativos nesta página<span className="metric-icon blue"><ShieldCheck size={18} /></span></div><strong>{carregando || erro ? '—' : numero(ativos)}</strong><span className="metric-foot"><span className="tiny-dot" /> Prontos para compartilhar</span></div>
            <div className="metric-card"><div className="metric-label">Acessos nesta página<span className="metric-icon peach"><MousePointerClick size={18} /></span></div><strong>{carregando || erro ? '—' : numero(acessos)}</strong><span className="metric-foot">Soma dos acessos dos links exibidos</span></div>
        </section>
        <section className="links-panel">
            <div className="panel-toolbar"><div className="panel-title"><h2>Índice de links</h2><span className="count-badge">{dados?.total ?? 0}</span></div><div className="search-field"><Search size={16} /><input aria-label="Buscar links" type="search" placeholder="Buscar link ou destino…" value={busca} onChange={e => setBusca(e.target.value)} /></div></div>
            {erro ? <Falha texto={erro} tentar={() => setVersao(versao + 1)} /> : carregando ? <Carregando texto="Buscando seus links…" /> : links.length === 0 ? <div className="empty-state"><span className="empty-icon"><Link2 size={30} /></span><h2>{filtro ? 'Nenhum link por aqui.' : 'O arquivo está vazio.'}</h2><p>{filtro ? 'Tente buscar outro endereço ou nome de link.' : 'Cadastre um destino para começar.'}</p>{filtro ? <button className="button secondary" onClick={() => setBusca('')}>Limpar busca</button> : <button className="button primary" onClick={() => setEditando(null)}><Plus size={16} /> Criar meu primeiro link</button>}</div> :
                <><div className="links-table" role="table" aria-label="Links cadastrados"><div className="table-head" role="row"><span role="columnheader">LINK / DESTINO</span><span role="columnheader">STATUS</span><span role="columnheader">ACESSOS</span><span role="columnheader">CRIADO EM</span><span role="columnheader" className="align-right">AÇÕES</span></div>
                    {links.map(link => {
                        const estado = estadoLink(link);
                        return <div className="link-row" role="row" key={link.id}>
                            <div className="link-cell" role="cell"><span className="link-tile"><Link2 size={19} /></span><div className="link-address"><a href={enderecoCurto(origemPublica, link.urlCurta)} target="_blank" rel="noreferrer" title={enderecoCurto(origemPublica, link.urlCurta)}>{origemPublica.replace(/^https?:\/\//, '')}<strong>/{link.urlCurta}</strong><ArrowUpRight size={12} /></a><span title={link.urlOriginal}>{dominio(link.urlOriginal)}<span className="destination-path">{link.urlOriginal.replace(/^https?:\/\/[^/]+/, '')}</span></span></div></div>
                            <div role="cell"><span className={'status-badge ' + estado.toLowerCase()}><span />{estado}</span></div>
                            <div className="access-count" role="cell"><span className="sr-only">Acessos: </span><BarChart3 size={13} />{numero(Number(link.acessos))}</div>
                            <div className="created-date" role="cell">{dataCurta(link.criadoEm)}</div>
                            <div className="row-actions" role="cell"><button className={'icon-button ' + (copiado === link.id ? 'copied' : '')} onClick={() => { void copiar(link); }} title="Copiar link" aria-label={'Copiar link ' + link.urlCurta}>{copiado === link.id ? <Check size={16} /> : <Copy size={16} />}</button><Link className="icon-button" to={'/links/' + link.id} title="Ver estatísticas" aria-label={'Ver estatísticas de ' + link.urlCurta}><BarChart3 size={16} /></Link><button className="icon-button" onClick={() => setEditando(link)} title="Editar link" aria-label={'Editar link ' + link.urlCurta}><Pencil size={15} /></button><button className="icon-button danger-hover" onClick={() => { setExcluindo(link); setErroExcluir(''); }} title="Excluir link" aria-label={'Excluir link ' + link.urlCurta}><Trash2 size={15} /></button></div>
                        </div>;
                    })}
                </div><footer className="pagination"><span>Mostrando {(pagina - 1) * limite + 1}–{Math.min(pagina * limite, dados?.total ?? 0)} de {numero(dados?.total ?? 0)} links</span><div className="pagination-controls"><label>Por página <select value={limite} onChange={e => { setLimite(Number(e.target.value)); setPagina(1); }}><option>10</option><option>20</option><option>50</option></select></label><button className="icon-button bordered" aria-label="Página anterior" disabled={pagina <= 1} onClick={() => setPagina(pagina - 1)}><ChevronLeft size={16} /></button><span className="page-number">{pagina} <span>/ {dados?.totalPaginas ?? 1}</span></span><button className="icon-button bordered" aria-label="Próxima página" disabled={pagina >= (dados?.totalPaginas ?? 1)} onClick={() => setPagina(pagina + 1)}><ChevronRight size={16} /></button></div></footer></>}
        </section>
        <div className="dashboard-tip"><span><Link2 size={15} /> Nota:</span> O endereço e a expiração podem ser alterados ao editar o link.</div>
        {editando !== undefined && <FormularioLink key={editando?.id ?? 'novo'} link={editando} origem={origemPublica} fechar={() => setEditando(undefined)} salvo={salvo} />}
        {excluindo && <Modal titulo="Excluir este link?" descricao="O endereço deixará de redirecionar e suas estatísticas serão removidas. Esta ação não pode ser desfeita." fechar={() => setExcluindo(null)} ocupado={removendo}><div className="delete-preview"><Link2 size={20} /><strong>/{excluindo.urlCurta}</strong></div>{erroExcluir && <p className="form-error" role="alert">{erroExcluir}</p>}<footer className="modal-actions"><button className="button secondary" data-foco-inicial onClick={() => setExcluindo(null)} disabled={removendo}>Manter link</button><button className="button danger" onClick={() => { void remover(); }} disabled={removendo}>{removendo ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}{removendo ? 'Excluindo…' : 'Excluir link'}</button></footer></Modal>}
    </>;
}

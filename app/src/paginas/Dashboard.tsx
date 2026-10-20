import { ConfirmarExclusaoLink } from '../funcionalidades/links/ConfirmarExclusaoLink';
import { useListaLinks } from '../funcionalidades/links/useListaLinks';
import { LinhaLink } from '../funcionalidades/links/LinhaLink';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Link2, Plus, RefreshCw, Search } from 'lucide-react';
import { useSessao } from '../app/Sessao';
import { useAviso } from '../app/Avisos';
import { Carregando, Falha } from '../componentes/Comuns';
import { FormularioLink } from '../funcionalidades/links/FormularioLink';
import { atualizarConsultaLinks, lerConsultaLinks } from '../funcionalidades/links/consultaLinks';
import { http, mensagemErro } from '../services/http';
import { enderecoCurto, estadoLink, numero } from '../utils/formatar';
import type { LinkCurto } from '../tipos';

export function Dashboard() {
    const { origemPublica } = useSessao();
    const aviso = useAviso();
    const [parametros, setParametros] = useSearchParams();
    const { filtro: busca, pagina, limite } = lerConsultaLinks(parametros);
    const filtro = busca.trim();
    function setBusca(valor: string) {
        setParametros((atuais) => atualizarConsultaLinks(atuais, { filtro: valor, pagina: 1 }), {
            replace: true
        });
    }
    function setPagina(valor: number) {
        setParametros((atuais) => atualizarConsultaLinks(atuais, { pagina: valor }));
    }
    function setLimite(valor: number) {
        setParametros((atuais) => atualizarConsultaLinks(atuais, { limite: valor, pagina: 1 }));
    }
    const [versao, setVersao] = useState(0);
    const { dados, carregando, erro } = useListaLinks({ pagina, limite, filtro }, versao);
    const [editando, setEditando] = useState<LinkCurto | null | undefined>();
    const [excluindo, setExcluindo] = useState<LinkCurto | null>(null);
    const [removendo, setRemovendo] = useState(false);
    const [erroExcluir, setErroExcluir] = useState('');
    const [copiado, setCopiado] = useState<number | null>(null);
    useEffect(() => {
        const canonicos = atualizarConsultaLinks(parametros, {});
        if (canonicos.toString() !== parametros.toString()) {
            setParametros(canonicos, { replace: true });
        }
    }, [parametros, setParametros]);
    useEffect(() => {
        if (copiado == null) {
            return;
        }
        const tempo = setTimeout(() => setCopiado(null), 2000);
        return () => clearTimeout(tempo);
    }, [copiado]);
    const links = dados?.itens ?? [];
    const ativos = links.filter((link) => estadoLink(link) === 'Ativo').length;
    const acessos = links.reduce((soma, link) => soma + Number(link.acessos), 0);
    async function copiar(link: LinkCurto) {
        try {
            await navigator.clipboard.writeText(enderecoCurto(origemPublica, link.urlCurta));
            setCopiado(link.id);
            aviso('Link copiado.');
        } catch {
            aviso(
                'Não foi possível copiar. Selecione o endereço do link e copie manualmente.',
                true
            );
        }
    }
    async function remover() {
        if (!excluindo) {
            return;
        }
        setRemovendo(true);
        setErroExcluir('');
        try {
            await http('/links/' + excluindo.id, { method: 'DELETE' });
            setExcluindo(null);
            aviso('Link excluído.');
            if (links.length === 1 && pagina > 1) {
                setPagina(pagina - 1);
            } else {
                setVersao(versao + 1);
            }
        } catch (causa) {
            setErroExcluir(mensagemErro(causa));
        } finally {
            setRemovendo(false);
        }
    }
    function salvo() {
        aviso(editando ? 'Link atualizado.' : 'Link criado.');
        setEditando(undefined);
        setVersao(versao + 1);
    }
    return (
        <div className="access-console dashboard-console">
            <header className="page-heading stats-heading">
                <div>
                    <span className="eyebrow">BREVE / LINK INDEX</span>
                    <h1>
                        <span className="console-prompt">&gt;_</span> links
                    </h1>
                </div>
                <div className="console-actions">
                    <button
                        className="button secondary"
                        onClick={() => setVersao(versao + 1)}
                        disabled={carregando}
                    >
                        <RefreshCw size={14} />
                        Atualizar
                    </button>
                    <button className="button primary" onClick={() => setEditando(null)}>
                        <Plus size={14} />
                        Criar link
                    </button>
                </div>
            </header>
            <section className="console-counters" aria-label="Resumo dos links">
                <div>
                    <span>{filtro ? 'LINKS / FILTRADOS' : 'LINKS / TOTAL'}</span>
                    <strong>{carregando || erro ? '—' : numero(dados?.total ?? 0)}</strong>
                </div>
                <div>
                    <span>ATIVOS / PÁGINA</span>
                    <strong>{carregando || erro ? '—' : numero(ativos)}</strong>
                </div>
                <div>
                    <span>ACESSOS / PÁGINA</span>
                    <strong>{carregando || erro ? '—' : numero(acessos)}</strong>
                </div>
            </section>
            <section className="links-panel">
                <div className="panel-toolbar">
                    <div className="panel-title">
                        <h2>01 / endereços</h2>
                    </div>
                    <div className="search-field">
                        <Search size={14} />
                        <input
                            aria-label="Buscar links"
                            type="search"
                            maxLength={200}
                            placeholder="Filtrar link / destino"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>
                {erro ? (
                    <Falha texto={erro} tentar={() => setVersao(versao + 1)} />
                ) : carregando ? (
                    <Carregando texto="Buscando seus links…" />
                ) : links.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">
                            <Link2 size={30} />
                        </span>
                        <h2>{filtro ? 'Nenhum link por aqui.' : 'O arquivo está vazio.'}</h2>
                        <p>
                            {filtro
                                ? 'Tente buscar outro endereço ou nome de link.'
                                : 'Cadastre um destino para começar.'}
                        </p>
                        {filtro ? (
                            <button className="button secondary" onClick={() => setBusca('')}>
                                Limpar busca
                            </button>
                        ) : (
                            <button className="button primary" onClick={() => setEditando(null)}>
                                <Plus size={16} /> Criar meu primeiro link
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="links-table" role="table" aria-label="Links cadastrados">
                            <div className="table-head" role="row">
                                <span role="columnheader">LINK / DESTINO</span>
                                <span role="columnheader">STATUS</span>
                                <span role="columnheader">ACESSOS</span>
                                <span role="columnheader">CRIADO EM</span>
                                <span role="columnheader" className="align-right">
                                    AÇÕES
                                </span>
                            </div>
                            {links.map((link) => {
                                return (
                                    <LinhaLink
                                        key={link.id}
                                        link={link}
                                        origemPublica={origemPublica}
                                        copiado={copiado === link.id}
                                        copiar={(link) => {
                                            void copiar(link);
                                        }}
                                        editar={setEditando}
                                        excluir={(link) => {
                                            setExcluindo(link);
                                            setErroExcluir('');
                                        }}
                                    />
                                );
                            })}
                        </div>
                        <footer className="pagination">
                            <span>
                                Mostrando {(pagina - 1) * limite + 1}–
                                {Math.min(pagina * limite, dados?.total ?? 0)} de{' '}
                                {numero(dados?.total ?? 0)} links
                            </span>
                            <div className="pagination-controls">
                                <label>
                                    Por página{' '}
                                    <select
                                        value={limite}
                                        onChange={(e) => setLimite(Number(e.target.value))}
                                    >
                                        <option>10</option>
                                        <option>20</option>
                                        <option>50</option>
                                    </select>
                                </label>
                                <button
                                    className="icon-button bordered"
                                    aria-label="Página anterior"
                                    disabled={pagina <= 1}
                                    onClick={() => setPagina(pagina - 1)}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="page-number">
                                    {pagina} <span>/ {dados?.totalPaginas ?? 1}</span>
                                </span>
                                <button
                                    className="icon-button bordered"
                                    aria-label="Próxima página"
                                    disabled={pagina >= (dados?.totalPaginas ?? 1)}
                                    onClick={() => setPagina(pagina + 1)}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </footer>
                    </>
                )}
            </section>
            <footer className="console-foot">
                {filtro ? 'Filtro aplicado · ' : ''}ativos e acessos: página atual · {links.length}{' '}
                registros exibidos
            </footer>
            {editando !== undefined && (
                <FormularioLink
                    key={editando?.id ?? 'novo'}
                    link={editando}
                    origem={origemPublica}
                    fechar={() => setEditando(undefined)}
                    salvo={salvo}
                />
            )}
            {excluindo && (
                <ConfirmarExclusaoLink
                    link={excluindo}
                    ocupado={removendo}
                    erro={erroExcluir}
                    fechar={() => setExcluindo(null)}
                    confirmar={() => {
                        void remover();
                    }}
                />
            )}
        </div>
    );
}

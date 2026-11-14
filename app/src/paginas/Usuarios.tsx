import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useSessao } from '../app/Sessao';
import { useAviso } from '../app/Avisos';
import { Breadcrumb } from '../componentes/Breadcrumb';
import { Carregando, Falha, Modal } from '../componentes/Comuns';
import { FormularioUsuario } from '../funcionalidades/usuarios/FormularioUsuario';
import { atualizarConsultaLinks, lerConsultaLinks } from '../funcionalidades/links/consultaLinks';
import { http, mensagemErro } from '../services/http';
import type { Pagina, Usuario } from '../tipos';
import '../estilos/usuarios.css';

export function Usuarios() {
    const { usuario: sessao } = useSessao();
    const administrador = !!sessao?.administrador;
    const aviso = useAviso();
    const [parametros, setParametros] = useSearchParams();
    const { filtro, pagina, limite } = lerConsultaLinks(parametros);
    const [dados, setDados] = useState<Pagina<Usuario>>();
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [versao, setVersao] = useState(0);
    const [editando, setEditando] = useState<Usuario | null | undefined>();
    const [excluindo, setExcluindo] = useState<Usuario | null>(null);
    const [removendo, setRemovendo] = useState(false);
    const [erroExcluir, setErroExcluir] = useState('');
    function consultar(alteracoes: { filtro?: string; pagina?: number; limite?: number }) {
        setParametros((atuais) => atualizarConsultaLinks(atuais, alteracoes));
    }
    useEffect(() => {
        const controle = new AbortController();
        setCarregando(true);
        setErro('');
        const tempo = setTimeout(() => {
            void http<Pagina<Usuario>>(
                '/usuarios?' +
                    new URLSearchParams({
                        pagina: String(pagina),
                        limite: String(limite),
                        filtro: filtro.trim()
                    }),
                { signal: controle.signal }
            )
                .then((resultado) => {
                    if (controle.signal.aborted) {
                        return;
                    }
                    setDados(resultado);
                    if (pagina > Math.max(1, resultado.totalPaginas)) {
                        setParametros(
                            (atuais) =>
                                atualizarConsultaLinks(atuais, {
                                    pagina: Math.max(1, resultado.totalPaginas)
                                }),
                            { replace: true }
                        );
                    }
                })
                .catch((causa) => {
                    if (!controle.signal.aborted) {
                        setErro(mensagemErro(causa));
                    }
                })
                .finally(() => {
                    if (!controle.signal.aborted) {
                        setCarregando(false);
                    }
                });
        }, 200);
        return () => {
            clearTimeout(tempo);
            controle.abort();
        };
    }, [pagina, limite, filtro, versao, setParametros]);
    async function remover() {
        if (!administrador || !excluindo || removendo) {
            return;
        }
        setRemovendo(true);
        setErroExcluir('');
        try {
            await http('/usuarios/' + excluindo.id, { method: 'DELETE' });
            setExcluindo(null);
            setVersao((v) => v + 1);
            aviso('Usuário removido.');
        } catch (causa) {
            setErroExcluir(mensagemErro(causa));
        } finally {
            setRemovendo(false);
        }
    }
    return (
        <div className="access-console dashboard-console users-console">
            <header className="page-heading stats-heading">
                <div>
                    <Breadcrumb
                        itens={[{ rotulo: 'BREVE' }, { rotulo: 'USUÁRIOS', destino: '/usuarios' }]}
                    />
                    <h1>
                        <span className="console-prompt">&gt;_</span> usuários
                    </h1>
                </div>
                <div className="console-actions">
                    <button
                        className="button secondary"
                        onClick={() => setVersao((v) => v + 1)}
                        disabled={carregando}
                    >
                        <RefreshCw size={14} />
                        Atualizar
                    </button>
                    {administrador && (
                        <button className="button primary" onClick={() => setEditando(null)}>
                            <Plus size={14} />
                            Cadastrar usuário
                        </button>
                    )}
                </div>
            </header>
            {!administrador && (
                <p className="form-note">
                    Você pode consultar os usuários. Alterações e exclusões são permitidas apenas a
                    administradores.
                </p>
            )}
            <section className="links-panel">
                <div className="panel-toolbar">
                    <div className="panel-title">
                        <h2>01 / usuários</h2>
                    </div>
                    <div className="search-field">
                        <Search size={14} />
                        <input
                            aria-label="Buscar usuários"
                            type="search"
                            maxLength={200}
                            placeholder="Filtrar nome / e-mail"
                            value={filtro}
                            onChange={(e) => consultar({ filtro: e.target.value, pagina: 1 })}
                        />
                    </div>
                </div>
                {erro ? (
                    <Falha texto={erro} tentar={() => setVersao((v) => v + 1)} />
                ) : carregando ? (
                    <Carregando texto="Carregando usuários…" />
                ) : !dados?.itens.length ? (
                    <div className="empty-state">
                        <h2>Nenhum usuário encontrado</h2>
                        <p>Experimente outra busca.</p>
                    </div>
                ) : (
                    <>
                        <div role="table" aria-label="Usuários" className="users-table">
                            <div className="table-head user-grid" role="row">
                                <span role="columnheader">NOME</span>
                                <span role="columnheader">E-MAIL</span>
                                <span role="columnheader">TIPO</span>
                                <span role="columnheader">AÇÕES</span>
                            </div>
                            {dados.itens.map((usuario) => (
                                <div className="link-row user-grid" role="row" key={usuario.id}>
                                    <div role="cell">
                                        <button
                                            className="user-open"
                                            onClick={() => setEditando(usuario)}
                                            aria-label={'Consultar usuário ' + usuario.nome}
                                        >
                                            {usuario.nome}
                                        </button>
                                        {!usuario.ativo && (
                                            <small className="field-help">Inativo</small>
                                        )}
                                    </div>
                                    <div role="cell" className="user-email">
                                        {usuario.email}
                                    </div>
                                    <div role="cell">
                                        {usuario.administrador ? 'Administrador' : 'Comum'}
                                    </div>
                                    <div role="cell" className="row-actions">
                                        <button
                                            className="icon-button"
                                            onClick={() => setEditando(usuario)}
                                            aria-label={
                                                (administrador
                                                    ? 'Editar usuário '
                                                    : 'Consultar usuário ') + usuario.email
                                            }
                                            title={
                                                administrador
                                                    ? 'Editar usuário'
                                                    : 'Consultar usuário'
                                            }
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className="icon-button danger-hover"
                                            disabled={!administrador}
                                            onClick={() => {
                                                if (administrador) {
                                                    setExcluindo(usuario);
                                                    setErroExcluir('');
                                                }
                                            }}
                                            aria-label={'Remover usuário ' + usuario.email}
                                            title={
                                                administrador
                                                    ? 'Remover usuário'
                                                    : 'Somente administradores podem remover'
                                            }
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <footer className="pagination">
                            <span>{dados.total} usuários</span>
                            <div className="pagination-controls">
                                <label>
                                    Por página{' '}
                                    <select
                                        value={limite}
                                        onChange={(e) =>
                                            consultar({ limite: Number(e.target.value), pagina: 1 })
                                        }
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
                                    onClick={() => consultar({ pagina: pagina - 1 })}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="page-number">
                                    {pagina} / {dados.totalPaginas}
                                </span>
                                <button
                                    className="icon-button bordered"
                                    aria-label="Próxima página"
                                    disabled={pagina >= dados.totalPaginas}
                                    onClick={() => consultar({ pagina: pagina + 1 })}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </footer>
                    </>
                )}
            </section>
            {editando !== undefined && (
                <FormularioUsuario
                    key={editando?.id ?? 'novo'}
                    usuario={editando}
                    podeEditar={administrador}
                    fechar={() => setEditando(undefined)}
                    salvo={() => {
                        setEditando(undefined);
                        setVersao((v) => v + 1);
                        aviso('Usuário salvo.');
                    }}
                />
            )}
            {administrador && excluindo && (
                <Modal
                    titulo="Remover usuário"
                    descricao={
                        'Remover ' +
                        excluindo.nome +
                        ' (' +
                        excluindo.email +
                        ')? Esta ação é definitiva.'
                    }
                    fechar={() => setExcluindo(null)}
                    ocupado={removendo}
                >
                    {erroExcluir && (
                        <p className="form-error" role="alert">
                            {erroExcluir}
                        </p>
                    )}
                    <footer className="modal-actions">
                        <button
                            className="button secondary"
                            disabled={removendo}
                            onClick={() => setExcluindo(null)}
                        >
                            Cancelar
                        </button>
                        <button
                            className="button primary"
                            disabled={removendo}
                            onClick={() => {
                                void remover();
                            }}
                        >
                            {removendo ? 'Removendo…' : 'Remover usuário'}
                        </button>
                    </footer>
                </Modal>
            )}
        </div>
    );
}

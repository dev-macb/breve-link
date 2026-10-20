import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Moon, ChevronRight } from 'lucide-react';
import { useSessao } from '../app/Sessao';
import { useAviso } from '../app/Avisos';
import { mensagemErro } from '../services/http';
import { Marca } from './Comuns';

export function Layout() {
    const { usuario, origemPublica, sair } = useSessao();
    const aviso = useAviso();
    const local = useLocation();
    const [saindo, setSaindo] = useState(false);
    const [tema, setTema] = useState(() => { try { return localStorage.getItem('breve:tema') || 'dark'; } catch { return 'dark'; } });
    useEffect(() => {
        document.documentElement.dataset.theme = tema;
        try { localStorage.setItem('breve:tema', tema); } catch { /* Preferência continua válida durante a sessão. */ }
    }, [tema]);
    async function encerrar() {
        setSaindo(true);
        try { await sair(); } catch (erro) { aviso(mensagemErro(erro), true); } finally { setSaindo(false); }
    }
    return <div className="app-layout">
        <aside className="sidebar">
            <Marca />
            <nav aria-label="Navegação principal"><NavLink to="/dashboard" className={({ isActive }) => 'nav-link ' + (isActive || local.pathname.startsWith('/links/') ? 'active' : '')}><LayoutDashboard size={18} /> Meus links <ChevronRight className="nav-chevron" size={15} /></NavLink></nav>
            <div className="user-card"><span className="user-avatar">{usuario?.nome.slice(0, 2).toUpperCase()}</span><span className="user-info"><strong>{usuario?.nome}</strong><small>Administrador</small></span><button className="icon-button" aria-label="Sair da conta" title="Sair da conta" onClick={encerrar} disabled={saindo}><LogOut size={18} /></button></div>
        </aside>
        <div className="workspace-main">
            <header className="topbar"><div className="mobile-brand"><Marca compacta /></div><span className="breadcrumb">Painel <ChevronRight size={14} /><strong>{local.pathname.startsWith('/links/') ? 'Estatísticas' : 'Meus links'}</strong></span>
                <div className="theme-control"><Moon size={15} /><select aria-label="Tema da interface" value={tema} onChange={evento => setTema(evento.target.value)}><option value="dark">Escuro</option><option value="light">Claro</option><option value="system">Sistema</option></select></div>
                <button className="icon-button mobile-logout" aria-label="Sair da conta" onClick={encerrar} disabled={saindo}><LogOut size={18} /></button>
            </header>
            <main id="conteudo" className="main-content"><Outlet /></main>
            <footer className="app-footer"><span>breve_link // {origemPublica.replace(/^https?:\/\//, '')}</span><span>[ fim da transmissão ]</span></footer>
        </div>
    </div>;
}

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSessao } from '../app/Sessao';
import { useAviso } from '../app/Avisos';
import { mensagemErro } from '../services/http';
import { Marca } from './Comuns';
import { MenuConta } from './MenuConta';

export function Layout() {
    const { usuario, origemPublica, sair } = useSessao();
    const aviso = useAviso();
    const [saindo, setSaindo] = useState(false);
    const [tema, setTema] = useState(() =>
        document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
    );
    useEffect(() => {
        document.documentElement.dataset.theme = tema;
        try {
            localStorage.setItem('breve:tema', tema);
        } catch {
            /* Preferência continua válida durante a sessão. */
        }
    }, [tema]);
    async function encerrar() {
        setSaindo(true);
        try {
            await sair();
        } catch (erro) {
            aviso(mensagemErro(erro), true);
        } finally {
            setSaindo(false);
        }
    }
    return (
        <div className="app-layout">
            <header className="sidebar">
                <Marca />
                <div className="user-card">
                    <span className="user-avatar">{usuario?.nome.slice(0, 2).toUpperCase()}</span>
                    <span className="user-info">
                        <strong>{usuario?.nome}</strong>
                        <small>Administrador</small>
                    </span>
                    <MenuConta tema={tema} alterarTema={setTema} saindo={saindo} sair={encerrar} />
                </div>
            </header>
            <div className="workspace-main">
                <main id="conteudo" className="main-content">
                    <Outlet />
                </main>
                <footer className="app-footer">
                    <span>breve_link // {origemPublica.replace(/^https?:\/\//, '')}</span>
                    <span>[ @dev-macb ]</span>
                </footer>
            </div>
        </div>
    );
}

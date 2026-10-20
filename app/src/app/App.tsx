import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { SessaoProvider, useSessao } from './Sessao';
import { AvisosProvider } from './Avisos';
import { Carregando, Falha, LinkIndisponivel, Marca, NaoEncontrado } from '../componentes/Comuns';
import { Layout } from '../componentes/Layout';
import { Login } from '../paginas/Login';
const Dashboard = lazy(async () => ({ default: (await import('../paginas/Dashboard')).Dashboard }));
const EstatisticasPagina = lazy(async () => ({
    default: (await import('../paginas/Estatisticas')).EstatisticasPagina
}));

function Proteger() {
    const { usuario } = useSessao();
    const local = useLocation();
    if (!usuario) {
        return <Navigate to="/login" state={{ de: local.pathname + local.search }} replace />;
    }
    if (!usuario.administrador) {
        return <SemPermissao />;
    }
    return <Outlet />;
}
function SemPermissao() {
    const { sair } = useSessao();
    const [erro, setErro] = useState('');
    return (
        <div className="standalone">
            <Marca />
            <Falha
                texto={
                    erro ||
                    'Esta área é reservada a administradores. Peça acesso ao responsável pelo workspace.'
                }
            />
            <button
                className="button secondary"
                onClick={() => {
                    void sair().catch(() => setErro('Não foi possível sair. Tente novamente.'));
                }}
            >
                Sair da conta
            </button>
        </div>
    );
}
function EstadoSessao({ children }: { children: ReactNode }) {
    const { carregando, erro, restaurar } = useSessao();
    if (carregando) {
        return (
            <div className="standalone">
                <Marca />
                <Carregando texto="Preparando seu workspace…" />
            </div>
        );
    }
    if (erro) {
        return (
            <div className="standalone">
                <Marca />
                <Falha
                    texto={erro}
                    tentar={() => {
                        void restaurar();
                    }}
                />
            </div>
        );
    }
    return children;
}
function Rotas() {
    const local = useLocation();
    useEffect(() => {
        document.title =
            (local.pathname.startsWith('/links/')
                ? 'Estatísticas'
                : local.pathname === '/login'
                  ? 'Entrar'
                  : local.pathname === '/indisponivel'
                    ? 'Link indisponível'
                    : 'Meus links') + ' — Breve Link';
    }, [local.pathname]);
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <EstadoSessao>
                        <Login />
                    </EstadoSessao>
                }
            />
            <Route
                element={
                    <EstadoSessao>
                        <Proteger />
                    </EstadoSessao>
                }
            >
                <Route element={<Layout />}>
                    <Route
                        path="/dashboard"
                        element={
                            <Suspense fallback={<Carregando />}>
                                <Dashboard />
                            </Suspense>
                        }
                    />
                    <Route
                        path="/links/:id"
                        element={
                            <Suspense fallback={<Carregando />}>
                                <EstatisticasPagina />
                            </Suspense>
                        }
                    />
                </Route>
            </Route>
            <Route path="/indisponivel" element={<LinkIndisponivel />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NaoEncontrado />} />
        </Routes>
    );
}
export function App() {
    return (
        <BrowserRouter>
            <AvisosProvider>
                <SessaoProvider>
                    <Rotas />
                </SessaoProvider>
            </AvisosProvider>
        </BrowserRouter>
    );
}

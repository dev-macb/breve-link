import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SessaoProvider, useSessao } from './Sessao';
import { AvisosProvider } from './Avisos';
import { Carregando, Falha, LinkIndisponivel, Marca, NaoEncontrado } from '../componentes/Comuns';
import { Layout } from '../componentes/Layout';
import { Login } from '../paginas/Login';
const Usuarios = lazy(async () => ({ default: (await import('../paginas/Usuarios')).Usuarios }));
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
    return <Outlet />;
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
                  : local.pathname === '/usuarios'
                    ? 'Usuários'
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
                        path="/usuarios"
                        element={
                            <Suspense fallback={<Carregando />}>
                                <Usuarios />
                            </Suspense>
                        }
                    />
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
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <AvisosProvider>
                <SessaoProvider>
                    <Rotas />
                </SessaoProvider>
            </AvisosProvider>
        </BrowserRouter>
    );
}

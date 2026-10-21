import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useSessao } from '../app/Sessao';
import { mensagemErro } from '../services/http';
import { Marca } from '../componentes/Comuns';
import '../estilos/login.css';

export function Login() {
    const { usuario, entrar } = useSessao();
    const local = useLocation();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState('');
    const envioEmCurso = useRef(false);
    const origem = (local.state as { de?: string } | null)?.de;
    const destino =
        origem?.startsWith('/') && !origem.startsWith('//') && origem !== '/login'
            ? origem
            : '/dashboard';
    if (usuario) {
        return <Navigate to={destino} replace />;
    }
    async function enviar(evento: FormEvent) {
        evento.preventDefault();
        if (envioEmCurso.current) {
            return;
        }
        envioEmCurso.current = true;
        setEnviando(true);
        setErro('');
        try {
            await entrar(email, senha);
        } catch (causa) {
            setErro(mensagemErro(causa));
        } finally {
            envioEmCurso.current = false;
            setEnviando(false);
        }
    }
    return (
        <main className="login-page" id="conteudo" aria-labelledby="login-titulo">
            <div className="login-panel">
                <Marca />
                <h1 id="login-titulo">Entrar</h1>
                <p
                    className={'login-description' + (erro ? ' login-description-error' : '')}
                    id="login-descricao"
                    role={erro ? 'alert' : undefined}
                >
                    {erro || 'Acesse seus links.'}
                </p>
                <form
                    onSubmit={enviar}
                    aria-busy={enviando}
                    className="login-form"
                    aria-describedby="login-descricao"
                >
                    <label htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="username"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@exemplo.com"
                        disabled={enviando}
                    />
                    <label htmlFor="senha">Senha</label>
                    <div className="login-password">
                        <input
                            id="senha"
                            type={mostrar ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Sua senha"
                            disabled={enviando}
                        />
                        <button
                            type="button"
                            className="icon-button"
                            aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
                            onClick={() => setMostrar(!mostrar)}
                            disabled={enviando}
                        >
                            {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <button
                        className="button primary login-submit"
                        type="submit"
                        disabled={enviando}
                    >
                        {enviando ? (
                            <>
                                <Loader2 className="spin" size={18} /> Entrando…
                            </>
                        ) : (
                            <>Entrar</>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}

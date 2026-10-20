import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Loader2 } from 'lucide-react';
import { useSessao } from '../app/Sessao';
import { mensagemErro } from '../services/http';
import { Marca } from '../componentes/Comuns';

export function Login() {
    const { usuario, entrar } = useSessao();
    const local = useLocation();
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState('');
    const origem = (local.state as { de?: string } | null)?.de;
    const destino = origem?.startsWith('/') && !origem.startsWith('//') && origem !== '/login' ? origem : '/dashboard';
    if (usuario) return <Navigate to={destino} replace />;
    async function enviar(evento: FormEvent) {
        evento.preventDefault(); setEnviando(true); setErro('');
        try { await entrar(email, senha); } catch (causa) { setErro(mensagemErro(causa)); } finally { setEnviando(false); }
    }
    return <div className="login-layout">
        <section className="login-story">
            <Marca />
            <div className="story-content"><span className="eyebrow">// NEM TODO CAMINHO É ÓBVIO</span><h1>Um atalho<br /><em>no escuro.</em></h1><p>Endereços curtos.<br />Destinos sob seu controle.</p>
                <pre className="terminal-art" aria-hidden="true">{`     .-----------------.
     |  origem         |
     '--------+--------'
              |
         [ breve ]
              |
     .--------+--------.
     |         destino |
     '-----------------'`}</pre>
            </div>
            <span className="story-footer">[ o resto é só o caminho. ]</span>
        </section>
        <section className="login-form-section" id="conteudo"><div className="login-mobile-brand"><Marca /></div><div className="login-form-wrap"><span className="login-icon"><LockKeyhole size={20} /></span><span className="eyebrow">[ ACESSO RESTRITO ]</span><h2>Identifique-se<span className="heading-dot">_</span></h2><p className="login-description">Entre para administrar seus links.</p>
            <form onSubmit={enviar}>
                <label htmlFor="email">E-mail</label><input id="email" type="email" autoComplete="username" required autoFocus value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" disabled={enviando} />
                <label htmlFor="senha">Senha</label><div className="password-field"><input id="senha" type={mostrar ? 'text' : 'password'} autoComplete="current-password" required value={senha} onChange={e => setSenha(e.target.value)} placeholder="Sua senha" disabled={enviando} /><button type="button" className="icon-button" aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setMostrar(!mostrar)}>{mostrar ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                {erro && <p className="form-error" role="alert">{erro}</p>}
                <button className="button primary login-submit" type="submit" disabled={enviando}>{enviando ? <Loader2 className="spin" size={18} /> : <>Entrar<ArrowRight size={18} /></>}</button>
            </form>
            <p className="login-help"><LockKeyhole size={12} /> Somente administradores.</p>
        </div><span className="login-bottom">breve_link <span>//</span> menos é suficiente.</span></section>
    </div>;
}

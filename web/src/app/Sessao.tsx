import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { http, ErroHttp, mensagemErro } from '../services/http';
import type { Usuario } from '../tipos';

interface Sessao {
    usuario: Usuario | null; origemPublica: string; carregando: boolean; erro: string;
    restaurar: () => Promise<void>; entrar: (email: string, senha: string) => Promise<void>; sair: () => Promise<void>;
}
const Contexto = createContext<Sessao | null>(null);
export function SessaoProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [origemPublica, setOrigemPublica] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const geracao = useRef(0);
    const invalidar = useCallback(() => { geracao.current++; }, []);
    const restaurar = useCallback(async () => {
        const atual = ++geracao.current;
        setCarregando(true);
        setErro('');
        try {
            const pessoa = await http<Usuario>('/auth/me');
            const config = await http<{ origemPublica: string }>('/configuracao');
            if (atual !== geracao.current) return;
            setOrigemPublica(config.origemPublica);
            setUsuario(pessoa);
        } catch (causa) {
            if (atual !== geracao.current) return;
            setUsuario(null);
            if (!(causa instanceof ErroHttp && causa.status === 401)) setErro(mensagemErro(causa));
        } finally { if (atual === geracao.current) setCarregando(false); }
    }, []);
    useEffect(() => {
        void restaurar();
        const expirar = () => { invalidar(); setUsuario(null); setOrigemPublica(''); setErro(''); setCarregando(false); };
        window.addEventListener('breve:sessao-expirada', expirar);
        return () => { invalidar(); window.removeEventListener('breve:sessao-expirada', expirar); };
    }, [restaurar, invalidar]);
    async function entrar(email: string, senha: string) {
        const atual = ++geracao.current;
        await http<void>('/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), senha }) });
        const pessoa = await http<Usuario>('/auth/me');
        const config = await http<{ origemPublica: string }>('/configuracao');
        if (atual !== geracao.current) return;
        setUsuario(pessoa); setOrigemPublica(config.origemPublica); setErro('');
    }
    async function sair() {
        geracao.current++;
        try { await http<void>('/auth/logout', { method: 'POST', body: '{}' }); }
        catch (causa) { if (!(causa instanceof ErroHttp && causa.status === 401)) throw causa; }
        setUsuario(null); setOrigemPublica('');
    }
    return <Contexto.Provider value={{ usuario, origemPublica, carregando, erro, restaurar, entrar, sair }}>{children}</Contexto.Provider>;
}
export function useSessao() {
    const sessao = useContext(Contexto);
    if (!sessao) throw new Error('Sessão fora do provider');
    return sessao;
}

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type Aviso = { texto: string; erro: boolean };
const Contexto = createContext<(texto: string, erro?: boolean) => void>(() => undefined);

export function AvisosProvider({ children }: { children: ReactNode }) {
    const [aviso, setAviso] = useState<Aviso | null>(null);

    useEffect(() => {
        if (!aviso) {
            return;
        }
        const tempo = setTimeout(() => setAviso(null), aviso.erro ? 8000 : 4000);
        return () => clearTimeout(tempo);
    }, [aviso]);

    return (
        <Contexto.Provider value={(texto, erro = false) => setAviso({ texto, erro })}>
            {children}
            <div className="toast-region" aria-live="polite" aria-atomic="true">
                {aviso && (
                    <div className={'toast ' + (aviso.erro ? 'toast-error' : '')}>
                        {aviso.erro ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                        <span>{aviso.texto}</span>
                        <button
                            className="icon-button"
                            aria-label="Fechar aviso"
                            onClick={() => setAviso(null)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>
        </Contexto.Provider>
    );
}
export function useAviso() {
    return useContext(Contexto);
}

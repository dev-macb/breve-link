import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Marca({ compacta = false }: { compacta?: boolean }) {
    return (
        <Link to="/dashboard" className="brand" aria-label="Breve Link, início">
            <span className="brand-mark" aria-hidden="true">
                [b]
            </span>
            {!compacta && (
                <span>
                    breve<span className="brand-light">_link</span>
                    <span className="brand-dot">/</span>
                </span>
            )}
        </Link>
    );
}
export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
    return (
        <div className="loading-state" role="status">
            <Loader2 className="spin" size={22} />
            <span>{texto}</span>
        </div>
    );
}
export function Falha({ texto, tentar }: { texto: string; tentar?: () => void }) {
    return (
        <div className="error-state" role="alert">
            <AlertCircle size={24} />
            <h2>Algo não saiu como esperado</h2>
            <p>{texto}</p>
            {tentar && (
                <button className="button secondary" onClick={tentar}>
                    Tentar novamente
                </button>
            )}
        </div>
    );
}
export function Modal({
    titulo,
    descricao,
    children,
    fechar,
    ocupado = false
}: {
    titulo: string;
    descricao: string;
    children: ReactNode;
    fechar: () => void;
    ocupado?: boolean;
}) {
    const dialogo = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const elemento = dialogo.current!;
        elemento.showModal();
        elemento.querySelector<HTMLElement>('[data-foco-inicial]')?.focus();
        return () => elemento.close();
    }, []);
    return (
        <dialog
            ref={dialogo}
            className="modal"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            onCancel={(evento) => {
                evento.preventDefault();
                if (!ocupado) {
                    fechar();
                }
            }}
            onClick={(evento) => {
                if (evento.target === evento.currentTarget && !ocupado) {
                    fechar();
                }
            }}
        >
            <div className="modal-content">
                <header className="modal-header">
                    <div>
                        <h2 id="modal-title">{titulo}</h2>
                        <p id="modal-description">{descricao}</p>
                    </div>
                    <button
                        className="icon-button"
                        type="button"
                        aria-label="Fechar janela"
                        onClick={fechar}
                        disabled={ocupado}
                    >
                        <X size={20} />
                    </button>
                </header>
                {children}
            </div>
        </dialog>
    );
}
export function NaoEncontrado({ integrada = false }: { integrada?: boolean }) {
    return (
        <div className={integrada ? 'not-found-inline' : 'standalone'}>
            {!integrada && <Marca />}
            <div className="empty-state">
                <span className="eyebrow">404</span>
                <h1>Esse caminho não existe.</h1>
                <p>Volte aos seus links para continuar.</p>
                <Link className="button primary" to="/dashboard">
                    Ir para meus links
                </Link>
            </div>
        </div>
    );
}
export function LinkIndisponivel() {
    return (
        <div className="standalone">
            <Marca />
            <div className="empty-state">
                <span className="eyebrow">LINK INDISPONÍVEL</span>
                <h1>Esta conexão está em pausa.</h1>
                <p>
                    O link pode ter expirado ou sido desativado. Peça um novo endereço a quem o
                    compartilhou.
                </p>
                <Link className="button secondary" to="/">
                    Voltar ao início
                </Link>
            </div>
        </div>
    );
}

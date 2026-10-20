import { useEffect, useId, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, Moon } from 'lucide-react';
import '../estilos/menu-conta.css';

interface MenuContaProps {
    tema: string;
    alterarTema: (tema: string) => void;
    saindo: boolean;
    sair: () => Promise<void>;
}

export function MenuConta({ tema, alterarTema, saindo, sair }: MenuContaProps) {
    const menu = useRef<HTMLDetailsElement>(null);
    const identificador = useId();
    const local = useLocation();

    useEffect(() => {
        const elemento = menu.current!;
        elemento.open = false;

        function fecharAoClicarFora(evento: PointerEvent) {
            if (!elemento.contains(evento.target as Node)) {
                elemento.open = false;
            }
        }

        function fecharComEscape(evento: KeyboardEvent) {
            if (evento.key === 'Escape' && elemento.open) {
                elemento.open = false;
                elemento.querySelector('summary')?.focus();
            }
        }

        document.addEventListener('pointerdown', fecharAoClicarFora);
        document.addEventListener('keydown', fecharComEscape);
        return () => {
            document.removeEventListener('pointerdown', fecharAoClicarFora);
            document.removeEventListener('keydown', fecharComEscape);
        };
    }, [local.key]);

    return (
        <details
            className="account-menu"
            ref={menu}
            onBlur={(evento) => {
                if (!evento.currentTarget.contains(evento.relatedTarget)) {
                    evento.currentTarget.open = false;
                }
            }}
        >
            <summary
                className="icon-button account-menu-toggle"
                aria-label="Menu da conta"
                aria-controls={identificador}
                title="Menu da conta"
            >
                <Menu size={20} aria-hidden="true" />
            </summary>
            <div className="account-menu-panel" id={identificador}>
                <nav aria-label="Navegação principal">
                    <NavLink
                        to="/dashboard"
                        className="account-menu-item"
                        onClick={() => {
                            menu.current!.open = false;
                        }}
                    >
                        <LayoutDashboard size={16} aria-hidden="true" />
                        Meus links
                    </NavLink>
                </nav>
                <button
                    type="button"
                    className="account-menu-theme"
                    role="switch"
                    aria-label="Tema escuro"
                    aria-checked={tema === 'dark'}
                    onClick={() => alterarTema(tema === 'dark' ? 'light' : 'dark')}
                >
                    <span>
                        <Moon size={16} aria-hidden="true" />
                        Tema escuro
                    </span>
                    <span className="theme-switch" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className="account-menu-item account-menu-logout"
                    disabled={saindo}
                    onClick={() => {
                        void sair();
                    }}
                >
                    <LogOut size={16} aria-hidden="true" />
                    {saindo ? 'Saindo…' : 'Sair da conta'}
                </button>
            </div>
        </details>
    );
}

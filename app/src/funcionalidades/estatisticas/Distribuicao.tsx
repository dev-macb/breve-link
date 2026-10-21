import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { numero } from '../../utils/formatar';

export function Distribuicao({
    titulo,
    icone: Icone,
    itens
}: {
    titulo: string;
    icone: LucideIcon;
    itens: { nome: string; acessos: number; percentual: number }[];
}) {
    const [expandido, setExpandido] = useState(false);
    const visiveis = expandido ? itens : itens.slice(0, 5);
    return (
        <section className="distribution-card">
            <header>
                <h2>
                    <Icone size={16} />
                    {titulo}
                </h2>
                <span className="muted-label">ACESSOS</span>
            </header>
            {!itens.length ? (
                <p className="distribution-empty">Sem dados.</p>
            ) : (
                <div className="distribution-list">
                    {visiveis.map((item, indice) => (
                        <div className="distribution-item" key={item.nome + indice}>
                            <div className="distribution-label">
                                <span title={item.nome}>{item.nome}</span>
                                <strong>
                                    {numero(Number(item.acessos))}{' '}
                                    <small>{item.percentual.toLocaleString('pt-BR')}%</small>
                                </strong>
                            </div>
                            <div className="distribution-track">
                                <span
                                    style={{
                                        width: Math.min(100, Math.max(0, item.percentual)) + '%'
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {itens.length > 5 && (
                <button className="text-button" onClick={() => setExpandido(!expandido)}>
                    {expandido ? 'Mostrar menos' : 'Ver todos (' + itens.length + ')'}
                </button>
            )}
        </section>
    );
}

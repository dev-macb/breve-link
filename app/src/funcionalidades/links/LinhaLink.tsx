import { Link } from 'react-router-dom';
import { ArrowUpRight, BarChart3, Check, Copy, Link2, Pencil, Trash2 } from 'lucide-react';
import { dataCurta, dominio, enderecoCurto, estadoLink, numero } from '../../utils/formatar';
import type { LinkCurto } from '../../tipos';

interface LinhaLinkProps {
    link: LinkCurto;
    origemPublica: string;
    copiado: boolean;
    copiar: (link: LinkCurto) => void;
    editar: (link: LinkCurto) => void;
    excluir: (link: LinkCurto) => void;
}

export function LinhaLink({
    link,
    origemPublica,
    copiado,
    copiar,
    editar,
    excluir
}: LinhaLinkProps) {
    const estado = estadoLink(link);
    const endereco = enderecoCurto(origemPublica, link.urlCurta);
    return (
        <div className="link-row" role="row">
            <div className="link-cell" role="cell">
                <span className="link-tile">
                    <Link2 size={19} />
                </span>
                <div className="link-address">
                    <a href={endereco} target="_blank" rel="noreferrer" title={endereco}>
                        {origemPublica.replace(/^https?:\/\//, '')}
                        <strong>/{link.urlCurta}</strong>
                        <ArrowUpRight size={12} />
                    </a>
                    <span title={link.urlOriginal}>
                        {dominio(link.urlOriginal)}
                        <span className="destination-path">
                            {link.urlOriginal.replace(/^https?:\/\/[^/]+/, '')}
                        </span>
                    </span>
                </div>
            </div>
            <div role="cell">
                <span className={'status-badge ' + estado.toLowerCase()}>
                    <span />
                    {estado}
                </span>
            </div>
            <div className="access-count" role="cell">
                <span className="sr-only">Acessos: </span>
                <BarChart3 size={13} />
                {numero(Number(link.acessos))}
            </div>
            <div className="created-date" role="cell">
                {dataCurta(link.criadoEm)}
            </div>
            <div className="row-actions" role="cell">
                <button
                    className={'icon-button ' + (copiado ? 'copied' : '')}
                    onClick={() => {
                        copiar(link);
                    }}
                    title="Copiar link"
                    aria-label={'Copiar link ' + link.urlCurta}
                >
                    {copiado ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <Link
                    className="icon-button"
                    to={'/links/' + link.id}
                    title="Ver estatísticas"
                    aria-label={'Ver estatísticas de ' + link.urlCurta}
                >
                    <BarChart3 size={16} />
                </Link>
                <button
                    className="icon-button"
                    onClick={() => editar(link)}
                    title="Editar link"
                    aria-label={'Editar link ' + link.urlCurta}
                >
                    <Pencil size={15} />
                </button>
                <button
                    className="icon-button danger-hover"
                    onClick={() => {
                        excluir(link);
                    }}
                    title="Excluir link"
                    aria-label={'Excluir link ' + link.urlCurta}
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
}

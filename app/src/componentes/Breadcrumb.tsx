import { Link } from 'react-router-dom';
import '../estilos/breadcrumb.css';

interface ItemBreadcrumb {
    rotulo: string;
    destino?: string;
}

export function Breadcrumb({ itens }: { itens: ItemBreadcrumb[] }) {
    return (
        <nav className="breadcrumb eyebrow" aria-label="Navegação estrutural">
            <ol>
                {itens.map((item, indice) => (
                    <li key={item.destino ?? item.rotulo}>
                        {indice > 0 && <span aria-hidden="true">/</span>}
                        {item.destino ? (
                            <Link
                                to={item.destino}
                                aria-current={indice === itens.length - 1 ? 'page' : undefined}
                            >
                                {item.rotulo}
                            </Link>
                        ) : (
                            <span aria-current={indice === itens.length - 1 ? 'page' : undefined}>
                                {item.rotulo}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

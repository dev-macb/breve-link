import { Link2, Loader2, Trash2 } from 'lucide-react';
import { Modal } from '../../componentes/Comuns';
import type { LinkCurto } from '../../tipos';

interface ConfirmarExclusaoLinkProps {
    link: LinkCurto;
    ocupado: boolean;
    erro: string;
    fechar: () => void;
    confirmar: () => void;
}

export function ConfirmarExclusaoLink({
    link,
    ocupado,
    erro,
    fechar,
    confirmar
}: ConfirmarExclusaoLinkProps) {
    return (
        <Modal
            titulo="Excluir este link?"
            descricao="O endereço deixará de redirecionar e suas estatísticas serão removidas. Esta ação não pode ser desfeita."
            fechar={() => fechar()}
            ocupado={ocupado}
        >
            <div className="delete-preview">
                <Link2 size={20} />
                <strong>/{link.urlCurta}</strong>
            </div>
            {erro && (
                <p className="form-error" role="alert">
                    {erro}
                </p>
            )}
            <footer className="modal-actions">
                <button
                    className="button secondary"
                    data-foco-inicial
                    onClick={() => fechar()}
                    disabled={ocupado}
                >
                    Manter link
                </button>
                <button
                    className="button danger"
                    onClick={() => {
                        confirmar();
                    }}
                    disabled={ocupado}
                >
                    {ocupado ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                    {ocupado ? 'Excluindo…' : 'Excluir link'}
                </button>
            </footer>
        </Modal>
    );
}

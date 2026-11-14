import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from '../../componentes/Comuns';
import { http, mensagemErro } from '../../services/http';
import type { Usuario } from '../../tipos';

export function FormularioUsuario({
    usuario,
    podeEditar,
    fechar,
    salvo
}: {
    usuario: Usuario | null;
    podeEditar: boolean;
    fechar: () => void;
    salvo: () => void;
}) {
    const [nome, setNome] = useState(usuario?.nome ?? '');
    const [email, setEmail] = useState(usuario?.email ?? '');
    const [senha, setSenha] = useState('');
    const [administrador, setAdministrador] = useState(usuario?.administrador ?? false);
    const [ativo, setAtivo] = useState(usuario?.ativo ?? true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    async function enviar(evento: FormEvent) {
        evento.preventDefault();
        if (!podeEditar || salvando) {
            return;
        }
        setErro('');
        if (
            !nome.trim() ||
            (senha && (senha.length < 8 || new TextEncoder().encode(senha).length > 72))
        ) {
            setErro('Informe o nome e uma senha de pelo menos 8 caracteres e no máximo 72 bytes.');
            return;
        }
        setSalvando(true);
        try {
            await http(usuario ? '/usuarios/' + usuario.id : '/usuarios', {
                method: usuario ? 'PATCH' : 'POST',
                body: JSON.stringify({
                    nome: nome.trim(),
                    email: email.trim().toLowerCase(),
                    ...(senha ? { senha } : {}),
                    ...(!usuario || administrador !== usuario.administrador
                        ? { administrador }
                        : {}),
                    ...(!usuario || ativo !== usuario.ativo ? { ativo } : {})
                })
            });
            salvo();
        } catch (causa) {
            setErro(mensagemErro(causa));
        } finally {
            setSalvando(false);
        }
    }
    return (
        <Modal
            titulo={
                usuario
                    ? podeEditar
                        ? 'Editar usuário'
                        : 'Consultar usuário'
                    : 'Cadastrar usuário'
            }
            descricao={
                podeEditar
                    ? 'Informe os dados e as permissões do usuário.'
                    : 'Você tem permissão apenas para consultar usuários.'
            }
            fechar={fechar}
            ocupado={salvando}
        >
            <form className="link-form" onSubmit={enviar}>
                <label htmlFor="usuario-nome">Nome</label>
                <input
                    id="usuario-nome"
                    data-foco-inicial
                    required
                    maxLength={30}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={!podeEditar || salvando}
                />
                <label htmlFor="usuario-email">E-mail</label>
                <input
                    id="usuario-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!podeEditar || salvando}
                    autoComplete="off"
                />
                {podeEditar && (
                    <>
                        <label htmlFor="usuario-senha">
                            {usuario ? 'Nova senha (opcional)' : 'Senha'}
                        </label>
                        <input
                            id="usuario-senha"
                            type="password"
                            required={!usuario}
                            minLength={8}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            disabled={salvando}
                            autoComplete="new-password"
                        />
                        <p className="field-help">
                            {usuario ? 'Deixe em branco para manter a senha. ' : ''}Mínimo de 8
                            caracteres e máximo de 72 bytes.
                        </p>
                    </>
                )}
                <label htmlFor="usuario-tipo">Tipo</label>
                <select
                    id="usuario-tipo"
                    value={administrador ? 'admin' : 'comum'}
                    onChange={(e) => setAdministrador(e.target.value === 'admin')}
                    disabled={!podeEditar || salvando}
                >
                    <option value="comum">Comum</option>
                    <option value="admin">Administrador</option>
                </select>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={ativo}
                        onChange={(e) => setAtivo(e.target.checked)}
                        disabled={!podeEditar || salvando}
                    />
                    <span>Usuário ativo</span>
                </label>
                {erro && (
                    <p className="form-error" role="alert">
                        {erro}
                    </p>
                )}
                <footer className="modal-actions">
                    <button
                        type="button"
                        className="button secondary"
                        onClick={fechar}
                        disabled={salvando}
                    >
                        {podeEditar ? 'Cancelar' : 'Fechar'}
                    </button>
                    {podeEditar && (
                        <button type="submit" className="button primary" disabled={salvando}>
                            {salvando
                                ? 'Salvando…'
                                : usuario
                                  ? 'Salvar alterações'
                                  : 'Cadastrar usuário'}
                        </button>
                    )}
                </footer>
            </form>
        </Modal>
    );
}

import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowUpRight, CalendarDays, Link2, Loader2 } from 'lucide-react';
import { Modal } from '../../componentes/Comuns';
import { http, mensagemErro } from '../../services/http';
import { dataFormulario, estadoLink } from '../../utils/formatar';
import type { DadosLink, LinkCurto } from '../../tipos';

export function FormularioLink({ link, origem, fechar, salvo }: { link: LinkCurto | null; origem: string; fechar: () => void; salvo: () => void }) {
    const [destino, setDestino] = useState(link?.urlOriginal ?? '');
    const [slug, setSlug] = useState(link?.urlCurta ?? '');
    const inicial = dataFormulario(link?.expiraEm);
    const [expira, setExpira] = useState(inicial);
    const [ativo, setAtivo] = useState(!!(link?.ativo ?? true));
    const [erro, setErro] = useState('');
    const [salvando, setSalvando] = useState(false);
    async function enviar(evento: FormEvent) {
        evento.preventDefault(); setErro('');
        const curta = slug.trim();
        try {
            const url = new URL(destino.trim());
            if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
        } catch { setErro('Informe um endereço HTTP ou HTTPS válido, sem usuário ou senha.'); return; }
        if (curta && !/^[a-zA-Z0-9_-]{3,50}$/.test(curta)) { setErro('O link curto deve ter de 3 a 50 letras, números, hífens ou underscores.'); return; }
        const mudouExpiracao = !link || expira !== inicial;
        if (mudouExpiracao && expira && !(new Date(expira).getTime() > Date.now())) { setErro('Escolha uma data de expiração no futuro.'); return; }
        const dados: Partial<DadosLink> = {
            urlOriginal: destino.trim(),
            ...(curta ? { urlCurta: curta } : {}),
            ...(mudouExpiracao ? { expiraEm: expira ? new Date(expira).toISOString() : null } : {}),
            ...(link ? { ativo } : {})
        };
        setSalvando(true);
        try { await http(link ? '/links/' + link.id : '/links', { method: link ? 'PATCH' : 'POST', body: JSON.stringify(dados) }); salvo(); }
        catch (causa) { setErro(mensagemErro(causa)); }
        finally { setSalvando(false); }
    }
    return <Modal titulo={link ? 'Editar link' : 'Criar link'} descricao={link ? 'Atualize o destino, o estado ou a expiração.' : 'Informe o destino e escolha um endereço curto.'} fechar={fechar} ocupado={salvando}>
        <form className="link-form" onSubmit={enviar}>
            <label htmlFor="destino">URL de destino <span className="required-dot">*</span></label>
            <div className="input-icon"><ArrowUpRight size={17} /><input id="destino" data-foco-inicial type="url" required maxLength={500} placeholder="https://seusite.com/algum-endereco" value={destino} onChange={e => setDestino(e.target.value)} disabled={salvando} /></div>
            <label htmlFor="slug">Link personalizado {!link && <span className="field-optional">opcional ao criar</span>}</label>
            <div className="slug-field"><span>{origem.replace(/^https?:\/\//, '')}/</span><input id="slug" type="text" aria-describedby="slug-help" minLength={3} maxLength={50} required={!!link} value={slug} onChange={e => setSlug(e.target.value)} placeholder="seu-link" disabled={salvando} autoComplete="off" /></div>
            <p id="slug-help" className="field-help">{link ? 'Ao alterar este endereço, o anterior deixa de funcionar. Maiúsculas fazem diferença.' : 'Deixe em branco para gerar automaticamente. Letras maiúsculas fazem diferença.'}</p>
            <label htmlFor="expiracao">Expiração <span className="field-optional">opcional</span></label>
            <div className="input-icon"><CalendarDays size={17} /><input id="expiracao" type="datetime-local" value={expira} onChange={e => setExpira(e.target.value)} disabled={salvando} /></div>
            <p className="field-help">Horário local do seu dispositivo. Sem data, o link não expira.</p>
            {link && <label className="checkbox-label"><input type="checkbox" checked={ativo} onChange={e => setAtivo(e.target.checked)} disabled={salvando} /><span>Link habilitado<small>Desabilite para pausar os redirecionamentos.</small></span></label>}
            {link && estadoLink(link) === 'Expirado' && <p className="form-note">Este link expirou. Para voltar a usá-lo, remova a data ou escolha uma nova.</p>}
            {erro && <p className="form-error" role="alert">{erro}</p>}
            <footer className="modal-actions"><button type="button" className="button secondary" onClick={fechar} disabled={salvando}>Cancelar</button><button type="submit" className="button primary" disabled={salvando}>{salvando ? <Loader2 className="spin" size={16} /> : <Link2 size={16} />}{salvando ? 'Salvando…' : link ? 'Salvar alterações' : 'Criar link'}</button></footer>
        </form>
    </Modal>;
}

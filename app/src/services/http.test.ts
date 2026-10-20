import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErroHttp, http, mensagemErro } from './http';

describe('Cliente HTTP autenticado', () => {
    const buscar = vi.fn<typeof fetch>();
    beforeEach(() => {
        vi.stubGlobal('fetch', buscar);
        vi.stubGlobal('window', new EventTarget());
    });
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.resetAllMocks();
    });

    it('envia cookies e cabecalho CSRF nas operacoes de escrita', async () => {
        buscar.mockResolvedValue(new Response(null, { status: 204 }));
        await http('/links', { method: 'POST', body: '{}' });
        const [caminho, opcoes] = buscar.mock.calls[0];
        expect(caminho).toBe('/api/links');
        expect(opcoes?.credentials).toBe('include');
        expect(new Headers(opcoes?.headers).get('X-Breve-CSRF')).toBe('1');
        expect(new Headers(opcoes?.headers).get('Content-Type')).toBe('application/json');
        expect(new Headers(opcoes?.headers).get('Authorization')).toBeNull();
    });

    it('nao adiciona CSRF ou corpo em consulta de leitura', async () => {
        buscar.mockResolvedValue(Response.json({ total: 0 }));
        expect(await http('/links')).toEqual({ total: 0 });
        const opcoes = buscar.mock.calls[0][1];
        expect(new Headers(opcoes?.headers).has('X-Breve-CSRF')).toBe(false);
        expect(opcoes?.body).toBeUndefined();
    });

    it('propaga sinal de cancelamento para evitar respostas de buscas antigas', async () => {
        buscar.mockResolvedValue(Response.json({ itens: [] }));
        const controle = new AbortController();
        await http('/links', { signal: controle.signal });
        expect(buscar.mock.calls[0][1]?.signal).toBe(controle.signal);
    });

    it('notifica expiracao de sessao em 401 da API de links', async () => {
        const expirar = vi.fn();
        window.addEventListener('breve:sessao-expirada', expirar);
        buscar.mockResolvedValue(Response.json({ erro: 'Sessão expirada' }, { status: 401 }));
        await expect(http('/links')).rejects.toBeInstanceOf(ErroHttp);
        expect(expirar).toHaveBeenCalledOnce();
    });

    it('credenciais invalidas nao disparam redirecionamento global', async () => {
        const expirar = vi.fn();
        window.addEventListener('breve:sessao-expirada', expirar);
        buscar.mockResolvedValue(Response.json({ erro: 'Credenciais inválidas' }, { status: 401 }));
        await expect(http('/auth/login', { method: 'POST', body: '{}' })).rejects.toMatchObject({
            status: 401
        });
        expect(expirar).not.toHaveBeenCalled();
    });

    it('preserva 403 e torna detalhes de validacao legiveis', async () => {
        buscar.mockResolvedValue(Response.json({ erro: 'Acesso negado' }, { status: 403 }));
        await expect(http('/links')).rejects.toMatchObject({
            status: 403,
            message: 'Acesso negado'
        });
        expect(
            mensagemErro(
                new ErroHttp(422, 'Dados inválidos', ['body.urlCurta: Slug inválido ou reservado'])
            )
        ).toBe('Esse endereço curto não está disponível. Escolha outro.');
        expect(mensagemErro(new ErroHttp(409, 'UrlCurta já registrada'))).toBe(
            'Esse endereço curto já está em uso. Escolha outro.'
        );
    });
});

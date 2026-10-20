export class ErroHttp extends Error {
    constructor(
        public readonly status: number,
        mensagem: string,
        public readonly detalhes: string[] = []
    ) {
        super(mensagem);
    }
}
export async function http<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
    const metodo = (opcoes.method || 'GET').toUpperCase();
    const headers = new Headers(opcoes.headers);
    if (!['GET', 'HEAD', 'OPTIONS'].includes(metodo)) {
        headers.set('X-Breve-CSRF', '1');
        if (metodo !== 'DELETE') {
            headers.set('Content-Type', 'application/json');
        }
    }
    const resposta = await fetch('/api' + caminho, {
        ...opcoes,
        method: metodo,
        credentials: 'include',
        headers
    });
    if (!resposta.ok) {
        const corpo = (await resposta.json().catch(() => ({}))) as {
            erro?: string;
            detalhes?: string[];
        };
        if (resposta.status === 401 && !caminho.startsWith('/auth/')) {
            window.dispatchEvent(new Event('breve:sessao-expirada'));
        }
        throw new ErroHttp(
            resposta.status,
            corpo.erro || 'Não foi possível concluir a solicitação.',
            corpo.detalhes
        );
    }
    if (resposta.status === 204) {
        return undefined as T;
    }
    return resposta.json() as Promise<T>;
}
export function mensagemErro(erro: unknown): string {
    if (erro instanceof ErroHttp) {
        if (erro.status === 409 && erro.message === 'UrlCurta já registrada') {
            return 'Esse endereço curto já está em uso. Escolha outro.';
        }
        if (erro.status === 422 && erro.detalhes.length) {
            return erro.detalhes
                .map((detalhe) =>
                    detalhe
                        .replace(/^(?:body|query|params)\.[^:]+:\s*/, '')
                        .replace(
                            'Slug inválido ou reservado',
                            'Esse endereço curto não está disponível. Escolha outro.'
                        )
                )
                .join(' ');
        }
        return erro.message;
    }
    return 'Não foi possível conectar ao servidor. Confira sua conexão e tente novamente.';
}

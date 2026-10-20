export interface ConsultaLinks {
    filtro: string;
    pagina: number;
    limite: number;
}

export function lerConsultaLinks(parametros: URLSearchParams): ConsultaLinks {
    const paginaTexto = parametros.get('pagina') ?? '';
    const pagina = /^\d+$/.test(paginaTexto) ? Number(paginaTexto) : 1;
    const limite = Number(parametros.get('limite'));
    return {
        filtro: (parametros.get('filtro') ?? '').slice(0, 200),
        pagina: Number.isSafeInteger(pagina) && pagina > 0 ? pagina : 1,
        limite: [10, 20, 50].includes(limite) ? limite : 10
    };
}

export function atualizarConsultaLinks(
    parametros: URLSearchParams,
    alteracoes: Partial<ConsultaLinks>
): URLSearchParams {
    const proxima = new URLSearchParams(parametros);
    const consulta = { ...lerConsultaLinks(parametros), ...alteracoes };
    // Mantém endereços curtos, sem descartar parâmetros de outras funcionalidades.
    for (const [chave, valor, padrao] of [
        ['filtro', consulta.filtro, ''],
        ['pagina', String(consulta.pagina), '1'],
        ['limite', String(consulta.limite), '10']
    ]) {
        if (valor === padrao) {
            proxima.delete(chave);
        } else {
            proxima.set(chave, valor);
        }
    }
    return proxima;
}

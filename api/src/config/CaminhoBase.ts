import './Ambiente';

export function validarCaminhoBase(valor = ''): string {
    if (valor && !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(valor)) {
        throw new Error('APP_CAMINHO_BASE inválido; use /breve-link sem barra final ou vazio');
    }
    return valor;
}
export const CAMINHO_BASE = validarCaminhoBase(process.env.APP_CAMINHO_BASE);

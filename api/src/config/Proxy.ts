import { isIP } from 'node:net';

export function validarProxy(valor = ''): false | string[] {
    if (!valor.trim()) {
        return false;
    }
    const proxies = valor.split(',').map((item) => item.trim());
    for (const proxy of proxies) {
        const partes = proxy.split('/');
        const versao = isIP(partes[0]);
        if (
            !versao ||
            partes.length > 2 ||
            (partes.length === 2 &&
                (!/^\d+$/.test(partes[1]) ||
                    Number(partes[1]) < 1 ||
                    Number(partes[1]) > (versao === 4 ? 32 : 128)))
        ) {
            throw new Error(
                'TRUST_PROXY inválido: informe IPs/CIDRs explícitos separados por vírgula'
            );
        }
    }
    return proxies;
}

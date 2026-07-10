import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

interface DadosNavegador {
    navegador: string | null;
    sistemaOperacional: string | null;
    dispositivo: string | null;
}

interface DadosGeolocalizacao {
    pais: string | null;
    cidade: string | null;
}

class ParserUtil {
    static parsearUserAgent(userAgent: string | undefined): DadosNavegador {
        if (!userAgent) {
            return { navegador: null, sistemaOperacional: null, dispositivo: null };
        }

        const parser = new UAParser(userAgent);
        const resultado = parser.getResult();

        return {
            navegador: resultado.browser.name || null,
            sistemaOperacional: resultado.os.name || null,
            dispositivo: resultado.device.type || 'desktop'
        };
    }

    static obterGeolocalizacao(ip: string | null): DadosGeolocalizacao {
        if (!ip || ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
            return { pais: null, cidade: null };
        }

        const geo = geoip.lookup(ip);
        if (!geo) {
            return { pais: null, cidade: null };
        }

        return {
            pais: geo.country || null,
            cidade: geo.city || null
        };
    }

    static extrairIp(requisicao: { ip?: string; headers?: Record<string, string | string[] | undefined> }): string | null {
        const forwarded = requisicao.headers?.['x-forwarded-for'];
        if (forwarded) {
            const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
            return ip || null;
        }

        return requisicao.ip || null;
    }
}


export { ParserUtil };

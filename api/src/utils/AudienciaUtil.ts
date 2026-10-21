import { createHash } from 'node:crypto';
import { Request } from 'express';

// Camada 1: somente dados recebidos na requisição, sem consultas externas.
export class AudienciaUtil {
    static coletar(req: Request) {
        const header = (nome: string, limite = 512) => req.get(nome)?.slice(0, limite) || null;
        const userAgent = header('user-agent', 2048);
        const idioma = header('accept-language', 256);
        const encoding = header('accept-encoding', 256);
        const respeitarPrivacidade = header('dnt') === '1' || header('sec-gpc') === '1';
        return {
            metodo: req.method,
            caminho: req.path.slice(0, 2048),
            clientHints: header('sec-ch-ua'),
            accept: header('accept'),
            acceptEncoding: encoding,
            versaoHttp: req.httpVersion || null,
            // Somente hints que já vieram no acesso; não solicita dados adicionais.
            clientHintsMobile: header('sec-ch-ua-mobile', 16),
            clientHintsPlataforma: header('sec-ch-ua-platform', 128),
            clientHintsVersaoPlataforma: header('sec-ch-ua-platform-version', 128),
            clientHintsArquitetura: header('sec-ch-ua-arch', 64),
            clientHintsModelo: header('sec-ch-ua-model', 128),
            clientHintsVersaoCompleta: header('sec-ch-ua-full-version-list'),
            fetchUser: header('sec-fetch-user', 16),
            purpose: header('purpose', 64),
            secPurpose: header('sec-purpose', 64),
            saveData: header('save-data', 16),
            fetchSite: header('sec-fetch-site', 64),
            fetchMode: header('sec-fetch-mode', 64),
            fetchDest: header('sec-fetch-dest', 64),
            dnt: header('dnt', 8),
            gpc: header('sec-gpc', 8),
            hashDispositivo:
                respeitarPrivacidade || !userAgent
                    ? null
                    : createHash('sha256')
                          .update(JSON.stringify([userAgent, idioma, encoding]))
                          .digest('hex')
        };
    }
}

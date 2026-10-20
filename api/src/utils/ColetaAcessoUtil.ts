import { Request } from 'express';
import { logger } from '../config/Logger';
import { CadastrarAcessoDto } from '../models';
import { AudienciaUtil } from './AudienciaUtil';
import { ParserUtil } from './ParserUtil';

export class ColetaAcessoUtil {
    static coletar(req: Request, linkId: number): Omit<CadastrarAcessoDto, 'linkId'> {
        const ip = ParserUtil.extrairIp(req);
        const cliente = ParserUtil.parsearUserAgent(req.headers['user-agent']);
        const localizacao = this.obterLocalizacao(ip, linkId);

        return {
            ip,
            ...cliente,
            ...localizacao,
            ...AudienciaUtil.coletar(req),
            userAgent: req.headers['user-agent']?.slice(0, 2048) || null,
            idioma: req.get('accept-language')?.slice(0, 256) || null,
            referrer: (req.get('referer') ?? req.get('referrer') ?? '').slice(0, 500) || null
        };
    }

    private static obterLocalizacao(ip: string | null, linkId: number) {
        try {
            return ParserUtil.obterGeolocalizacao(ip);
        } catch {
            logger.warn({ linkId }, 'GeoIP indisponível; acesso será registrado sem localização');
            return { pais: null, cidade: null };
        }
    }
}

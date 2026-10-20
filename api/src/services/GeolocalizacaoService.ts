import { randomBytes, randomUUID } from 'node:crypto';
import { Knex } from '../config/knex';
import { RequisicaoInvalida } from '../erros';
import {
    ClusterGeografico,
    ContagemGeoStatus,
    EstatisticasGeolocalizacao
} from '../models/Geolocalizacao';

const VALIDADE_TOKEN_MS = 5 * 60 * 1000;
const STATUS_PERMITIDOS = new Set([
    'granted_silent',
    'granted_prompt',
    'denied',
    'error',
    'unsupported'
]);
const CAMPOS_OPCIONAIS = new Set(['altitude', 'heading', 'speed']);
const LIMITES_COORDENADAS: Record<string, [number, number]> = {
    lat: [-90, 90],
    lon: [-180, 180],
    accuracy: [0, Number.MAX_VALUE],
    altitude: [-Number.MAX_VALUE, Number.MAX_VALUE],
    heading: [0, 360],
    speed: [0, Number.MAX_VALUE],
    positionTimestamp: [0, 8640000000000000]
};

type PayloadColeta = Record<string, unknown> & { token: string; geo_status: string };

function validarPayload(body: unknown): PayloadColeta {
    if (!body || typeof body !== 'object') {
        throw new RequisicaoInvalida('Coleta inválida');
    }

    const payload = body as Record<string, unknown>;
    const tokenValido = typeof payload.token === 'string' && /^[a-f0-9]{64}$/.test(payload.token);
    const statusValido = STATUS_PERMITIDOS.has(String(payload.geo_status));
    if (!tokenValido || !statusValido) {
        throw new RequisicaoInvalida('Coleta inválida');
    }

    return payload as PayloadColeta;
}

function validarCoordenadas(payload: PayloadColeta): Record<string, number | null> {
    const coordenadas: Record<string, number | null> = {};

    for (const [campo, [minimo, maximo]] of Object.entries(LIMITES_COORDENADAS)) {
        const valor = payload[campo];
        if (valor == null && CAMPOS_OPCIONAIS.has(campo)) {
            coordenadas[campo] = null;
            continue;
        }

        const numeroValido = typeof valor === 'number' && Number.isFinite(valor);
        if (
            !numeroValido ||
            valor < minimo ||
            valor > maximo ||
            (campo === 'heading' && valor === 360)
        ) {
            throw new RequisicaoInvalida('Coordenadas inválidas');
        }
        coordenadas[campo] = valor;
    }

    return coordenadas;
}

export class GeolocalizacaoService {
    static contexto() {
        return {
            sessionUid: randomUUID(),
            geoToken: randomBytes(32).toString('hex'),
            geoExpiraEm: Date.now() + VALIDADE_TOKEN_MS
        };
    }

    static async coletar(body: unknown): Promise<void> {
        const payload = validarPayload(body);
        const capturaAprovada = String(payload.geo_status).startsWith('granted_');
        const coordenadas = capturaAprovada ? validarCoordenadas(payload) : {};
        const dados = {
            ...coordenadas,
            geo_status: payload.geo_status,
            geoToken: null,
            geoExpiraEm: null
        };

        // Consome o token na mesma atualização que complementa o clique original.
        await Knex('acessos')
            .where({ geoToken: payload.token })
            .where('geoExpiraEm', '>', Date.now())
            .update(dados);
    }

    static async estatisticas(linkId: number): Promise<EstatisticasGeolocalizacao> {
        const estados = (await Knex('acessos')
            .where({ linkId })
            .whereNotNull('geo_status')
            .select('geo_status')
            .count('id as total')
            .groupBy('geo_status')) as unknown as ContagemGeoStatus[];
        const porStatus: Record<string, number> = Object.fromEntries(
            estados.map((estado) => [estado.geo_status, Number(estado.total)])
        );
        const capturadas = (porStatus.granted_silent ?? 0) + (porStatus.granted_prompt ?? 0);
        const total = Object.values(porStatus).reduce((soma, quantidade) => soma + quantidade, 0);
        const clusters = await this.obterClusters(linkId);

        return {
            capturadas,
            total,
            taxaAprovacao: total ? (capturadas / total) * 100 : 0,
            porStatus,
            clusters
        };
    }

    private static async obterClusters(linkId: number): Promise<ClusterGeografico[]> {
        // Células de 0,01 grau (~1,1 km em latitude); aproximação, não distância exata.
        return Knex('acessos')
            .where({ linkId })
            .whereNotNull('lat')
            .whereNotNull('lon')
            .select(Knex.raw('ROUND(lat, 2) as lat, ROUND(lon, 2) as lon'))
            .count('id as total')
            .groupByRaw('ROUND(lat, 2), ROUND(lon, 2)')
            .orderBy('total', 'desc') as unknown as Promise<ClusterGeografico[]>;
    }
}

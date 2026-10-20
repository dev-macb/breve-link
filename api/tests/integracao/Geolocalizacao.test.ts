import request from 'supertest';
import { servidor } from '../../src/app';
import { Knex } from '../../src/config/knex';
import { GeolocalizacaoService } from '../../src/services/GeolocalizacaoService';

describe('Localização opcional do visitante', () => {
    beforeAll(async () => {
        await Knex.migrate.latest();
        await Knex('links').insert([
            { urlCurta: 'com-geo', urlOriginal: 'https://example.com', geo: true },
            { urlCurta: 'sem-geo', urlOriginal: 'https://example.com', geo: false }
        ]);
    });
    afterAll(async () => {
        await Knex.destroy();
    });
    it('preserva redirect normal e HEAD', async () => {
        await request(servidor).get('/sem-geo').expect(302);
        await request(servidor).head('/com-geo').expect(302);
        expect(await Knex('acessos')).toHaveLength(1);
    });
    it('redireciona diretamente mesmo com geo habilitado e não emite token', async () => {
        for (const caminho of ['/com-geo', '/links/redirecionar/com-geo']) {
            const resposta = await request(servidor).get(caminho).expect(302);
            expect(resposta.headers.location).toBe('https://example.com');
            expect(resposta.text).not.toContain('<script');
        }
        expect(await Knex('acessos').whereNotNull('geoToken')).toHaveLength(0);
    });
    it('preserva coleta de tokens já emitidos e estatísticas históricas', async () => {
        const link = await Knex('links').where({ urlCurta: 'com-geo' }).first();
        const [acesso] = await Knex('acessos')
            .insert({ linkId: link!.id, ...GeolocalizacaoService.contexto() })
            .returning('*');
        const payload = {
            token: acesso!.geoToken,
            geo_status: 'granted_prompt',
            lat: -23.55,
            lon: -46.63,
            accuracy: 10,
            altitude: null,
            heading: null,
            speed: null,
            positionTimestamp: Date.now()
        };
        await request(servidor).post('/collect').send(payload).expect(204);
        await request(servidor)
            .post('/collect')
            .send({ token: acesso!.geoToken, geo_status: 'denied' })
            .expect(204);
        expect(await Knex('acessos').where({ id: acesso!.id }).first()).toMatchObject({
            geo_status: 'granted_prompt',
            lat: -23.55,
            geoToken: null,
            sessionUid: acesso!.sessionUid,
            hashDispositivo: acesso!.hashDispositivo
        });
        expect((await Knex('links').where({ id: acesso!.linkId }).first())!.acessos).toBe(2);
        expect(await GeolocalizacaoService.estatisticas(acesso!.linkId)).toMatchObject({
            capturadas: 1,
            taxaAprovacao: 100,
            clusters: [{ total: 1 }]
        });
    });
    it('rejeita coordenadas inválidas e ignora tokens expirados', async () => {
        const link = await Knex('links').where({ urlCurta: 'com-geo' }).first();
        const [acesso] = await Knex('acessos')
            .insert({ linkId: link!.id, ...GeolocalizacaoService.contexto() })
            .returning('*');
        await request(servidor)
            .post('/collect')
            .send({ token: acesso!.geoToken, geo_status: 'granted_silent', lat: 91 })
            .expect(422);
        await Knex('acessos').where({ id: acesso!.id }).update({ geoExpiraEm: 1 });
        await request(servidor)
            .post('/collect')
            .send({ token: acesso!.geoToken, geo_status: 'denied' })
            .expect(204);
        expect((await Knex('acessos').where({ id: acesso!.id }).first())!.geo_status).toBeNull();
    });
});

import 'reflect-metadata';
import request from 'supertest';
import { createHash } from 'node:crypto';
import { servidor } from '../../src/app';
import { Knex } from '../../src/config/knex';
import { ParserUtil } from '../../src/utils/ParserUtil';
import { container } from '../../src/config/Conteiner';
import { TIPOS } from '../../src/config/Constantes';
import { IAcessoService } from '../../src/interfaces';
import { AcessoRepository } from '../../src/repositories/AcessoRepository';

describe('Coleta local de audiência', () => {
    beforeAll(async () => {
        await Knex.migrate.latest();
        await Knex('links').insert({
            urlCurta: 'acesso-local',
            urlOriginal: 'https://example.com',
            ativo: true
        });
    });
    afterAll(async () => {
        await Knex.destroy();
    });

    it('persiste headers sem mudar destino, ignora query não autorizada e HEAD', async () => {
        await request(servidor).head('/acesso-local?utm_source=head').expect(302);
        expect(await Knex('acessos')).toHaveLength(0);
        const res = await request(servidor)
            .get('/acesso-local?utm_source=email&utm_campaign=lancamento&token=segredo')
            .set('User-Agent', 'Cliente local')
            .set('Sec-CH-UA', 'Browser')
            .set('Sec-CH-UA-Mobile', '?1')
            .set('Sec-CH-UA-Platform', '"Android"')
            .set('Sec-CH-UA-Platform-Version', '"15"')
            .set('Sec-CH-UA-Arch', '"arm"')
            .set('Sec-CH-UA-Model', '"Modelo teste"')
            .set('Sec-CH-UA-Full-Version-List', '"Browser";v="130.1"')
            .set('Sec-Fetch-User', '?1')
            .set('Purpose', 'prefetch')
            .set('Sec-Purpose', 'prefetch')
            .set('Save-Data', 'on')
            .set('Accept', 'text/html')
            .set('Cookie', 'segredo=nao-gravar')
            .set('Authorization', 'Bearer nao-gravar')
            .set('Sec-Fetch-Site', 'cross-site')
            .expect(302);
        expect(res.headers.location).toBe('https://example.com');
        expect(res.headers['accept-ch']).toBeUndefined();
        const registro = await Knex('acessos').first();
        expect(registro).toMatchObject({
            metodo: 'GET',
            caminho: '/acesso-local',
            utmSource: null,
            clientHints: 'Browser',
            fetchSite: 'cross-site',
            clientHintsMobile: '?1',
            clientHintsPlataforma: '"Android"',
            clientHintsVersaoPlataforma: '"15"',
            clientHintsArquitetura: '"arm"',
            clientHintsModelo: '"Modelo teste"',
            clientHintsVersaoCompleta: '"Browser";v="130.1"',
            fetchUser: '?1',
            purpose: 'prefetch',
            secPurpose: 'prefetch',
            saveData: 'on',
            accept: 'text/html',
            versaoHttp: '1.1'
        });
        expect(registro!.hashDispositivo).toMatch(/^[a-f0-9]{64}$/);
        expect(registro!.hashDispositivo).toBe(
            createHash('sha256')
                .update(
                    JSON.stringify([
                        registro!.userAgent,
                        registro!.idioma,
                        registro!.acceptEncoding
                    ])
                )
                .digest('hex')
        );
        expect(JSON.stringify(registro)).not.toContain('segredo');
        expect(JSON.stringify(registro)).not.toContain('nao-gravar');
        const recentes = await new AcessoRepository().obterRecentes(registro!.linkId);
        expect(recentes[0]).toMatchObject({
            clientHintsModelo: '"Modelo teste"',
            versaoHttp: '1.1'
        });
    });

    it('respeita DNT e GPC na correlação e gera hash estável para os mesmos headers', async () => {
        for (const privacidade of [{ DNT: '1' }, { 'Sec-GPC': '1' }]) {
            await request(servidor)
                .get('/acesso-local')
                .set('User-Agent', 'Cliente local')
                .set(privacidade)
                .expect(302);
            expect(
                (await Knex('acessos').orderBy('id', 'desc').first())!.hashDispositivo
            ).toBeNull();
        }
        await request(servidor).get('/acesso-local').set('User-Agent', 'Cliente local').expect(302);
        const registros = await Knex('acessos').orderBy('id');
        expect(registros[3].hashDispositivo).toBe(registros[0].hashDispositivo);
    });

    it('mantém redirecionamento quando enriquecimento local falha', async () => {
        const mock = jest.spyOn(ParserUtil, 'obterGeolocalizacao').mockImplementation(() => {
            throw new Error('falha local');
        });
        try {
            const res = await request(servidor)
                .get('/acesso-local')
                .set('User-Agent', 'Cliente local')
                .expect(302);
            expect(res.headers.location).toBe('https://example.com');
            const acesso = await Knex('acessos').orderBy('id', 'desc').first();
            expect(acesso).toMatchObject({ pais: null, cidade: null, userAgent: 'Cliente local' });
            expect(await Knex('acessos')).toHaveLength(5);
        } finally {
            mock.mockRestore();
        }
    });

    it('agrega todo o histórico sem misturar links e separa acessos sem hash', async () => {
        const link = await Knex('links').where({ urlCurta: 'acesso-local' }).first();
        const [outro] = await Knex('links')
            .insert({ urlCurta: 'outra-campanha', urlOriginal: 'https://example.org', ativo: true })
            .returning('*');
        await Knex('acessos').insert({ linkId: outro.id, hashDispositivo: 'outro-hash' });
        await Knex('acessos').insert(
            Array.from({ length: 105 }, () => ({
                linkId: link!.id,
                utmSource: 'legado',
                hashDispositivo: 'hash-anterior',
                criadoEm: Knex.raw('?', ['2026-01-01 00:00:00'])
            }))
        );
        const servico = container.get<IAcessoService>(TIPOS.IAcessoService);
        const stats = await servico.obterEstatisticas(link!.id);
        expect(stats!.totalAcessos).toBe(110);
        expect(stats!.acessosRecentes).toHaveLength(100);
        expect(stats).not.toHaveProperty('marketing');
        expect(stats!.acessosRecentes[0]).not.toHaveProperty('utmSource');
        expect(stats!.fingerprint).toMatchObject({ hashesDistintos: 2, acessosComHash: 108 });
        expect(stats!.fingerprint.grupos).toHaveLength(2);
        expect(stats!.fingerprint.grupos[0]).toEqual({
            hashDispositivo: 'hash-anterior',
            acessos: 105,
            primeiroAcesso: '2026-01-01 00:00:00',
            ultimoAcesso: '2026-01-01 00:00:00'
        });
        const [vazio] = await Knex('links')
            .insert({ urlCurta: 'sem-acessos', urlOriginal: 'https://example.org', ativo: true })
            .returning('*');
        expect(await new AcessoRepository().obterFingerprint(vazio.id)).toEqual({
            hashesDistintos: 0,
            acessosComHash: 0,
            grupos: []
        });
        await Knex('acessos').insert(
            Array.from({ length: 25 }, (_, indice) => ({
                linkId: link!.id,
                hashDispositivo: 'hash-' + indice
            }))
        );
        const resumo = await new AcessoRepository().obterFingerprint(link!.id);
        expect(resumo.grupos).toHaveLength(20);
        expect(resumo.hashesDistintos).toBe(27);
        expect(resumo.acessosComHash).toBe(133);
        expect(resumo.grupos[0].acessos).toBe(105);
    });

    it('limita hints recebidos e mantem campos ausentes nulos no redirect legado', async () => {
        await request(servidor)
            .get('/links/redirecionar/acesso-local')
            .set('Sec-CH-UA-Full-Version-List', 'x'.repeat(1024))
            .expect(302);
        const acesso = await Knex('acessos').orderBy('id', 'desc').first();
        expect(acesso!.clientHintsVersaoCompleta).toHaveLength(512);
        expect(acesso!.clientHintsModelo).toBeNull();
        expect(acesso!.saveData).toBeNull();
    });
});

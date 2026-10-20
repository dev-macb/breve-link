import express from 'express';
import request from 'supertest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import path from 'path';
import os from 'os';
import { interfaceWeb, erroPublico } from '../../src/config/InterfaceWeb';
import { ErroMiddleware } from '../../src/middlewares/ErroMiddleware';
import { LinkIndisponivel, RecursoNaoEncontrado } from '../../src/erros';

describe('Integração de arquivos e páginas', () => {
    const diretorio = mkdtempSync(path.join(os.tmpdir(), 'breve-interface-'));
    const app = express();
    beforeAll(() => {
        mkdirSync(path.join(diretorio, 'assets'));
        writeFileSync(
            path.join(diretorio, 'index.html'),
            '<!doctype html><title>SPA de teste</title>'
        );
        writeFileSync(path.join(diretorio, 'assets', 'app-hash.js'), 'console.log("app")');
        writeFileSync(path.join(diretorio, 'favicon.svg'), '<svg/>');
        app.use('/api', (_req, _res, next) => next(new RecursoNaoEncontrado()));
        app.use(interfaceWeb(diretorio));
        app.get('/pausado', () => {
            throw new LinkIndisponivel();
        });
        app.use((_req, _res, next) => next(new RecursoNaoEncontrado()));
        app.use(erroPublico, ErroMiddleware);
    });
    afterAll(() => rmSync(diretorio, { recursive: true, force: true }));

    it.each(['/', '/login', '/dashboard', '/links/12', '/indisponivel'])(
        'serve navegação direta em %s',
        async (rota) => {
            const res = await request(app).get(rota).set('Accept', 'text/html').expect(200);
            expect(res.text).toContain('SPA de teste');
            expect(res.headers['cache-control']).toBe('no-store');
        }
    );
    it('separa cache dos assets versionados e arquivos públicos', async () => {
        const asset = await request(app).get('/assets/app-hash.js').expect(200);
        expect(asset.headers['cache-control']).toContain('immutable');
        expect(asset.headers['content-type']).toMatch(/javascript/);
        const favicon = await request(app).get('/favicon.svg').expect(200);
        expect(favicon.headers['cache-control']).toBe('no-cache');
    });
    it.each([
        '/api/inexistente',
        '/api',
        '/assets/ausente.js',
        '/favicon-ausente.svg',
        '/pagina/desconhecida',
        '/.env'
    ])('não transforma %s em SPA', async (rota) => {
        const res = await request(app).get(rota).set('Accept', 'text/html').expect(404);
        expect(res.text).not.toContain('SPA de teste');
        if (rota.startsWith('/api')) {
            expect(res.type).toBe('application/json');
        }
    });
    it('preserva 410 e oferece HTML sem expor dados do erro', async () => {
        const res = await request(app).get('/pausado').set('Accept', 'text/html').expect(410);
        expect(res.text).toContain('Esta conexão está em pausa.');
        expect(res.headers['cache-control']).toBe('no-store');
        const json = await request(app)
            .get('/pausado')
            .set('Accept', 'application/json')
            .expect(410);
        expect(json.body).toEqual({ erro: 'Link inativo ou expirado' });
    });
    it('não faz fallback para POST ou clientes JSON', async () => {
        await request(app)
            .post('/dashboard')
            .set('Accept', 'text/html')
            .expect(404)
            .expect('Content-Type', /json/);
        await request(app).get('/dashboard').set('Accept', 'application/json').expect(404);
        await request(app).head('/dashboard').expect(200).expect('Cache-Control', 'no-store');
    });
});

import request from 'supertest';

process.env.APP_CAMINHO_BASE = '/breve-link';
process.env.NODE_ENV = 'test';

import { servidor } from '../../src/app';
import { Knex } from '../../src/config/knex';
import { opcoesCookie } from '../../src/config/Sessao';
import { validarCaminhoBase } from '../../src/config/CaminhoBase';
import { seed } from '../../src/seeds/001_InserirUsuarioAdministrador';

beforeAll(async () => {
    process.env.APP_ORIGEM = 'https://example.com';
    process.env.JWT_SEGREDO = 'segredo-de-teste-com-mais-de-trinta-e-dois-bytes';
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.ADMIN_SENHA = 'senha-segura-teste';
    await Knex.migrate.latest();
    await seed(Knex);
});

afterAll(() => Knex.destroy());

it('publica a saúde sob o prefixo sem ocupar a API raiz', async () => {
    await request(servidor).get('/breve-link/api/saude').expect(200);
    await request(servidor).get('/api/saude').expect(404);
});
it('mantém erros públicos e recursos no prefixo', async () => {
    const resposta = await request(servidor)
        .get('/breve-link/rota/ausente')
        .set('Accept', 'text/html')
        .expect(404);
    expect(resposta.text).toContain('src="/breve-link/tema.js"');
    expect(resposta.text).toContain('href="/breve-link/"');
    const api = await request(servidor)
        .get('/breve-link/api/ausente')
        .set('Accept', 'text/html')
        .expect(404);
    expect(api.type).toBe('application/json');
    expect(opcoesCookie().path).toBe('/breve-link');
});
it('autentica, publica links e encerra a sessão sob o prefixo', async () => {
    const csrf = { 'X-Breve-CSRF': '1', Origin: 'https://example.com' };
    const login = await request(servidor)
        .post('/breve-link/api/auth/login')
        .set(csrf)
        .send({ email: 'admin@example.com', senha: 'senha-segura-teste' })
        .expect(204);
    const sessao = login.headers['set-cookie'][0];
    expect(sessao).toContain('Path=/breve-link');
    const cookie = sessao.split(';')[0];
    const config = await request(servidor)
        .get('/breve-link/api/configuracao')
        .set('Cookie', cookie)
        .expect(200);
    expect(config.body.origemPublica).toBe('https://example.com/breve-link');
    await request(servidor)
        .post('/breve-link/api/links')
        .set(csrf)
        .set('Cookie', cookie)
        .send({ urlOriginal: 'https://example.org/destino', urlCurta: 'meu-link' })
        .expect(201);
    const redirect = await request(servidor).get('/breve-link/meu-link').expect(302);
    expect(redirect.headers.location).toBe('https://example.org/destino');
    const logout = await request(servidor)
        .post('/breve-link/api/auth/logout')
        .set(csrf)
        .set('Cookie', cookie)
        .send({})
        .expect(204);
    expect(logout.headers['set-cookie'][0]).toContain('Path=/breve-link');
    await request(servidor).get('/breve-link/api/auth/me').set('Cookie', cookie).expect(401);
});
it.each(['/breve-link/', 'breve-link', '/<script>', '/a?b'])(
    'rejeita prefixo inválido %s',
    (valor) => {
        expect(() => validarCaminhoBase(valor)).toThrow();
    }
);

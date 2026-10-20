import 'reflect-metadata';
import request from 'supertest';
import { servidor } from '../../src/app';
import { Knex } from '../../src/config/knex';
import { HashUtil } from '../../src/utils/HashUtil';
import { AcessoRepository } from '../../src/repositories/AcessoRepository';
import { seed } from '../../src/seeds/001_InserirUsuarioAdministrador';

describe('API integrada com SQLite', () => {
    const segredoAnterior = process.env.JWT_SEGREDO;
    const origemAnterior = process.env.APP_ORIGEM;
    const senha = 'senha-segura-teste';
    let cookie: string;
    let administrador: number;
    const csrf = { 'X-Breve-CSRF': '1', Origin: 'http://localhost:3000' };

    async function entrar(email = 'admin@example.com') {
        const res = await request(servidor).post('/api/auth/login').set(csrf).send({ email, senha }).expect(204);
        return res.headers['set-cookie'][0].split(';')[0];
    }
    const api = () => request(servidor);
    beforeAll(async () => {
        process.env.JWT_SEGREDO = 'segredo-de-teste-com-mais-de-trinta-e-dois-bytes';
        process.env.APP_ORIGEM = 'http://localhost:3000';
        await Knex.migrate.latest();
        const [usuario] = await Knex('usuarios').insert({ nome: 'Admin', email: 'admin@example.com', senha: await HashUtil.Criptografar(senha), ativo: true, administrador: true }).returning('*');
        administrador = usuario.id;
        cookie = await entrar();
    });
    afterAll(async () => {
        await Knex.destroy();
        if (segredoAnterior === undefined) delete process.env.JWT_SEGREDO; else process.env.JWT_SEGREDO = segredoAnterior;
        if (origemAnterior === undefined) delete process.env.APP_ORIGEM; else process.env.APP_ORIGEM = origemAnterior;
    });

    it('configura cookie de sessao e restaura usuario sem segredos', async () => {
        const res = await api().post('/api/auth/login').set(csrf).send({ email: ' ADMIN@EXAMPLE.COM ', senha }).expect(204);
        expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/);
        expect(res.headers['set-cookie'][0]).toMatch(/SameSite=Strict/);
        expect(res.text).toBe('');
        const me = await api().get('/api/auth/me').set('Cookie', cookie).expect(200);
        expect(me.body).toMatchObject({ id: administrador, email: 'admin@example.com' });
        expect(me.body).not.toHaveProperty('senha');
        expect(me.body).not.toHaveProperty('versaoSessao');
        await api().get('/api/links').expect(401);
        await api().get('/api/auth/me').set('Cookie', 'breve_sessao=invalido').expect(401);
    });

    it('rejeita CSRF, origem externa e JSON malformado', async () => {
        await api().post('/api/links').set('Cookie', cookie).send({ urlOriginal: 'https://example.com' }).expect(403);
        await api().post('/api/links').set('Cookie', cookie).set({ ...csrf, Origin: 'https://externo.example' }).send({ urlOriginal: 'https://example.com' }).expect(403);
        const res = await api().post('/api/links').set('Cookie', cookie).set(csrf).set('Content-Type', 'application/json').send('{').expect(400);
        expect(res.body).toEqual({ erro: 'JSON inválido' });
    });

    it('informa origem publica autenticada e mantem as rotas da interface reservadas', async () => {
        await api().get('/api/configuracao').expect(401);
        const config = await api().get('/api/configuracao').set('Cookie', cookie).expect(200);
        expect(config.body).toEqual({ origemPublica: 'http://localhost:3000' });
        await api().get('/login').set('Accept', 'application/json').expect(404);
    });

    it('valida entradas e impede campos internos, slugs reservados e protocolos perigosos', async () => {
        for (const urlCurta of ['api', 'LOGIN', 'indisponivel', 'abc/def', 'x'.repeat(51)]) {
            await api().post('/api/links').set('Cookie', cookie).set(csrf).send({ urlOriginal: 'https://example.com', urlCurta }).expect(422);
        }
        for (const urlOriginal of ['javascript:alert(1)', 'ftp://example.com', 'https://user:pass@example.com']) {
            await api().post('/api/links').set('Cookie', cookie).set(csrf).send({ urlOriginal }).expect(422);
        }
        await api().get('/api/links?limite=101').set('Cookie', cookie).expect(422);
        const usuario = await api().post('/api/usuarios').set('Cookie', cookie).set(csrf).send({ nome: 'Novo', email: ' NOVO@EXAMPLE.COM ', senha, ativo: true, administrador: false, versaoSessao: 900 }).expect(201);
        expect(usuario.body.email).toBe('novo@example.com');
        expect(usuario.body).not.toHaveProperty('senha');
        const persistido = await Knex('usuarios').where({ id: usuario.body.id }).first();
        expect(persistido!.versaoSessao).toBe(0);
        expect(await HashUtil.Comparar(senha, persistido!.senha)).toBe(true);
        await api().post('/api/usuarios').set('Cookie', cookie).set(csrf).send({ nome: 'Outro', email: 'novo@example.com', senha, ativo: true, administrador: false }).expect(409);
        const comum = await entrar('novo@example.com');
        await api().get('/api/links').set('Cookie', comum).expect(403);
    });

    it('cria link, redireciona com 302, registra transacoes concorrentes e retorna stats', async () => {
        const criado = await api().post('/api/links').set('Cookie', cookie).set(csrf).send({ urlOriginal: 'https://example.com', urlCurta: 'fluxo-teste', acessos: 999 }).expect(201);
        expect(criado.body.acessos).toBe(0);
        await api().head('/fluxo-teste').expect(302);
        await api().head('/links/redirecionar/fluxo-teste').expect(302);
        expect(await Knex('acessos').where({ linkId: criado.body.id })).toHaveLength(0);
        const redirects = await Promise.all([
            ...Array.from({ length: 7 }, () => api().get('/links/redirecionar/fluxo-teste').expect(302)),
            api().get('/fluxo-teste').expect(302)
        ]);
        expect(redirects[0].headers.location).toBe('https://example.com');
        expect(redirects[0].headers['cache-control']).toBe('no-store');
        const registros = await Knex('acessos').where({ linkId: criado.body.id });
        expect(registros).toHaveLength(8);
        expect(registros[0].ip).not.toBe('8.8.8.8');
        const stats = await api().get('/api/links/' + criado.body.id + '/stats').set('Cookie', cookie).expect(200);
        expect(stats.body.totalAcessos).toBe(8);
        const editado = await api().patch('/api/links/' + criado.body.id).set('Cookie', cookie).set(csrf).send({ acessos: 500 }).expect(200);
        expect(editado.body.acessos).toBe(8);
        const pagina = await api().get('/api/links?filtro=fluxo&pagina=1&limite=1').set('Cookie', cookie).expect(200);
        expect(pagina.body).toMatchObject({ total: 1, pagina: 1, limite: 1, totalPaginas: 1 });
        expect(pagina.body.itens).toHaveLength(1);
        const porDestino = await api().get('/api/links?filtro=example.com').set('Cookie', cookie).expect(200);
        expect(porDestino.body.total).toBe(1);
        expect(porDestino.body.itens[0].urlCurta).toBe('fluxo-teste');
    });

    it('retorna conflito em criacoes concorrentes de um mesmo slug', async () => {
        const resultados = await Promise.all(Array.from({ length: 2 }, () => api().post('/api/links').set('Cookie', cookie).set(csrf).send({ urlOriginal: 'https://example.com', urlCurta: 'concorrente' })));
        expect(resultados.map(res => res.status).sort()).toEqual([201, 409]);
        const id = (await Knex('links').where({ urlCurta: 'concorrente' }).first())!.id;
        await api().patch('/api/links/' + id).set('Cookie', cookie).set(csrf).send({ urlCurta: 'fluxo-teste' }).expect(409);
        await api().patch('/api/links/' + id).set('Cookie', cookie).set(csrf).send({ urlCurta: 'dashboard' }).expect(422);
    });

    it('persiste expiracao em ISO e permite remove-la', async () => {
        const expiraEm = new Date(Date.now() + 3600000).toISOString();
        const criado = await api().post('/api/links').set('Cookie', cookie).set(csrf).send({ urlOriginal: 'https://example.com', urlCurta: 'tempo-teste', expiraEm }).expect(201);
        expect(criado.body.expiraEm).toBe(expiraEm);
        await api().patch('/api/links/' + criado.body.id).set('Cookie', cookie).set(csrf).send({ expiraEm: new Date(0).toISOString() }).expect(422);
        const atualizado = await api().patch('/api/links/' + criado.body.id).set('Cookie', cookie).set(csrf).send({ expiraEm: null }).expect(200);
        expect(atualizado.body.expiraEm).toBeNull();
    });

    it('desativacao invalida imediatamente uma sessao existente', async () => {
        const [usuario] = await Knex('usuarios').insert({ nome: 'Temporario', email: 'temporario@example.com', senha: await HashUtil.Criptografar(senha), ativo: true, administrador: false }).returning('*');
        const sessao = await entrar('temporario@example.com');
        await api().patch('/api/usuarios/' + usuario.id).set('Cookie', cookie).set(csrf).send({ ativo: false }).expect(200);
        await api().get('/api/auth/me').set('Cookie', sessao).expect(401);
        await api().post('/api/auth/login').set(csrf).send({ email: 'temporario@example.com', senha }).expect(401);
    });

    it('nao registra eventos para links inativos, expirados ou inexistentes', async () => {
        await Knex('links').insert([{ urlOriginal: 'https://example.com', urlCurta: 'inativo', ativo: false, expiraEm: null }, { urlOriginal: 'https://example.com', urlCurta: 'expirado', ativo: true, expiraEm: new Date(0) }]);
        await api().get('/links/redirecionar/inativo').expect(410);
        await api().get('/links/redirecionar/expirado').expect(410);
        await api().get('/links/redirecionar/inexistente').expect(404);
        const total = await Knex('acessos').count<{ total: number }>('* as total').first();
        expect(Number(total?.total)).toBe(8);
    });

    it('reverte evento se incremento falhar e preserva redirect sem vazar erro', async () => {
        const link = await Knex('links').where({ urlCurta: 'fluxo-teste' }).first();
        await Knex.raw('CREATE TRIGGER falhar_contador BEFORE UPDATE OF acessos ON links BEGIN SELECT RAISE(ABORT, \'falha-injetada\'); END');
        try {
            await expect(new AcessoRepository().cadastrar({ linkId: link!.id, ip: null, navegador: null, sistemaOperacional: null, dispositivo: null, referrer: null, pais: null, cidade: null })).rejects.toThrow();
            await api().get('/links/redirecionar/fluxo-teste').expect(302);
            const eventos = await Knex('acessos').where({ linkId: link!.id });
            expect(eventos).toHaveLength(8);
            expect((await Knex('links').where({ id: link!.id }).first())!.acessos).toBe(8);
        } finally { await Knex.raw('DROP TRIGGER falhar_contador'); }
    });

    it('bootstrap idempotente nao redefine senha de conta existente', async () => {
        const anterior = { email: process.env.ADMIN_EMAIL, senha: process.env.ADMIN_SENHA };
        try {
            process.env.ADMIN_EMAIL = ' ADMIN@EXAMPLE.COM ';
            process.env.ADMIN_SENHA = 'outra-senha-segura';
            const antes = await Knex('usuarios').where({ id: administrador }).first();
            await seed(Knex);
            expect((await Knex('usuarios').where({ id: administrador }).first())!.senha).toBe(antes!.senha);
        } finally {
            if (anterior.email === undefined) delete process.env.ADMIN_EMAIL; else process.env.ADMIN_EMAIL = anterior.email;
            if (anterior.senha === undefined) delete process.env.ADMIN_SENHA; else process.env.ADMIN_SENHA = anterior.senha;
        }
    });

    it('reconsulta privilegios e revoga sessoes apos alteracao e logout', async () => {
        await Knex('usuarios').where({ id: administrador }).update({ administrador: false });
        await api().get('/api/links').set('Cookie', cookie).expect(403);
        await Knex('usuarios').where({ id: administrador }).update({ administrador: true });
        await api().patch('/api/usuarios/' + administrador).set('Cookie', cookie).set(csrf).send({ senha: 'senha-nova-segura' }).expect(200);
        await api().get('/api/auth/me').set('Cookie', cookie).expect(401);
        const login = await api().post('/api/auth/login').set(csrf).send({ email: 'admin@example.com', senha: 'senha-nova-segura' }).expect(204);
        const novoCookie = login.headers['set-cookie'][0].split(';')[0];
        const logout = await api().post('/api/auth/logout').set('Cookie', novoCookie).set(csrf).send({}).expect(204);
        expect(logout.headers['set-cookie'][0]).toMatch(/Expires=Thu, 01 Jan 1970/);
        await api().get('/api/auth/me').set('Cookie', novoCookie).expect(401);
    });

    it('health check e API desconhecida respondem JSON com headers de seguranca', async () => {
        const saude = await api().get('/api/saude').expect(200);
        expect(saude.headers['x-content-type-options']).toBe('nosniff');
        const ausente = await api().get('/api/inexistente').expect(404);
        expect(ausente.body).toEqual({ erro: 'Rota não encontrada' });
    });

    it('limita tentativas de login', async () => {
        let status = 0;
        for (let i = 0; i < 12; i++) {
            status = (await api().post('/api/auth/login').set(csrf).send({ email: 'ausente@example.com', senha })).status;
            if (status === 429) break;
        }
        expect(status).toBe(429);
    });
});

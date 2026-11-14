import 'reflect-metadata';
import type { Request, Response } from 'express';
import { Knex } from '../../src/config/knex';
import { JwtUtil } from '../../src/utils/JwtUtil';
import { usuarioRouter } from '../../src/routes/UsuarioRouter';
import { linkRouter } from '../../src/routes/LinkRouter';
import { acessoRouter } from '../../src/routes/AcessoRouter';

// Exercita o primeiro middleware registrado em cada rota com autenticação real e SQLite.
describe('Permissões das rotas de gestão', () => {
    const segredoAnterior = process.env.JWT_SEGREDO;
    let id: number;
    let token: string;
    beforeAll(async () => {
        process.env.JWT_SEGREDO = 'segredo-de-teste-com-mais-de-trinta-e-dois-bytes';
        await Knex.migrate.latest();
        const [usuario] = await Knex('usuarios')
            .insert({
                nome: 'Comum',
                email: 'comum@example.com',
                senha: 'hash',
                ativo: true,
                administrador: false
            })
            .returning('*');
        id = usuario.id;
        // Mesmo um token que afirma ser administrador deve respeitar o banco.
        token = JwtUtil.Gerar({ id, administrador: true, versaoSessao: 0 });
    });
    afterAll(async () => {
        await Knex.destroy();
        if (segredoAnterior === undefined) {
            delete process.env.JWT_SEGREDO;
        } else {
            process.env.JWT_SEGREDO = segredoAnterior;
        }
    });
    const casos = [
        [usuarioRouter, '/', 'get', false],
        [usuarioRouter, '/:id', 'get', false],
        [usuarioRouter, '/', 'post', true],
        [usuarioRouter, '/:id', 'patch', true],
        [usuarioRouter, '/:id', 'delete', true],
        [linkRouter, '/', 'get', false],
        [linkRouter, '/:id', 'get', false],
        [linkRouter, '/', 'post', false],
        [linkRouter, '/:id', 'patch', false],
        [linkRouter, '/:id', 'delete', true],
        [acessoRouter, '/:id/stats', 'get', false]
    ] as const;
    it.each(casos)(
        'valida middleware da rota %p %s %s (restrita: %s)',
        async (router, caminho, metodo, restrita) => {
            const rota = router.stack.find(
                (camada: any) => camada.route?.path === caminho && camada.route.methods[metodo]
            );
            expect(rota).toBeDefined();
            const guarda = rota!.route!.stack[0].handle;
            const req = { cookies: { breve_sessao: token } } as unknown as Request;
            const next = jest.fn();
            await guarda(req, {} as Response, next);
            expect(req.usuario?.administrador).toBe(false);
            if (restrita) {
                expect(next.mock.calls[0][0]).toMatchObject({ status: 403 });
            } else {
                expect(next).toHaveBeenCalledWith();
            }
            await Knex('usuarios').where({ id }).update({ administrador: true });
            const permitir = jest.fn();
            await guarda(req, {} as Response, permitir);
            expect(permitir).toHaveBeenCalledWith();
            await Knex('usuarios').where({ id }).update({ administrador: false });
            await expect(
                guarda({ cookies: {} } as Request, {} as Response, jest.fn())
            ).rejects.toMatchObject({ status: 401 });
        }
    );
});

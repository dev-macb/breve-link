import { Request, Response } from 'express';
import { UsuarioValidator } from '../../src/validators/UsuarioValidator';
import { ErroMiddleware } from '../../src/middlewares/ErroMiddleware';

const validator = new UsuarioValidator();

async function validar(body: object, atualizar = false) {
    const resposta = { locals: {}, status: jest.fn().mockReturnThis(), json: jest.fn() };
    const proxima = jest.fn();
    await (atualizar ? validator.atualizar() : validator.cadastrar())(
        { body, params: { id: '1' } } as unknown as Request,
        resposta as unknown as Response, erro => {
            if (erro) ErroMiddleware(erro, {} as Request, resposta as unknown as Response, jest.fn());
            else proxima();
        }
    );
    return { resposta, proxima };
}

describe('Validacao de usuarios', () => {
    const cadastro = { nome: 'Usuario Teste', email: 'teste@example.com', senha: 'senha1234', ativo: true, administrador: false };

    it.each(['curta', 'a'.repeat(73), 'á'.repeat(37), '😀'.repeat(19)])(
        'rejeita senha fora dos limites no cadastro e PATCH: %s', async senha => {
            for (const atualizar of [false, true]) {
                const { resposta, proxima } = await validar({ ...cadastro, senha }, atualizar);
                expect(resposta.status).toHaveBeenCalledWith(422);
                expect(proxima).not.toHaveBeenCalled();
            }
        }
    );

    it.each(['a'.repeat(72), 'á'.repeat(36), '😀'.repeat(18)])(
        'aceita senha com exatamente 72 bytes: %s', async senha => {
            const { proxima } = await validar({ ...cadastro, senha });
            expect(proxima).toHaveBeenCalled();
        }
    );

    it('aceita email com espacos e maiusculas para normalizacao pelo servico', async () => {
        const { proxima } = await validar({ ...cadastro, email: '  TESTE@EXAMPLE.COM  ' });
        expect(proxima).toHaveBeenCalled();
    });

    it.each(['   ', 'invalido'])('rejeita email invalido: %s', async email => {
        const { resposta, proxima } = await validar({ ...cadastro, email });
        expect(resposta.status).toHaveBeenCalledWith(422);
        expect(proxima).not.toHaveBeenCalled();
    });

    it('permite atualizar nome com mais de cinco caracteres sem trocar senha', async () => {
        const { proxima } = await validar({ nome: 'Nome Atualizado' }, true);
        expect(proxima).toHaveBeenCalled();
    });
});

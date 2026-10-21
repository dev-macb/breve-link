import '../config/Ambiente';
import { Knex } from 'knex';
import { HashUtil } from '../utils/HashUtil';

export async function seed(knex: Knex): Promise<void> {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!email) {
        throw new Error('Defina ADMIN_EMAIL para inicializar o administrador');
    }
    if (await knex('usuarios').whereRaw('lower(trim(email)) = ?', [email]).first()) {
        return;
    }
    const senha = process.env.ADMIN_SENHA;
    if (!senha || senha.length < 8 || Buffer.byteLength(senha, 'utf8') > 72) {
        throw new Error('Defina ADMIN_SENHA com no mínimo 8 caracteres e no máximo 72 bytes');
    }
    await knex('usuarios').insert({
        nome: 'Administrador',
        email,
        senha: await HashUtil.Criptografar(senha),
        ativo: true,
        administrador: true
    });
}

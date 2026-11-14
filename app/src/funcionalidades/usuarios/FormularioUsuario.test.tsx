import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FormularioUsuario } from './FormularioUsuario';
import type { Usuario } from '../../tipos';

const usuario: Usuario = {
    id: 1,
    nome: 'Maria',
    email: 'maria@example.com',
    ativo: true,
    administrador: false
};
const renderizar = (podeEditar: boolean, pessoa: Usuario | null = usuario) =>
    renderToStaticMarkup(
        <FormularioUsuario
            usuario={pessoa}
            podeEditar={podeEditar}
            fechar={() => {}}
            salvo={() => {}}
        />
    );
describe('Permissões do formulário de usuário', () => {
    it('permite consultar sem campos editáveis, senha ou envio', () => {
        const html = renderizar(false);
        expect(html).toContain('Consultar usuário');
        expect(html).toContain('maria@example.com');
        expect(html).not.toContain('type="submit"');
        expect(html).not.toContain('type="password"');
        expect(html.match(/disabled=""/g)).toHaveLength(4);
    });
    it('permite editar e deixa a troca de senha opcional', () => {
        const html = renderizar(true);
        expect(html).toContain('Salvar alterações');
        expect(html).toContain('Nova senha (opcional)');
        expect(html).not.toContain('disabled=""');
    });
    it('usa o mesmo formulário vazio no cadastro e exige senha', () => {
        const html = renderizar(true, null);
        expect(html).toContain('Cadastrar usuário');
        expect(html).toMatch(/id="usuario-nome"[^>]*value=""/);
        expect(html).toContain('type="password" required=""');
    });
});

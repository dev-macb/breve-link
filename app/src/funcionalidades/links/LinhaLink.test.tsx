import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { LinkCurto } from '../../tipos';
import { LinhaLink } from './LinhaLink';

const link: LinkCurto = {
    id: 1,
    urlOriginal: 'https://example.com/produto',
    urlCurta: 'produto',
    acessos: 12,
    ativo: true,
    criadoEm: '2026-01-01T00:00:00Z',
    atualizadoEm: '2026-01-01T00:00:00Z'
};

function renderizar(alteracoes: Partial<LinkCurto> = {}, copiado = false) {
    return renderToStaticMarkup(
        <MemoryRouter>
            <LinhaLink
                link={{ ...link, ...alteracoes }}
                origemPublica="https://breve.example"
                copiado={copiado}
                copiar={() => {}}
                editar={() => {}}
                excluir={() => {}}
            />
        </MemoryRouter>
    );
}

describe('Linha de link', () => {
    it('mantém o destino curto, as ações e o acesso às estatísticas', () => {
        const html = renderizar();
        expect(html).toContain('href="https://breve.example/produto"');
        expect(html).toContain('href="/links/1"');
        expect(html).toContain('class="link-row-stats"');
        expect(html).toContain('aria-label="Ver estatísticas de produto"');
        expect(html).not.toContain('title="Ver estatísticas"');
        expect(html).toContain('aria-label="Copiar link produto"');
        expect(html).toContain('aria-label="Editar link produto"');
        expect(html).toContain('aria-label="Excluir link produto"');
        expect(html).toContain('Ativo');
    });

    it('diferencia links pausados e expirados e mantém o indicador de cópia', () => {
        expect(renderizar({ ativo: false })).toContain('Pausado');
        expect(renderizar({ expiraEm: '2000-01-01T00:00:00Z' })).toContain('Expirado');
        expect(renderizar({}, true)).toContain('icon-button copied');
    });
});

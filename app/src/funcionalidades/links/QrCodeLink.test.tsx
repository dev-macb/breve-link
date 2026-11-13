import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { QrCodeLink } from './QrCodeLink';

describe('QR Code nos detalhes do link', () => {
    it('exibe imagem acessível e permite baixar o mesmo código em PNG', () => {
        const imagem = 'data:image/png;base64,aW1hZ2Vt';
        const html = renderToStaticMarkup(<QrCodeLink imagem={imagem} slug="campanha" />);
        expect(html).toContain('alt="QR Code para acessar o link campanha"');
        expect(html).toContain(`src="${imagem}"`);
        expect(html).toContain(`href="${imagem}"`);
        expect(html).toContain('download="breve-link-campanha.png"');
    });
});

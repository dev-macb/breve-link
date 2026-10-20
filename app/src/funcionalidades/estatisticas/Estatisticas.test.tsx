import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Monitor } from 'lucide-react';
import { Distribuicao } from './Distribuicao';
import { EventosAcesso } from './EventosAcesso';
import { ResumoGeolocalizacao } from './ResumoGeolocalizacao';

describe('Blocos de estatísticas', () => {
    it('mostra ausência de eventos sem esconder a identificação da seção', () => {
        const html = renderToStaticMarkup(<EventosAcesso acessos={[]} />);
        expect(html).toContain('02 / eventos');
        expect(html).toContain('Nenhum registro disponível.');
    });

    it('omite o resumo quando não há dados de geolocalização', () => {
        expect(renderToStaticMarkup(<ResumoGeolocalizacao dados={undefined} />)).toBe('');
    });

    it('exibe as contagens históricas e a precisão aproximada das regiões', () => {
        const html = renderToStaticMarkup(
            <ResumoGeolocalizacao
                dados={{
                    capturadas: 3,
                    total: 4,
                    taxaAprovacao: 75,
                    porStatus: { granted_silent: 3, denied: 1 },
                    clusters: [{ lat: -23.55, lon: -46.63, total: 3 }]
                }}
            />
        );
        expect(html).toContain('3 coordenadas capturadas');
        expect(html).toContain('75.0% de aprovação');
        expect(html).toContain('células de 0,01 grau');
        expect(html).toContain('-23.55');
    });

    it('limita a prévia de distribuição e escapa rótulos recebidos da API', () => {
        const html = renderToStaticMarkup(
            <Distribuicao
                titulo="Navegadores"
                icone={Monitor}
                itens={Array.from({ length: 6 }, (_, indice) => ({
                    nome: indice === 0 ? '<script>cliente</script>' : `Cliente ${indice}`,
                    acessos: 1,
                    percentual: 16.7
                }))}
            />
        );
        expect(html).toContain('&lt;script&gt;cliente&lt;/script&gt;');
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('Cliente 5');
        expect(html).toContain('Ver todos (6)');
    });
});

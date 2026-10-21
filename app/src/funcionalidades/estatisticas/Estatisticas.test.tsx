import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Monitor } from 'lucide-react';
import { Distribuicao } from './Distribuicao';
import { EventosAcesso } from './EventosAcesso';

describe('Blocos de estatísticas', () => {
    it('mostra ausência de eventos sem esconder a identificação da seção', () => {
        const html = renderToStaticMarkup(
            <EventosAcesso
                acessos={[]}
                fingerprint={{ hashesDistintos: 0, acessosComHash: 0, grupos: [] }}
                total={0}
            />
        );
        expect(html).toContain('03 / eventos e fingerprints');
        expect(html).toContain('Nenhum registro disponível.');
        expect(html).toContain('Sem fingerprints.');
    });

    it('mantém o histórico de fingerprints mesmo sem eventos recentes', () => {
        const html = renderToStaticMarkup(
            <EventosAcesso
                acessos={[]}
                total={150}
                fingerprint={{
                    hashesDistintos: 1,
                    acessosComHash: 150,
                    grupos: [
                        {
                            hashDispositivo: 'hash-historico',
                            acessos: 150,
                            primeiroAcesso: '2026-01-01T00:00:00Z',
                            ultimoAcesso: '2026-01-02T00:00:00Z'
                        }
                    ]
                }}
            />
        );
        expect(html).toContain('Fingerprints por frequência');
        expect(html).toContain('hash-historico');
        expect(html).toContain('150 acessos com hash');
        expect(html.match(/<section\b/g)).toHaveLength(1);
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

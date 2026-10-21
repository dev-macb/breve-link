import { describe, expect, it } from 'vitest';
import { atualizarConsultaLinks, lerConsultaLinks } from './consultaLinks';

describe('Consulta de links na URL', () => {
    it('restaura filtro com caracteres especiais, pagina e tamanho da lista', () => {
        const parametros = new URLSearchParams({
            filtro: 'ação & docs+site',
            pagina: '3',
            limite: '20'
        });
        expect(lerConsultaLinks(new URLSearchParams(parametros.toString()))).toEqual({
            filtro: 'ação & docs+site',
            pagina: 3,
            limite: 20
        });
    });
    it.each(['-1', '0', '1.5', 'NaN', 'Infinity', '9007199254740992'])(
        'ignora pagina invalida %s',
        (pagina) => {
            expect(lerConsultaLinks(new URLSearchParams({ pagina, limite: '999' }))).toMatchObject({
                pagina: 1,
                limite: 10
            });
        }
    );
    it('limita a busca ao tamanho aceito pela API', () => {
        expect(
            lerConsultaLinks(new URLSearchParams({ filtro: 'x'.repeat(201) })).filtro
        ).toHaveLength(200);
    });
    it('reseta pagina na busca sem perder tamanho ou parametros adicionais', () => {
        const parametros = new URLSearchParams('filtro=antigo&pagina=3&limite=50&origem=favoritos');
        const proxima = atualizarConsultaLinks(parametros, { filtro: 'novo', pagina: 1 });
        expect(Object.fromEntries(proxima)).toEqual({
            filtro: 'novo',
            limite: '50',
            origem: 'favoritos'
        });
        expect(parametros.get('pagina')).toBe('3');
    });
    it('remove valores padrao e preserva a busca ao paginar', () => {
        const parametros = new URLSearchParams('filtro=docs&pagina=1&limite=10');
        expect(atualizarConsultaLinks(parametros, { pagina: 2 }).toString()).toBe(
            'filtro=docs&pagina=2'
        );
        expect(atualizarConsultaLinks(parametros, { filtro: '' }).toString()).toBe('');
    });
});

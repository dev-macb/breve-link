import { describe, expect, it } from 'vitest';
import { dataApi, dataCurta, enderecoCurto, estadoLink, nomePais, serieDiaria } from './formatar';
import type { LinkCurto } from '../tipos';

describe('Datas e estados dos links', () => {
    const link: LinkCurto = {
        id: 1,
        urlOriginal: 'https://example.com',
        urlCurta: 'teste',
        acessos: 0,
        ativo: true,
        criadoEm: '',
        atualizadoEm: ''
    };
    it('interpreta timestamp do SQLite explicitamente em UTC', () => {
        expect(dataApi('2026-10-19 14:30:00').toISOString()).toBe('2026-10-19T14:30:00.000Z');
        expect(dataApi('2026-10-19 14:30:00+00:00').toISOString()).toBe('2026-10-19T14:30:00.000Z');
    });
    it('apresenta datas numericas com dia, mes e ano completos', () => {
        expect(dataCurta(new Date(2026, 0, 5, 12).getTime())).toBe('05/01/2026');
        expect(dataCurta('invalida')).toBe('Data indisponível');
    });
    it('trata epoch zero e data invalida como expiracao', () => {
        expect(estadoLink({ ...link, expiraEm: 0 })).toBe('Expirado');
        expect(estadoLink({ ...link, expiraEm: 'invalido' })).toBe('Expirado');
        expect(estadoLink({ ...link, ativo: false })).toBe('Pausado');
    });
    it('preenche dias sem acesso e limita a serie na virada do mes em UTC', () => {
        const serie = serieDiaria(
            [
                { data: '2026-09-30', acessos: 4 },
                { data: '2026-09-28', acessos: 20 }
            ],
            3,
            new Date('2026-10-01T00:01:00Z')
        );
        expect(serie.map((dia) => [dia.data, dia.acessos])).toEqual([
            ['2026-09-29', 0],
            ['2026-09-30', 4],
            ['2026-10-01', 0]
        ]);
    });
    it('monta links pela origem configurada sem depender da origem do frontend', () => {
        expect(enderecoCurto('https://breve.example/', 'A_b-12')).toBe(
            'https://breve.example/A_b-12'
        );
    });
    it('localizacao desconhecida ou invalida nao quebra as estatisticas', () => {
        expect(nomePais('BR')).toBe('Brasil');
        expect(nomePais('Desconhecido')).toBe('Não identificado');
        expect(nomePais('invalido')).toBe('invalido');
    });
});

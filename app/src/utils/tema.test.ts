import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const inicializarTema = readFileSync(new URL('../../public/tema.js', import.meta.url), 'utf8');

function carregarPagina(
    salvo: string | null,
    sistemaClaro = false,
    armazenamentoBloqueado = false
) {
    const raiz = { dataset: { theme: 'dark' } };
    runInNewContext(inicializarTema, {
        document: { documentElement: raiz },
        localStorage: {
            getItem() {
                if (armazenamentoBloqueado) {
                    throw new Error('Armazenamento indisponível');
                }
                return salvo;
            }
        },
        window: { matchMedia: () => ({ matches: sistemaClaro }) }
    });
    return raiz.dataset.theme;
}

describe('Tema compartilhado das páginas', () => {
    it.each(['light', 'dark'])('preserva %s ao ir da página pública para o início', (tema) => {
        expect(carregarPagina(tema)).toBe(tema);
        expect(carregarPagina(tema)).toBe(tema);
    });

    it('respeita a preferência explícita mesmo quando o sistema usa outro tema', () => {
        expect(carregarPagina('dark', true)).toBe('dark');
        expect(carregarPagina('light', false)).toBe('light');
    });

    it('resolve a preferência antiga de sistema de forma consistente', () => {
        expect(carregarPagina('system', true)).toBe('light');
        expect(carregarPagina('system', false)).toBe('dark');
    });

    it('mantém o padrão sem preferência válida ou com armazenamento bloqueado', () => {
        expect(carregarPagina(null)).toBe('dark');
        expect(carregarPagina('invalido')).toBe('dark');
        expect(carregarPagina(null, false, true)).toBe('dark');
    });
});

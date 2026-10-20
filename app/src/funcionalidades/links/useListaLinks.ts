import { useEffect, useRef, useState } from 'react';
import { http, mensagemErro } from '../../services/http';
import type { LinkCurto, Pagina } from '../../tipos';
import type { ConsultaLinks } from './consultaLinks';

export function useListaLinks({ pagina, limite, filtro }: ConsultaLinks, versao: number) {
    const [dados, setDados] = useState<Pagina<LinkCurto> | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const filtroAnterior = useRef(filtro);

    useEffect(() => {
        const controle = new AbortController();
        setCarregando(true);
        setErro('');
        const consulta = new URLSearchParams({
            pagina: String(pagina),
            limite: String(limite),
            filtro
        });
        const atraso = filtroAnterior.current === filtro ? 0 : 300;
        filtroAnterior.current = filtro;
        const tempo = setTimeout(() => {
            void http<Pagina<LinkCurto>>('/links?' + consulta, { signal: controle.signal })
                .then((resultado) => {
                    if (!controle.signal.aborted) {
                        setDados(resultado);
                    }
                })
                .catch((causa) => {
                    if (!controle.signal.aborted) {
                        setErro(mensagemErro(causa));
                    }
                })
                .finally(() => {
                    if (!controle.signal.aborted) {
                        setCarregando(false);
                    }
                });
        }, atraso);
        return () => {
            clearTimeout(tempo);
            controle.abort();
        };
    }, [pagina, limite, filtro, versao]);

    return { dados, carregando, erro };
}

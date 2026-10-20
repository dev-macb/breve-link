import { useEffect, useState } from 'react';
import { ErroHttp, http, mensagemErro } from '../../services/http';
import type { Estatisticas } from '../../tipos';

export function useEstatisticas(id: string, versao: number) {
    const valido = /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
    const [dados, setDados] = useState<Estatisticas | null>(null);
    const [erro, setErro] = useState('');
    const [ausente, setAusente] = useState(false);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        if (!valido) {
            return;
        }
        const controle = new AbortController();
        setCarregando(true);
        setErro('');
        setAusente(false);
        setDados(null);
        http<Estatisticas>('/links/' + id + '/stats', { signal: controle.signal })
            .then((resultado) => {
                if (!controle.signal.aborted) {
                    setDados(resultado);
                }
            })
            .catch((causa) => {
                if (controle.signal.aborted) {
                    return;
                }
                if (causa instanceof ErroHttp && causa.status === 404) {
                    setAusente(true);
                } else {
                    setErro(mensagemErro(causa));
                }
            })
            .finally(() => {
                if (!controle.signal.aborted) {
                    setCarregando(false);
                }
            });
        return () => controle.abort();
    }, [id, valido, versao]);

    return { dados, erro, ausente, carregando, valido };
}

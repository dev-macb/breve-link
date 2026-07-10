import { CadastrarAcessoDto } from '../../models/Acesso';
import { IFiltros } from '../common/IFiltros';

interface EstatisticasLink {
    link: {
        id: number;
        urlOriginal: string;
        urlCurta: string;
        criadoEm: Date;
    };
    totalAcessos: number;
    acessosPorDia: Array<{ data: string; acessos: number }>;
    dispositivos: {
        navegadores: Array<{ nome: string; acessos: number; percentual: number }>;
        sistemasOperacionais: Array<{ nome: string; acessos: number; percentual: number }>;
        tipos: Array<{ tipo: string; acessos: number; percentual: number }>;
    };
    referrers: Array<{ origem: string; acessos: number; percentual: number }>;
    localizacao: {
        paises: Array<{ pais: string; acessos: number; percentual: number }>;
        cidades: Array<{ cidade: string; pais: string; acessos: number; percentual: number }>;
    };
}

interface IAcessoService {
    registrar(cadastrarAcessoDto: CadastrarAcessoDto): Promise<void>;
    obterEstatisticas(linkId: number): Promise<EstatisticasLink | null>;
}


export { IAcessoService, EstatisticasLink };

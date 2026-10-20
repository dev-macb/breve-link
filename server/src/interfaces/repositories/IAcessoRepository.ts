import { Acesso, CadastrarAcessoDto } from '../../models/Acesso';

interface RegistroAcessoDiario {
    data: string;
    acessos: number;
}

interface ContagemPorCampo {
    campo: string;
    acessos: number;
}

interface ContagemCidade {
    cidade: string;
    pais: string;
    acessos: number;
}

interface IAcessoRepository {
    obterFingerprint(linkId: number): Promise<ResumoFingerprint>;
    obterRecentes(linkId: number): Promise<Acesso[]>;
    cadastrar(cadastrarAcessoDto: CadastrarAcessoDto): Promise<void>;
    contarTotalPorLinkId(linkId: number): Promise<number>;
    contarPorDia(linkId: number): Promise<RegistroAcessoDiario[]>;
    contarPorNavegador(linkId: number): Promise<ContagemPorCampo[]>;
    contarPorSistemaOperacional(linkId: number): Promise<ContagemPorCampo[]>;
    contarPorDispositivo(linkId: number): Promise<ContagemPorCampo[]>;
    contarPorReferrer(linkId: number): Promise<ContagemPorCampo[]>;
    contarPorPais(linkId: number): Promise<ContagemPorCampo[]>;
    contarPorCidade(linkId: number): Promise<ContagemCidade[]>;
}

export interface ResumoFingerprint {
    hashesDistintos: number;
    acessosComHash: number;
    grupos: Array<{
        hashDispositivo: string;
        acessos: number;
        primeiroAcesso: string;
        ultimoAcesso: string;
    }>;
}


export { IAcessoRepository, RegistroAcessoDiario, ContagemPorCampo, ContagemCidade };

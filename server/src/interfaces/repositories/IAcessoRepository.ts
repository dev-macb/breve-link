import { CadastrarAcessoDto } from '../../models/Acesso';

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


export { IAcessoRepository, RegistroAcessoDiario, ContagemPorCampo, ContagemCidade };

import { logger } from '../config/Logger';
import { Request, Response } from 'express';
import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { IAcessoService, IId } from '../interfaces';


@injectable()
class AcessoController {
    constructor(
        @inject(TIPOS.IAcessoService)
        private readonly acessoService: IAcessoService
    ) {}

    async obterEstatisticas(requisicao: Request<IId>, resposta: Response): Promise<Response> {
        try {
            const { id } = requisicao.params;

            const estatisticas = await this.acessoService.obterEstatisticas(id!);
            if (!estatisticas) {
                logger.warn({ linkId: id }, 'Link não encontrado para estatísticas');
                return resposta.status(StatusCodes.NOT_FOUND).json({ error: 'Link não encontrado' });
            }

            return resposta.status(StatusCodes.OK).json(estatisticas);
        }
        catch (erro: any) {
            logger.error(erro, 'Erro ao obter estatísticas');
            return resposta.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: erro.message });
        }
    }
}


export { AcessoController };

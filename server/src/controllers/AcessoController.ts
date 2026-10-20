import { Request, Response } from 'express';
import { TIPOS } from '../config/Constantes';
import { inject, injectable } from 'inversify';
import { IAcessoService, IId } from '../interfaces';
import { RecursoNaoEncontrado } from '../erros';

@injectable()
export class AcessoController {
    constructor(@inject(TIPOS.IAcessoService) private readonly acessoService: IAcessoService) {}
    async obterEstatisticas(req: Request<IId>, res: Response): Promise<Response> {
        const estatisticas = await this.acessoService.obterEstatisticas(req.params.id!);
        if (!estatisticas) throw new RecursoNaoEncontrado('Link não encontrado');
        return res.json(estatisticas);
    }
}

export class ErroDominio extends Error {
    constructor(
        public readonly status: number,
        mensagem: string,
        public readonly detalhes?: string[]
    ) {
        super(mensagem);
        this.name = new.target.name;
    }
}
export class RecursoNaoEncontrado extends ErroDominio {
    constructor(mensagem = 'Recurso não encontrado') {
        super(404, mensagem);
    }
}
export class Conflito extends ErroDominio {
    constructor(mensagem = 'Recurso já cadastrado') {
        super(409, mensagem);
    }
}
export class NaoAutenticado extends ErroDominio {
    constructor(mensagem = 'Autenticação necessária') {
        super(401, mensagem);
    }
}
export class Proibido extends ErroDominio {
    constructor(mensagem = 'Acesso negado') {
        super(403, mensagem);
    }
}
export class RequisicaoInvalida extends ErroDominio {
    constructor(mensagem = 'Dados inválidos', detalhes?: string[]) {
        super(422, mensagem, detalhes);
    }
}
export class LinkIndisponivel extends ErroDominio {
    constructor() {
        super(410, 'Link inativo ou expirado');
    }
}

export function conflitoUnico(erro: unknown): boolean {
    const causa = erro as { code?: string; message?: string };
    return (
        causa?.code === 'SQLITE_CONSTRAINT' && /UNIQUE constraint failed/i.test(causa.message ?? '')
    );
}

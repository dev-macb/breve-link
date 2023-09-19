// Declaração de inteface
interface LinkModel {
    id_link: number;
    url_original: string;
    url_curta: string;
    expira_em?: Date;
    criado_em: Date;
    atualizado_em: Date;
}

export { LinkModel };
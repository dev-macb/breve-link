export const COMPLEXIDADE_HASH = 10;

export const TIPOS = {
    IUrlUtil: Symbol('IUrlUtil'),
    IJwtUtil: Symbol('IJwtUtil'),
    IHashUtil: Symbol('IHashUtil'),

    LinkController: Symbol('LinkController'),
    UsuarioController: Symbol('UsuarioController'),
    AcessoController: Symbol('AcessoController'),

    ILinkValidator: Symbol('ILinkValidator'),
    IUsuarioValidator: Symbol('IUsuarioValidator'),
    IAcessoValidator: Symbol('IAcessoValidator'),

    ILinkService: Symbol('ILinkService'),
    IUsuarioService: Symbol('IUsuarioService'),
    IAcessoService: Symbol('IAcessoService'),
    
    ILinkRepository: Symbol('ILinkRepository'),
    IUsuarioRepository: Symbol('IUsuarioRepository'),
    IAcessoRepository: Symbol('IAcessoRepository'),
};
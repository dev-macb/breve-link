export const COMPLEXIDADE_HASH = 10;

export const TIPOS = {
    IUrlUtil: Symbol('IUrlUtil'),
    IJwtUtil: Symbol('IJwtUtil'),
    IHashUtil: Symbol('IHashUtil'),

    LinkController: Symbol('LinkController'),
    UsuarioController: Symbol('UsuarioController'),

    ILinkValidator: Symbol('ILinkValidator'),
    IUsuarioValidator: Symbol('IUsuarioValidator'),

    ILinkService: Symbol('ILinkService'),
    IUsuarioService: Symbol('IUsuarioService'),
    
    ILinkRepository: Symbol('ILinkRepository'),
    IUsuarioRepository: Symbol('IUsuarioRepository'),
};
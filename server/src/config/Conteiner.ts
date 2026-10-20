import { TIPOS } from './Constantes';
import { Container } from 'inversify';
import { HashUtil, JwtUtil, UrlUtil } from '../utils';
import { AcessoService, LinkService, UsuarioService } from '../services';
import { AcessoValidator, LinkValidator, UsuarioValidator } from '../validators';
import { AcessoController, LinkController, UsuarioController } from '../controllers';
import { AcessoRepository, LinkRepository, UsuarioRepository } from '../repositories';
import { IAcessoRepository, IAcessoService, IAcessoValidator, ILinkRepository, ILinkService, ILinkValidator, IUsuarioRepository, IUsuarioService, IUsuarioValidator } from '../interfaces';


const container = new Container();

container.bind<LinkController>(TIPOS.LinkController).to(LinkController);
container.bind<UsuarioController>(TIPOS.UsuarioController).to(UsuarioController);
container.bind<AcessoController>(TIPOS.AcessoController).to(AcessoController);

container.bind<ILinkValidator>(TIPOS.ILinkValidator).to(LinkValidator);
container.bind<IUsuarioValidator>(TIPOS.IUsuarioValidator).to(UsuarioValidator);
container.bind<IAcessoValidator>(TIPOS.IAcessoValidator).to(AcessoValidator);

container.bind<ILinkService>(TIPOS.ILinkService).to(LinkService);
container.bind<IUsuarioService>(TIPOS.IUsuarioService).to(UsuarioService);
container.bind<IAcessoService>(TIPOS.IAcessoService).to(AcessoService);

container.bind<ILinkRepository>(TIPOS.ILinkRepository).to(LinkRepository);
container.bind<IUsuarioRepository>(TIPOS.IUsuarioRepository).to(UsuarioRepository);
container.bind<IAcessoRepository>(TIPOS.IAcessoRepository).to(AcessoRepository);

container.bind<HashUtil>(TIPOS.IHashUtil).toConstantValue(HashUtil);
container.bind<JwtUtil>(TIPOS.IJwtUtil).toConstantValue(JwtUtil);
container.bind<UrlUtil>(TIPOS.IUrlUtil).toConstantValue(UrlUtil);


export { container };

import { TIPOS } from './Constantes';
import { Container } from 'inversify';
import { HashUtil, JwtUtil, UrlUtil } from '../utils';
import { LinkService, UsuarioService } from '../services';
import { LinkValidator, UsuarioValidator } from '../validators';
import { LinkController, UsuarioController } from '../controllers';
import { LinkRepository, UsuarioRepository } from '../repositories';
import { ILinkRepository, ILinkService, ILinkValidator, IUsuarioRepository, IUsuarioService, IUsuarioValidator } from '../interfaces';


const container = new Container();

container.bind<LinkController>(TIPOS.LinkController).to(LinkController);
container.bind<UsuarioController>(TIPOS.UsuarioController).to(UsuarioController);

container.bind<ILinkValidator>(TIPOS.ILinkValidator).to(LinkValidator);
container.bind<IUsuarioValidator>(TIPOS.IUsuarioValidator).to(UsuarioValidator);

container.bind<ILinkService>(TIPOS.ILinkService).to(LinkService);
container.bind<IUsuarioService>(TIPOS.IUsuarioService).to(UsuarioService);

container.bind<ILinkRepository>(TIPOS.ILinkRepository).to(LinkRepository);
container.bind<IUsuarioRepository>(TIPOS.IUsuarioRepository).to(UsuarioRepository);

container.bind<HashUtil>(TIPOS.IHashUtil).toConstantValue(HashUtil);
container.bind<JwtUtil>(TIPOS.IJwtUtil).toConstantValue(JwtUtil);
container.bind<UrlUtil>(TIPOS.IUrlUtil).toConstantValue(UrlUtil);


export { container };
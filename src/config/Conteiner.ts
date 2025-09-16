import { TIPOS } from './Constantes';
import { Container } from 'inversify';
import { UsuarioService } from '../services';
import { UsuarioValidator } from '../validators';
import { UsuarioController } from '../controllers';
import { UsuarioRepository } from '../repositories';
import { HashUtil, JwtUtil, UrlUtil } from '../utils';
import { IUsuarioRepository, IUsuarioService, IUsuarioValidator } from '../interfaces';


const container = new Container();

container.bind<UsuarioController>(TIPOS.UsuarioController).to(UsuarioController);
container.bind<IUsuarioValidator>(TIPOS.IUsuarioValidator).to(UsuarioValidator);
container.bind<IUsuarioService>(TIPOS.IUsuarioService).to(UsuarioService);
container.bind<IUsuarioRepository>(TIPOS.IUsuarioRepository).to(UsuarioRepository);

container.bind<HashUtil>(TIPOS.IHashUtil).toConstantValue(HashUtil);
container.bind<JwtUtil>(TIPOS.IJwtUtil).toConstantValue(JwtUtil);
container.bind<UrlUtil>(TIPOS.IUrlUtil).toConstantValue(UrlUtil);


export { container };
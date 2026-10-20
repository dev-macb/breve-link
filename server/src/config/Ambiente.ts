import path from 'path';
import dotenv from 'dotenv';

// Mesma raiz para server/src/config e server/build/config, independentemente do cwd.
export const RAIZ_PROJETO = path.resolve(__dirname, '..', '..', '..');
dotenv.config({ path: path.join(RAIZ_PROJETO, '.env'), quiet: true });

export function resolverCaminhoProjeto(caminho: string): string {
    return path.resolve(RAIZ_PROJETO, caminho);
}

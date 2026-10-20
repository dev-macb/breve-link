import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { Knex } from 'knex';
import { Database, OPEN_READONLY } from 'sqlite3';

interface ArquivoMigration { arquivo: string; nome: string; }

// Mantém a identidade da migration ao alternar entre fonte .ts e build .js.
// Nomes já registrados são preservados; migrations novas usam sempre o nome .ts.
export class FonteMigrations implements Knex.MigrationSource<ArquivoMigration> {
    constructor(private readonly diretorio: string, private readonly banco: string) {}

    async getMigrations(): Promise<ArquivoMigration[]> {
        const historico = await this.obterHistorico();
        const nomes = new Map<string, string>();
        for (const { name } of historico) {
            const base = path.parse(name).name;
            if (nomes.has(base)) throw new Error('Histórico contém a mesma migration com extensões diferentes');
            nomes.set(base, name);
        }
        const arquivos = (await readdir(this.diretorio)).filter(arquivo => /\.(ts|js)$/.test(arquivo) && !arquivo.endsWith('.d.ts')).sort();
        const bases = new Set<string>();
        return arquivos.map(arquivo => {
            const base = path.parse(arquivo).name;
            if (bases.has(base)) throw new Error('Diretório contém cópias TS e JS da mesma migration');
            bases.add(base);
            return { arquivo, nome: nomes.get(base) ?? `${base}.ts` };
        });
    }

    getMigrationName(migration: ArquivoMigration): string { return migration.nome; }

    async getMigration(migration: ArquivoMigration): Promise<Knex.Migration> {
        return import(path.join(this.diretorio, migration.arquivo));
    }

    private async obterHistorico(): Promise<Array<{ name: string }>> {
        if (this.banco === ':memory:' || !existsSync(this.banco)) return [];
        // Conexão curta somente de leitura, também compatível com o CLI do Knex.
        const leitura = await new Promise<Database>((resolve, reject) => {
            const banco = new Database(this.banco, OPEN_READONLY, erro => erro ? reject(erro) : resolve(banco));
        });
        try {
            leitura.configure('busyTimeout', 5000);
            const existe = await new Promise<boolean>((resolve, reject) => {
                leitura.get("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'knex_migrations'",
                    (erro, linha) => erro ? reject(erro) : resolve(!!linha));
            });
            if (!existe) return [];
            return await new Promise<Array<{ name: string }>>((resolve, reject) => {
                leitura.all<{ name: string }>('SELECT name FROM knex_migrations',
                    (erro, linhas) => erro ? reject(erro) : resolve(linhas));
            });
        } finally {
            await new Promise<void>((resolve, reject) => leitura.close(erro => erro ? reject(erro) : resolve()));
        }
    }
}

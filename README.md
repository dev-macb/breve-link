<h1 align="center">🔷 Breve Link 🔷</h1>

<p align="center">
    Um encurtador de URLs simples e eficiente construído com Node.js e TypeScript.
</p>

<p align="center">
    <a href="https://github.com/dev-macb/breve-link/blob/main/LICENSE" target="_blank">
        <img alt="GitHub license" src="https://img.shields.io/github/license/dev-macb/breve-link">
    </a>
    <a href="https://github.com/dev-macb/breve-link/stargazers" target="_blank">
        <img alt="GitHub stars" src="https://img.shields.io/github/stars/dev-macb/breve-link">
    </a>
    <a href="https://github.com/dev-macb/breve-link/network" target="_blank">
        <img alt="GitHub forks" src="https://img.shields.io/github/forks/dev-macb/breve-link">
    </a>
</p>


---


### ✨ Sobre o Projeto
<strong>Breve Link</strong> é um encurtador de URLs robusto e fácil de usar, desenvolvido como uma API RESTful em <strong>Node.js</strong> com <strong>TypeScript</strong>. O objetivo principal deste projeto é transformar links longos e complexos em URLs curtas e amigáveis, ideais para compartilhamento em redes sociais, mensagens ou qualquer outro meio onde a concisão é valorizada. Este repositório contém todo o código-fonte, configurações e documentação necessários para você rodar, entender e até mesmo contribuir para o projeto.
<p align="center">🔷</p>


<h3 id="instalação">🔧 Instalação</h3>
<p>
    Para configurar e rodar o projeto, siga os passos abaixo no seu terminal.
</p>

```bash
# Clone o repositório
$ git clone https://github.com/dev-macb/breve-link

# Acesse o diretório do projeto
$ cd breve-link

# Instale as dependências
$ npm ci

# Copie .env.example para .env e configure APP_ORIGEM, JWT_SEGREDO,
# ADMIN_EMAIL e ADMIN_SENHA antes de inicializar

# Execute as migrations e as seeds do banco de dados
$ npm run knex:migrate
$ npm run knex:seed

# Executar projeto
$ npm run dev
```

A API administrativa está sob `/api`, com sessão em cookie HttpOnly. Consulte
[os contratos e instruções da Fase 1](docs/FASE-1-BACKEND.md) e os exemplos em
`server/tests/**/*.http` para login, proteção CSRF e rotas atualizadas.

### Estrutura e comandos

O projeto usa npm workspaces: backend em `server/` e interface React em `web/`.
O `.env`, o lockfile e os comandos principais ficam na raiz. `npm run dev` inicia
API e interface; abra [o frontend local](http://localhost:5173) para acessar o painel.

```bash
npm run build
npm run typecheck
npm run lint
npm test -- --runInBand
npm run test:web
```

Consulte a [documentação da Fase 2](docs/FASE-2-MONOREPO.md) para a arquitetura,
configuração do banco e execução de migrations na nova estrutura.
O [guia da interface](docs/FASE-3-INTERFACE.md) descreve login, gerenciamento de links,
estatísticas e execução local. Para executar frontend e API pelo Express, use
`npm run build` seguido de `npm start` e abra o endereço definido em `APP_ORIGEM`.
Consulte o [guia de integração](docs/FASE-4-INTEGRACAO.md) para rotas, cache e runtime.
<p align="center">🔷</p>


### ✒️ Contribuições
Se deseja contribuir, relate problemas ou sugira melhorias abrindo uma 
<a href="https://github.com/dev-macb/breve-link/issues">Issue</a> ou enviando um <em>Pull Request</em>. Se gostou do 
projeto, deixe uma ⭐ para apoiar!
<p align="center">🔷</p>


### 📄 Licença
O repositório <strong>breve-link</strong> utiliza a <strong>licença MIT</strong> em todo seu código, confira suas 
condições em <a href="https://github.com/dev-macb/breve-link/blob/main/LICENSE">LICENSE</a>.
<p align="center">🔷</p>

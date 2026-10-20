# Interface

O painel privado é servido pelo Express após o build ou pelo Vite em
desenvolvimento. Veja os comandos no [README](../README.md).

## Navegação

- `/login`: entrada com e-mail e senha, opção de exibir senha e erros de autenticação.
- `/dashboard`: lista, busca, criação, edição, cópia, estatísticas e exclusão de links.
- `/links/:id`: tráfego diário, eventos individuais, distribuições e fingerprints.
- `/indisponivel`: página de indisponibilidade da interface.

A sessão é restaurada por cookie. Sem sessão, a interface encaminha ao login;
contas sem papel de administrador recebem acesso restrito. Respostas 401 de
operações autenticadas encerram a sessão da interface. Tokens não ficam no
localStorage; somente a preferência de tema usa esse armazenamento.

## Dashboard

Visual de console com título `>_ links`, contadores compactos, tabela e botões
Atualizar e Criar link. O total cobre todos os resultados da busca; ativos e
acessos consideram somente os links da página atual.

Busca por endereço curto ou destino, paginação e limite são preservados na URL:
`/dashboard?filtro=docs&pagina=2&limite=20`. A interface permite 10, 20 ou 50 itens.
Busca vazia, página 1 e limite 10 são omitidos. Alterar busca ou limite retorna à
primeira página; a busca aguarda 300 ms antes de consultar a API.

O formulário aceita destino, endereço personalizado e expiração. A edição permite
pausar/reativar e remover a expiração. Exclusão exige confirmação e remove os
acessos do link. Datas dos formulários usam horário local e são enviadas em ISO UTC.

## Estatísticas

- Contadores de acessos totais, acessos em 30 dias, países e hashes distintos.
- Gráfico dos últimos 30 dias, incluindo hoje e dias sem eventos, em UTC.
- Últimos 100 eventos expansíveis com dados técnicos.
- Distribuições de navegadores, sistemas, dispositivos, países e referers recolhidas.
- Top 20 fingerprints por frequência, com primeiro e último acesso em UTC.

Atualizar consulta os dados novamente; não há atualização automática. Os limites
visuais não removem registros do banco. Hashes são correlação aproximada de
headers; a contagem não representa pessoas únicas. Consulte [as regras de coleta](ACESSOS-FINGERPRINT.md).

## Organização e acessibilidade

`web/src/app` reúne rotas, sessão e avisos; `paginas` contém telas; `componentes`
contém layout e elementos compartilhados; `funcionalidades/links` contém o
formulário e a consulta da listagem; `services` contém o cliente HTTP; `tipos` e
`utils` contêm contratos e funções auxiliares.

Dashboard e estatísticas são carregados sob demanda. Modais usam `dialog` nativo,
com foco inicial, contenção de foco e Escape quando não há operação pendente.
Controles têm nomes acessíveis e foco visível. O layout se adapta ao celular e
respeita redução de movimento. Os temas compartilham [a mesma identidade visual](IDENTIDADE-VISUAL.md).

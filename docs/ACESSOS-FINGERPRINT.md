# Acessos e fingerprint local

O redirecionador registra dados técnicos no SQLite: IP, horário, navegador e
sistema com versões, dispositivo, país/cidade aproximados, Referer, User-Agent,
Accept-Language, método, caminho, Sec-CH-UA, Sec-Fetch e DNT/GPC.
Não há serviços externos no redirect nem dependências adicionais.

O fingerprint é SHA-256 da lista JSON `[User-Agent, Accept-Language,
Accept-Encoding]`, com limites de 2048, 256 e 256 caracteres. Não inclui IP,
cookies, canvas ou áudio. Sem User-Agent, com DNT=1 ou Sec-GPC=1, fica nulo.
É correlação de headers, não identificação: clientes diferentes podem ter o
mesmo hash e mudanças de configuração podem alterar o hash do mesmo cliente.

## Painel e API

`GET /api/links/:id/stats` exige autenticação e retorna:

- `acessosRecentes`: últimos 100 eventos, com hash e headers técnicos.
- `fingerprint.hashesDistintos`: hashes não nulos distintos em todo o histórico do link.
- `fingerprint.acessosComHash`: cobertura de eventos com hash.
- `fingerprint.grupos`: até 20 hashes por frequência, com total, primeiro e último acesso.

Horários são exibidos em UTC. HEAD não registra acesso; robôs e previews podem
aparecer como GET. Falhas de coleta não bloqueiam o redirecionamento.
País/cidade usam geoip-lite offline e não são coordenadas precisas.

## Leitura dos dados

O hash usa os valores limitados dos headers, com `null` quando ausentes.
Accept-Encoding participa do cálculo, mas não tem coluna própria no banco.
Sec-CH-UA e Sec-Fetch são dados de inspeção e não participam do hash.
Os headers são declarados pelo cliente e podem ser alterados ou falsificados.
Hashes nulos não entram na contagem distinta nem nos agrupamentos.

A lista de fingerprints é limitada aos 20 grupos mais frequentes; os contadores
consideram todos os grupos do link. Empates usam ordenação pelo hash. Não há
deduplicação de GETs: duas requisições com o mesmo hash são dois acessos.

Os detalhes individuais incluem `hashDispositivo`, `metodo`, `caminho`,
`clientHints`, `fetchSite`, `fetchMode`, `fetchDest`, `dnt` e `gpc`, além de IP,
localização e cliente interpretado. Registros antigos podem não ter esses campos.

## Banco e execução

Execute `npm run knex:migrate` antes de iniciar. As migrations 005 e 006
acrescentam detalhes técnicos e fingerprint; registros anteriores podem ter NULL.
A coleta e a API não usam mais UTMs. As colunas legadas da migration 006 foram
mantidas para compatibilidade com instalações existentes, sem apagar histórico.
Parâmetros de query não são coletados nem anexados ao destino.

Use as variáveis de `.env.example`. Configure `TRUST_PROXY` apenas com IPs/CIDRs
dos proxies confiáveis; deixe vazio sem proxy. O IP vem de `req.ip`.

Veja [schema e migrations](ARQUITETURA.md), [operação](OPERACAO.md) e [API](API.md).

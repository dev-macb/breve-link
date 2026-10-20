# API

A API fica sob `/api`. Gerenciamento de links, usuários e consulta de estatísticas
exigem uma conta ativa com papel de administrador.

## Sessão

| Método e rota | Resultado |
| --- | --- |
| `POST /api/auth/login` | Recebe `email` e `senha`; retorna `204` e cookie de sessão |
| `GET /api/auth/me` | Retorna o usuário autenticado |
| `POST /api/auth/logout` | Retorna `204` e invalida as sessões da conta |
| `GET /api/configuracao` | Autenticado; retorna `{ origemPublica }` |
| `GET /api/saude` | Público; consulta o banco e retorna `{ status: "ok" }` |

O cookie `breve_sessao` dura uma hora, é HttpOnly, SameSite=Strict e Secure em
produção. O cliente deve enviar cookies; não há token Bearer retornado no corpo.
Senha, estado ativo, papel de administrador e versão da sessão são verificados
no servidor; alterações de senha, estado ou papel invalidam as sessões anteriores.
Hashes de senha e versões de sessão não são retornados nos DTOs públicos.

Escritas exigem `X-Breve-CSRF: 1`. POST e PATCH exigem `Content-Type:
application/json`; logout envia `{}`. DELETE dispensa corpo JSON. Origin, quando
presente, deve estar na lista permitida; `Sec-Fetch-Site: cross-site` é bloqueado.

## Links

| Método e rota | Uso |
| --- | --- |
| `GET /api/links` | Listar e buscar por endereço curto ou destino |
| `GET /api/links/:id` | Consultar link |
| `POST /api/links` | Criar link |
| `PATCH /api/links/:id` | Editar link |
| `DELETE /api/links/:id` | Excluir link e seus acessos |
| `GET /api/links/:id/stats` | Estatísticas e fingerprints do link |

Criação:

```json
{
  "urlOriginal": "https://example.com",
  "urlCurta": "exemplo",
  "expiraEm": null
}
```

`urlCurta` e `expiraEm` são opcionais. O endereço curto automático é gerado quando
omitido. PATCH aceita `urlOriginal`, `urlCurta`, `ativo` e `expiraEm`; `null` remove
a expiração. Contadores e identificadores não são editáveis.

- Destino HTTP/HTTPS sem credenciais, de até 500 caracteres.
- Endereço curto de 3 a 50 caracteres ASCII: letras, números, hífen e underscore.
  Diferencia maiúsculas, exceto na verificação de nomes reservados.
- Nomes reservados: `api`, `auth`, `login`, `logout`, `dashboard`, `links`,
  `usuarios`, `stats`, `assets`, `saude`, `admin`, `indisponivel`.
- Novas datas de expiração devem estar no futuro; são persistidas em ISO UTC.
- Slug duplicado retorna `409`; link ausente retorna `404`.

As listagens aceitam `pagina`, `limite` (máximo 100) e `filtro` e retornam:

```json
{ "itens": [], "total": 0, "pagina": 1, "limite": 10, "totalPaginas": 0 }
```

A ordenação é por ID decrescente. A resposta de um link inclui `id`, `urlOriginal`,
`urlCurta`, `acessos`, `ativo`, `expiraEm`, `criadoEm` e `atualizadoEm`.

## Redirecionamento público

`GET /:slug` redireciona ao destino cadastrado com `302` e `Cache-Control: no-store`.
As rotas `/links/redirecionar/:slug` e `/api/links/redirecionar/:slug` também existem
por compatibilidade. HEAD verifica disponibilidade e destino sem registrar acesso.
Links pausados/expirados retornam `410`; inexistentes, `404`.

Query params não são coletados nem acrescentados ao destino. Não existem endpoints
públicos de beacon, GPS ou pixel. A coleta atual ocorre no servidor durante o GET.

## Estatísticas

A resposta de `/api/links/:id/stats` contém `link`, `totalAcessos`, `acessosPorDia`,
`dispositivos`, `referrers`, `localizacao`, `acessosRecentes` e `fingerprint`.
O histórico individual tem até 100 eventos; as agregações cobrem todo o histórico.
Veja os campos técnicos e as regras em [Acessos e fingerprint](ACESSOS-FINGERPRINT.md).

## Usuários

`/api/usuarios` oferece GET de lista e POST; `/api/usuarios/:id` oferece GET,
PATCH e DELETE. Criação recebe `nome`, `email`, `senha`, `ativo` e `administrador`.
PATCH aceita esses campos parcialmente. Nome tem até 30 caracteres; novas senhas
exigem ao menos 8 caracteres e no máximo 72 bytes UTF-8. E-mails são normalizados
com trim e minúsculas e têm unicidade protegida no banco.

## Erros e limites

Erros usam `{ erro, detalhes? }`. Falhas inesperadas retornam mensagem genérica;
o servidor registra um identificador interno. JSON inválido retorna `400`, corpo
acima de 32 KB retorna `413` e falhas de validação retornam `422`.

A API admite 300 requisições/IP/minuto. As rotas públicas canônica e legada fora
de `/api` admitem 1000/IP/minuto. O login limita a 10 falhas/IP em 15 minutos.

Exemplos REST Client: [sessão e usuários](../server/tests/usuarios/usuarios.http),
[links](../server/tests/links/links.http) e [estatísticas](../server/tests/acessos/acessos.http).

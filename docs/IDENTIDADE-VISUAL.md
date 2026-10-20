# Identidade visual — breve_link

Direção escolhida: web dos anos 2000, referências de terminal e páginas deface,
com apresentação sóbria, misteriosa e simples.

- Courier New e fontes monoespaçadas locais, sem downloads de fontes.
- Fundo quase preto, texto cinza quente e azul saturado nos destaques; verde
  reservado a estados positivos; vermelho e amarelo para erros e avisos.
- Cantos retos, bordas de um pixel, separadores tracejados e links sublinhados.
- Painel centralizado com navegação horizontal, métricas compactas e tabela de links.
- Login com diagrama ASCII decorativo; textos curtos e diretos no painel.
- Tema claro em tons de papel, preservando a mesma estrutura.
- Sem efeitos piscantes, sons automáticos ou animações decorativas.

## Paletas

| Papel | Escuro | Claro |
| --- | --- | --- |
| Fundo | `#090A09` | `#E8E6DC` |
| Superfície | `#0E100E` | `#EFEDE4` |
| Superfície elevada | `#171A16` | `#DEDDD2` |
| Bordas | `#343B32` | `#8E9587` |
| Texto principal | `#D4D7CC` | `#20271F` |
| Texto secundário | `#A1A798` | `#4B5547` |
| Links e navegação | `#6699FF` | `#0000EE` |
| Botão principal / texto | `#0000FF` / `#FFFFFF` | `#0000FF` / `#FFFFFF` |
| Link ao passar o mouse | `#99BBFF` | `#0000AA` |
| Estado positivo | `#44DD44` | `#007700` |

O tema Sistema acompanha a mesma paleta do tema correspondente. A faixa superior
mantém logo, identificação e saída; a faixa inferior contém os itens de navegação à
esquerda e a seleção de tema à direita. As datas de cadastro são apresentadas
em `dd/mm/aaaa`, respeitando o horário local do dispositivo.

A estrutura e os componentes usam `web/src/estilos/global.css`; os tokens e a
composição visual desta direção ficam em `web/src/estilos/retro.css`, importado
depois da base. As páginas públicas do Express têm seu equivalente em
`web/public/erro.css`. Formulários mantêm rótulos, foco visível, modal nativo e
navegação por teclado; a preferência por movimento reduzido continua respeitada.

Verificação: build, tipos e lint; conferência no navegador do login, painel,
modal, estatísticas e temas em desktop e em 390 × 844, com dados sintéticos.

# Identidade visual — breve_link

Direção escolhida: web dos anos 2000, referências de terminal e páginas deface,
com apresentação sóbria, misteriosa e simples.

- Courier New e fontes monoespaçadas locais, sem downloads de fontes.
- Fundo quase preto, texto cinza quente, verde dessaturado e detalhes em vermelho.
- Cantos retos, bordas de um pixel, separadores tracejados e links sublinhados.
- Painel centralizado com navegação horizontal, métricas compactas e tabela de links.
- Login com diagrama ASCII decorativo; textos curtos e diretos no painel.
- Tema claro em tons de papel, preservando a mesma estrutura.
- Sem efeitos piscantes, sons automáticos ou animações decorativas.

A estrutura e os componentes usam `web/src/estilos/global.css`; os tokens e a
composição visual desta direção ficam em `web/src/estilos/retro.css`, importado
depois da base. As páginas públicas do Express têm seu equivalente em
`web/public/erro.css`. Formulários mantêm rótulos, foco visível, modal nativo e
navegação por teclado; a preferência por movimento reduzido continua respeitada.

Verificação: build, tipos e lint; conferência no navegador do login, painel,
modal, estatísticas e temas em desktop e em 390 × 844, com dados sintéticos.

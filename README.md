# Orbis Sentinel

Sistema de monitoramento orbital — projeto da disciplina de Front-End Design (Global Solution 2026).

## O que é

O Orbis Sentinel é uma interface para quem trabalha monitorando queimadas e desmatamento a partir de dados de satélites e sensores ambientais. A ideia é simples: pegar um volume grande de informação dispersa e organizar tudo numa tela que dê pra ler rápido — porque em situação crítica não dá pra ficar caçando dado.

Nesta etapa o foco é só estrutura e estilo: HTML e CSS puros, sem JavaScript. A parte interativa vem depois, na disciplina de Web Development.

## Para quem é

O usuário é o operador do centro de monitoramento — a pessoa que acompanha os eventos ambientais e precisa identificar na hora quais regiões estão em risco.

Na prática, o que ele precisa fazer é ver as regiões monitoradas, perceber os alertas, abrir relatórios e chegar a uma conclusão em poucos segundos. Toda a organização da tela girou em torno disso: menos rolagem, menos cliques e o que é importante sempre em destaque.

## A cara do projeto

A referência visual veio de centro de controle espacial, painel de telemetria, essas interfaces de monitoramento que precisam transmitir confiança. Daí o fundo escuro (que cansa menos a vista em uso prolongado), bastante contraste, tipografia legível e tudo organizado em cards e painéis.

O que ficou de fora foi de propósito: nada de animação demais, cor berrante ou tela entupida de informação. A escolha o tempo todo foi entre "ficar bonito" e "ser fácil de usar" — e quando os dois brigaram, a usabilidade ganhou.

As referências que reuni estão na pasta `assets`.

## Como está montado (HTML)

Usei HTML semântico de verdade — `header`, `main`, `section`, `nav`, `aside`, `footer` — em vez de encher tudo de `div`. Isso deixa o código mais fácil de entender e ajuda leitor de tela e navegação por teclado.

### Telas

- **Início** — visão geral do sistema e os dados mais importantes.
- **Regiões monitoradas** — as áreas acompanhadas e seus níveis de risco.
- **Alertas** — dedicada aos alertas ambientais, pra bater o olho e identificar o que é crítico.
- **Relatórios** — dados consolidados para análise.

## CSS

Organizei o CSS pra ser reaproveitável: cards, painéis, áreas de destaque, menus, tabelas, botões e seções seguem o mesmo padrão. Também usei tokens de estilo (cores, espaçamentos, etc.) pra manter tudo consistente — muda num lugar, muda no projeto inteiro.

## Responsividade

- **Desktop** — layout completo, aproveitando bem o espaço.
- **Tablet** — componentes reorganizados pra continuar confortável de ler.
- **Mobile** — tudo em coluna única, priorizando legibilidade.

## Acessibilidade

Tentei não deixar isso pra última hora. O que entrou:

- contraste adequado entre texto e fundo;
- hierarquia visual clara;
- HTML semântico;
- `alt` nas imagens;
- estrutura pensada para leitores de tela;
- navegação por teclado;
- skip link para pular direto ao conteúdo principal.

## Estrutura do repositório

```
frontend-global-solutions/
├── assets/
├── css/
│   ├── style.css
│   └── alertas.css
├── index.html
├── alertas.html
├── regioes.html
├── relatorios.html
├── integrantes.txt
└── README.md
```

## Tecnologias

HTML5 e CSS3, sem framework nem biblioteca externa.

## Como rodar

Baixe o repositório, abra a pasta e dê dois cliques no `index.html`. Funciona em qualquer navegador moderno e não precisa instalar nada.

## Próximos passos

A estrutura foi feita pensando na continuidade. Na disciplina de Web Development entram os arquivos JavaScript com as funcionalidades e a interatividade, mantendo o HTML e o CSS que já estão aqui.

## Integrantes

- Marcos Vinícios Corrêa dos Santos — RM 571080
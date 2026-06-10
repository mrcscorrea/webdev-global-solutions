# Web Development – Manual de Interatividade

## Objetivo

Nesta etapa do projeto foram adicionadas funcionalidades em JavaScript ao sistema Orbis Sentinel, transformando a interface construída em Front-End Design em um protótipo funcional.

As implementações foram desenvolvidas utilizando JavaScript puro, explorando os conceitos de DOM (Document Object Model), BOM (Browser Object Model), eventos e validações.

---

# Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript
* DOM
* BOM

---

# Estrutura dos Arquivos JavaScript

```text
js/
│
├── main.js
├── alertas.js
├── regioes.js
└── relatorios.js
```

### main.js

Responsável pela página principal do sistema.

Principais funcionalidades:

* atualização dos sensores ambientais;
* atualização dos indicadores de risco;
* filtro por nível das regiões;
* sistema de login;
* abertura e fechamento do menu lateral;
* simulação da chegada de novos alertas;
* exibição de notificações na tela.

---

### alertas.js

Responsável pela central de alertas.

Principais funcionalidades:

* atualização do relógio em tempo real;
* exibição das regiões críticas;
* exibição das regiões em alerta;
* registro de eventos do sistema;
* limpeza do histórico de eventos;
* notificações ao operador.

---

### regioes.js

Responsável pelo gerenciamento das regiões monitoradas.

Principais funcionalidades:

* filtro por bioma;
* atualização automática das informações;
* variação dinâmica dos focos de calor;
* renderização da tabela de regiões;
* exibição dos cartões de resumo dos biomas.

---

### relatorios.js

Responsável pelo módulo de relatórios.

Principais funcionalidades:

* geração de relatórios personalizados;
* filtros por período;
* filtros por nível de risco;
* busca por região;
* validação dos dados informados;
* histórico de relatórios gerados;
* visualização do relatório na própria página.

---

# Recursos de JavaScript Utilizados

## Manipulação do DOM

Os elementos HTML são modificados dinamicamente através do JavaScript.

Entre as principais alterações realizadas estão:

* criação de tabelas;
* atualização de indicadores;
* criação de cartões;
* alteração de textos;
* exibição de alertas;
* atualização das informações dos sensores;
* geração dinâmica dos relatórios.

---

## Eventos

Foram utilizados eventos para permitir a interação do usuário com o sistema.

Entre eles:

* click;
* change;
* submit;
* interação com botões;
* filtros;
* login;
* navegação da interface.

---

## Browser Object Model (BOM)

Foram utilizados recursos do navegador para tornar a simulação mais próxima de um sistema real.

### setInterval()

Utilizado para:

* atualização do relógio;
* atualização dos sensores;
* sincronização automática dos dados;
* simulação dos ciclos analíticos.

### setTimeout()

Utilizado para:

* exibição temporária das notificações;
* encerramento automático de mensagens do sistema.

---

# Manual de Interatividade

## Página Inicial

### Simular novo alerta

**Ação:**

Clique no botão responsável por simular um novo evento.

**Resultado esperado:**

Uma nova região é adicionada ao sistema e os indicadores de risco são atualizados automaticamente.

---

### Filtro das regiões

**Ação:**

Selecionar um nível de risco no campo de filtro.

**Resultado esperado:**

A tabela é atualizada exibindo apenas as regiões correspondentes ao filtro escolhido.

---

### Sensores ambientais

**Ação:**

Aguardar alguns segundos.

**Resultado esperado:**

Os valores de temperatura, umidade e fumaça são alterados automaticamente, simulando as leituras enviadas pelo nó Arduino.

---

### Login

Credenciais de teste:

| Usuário       | Senha          |
| ------------- | -------------- |
| carlos.mendes | orbis2026      |
| fiap.adm      | fiap2026       |
| antonio.fiap  | webdevelopment |

**Resultado esperado:**

Caso os dados estejam corretos, o acesso é permitido. Caso contrário, mensagens de erro são apresentadas ao usuário.

---

## Página de Alertas

### Histórico de eventos

Ao acessar a página, o sistema exibe os eventos já registrados.

---

### Limpar log

**Ação:**

Clicar no botão "Limpar Log".

**Resultado esperado:**

Todos os eventos exibidos são removidos da tela.

---

### Relógio em tempo real

O horário é atualizado automaticamente a cada segundo.

---

## Página de Regiões

### Filtrar por bioma

**Ação:**

Selecionar um bioma.

**Resultado esperado:**

A tabela é atualizada mostrando apenas as regiões pertencentes ao bioma escolhido.

---

### Atualização automática

A cada ciclo de sincronização, a quantidade de focos de calor das regiões é atualizada automaticamente, simulando novos dados recebidos pelos satélites.

---

## Página de Relatórios

### Gerar relatório

**Ação:**

Preencher os filtros desejados e clicar em "Gerar Relatório".

**Resultado esperado:**

Um relatório é criado dinamicamente e exibido em tela.

---

### Histórico de relatórios

Os relatórios gerados são adicionados ao histórico do sistema.

---

# Organização do Repositório

O projeto mantém a separação entre:

* estrutura (HTML);
* estilização (CSS);
* comportamento (JavaScript).

Essa organização facilita a manutenção do código e permite a continuidade do desenvolvimento em futuras etapas.

---

# Considerações Finais

O sistema Orbis Sentinel foi desenvolvido para simular um ambiente de monitoramento ambiental baseado em dados orbitais. As funcionalidades implementadas nesta etapa permitem representar situações reais de análise, geração de alertas e acompanhamento das regiões monitoradas, utilizando os conceitos fundamentais de Web Development.

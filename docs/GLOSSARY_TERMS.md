# Termos Técnicos para o Glossário

Estes termos devem ser adicionados ao Glossário do projeto. Use a interface de Glossário (seção Learning) para adicioná-los.

## Autenticação & Segurança

### JWT (JSON Web Token)
- **Definição:** Um padrão seguro de representar informações entre sistemas. Como um cartão de identificação digital assinado.
- **Analogy:** Assim como você leva um documento com foto para provar quem é em qualquer lugar, JWT é um documento digital que você envia com cada requisição para provar sua identidade.
- **Relevância:** Usado em DevFactory para confirmar que você está logado em cada ação (criar projeto, sincronizar, etc).

### Middleware
- **Definição:** Código que intercepta requisições e respostas antes delas chegar ao destino final. Como um segurança que verifica documentos na entrada.
- **Analogy:** Como um porteiro que verifica se você tem cartão de acesso antes de deixar entrar no prédio.
- **Relevância:** DevFactory usa middleware para verificar se você está autenticado antes de deixar acessar páginas protegidas.

### Credentials Provider
- **Definição:** Sistema que aceita email/senha e valida contra um banco de dados.
- **Analogy:** Caixa do supermercado checando se seu cartão é válido.
- **Relevância:** Forma como DevFactory valida seu login.

## Backend & API

### REST (Representational State Transfer)
- **Definição:** Padrão de design para servidores que organiza operações em endereços (como URLs).
- **Analogy:** Assim como você vai à Rua A para comprar livros e à Rua B para comprar alimentos, API REST tem endereços diferentes para operações diferentes (/projects, /stories).
- **Relevância:** DevFactory usa REST API para comunicação entre Dashboard e Servidor.

### Endpoint
- **Definição:** Um endereço específico em uma API que faz uma coisa. Exemplo: /api/projects retorna lista de projetos.
- **Analogy:** Como números de telefone para departamentos diferentes (111 = vendas, 222 = suporte).
- **Relevância:** DevFactory tem ~30 endpoints para operações diferentes.

### Express.js
- **Definição:** Framework JavaScript para criar servidores web.
- **Analogy:** Como um gerenciador de restaurante que organiza quem atende, onde servem, qual é o cardápio.
- **Relevância:** Tecnologia que roda o servidor backend de DevFactory.

## Frontend & UI

### React
- **Definição:** Biblioteca JavaScript para criar interfaces reutilizáveis feitas de componentes (peças encaixáveis).
- **Analogy:** Como LEGO — você tem blocos pequenos que combina para fazer estruturas maiores. Componente "Botão" reutiliza em 100 lugares.
- **Relevância:** DevFactory Dashboard é construído com React (Next.js é React + superpoderes).

### TypeScript
- **Definição:** Extensão do JavaScript que adiciona "tipos" — você especifica o que cada variável contém (número, texto, lista).
- **Analogy:** Diferença entre "Adicione 5" vs "Adicione o número 5 ao campo de preço (em reais)". TypeScript força especificar o tipo.
- **Relevância:** Previne erros antes do código rodar. DevFactory usa em 100% do código.

### D3.js
- **Definição:** Biblioteca para desenhar visualizações de dados (gráficos, mapas, animações).
- **Analogy:** Photoshop para dados — você especifica que hexágono A fica em posição (100, 200) e ele desenha.
- **Relevância:** Responsável pelo mapa hexagonal interativo que você vê.

### Tailwind CSS
- **Definição:** Framework de estilos CSS pronto para usar. Você adiciona classes como "bg-blue" e tudo fica estilizado.
- **Analogy:** Diferença entre pintar tudo manualmente vs escolher cores de uma paleta pré-preparada.
- **Relevância:** Estilos de botões, cards, cores em DevFactory.

## Banco de Dados

### PostgreSQL
- **Definição:** Software que gerencia bancos de dados relacionais. Armazena dados em tabelas com linhas/colunas.
- **Analogy:** Uma pasta de arquivo gigante e super rápida. Você pergunta "quem é usuário 123?" e em millisegundos ela responde.
- **Relevância:** Guarda todos seus projetos, stories, configurações em DevFactory.

### Prisma (ORM)
- **Definição:** Tradutor entre código JavaScript e linguagem do banco de dados.
- **Analogy:** Você fala português, banco de dados fala SQL (lingugem estrangeira). Prisma traduz automaticamente.
- **Relevância:** Você escreve `user.create({...})` em JavaScript e Prisma converte para SQL que PostgreSQL entende.

### Schema (Banco de Dados)
- **Definição:** Definição de como os dados estão organizados. Quais tabelas, que colunas, que tipos de dados.
- **Analogy:** Planta baixa de um prédio — mostra onde ficam os cômodos e como se conectam.
- **Relevância:** DevFactory tem schema com 9 tabelas (User, Project, Module, Story, etc).

### Migration
- **Definição:** Script que modifica a estrutura do banco (adiciona coluna, cria tabela, renomeia campo).
- **Analogy:** Como construtor adicionando mais um andar ao prédio sem deitar ele abaixo.
- **Relevância:** Toda vez que DevFactory muda o banco, rodamos uma migration para sincronizar.

## IA & Modelos

### LLM (Large Language Model)
- **Definição:** Inteligência artificial massiva treinada com bilhões de textos da internet. Pode responder perguntas, analisar código, etc.
- **Analogy:** Pessoa super estudada que leu toda internet e consegue responder qualquer pergunta.
- **Relevância:** DevFactory usa Groq e Gemini (dois LLMs diferentes) para análise de arquitetura.

### Groq
- **Definição:** Empresa que oferece LLMs rápidos e baratos. Versão usada: Llama 3.3 70B.
- **Analogy:** Ônibus rápido (leva 2 segundos) vs trem luxuoso (Gemini = mais lento mas confortável).
- **Relevância:** DevFactory usa para análise rápida de código (extração de arquitetura em 2s).

### Gemini
- **Definição:** LLM do Google (2.0 Flash). Mais poderosa que Groq, mais cara, mais lenta.
- **Analogy:** Pesquisador que lê cuidadosamente (leva tempo) vs leitor rápido de jornais.
- **Relevância:** DevFactory usa para análise detalhada quando você quer profundidade.

## DevFactory Específico

### PRD (Product Requirements Document)
- **Definição:** Documento que descreve o que o software deve fazer. Tipo um receita de bolo.
- **Analogy:** Manual de instrução de um móvel — diz exatamente o que o móvel é, para que serve, que peças tem.
- **Relevância:** Você coloca um PRD em DevFactory e ele analisa o código para ver se atende aos requisitos.

### Story
- **Definição:** Uma unidade de trabalho/requisito. Tipo "Implementar autenticação com JWT".
- **Analogy:** Uma tarefa em sua lista de tarefas.
- **Relevância:** DevFactory sincroniza stories com commits do GitHub (feat: story-001 = implementando story 001).

### Module (Módulo de Arquitetura)
- **Definição:** Um grande bloco da arquitetura. Exemplo: "Autenticação" é um módulo.
- **Analogy:** Andares de um prédio — cada andar é um módulo independente.
- **Relevância:** O mapa hexagonal mostra modules (blocos coloridos).

### Component
- **Definição:** Peça pequena dentro de um module. Exemplo: dentro de "Autenticação" tem "JWT", "Session", "Credentials".
- **Analogy:** Cômodos dentro de um andar do prédio.
- **Relevância:** Você expande um módulo no mapa para ver seus componentes.

### Webhook
- **Definição:** Sistema onde GitHub avisa DevFactory quando você faz git push.
- **Analogy:** Campainha — você empurra (git push), a campainha toca (webhook), DevFactory reage.
- **Relevância:** DevFactory atualiza stories automaticamente quando você faz push com story refs no commit.

## Adicionar ao Glossário

Você pode adicionar estes termos manualmente na seção Glossário do projeto ou podemos criar um seed script. Para adicionar manualmente:

1. Vá para Projeto > Learning > Glossário
2. Clique em "Novo Termo"
3. Preencha: Nome, Definição, Analogy (opcional), Relevância (opcional)
4. Salve

Os termos ajudam outras pessoas a entender a arquitetura quando você compartilha o mapa.

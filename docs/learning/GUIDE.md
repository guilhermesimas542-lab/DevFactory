# DevFactory — Guia Completo (Linguagem Leiga)

> Bem-vindo! Este guia explica o DevFactory sem jargão técnico, como se você nunca tivesse programado antes.

---

## 🎯 O Que é DevFactory?

Imagine que você pediu para um agente de IA (como Claude ou Cursor) construir um site ou aplicativo. Você tem um documento descrevendo o que quer (seu "PRD" — Plano de Requisitos). Mas 3 problemas:

1. **Você não sabe o que está pronto** — Código está sendo escrito em arquivos que você não consegue visualizar
2. **Você não consegue acompanhar o progresso** — Quando ficou pronto? O que falta?
3. **O código fica desorganizado** — Sem alguém acompanhando, acumula código desnecessário e confuso

**DevFactory resolve isso**: É um dashboard visual que mostra:
- ✅ O que foi construído
- 📊 Quanto está pronto (em %)
- 🗺️ Como tudo se conecta
- 📚 Explicações em linguagem simples

---

## 🏗️ Como DevFactory Funciona (4 Passos)

### Passo 1: Você envia seu Plano (PRD)

**Analogia**: Como um chef que escreve a receita antes de cozinhar.

Você faz upload de um arquivo com seu plano:
- Objetivo geral do projeto
- Funcionalidades principais (chamadas "módulos")
- Prioridade de cada uma (crítico, importante, opcional)

**Onde**: Página `/projects` → "Importar PRD"

### Passo 2: DevFactory aprende sua estrutura

DevFactory lê seu plano e extrai:
- 📦 **Módulos** — Peças do quebra-cabeça (ex: "Autenticação", "Pagamentos")
- 🏆 **Hierarquia** — Qual é crítica, qual é extra
- 📋 **Stories** — Tarefas específicas dentro de cada módulo

**Resultado**: Um mapa visual mostrando tudo como um organograma.

### Passo 3: DevFactory analisa o código

Quando o agente de IA termina de construir código, DevFactory:
1. **Baixa o repositório** do GitHub
2. **Lê todos os arquivos** (sem executar, apenas análise)
3. **Procura por padrões** — "Vejo uma função de login aqui, deve ser o módulo Autenticação"
4. **Calcula progresso** — Se o plano pedia Autenticação e encontrou login, marca como 80% pronto

**Analogia**: Como revisor que confere se tudo que foi pedido está na caixa.

### Passo 4: Você acompanha no Dashboard

Dashboard mostra:
- 🟢 Módulos completos (100%)
- 🟡 Em progresso (50%)
- 🔴 Não começados (0%)
- ⚠️ Alertas — "Atenção, Autenticação deveria estar 100% e está só em 30%"

---

## 🗺️ O Mapa Hexagonal (Visualização Principal)

### O que você vê?

Hexágonos (formas de 6 lados) flutuando conectados, cada um é um módulo:

```
      [Autenticação]
       /    |    \
    [API]  [DB]  [UI]
```

### Cores têm significado:

| Cor | Significado | Exemplo |
|-----|-----------|---------|
| 🔴 Vermelho | CRÍTICO — Sem isso não funciona | Login, Pagamento |
| 🟠 Laranja | IMPORTANTE — Bem necessário | Dashboard, Relatório |
| 🔵 Azul | NECESSÁRIO — Deve estar pronto | Validação, Busca |
| 🟢 Verde | DESEJÁVEL — Seria legal ter | Tema escuro, Tutorial |
| ⚪ Cinza | OPCIONAL — Pode vir depois | Animações extras |

### Interações:

- **Hover** (passar mouse): Vê nome + progresso rápido
- **Clique**: Abre painel lateral com detalhes
- **Zoom** (scroll): Aproxima/afasta
- **Pan** (arrastar): Move o mapa
- **Reset** (botão): Volta ao zoom original

---

## 📊 Dashboard de Progresso

Mostra progresso geral do projeto:

```
Projeto: DevFactory
Progresso Geral: 75%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 75%

Por Módulo:
├─ Autenticação: 100% ✅
├─ API: 85% 🟡
├─ Dashboard: 60% 🔴
└─ Banco de Dados: 70% 🟡
```

**O que significa**:
- 100% = Completamente implementado
- 85% = Quase pronto, faltam pequenos ajustes
- 60% = Metade pronto, metade falta
- 0% = Não começou ainda

---

## 📝 Stories (Tarefas Específicas)

### O que é uma Story?

Forma de quebrar um módulo em partes menores.

**Exemplo**: Módulo "Autenticação" pode ter:
- Story 1: "Usuário consegue fazer login com email"
- Story 2: "Sistema lembra do usuário por 7 dias"
- Story 3: "Usuário consegue recuperar senha"

### Status de uma Story:

| Status | Significa |
|--------|-----------|
| ⏳ Pendente | Ainda não começou |
| 🔄 Em Progresso | Alguém está trabalhando |
| ✅ Concluída | Pronta e testada |

### Timeline de Stories

Gráfico mostrando quando cada story começou e terminou:

```
[====Story 1====]
     [====Story 2=========]
          [====Story 3====]

Tempo →
```

Barras verdes = concluídas
Barras azuis = em progresso
Barras cinzas = pendentes

---

## ⚠️ Alertas (Avisos Importantes)

Sistema automático que avisa quando algo está errado:

### Tipos de Alertas:

| Alerta | Problema | Ação |
|--------|----------|------|
| 📝 Story sem código | Você marcou como pronto mas não encontrou implementação | Verificar se foi mesmo feito |
| 💻 Código sem story | IA criou algo que não tá no plano | Decidir se mantém ou remove |
| ⏸️ Estagnação | Módulo tem 0% por mais de 7 dias | Desbloquear o trabalho |

**Severidade:**
- 🔴 **Alta** — Problema crítico que bloqueia
- 🟠 **Média** — Importante, resolver em breve
- 🔵 **Baixa** — Detalhe menor

---

## 📚 Glossário (Aprendizado)

Explicações de termos técnicos em linguagem simples.

Cada termo tem:
- **Definição** — O que é
- **Analogia** — Comparação do mundo real
- **Relevância** — Quão importante é

### Exemplo:

**Termo:** API (Interface de Programação de Aplicações)

**Definição:** Um jeito de programas se comunicarem, pedindo dados um para o outro.

**Analogia:** Como um garçom em restaurante. Você (cliente) diz ao garçom o que quer, ele vai na cozinha, traz de volta. A API é o garçom entre seu site e o banco de dados.

**Relevância:** Crítico — sem API, seu site não consegue falar com o banco de dados.

---

## 🔍 Como DevFactory Identifica o Progresso (Técnica Simplificada)

### O Mistério: "Como sabe se implementei o login?"

DevFactory usa 3 estratégias:

#### 1️⃣ **Correspondência Exata**
```
Plano diz: "Autenticação"
Código tem: função chamada "authentication"
Resultado: 100% match!
```

#### 2️⃣ **Correspondência Parcial**
```
Plano diz: "Autenticação com email"
Código tem: função "sendEmail" + "verifyToken"
Resultado: 80% match (encontrou partes relacionadas)
```

#### 3️⃣ **Busca por Padrões**
```
Plano diz: "Sistema de login"
Código tem: palavras "user", "password", "login" juntas
Resultado: 70% match (padrão comum de login)
```

**Score final**: Pega o maior dos 3 = resultado do módulo

---

## 📖 Glossário de Termos

### Termos Técnicos Usados

| Termo | O que é | Analogia |
|-------|---------|----------|
| **PRD** | Plano de Requisitos | Receita de bolo — lista de ingredientes |
| **Módulo** | Peça do projeto | Departamento de uma empresa |
| **Story** | Tarefa dentro de módulo | Receita de um ingrediente específico |
| **Código** | Instruções que o computador executa | Passos passo-a-passo da receita |
| **Repositório** | Pasta com todo o código | Caixa com todos os arquivos |
| **Progresso** | Quanto está pronto (%) | Quantas receitas você já cozinhou |
| **Alerta** | Aviso de problema | Luz vermelha do carro — algo precisa de atenção |
| **Dashboard** | Tela de acompanhamento | Painel de controle de um avião |
| **API** | Forma de programas se comunicarem | Garçom entre você e a cozinha |
| **GitHub** | Site onde código fica armazenado | Biblioteca digital |
| **Babel** | Ferramenta que lê código JavaScript | Tradutor que entende linguagem de programação |

---

## 🎮 Como Usar DevFactory (Passo-a-Passo)

### 1. Preparar seu Plano

```markdown
# DevFactory

## Visão
Criar um site de tarefas onde usuários podem listar o que fazer.

## Módulos

### 🔴 Crítico: Autenticação
- Usuário faz login com email/senha
- Sistema lembra do usuário por 7 dias

### 🟠 Importante: Tarefas
- Listar tarefas
- Criar nova tarefa
- Marcar como concluída

### 🟢 Desejável: Interface Legal
- Tema escuro
- Animações suaves
```

Salve como `plano.md`

### 2. Upload em DevFactory

- Vá para `/projects`
- Clique "+ Novo Projeto"
- Envie o arquivo `plano.md`
- Confirme a estrutura

### 3. Acompanhe no Dashboard

- Veja o mapa hexagonal se formando
- Clique em cada hexágono para detalhes
- Acompanhe progresso em tempo real

### 4. Consulte Alertas

- Se algo estiver errado, ícone 🔴 aparece
- Clique em "Alertas" para ver o quê
- Tome ação (ajusta plano ou código)

### 5. Aprenda com Glossário

- Palavra que não entende?
- Vá para "Glossário" do projeto
- Vê definição + analogia do mundo real

---

## 🚀 Dicas de Uso

### Checklist de Bom Progresso

- ✅ Sua visão (objetivo geral) é clara?
- ✅ Cada módulo tem nome descritivo?
- ✅ Hierarquia (crítico/importante/etc) faz sentido?
- ✅ O agente de IA conhece seu plano?
- ✅ Acompanha alertas semanalmente?

### Anti-padrões (Não Faça)

- ❌ Plano com 50 módulos pequenos (organize em grupos)
- ❌ Deixar alertas sem revisar por 2+ semanas
- ❌ Mudar plano constantemente (gera confusão)
- ❌ Não comunicar o plano ao agente de IA

---

## 📞 Precisa de Ajuda?

### Conceitos confusos?

Vá para **Glossário** e procure o termo. Cada definição tem analogia.

### Não entende um alerta?

Clique no alerta → "O que é isso?" → Explicação em português claro.

### Feature que espera?

Vá para **Roadmap** → v2.0 (próximas melhorias planejadas).

---

## 🎓 O que aprendeu aqui

Depois de ler este guia, você entende:

1. ✅ O que é DevFactory e por que existe
2. ✅ Como funciona (4 passos principais)
3. ✅ O que cada cor/ícone significa
4. ✅ Como técnicas simples identificam progresso
5. ✅ Como usar todas as funcionalidades
6. ✅ Glossário com 10+ termos explicados

**Próximo passo**: Faça upload de seu plano e acompanhe seu projeto! 🚀

---

**Dúvidas?** Este é um MVP (Produto Mínimo Viável). Feedback é bem-vindo em https://github.com/guilhermesimas542-lab/DevFactory/issues

**Última atualização**: 2026-03-06

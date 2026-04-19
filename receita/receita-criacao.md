# Receita para Criação do Cockpit de Gestão de Contas Mensais

## 📋 Visão Geral do Projeto

Este documento é um guia completo para construir um cockpit pessoal de gestão de contas mensais utilizando Claude Code. O sistema substituirá a planilha Excel atual por uma aplicação web moderna, com dashboards interativos, análises automáticas e alertas inteligentes.

---

## 🎯 Objetivos do Cockpit

1. **Substituir** a planilha Excel por uma interface web moderna e intuitiva
2. **Visualizar** gastos mensais com dashboards interativos e gráficos dinâmicos
3. **Categorizar** despesas de forma organizada e flexível
4. **Analisar** padrões de gastos e identificar oportunidades de economia
5. **Acompanhar** budget e metas financeiras mensais
6. **Alertar** sobre vencimentos e gastos anormais
7. **Integrar** (futuramente) com o cockpit de investimentos para visão financeira completa

---

## 🏗️ Arquitetura Recomendada

### Stack Tecnológico (Mesma do Cockpit de Investimentos)

**Frontend:**
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** Shadcn/ui + Tailwind CSS
- **Gráficos:** Recharts
- **Tabelas:** TanStack Table (React Table v8)
- **Gerenciamento Estado:** React Query (TanStack Query)
- **Validação:** Zod
- **Ícones:** Lucide React

**Backend:**
- **Runtime:** Node.js com TypeScript
- **Framework:** Next.js API Routes
- **ORM:** Prisma
- **Validação:** Zod
- **Autenticação:** NextAuth.js

**Banco de Dados:**
- **Principal:** PostgreSQL (estruturado, confiável para dados financeiros)
- **Hospedagem:** Supabase ou Railway

**Infraestrutura:**
- **Hospedagem:** Vercel (frontend + API routes)
- **Banco de Dados:** Supabase (PostgreSQL gerenciado)
- **Storage:** Supabase Storage (para comprovantes/anexos)
- **Agendamento:** Vercel Cron Jobs (alertas de vencimento)

---

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

```sql
-- Usuário
users
  id, email, password_hash, name, role, created_at, updated_at

-- Categorias de Gastos
categories
  id, name, type (DESPESA, RECEITA), icon, color, parent_id, user_id
  created_at, updated_at

-- Contas/Despesas Recorrentes
recurring_expenses
  id, user_id, category_id, name, description
  amount_type (FIXO, VARIAVEL), default_amount
  due_day, payment_method, is_active
  created_at, updated_at

-- Transações Mensais
transactions
  id, user_id, category_id, recurring_expense_id
  description, amount, transaction_date, due_date
  payment_method, status (PAGO, PENDENTE, VENCIDO)
  notes, attachment_url
  created_at, updated_at

-- Cartões de Crédito
credit_cards
  id, user_id, name, brand, last_four_digits
  credit_limit, closing_day, due_day
  is_active, created_at, updated_at

-- Faturas de Cartão
credit_card_invoices
  id, card_id, reference_month, reference_year
  total_amount, status (ABERTA, FECHADA, PAGA)
  closing_date, due_date, payment_date
  created_at, updated_at

-- Itens da Fatura
credit_card_items
  id, invoice_id, transaction_id, description
  amount, installment_number, total_installments
  purchase_date, category_id
  created_at

-- Budgets/Orçamentos
budgets
  id, user_id, category_id, month, year
  planned_amount, notes
  created_at, updated_at

-- Metas Financeiras
financial_goals
  id, user_id, name, description, target_amount
  target_date, current_amount, category, priority
  created_at, updated_at

-- Projetos Especiais
projects
  id, user_id, name, description, budget
  start_date, end_date, status
  created_at, updated_at

-- Gastos de Projetos
project_expenses
  id, project_id, transaction_id, category_id
  description, amount, expense_date
  created_at

-- Alertas e Notificações
alerts
  id, user_id, type (VENCIMENTO, BUDGET, ANOMALIA)
  message, severity (INFO, WARNING, CRITICAL)
  related_id, is_read, sent_at
  created_at

-- Configurações do Usuário
user_settings
  id, user_id, notification_email, notification_days_before
  theme (LIGHT, DARK), currency, language
  created_at, updated_at
```

---

## 🚀 Plano de Implementação com Claude Code

### Fase 1: Fundação (Semana 1-2)

#### Passo 1: Setup Inicial do Projeto

```
Prompt para Claude Code:

"Crie um projeto Next.js 14 com TypeScript, Tailwind CSS e Shadcn/ui para um cockpit de gestão de contas mensais.

Use como referência o projeto cockpit-investimento em /Users/bholanda/Desktop/cockpit-investimento

Configure o projeto com a seguinte estrutura:
- /app (rotas com App Router)
- /components (componentes reutilizáveis)
  - /ui (componentes Shadcn/ui)
  - /dashboard (componentes específicos do dashboard)
- /lib (utilidades, configurações)
- /types (definições TypeScript)
- /prisma (schema do banco)

Inclua:
- ESLint + Prettier (mesma config do cockpit-investimento)
- Configuração do Tailwind otimizada
- Shadcn/ui com tema dark/light
- Estrutura de pastas idêntica ao cockpit-investimento

Instale as mesmas dependências do cockpit-investimento:
- @radix-ui components
- recharts
- @tanstack/react-query
- zod
- lucide-react
- date-fns
- axios

Crie o package.json com scripts similares."
```

#### Passo 2: Configurar Banco de Dados

```
Prompt para Claude Code:

"Configure o Prisma com PostgreSQL e crie o schema completo para o cockpit de contas baseado na estrutura fornecida em /Users/bholanda/Desktop/cockpit-contas/receita/requisitos.md.

Crie as seguintes tabelas com relações apropriadas:
1. User (usuário)
2. Category (categorias de gastos)
3. RecurringExpense (contas recorrentes)
4. Transaction (transações mensais)
5. CreditCard (cartões de crédito)
6. CreditCardInvoice (faturas)
7. CreditCardItem (itens da fatura)
8. Budget (orçamentos)
9. FinancialGoal (metas financeiras)
10. Project (projetos especiais)
11. ProjectExpense (gastos de projetos)
12. Alert (alertas)
13. UserSettings (configurações)

Use como referência o schema.prisma do cockpit-investimento em:
/Users/bholanda/Desktop/cockpit-investimento/prisma/schema.prisma

Adicione:
- Timestamps automáticos (createdAt, updatedAt)
- Relações com onDelete: Cascade onde apropriado
- Índices para otimização (em campos de busca frequente)
- Enums para status, tipos, categorias padrão
- Validações de dados no nível do banco
- Migrations iniciais"
```

#### Passo 3: Sistema de Autenticação

```
Prompt para Claude Code:

"Implemente autenticação com NextAuth.js usando a mesma estrutura do cockpit-investimento.

Use como referência:
- /Users/bholanda/Desktop/cockpit-investimento/lib/auth.ts
- /Users/bholanda/Desktop/cockpit-investimento/app/api/auth/[...nextauth]/route.ts

Implemente:
1. Credenciais (email/password) com bcrypt
2. Páginas de login, registro e recuperação de senha
3. Proteção de rotas com middleware
4. Session management
5. Roles (USER, ADMIN) para futura gestão multiusuário
6. API routes para:
   - POST /api/auth/register
   - POST /api/auth/login
   - POST /api/auth/forgot-password
   - POST /api/auth/reset-password

Crie as páginas:
- /app/auth/login/page.tsx
- /app/auth/register/page.tsx
- /app/auth/forgot-password/page.tsx"
```

---

### Fase 2: Dashboard Principal (Semana 3-4)

#### Passo 4: Layout Base com Sidebar

```
Prompt para Claude Code:

"Crie o layout principal do dashboard inspirado no layout do cockpit-investimento.

Use como referência:
/Users/bholanda/Desktop/cockpit-investimento/app/dashboard/layout.tsx

Crie um layout com:
1. **Sidebar (desktop):**
   - Logo "Cockpit Contas"
   - Seções de navegação:
     a) Principal
        - Dashboard (LayoutDashboard icon)
        - Análises (BarChart3 icon)

     b) Gestão Financeira
        - Transações (ArrowRightLeft icon)
        - Contas Recorrentes (Calendar icon)
        - Cartões de Crédito (CreditCard icon)
        - Categorias (Tags icon)

     c) Planejamento
        - Budget (Target icon)
        - Metas (TrendingUp icon)
        - Projetos (Briefcase icon)

     d) Relatórios
        - Mensal (FileText icon)
        - Anual (BarChart2 icon)
        - Comparativos (GitCompare icon)

     e) Configurações
        - Importar Dados (Upload icon)
        - Perfil (User icon)
        - Configurações (Settings icon)

   - Informações do usuário no rodapé
   - Botão de Sair

2. **Header (topo):**
   - Indicadores rápidos:
     - Total gastos do mês
     - Budget restante
     - Contas pendentes
   - Botão de tema (dark/light)
   - Avatar do usuário (mobile)

3. **Main Content Area:**
   - Espaço para conteúdo das páginas
   - Padding adequado
   - Scroll independente

Use Shadcn/ui components e Lucide icons.
Implemente responsividade (sidebar collapse em mobile).
Mantenha o mesmo estilo visual do cockpit-investimento."
```

#### Passo 5: Dashboard - Cards de Métricas

```
Prompt para Claude Code:

"Crie o dashboard principal com cards de métricas e overview mensal.

Estrutura da página /app/dashboard/page.tsx:

1. **Cards de Resumo (grid 2x2 em desktop):**
   a) Total Gastos do Mês
      - Valor total
      - Comparação com mês anterior (% e ícone ↑↓)
      - Cor: vermelho se aumentou, verde se diminuiu

   b) Budget do Mês
      - Valor gasto / Budget total
      - Barra de progresso
      - Percentual utilizado
      - Cor: verde (OK), amarelo (>80%), vermelho (>100%)

   c) Contas Pendentes
      - Quantidade de contas não pagas
      - Valor total pendente
      - Próximo vencimento

   d) Média Mensal (últimos 6 meses)
      - Valor da média
      - Comparação com mês atual
      - Tendência (gráfico de linha mini)

2. **Seção de Gráficos:**
   Use Recharts (mesma lib do cockpit-investimento)

   a) Gráfico de Pizza: Distribuição por Categoria
      - Mostrar top 5 categorias + "Outros"
      - Cores distintas
      - Tooltip com valor e percentual
      - Legend interativa

   b) Gráfico de Barras: Últimos 12 Meses
      - Eixo X: meses
      - Eixo Y: valores
      - Tooltip com detalhes
      - Linha de tendência

   c) Gráfico de Área Empilhada: Composição Mensal
      - Últimos 6 meses
      - Cores por categoria
      - Tooltip detalhado

3. **Tabela de Transações Recentes:**
   - Últimas 10 transações
   - Colunas: Data, Descrição, Categoria, Valor, Status
   - Botão "Ver Todas"

Crie componentes reutilizáveis:
- /components/dashboard/metric-card.tsx
- /components/dashboard/category-chart.tsx
- /components/dashboard/monthly-trends-chart.tsx
- /components/dashboard/recent-transactions.tsx

Implemente API routes:
- GET /api/dashboard/metrics (retorna métricas do mês)
- GET /api/dashboard/charts (retorna dados para gráficos)
- GET /api/transactions/recent (últimas transações)

Use React Query para cache e loading states."
```

#### Passo 6: CRUD de Transações

```
Prompt para Claude Code:

"Implemente o sistema completo de gestão de transações.

1. **Página de Listagem** (/app/dashboard/transacoes/page.tsx):
   - Filtros:
     - Mês/Ano (DatePicker)
     - Categoria (Select multi)
     - Status (Pago/Pendente/Vencido)
     - Forma de pagamento
     - Valor (range)
   - Tabela com TanStack Table:
     - Colunas: Data, Descrição, Categoria, Valor, Status, Ações
     - Ordenação por qualquer coluna
     - Paginação
     - Busca por texto
   - Botão "Nova Transação"
   - Ações em massa: marcar como pago, deletar selecionadas
   - Totalizadores: soma dos filtrados, quantidade

2. **Formulário de Criação/Edição:**
   - Modal ou drawer com:
     - Descrição (text input)
     - Categoria (select com ícones)
     - Valor (number input formatado R$)
     - Data da transação (date picker)
     - Data de vencimento (date picker)
     - Status (select: Pago/Pendente)
     - Forma de pagamento (select: Dinheiro/Débito/Crédito/Pix/Boleto)
     - Conta recorrente? (checkbox - vincular a recurring_expense)
     - Cartão de crédito (se forma = crédito)
     - Parcelamento (se crédito)
     - Notas (textarea)
     - Upload de comprovante (file input)
   - Validação com Zod
   - Feedback visual de erros
   - Loading state no submit

3. **API Routes:**
   - GET /api/transactions (list com filtros, paginação)
   - POST /api/transactions (criar)
   - PUT /api/transactions/[id] (editar)
   - DELETE /api/transactions/[id] (deletar)
   - PATCH /api/transactions/[id]/status (marcar pago/pendente)
   - POST /api/transactions/bulk-update (atualizar múltiplas)

4. **Componentes:**
   - /components/transactions/transaction-form.tsx
   - /components/transactions/transaction-table.tsx
   - /components/transactions/transaction-filters.tsx
   - /components/transactions/bulk-actions.tsx

Use Shadcn/ui: Dialog, Select, Input, Button, Badge, Table
Use date-fns para formatação de datas
Implemente optimistic updates com React Query"
```

---

### Fase 3: Categorias e Contas Recorrentes (Semana 5)

#### Passo 7: Gestão de Categorias

```
Prompt para Claude Code:

"Implemente o sistema de categorias personalizáveis.

1. **Página de Categorias** (/app/dashboard/categorias/page.tsx):
   - Grid de cards de categorias
   - Cada card mostra:
     - Ícone (lucide-react)
     - Nome da categoria
     - Cor (badge ou border)
     - Total gasto no mês atual
     - % do total
     - Número de transações
   - Botão "Nova Categoria"
   - Possibilidade de editar/deletar (com confirmação)

2. **Categorias Padrão (seed inicial):**
   Crie as seguintes categorias ao iniciar o banco:

   **Casa:**
   - IPTU (Home icon, cor: blue)
   - Condomínio (Building icon, cor: blue)
   - Água (Droplets icon, cor: cyan)
   - Gás (Flame icon, cor: orange)
   - Luz (Zap icon, cor: yellow)
   - Internet (Wifi icon, cor: purple)
   - Limpeza (Sparkles icon, cor: teal)
   - Seguro Casa (Shield icon, cor: blue)

   **Pet:**
   - Day Care (Dog icon, cor: pink)
   - Plano Saúde Pet (Heart icon, cor: red)
   - Alimentação Pet (Bone icon, cor: brown)
   - Veterinário (Stethoscope icon, cor: green)

   **Transporte:**
   - Combustível (Fuel icon, cor: red)
   - Estacionamento (ParkingCircle icon, cor: gray)
   - Uber/99 (Car icon, cor: black)
   - Manutenção (Wrench icon, cor: orange)
   - IPVA (FileText icon, cor: blue)

   **Alimentação:**
   - Mercado (ShoppingCart icon, cor: green)
   - Restaurante (UtensilsCrossed icon, cor: orange)
   - Delivery (Bike icon, cor: red)

   **Saúde:**
   - Plano Saúde (Heart icon, cor: red)
   - Farmácia (Pill icon, cor: green)
   - Consultas (Stethoscope icon, cor: blue)

   **Lazer:**
   - Streaming (Tv icon, cor: purple)
   - Cinema (Film icon, cor: red)
   - Viagens (Plane icon, cor: blue)

   **Outras:**
   - Presentes (Gift icon, cor: pink)
   - Eventuais (MoreHorizontal icon, cor: gray)

3. **Formulário de Categoria:**
   - Nome (text)
   - Ícone (select com preview de ícones do Lucide)
   - Cor (color picker ou select de cores pré-definidas)
   - Tipo (Despesa/Receita)
   - Categoria pai (para subcategorias)

4. **API Routes:**
   - GET /api/categories
   - POST /api/categories
   - PUT /api/categories/[id]
   - DELETE /api/categories/[id] (validar se tem transações)

Crie seed script para popular categorias padrão:
/prisma/seed.ts"
```

#### Passo 8: Contas Recorrentes

```
Prompt para Claude Code:

"Implemente gestão de contas recorrentes (despesas que se repetem mensalmente).

1. **Página de Contas Recorrentes** (/app/dashboard/contas-recorrentes/page.tsx):
   - Listagem em cards ou tabela
   - Informações:
     - Nome da conta
     - Categoria
     - Valor (fixo ou "variável")
     - Dia de vencimento
     - Status (ativa/inativa)
     - Última lançada (mês/ano)
   - Botão "Nova Conta Recorrente"
   - Toggle para ativar/desativar
   - Ação: "Lançar no mês atual" (cria transaction)

2. **Formulário:**
   - Nome (ex: "Condomínio", "Netflix")
   - Categoria (select)
   - Tipo de valor:
     - Fixo (input de valor)
     - Variável (sem valor fixo, usuário informa ao lançar)
   - Dia de vencimento (1-31)
   - Forma de pagamento padrão
   - Descrição/Notas
   - Status (ativa/inativa)

3. **Funcionalidade "Lançar Mês":**
   - Botão no dashboard: "Lançar contas do mês"
   - Modal mostra lista de contas recorrentes ativas
   - Usuário pode:
     - Confirmar valor (se fixo, vem preenchido)
     - Ajustar se necessário (contas variáveis)
     - Marcar quais lançar
     - Definir data de vencimento (dia já vem da conta, mês/ano atual)
   - Ao confirmar, cria transactions em batch
   - Mostra resumo: "X contas lançadas, total: R$ Y"

4. **Sugestões Inteligentes:**
   - Ao criar nova transação, se descrição é similar a uma conta recorrente,
     sugerir vincular
   - Ao fim do mês, alertar contas recorrentes não lançadas

5. **API Routes:**
   - GET /api/recurring-expenses
   - POST /api/recurring-expenses
   - PUT /api/recurring-expenses/[id]
   - DELETE /api/recurring-expenses/[id]
   - POST /api/recurring-expenses/launch-month (lançar múltiplas)

Componentes:
- /components/recurring/recurring-expense-card.tsx
- /components/recurring/launch-month-dialog.tsx"
```

---

### Fase 4: Cartão de Crédito e Budget (Semana 6)

#### Passo 9: Gestão de Cartões de Crédito

```
Prompt para Claude Code:

"Implemente sistema completo de gestão de cartões de crédito e faturas.

1. **Página de Cartões** (/app/dashboard/cartoes/page.tsx):
   - Cards visuais de cada cartão (estilo cartão de crédito)
   - Informações:
     - Nome/Bandeira
     - Últimos 4 dígitos
     - Limite total
     - Limite disponível
     - Fatura atual (aberta)
     - Próximo vencimento
   - Botão "Novo Cartão"

2. **Formulário de Cartão:**
   - Nome/apelido (ex: "Nubank Pessoal")
   - Bandeira (Visa, Master, Elo, etc)
   - 4 últimos dígitos (para identificação)
   - Limite de crédito
   - Dia de fechamento (1-31)
   - Dia de vencimento (1-31)
   - Status (ativo/inativo)

3. **Página de Fatura** (/app/dashboard/cartoes/[id]/fatura/page.tsx):
   - Seletor de mês/ano
   - Resumo da fatura:
     - Valor total
     - Status (Aberta/Fechada/Paga)
     - Data de fechamento
     - Data de vencimento
     - Valor pago (se paga)
   - Tabela de itens:
     - Data da compra
     - Descrição
     - Categoria
     - Valor
     - Parcela (X/Y se parcelado)
   - Agrupamento por categoria (opcional)
   - Gráfico de pizza da fatura
   - Botão "Marcar como Paga"
   - Exportar fatura (PDF)

4. **Lançamento de Compra no Cartão:**
   - No formulário de transação, se forma de pagamento = Crédito:
     - Select de cartão
     - Opção de parcelar
     - Se parcelado:
       - Número de parcelas
       - Criar N transactions (uma por mês)
       - Vincular todas à mesma compra
       - Marcar parcela X/Y

5. **Lógica de Fatura:**
   - Faturas são criadas automaticamente ao adicionar item
   - Status "Aberta" até o dia de fechamento
   - Após fechamento, status "Fechada" (não aceita mais itens)
   - Usuário marca como "Paga" quando pagar
   - Calcular automaticamente limite disponível

6. **API Routes:**
   - GET /api/credit-cards
   - POST /api/credit-cards
   - PUT /api/credit-cards/[id]
   - DELETE /api/credit-cards/[id]
   - GET /api/credit-cards/[id]/invoices
   - GET /api/credit-cards/[id]/invoices/[month]/[year]
   - PATCH /api/invoices/[id]/pay (marcar como paga)

7. **Alertas:**
   - X dias antes do vencimento (configurável)
   - Quando atingir 80% do limite
   - Quando ultrapassar limite

Componentes:
- /components/credit-card/card-visual.tsx
- /components/credit-card/invoice-details.tsx
- /components/credit-card/invoice-items-table.tsx"
```

#### Passo 10: Budget e Metas

```
Prompt para Claude Code:

"Implemente sistema de budget (orçamento) e metas financeiras.

1. **Página de Budget** (/app/dashboard/budget/page.tsx):

   **Seção 1: Budget Mensal**
   - Seletor de mês/ano
   - Card de resumo:
     - Budget total planejado
     - Gasto realizado
     - Saldo restante
     - Percentual consumido
     - Barra de progresso

   - Tabela de budget por categoria:
     - Categoria
     - Budget planejado
     - Gasto real
     - Diferença (R$ e %)
     - Status (OK, Atenção, Excedido)
     - Progress bar
   - Botão "Definir Budget do Mês"

   **Seção 2: Gráficos**
   - Budget vs Realizado (barras agrupadas)
   - Evolução mensal (planejado vs realizado últimos 6 meses)
   - Top categorias que mais estouram budget

2. **Formulário de Budget:**
   - Modal "Definir Budget"
   - Mês/Ano de referência
   - Opções:
     a) Budget total (divide automaticamente por categoria baseado em histórico)
     b) Budget por categoria (define cada uma manualmente)
   - Auto-preencher com:
     - Média dos últimos 3 meses
     - Mesmo valor do mês anterior
     - 10% a mais/menos que mês anterior
   - Salvar como template para meses futuros

3. **Página de Metas** (/app/dashboard/metas/page.tsx):
   - Cards de metas ativas:
     - Nome da meta (ex: "Viagem para Europa")
     - Valor alvo
     - Data limite
     - Progresso atual (R$ e %)
     - Progress bar
     - Quanto falta
     - Quanto economizar por mês para atingir
   - Botão "Nova Meta"
   - Filtros: Todas, Ativas, Concluídas, Vencidas

4. **Formulário de Meta:**
   - Nome da meta
   - Descrição
   - Valor alvo
   - Data limite
   - Valor já economizado (atual)
   - Categoria associada (opcional)
   - Prioridade (Alta, Média, Baixa)
   - Adicionar fundos à meta (link com transações de poupança)

5. **Dashboard de Metas:**
   - Gráfico de evolução das metas
   - Projeção: se continuar economizando X por mês, atingirá em Y meses
   - Simulador: "Se eu economizar R$ X por mês, atinjo a meta em..."

6. **API Routes:**
   - GET /api/budgets (listar por mês/ano)
   - POST /api/budgets (criar budget do mês)
   - PUT /api/budgets/[id]
   - GET /api/budgets/comparison (budget vs real)
   - GET /api/goals
   - POST /api/goals
   - PUT /api/goals/[id]
   - PATCH /api/goals/[id]/add-funds (adicionar fundos)

Componentes:
- /components/budget/budget-table.tsx
- /components/budget/budget-form.tsx
- /components/budget/budget-progress.tsx
- /components/goals/goal-card.tsx
- /components/goals/goal-form.tsx
- /components/goals/goal-simulator.tsx"
```

---

### Fase 5: Análises e Relatórios (Semana 7)

#### Passo 11: Página de Análises

```
Prompt para Claude Code:

"Crie página de análises detalhadas com múltiplas visualizações.

Página: /app/dashboard/analise/page.tsx

**Estrutura:**

1. **Filtros Globais (topo):**
   - Período:
     - Pré-definidos: Mês atual, Últimos 3 meses, Últimos 6 meses, Ano atual, Ano anterior
     - Customizado: range de datas
   - Categorias (multi-select)
   - Comparar com período anterior (toggle)

2. **Tabs de Análises:**

   **Tab 1: Visão Geral**
   - Cards de KPIs:
     - Total gasto no período
     - Média mensal
     - Maior gasto
     - Categoria com mais gastos
   - Gráfico de linha: Evolução temporal
   - Gráfico de pizza: Distribuição por categoria
   - Tabela: Top 10 maiores gastos do período

   **Tab 2: Por Categoria**
   - Seletor de categoria
   - Gráfico de evolução mensal da categoria
   - Comparação com média histórica
   - Principais itens da categoria
   - Tendência (crescendo/decrescendo)
   - Variabilidade (desvio padrão)

   **Tab 3: Comparativos**
   - Mês atual vs Mês anterior
   - Ano atual vs Ano anterior
   - Gráficos lado a lado
   - Tabela de diferenças (R$ e %)
   - Categorias que mais variaram
   - Insights: "Você gastou 30% a mais em Alimentação este mês"

   **Tab 4: Tendências**
   - Gráfico de tendência de longo prazo (últimos 12-24 meses)
   - Sazonalidade: identificar meses de maior/menor gasto
   - Média móvel (3 meses, 6 meses)
   - Projeção para próximos meses (baseado em histórico)

   **Tab 5: Anomalias**
   - Gastos atípicos (outliers)
   - Transações muito acima da média da categoria
   - Categorias com variação > 50% vs média
   - Alertas de gastos suspeitos

3. **Insights Automáticos:**
   Caixa de insights com análise textual:
   - "Seus gastos em Alimentação aumentaram 25% comparado ao mês passado"
   - "Você está gastando R$ 500 a mais que sua média mensal"
   - "Categoria Lazer está 150% acima do budget"
   - "Padrão identificado: gastos aumentam em média 20% em dezembro"

4. **API Routes:**
   - GET /api/analytics/overview
   - GET /api/analytics/by-category
   - GET /api/analytics/comparison
   - GET /api/analytics/trends
   - GET /api/analytics/anomalies
   - GET /api/analytics/insights (análise de IA com Claude - opcional)

Componentes:
- /components/analytics/kpi-cards.tsx
- /components/analytics/evolution-chart.tsx
- /components/analytics/category-analysis.tsx
- /components/analytics/comparison-view.tsx
- /components/analytics/trends-chart.tsx
- /components/analytics/insights-box.tsx

Use Recharts para todos os gráficos.
Implemente lazy loading para gráficos pesados."
```

#### Passo 12: Relatórios Exportáveis

```
Prompt para Claude Code:

"Implemente sistema de geração de relatórios em PDF e Excel.

1. **Página de Relatórios** (/app/dashboard/relatorios/page.tsx):
   - Templates de relatórios:
     a) Relatório Mensal Completo
     b) Relatório Anual
     c) Comparativo Períodos
     d) Relatório por Categoria
     e) Relatório de Budget
     f) Relatório de Cartões de Crédito
     g) Relatório Customizado

   - Para cada template:
     - Preview do conteúdo
     - Configurações (período, categorias, etc)
     - Botões: Gerar PDF, Exportar Excel, Enviar por Email

2. **Relatório Mensal:**
   Conteúdo:
   - Resumo executivo:
     - Total gasto
     - Budget e aderência
     - Comparação com mês anterior
   - Gráfico de distribuição por categoria
   - Tabela de gastos por categoria
   - Top 10 maiores gastos
   - Contas pendentes
   - Próximos vencimentos
   - Cartões: resumo de faturas

3. **Exportação Excel:**
   - Sheets:
     - Resumo (métricas principais)
     - Transações (todas as transações do período)
     - Por Categoria (totalização)
     - Budget vs Real
     - Gráficos (charts do Excel)

   Usar biblioteca: xlsx ou exceljs

4. **Exportação PDF:**
   - Layout profissional
   - Header com logo e período
   - Sections bem definidas
   - Gráficos renderizados
   - Tabelas formatadas
   - Footer com data de geração

   Usar biblioteca: jsPDF + html2canvas ou @react-pdf/renderer

5. **Envio por Email:**
   - Configuração de email (SMTP ou Resend)
   - Template de email com relatório anexado
   - Agendamento de envio recorrente (opcional)

   Usar: Resend ou Nodemailer

6. **API Routes:**
   - POST /api/reports/generate (gera relatório em memória)
   - GET /api/reports/monthly/[month]/[year]/pdf
   - GET /api/reports/monthly/[month]/[year]/excel
   - POST /api/reports/email (envia por email)

Componentes:
- /components/reports/report-templates.tsx
- /components/reports/report-config.tsx
- /components/reports/pdf-document.tsx (React PDF)
- /components/reports/excel-generator.tsx"
```

---

### Fase 6: Importação de Dados (Semana 8)

#### Passo 13: Importação da Planilha Excel

```
Prompt para Claude Code:

"Implemente sistema de importação de dados da planilha Excel atual.

Referência da planilha: /Users/bholanda/Desktop/cockpit-contas/Contas dos xuxus.xlsx

1. **Página de Importação** (/app/dashboard/importar/page.tsx):

   **Opções de Importação:**
   a) Planilha Excel (arquivo .xlsx)
   b) CSV
   c) Extrato bancário (OFX)
   d) Fatura de cartão (PDF - OCR futuro)

2. **Fluxo de Importação Excel:**

   **Etapa 1: Upload**
   - Drag & drop ou file picker
   - Validar formato (.xlsx)
   - Preview das sheets disponíveis
   - Selecionar sheet a importar (ex: "2025", "Histórico contas")

   **Etapa 2: Mapeamento de Colunas**
   - Parser automático identifica estrutura
   - Usuário mapeia colunas:
     - Coluna "Conta" → Campo "Descrição"
     - Colunas de meses → Gerar transações por mês
     - Identificar categorias
   - Preview de como ficará importado (tabela)

   **Etapa 3: Configuração**
   - Ano de referência
   - Categoria padrão (se não identificar)
   - Status das transações (Pago/Pendente)
   - Substituir dados existentes? (sim/não)
   - Importar apenas dados novos

   **Etapa 4: Processamento**
   - Progress bar
   - Logs de importação
   - Alertas de erros/avisos
   - Resumo final:
     - X transações importadas
     - Y categorias criadas
     - Z erros ignorados

3. **Parser Inteligente:**
   - Identificar padrão da planilha:
     - Primeira linha = header com datas
     - Primeira coluna = nomes das contas
     - Células = valores
   - Para cada linha (conta):
     - Identificar categoria baseada no nome
     - Para cada coluna (mês):
       - Criar transaction se célula tem valor
       - Data = primeiro dia do mês
   - Tratar fórmulas (executar ou pegar valor)
   - Tratar células em branco

4. **Mapeamento Automático de Categorias:**
   - "IPTU" → Categoria "IPTU"
   - "Condomínio" → Categoria "Condomínio"
   - "Água" → Categoria "Água"
   - etc.
   - Criar categorias se não existirem
   - Sugerir categoria similar se nome não bater exatamente

5. **Importação de Histórico:**
   - Sheet "Histórico contas" tem dados de 2022-2024
   - Importar tudo para ter base histórica
   - Permitir análises de tendência de longo prazo

6. **API Routes:**
   - POST /api/import/upload (faz upload do arquivo)
   - POST /api/import/parse (analisa e retorna preview)
   - POST /api/import/execute (executa importação)
   - GET /api/import/history (histórico de importações)

7. **Bibliotecas:**
   - xlsx (ler Excel)
   - papaparse (ler CSV)
   - ofx (ler OFX)

Componentes:
- /components/import/file-upload.tsx
- /components/import/column-mapping.tsx
- /components/import/import-preview.tsx
- /components/import/import-progress.tsx

Use a mesma estrutura da importação do cockpit-investimento como referência:
/Users/bholanda/Desktop/cockpit-investimento/app/dashboard/importar/page.tsx"
```

---

### Fase 7: Projetos Especiais e Alertas (Semana 9)

#### Passo 14: Projetos Especiais

```
Prompt para Claude Code:

"Implemente gestão de projetos especiais (ex: Obra, Casamento, Viagem).

Baseado na aba 'Gastos Obra 2025' da planilha atual.

1. **Página de Projetos** (/app/dashboard/projetos/page.tsx):
   - Cards de projetos ativos:
     - Nome do projeto
     - Budget total
     - Gasto até agora
     - Saldo restante
     - Progress bar
     - Período (data início - data fim)
     - Status (Em andamento/Concluído/Cancelado)
   - Botão "Novo Projeto"

2. **Detalhes do Projeto** (/app/dashboard/projetos/[id]/page.tsx):
   - Resumo:
     - Descrição
     - Budget planejado
     - Gasto realizado
     - Saldo
     - Percentual consumido
   - Timeline de gastos:
     - Gráfico de evolução
     - Milestones
   - Tabela de gastos do projeto:
     - Data, Descrição, Categoria, Valor
     - Adicionar gasto
     - Vincular transação existente
   - Projeção:
     - Se continuar gastando na média, budget acaba em X dias
     - Alerta se projetado > budget

3. **Formulário de Projeto:**
   - Nome (ex: "Obra 2025", "Casamento")
   - Descrição
   - Budget total
   - Data de início
   - Data prevista de término
   - Categorias relacionadas (opcional)
   - Status

4. **Vincular Transações a Projetos:**
   - No formulário de transação, campo opcional "Projeto"
   - Transaction fica vinculada tanto à categoria quanto ao projeto
   - Permite análise dupla:
     - Por categoria: quantos gastos de "Material de Construção"
     - Por projeto: quantos gastos do "Projeto Obra"

5. **Relatório de Projeto:**
   - Exportar gastos do projeto em PDF/Excel
   - Resumo executivo
   - Comparativo com budget
   - Breakdown por categoria

6. **API Routes:**
   - GET /api/projects
   - POST /api/projects
   - PUT /api/projects/[id]
   - DELETE /api/projects/[id]
   - GET /api/projects/[id]/expenses
   - POST /api/projects/[id]/expenses
   - GET /api/projects/[id]/report

Componentes:
- /components/projects/project-card.tsx
- /components/projects/project-form.tsx
- /components/projects/project-expenses.tsx
- /components/projects/project-timeline.tsx"
```

#### Passo 15: Sistema de Alertas

```
Prompt para Claude Code:

"Implemente sistema de alertas e notificações.

1. **Tipos de Alertas:**
   a) **Vencimento:**
      - Conta vence em X dias
      - Fatura de cartão vence em X dias

   b) **Budget:**
      - Categoria atingiu 80% do budget
      - Categoria ultrapassou budget
      - Budget total do mês em risco

   c) **Anomalia:**
      - Gasto muito acima da média
      - Categoria com variação > 50% vs mês anterior
      - Transação duplicada suspeita

   d) **Metas:**
      - Meta próxima da data limite e longe do alvo
      - Meta atingida (comemoração!)

   e) **Cartão:**
      - Limite de crédito próximo (80%)
      - Limite ultrapassado

   f) **Lembretes:**
      - Lançar contas recorrentes do mês
      - Há contas pendentes de lançamento
      - Revisar gastos do mês

2. **Centro de Notificações:**
   - Ícone de sino no header com badge de não lidas
   - Dropdown com lista de alertas
   - Cada alerta:
     - Ícone e cor por severidade
     - Mensagem
     - Timestamp
     - Ação rápida (marcar como pago, ver detalhes, etc)
   - Marcar como lida / Marcar todas como lidas
   - Ir para página de todas as notificações

3. **Página de Alertas** (/app/dashboard/alertas/page.tsx):
   - Filtros: Tipo, Severidade, Status (Lida/Não lida)
   - Tabs: Não lidas, Todas, Arquivadas
   - Listagem completa
   - Ações em massa

4. **Configuração de Alertas:**
   - Em /app/dashboard/configuracoes/page.tsx
   - Habilitar/Desabilitar por tipo
   - Configurar antecedência:
     - Alertar vencimentos com X dias de antecedência (padrão: 7)
     - Alertar budget ao atingir X% (padrão: 80)
   - Canais de notificação:
     - In-app (sempre)
     - Email (opcional)
     - Push notification (browser)

5. **Geração Automática de Alertas:**
   - Cron job diário (Vercel Cron):
     - Verificar vencimentos próximos
     - Calcular budgets e comparar
     - Identificar anomalias
     - Verificar metas
   - Trigger em eventos:
     - Ao criar transação, verificar se excede budget
     - Ao adicionar item no cartão, verificar limite

6. **Email de Alertas:**
   - Resumo diário (opcional):
     - Vencimentos do dia
     - Contas pendentes
     - Alertas críticos
   - Email imediato para alertas críticos

7. **API Routes:**
   - GET /api/alerts (listar alertas)
   - GET /api/alerts/unread-count
   - PATCH /api/alerts/[id]/read
   - POST /api/alerts/mark-all-read
   - DELETE /api/alerts/[id]
   - GET /api/cron/generate-alerts (chamado pelo cron job)

8. **Configuração do Cron Job:**
   - Arquivo: /app/api/cron/daily-alerts/route.ts
   - Executar diariamente às 8h
   - vercel.json:
     ```json
     {
       "crons": [{
         "path": "/api/cron/daily-alerts",
         "schedule": "0 8 * * *"
       }]
     }
     ```

Componentes:
- /components/alerts/notification-dropdown.tsx
- /components/alerts/alert-item.tsx
- /components/alerts/alert-list.tsx
- /components/alerts/alert-settings.tsx"
```

---

### Fase 8: Otimização e Deploy (Semana 10)

#### Passo 16: Performance e UX

```
Prompt para Claude Code:

"Otimize a aplicação para performance e experiência do usuário.

1. **Performance:**
   - Implementar React Query em todas as pages:
     - Cache de dados
     - Stale time configurado
     - Refetch on window focus
     - Optimistic updates

   - Code splitting:
     - Lazy load de páginas pesadas
     - Dynamic imports para modals e componentes grandes
     - Suspense boundaries

   - Otimização de imagens:
     - Usar next/image
     - Lazy loading
     - Placeholder blur

   - Otimização de queries:
     - Índices no Prisma
     - Limit e pagination em queries
     - Select apenas campos necessários
     - Agregações no banco (não no JS)

   - Memoização:
     - useMemo para cálculos pesados
     - React.memo para componentes que re-renderizam muito

2. **Loading States:**
   - Skeleton loaders (shadcn/ui)
   - Spinners onde apropriado
   - Loading bar no topo (nprogress)
   - Disable buttons durante submit
   - Mostrar "Salvando..." / "Carregando..."

3. **Error Handling:**
   - Error boundaries React
   - Toast de erros (shadcn/ui toast)
   - Mensagens amigáveis
   - Retry automático em falhas de rede
   - Fallback UI para erros

4. **UX Improvements:**
   - Feedback visual imediato em todas as ações
   - Animações suaves (Tailwind transitions)
   - Confirmação antes de deletar
   - Auto-save em formulários (draft)
   - Atalhos de teclado:
     - Ctrl+K: busca global
     - N: nova transação
     - ?: ajuda/atalhos
   - Tooltips em ícones
   - Placeholders úteis em inputs
   - Validação em tempo real

5. **Acessibilidade:**
   - Aria labels
   - Navegação por teclado
   - Contraste adequado
   - Focus visible
   - Screen reader friendly

6. **Mobile Responsiveness:**
   - Testar em múltiplos breakpoints
   - Menu hamburguer em mobile
   - Touch-friendly (botões maiores)
   - Swipe gestures onde apropriado
   - Bottom sheet em vez de modals (mobile)

7. **PWA (Progressive Web App):**
   - Service worker
   - Manifest.json
   - Offline fallback
   - Instalável
   - Push notifications

Crie:
- /lib/query-client.ts (configuração React Query)
- /components/ui/skeleton.tsx (skeleton loader)
- /components/error-boundary.tsx
- /hooks/useDebounce.ts
- /hooks/useKeyboardShortcut.ts"
```

#### Passo 17: Deploy e Infraestrutura

```
Prompt para Claude Code:

"Configure deploy e infraestrutura completa do projeto.

1. **Banco de Dados (Supabase):**
   - Criar projeto no Supabase
   - Configurar PostgreSQL
   - Rodar migrations do Prisma
   - Configurar Row Level Security (RLS)
   - Setup de backup automático
   - Connection pooling (Prisma Data Proxy ou PgBouncer)

2. **Storage (Supabase Storage):**
   - Bucket para comprovantes
   - Políticas de acesso
   - Upload de arquivos via API
   - URLs públicas com expiração

3. **Variáveis de Ambiente:**
   - Criar .env.example
   - Documentar todas as variáveis necessárias:
     - DATABASE_URL
     - DIRECT_URL
     - NEXTAUTH_URL
     - NEXTAUTH_SECRET
     - RESEND_API_KEY (email)
     - SUPABASE_URL
     - SUPABASE_ANON_KEY
   - Configurar no Vercel

4. **Deploy Vercel:**
   - Conectar repositório GitHub
   - Configurar build:
     - Framework: Next.js
     - Build command: npm run build
     - Output: .next
   - Configurar variáveis de ambiente
   - Setup de domínio customizado (opcional)
   - Habilitar Analytics

5. **Cron Jobs (Vercel Cron):**
   - Configurar vercel.json:
     ```json
     {
       "crons": [
         {
           "path": "/api/cron/daily-alerts",
           "schedule": "0 8 * * *"
         },
         {
           "path": "/api/cron/monthly-summary",
           "schedule": "0 9 1 * *"
         }
       ]
     }
     ```
   - Proteger endpoints de cron (verificar header do Vercel)

6. **Monitoring e Logging:**
   - Sentry para tracking de erros:
     - Instalar @sentry/nextjs
     - Configurar sentry.client.config.ts
     - Configurar sentry.server.config.ts
   - Vercel Analytics
   - Logs estruturados (pino ou winston)

7. **CI/CD (GitHub Actions):**
   - Criar .github/workflows/ci.yml:
     - Rodar lint
     - Rodar type check
     - Rodar testes (se houver)
   - Deploy automático em push para main

8. **Segurança:**
   - Configurar CSP (Content Security Policy)
   - Rate limiting (upstash/redis)
   - CORS configurado
   - Sanitização de inputs
   - Helmet.js para headers de segurança
   - Secrets nunca no código

9. **Backup:**
   - Script de backup manual: /scripts/backup-db.ts
   - Backup automático diário (Supabase)
   - Versionamento de schema (Prisma migrations)

10. **Documentação:**
    - README.md completo:
      - Descrição do projeto
      - Como rodar localmente
      - Variáveis de ambiente
      - Deploy
      - Estrutura do projeto
    - CONTRIBUTING.md (se open source)
    - Documentação de APIs (Swagger/OpenAPI)

Arquivos a criar:
- vercel.json
- .env.example
- .github/workflows/ci.yml
- sentry.client.config.ts
- sentry.server.config.ts
- README.md
- /scripts/backup-db.ts"
```

---

## 🎨 Design System e Temas

### Cores e Identidade Visual

Manter consistência com o cockpit de investimentos:

```typescript
// tailwind.config.ts
const colors = {
  // Categorias
  casa: {
    light: '#3B82F6',   // blue-500
    dark: '#2563EB',    // blue-600
  },
  pet: {
    light: '#EC4899',   // pink-500
    dark: '#DB2777',    // pink-600
  },
  transporte: {
    light: '#8B5CF6',   // violet-500
    dark: '#7C3AED',    // violet-600
  },
  alimentacao: {
    light: '#10B981',   // green-500
    dark: '#059669',    // green-600
  },
  saude: {
    light: '#EF4444',   // red-500
    dark: '#DC2626',    // red-600
  },
  lazer: {
    light: '#F59E0B',   // amber-500
    dark: '#D97706',    // amber-600
  },
  // Status
  pago: '#10B981',      // green
  pendente: '#F59E0B',  // amber
  vencido: '#EF4444',   // red
  // Budget
  ok: '#10B981',
  atencao: '#F59E0B',
  excedido: '#EF4444',
}
```

---

## 📈 Funcionalidades Futuras (Pós-MVP)

### Fase Extra 1: Inteligência e Automação
- Categorização automática com ML
- Previsão de gastos futuros
- Detecção de anomalias
- Sugestões de economia baseadas em padrões

### Fase Extra 2: Integração com Bancos
- Open Banking (Pluggy/Belvo)
- Importação automática de extratos
- Conciliação automática
- Saldo em tempo real

### Fase Extra 3: Compartilhamento Familiar
- Múltiplos usuários na mesma conta
- Permissões e roles
- Divisão de gastos
- Chat/comentários em transações

### Fase Extra 4: Integração com Cockpit de Investimentos
- Dashboard unificado
- Patrimônio total (investimentos + disponível)
- Fluxo de caixa completo (receitas - despesas = investimentos)
- Análise de capacidade de investimento
- Transferências entre contas e investimentos

### Fase Extra 5: App Mobile Nativo
- React Native
- Sincronização offline
- Notificações push
- Câmera para foto de comprovantes
- Lançamento rápido por voz

---

## 🧪 Testing (Opcional)

Se desejar implementar testes:

```
Prompt para Claude Code:

"Configure ambiente de testes:

1. **Unit Tests:**
   - Vitest para testes de unidade
   - Testing Library para componentes React
   - Testar utils e helpers
   - Testar hooks customizados

2. **Integration Tests:**
   - Testar API routes
   - Testar fluxos completos
   - Mock do Prisma

3. **E2E Tests:**
   - Playwright ou Cypress
   - Testar jornadas críticas:
     - Login → Dashboard → Criar transação
     - Importar dados
     - Gerar relatório

Criar:
- vitest.config.ts
- /tests/unit/
- /tests/integration/
- /tests/e2e/"
```

---

## 📝 Prompts Consolidados para Início Rápido

### Prompt Completo para Iniciar (Fase 1 Completa):

```
Preciso criar um cockpit pessoal de gestão de contas mensais da minha casa, usando Next.js 14, TypeScript, Prisma e PostgreSQL.

Use como referência o projeto em:
/Users/bholanda/Desktop/cockpit-investimento

E a planilha Excel atual em:
/Users/bholanda/Desktop/cockpit-contas/Contas dos xuxus.xlsx

E os requisitos detalhados em:
/Users/bholanda/Desktop/cockpit-contas/receita/requisitos.md

OBJETIVO: Substituir a planilha Excel por uma aplicação web moderna.

STACK TECNOLÓGICO (mesma do cockpit-investimento):
- Next.js 14 (App Router)
- TypeScript
- Shadcn/ui + Tailwind CSS
- Prisma ORM + PostgreSQL
- Recharts para gráficos
- TanStack Query para data fetching
- NextAuth.js para autenticação
- Zod para validação

FUNCIONALIDADES PRINCIPAIS (MVP - Fase 1):
1. Autenticação (login/registro)
2. Dashboard com métricas principais:
   - Total gastos do mês
   - Budget restante
   - Distribuição por categoria (gráfico pizza)
   - Evolução mensal (gráfico barras)
3. CRUD de transações (despesas mensais)
4. Categorias personalizáveis
5. Contas recorrentes (despesas fixas)
6. Histórico completo
7. Importação da planilha Excel

ESTRUTURA DO BANCO (Prisma):
- User (usuários)
- Category (categorias de gastos: Casa, Pet, Transporte, Alimentação, etc)
- RecurringExpense (contas que se repetem mensalmente)
- Transaction (transações/gastos)
- Budget (orçamentos mensais)
- CreditCard (cartões de crédito)
- CreditCardInvoice (faturas)
- FinancialGoal (metas)
- Project (projetos especiais como "Obra")
- Alert (alertas e notificações)

LAYOUT:
- Sidebar com navegação (mesmo estilo do cockpit-investimento)
- Tema claro/escuro
- Totalmente responsivo

Por favor:
1. Crie a estrutura inicial do projeto (use o cockpit-investimento como template)
2. Configure o Prisma com o schema completo
3. Implemente autenticação com NextAuth.js
4. Crie o layout base (sidebar + header + main)
5. Implemente o dashboard principal com gráficos
6. Crie o CRUD de transações
7. Implemente gestão de categorias
8. Crie sistema de importação da planilha Excel

Vamos começar pela Fase 1: Setup do projeto e estrutura base.
```

---

## 🔄 Próximos Passos

1. **Revisar esta receita** com suas necessidades específicas
2. **Iniciar Fase 1** usando o prompt consolidado acima
3. **Iterar fase por fase** conforme o cronograma
4. **Testar com dados reais** importando a planilha atual
5. **Ajustar e refinar** baseado no uso

---

## ⏱️ Cronograma Estimado

| Fase | Duração | Entregas |
|------|---------|----------|
| 1. Fundação | 2 semanas | Projeto configurado, auth, banco |
| 2. Dashboard | 2 semanas | Interface principal, gráficos, CRUD |
| 3. Categorias e Recorrentes | 1 semana | Categorização, contas fixas |
| 4. Cartões e Budget | 1 semana | Gestão de cartões, orçamentos |
| 5. Análises | 1 semana | Relatórios e insights |
| 6. Importação | 1 semana | Import da planilha Excel |
| 7. Projetos e Alertas | 1 semana | Projetos especiais, notificações |
| 8. Deploy | 1 semana | Otimização, deploy, testes |

**Total: ~10 semanas** (2,5 meses) para MVP completo

---

## 💰 Custos Estimados

### Opção 1: Gratuita (Hobby)
- Vercel Hobby: R$ 0
- Supabase Free Tier: R$ 0
- **Total: R$ 0/mês**
- Limitações: 500MB storage, bandwidth limitado

### Opção 2: Profissional
- Vercel Pro: ~R$ 100/mês
- Supabase Pro: ~R$ 125/mês
- Resend (email): ~R$ 25/mês
- **Total: ~R$ 250/mês**
- Benefícios: sem limites, suporte, analytics

### Opção 3: Self-Hosted
- VPS (Hetzner/DigitalOcean): ~R$ 60/mês
- **Total: ~R$ 60/mês**
- Requer manutenção manual

**Recomendação:** Começar com Opção 1 (gratuito), migrar conforme necessidade.

---

## 📚 Recursos Úteis

**Documentação:**
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [Recharts](https://recharts.org)
- [TanStack Query](https://tanstack.com/query)

**Deploy:**
- [Vercel](https://vercel.com/docs)
- [Supabase](https://supabase.com/docs)

**Referência:**
- Cockpit de Investimentos: `/Users/bholanda/Desktop/cockpit-investimento`

---

**Criado para:** Projeto Cockpit de Contas Mensais
**Data:** 2026-01-04
**Versão:** 1.0
**Ferramenta:** Claude Code by Anthropic

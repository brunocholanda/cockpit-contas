# Modelo de Dados - Cockpit de Contas Mensais

## Visão Geral do Modelo

Este documento detalha a estrutura completa do banco de dados para o Cockpit de Contas Mensais, incluindo o schema Prisma completo, relacionamentos, índices e justificativas de design.

---

## Schema Prisma Completo

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================================================
// AUTENTICAÇÃO E USUÁRIOS
// ============================================================================

enum UserRole {
  ADMIN
  USER
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relações
  categories         Category[]
  recurringExpenses  RecurringExpense[]
  transactions       Transaction[]
  creditCards        CreditCard[]
  budgets            Budget[]
  financialGoals     FinancialGoal[]
  projects           Project[]
  alerts             Alert[]
  settings           UserSettings?
  passwordResetTokens PasswordResetToken[]

  @@map("users")
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@map("password_reset_tokens")
}

// ============================================================================
// CATEGORIAS
// ============================================================================

enum CategoryType {
  DESPESA
  RECEITA
}

model Category {
  id          String       @id @default(cuid())
  userId      String
  name        String
  type        CategoryType @default(DESPESA)
  icon        String       @default("Circle") // Nome do ícone Lucide
  color       String       @default("#6B7280") // Hex color
  description String?
  parentId    String?      // Para subcategorias
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // Relações
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent            Category?          @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children          Category[]         @relation("CategoryHierarchy")
  recurringExpenses RecurringExpense[]
  transactions      Transaction[]
  budgets           Budget[]
  creditCardItems   CreditCardItem[]
  projectExpenses   ProjectExpense[]

  @@index([userId])
  @@index([parentId])
  @@index([type])
  @@map("categories")
}

// ============================================================================
// CONTAS RECORRENTES
// ============================================================================

enum AmountType {
  FIXO
  VARIAVEL
}

enum PaymentMethod {
  DINHEIRO
  DEBITO
  CREDITO
  PIX
  BOLETO
  TRANSFERENCIA
  OUTRO
}

model RecurringExpense {
  id             String        @id @default(cuid())
  userId         String
  categoryId     String
  name           String
  description    String?
  amountType     AmountType
  defaultAmount  Float?        // Null se VARIAVEL
  dueDay         Int           // 1-31
  paymentMethod  PaymentMethod @default(BOLETO)
  isActive       Boolean       @default(true)
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  // Relações
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  category     Category      @relation(fields: [categoryId], references: [id])
  transactions Transaction[]

  @@index([userId])
  @@index([categoryId])
  @@index([isActive])
  @@map("recurring_expenses")
}

// ============================================================================
// TRANSAÇÕES
// ============================================================================

enum TransactionStatus {
  PAGO
  PENDENTE
  VENCIDO
  CANCELADO
}

model Transaction {
  id                  String            @id @default(cuid())
  userId              String
  categoryId          String
  recurringExpenseId  String?           // Null se não é recorrente
  description         String
  amount              Float
  transactionDate     DateTime
  dueDate             DateTime?
  paymentMethod       PaymentMethod
  status              TransactionStatus @default(PENDENTE)
  notes               String?
  attachmentUrl       String?           // URL do comprovante no Supabase Storage
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  // Relações
  user             User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  category         Category           @relation(fields: [categoryId], references: [id])
  recurringExpense RecurringExpense?  @relation(fields: [recurringExpenseId], references: [id])
  creditCardItem   CreditCardItem?
  projectExpenses  ProjectExpense[]

  @@index([userId])
  @@index([categoryId])
  @@index([transactionDate])
  @@index([status])
  @@index([recurringExpenseId])
  @@map("transactions")
}

// ============================================================================
// CARTÕES DE CRÉDITO
// ============================================================================

enum CardBrand {
  VISA
  MASTERCARD
  ELO
  AMEX
  HIPERCARD
  OUTRO
}

model CreditCard {
  id             String    @id @default(cuid())
  userId         String
  name           String    // Ex: "Nubank Pessoal"
  brand          CardBrand
  lastFourDigits String    // Últimos 4 dígitos
  creditLimit    Float
  closingDay     Int       // 1-31
  dueDay         Int       // 1-31
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relações
  user     User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  invoices CreditCardInvoice[]

  @@index([userId])
  @@index([isActive])
  @@map("credit_cards")
}

enum InvoiceStatus {
  ABERTA
  FECHADA
  PAGA
  VENCIDA
}

model CreditCardInvoice {
  id              String        @id @default(cuid())
  cardId          String
  referenceMonth  Int           // 1-12
  referenceYear   Int
  totalAmount     Float         @default(0)
  status          InvoiceStatus @default(ABERTA)
  closingDate     DateTime
  dueDate         DateTime
  paymentDate     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relações
  card  CreditCard       @relation(fields: [cardId], references: [id], onDelete: Cascade)
  items CreditCardItem[]

  @@unique([cardId, referenceMonth, referenceYear])
  @@index([cardId])
  @@index([status])
  @@index([dueDate])
  @@map("credit_card_invoices")
}

model CreditCardItem {
  id                 String   @id @default(cuid())
  invoiceId          String
  transactionId      String   @unique
  categoryId         String
  description        String
  amount             Float
  installmentNumber  Int      @default(1)  // Parcela atual
  totalInstallments  Int      @default(1)  // Total de parcelas
  purchaseDate       DateTime
  createdAt          DateTime @default(now())

  // Relações
  invoice     CreditCardInvoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  transaction Transaction       @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  category    Category          @relation(fields: [categoryId], references: [id])

  @@index([invoiceId])
  @@index([transactionId])
  @@index([categoryId])
  @@map("credit_card_items")
}

// ============================================================================
// BUDGET (ORÇAMENTO)
// ============================================================================

model Budget {
  id             String   @id @default(cuid())
  userId         String
  categoryId     String?  // Null = budget total
  month          Int      // 1-12
  year           Int
  plannedAmount  Float
  notes          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relações
  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id])

  @@unique([userId, categoryId, month, year])
  @@index([userId])
  @@index([categoryId])
  @@index([month, year])
  @@map("budgets")
}

// ============================================================================
// METAS FINANCEIRAS
// ============================================================================

enum GoalPriority {
  BAIXA
  MEDIA
  ALTA
}

enum GoalStatus {
  ATIVA
  CONCLUIDA
  CANCELADA
}

model FinancialGoal {
  id            String       @id @default(cuid())
  userId        String
  name          String
  description   String?
  targetAmount  Float
  currentAmount Float        @default(0)
  targetDate    DateTime
  category      String?      // Categoria associada (opcional)
  priority      GoalPriority @default(MEDIA)
  status        GoalStatus   @default(ATIVA)
  notes         String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  // Relações
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([targetDate])
  @@map("financial_goals")
}

// ============================================================================
// PROJETOS ESPECIAIS
// ============================================================================

enum ProjectStatus {
  PLANEJAMENTO
  EM_ANDAMENTO
  CONCLUIDO
  CANCELADO
}

model Project {
  id          String        @id @default(cuid())
  userId      String
  name        String
  description String?
  budget      Float
  startDate   DateTime?
  endDate     DateTime?
  status      ProjectStatus @default(PLANEJAMENTO)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relações
  user     User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  expenses ProjectExpense[]

  @@index([userId])
  @@index([status])
  @@map("projects")
}

model ProjectExpense {
  id            String   @id @default(cuid())
  projectId     String
  transactionId String
  categoryId    String
  description   String
  amount        Float
  expenseDate   DateTime
  createdAt     DateTime @default(now())

  // Relações
  project     Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  transaction Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  category    Category    @relation(fields: [categoryId], references: [id])

  @@index([projectId])
  @@index([transactionId])
  @@index([categoryId])
  @@map("project_expenses")
}

// ============================================================================
// ALERTAS E NOTIFICAÇÕES
// ============================================================================

enum AlertType {
  VENCIMENTO
  BUDGET
  ANOMALIA
  META
  CARTAO
  LEMBRETE
  SISTEMA
}

enum AlertSeverity {
  INFO
  WARNING
  CRITICAL
}

model Alert {
  id        String        @id @default(cuid())
  userId    String
  type      AlertType
  severity  AlertSeverity @default(INFO)
  title     String
  message   String
  relatedId String?       // ID da entidade relacionada (transaction, invoice, etc)
  isRead    Boolean       @default(false)
  sentAt    DateTime?
  createdAt DateTime      @default(now())

  // Relações
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isRead])
  @@index([type])
  @@index([severity])
  @@index([createdAt])
  @@map("alerts")
}

// ============================================================================
// CONFIGURAÇÕES DO USUÁRIO
// ============================================================================

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

model UserSettings {
  id                       String  @id @default(cuid())
  userId                   String  @unique
  notificationEmail        Boolean @default(true)
  notificationDaysBefore   Int     @default(7)    // Alertar vencimentos com X dias de antecedência
  budgetAlertPercentage    Int     @default(80)   // Alertar ao atingir X% do budget
  theme                    Theme   @default(LIGHT)
  currency                 String  @default("BRL")
  language                 String  @default("pt-BR")
  weekStartsOn             Int     @default(0)     // 0 = Domingo, 1 = Segunda
  dateFormat               String  @default("dd/MM/yyyy")
  timeFormat               String  @default("HH:mm")
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt

  // Relações
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}
```

---

## Relacionamentos do Modelo

### Diagrama de Relacionamentos

```
User (1) ──────── (*) Category
  │                      │
  │                      │
  ├─── (*) RecurringExpense ──┐
  │                      │    │
  │                      │    │
  ├─── (*) Transaction ──┴────┘
  │         │
  │         ├─── (1) CreditCardItem
  │         └─── (*) ProjectExpense
  │
  ├─── (*) CreditCard
  │         │
  │         └─── (*) CreditCardInvoice
  │                   │
  │                   └─── (*) CreditCardItem
  │
  ├─── (*) Budget
  │
  ├─── (*) FinancialGoal
  │
  ├─── (*) Project
  │         │
  │         └─── (*) ProjectExpense
  │
  ├─── (*) Alert
  │
  └─── (1) UserSettings
```

---

## Descrição das Tabelas

### 1. User (Usuários)
**Propósito:** Armazenar informações dos usuários do sistema.

**Campos principais:**
- `email`: Email único para login
- `password`: Hash da senha (bcrypt)
- `role`: ADMIN ou USER (para gestão futura)
- `isActive`: Permite desativar usuário sem deletar

**Relações:**
- 1:N com todas as outras entidades principais
- 1:1 com UserSettings

---

### 2. Category (Categorias)
**Propósito:** Organizar gastos em categorias personalizáveis.

**Campos principais:**
- `type`: DESPESA ou RECEITA
- `icon`: Nome do ícone Lucide (ex: "Home", "Car", "Utensils")
- `color`: Cor em hex para identificação visual
- `parentId`: Permite criar subcategorias (hierarquia)

**Exemplos de categorias padrão:**
```typescript
const defaultCategories = [
  // Casa
  { name: "IPTU", icon: "Home", color: "#3B82F6", type: "DESPESA" },
  { name: "Condomínio", icon: "Building", color: "#3B82F6", type: "DESPESA" },
  { name: "Água", icon: "Droplets", color: "#06B6D4", type: "DESPESA" },
  { name: "Gás", icon: "Flame", color: "#F97316", type: "DESPESA" },
  { name: "Luz", icon: "Zap", color: "#EAB308", type: "DESPESA" },

  // Pet
  { name: "Day Care", icon: "Dog", color: "#EC4899", type: "DESPESA" },
  { name: "Plano Saúde Pet", icon: "Heart", color: "#EF4444", type: "DESPESA" },

  // Transporte
  { name: "Combustível", icon: "Fuel", color: "#EF4444", type: "DESPESA" },
  { name: "Uber", icon: "Car", color: "#000000", type: "DESPESA" },

  // Alimentação
  { name: "Mercado", icon: "ShoppingCart", color: "#10B981", type: "DESPESA" },
  { name: "Restaurante", icon: "UtensilsCrossed", color: "#F97316", type: "DESPESA" },
]
```

---

### 3. RecurringExpense (Contas Recorrentes)
**Propósito:** Modelar despesas que se repetem mensalmente.

**Campos principais:**
- `amountType`: FIXO (valor sempre igual) ou VARIAVEL (muda todo mês)
- `defaultAmount`: Valor padrão (null se variável)
- `dueDay`: Dia do vencimento (1-31)
- `isActive`: Permite pausar sem deletar

**Casos de uso:**
- Contas fixas: Condomínio, Internet, Streaming
- Contas variáveis: Água, Luz, Gás (valor muda, mas conta é recorrente)

**Fluxo de uso:**
1. Usuário cadastra conta recorrente (ex: "Condomínio", R$ 150, dia 10)
2. No início do mês, sistema sugere lançar contas recorrentes
3. Usuário confirma valores e sistema cria Transactions

---

### 4. Transaction (Transações)
**Propósito:** Registrar cada despesa/receita individualmente.

**Campos principais:**
- `description`: O que foi comprado/pago
- `amount`: Valor
- `transactionDate`: Quando aconteceu
- `dueDate`: Quando vence (null se já pago)
- `status`: PAGO, PENDENTE, VENCIDO, CANCELADO
- `recurringExpenseId`: Link com conta recorrente (opcional)
- `attachmentUrl`: Comprovante em PDF/imagem

**Regras de negócio:**
- Status VENCIDO é calculado automaticamente (dueDate < hoje e status = PENDENTE)
- Ao marcar como PAGO, preencher transactionDate
- Permite vínculo com cartão de crédito via CreditCardItem

---

### 5. CreditCard e CreditCardInvoice (Cartões de Crédito)
**Propósito:** Gerenciar cartões e suas faturas mensais.

**Fluxo:**
1. Usuário cadastra cartão (nome, bandeira, limite, dias)
2. Ao criar Transaction com paymentMethod=CREDITO:
   - Identifica ou cria fatura do mês
   - Cria CreditCardItem vinculado
   - Se parcelado, cria N transactions (uma por mês)
3. Fatura tem status:
   - ABERTA: até dia de fechamento
   - FECHADA: após fechamento, antes de pagar
   - PAGA: após marcar como paga
   - VENCIDA: se passou do vencimento sem pagar

**Cálculos:**
- Limite disponível = creditLimit - sum(items de faturas ABERTA e FECHADA)
- Total da fatura = sum(items.amount)

---

### 6. Budget (Orçamento)
**Propósito:** Definir metas de gastos por categoria.

**Campos principais:**
- `categoryId`: Null = budget total do mês
- `month`, `year`: Mês de referência
- `plannedAmount`: Quanto planeja gastar

**Cálculos em runtime:**
- Gasto real = sum(transactions da categoria no mês)
- Saldo = plannedAmount - gasto real
- Percentual = (gasto real / plannedAmount) * 100

**Alertas:**
- Amarelo: > 80% do budget
- Vermelho: > 100% do budget

---

### 7. FinancialGoal (Metas Financeiras)
**Propósito:** Acompanhar objetivos de longo prazo.

**Exemplos:**
- "Viagem para Europa" - R$ 15.000 até dez/2026
- "Fundo de Emergência" - R$ 30.000 até dez/2025

**Cálculos:**
- Falta = targetAmount - currentAmount
- Meses até target = monthsBetween(hoje, targetDate)
- Necessário por mês = falta / meses até target
- Progresso = (currentAmount / targetAmount) * 100

---

### 8. Project (Projetos Especiais)
**Propósito:** Agrupar gastos de projetos específicos (Obra, Casamento, etc).

**Relação com Transaction:**
- Transaction pode pertencer a uma Category E a um Project
- Permite análise dupla:
  - "Quanto gastei em Material de Construção?" (category)
  - "Quanto gastei no Projeto Obra?" (project)

---

### 9. Alert (Alertas)
**Propósito:** Notificar usuário sobre eventos importantes.

**Tipos de alertas:**
- VENCIMENTO: "Conta Condomínio vence em 3 dias"
- BUDGET: "Categoria Alimentação atingiu 90% do budget"
- ANOMALIA: "Gasto de R$ 500 em Mercado está muito acima da média"
- META: "Faltam 60 dias para a meta Viagem e você está 30% abaixo"
- CARTAO: "Limite do cartão em 85%"
- LEMBRETE: "Lançar contas recorrentes do mês"

**Geração:**
- Cron job diário analisa e cria alertas
- Triggers em eventos (ex: ao criar transaction > 80% budget)

---

### 10. UserSettings (Configurações)
**Propósito:** Preferências personalizadas do usuário.

**Configurações:**
- Tema (claro/escuro)
- Notificações (ativar/desativar)
- Antecedência de alertas
- Formato de data/hora
- Moeda
- Idioma

---

## Índices de Performance

### Índices Críticos

```sql
-- Queries frequentes por usuário
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month, year);

-- Queries de alertas
CREATE INDEX idx_alerts_user_unread ON alerts(user_id, is_read, created_at DESC);

-- Queries de fatura de cartão
CREATE INDEX idx_invoices_card_status ON credit_card_invoices(card_id, status);
CREATE INDEX idx_card_items_invoice ON credit_card_items(invoice_id);

-- Queries de análises
CREATE INDEX idx_transactions_category_date ON transactions(category_id, transaction_date);
CREATE INDEX idx_transactions_status ON transactions(status);
```

---

## Migrations Importantes

### Migration Inicial

```sql
-- Criar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar função de atualização de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (repetir para todas as tabelas com updated_at)
```

---

## Seed de Dados Iniciais

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar usuário admin padrão
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'ADMIN',
    },
  });

  // Criar categorias padrão
  const categories = [
    // Casa
    { name: 'IPTU', icon: 'Home', color: '#3B82F6', type: 'DESPESA', userId: admin.id },
    { name: 'Condomínio', icon: 'Building', color: '#3B82F6', type: 'DESPESA', userId: admin.id },
    { name: 'Água', icon: 'Droplets', color: '#06B6D4', type: 'DESPESA', userId: admin.id },
    { name: 'Gás', icon: 'Flame', color: '#F97316', type: 'DESPESA', userId: admin.id },
    { name: 'Luz', icon: 'Zap', color: '#EAB308', type: 'DESPESA', userId: admin.id },
    { name: 'Internet', icon: 'Wifi', color: '#8B5CF6', type: 'DESPESA', userId: admin.id },
    { name: 'Limpeza', icon: 'Sparkles', color: '#14B8A6', type: 'DESPESA', userId: admin.id },

    // Pet
    { name: 'Day Care Farofa', icon: 'Dog', color: '#EC4899', type: 'DESPESA', userId: admin.id },
    { name: 'Plano Saúde Pet', icon: 'Heart', color: '#EF4444', type: 'DESPESA', userId: admin.id },

    // Transporte
    { name: 'Combustível', icon: 'Fuel', color: '#EF4444', type: 'DESPESA', userId: admin.id },
    { name: 'Estacionamento', icon: 'ParkingCircle', color: '#6B7280', type: 'DESPESA', userId: admin.id },
    { name: 'Uber/99', icon: 'Car', color: '#000000', type: 'DESPESA', userId: admin.id },

    // Alimentação
    { name: 'Mercado', icon: 'ShoppingCart', color: '#10B981', type: 'DESPESA', userId: admin.id },
    { name: 'Restaurante', icon: 'UtensilsCrossed', color: '#F97316', type: 'DESPESA', userId: admin.id },
    { name: 'Delivery', icon: 'Bike', color: '#EF4444', type: 'DESPESA', userId: admin.id },

    // Saúde
    { name: 'Plano de Saúde', icon: 'Heart', color: '#EF4444', type: 'DESPESA', userId: admin.id },
    { name: 'Farmácia', icon: 'Pill', color: '#10B981', type: 'DESPESA', userId: admin.id },

    // Lazer
    { name: 'Streaming', icon: 'Tv', color: '#8B5CF6', type: 'DESPESA', userId: admin.id },
    { name: 'Cinema', icon: 'Film', color: '#EF4444', type: 'DESPESA', userId: admin.id },

    // Outras
    { name: 'Presentes', icon: 'Gift', color: '#EC4899', type: 'DESPESA', userId: admin.id },
    { name: 'Eventuais', icon: 'MoreHorizontal', color: '#6B7280', type: 'DESPESA', userId: admin.id },
  ];

  for (const category of categories) {
    await prisma.category.create({ data: category });
  }

  // Criar configurações padrão
  await prisma.userSettings.create({
    data: {
      userId: admin.id,
      notificationEmail: true,
      notificationDaysBefore: 7,
      budgetAlertPercentage: 80,
      theme: 'LIGHT',
    },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Validações e Regras de Negócio

### Validações no Nível de Aplicação (Zod)

```typescript
// lib/validations/transaction.ts

import { z } from 'zod';

export const createTransactionSchema = z.object({
  categoryId: z.string().cuid(),
  description: z.string().min(1, 'Descrição é obrigatória').max(200),
  amount: z.number().positive('Valor deve ser positivo'),
  transactionDate: z.date(),
  dueDate: z.date().optional(),
  paymentMethod: z.enum(['DINHEIRO', 'DEBITO', 'CREDITO', 'PIX', 'BOLETO', 'TRANSFERENCIA', 'OUTRO']),
  status: z.enum(['PAGO', 'PENDENTE', 'VENCIDO', 'CANCELADO']).default('PENDENTE'),
  notes: z.string().max(500).optional(),
});

export const createBudgetSchema = z.object({
  categoryId: z.string().cuid().optional(),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
  plannedAmount: z.number().positive(),
});
```

---

## Queries Comuns

### 1. Dashboard - Métricas do Mês

```typescript
// Gasto total do mês
const totalGastos = await prisma.transaction.aggregate({
  where: {
    userId,
    transactionDate: {
      gte: startOfMonth(new Date()),
      lte: endOfMonth(new Date()),
    },
    category: {
      type: 'DESPESA',
    },
  },
  _sum: {
    amount: true,
  },
});

// Distribuição por categoria
const porCategoria = await prisma.transaction.groupBy({
  by: ['categoryId'],
  where: {
    userId,
    transactionDate: {
      gte: startOfMonth(new Date()),
      lte: endOfMonth(new Date()),
    },
  },
  _sum: {
    amount: true,
  },
});
```

### 2. Budget vs Realizado

```typescript
const budgetComparison = await prisma.budget.findMany({
  where: {
    userId,
    month: currentMonth,
    year: currentYear,
  },
  include: {
    category: true,
  },
});

for (const budget of budgetComparison) {
  const realizado = await prisma.transaction.aggregate({
    where: {
      userId,
      categoryId: budget.categoryId,
      transactionDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });

  budget.realizado = realizado._sum.amount || 0;
  budget.saldo = budget.plannedAmount - budget.realizado;
  budget.percentual = (budget.realizado / budget.plannedAmount) * 100;
}
```

### 3. Fatura do Cartão

```typescript
const fatura = await prisma.creditCardInvoice.findUnique({
  where: {
    cardId_referenceMonth_referenceYear: {
      cardId,
      referenceMonth: month,
      referenceYear: year,
    },
  },
  include: {
    items: {
      include: {
        category: true,
        transaction: true,
      },
    },
  },
});
```

---

## Backup e Manutenção

### Script de Backup

```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"
BACKUP_FILE="$BACKUP_DIR/cockpit_contas_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump $DATABASE_URL > $BACKUP_FILE

gzip $BACKUP_FILE

echo "Backup criado: $BACKUP_FILE.gz"

# Manter apenas últimos 30 backups
ls -t $BACKUP_DIR/*.gz | tail -n +31 | xargs rm -f
```

---

**Documento criado para:** Cockpit de Contas Mensais
**Data:** 2026-01-04
**Versão:** 1.0

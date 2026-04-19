# Arquitetura — Cockpit Contas

> Documento gerado em: abril/2026  
> Aplicação: gestão financeira pessoal (despesas, cartões, orçamentos, análises)

---

## 1. Stack Tecnológico

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.18 |
| Linguagem | TypeScript | 5.6.3 |
| UI Base | React | 18.3.1 |
| Componentes | Radix UI + Tailwind CSS | — |
| Gráficos | Recharts | 2.15.4 |
| ORM | Prisma | 5.22.0 |
| Banco | PostgreSQL | — |
| Autenticação | NextAuth.js (JWT) | 4.24.10 |
| Validação | Zod | 3.23.8 |
| Datas | date-fns | 4.1.0 |
| Icons | Lucide React | 0.454.0 |

---

## 2. Visão Geral da Arquitetura

```mermaid
graph TB
    subgraph Client["Navegador (Client)"]
        B[Páginas React / App Router]
        C[Componentes UI<br/>Radix UI + Tailwind]
        D[Recharts<br/>Gráficos]
    end

    subgraph NextJS["Next.js Server (Node.js)"]
        E[Route Handlers<br/>app/api/**]
        F[NextAuth.js<br/>JWT Strategy]
        G[Middleware<br/>Proteção de rotas]
    end

    subgraph ORM["Camada de Dados"]
        H[Prisma Client<br/>Singleton]
    end

    subgraph DB["Banco de Dados"]
        I[(PostgreSQL<br/>Neon / Supabase)]
    end

    B -->|fetch/axios| E
    B -->|session| F
    G -->|intercepta /dashboard| F
    E -->|queries| H
    F -->|findUnique user| H
    H -->|SQL| I
```

---

## 3. Arquitetura de Páginas e Rotas

```mermaid
graph LR
    Root["/"] -->|redirect| Login

    subgraph Auth["Autenticação (público)"]
        Login["/auth/login"]
        Register["/auth/register"]
    end

    subgraph Dashboard["Dashboard (protegido — JWT)"]
        D["/dashboard<br/>KPIs + Gráficos"]
        T["/dashboard/transacoes<br/>CRUD Transações"]
        K["/dashboard/cartoes<br/>Cartões de Crédito"]
        C["/dashboard/categorias<br/>Hierarquia de Categorias"]
        A["/dashboard/analise<br/>Tendências + Comparação"]
        ADM["/dashboard/admin/clear-transactions<br/>Utilitário admin"]
    end

    Login -->|sessão válida| D
    D --> T
    D --> K
    D --> C
    D --> A
    D --> ADM
```

---

## 4. Mapa das APIs

```mermaid
graph TD
    subgraph Auth_API["Auth"]
        A1["POST /api/auth/register"]
        A2["ANY  /api/auth/[...nextauth]"]
    end

    subgraph Transactions_API["Transações"]
        T1["GET  /api/transactions"]
        T2["POST /api/transactions"]
        T3["GET/PUT/DELETE /api/transactions/[id]"]
        T4["POST /api/transactions/update-status"]
        T5["DELETE /api/transactions/clear"]
    end

    subgraph Categories_API["Categorias"]
        C1["GET/POST /api/categories"]
        C2["GET/PUT/DELETE /api/categories/[id]"]
    end

    subgraph Cards_API["Cartões"]
        K1["GET/POST /api/credit-cards"]
        K2["GET/PUT/DELETE /api/credit-cards/[id]"]
        K3["GET /api/credit-cards/[id]/invoices"]
    end

    subgraph Dashboard_API["Dashboard Analytics"]
        D1["GET /api/dashboard/stats"]
        D2["GET /api/dashboard/monthly-trend"]
        D3["GET /api/dashboard/expenses-by-category"]
        D4["GET /api/dashboard/category-budgets"]
        D5["GET /api/dashboard/alerts"]
        D6["GET /api/dashboard/monthly-report"]
    end

    subgraph Analise_API["Análise"]
        AN1["GET /api/analise/comparacao"]
        AN2["GET /api/analise/tendencias?meses=12"]
        AN3["GET /api/analise/categorias?meses=12"]
    end
```

---

## 5. Modelo de Dados (ER)

```mermaid
erDiagram
    User {
        string id PK
        string email
        string password
        string name
        UserRole role
        float monthlyIncome
    }

    Category {
        string id PK
        string userId FK
        string parentId FK
        string name
        CategoryType type
        string icon
        string color
    }

    Transaction {
        string id PK
        string userId FK
        string categoryId FK
        string creditCardId FK
        string parentTransactionId FK
        TransactionType type
        string description
        float amount
        datetime transactionDate
        PaymentMethod paymentMethod
        TransactionStatus status
        int installmentNumber
        int totalInstallments
    }

    CreditCard {
        string id PK
        string userId FK
        string name
        CardBrand brand
        string lastFourDigits
        float creditLimit
        int closingDay
        int dueDay
    }

    CreditCardInvoice {
        string id PK
        string cardId FK
        int referenceMonth
        int referenceYear
        float totalAmount
        InvoiceStatus status
        datetime dueDate
    }

    CreditCardItem {
        string id PK
        string invoiceId FK
        string transactionId FK
        string categoryId FK
        float amount
    }

    Budget {
        string id PK
        string userId FK
        string categoryId FK
        int month
        int year
        float plannedAmount
    }

    FinancialGoal {
        string id PK
        string userId FK
        string name
        float targetAmount
        float currentAmount
        datetime targetDate
        GoalStatus status
    }

    Project {
        string id PK
        string userId FK
        string name
        float budget
        ProjectStatus status
    }

    ProjectExpense {
        string id PK
        string projectId FK
        string transactionId FK
        string categoryId FK
        float amount
    }

    Alert {
        string id PK
        string userId FK
        AlertType type
        AlertSeverity severity
        boolean isRead
    }

    UserSettings {
        string id PK
        string userId FK
        Theme theme
        string currency
        int budgetAlertPercentage
    }

    User ||--o{ Category : "possui"
    User ||--o{ Transaction : "registra"
    User ||--o{ CreditCard : "possui"
    User ||--o{ Budget : "define"
    User ||--o{ FinancialGoal : "cria"
    User ||--o{ Project : "gerencia"
    User ||--o| UserSettings : "configura"
    User ||--o{ Alert : "recebe"

    Category ||--o{ Category : "subcategoria"
    Category ||--o{ Transaction : "classifica"
    Category ||--o{ Budget : "orçado em"

    Transaction }o--|| CreditCard : "pago com"
    Transaction ||--o{ Transaction : "parcelas"
    Transaction ||--o| CreditCardItem : "item de fatura"
    Transaction ||--o{ ProjectExpense : "vinculada a"

    CreditCard ||--o{ CreditCardInvoice : "fatura"
    CreditCardInvoice ||--o{ CreditCardItem : "contém"

    Project ||--o{ ProjectExpense : "tem despesas"
```

---

## 6. Fluxo de Autenticação

```mermaid
sequenceDiagram
    actor U as Usuário
    participant B as Browser
    participant NA as NextAuth
    participant DB as PostgreSQL

    U->>B: Acessa /dashboard
    B->>NA: Middleware verifica sessão JWT
    NA-->>B: Sem sessão → redirect /auth/login

    U->>B: Preenche email + senha
    B->>NA: POST /api/auth/callback/credentials
    NA->>DB: findUnique(email)
    DB-->>NA: User row
    NA->>NA: bcrypt.compare(senha, hash)
    alt Credenciais válidas
        NA-->>B: JWT token (id, email, role)
        B->>B: Cookie de sessão
        B-->>U: Redirect /dashboard
    else Inválidas
        NA-->>B: 401 Unauthorized
        B-->>U: Mensagem de erro
    end

    Note over B,NA: Cada request ao /api/** valida o JWT<br/>via getServerSession(authOptions)
```

---

## 7. Fluxo de uma Requisição ao Dashboard

```mermaid
sequenceDiagram
    participant C as DashboardContent
    participant API as Route Handler
    participant P as Prisma
    participant DB as PostgreSQL

    C->>API: GET /api/dashboard/stats
    API->>API: getServerSession() → valida JWT
    API->>P: prisma.user.findUnique(email)
    P->>DB: SELECT * FROM users WHERE email=?
    DB-->>P: User row
    P-->>API: user.id

    par Queries paralelas
        API->>P: transaction.aggregate (mês atual)
        API->>P: transaction.aggregate (mês anterior)
        API->>P: transaction.count (pendentes)
        API->>P: budget.findFirst (orçamento total)
    end

    P-->>API: resultados agregados
    API-->>C: JSON { monthlyExpenses, momVariation, budget, ... }
    C->>C: Renderiza KPI cards + gráficos
```

---

## 8. Estrutura de Componentes

```mermaid
graph TD
    Layout["app/dashboard/layout.tsx<br/>(Sidebar + Nav)"]

    Layout --> DP["dashboard/page.tsx"]
    Layout --> TP["transacoes/page.tsx"]
    Layout --> KP["cartoes/page.tsx"]
    Layout --> CP["categorias/page.tsx"]
    Layout --> AP["analise/page.tsx"]

    DP --> DC["DashboardContent"]
    DC --> MRD["MonthlyReportDialog"]
    DC --> Charts["Recharts<br/>(PieChart, BarChart)"]

    TP --> TD["TransactionDialog"]
    TP --> DTD["DeleteTransactionDialog"]

    KP --> CCD["CreditCardDialog"]
    KP --> CCI["CreditCardItem"]

    CP --> CatD["CategoryDialog"]

    AP --> CA["CategoriaAnalysis"]
    AP --> TC["TendenciasChart"]
    AP --> PC["PeriodoComparacao"]
    AP --> SM["SubcategoriaModal"]

    subgraph UI["components/ui (Radix UI)"]
        Btn[Button]
        Dlg[Dialog]
        Sel[Select]
        Tbl[Table]
        Bdg[Badge]
        Tst[Toast]
    end
```

---

## 9. Recomendações de Melhoria

### 9.1 Performance

| # | Problema atual | Recomendação |
|---|---|---|
| P1 | Dashboard faz 6+ chamadas independentes ao carregar | Criar um endpoint `GET /api/dashboard/summary` que retorna tudo em uma query, ou usar `Promise.all` no cliente |
| P2 | `stats/route.ts` executa queries em série dentro de loops (categorias críticas) | Reescrever com `Promise.all` para paralelizar |
| P3 | Sem cache de nenhum tipo — toda navegação re-executa todas as queries | Adicionar `revalidate` do Next.js ou React Query com `staleTime` |
| P4 | Conexões PostgreSQL: sem pool configurado explicitamente | Configurar `connection_limit` no `DATABASE_URL` e usar PgBouncer (suportado pelo Neon/Supabase nativamente) |

### 9.2 Segurança

| # | Problema atual | Recomendação |
|---|---|---|
| S1 | Sem rate limiting nas APIs | Adicionar `@upstash/ratelimit` ou middleware de throttle no Next.js |
| S2 | Sem validação de entrada (Zod) nas rotas de API | Cada `route.ts` deve validar o body com `z.parse()` antes de tocar no banco |
| S3 | `DIRECT_URL` exposta se o `.env` vazar | Usar apenas para migrations; rever se está no deploy de produção |
| S4 | Sem CSRF protection explícita além do NextAuth | NextAuth já protege o fluxo de login; verificar se rotas de mutação (POST fora do NextAuth) precisam de token adicional |
| S5 | Página `/dashboard/admin/clear-transactions` sem controle de role | Checar `session.user.role === 'ADMIN'` antes de renderizar/executar |

### 9.3 Qualidade de Código

| # | Problema atual | Recomendação |
|---|---|---|
| Q1 | Lógica de negócio misturada nos `route.ts` | Extrair para `lib/services/` (ex: `transaction.service.ts`, `dashboard.service.ts`) |
| Q2 | Sem testes automatizados | Adicionar Vitest para unit tests dos services + Playwright para E2E das páginas críticas |
| Q3 | Ausência de validação Zod nas APIs | Criar schemas reutilizáveis em `lib/schemas/` |
| Q4 | `any` espalhado nos tipos do dashboard | Tipar corretamente usando interfaces explícitas |
| Q5 | Scripts em `scripts/` usam `tsx` avulso — sem padronização | Criar CLI interno com `commander` ou documentar como usar cada script |

### 9.4 Funcionalidades Ausentes (schema prevê, código não implementa)

| Entidade no Schema | Status na UI |
|---|---|
| `FinancialGoal` (Metas) | Sem página/CRUD implementado |
| `Project` / `ProjectExpense` | Sem página/CRUD implementado |
| `Alert` (persistido no banco) | Alertas são calculados on-the-fly, não salvos |
| `UserSettings` | Sem página de configurações |
| `attachmentUrl` na Transaction | Campo existe, upload não implementado |
| `PasswordResetToken` | Fluxo de "esqueci a senha" não implementado |

### 9.5 Arquitetura Futura (se crescer)

```mermaid
graph LR
    subgraph Hoje["Hoje (Monolito Next.js)"]
        N[Next.js fullstack]
    end

    subgraph Futuro["Futuro (se necessário)"]
        FE[Next.js<br/>apenas frontend]
        BE[API separada<br/>Node/Fastify]
        Q[Bull/BullMQ<br/>Jobs assíncronos]
        NOTIF[Serviço de notificações<br/>email/push]
    end

    Hoje -->|"separar se >1 usuário ativo"| FE
    FE --> BE
    BE --> Q
    Q --> NOTIF
```

> **Recomendação:** Para uso pessoal/familiar, o monolito Next.js é a arquitetura certa. Só considerar separação se houver múltiplos usuários ativos ou necessidade de jobs scheduled (lembretes, alertas periódicos).

---

## 10. Opções de Hospedagem

### 10.1 Comparativo

| Plataforma | Custo | Banco | Adequação | Observações |
|---|---|---|---|---|
| **Vercel** (recomendado) | Free / $20 mês Pro | Neon PostgreSQL (free tier incluso) | ⭐⭐⭐⭐⭐ | Deploy automático do GitHub, CDN global, zero config com Next.js |
| **Railway** | ~$5/mês | PostgreSQL incluso | ⭐⭐⭐⭐ | Mais simples que AWS, banco junto na mesma plataforma |
| **Render** | Free (slow start) / $7+ | PostgreSQL add-on | ⭐⭐⭐ | Cold start no plano free (30s de delay na primeira req) |
| **Fly.io** | ~$3/mês | Não incluso | ⭐⭐⭐ | Mais controle, mais configuração |
| **VPS (Hetzner/DigitalOcean)** | €4–$6/mês | Self-managed | ⭐⭐ | Mais barato a longo prazo, mas exige manutenção de infra |

---

### 10.2 Deploy Recomendado: Vercel + Neon

```mermaid
graph LR
    GH[GitHub<br/>repositório]
    GH -->|push main| VCL[Vercel<br/>build + deploy]
    VCL -->|serverless functions| API[Next.js API Routes]
    API -->|DATABASE_URL pooled| PGB[PgBouncer<br/>connection pooler]
    API -->|DIRECT_URL| NEON[(Neon PostgreSQL<br/>serverless)]
    PGB --> NEON

    DNS[Domínio próprio<br/>ex: contas.seudominio.com] --> VCL
```

**Por quê Vercel + Neon:**
- Vercel é feito pela mesma equipe do Next.js — integração nativa, zero configuração
- Neon é PostgreSQL serverless com branching de banco (útil para testar migrations)
- Ambos têm free tier generoso para uso pessoal
- `DATABASE_URL` = connection via PgBouncer (pooled, para as APIs)
- `DIRECT_URL` = conexão direta (apenas para `prisma migrate`)

---

### 10.3 Checklist de Deploy

```markdown
Pré-deploy:
- [ ] Definir variáveis de ambiente no painel Vercel:
      DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- [ ] Gerar NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Rodar migrations no banco de produção: `prisma migrate deploy`
- [ ] Verificar que .env está no .gitignore (nunca subir para o GitHub)

Deploy:
- [ ] Conectar repositório GitHub ao Vercel
- [ ] Definir branch de produção: main
- [ ] Vercel detecta automaticamente que é Next.js e configura o build

Pós-deploy:
- [ ] Testar login em produção
- [ ] Verificar que as queries do dashboard retornam dados
- [ ] Configurar domínio customizado (opcional)
- [ ] Ativar proteção de preview deployments (Vercel Pro)
```

---

### 10.4 Variáveis de Ambiente Necessárias

```bash
# Banco de dados (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="[gerar com: openssl rand -base64 32]"
NEXTAUTH_URL="https://seu-app.vercel.app"  # URL de produção
```

---

## 11. Resumo dos Pontos Críticos

```mermaid
graph TD
    subgraph Crítico["🔴 Crítico (fazer antes de hospedar)"]
        C1[Validação Zod nas APIs<br/>— sem validação, qualquer payload é aceito]
        C2[Rate limiting no login<br/>— endpoint aberto a brute force]
        C3[Variáveis de ambiente seguras<br/>— nunca subir .env no git]
    end

    subgraph Importante["🟡 Importante (próximos sprints)"]
        I1[Promise.all nas queries do dashboard<br/>— reduz latência de 15s para ~4s]
        I2[Cache com React Query ou Next.js revalidate<br/>— evita re-fetch a cada navegação]
        I3[Implementar páginas de Metas e Projetos<br/>— schema está pronto, UI não]
    end

    subgraph Melhoria["🟢 Melhoria (quando tiver tempo)"]
        M1[Separar lógica de negócio em services<br/>— manutenibilidade]
        M2[Testes com Vitest + Playwright]
        M3[Página de Configurações do usuário]
        M4[Fluxo de recuperação de senha]
    end
```

# Receita Completa - Cockpit de Gestão de Contas Mensais

Bem-vindo à receita completa para criação do seu Cockpit de Gestão de Contas Mensais! Este conjunto de documentos contém tudo que você precisa para construir uma aplicação web moderna que substituirá sua planilha Excel atual.

---

## 📁 Documentos da Receita

### 1. [requisitos.md](./requisitos.md)
**O que é:** Documento de requisitos funcionais e não funcionais completo.

**Conteúdo:**
- Análise da planilha Excel atual
- Requisitos funcionais detalhados (Dashboard, Transações, Categorias, etc)
- Requisitos não funcionais (Segurança, Performance, Usabilidade)
- Melhorias em relação à planilha
- Casos de uso principais
- Priorização (MVP e fases futuras)

**Quando usar:** Leia primeiro para entender o escopo completo do projeto.

---

### 2. [receita-criacao.md](./receita-criacao.md)
**O que é:** Guia passo a passo completo com prompts para Claude Code.

**Conteúdo:**
- Arquitetura técnica recomendada
- Stack tecnológico (Next.js, Prisma, etc)
- 8 Fases de implementação detalhadas
- Prompts prontos para cada fase
- Cronograma estimado (10 semanas)
- Estimativas de custo
- Configuração de deploy

**Quando usar:** Use como guia durante toda a construção do projeto. Cada fase tem prompts específicos para Claude Code.

---

### 3. [modelo-dados.md](./modelo-dados.md)
**O que é:** Estrutura completa do banco de dados.

**Conteúdo:**
- Schema Prisma completo
- Diagrama de relacionamentos
- Descrição detalhada de cada tabela
- Índices de performance
- Migrations importantes
- Seed de dados iniciais
- Queries comuns

**Quando usar:** Referência técnica para entender a estrutura de dados e implementar o banco.

---

## 🚀 Como Começar

### Passo 1: Ler os Requisitos
```bash
Abra: requisitos.md
```
Entenda o que será construído, as funcionalidades principais e o escopo do projeto.

---

### Passo 2: Revisar a Receita de Criação
```bash
Abra: receita-criacao.md
```
Veja o plano de implementação, tecnologias e cronograma.

---

### Passo 3: Iniciar com Claude Code

Use o **Prompt Consolidado** da seção "Prompts Consolidados para Início Rápido" em `receita-criacao.md`:

```
Preciso criar um cockpit pessoal de gestão de contas mensais da minha casa, usando Next.js 14, TypeScript, Prisma e PostgreSQL.

Use como referência o projeto em:
/Users/bholanda/Desktop/cockpit-investimento

E a planilha Excel atual em:
/Users/bholanda/Desktop/cockpit-contas/Contas dos xuxus.xlsx

E os requisitos detalhados em:
/Users/bholanda/Desktop/cockpit-contas/receita/requisitos.md

[... resto do prompt ...]
```

---

## 📊 Resumo do Projeto

### O Que Será Construído

Um cockpit web moderno para gerenciar contas mensais da casa com:

**Dashboard Principal:**
- Visão geral de gastos do mês
- Gráficos interativos (pizza, barras, linha)
- Budget e metas
- Alertas de vencimentos

**Funcionalidades Core:**
- ✅ Gestão de transações (despesas/receitas)
- ✅ Categorização inteligente
- ✅ Contas recorrentes (água, luz, etc)
- ✅ Cartões de crédito e faturas
- ✅ Budget mensal por categoria
- ✅ Metas financeiras
- ✅ Projetos especiais (obra, viagem, etc)
- ✅ Análises e relatórios
- ✅ Importação da planilha Excel
- ✅ Alertas e notificações

---

### Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Shadcn/ui + Tailwind CSS
- Recharts (gráficos)
- Lucide React (ícones)

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js

**Infraestrutura:**
- Vercel (hosting)
- Supabase (banco de dados)
- Vercel Cron Jobs (alertas)

---

### Cronograma

| Fase | Duração | O Que Será Feito |
|------|---------|------------------|
| 1. Fundação | 2 semanas | Setup, autenticação, banco |
| 2. Dashboard | 2 semanas | Interface, gráficos, CRUD |
| 3. Categorias | 1 semana | Categorização, contas recorrentes |
| 4. Cartões e Budget | 1 semana | Cartões, orçamentos |
| 5. Análises | 1 semana | Relatórios e insights |
| 6. Importação | 1 semana | Import da planilha Excel |
| 7. Projetos e Alertas | 1 semana | Projetos especiais, notificações |
| 8. Deploy | 1 semana | Otimização, deploy |

**Total: ~10 semanas (2,5 meses)**

---

### Custos Estimados

**Opção 1: Gratuita (Recomendada para começar)**
- Vercel Hobby: R$ 0
- Supabase Free: R$ 0
- **Total: R$ 0/mês**

**Opção 2: Profissional (quando crescer)**
- Vercel Pro: ~R$ 100/mês
- Supabase Pro: ~R$ 125/mês
- **Total: ~R$ 225/mês**

---

## 🎯 Fases de Implementação

### Fase 1: Fundação (Semanas 1-2)
- ✅ Criar projeto Next.js
- ✅ Configurar Prisma + PostgreSQL
- ✅ Implementar autenticação
- ✅ Criar layout base com sidebar

**Prompt:** Ver seção "Fase 1" em `receita-criacao.md`

---

### Fase 2: Dashboard (Semanas 3-4)
- ✅ Cards de métricas
- ✅ Gráficos (pizza, barras, linha)
- ✅ CRUD de transações
- ✅ Tabela de transações recentes

**Prompt:** Ver seção "Fase 2" em `receita-criacao.md`

---

### Fase 3: Categorias e Recorrentes (Semana 5)
- ✅ Gestão de categorias
- ✅ Contas recorrentes
- ✅ Lançamento mensal automático

**Prompt:** Ver seção "Fase 3" em `receita-criacao.md`

---

### Fase 4: Cartões e Budget (Semana 6)
- ✅ Gestão de cartões de crédito
- ✅ Faturas mensais
- ✅ Budget por categoria
- ✅ Metas financeiras

**Prompt:** Ver seção "Fase 4" em `receita-criacao.md`

---

### Fase 5: Análises (Semana 7)
- ✅ Página de análises
- ✅ Comparativos
- ✅ Tendências
- ✅ Relatórios em PDF/Excel

**Prompt:** Ver seção "Fase 5" em `receita-criacao.md`

---

### Fase 6: Importação (Semana 8)
- ✅ Upload de Excel/CSV
- ✅ Mapeamento de colunas
- ✅ Parser inteligente
- ✅ Importação de histórico

**Prompt:** Ver seção "Fase 6" em `receita-criacao.md`

---

### Fase 7: Projetos e Alertas (Semana 9)
- ✅ Projetos especiais
- ✅ Sistema de alertas
- ✅ Notificações
- ✅ Cron jobs

**Prompt:** Ver seção "Fase 7" em `receita-criacao.md`

---

### Fase 8: Deploy (Semana 10)
- ✅ Otimização
- ✅ Deploy Vercel
- ✅ Configuração Supabase
- ✅ Monitoring (Sentry)

**Prompt:** Ver seção "Fase 8" em `receita-criacao.md`

---

## 📖 Estrutura dos Documentos

### requisitos.md
```
├── Visão Geral
├── Análise da Planilha Atual
├── Requisitos Funcionais
│   ├── 1. Dashboard Principal
│   ├── 2. Gestão de Contas Mensais
│   ├── 3. Categorização de Gastos
│   ├── 4. Gestão de Cartão de Crédito
│   ├── 5. Orçamento (Budget)
│   ├── 6. Análises e Relatórios
│   ├── 7. Histórico e Comparativos
│   ├── 8. Importação e Exportação
│   ├── 9. Projetos Especiais
│   └── 10. Integração com Investimentos
├── Requisitos Não Funcionais
├── Melhorias vs Planilha
├── Casos de Uso
└── Priorização (MVP)
```

### receita-criacao.md
```
├── Visão Geral
├── Objetivos
├── Arquitetura
├── Estrutura do Banco
├── Fase 1: Fundação
│   ├── Passo 1: Setup
│   ├── Passo 2: Banco
│   └── Passo 3: Auth
├── Fase 2: Dashboard
│   ├── Passo 4: Layout
│   ├── Passo 5: Métricas
│   └── Passo 6: CRUD
├── ... (Fases 3-8)
├── Design System
├── Funcionalidades Futuras
├── Testing
└── Prompts Consolidados
```

### modelo-dados.md
```
├── Visão Geral
├── Schema Prisma Completo
├── Diagrama de Relacionamentos
├── Descrição das Tabelas
│   ├── User
│   ├── Category
│   ├── RecurringExpense
│   ├── Transaction
│   ├── CreditCard
│   ├── Budget
│   ├── FinancialGoal
│   ├── Project
│   ├── Alert
│   └── UserSettings
├── Índices de Performance
├── Migrations
├── Seed de Dados
├── Validações
├── Queries Comuns
└── Backup e Manutenção
```

---

## 🔗 Referências Importantes

### Planilha Atual
```
/Users/bholanda/Desktop/cockpit-contas/Contas dos xuxus.xlsx
```

**Estrutura:**
- Aba "2025": Contas mensais
- Aba "Comparativo": Análises
- Aba "Cartão de Crédito": Gastos do cartão
- Aba "Histórico contas": Dados desde 2022
- Aba "Gastos Obra 2025": Projeto especial

---

### Cockpit de Investimentos (Template)
```
/Users/bholanda/Desktop/cockpit-investimento
```

**O que usar como referência:**
- Layout e design (sidebar, header, cards)
- Estrutura de pastas
- Componentes Shadcn/ui
- Gráficos com Recharts
- Autenticação NextAuth
- Schema Prisma

---

## 💡 Dicas e Boas Práticas

### Ao Usar Claude Code

1. **Use prompts por fase:** Não tente fazer tudo de uma vez
2. **Teste cada fase:** Valide antes de avançar
3. **Commit frequente:** Use git após cada funcionalidade
4. **Ajuste conforme necessário:** A receita é um guia, não uma prisão

### Durante o Desenvolvimento

1. **Comece simples:** MVP primeiro, melhorias depois
2. **Importe dados cedo:** Use a planilha real para testar
3. **Mobile desde o início:** Teste responsividade sempre
4. **Backup regular:** Banco de dados é crítico

### Antes do Deploy

1. **Teste importação completa:** Toda a planilha
2. **Valide cálculos:** Budget, totais, médias
3. **Teste em produção:** Staging environment
4. **Configure alertas:** Monitoring desde o dia 1

---

## 🎓 Recursos de Aprendizado

### Documentação Oficial

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [Recharts](https://recharts.org)
- [NextAuth.js](https://next-auth.js.org)

### Deploy

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)

---

## 🐛 Troubleshooting

### Problemas Comuns

**1. Erro ao conectar no banco:**
- Verifique DATABASE_URL em .env
- Teste conexão com `npx prisma studio`

**2. Importação da planilha falha:**
- Valide formato do Excel
- Verifique mapeamento de colunas
- Veja logs de erro detalhados

**3. Gráficos não aparecem:**
- Confirme que há dados no período
- Valide queries no console
- Verifique filtros aplicados

**4. Alertas não funcionam:**
- Verifique cron job configurado
- Teste endpoint manualmente
- Valide UserSettings

---

## 📞 Próximos Passos

1. ✅ **Leia os requisitos completos** (requisitos.md)
2. ✅ **Revise a receita de criação** (receita-criacao.md)
3. ✅ **Entenda o modelo de dados** (modelo-dados.md)
4. 🚀 **Inicie a Fase 1** usando os prompts da receita
5. 🔄 **Itere fase por fase** testando cada funcionalidade
6. 🎯 **Deploy do MVP** após Fase 8
7. 🚀 **Melhore continuamente** com funcionalidades extras

---

## ✨ Funcionalidades Destacadas

### Diferencial vs Planilha

| Recurso | Planilha | Cockpit |
|---------|----------|---------|
| **Visualização** | Estática | Gráficos interativos |
| **Alertas** | Manual | Automático |
| **Mobile** | Difícil | Nativo |
| **Histórico** | Limitado | Ilimitado |
| **Análises** | Manual | Automática |
| **Backup** | Manual | Automático |
| **Compartilhar** | Arquivo | Link |
| **Busca** | Ctrl+F | Filtros avançados |

---

## 🎉 Resultado Final

Ao completar todas as fases, você terá:

✅ Uma aplicação web moderna e responsiva
✅ Dashboard com visualizações interativas
✅ Gestão completa de contas mensais
✅ Categorização flexível e personalizada
✅ Controle de cartões de crédito
✅ Budget e metas financeiras
✅ Análises e relatórios automáticos
✅ Importação de dados históricos
✅ Sistema de alertas inteligentes
✅ Deploy profissional na nuvem

---

## 📝 Checklist de Conclusão

Após implementar todas as fases:

- [ ] Dashboard funcionando com dados reais
- [ ] Importação da planilha Excel completa
- [ ] Todas as categorias configuradas
- [ ] Contas recorrentes cadastradas
- [ ] Budget mensal definido
- [ ] Alertas funcionando
- [ ] Deploy em produção
- [ ] Monitoring configurado (Sentry)
- [ ] Backup automático ativo
- [ ] Documentação atualizada
- [ ] Testes em mobile
- [ ] Performance validada

---

**Boa sorte na construção do seu Cockpit de Contas Mensais! 🚀**

---

*Documentação criada em: 2026-01-04*
*Versão: 1.0*
*Ferramenta: Claude Code by Anthropic*

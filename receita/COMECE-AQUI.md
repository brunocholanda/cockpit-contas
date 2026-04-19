# 🚀 COMECE AQUI - Guia Rápido de Início

Este documento mostra exatamente como começar a construir o Cockpit de Contas Mensais.

---

## 📚 Documentação Disponível

Você tem 4 documentos principais:

1. **README.md** ← Visão geral de tudo
2. **requisitos.md** ← O que será construído
3. **receita-criacao.md** ← Como construir (passo a passo)
4. **modelo-dados.md** ← Estrutura do banco de dados

---

## ⚡ Início Rápido (5 minutos)

### Passo 1: Leia o README
```bash
# Abra este arquivo primeiro:
/Users/bholanda/Desktop/cockpit-contas/receita/README.md
```

Leia rapidamente para ter uma visão geral do projeto.

---

### Passo 2: Entenda os Requisitos
```bash
# Depois leia:
/Users/bholanda/Desktop/cockpit-contas/receita/requisitos.md
```

Veja na seção "Análise da Planilha Atual" como sua planilha foi analisada e quais funcionalidades serão implementadas.

---

### Passo 3: Use o Prompt Inicial

Copie e cole este prompt no Claude Code para iniciar:

```
Preciso criar um cockpit pessoal de gestão de contas mensais da minha casa, usando Next.js 14, TypeScript, Prisma e PostgreSQL.

CONTEXTO:
Atualmente gerencio minhas contas em uma planilha Excel localizada em:
/Users/bholanda/Desktop/cockpit-contas/Contas dos xuxus.xlsx

Tenho um cockpit de investimentos já funcionando que deve servir como referência de design e estrutura:
/Users/bholanda/Desktop/cockpit-investimento

A receita completa está em:
/Users/bholanda/Desktop/cockpit-contas/receita/

OBJETIVO:
Criar uma aplicação web moderna que substitua a planilha Excel, com:
- Dashboard interativo com gráficos
- Gestão de transações mensais
- Categorização de gastos
- Controle de cartões de crédito
- Budget e metas
- Análises e relatórios
- Importação da planilha atual

STACK TECNOLÓGICO (mesma do cockpit-investimento):
- Next.js 14 (App Router)
- TypeScript
- Shadcn/ui + Tailwind CSS
- Prisma ORM + PostgreSQL
- Recharts para gráficos
- TanStack Query
- NextAuth.js

PRIMEIRA FASE (Setup e Fundação):

Por favor, execute os seguintes passos:

1. Crie um novo projeto Next.js 14 com TypeScript usando a mesma estrutura do cockpit-investimento como referência

2. Configure o projeto com:
   - ESLint e Prettier (mesmas configs do cockpit-investimento)
   - Tailwind CSS
   - Shadcn/ui
   - Estrutura de pastas: /app, /components, /lib, /types, /prisma

3. Instale as dependências necessárias (use package.json do cockpit-investimento como referência)

4. Configure o Prisma com PostgreSQL e crie o schema inicial baseado em:
   /Users/bholanda/Desktop/cockpit-contas/receita/modelo-dados.md

5. Implemente autenticação com NextAuth.js (use o cockpit-investimento como referência)

6. Crie o layout base com sidebar seguindo o mesmo estilo do cockpit-investimento

Após concluir esses passos, me avise e vamos para a próxima fase (Dashboard e CRUD).
```

---

## 📋 Checklist do Primeiro Dia

### Preparação (antes de começar)

- [ ] Leia o README.md completo
- [ ] Revise requisitos.md (pelo menos as seções principais)
- [ ] Dê uma olhada no modelo-dados.md para entender as tabelas
- [ ] Tenha o cockpit-investimento aberto para referência

### Setup Inicial

- [ ] Crie uma conta no Supabase (gratuita)
- [ ] Configure um novo projeto PostgreSQL no Supabase
- [ ] Copie a DATABASE_URL
- [ ] Tenha pronto:
  - Editor de código (VS Code recomendado)
  - Terminal
  - Claude Code instalado

### Execução

- [ ] Cole o prompt inicial no Claude Code
- [ ] Acompanhe a criação do projeto
- [ ] Teste se o projeto está rodando: `npm run dev`
- [ ] Acesse http://localhost:3000
- [ ] Veja se autenticação funciona (criar usuário e logar)

---

## 🎯 Próximas Fases

Após completar a Fase 1 (Setup), continue com:

### Fase 2: Dashboard Principal
Ver seção "Fase 2" em `receita-criacao.md`

**Prompt resumido:**
```
Agora vamos implementar o dashboard principal com:
1. Cards de métricas (Total gastos, Budget, Contas pendentes, Média)
2. Gráficos com Recharts (Pizza, Barras, Linha)
3. CRUD completo de transações
4. Tabela de transações recentes

Use Shadcn/ui para componentes e siga o mesmo estilo visual do cockpit-investimento.
```

### Fase 3: Categorias e Recorrentes
Ver seção "Fase 3" em `receita-criacao.md`

### Fase 4-8: Continue seguindo a receita
Cada fase tem prompts detalhados em `receita-criacao.md`

---

## 🔧 Comandos Úteis

### Durante o desenvolvimento

```bash
# Rodar em dev
npm run dev

# Visualizar banco de dados
npx prisma studio

# Criar migration
npx prisma migrate dev --name nome_da_migration

# Regenerar Prisma Client
npx prisma generate

# Rodar seed (popular dados iniciais)
npx prisma db seed

# Build de produção
npm run build

# Rodar em produção
npm start
```

---

## 🐛 Se algo der errado

### Problema: Erro ao conectar no banco
**Solução:**
1. Verifique se DATABASE_URL está correta em `.env`
2. Teste conexão com `npx prisma studio`
3. Confirme que o banco Supabase está ativo

### Problema: Componentes Shadcn não encontrados
**Solução:**
1. Verifique se `components.json` está configurado
2. Instale componentes: `npx shadcn-ui@latest add button card input`

### Problema: Erro de TypeScript
**Solução:**
1. Rode `npx prisma generate` para gerar types
2. Reinicie o TypeScript server no VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

---

## 📊 Estrutura de Pastas Esperada

Após a Fase 1, você deve ter:

```
cockpit-contas/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   └── ...
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── ...
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── ...
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
├── .env
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

---

## ✅ Validação da Fase 1

Antes de avançar, certifique-se:

- [ ] Projeto Next.js rodando em http://localhost:3000
- [ ] Banco de dados PostgreSQL conectado
- [ ] Prisma Studio funciona (`npx prisma studio`)
- [ ] Autenticação funciona (consegue criar usuário e logar)
- [ ] Layout com sidebar aparece após login
- [ ] Tema claro/escuro funciona
- [ ] Responsivo em mobile (teste com DevTools)

---

## 📞 Ajuda Adicional

### Onde encontrar cada informação:

**"Quais funcionalidades o cockpit terá?"**
→ `requisitos.md` - seção "Requisitos Funcionais"

**"Como implementar o dashboard?"**
→ `receita-criacao.md` - seção "Fase 2"

**"Qual a estrutura do banco?"**
→ `modelo-dados.md` - schema completo

**"Como importar a planilha Excel?"**
→ `receita-criacao.md` - seção "Fase 6"

**"Como fazer deploy?"**
→ `receita-criacao.md` - seção "Fase 8"

---

## 🎓 Aprendizado Recomendado

Se você é novo em alguma tecnologia:

**Next.js 14:**
- https://nextjs.org/learn
- Foco: App Router, Server Components, API Routes

**Prisma:**
- https://www.prisma.io/docs/getting-started
- Foco: Schema, Migrations, Queries

**Shadcn/ui:**
- https://ui.shadcn.com
- Foco: Instalar e usar componentes

**TypeScript:**
- https://www.typescriptlang.org/docs/handbook/intro.html
- Foco: Tipos básicos, Interfaces

Mas não se preocupe! Claude Code vai guiar você em cada passo.

---

## 💡 Dica Final

**Não tente fazer tudo de uma vez!**

Siga as fases na ordem:
1. ✅ Setup (Fase 1)
2. ✅ Dashboard (Fase 2)
3. ✅ Categorias (Fase 3)
4. ✅ Cartões (Fase 4)
5. ✅ Análises (Fase 5)
6. ✅ Importação (Fase 6)
7. ✅ Alertas (Fase 7)
8. ✅ Deploy (Fase 8)

Cada fase testa e valida antes de avançar.

---

## 🚀 Está Pronto?

**SIM?** → Cole o prompt inicial no Claude Code e comece!

**NÃO?** → Leia o README.md primeiro

---

Boa sorte! 🎉

*Você está a 10 semanas de ter um cockpit moderno de gestão financeira!*

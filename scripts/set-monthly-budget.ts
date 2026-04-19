import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  try {
    const email = process.argv[2];
    const budget = parseFloat(process.argv[3]);

    if (!email || !budget || isNaN(budget)) {
      console.log('❌ Uso: npx tsx scripts/set-monthly-budget.ts <email> <budget_mensal>');
      console.log('   Exemplo: npx tsx scripts/set-monthly-budget.ts usuario@email.com 10000');
      return;
    }

    console.log(`🔍 Buscando usuário: ${email}\n`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Usuário não encontrado: ${email}`);
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.name || user.email}\n`);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Verificar se budget total já existe
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        categoryId: null,
        month: currentMonth,
        year: currentYear,
      },
    });

    if (existingBudget) {
      await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { plannedAmount: budget },
      });
      console.log('🔄 Budget mensal atualizado!');
    } else {
      await prisma.budget.create({
        data: {
          userId: user.id,
          categoryId: null,
          month: currentMonth,
          year: currentYear,
          plannedAmount: budget,
        },
      });
      console.log('✅ Budget mensal criado!');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Usuário: ${user.name || user.email}`);
    console.log(`   Budget mensal: R$ ${budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Erro ao configurar budget mensal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

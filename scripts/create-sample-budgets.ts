import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const budgetsByCategory: Record<string, number> = {
  'Casa': 2500,
  'Alimentação': 1800,
  'Lazer': 800,
  'Viagem': 1500,
  'Transporte': 1200,
  'Saúde': 1000,
};

async function main() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.log('❌ Uso: npx tsx scripts/create-sample-budgets.ts <email>');
      console.log('   Exemplo: npx tsx scripts/create-sample-budgets.ts usuario@email.com');
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

    let created = 0;
    let updated = 0;

    for (const [categoryName, plannedAmount] of Object.entries(budgetsByCategory)) {
      // Buscar categoria
      const category = await prisma.category.findFirst({
        where: {
          userId: user.id,
          name: categoryName,
          parentId: null,
        },
      });

      if (!category) {
        console.log(`⚠️  Categoria não encontrada: ${categoryName}`);
        continue;
      }

      // Verificar se orçamento já existe
      const existingBudget = await prisma.budget.findFirst({
        where: {
          userId: user.id,
          categoryId: category.id,
          month: currentMonth,
          year: currentYear,
        },
      });

      if (existingBudget) {
        // Atualizar orçamento existente
        await prisma.budget.update({
          where: { id: existingBudget.id },
          data: { plannedAmount },
        });
        console.log(`🔄 ${categoryName}: R$ ${plannedAmount.toFixed(2)} (atualizado)`);
        updated++;
      } else {
        // Criar novo orçamento
        await prisma.budget.create({
          data: {
            userId: user.id,
            categoryId: category.id,
            month: currentMonth,
            year: currentYear,
            plannedAmount,
          },
        });
        console.log(`✅ ${categoryName}: R$ ${plannedAmount.toFixed(2)} (criado)`);
        created++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 Processo concluído!`);
    console.log(`   Orçamentos criados: ${created}`);
    console.log(`   Orçamentos atualizados: ${updated}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Erro ao criar orçamentos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

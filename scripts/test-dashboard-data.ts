import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('Nenhum usuário encontrado');
    return;
  }

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  console.log('Data atual:', now.toISOString());
  console.log('12 meses atrás:', twelveMonthsAgo.toISOString());

  const last12MonthsExpenses = await prisma.transaction.aggregate({
    where: {
      userId: user.id,
      transactionDate: {
        gte: twelveMonthsAgo,
      },
    },
    _sum: {
      amount: true,
    },
    _count: true,
  });

  console.log('\nTransações últimos 12 meses:', last12MonthsExpenses._count);
  console.log('Total últimos 12 meses:', last12MonthsExpenses._sum.amount);
  console.log('Média mensal:', (last12MonthsExpenses._sum.amount || 0) / 12);

  // Agrupar por mês
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      transactionDate: {
        gte: twelveMonthsAgo,
      },
    },
    select: {
      amount: true,
      transactionDate: true,
    },
  });

  const monthlyData: Record<string, number> = {};
  transactions.forEach((transaction) => {
    const date = new Date(transaction.transactionDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    monthlyData[monthKey] += transaction.amount;
  });

  console.log('\nDados mensais:');
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    const value = monthlyData[monthKey] || 0;
    console.log(`  ${monthName}: R$ ${value.toFixed(2)}`);
  }

  await prisma.$disconnect();
}

test().catch(console.error);

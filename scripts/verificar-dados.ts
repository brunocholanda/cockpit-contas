import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Total de transações por categoria
  const byCategory = await prisma.transaction.groupBy({
    by: ['categoryId'],
    _count: true,
    _sum: {
      amount: true,
    },
  });

  console.log('=== TRANSAÇÕES POR CATEGORIA ===\n');

  for (const item of byCategory) {
    const category = await prisma.category.findUnique({
      where: { id: item.categoryId },
    });

    console.log(`${category?.name.padEnd(30)} ${item._count.toString().padStart(3)} transações  R$ ${item._sum.amount?.toFixed(2).padStart(12)}`);
  }

  // Verificar se tem Empréstimo Casa
  const emprestimoCategory = await prisma.category.findFirst({
    where: {
      name: 'Empréstimo Casa',
    },
  });

  if (emprestimoCategory) {
    const emprestimoTransactions = await prisma.transaction.findMany({
      where: {
        categoryId: emprestimoCategory.id,
      },
      orderBy: {
        transactionDate: 'asc',
      },
    });

    console.log(`\n=== EMPRÉSTIMO CASA (${emprestimoTransactions.length} transações) ===\n`);
    for (const t of emprestimoTransactions) {
      console.log(`${t.transactionDate.toISOString().slice(0, 10)}  R$ ${t.amount.toFixed(2)}`);
    }

    const total = emprestimoTransactions.reduce((sum, t) => sum + t.amount, 0);
    console.log(`\nTotal: R$ ${total.toFixed(2)}`);
  } else {
    console.log('\n❌ Categoria "Empréstimo Casa" não encontrada!');
  }

  // Total geral
  const totalGeral = await prisma.transaction.aggregate({
    _sum: {
      amount: true,
    },
    _count: true,
  });

  console.log(`\n=== TOTAL GERAL ===`);
  console.log(`Transações: ${totalGeral._count}`);
  console.log(`Valor total: R$ ${totalGeral._sum.amount?.toFixed(2)}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

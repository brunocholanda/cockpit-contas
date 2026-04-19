import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar todas as transações
    const transactions = await prisma.transaction.findMany({
      include: {
        category: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
      take: 20,
    });

    console.log('\n=== TRANSAÇÕES (últimas 20) ===');
    transactions.forEach((t) => {
      console.log(`- ${t.description} | R$ ${t.amount} | ${t.transactionDate.toLocaleDateString('pt-BR')} | Categoria: ${t.category.name}`);
    });

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

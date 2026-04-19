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
    console.log('🔧 Atualizando data da transação...\n');

    // Atualizar para hoje
    const result = await prisma.transaction.updateMany({
      where: {
        type: 'CARTAO_CREDITO',
        description: 'Água'
      },
      data: {
        transactionDate: new Date('2026-01-18'), // Data de hoje
      }
    });

    console.log(`✅ ${result.count} transações atualizadas para 18/01/2026`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

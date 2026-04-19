import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Limpando todas as transações...');

    const result = await prisma.transaction.deleteMany({});

    console.log(`✓ ${result.count} transações foram deletadas com sucesso!`);
  } catch (error) {
    console.error('Erro ao limpar transações:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

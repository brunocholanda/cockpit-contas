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
    console.log('🔍 Verificando transações...\n');

    const transactions = await prisma.transaction.findMany({
      where: {
        type: 'CARTAO_CREDITO'
      },
      select: {
        id: true,
        description: true,
        amount: true,
        transactionDate: true,
        creditCardId: true,
        creditCard: {
          select: {
            name: true,
            brand: true,
          }
        }
      }
    });

    console.log(`Total de transações de cartão: ${transactions.length}\n`);

    transactions.forEach((t) => {
      console.log('─────────────────────────────────');
      console.log(`Descrição: ${t.description}`);
      console.log(`Valor: R$ ${t.amount}`);
      console.log(`Data: ${t.transactionDate}`);
      console.log(`Cartão ID: ${t.creditCardId}`);
      console.log(`Cartão: ${t.creditCard?.name} ${t.creditCard?.brand}`);
      console.log('');
    });

    // Verificar data atual
    const now = new Date();
    console.log('─────────────────────────────────');
    console.log(`Data do sistema: ${now.toISOString()}`);
    console.log(`Mês atual: ${now.getMonth() + 1}/${now.getFullYear()}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

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
    console.log('🔍 Buscando parcelas pendentes com data vencida...\n');

    const now = new Date();
    now.setHours(23, 59, 59, 999); // Fim do dia atual

    // Buscar todas as transações parceladas pendentes com data <= hoje
    const overdueTransactions = await prisma.transaction.findMany({
      where: {
        status: 'PENDENTE',
        totalInstallments: {
          gt: 1,
        },
        transactionDate: {
          lte: now,
        },
      },
      select: {
        id: true,
        description: true,
        amount: true,
        transactionDate: true,
        installmentNumber: true,
        totalInstallments: true,
      },
    });

    console.log(`✅ Encontradas ${overdueTransactions.length} parcelas vencidas\n`);

    if (overdueTransactions.length === 0) {
      console.log('✨ Nenhuma parcela vencida para atualizar!');
      return;
    }

    // Atualizar status para PAGO
    const result = await prisma.transaction.updateMany({
      where: {
        status: 'PENDENTE',
        totalInstallments: {
          gt: 1,
        },
        transactionDate: {
          lte: now,
        },
      },
      data: {
        status: 'PAGO',
      },
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ ${result.count} parcelas atualizadas para PAGO`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Mostrar detalhes das parcelas atualizadas
    overdueTransactions.slice(0, 10).forEach((t) => {
      console.log(`📋 ${t.description}`);
      console.log(`   Parcela: ${t.installmentNumber}/${t.totalInstallments}`);
      console.log(`   Valor: R$ ${t.amount.toFixed(2)}`);
      console.log(`   Data: ${t.transactionDate.toLocaleDateString('pt-BR')}`);
      console.log('');
    });

    if (overdueTransactions.length > 10) {
      console.log(`... e mais ${overdueTransactions.length - 10} parcelas\n`);
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar parcelas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

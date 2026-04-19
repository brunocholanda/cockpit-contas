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
    const income = parseFloat(process.argv[3]);

    if (!email || !income || isNaN(income)) {
      console.log('❌ Uso: npx tsx scripts/set-monthly-income.ts <email> <renda_mensal>');
      console.log('   Exemplo: npx tsx scripts/set-monthly-income.ts usuario@email.com 15000');
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

    await prisma.user.update({
      where: { id: user.id },
      data: { monthlyIncome: income },
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Renda mensal configurada com sucesso!`);
    console.log(`   Usuário: ${user.name || user.email}`);
    console.log(`   Renda mensal: R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Erro ao configurar renda mensal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

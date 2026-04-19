import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_CATEGORIES = [
  { name: 'Casa', color: '#EF4444', icon: 'Home' },
  { name: 'Farofa', color: '#F59E0B', icon: 'Dog' },
  { name: 'Transporte', color: '#3B82F6', icon: 'Car' },
  { name: 'Alimentação', color: '#10B981', icon: 'UtensilsCrossed' },
  { name: 'Saúde', color: '#EC4899', icon: 'HeartPulse' },
  { name: 'Lazer', color: '#8B5CF6', icon: 'Gamepad2' },
  { name: 'Cecília', color: '#F97316', icon: 'Heart' },
  { name: 'Empréstimo Casa', color: '#6B7280', icon: 'Banknote' },
];

async function main() {
  try {
    // Buscar o usuário
    const user = await prisma.user.findFirst();

    if (!user) {
      console.error('Nenhum usuário encontrado!');
      return;
    }

    console.log(`\nAtualizando categorias para: ${user.email}\n`);

    // Deletar todas as categorias antigas
    const deleteResult = await prisma.category.deleteMany({
      where: {
        userId: user.id,
      },
    });

    console.log(`✓ ${deleteResult.count} categorias antigas foram deletadas`);

    // Criar novas categorias
    for (const category of NEW_CATEGORIES) {
      await prisma.category.create({
        data: {
          userId: user.id,
          name: category.name,
          type: 'DESPESA',
          color: category.color,
          icon: category.icon,
          isActive: true,
        },
      });
      console.log(`✓ Categoria "${category.name}" criada`);
    }

    // Listar categorias finais
    const finalCategories = await prisma.category.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`\n=== CATEGORIAS ATUALIZADAS (${finalCategories.length}) ===`);
    finalCategories.forEach((c) => {
      console.log(`- ${c.name} | ${c.color} | ${c.icon}`);
    });

    console.log('\n✅ Categorias atualizadas com sucesso!');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

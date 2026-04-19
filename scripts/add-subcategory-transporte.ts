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
    console.log('🔍 Buscando categoria Transporte...\n');

    // Buscar categoria Transporte
    const transporteCategory = await prisma.category.findFirst({
      where: {
        name: 'Transporte',
        parentId: null,
      },
    });

    if (!transporteCategory) {
      console.log('❌ Categoria Transporte não encontrada');
      return;
    }

    console.log(`✅ Categoria encontrada: ${transporteCategory.name}\n`);

    // Verificar se subcategoria já existe
    const existing = await prisma.category.findFirst({
      where: {
        name: 'Outros gastos carro',
        parentId: transporteCategory.id,
      },
    });

    if (existing) {
      console.log('⚠️  Subcategoria "Outros gastos carro" já existe');
      return;
    }

    // Criar subcategoria
    await prisma.category.create({
      data: {
        name: 'Outros gastos carro',
        userId: transporteCategory.userId,
        parentId: transporteCategory.id,
        type: transporteCategory.type,
        icon: transporteCategory.icon,
        color: transporteCategory.color,
      },
    });

    console.log('✅ Subcategoria "Outros gastos carro" criada com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao adicionar subcategoria:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

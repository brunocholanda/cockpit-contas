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
    console.log('🔍 Buscando categoria Empréstimo Casa...\n');

    // Buscar categoria Empréstimo Casa
    const emprestimoCategory = await prisma.category.findFirst({
      where: {
        name: 'Empréstimo Casa',
        parentId: null,
      },
    });

    if (!emprestimoCategory) {
      console.log('❌ Categoria "Empréstimo Casa" não encontrada');
      return;
    }

    console.log(`✅ Categoria encontrada: ${emprestimoCategory.name}\n`);

    // Verificar se subcategoria já existe
    const existingSubcategory = await prisma.category.findFirst({
      where: {
        name: 'Empréstimo Casa',
        parentId: emprestimoCategory.id,
      },
    });

    if (existingSubcategory) {
      console.log('⚠️  Subcategoria "Empréstimo Casa" já existe');
    } else {
      // Criar subcategoria
      await prisma.category.create({
        data: {
          name: 'Empréstimo Casa',
          userId: emprestimoCategory.userId,
          parentId: emprestimoCategory.id,
          type: emprestimoCategory.type,
          icon: emprestimoCategory.icon,
          color: emprestimoCategory.color,
        },
      });
      console.log('✅ Subcategoria "Empréstimo Casa" criada com sucesso!');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Processo concluído!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Erro ao criar subcategoria:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

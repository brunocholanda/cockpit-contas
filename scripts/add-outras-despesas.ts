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
    console.log('🔍 Buscando usuário...\n');

    // Buscar primeiro usuário (você pode ajustar isso se tiver múltiplos usuários)
    const user = await prisma.user.findFirst();

    if (!user) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.email}\n`);

    // Verificar se categoria já existe
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: 'Outras Despesas',
        userId: user.id,
        parentId: null,
      },
    });

    let categoryId: string;

    if (existingCategory) {
      console.log('⚠️  Categoria "Outras Despesas" já existe');
      categoryId = existingCategory.id;
    } else {
      // Criar categoria principal
      const category = await prisma.category.create({
        data: {
          name: 'Outras Despesas',
          userId: user.id,
          type: 'DESPESA',
          icon: 'Circle',
          color: '#9333EA', // Roxo
        },
      });
      console.log('✅ Categoria "Outras Despesas" criada com sucesso!');
      categoryId = category.id;
    }

    // Verificar se subcategoria já existe
    const existingSubcategory = await prisma.category.findFirst({
      where: {
        name: 'Presentes',
        parentId: categoryId,
      },
    });

    if (existingSubcategory) {
      console.log('⚠️  Subcategoria "Presentes" já existe');
    } else {
      // Criar subcategoria
      await prisma.category.create({
        data: {
          name: 'Presentes',
          userId: user.id,
          parentId: categoryId,
          type: 'DESPESA',
          icon: 'Circle',
          color: '#9333EA',
        },
      });
      console.log('✅ Subcategoria "Presentes" criada com sucesso!');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Processo concluído!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Erro ao criar categoria:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

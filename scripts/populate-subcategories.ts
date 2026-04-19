import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Mapeamento de subcategorias por categoria
const subcategoriesMap: Record<string, string[]> = {
  'Casa': ['IPTU', 'Condomínio', 'Água', 'Gás', 'Luz', 'Limpeza', 'Internet', 'Manutenção Elevador', 'Seguro Casa', 'Outros gastos casa'],
  'Farofa': ['Day Care', 'Adestramento', 'Plano de saúde', 'Outros gastos Farofa'],
  'Transporte': ['IPVA + Licenciamento', 'Seguro', 'Conectar', 'Combustível', 'Manutenção', 'Uber', 'Outros gastos carro'],
  'Alimentação': ['Mercado', 'Restaurante', 'Ifood', 'Vinhos'],
  'Saúde': ['Médicos', 'Farmácia'],
  'Lazer': ['Viagem', 'Lazer'],
  'Cecília': ['Cecília'],
  'Outras Despesas': ['Presentes'],
  'Empréstimo Casa': ['Empréstimo Casa'],
};

async function main() {
  try {
    console.log('🔍 Buscando categorias existentes...\n');

    // Buscar todas as categorias principais (sem parent)
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        userId: true,
        icon: true,
        color: true,
        type: true,
      },
    });

    console.log(`✅ Encontradas ${categories.length} categorias principais\n`);

    let totalCreated = 0;

    for (const category of categories) {
      const subcategories = subcategoriesMap[category.name];

      if (subcategories) {
        console.log(`📁 Categoria: ${category.name}`);
        console.log(`   Criando ${subcategories.length} subcategorias...\n`);

        for (const subcategoryName of subcategories) {
          // Verificar se subcategoria já existe
          const existing = await prisma.category.findFirst({
            where: {
              name: subcategoryName,
              parentId: category.id,
              userId: category.userId,
            },
          });

          if (existing) {
            console.log(`   ⏭️  ${subcategoryName} (já existe)`);
          } else {
            await prisma.category.create({
              data: {
                name: subcategoryName,
                userId: category.userId,
                parentId: category.id,
                type: category.type,
                icon: category.icon,
                color: category.color,
              },
            });
            console.log(`   ✅ ${subcategoryName} (criada)`);
            totalCreated++;
          }
        }
        console.log('');
      } else {
        console.log(`⚠️  Nenhuma subcategoria definida para: ${category.name}\n`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🎉 Processo concluído!`);
    console.log(`   Total de subcategorias criadas: ${totalCreated}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Erro ao popular subcategorias:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    // Buscar orçamentos do mês atual por categoria
    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month: currentMonth,
        year: currentYear,
        categoryId: {
          not: null, // Apenas orçamentos de categorias específicas
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    // Para cada orçamento, calcular o gasto real
    const categoryBudgetsData = await Promise.all(
      budgets.map(async (budget) => {
        if (!budget.category) return null;

        // Buscar gastos da categoria no mês atual (incluindo subcategorias)
        const expenses = await prisma.transaction.aggregate({
          where: {
            userId: user.id,
            transactionDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            OR: [
              { categoryId: budget.categoryId },
              {
                category: {
                  parentId: budget.categoryId,
                },
              },
            ],
          },
          _sum: {
            amount: true,
          },
        });

        const spent = expenses._sum.amount || 0;
        const planned = budget.plannedAmount;
        const remaining = planned - spent;
        const percentageUsed = planned > 0 ? (spent / planned) * 100 : 0;

        return {
          categoryId: budget.category.id,
          categoryName: budget.category.name,
          categoryColor: budget.category.color,
          categoryIcon: budget.category.icon,
          planned,
          spent,
          remaining,
          percentageUsed,
          isOverBudget: spent > planned,
        };
      })
    );

    // Filtrar nulls e retornar
    const validBudgets = categoryBudgetsData.filter((b) => b !== null);

    return NextResponse.json(validBudgets);
  } catch (error) {
    console.error('Erro ao buscar orçamentos por categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar orçamentos por categoria' },
      { status: 500 }
    );
  }
}

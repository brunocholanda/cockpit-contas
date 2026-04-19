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

    // Data atual e início do mês (UTC para consistência com datas armazenadas)
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    // Mês anterior
    const startOfPreviousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const endOfPreviousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));

    // Total de gastos do mês atual
    const monthlyExpenses = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        transactionDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Total de gastos do mês anterior
    const previousMonthExpenses = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        transactionDate: {
          gte: startOfPreviousMonth,
          lte: endOfPreviousMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Contas pendentes
    const pendingTransactions = await prisma.transaction.count({
      where: {
        userId: user.id,
        status: 'PENDENTE',
      },
    });

    // Média mensal dos últimos 12 meses
    const twelveMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
    const last12MonthsExpenses = await prisma.transaction.aggregate({
      where: {
        userId: user.id,
        transactionDate: {
          gte: twelveMonthsAgo,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const averageMonthly = last12MonthsExpenses._sum.amount
      ? last12MonthsExpenses._sum.amount / 12
      : 0;

    // Buscar budget do mês atual (se existir)
    const budget = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        categoryId: null, // Budget total (não específico de categoria)
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    // Calcular variação MoM
    const currentMonthTotal = monthlyExpenses._sum.amount || 0;
    const previousMonthTotal = previousMonthExpenses._sum.amount || 0;
    const momVariation = previousMonthTotal > 0
      ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      : 0;

    // Calcular taxa de comprometimento de renda
    const incomeCommitmentRate = user.monthlyIncome && user.monthlyIncome > 0
      ? (currentMonthTotal / user.monthlyIncome) * 100
      : null;

    // Categorias críticas para análise (Casa, Viagem, Alimentação)
    const criticalCategories = ['Casa', 'Viagem', 'Alimentação'];
    const criticalCategoriesData = [];

    for (const categoryName of criticalCategories) {
      // Buscar categoria
      const category = await prisma.category.findFirst({
        where: {
          userId: user.id,
          name: categoryName,
          parentId: null,
        },
      });

      if (category) {
        // Gastos da categoria no mês atual (incluindo subcategorias)
        const currentMonthCategoryExpenses = await prisma.transaction.aggregate({
          where: {
            userId: user.id,
            transactionDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            OR: [
              { categoryId: category.id },
              {
                category: {
                  parentId: category.id,
                },
              },
            ],
          },
          _sum: {
            amount: true,
          },
        });

        // Gastos da categoria no mês anterior (incluindo subcategorias)
        const previousMonthCategoryExpenses = await prisma.transaction.aggregate({
          where: {
            userId: user.id,
            transactionDate: {
              gte: startOfPreviousMonth,
              lte: endOfPreviousMonth,
            },
            OR: [
              { categoryId: category.id },
              {
                category: {
                  parentId: category.id,
                },
              },
            ],
          },
          _sum: {
            amount: true,
          },
        });

        const currentAmount = currentMonthCategoryExpenses._sum.amount || 0;
        const previousAmount = previousMonthCategoryExpenses._sum.amount || 0;
        const categoryMomVariation = previousAmount > 0
          ? ((currentAmount - previousAmount) / previousAmount) * 100
          : 0;

        criticalCategoriesData.push({
          name: categoryName,
          color: category.color,
          currentMonth: currentAmount,
          previousMonth: previousAmount,
          variation: categoryMomVariation,
        });
      }
    }

    return NextResponse.json({
      monthlyExpenses: currentMonthTotal,
      previousMonthExpenses: previousMonthTotal,
      momVariation,
      budget: budget?.plannedAmount || 0,
      pendingTransactions,
      averageMonthly,
      monthlyIncome: user.monthlyIncome || null,
      incomeCommitmentRate,
      criticalCategories: criticalCategoriesData,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}

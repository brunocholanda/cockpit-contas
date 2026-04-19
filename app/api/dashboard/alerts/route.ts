import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Alert {
  type: 'budget' | 'outlier';
  severity: 'warning' | 'critical';
  category?: string;
  categoryColor?: string;
  message: string;
  details?: {
    spent?: number;
    planned?: number;
    percentageUsed?: number;
    transactionDescription?: string;
    transactionAmount?: number;
    averageAmount?: number;
  };
}

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

    const alerts: Alert[] = [];

    // ============================================================================
    // 1. ALERTAS DE ORÇAMENTO (categorias acima de 85%)
    // ============================================================================

    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month: currentMonth,
        year: currentYear,
        categoryId: {
          not: null,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    for (const budget of budgets) {
      if (!budget.category) continue;

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
      const percentageUsed = budget.plannedAmount > 0 ? (spent / budget.plannedAmount) * 100 : 0;

      if (percentageUsed >= 100) {
        alerts.push({
          type: 'budget',
          severity: 'critical',
          category: budget.category.name,
          categoryColor: budget.category.color,
          message: `${budget.category.name} estourou o orçamento em ${(percentageUsed - 100).toFixed(0)}%`,
          details: {
            spent,
            planned: budget.plannedAmount,
            percentageUsed,
          },
        });
      } else if (percentageUsed >= 85) {
        alerts.push({
          type: 'budget',
          severity: 'warning',
          category: budget.category.name,
          categoryColor: budget.category.color,
          message: `${budget.category.name} já atingiu ${percentageUsed.toFixed(0)}% do orçamento`,
          details: {
            spent,
            planned: budget.plannedAmount,
            percentageUsed,
          },
        });
      }
    }

    // ============================================================================
    // 2. ALERTAS DE GASTOS ATÍPICOS (outliers)
    // ============================================================================

    // Buscar todas as categorias principais do usuário
    const categories = await prisma.category.findMany({
      where: {
        userId: user.id,
        parentId: null,
        type: 'DESPESA',
      },
    });

    // Para cada categoria, analisar outliers
    for (const category of categories) {
      // Buscar transações dos últimos 3 meses
      const threeMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1));

      const transactions = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          transactionDate: {
            gte: threeMonthsAgo,
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
        select: {
          id: true,
          description: true,
          amount: true,
          transactionDate: true,
        },
      });

      if (transactions.length < 5) continue; // Precisa de pelo menos 5 transações para análise

      // Calcular média e desvio padrão
      const amounts = transactions.map((t) => t.amount);
      const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
      const variance =
        amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
      const stdDev = Math.sqrt(variance);

      // Definir threshold: média + 2 desvios padrão
      const outlierThreshold = mean + 2 * stdDev;

      // Buscar transações do mês atual que são outliers
      const currentMonthTransactions = transactions.filter(
        (t) => t.transactionDate >= startOfMonth && t.transactionDate <= endOfMonth
      );

      for (const transaction of currentMonthTransactions) {
        if (transaction.amount > outlierThreshold && transaction.amount > mean * 2) {
          alerts.push({
            type: 'outlier',
            severity: 'warning',
            category: category.name,
            categoryColor: category.color,
            message: `Gasto atípico detectado em ${category.name}`,
            details: {
              transactionDescription: transaction.description,
              transactionAmount: transaction.amount,
              averageAmount: mean,
            },
          });
        }
      }
    }

    // Ordenar alertas: críticos primeiro, depois warnings
    alerts.sort((a, b) => {
      if (a.severity === 'critical' && b.severity === 'warning') return -1;
      if (a.severity === 'warning' && b.severity === 'critical') return 1;
      return 0;
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar alertas' },
      { status: 500 }
    );
  }
}

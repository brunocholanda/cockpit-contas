import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get('month') || '0');
    const year = parseInt(searchParams.get('year') || '0');

    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Mês e ano inválidos' },
        { status: 400 }
      );
    }

    // Calcular datas de início e fim do mês
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Buscar todas as transações do mês
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: {
          select: {
            name: true,
            color: true,
            icon: true,
          },
        },
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });

    // Calcular total de gastos
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Agrupar por categoria
    const categoryMap = new Map<string, {
      name: string;
      color: string;
      total: number;
      count: number;
    }>();

    transactions.forEach((transaction) => {
      const categoryName = transaction.category.name;
      const existing = categoryMap.get(categoryName);

      if (existing) {
        existing.total += transaction.amount;
        existing.count += 1;
      } else {
        categoryMap.set(categoryName, {
          name: categoryName,
          color: transaction.category.color,
          total: transaction.amount,
          count: 1,
        });
      }
    });

    // Converter para array e calcular percentuais
    const categoryBreakdown = Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        percentage: totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Nome do mês
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return NextResponse.json({
      month: monthNames[month - 1],
      year,
      totalExpenses,
      totalTransactions: transactions.length,
      categoryBreakdown,
      transactions: transactions.map((t) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        transactionDate: t.transactionDate,
        status: t.status,
        paymentMethod: t.paymentMethod,
        category: t.category,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar relatório mensal:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar relatório mensal' },
      { status: 500 }
    );
  }
}

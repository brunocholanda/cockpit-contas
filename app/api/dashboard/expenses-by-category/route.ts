import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let startDate: Date;
    let endDate: Date;

    if (month && year) {
      startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1));
      endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59, 999));
    } else {
      // Mês atual (UTC para consistência com datas armazenadas)
      const now = new Date();
      startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    }

    // Buscar transações agrupadas por categoria
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        transactionDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    // Agrupar por categoria
    const expensesByCategory = transactions.reduce((acc, transaction) => {
      const categoryName = transaction.category.name;
      const categoryColor = transaction.category.color;

      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          value: 0,
          color: categoryColor,
        };
      }

      acc[categoryName].value += transaction.amount;

      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>);

    // Converter para array e ordenar por valor
    const result = Object.values(expensesByCategory)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 categorias

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar gastos por categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar gastos por categoria' },
      { status: 500 }
    );
  }
}

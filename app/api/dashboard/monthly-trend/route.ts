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

    // Últimos 12 meses
    const now = new Date();
    const twelveMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        transactionDate: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        amount: true,
        transactionDate: true,
      },
    });

    // Agrupar por mês
    const monthlyData: Record<string, number> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;  // UTC para consistência com datas armazenadas

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }

      monthlyData[monthKey] += transaction.amount;
    });

    // Criar array com os últimos 12 meses
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' });

      result.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        value: monthlyData[monthKey] || 0,
        monthNumber: date.getUTCMonth() + 1,
        year: date.getUTCFullYear(),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar tendência mensal:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tendência mensal' },
      { status: 500 }
    );
  }
}

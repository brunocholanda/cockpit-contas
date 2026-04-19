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
    const isActive = searchParams.get('isActive');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    // Usar mês/ano fornecidos ou usar o mês atual
    const currentDate = new Date();
    const selectedMonth = monthParam ? parseInt(monthParam) : currentDate.getMonth() + 1;
    const selectedYear = yearParam ? parseInt(yearParam) : currentDate.getFullYear();

    // Buscar cartões de crédito
    const creditCards = await prisma.creditCard.findMany({
      where: {
        userId: user.id,
        ...(isActive !== null && { isActive: isActive === 'true' }),
      },
      include: {
        invoices: {
          orderBy: [
            { referenceYear: 'desc' },
            { referenceMonth: 'desc' },
          ],
          take: 1,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Calcular uso de cada cartão baseado nas transações do mês selecionado
    const cardsWithUsage = await Promise.all(
      creditCards.map(async (card) => {
        // Calcular primeiro e último dia do mês selecionado
        const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
        const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

        // Buscar todas as transações de cartão de crédito do mês atual
        const transactions = await prisma.transaction.findMany({
          where: {
            creditCardId: card.id,
            transactionDate: {
              gte: firstDayOfMonth,
              lte: lastDayOfMonth,
            },
          },
        });

        // Calcular uso total do mês
        const currentUsage = transactions.reduce((sum, t) => sum + t.amount, 0);
        const availableLimit = card.creditLimit - currentUsage;
        const usagePercentage = card.creditLimit > 0 ? (currentUsage / card.creditLimit) * 100 : 0;

        return {
          ...card,
          currentUsage,
          availableLimit,
          usagePercentage,
        };
      })
    );

    return NextResponse.json({ creditCards: cardsWithUsage });
  } catch (error) {
    console.error('Erro ao buscar cartões de crédito:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cartões de crédito' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { name, brand, lastFourDigits, creditLimit, closingDay, dueDay, isActive = true } = body;

    // Validações
    if (!name || !brand || !lastFourDigits || !creditLimit || !closingDay || !dueDay) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    if (lastFourDigits.length !== 4) {
      return NextResponse.json(
        { error: 'Últimos 4 dígitos devem ter exatamente 4 caracteres' },
        { status: 400 }
      );
    }

    if (closingDay < 1 || closingDay > 31) {
      return NextResponse.json(
        { error: 'Dia de fechamento deve estar entre 1 e 31' },
        { status: 400 }
      );
    }

    if (dueDay < 1 || dueDay > 31) {
      return NextResponse.json(
        { error: 'Dia de vencimento deve estar entre 1 e 31' },
        { status: 400 }
      );
    }

    // Criar cartão de crédito
    const creditCard = await prisma.creditCard.create({
      data: {
        userId: user.id,
        name,
        brand,
        lastFourDigits,
        creditLimit: parseFloat(creditLimit),
        closingDay: parseInt(closingDay),
        dueDay: parseInt(dueDay),
        isActive,
      },
    });

    return NextResponse.json(creditCard, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cartão de crédito:', error);
    return NextResponse.json(
      { error: 'Erro ao criar cartão de crédito' },
      { status: 500 }
    );
  }
}

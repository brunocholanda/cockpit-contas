import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { id: cardId } = params;

    // Verificar se cartão existe e pertence ao usuário
    const card = await prisma.creditCard.findFirst({
      where: {
        id: cardId,
        userId: user.id,
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Cartão não encontrado' }, { status: 404 });
    }

    // Buscar faturas
    const invoices = await prisma.creditCardInvoice.findMany({
      where: {
        cardId,
      },
      include: {
        items: {
          include: {
            category: {
              select: {
                name: true,
                color: true,
                icon: true,
              },
            },
          },
        },
      },
      orderBy: [
        { referenceYear: 'desc' },
        { referenceMonth: 'desc' },
      ],
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Erro ao buscar faturas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar faturas' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const { id: cardId } = params;

    // Verificar se cartão existe e pertence ao usuário
    const card = await prisma.creditCard.findFirst({
      where: {
        id: cardId,
        userId: user.id,
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Cartão não encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { referenceMonth, referenceYear } = body;

    // Validações
    if (!referenceMonth || !referenceYear) {
      return NextResponse.json(
        { error: 'Mês e ano de referência são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se fatura já existe
    const existingInvoice = await prisma.creditCardInvoice.findUnique({
      where: {
        cardId_referenceMonth_referenceYear: {
          cardId,
          referenceMonth: parseInt(referenceMonth),
          referenceYear: parseInt(referenceYear),
        },
      },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Fatura para este mês já existe' },
        { status: 400 }
      );
    }

    // Calcular datas de fechamento e vencimento
    const month = parseInt(referenceMonth);
    const year = parseInt(referenceYear);

    const closingDate = new Date(year, month - 1, card.closingDay);
    const dueDate = new Date(year, month, card.dueDay);

    // Criar fatura
    const invoice = await prisma.creditCardInvoice.create({
      data: {
        cardId,
        referenceMonth: month,
        referenceYear: year,
        totalAmount: 0,
        status: 'ABERTA',
        closingDate,
        dueDate,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar fatura:', error);
    return NextResponse.json(
      { error: 'Erro ao criar fatura' },
      { status: 500 }
    );
  }
}

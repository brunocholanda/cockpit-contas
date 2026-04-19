import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { description, amount, transactionDate, categoryId, type, status, paymentMethod, totalInstallments, creditCardId } = body;

    // Validações
    if (!description || !amount || !transactionDate || !categoryId) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: description, amount, transactionDate, categoryId' },
        { status: 400 }
      );
    }

    // Verificar se categoria pertence ao usuário
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId: user.id,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    // Verificar se cartão de crédito pertence ao usuário (se fornecido)
    if (creditCardId) {
      const creditCard = await prisma.creditCard.findFirst({
        where: {
          id: creditCardId,
          userId: user.id,
        },
      });

      if (!creditCard) {
        return NextResponse.json({ error: 'Cartão de crédito não encontrado' }, { status: 404 });
      }
    }

    const installments = totalInstallments ? parseInt(totalInstallments) : 1;
    const installmentAmount = installments > 1 ? parseFloat(amount) / installments : parseFloat(amount);

    // Criar primeira transação (parcela)
    const firstTransaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId,
        description: installments > 1 ? `${description} (1/${installments})` : description,
        amount: installmentAmount,
        transactionDate: new Date(transactionDate),
        type: type || 'NORMAL',
        status: status || 'PAGO',
        paymentMethod: paymentMethod || 'DEBITO',
        installmentNumber: 1,
        totalInstallments: installments,
        ...(creditCardId && { creditCardId }),
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
    });

    // Se tiver parcelas, criar as demais
    if (installments > 1) {
      const baseDate = new Date(transactionDate);

      for (let i = 2; i <= installments; i++) {
        // Adicionar meses à data base
        const installmentDate = new Date(baseDate);
        installmentDate.setMonth(baseDate.getMonth() + (i - 1));

        await prisma.transaction.create({
          data: {
            userId: user.id,
            categoryId,
            description: `${description} (${i}/${installments})`,
            amount: installmentAmount,
            transactionDate: installmentDate,
            type: type || 'NORMAL',
            status: 'PENDENTE', // Parcelas futuras como pendente
            paymentMethod: paymentMethod || 'DEBITO',
            installmentNumber: i,
            totalInstallments: installments,
            parentTransactionId: firstTransaction.id,
            ...(creditCardId && { creditCardId }),
          },
        });
      }
    }

    return NextResponse.json(firstTransaction, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar transação' },
      { status: 500 }
    );
  }
}

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      userId: user.id,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.transactionDate.lte = new Date(endDate);
      }
    }

    // Buscar transações
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              name: true,
              color: true,
              icon: true,
              parent: {
                select: {
                  name: true,
                },
              },
            },
          },
          creditCard: {
            select: {
              id: true,
              name: true,
              brand: true,
              lastFourDigits: true,
            },
          },
        },
        orderBy: {
          transactionDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 }
    );
  }
}

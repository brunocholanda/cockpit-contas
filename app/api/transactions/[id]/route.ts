import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
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

    const { id } = params;

    // Verificar se transação existe e pertence ao usuário
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
    }

    const body = await request.json();
    const { description, amount, transactionDate, categoryId, type, status, paymentMethod, creditCardId } = body;

    // Se categoria foi alterada, verificar se pertence ao usuário
    if (categoryId && categoryId !== existingTransaction.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: user.id,
        },
      });

      if (!category) {
        return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
      }
    }

    // Se cartão de crédito foi alterado, verificar se pertence ao usuário
    if (creditCardId && creditCardId !== existingTransaction.creditCardId) {
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

    // Verificar se é uma transação parcelada
    const isInstallment = existingTransaction.totalInstallments > 1;
    const isOriginInstallment = isInstallment && existingTransaction.installmentNumber === 1;

    // Preparar dados de atualização
    const updateData: any = {
      ...(amount && { amount: parseFloat(amount) }),
      ...(transactionDate && { transactionDate: new Date(transactionDate) }),
      ...(categoryId && { categoryId }),
      ...(type && { type }),
      ...(status && { status }),
      ...(paymentMethod && { paymentMethod }),
      ...(creditCardId !== undefined && { creditCardId: creditCardId || null }),
    };

    // Se for parcela de origem e tiver descrição, adicionar com numeração
    if (description) {
      if (isOriginInstallment) {
        const cleanDescription = description.replace(/\s*\(\d+\/\d+\)$/, '');
        updateData.description = `${cleanDescription} (1/${existingTransaction.totalInstallments})`;
      } else {
        updateData.description = description;
      }
    }

    // Atualizar transação principal
    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
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

    // Se for parcela origem, atualizar todas as parcelas seguintes
    if (isOriginInstallment) {
      // Buscar todas as parcelas filhas
      const childTransactions = await prisma.transaction.findMany({
        where: {
          parentTransactionId: id,
        },
        orderBy: {
          installmentNumber: 'asc',
        },
      });

      // Atualizar cada parcela filha
      const baseDate = transactionDate ? new Date(transactionDate) : existingTransaction.transactionDate;
      const baseAmount = amount ? parseFloat(amount) : existingTransaction.amount;
      const baseDescription = description || existingTransaction.description;
      const cleanDescription = baseDescription.replace(/\s*\(\d+\/\d+\)$/, '');

      for (const child of childTransactions) {
        // Calcular nova data baseada na parcela
        const newDate = new Date(baseDate);
        newDate.setMonth(baseDate.getMonth() + (child.installmentNumber - 1));

        // Preparar descrição com número da parcela
        const newDescription = `${cleanDescription} (${child.installmentNumber}/${existingTransaction.totalInstallments})`;

        await prisma.transaction.update({
          where: { id: child.id },
          data: {
            description: newDescription,
            amount: baseAmount,
            transactionDate: newDate,
            ...(categoryId && { categoryId }),
            ...(type && { type }),
            // Status não é atualizado nas parcelas seguintes - mantém individual
            ...(paymentMethod && { paymentMethod }),
            ...(creditCardId !== undefined && { creditCardId: creditCardId || null }),
          },
        });
      }
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar transação' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id } = params;

    // Verificar se transação existe e pertence ao usuário
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transação não encontrada' }, { status: 404 });
    }

    // Se for transação parcelada, deletar todas as parcelas
    if (existingTransaction.totalInstallments > 1) {
      // Se for a primeira parcela (não tem parent), deletar ela e todas as filhas
      if (!existingTransaction.parentTransactionId) {
        await prisma.transaction.deleteMany({
          where: {
            OR: [
              { id },
              { parentTransactionId: id },
            ],
          },
        });
      } else {
        // Se for parcela filha, deletar a parcela pai e todas as outras filhas
        await prisma.transaction.deleteMany({
          where: {
            OR: [
              { id: existingTransaction.parentTransactionId },
              { parentTransactionId: existingTransaction.parentTransactionId },
            ],
          },
        });
      }
    } else {
      // Deletar transação única
      await prisma.transaction.delete({
        where: { id },
      });
    }

    return NextResponse.json({ message: 'Transação removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar transação' },
      { status: 500 }
    );
  }
}

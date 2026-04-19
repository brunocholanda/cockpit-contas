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

    // Verificar se cartão existe e pertence ao usuário
    const existingCard = await prisma.creditCard.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, brand, lastFourDigits, creditLimit, closingDay, dueDay, isActive } = body;

    // Validações
    if (lastFourDigits && lastFourDigits.length !== 4) {
      return NextResponse.json(
        { error: 'Últimos 4 dígitos devem ter exatamente 4 caracteres' },
        { status: 400 }
      );
    }

    if (closingDay && (closingDay < 1 || closingDay > 31)) {
      return NextResponse.json(
        { error: 'Dia de fechamento deve estar entre 1 e 31' },
        { status: 400 }
      );
    }

    if (dueDay && (dueDay < 1 || dueDay > 31)) {
      return NextResponse.json(
        { error: 'Dia de vencimento deve estar entre 1 e 31' },
        { status: 400 }
      );
    }

    // Atualizar cartão
    const creditCard = await prisma.creditCard.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(brand && { brand }),
        ...(lastFourDigits && { lastFourDigits }),
        ...(creditLimit && { creditLimit: parseFloat(creditLimit) }),
        ...(closingDay && { closingDay: parseInt(closingDay) }),
        ...(dueDay && { dueDay: parseInt(dueDay) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(creditCard);
  } catch (error) {
    console.error('Erro ao atualizar cartão:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar cartão' },
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

    // Verificar se cartão existe e pertence ao usuário
    const existingCard = await prisma.creditCard.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Cartão não encontrado' },
        { status: 404 }
      );
    }

    // Deletar cartão (cascade vai deletar faturas e itens)
    await prisma.creditCard.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cartão removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar cartão:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar cartão' },
      { status: 500 }
    );
  }
}

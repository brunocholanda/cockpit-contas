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

    const now = new Date();
    now.setHours(23, 59, 59, 999); // Fim do dia atual

    // Atualizar status de parcelas pendentes com data vencida para PAGO
    const result = await prisma.transaction.updateMany({
      where: {
        userId: user.id,
        status: 'PENDENTE',
        totalInstallments: {
          gt: 1,
        },
        transactionDate: {
          lte: now,
        },
      },
      data: {
        status: 'PAGO',
      },
    });

    return NextResponse.json({
      message: 'Status das parcelas atualizado com sucesso',
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Erro ao atualizar status das parcelas:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status das parcelas' },
      { status: 500 }
    );
  }
}

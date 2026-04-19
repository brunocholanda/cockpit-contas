import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
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

    // Deletar todas as transações do usuário
    const result = await prisma.transaction.deleteMany({
      where: {
        userId: user.id,
      },
    });

    console.log(`🗑️  ${result.count} transações foram deletadas`);

    return NextResponse.json({
      message: `${result.count} transações foram deletadas com sucesso`,
      count: result.count
    });
  } catch (error) {
    console.error('Erro ao deletar transações:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar transações' },
      { status: 500 }
    );
  }
}

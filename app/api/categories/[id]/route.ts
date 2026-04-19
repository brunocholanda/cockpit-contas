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

    // Verificar se categoria existe e pertence ao usuário
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, type, icon, color, description, isActive } = body;

    // Atualizar categoria
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
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

    // Verificar se categoria existe e pertence ao usuário
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se categoria está em uso
    const isInUse = existingCategory._count.transactions > 0;

    if (isInUse) {
      return NextResponse.json(
        {
          error: 'Não é possível deletar categoria em uso',
          details: {
            transactions: existingCategory._count.transactions,
          },
        },
        { status: 400 }
      );
    }

    // Deletar categoria
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Categoria removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar categoria' },
      { status: 500 }
    );
  }
}

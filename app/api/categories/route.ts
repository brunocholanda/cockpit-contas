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
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    // Buscar todas as categorias do usuário com contadores de uso
    const categories = await prisma.category.findMany({
      where: {
        userId: user.id,
        ...(type && { type: type as 'DESPESA' | 'RECEITA' }),
        ...(isActive !== null && { isActive: isActive === 'true' }),
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
        children: {
          orderBy: {
            name: 'asc',
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
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
    const { name, type, icon, color, description, isActive = true } = body;

    // Validações
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nome e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar categoria
    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name,
        type,
        icon: icon || 'Circle',
        color: color || '#6B7280',
        description,
        isActive,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    );
  }
}

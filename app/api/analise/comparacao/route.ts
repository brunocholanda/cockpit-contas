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

    // Pegar parâmetros da URL
    const { searchParams } = new URL(request.url);
    const periodo1Start = searchParams.get('periodo1Start');
    const periodo1End = searchParams.get('periodo1End');
    const periodo2Start = searchParams.get('periodo2Start');
    const periodo2End = searchParams.get('periodo2End');

    // Se não fornecidos, usar mês atual vs mês anterior
    const now = new Date();
    const periodo1 = {
      start: periodo1Start ? new Date(periodo1Start) : new Date(now.getFullYear(), now.getMonth(), 1),
      end: periodo1End ? new Date(periodo1End) : new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };

    const periodo2 = {
      start: periodo2Start ? new Date(periodo2Start) : new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: periodo2End ? new Date(periodo2End) : new Date(now.getFullYear(), now.getMonth(), 0),
    };

    // Buscar dados do período 1
    const [transacoesPeriodo1, totalPeriodo1] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          transactionDate: {
            gte: periodo1.start,
            lte: periodo1.end,
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          transactionDate: {
            gte: periodo1.start,
            lte: periodo1.end,
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Buscar dados do período 2
    const [transacoesPeriodo2, totalPeriodo2] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: user.id,
          transactionDate: {
            gte: periodo2.start,
            lte: periodo2.end,
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          userId: user.id,
          transactionDate: {
            gte: periodo2.start,
            lte: periodo2.end,
          },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Agrupar por categoria - Período 1
    const categoriasPeriodo1 = transacoesPeriodo1.reduce((acc, t) => {
      const catId = t.category.id;
      if (!acc[catId]) {
        acc[catId] = {
          id: catId,
          nome: t.category.name,
          color: t.category.color,
          valor: 0,
          transacoes: 0,
        };
      }
      acc[catId].valor += t.amount;
      acc[catId].transacoes += 1;
      return acc;
    }, {} as Record<string, any>);

    // Agrupar por categoria - Período 2
    const categoriasPeriodo2 = transacoesPeriodo2.reduce((acc, t) => {
      const catId = t.category.id;
      if (!acc[catId]) {
        acc[catId] = {
          id: catId,
          nome: t.category.name,
          color: t.category.color,
          valor: 0,
          transacoes: 0,
        };
      }
      acc[catId].valor += t.amount;
      acc[catId].transacoes += 1;
      return acc;
    }, {} as Record<string, any>);

    // Calcular percentuais
    const totalP1 = totalPeriodo1._sum.amount || 0;
    const totalP2 = totalPeriodo2._sum.amount || 0;

    const categoriasP1Array = Object.values(categoriasPeriodo1).map((cat: any) => ({
      ...cat,
      percentual: totalP1 > 0 ? (cat.valor / totalP1) * 100 : 0,
    }));

    const categoriasP2Array = Object.values(categoriasPeriodo2).map((cat: any) => ({
      ...cat,
      percentual: totalP2 > 0 ? (cat.valor / totalP2) * 100 : 0,
    }));

    // Calcular variações por categoria
    const todasCategorias = new Set([
      ...Object.keys(categoriasPeriodo1),
      ...Object.keys(categoriasPeriodo2),
    ]);

    const variacoesCategorias = Array.from(todasCategorias).map((catId) => {
      const cat1 = categoriasPeriodo1[catId];
      const cat2 = categoriasPeriodo2[catId];

      const valorP1 = cat1?.valor || 0;
      const valorP2 = cat2?.valor || 0;

      const variacao = valorP1 - valorP2;
      const variacaoPercentual = valorP2 > 0 ? (variacao / valorP2) * 100 : valorP1 > 0 ? 100 : 0;

      return {
        id: catId,
        nome: cat1?.nome || cat2?.nome,
        color: cat1?.color || cat2?.color,
        valorP1,
        valorP2,
        variacao,
        variacaoPercentual,
      };
    });

    // Top 5 maiores aumentos e reduções
    const aumentos = variacoesCategorias
      .filter((v) => v.variacao > 0)
      .sort((a, b) => b.variacao - a.variacao)
      .slice(0, 5);

    const reducoes = variacoesCategorias
      .filter((v) => v.variacao < 0)
      .sort((a, b) => a.variacao - b.variacao)
      .slice(0, 5);

    // Calcular variação total
    const variacaoTotal = totalP1 - totalP2;
    const variacaoTotalPercentual = totalP2 > 0 ? (variacaoTotal / totalP2) * 100 : totalP1 > 0 ? 100 : 0;

    return NextResponse.json({
      periodo1: {
        start: periodo1.start,
        end: periodo1.end,
        total: totalP1,
        transacoes: totalPeriodo1._count,
        categorias: categoriasP1Array,
      },
      periodo2: {
        start: periodo2.start,
        end: periodo2.end,
        total: totalP2,
        transacoes: totalPeriodo2._count,
        categorias: categoriasP2Array,
      },
      variacao: {
        valor: variacaoTotal,
        percentual: variacaoTotalPercentual,
        aumentos,
        reducoes,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar comparação:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar comparação' },
      { status: 500 }
    );
  }
}

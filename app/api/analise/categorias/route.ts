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

    // Pegar parâmetros
    const { searchParams } = new URL(request.url);
    const mesesParam = searchParams.get('meses') || '12';
    const meses = parseInt(mesesParam);

    // Calcular período
    const now = new Date();
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (meses - 1), 1));

    // Buscar todas as transações do período
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        transactionDate: {
          gte: startDate,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            parentId: true,
            parent: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
              },
            },
          },
        },
      },
      orderBy: {
        transactionDate: 'asc',
      },
    });

    // Total geral
    const totalGeral = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Agrupar por categoria principal
    const categoriesMap = new Map<string, any>();

    transactions.forEach((t) => {
      // Determinar a categoria principal (se tiver parent, usar parent; senão usar a própria)
      const isSubcategory = !!t.category.parentId;
      const mainCategory = isSubcategory && t.category.parent ? t.category.parent : t.category;
      const mainCatId = mainCategory.id;
      const mes = `${t.transactionDate.getUTCFullYear()}-${String(t.transactionDate.getUTCMonth() + 1).padStart(2, '0')}`;

      // Criar entrada da categoria principal se não existir
      if (!categoriesMap.has(mainCatId)) {
        categoriesMap.set(mainCatId, {
          id: mainCatId,
          nome: mainCategory.name,
          color: mainCategory.color,
          icon: mainCategory.icon,
          total: 0,
          transacoes: 0,
          evolucaoMensal: new Map<string, number>(),
          subcategorias: new Map<string, any>(),
        });
      }

      const cat = categoriesMap.get(mainCatId);
      cat.total += t.amount;
      cat.transacoes += 1;

      const evolucao = cat.evolucaoMensal;
      evolucao.set(mes, (evolucao.get(mes) || 0) + t.amount);

      // Se for subcategoria, também rastrear breakdown por subcategoria
      if (isSubcategory) {
        const subCatId = t.category.id;
        if (!cat.subcategorias.has(subCatId)) {
          cat.subcategorias.set(subCatId, {
            id: subCatId,
            nome: t.category.name,
            color: t.category.color,
            total: 0,
            transacoes: 0,
            evolucaoMensal: new Map<string, number>(),
          });
        }
        const subCat = cat.subcategorias.get(subCatId);
        subCat.total += t.amount;
        subCat.transacoes += 1;
        subCat.evolucaoMensal.set(mes, (subCat.evolucaoMensal.get(mes) || 0) + t.amount);
      }
    });

    // Calcular tendência para cada categoria
    const calcularTendencia = (evolucaoMensal: Map<string, number>): 'crescente' | 'decrescente' | 'estavel' => {
      const valores = Array.from(evolucaoMensal.values());
      if (valores.length < 3) return 'estavel';

      // Regressão linear simples
      const n = valores.length;
      const somaX = valores.reduce((sum, _, i) => sum + i, 0);
      const somaY = valores.reduce((sum, v) => sum + v, 0);
      const somaXY = valores.reduce((sum, v, i) => sum + (i * v), 0);
      const somaX2 = valores.reduce((sum, _, i) => sum + (i * i), 0);

      const inclinacao = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);

      if (Math.abs(inclinacao) < 100) return 'estavel';
      return inclinacao > 0 ? 'crescente' : 'decrescente';
    }

    // Converter para array e adicionar métricas
    const categorias = Array.from(categoriesMap.values()).map((cat) => {
      const percentualTotal = totalGeral > 0 ? (cat.total / totalGeral) * 100 : 0;
      const mediaMensal = cat.total / meses;
      const tendencia = calcularTendencia(cat.evolucaoMensal);

      // Converter evolução mensal para array
      const evolucao = Array.from(cat.evolucaoMensal.entries())
        .map(([mes, valor]) => ({ mes, valor }))
        .sort((a, b) => a.mes.localeCompare(b.mes));

      // Converter subcategorias para array
      const subcategorias = Array.from(cat.subcategorias.values()).map((sub) => ({
        id: sub.id,
        nome: sub.nome,
        color: sub.color,
        total: sub.total,
        percentualDaCategoria: cat.total > 0 ? (sub.total / cat.total) * 100 : 0,
        transacoes: sub.transacoes,
        evolucao: Array.from(sub.evolucaoMensal.entries())
          .map(([m, v]: [string, number]) => ({ mes: m, valor: v }))
          .sort((a: any, b: any) => a.mes.localeCompare(b.mes)),
      }));

      // Ordenar subcategorias por total
      subcategorias.sort((a, b) => b.total - a.total);

      return {
        id: cat.id,
        nome: cat.nome,
        color: cat.color,
        icon: cat.icon,
        total: cat.total,
        percentualTotal,
        mediaMensal,
        transacoes: cat.transacoes,
        tendencia,
        evolucao,
        subcategorias,
      };
    });

    // Ordenar por total (maior primeiro)
    categorias.sort((a, b) => b.total - a.total);

    return NextResponse.json({
      categorias,
      totalGeral,
      periodo: {
        inicio: startDate,
        fim: now,
        meses,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}

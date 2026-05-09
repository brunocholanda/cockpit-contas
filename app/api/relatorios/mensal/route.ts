import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const MONTH_NAMES_LOWER = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const { searchParams } = request.nextUrl;

    const now = new Date();
    const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(now.getFullYear()));

    if (month < 1 || month > 12) {
      return NextResponse.json({ error: 'Mês inválido' }, { status: 400 });
    }

    // ── 1. Transações normais (não cartão) — mês calendário ──────────────────
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const normalTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        creditCardId: null,
        transactionDate: { gte: startDate, lte: endDate },
      },
      include: {
        category: {
          select: {
            name: true,
            color: true,
            icon: true,
            type: true,
            parent: { select: { name: true } },
          },
        },
      },
      orderBy: { transactionDate: 'desc' },
    });

    // ── 2. Faturas de cartão — período baseado no closingDay ──────────────────
    const creditCards = await prisma.creditCard.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    const faturas = await Promise.all(
      creditCards.map(async (card) => {
        // Período: dia (closingDay + 1) do mês anterior até closingDay do mês selecionado
        const periodEnd = new Date(year, month - 1, card.closingDay, 23, 59, 59);
        const periodStart = new Date(year, month - 2, card.closingDay + 1);

        const transactions = await prisma.transaction.findMany({
          where: {
            userId,
            creditCardId: card.id,
            transactionDate: { gte: periodStart, lte: periodEnd },
          },
          include: {
            category: {
              select: {
                name: true,
                color: true,
                icon: true,
                parent: { select: { name: true } },
              },
            },
          },
          orderBy: { transactionDate: 'desc' },
        });

        const total = transactions.reduce((sum, t) => sum + t.amount, 0);

        return {
          cartao: {
            id: card.id,
            name: card.name,
            brand: card.brand,
            lastFourDigits: card.lastFourDigits,
            closingDay: card.closingDay,
            dueDay: card.dueDay,
            isActive: card.isActive,
          },
          periodo: {
            inicio: `${periodStart.getDate()} de ${MONTH_NAMES_LOWER[periodStart.getMonth()]}`,
            fim: `${periodEnd.getDate()} de ${MONTH_NAMES_LOWER[periodEnd.getMonth()]}`,
          },
          total,
          transacoes: transactions.map((t) => ({
            id: t.id,
            description: t.description,
            amount: t.amount,
            transactionDate: t.transactionDate,
            status: t.status,
            installmentNumber: t.installmentNumber,
            totalInstallments: t.totalInstallments,
            category: t.category,
          })),
        };
      })
    );

    const faturasComTransacoes = faturas.filter((f) => f.transacoes.length > 0);

    // ── 3. Totais ─────────────────────────────────────────────────────────────
    const despesasNormais = normalTransactions
      .filter((t) => t.category.type === 'DESPESA')
      .reduce((sum, t) => sum + t.amount, 0);

    const receitas = normalTransactions
      .filter((t) => t.category.type === 'RECEITA')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCredito = faturas.reduce((sum, f) => sum + f.total, 0);
    const totalDespesas = despesasNormais + totalCredito;
    const saldo = receitas - totalDespesas;

    // ── 4. Breakdown por categoria (todas as despesas) ────────────────────────
    const allExpenses = [
      ...normalTransactions
        .filter((t) => t.category.type === 'DESPESA')
        .map((t) => ({ amount: t.amount, category: t.category })),
      ...faturas.flatMap((f) =>
        f.transacoes.map((t) => ({ amount: t.amount, category: t.category }))
      ),
    ];

    const categoryMap = new Map<string, { name: string; color: string; total: number }>();
    allExpenses.forEach(({ amount, category }) => {
      const key = category.parent?.name || category.name;
      const color = category.color;
      const existing = categoryMap.get(key);
      if (existing) {
        existing.total += amount;
      } else {
        categoryMap.set(key, { name: key, color, total: amount });
      }
    });

    const categorias = Array.from(categoryMap.values())
      .map((cat) => ({
        ...cat,
        percentage: totalDespesas > 0 ? (cat.total / totalDespesas) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      month: MONTH_NAMES[month - 1],
      year,
      summary: {
        totalDespesas,
        despesasNormais,
        totalCredito,
        receitas,
        saldo,
      },
      transacoesNormais: normalTransactions.map((t) => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        transactionDate: t.transactionDate,
        status: t.status,
        paymentMethod: t.paymentMethod,
        installmentNumber: t.installmentNumber,
        totalInstallments: t.totalInstallments,
        category: t.category,
      })),
      faturas: faturasComTransacoes,
      categorias,
    });
  } catch (error) {
    console.error('Erro ao buscar relatório mensal:', error);
    return NextResponse.json({ error: 'Erro ao buscar relatório mensal' }, { status: 500 });
  }
}

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

    // Buscar transações
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        transactionDate: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        transactionDate: true,
      },
    });

    // Agrupar por mês
    const monthlyData: Record<string, number> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.transactionDate);
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }

      monthlyData[monthKey] += transaction.amount;
    });

    // Criar array com todos os meses
    const dados = [];
    for (let i = meses - 1; i >= 0; i--) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' });

      dados.push({
        mes: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        mesKey: monthKey,
        valor: monthlyData[monthKey] || 0,
      });
    }

    // Calcular média móvel (3 meses)
    const mediaMovel = dados.map((d, index) => {
      if (index < 2) {
        return { mes: d.mes, valor: d.valor };
      }

      const soma = dados[index].valor + dados[index - 1].valor + dados[index - 2].valor;
      return {
        mes: d.mes,
        valor: soma / 3,
      };
    });

    // Calcular estatísticas
    const valores = dados.map((d) => d.valor).filter((v) => v > 0);
    const media = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;

    // Desvio padrão
    const variancia = valores.length > 0
      ? valores.reduce((sum, v) => sum + Math.pow(v - media, 2), 0) / valores.length
      : 0;
    const desvioPadrao = Math.sqrt(variancia);

    // Máximo e mínimo
    const dadosComValor = dados.filter((d) => d.valor > 0);
    const maximo = dadosComValor.length > 0
      ? dadosComValor.reduce((max, d) => (d.valor > max.valor ? d : max))
      : { mes: '', valor: 0 };

    const minimo = dadosComValor.length > 0
      ? dadosComValor.reduce((min, d) => (d.valor < min.valor ? d : min))
      : { mes: '', valor: 0 };

    // Calcular tendência (regressão linear)
    function calcularTendencia(dados: any[]): 'crescente' | 'decrescente' | 'estavel' {
      const valores = dados.map((d) => d.valor);
      if (valores.length < 3) return 'estavel';

      const n = valores.length;
      const somaX = valores.reduce((sum, _, i) => sum + i, 0);
      const somaY = valores.reduce((sum, v) => sum + v, 0);
      const somaXY = valores.reduce((sum, v, i) => sum + (i * v), 0);
      const somaX2 = valores.reduce((sum, _, i) => sum + (i * i), 0);

      const inclinacao = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);

      if (Math.abs(inclinacao) < 100) return 'estavel';
      return inclinacao > 0 ? 'crescente' : 'decrescente';
    }

    const tendencia = calcularTendencia(dados);

    return NextResponse.json({
      dados,
      mediaMovel,
      estatisticas: {
        media,
        desvioPadrao,
        maximo,
        minimo,
        tendencia,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar tendências:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar tendências' },
      { status: 500 }
    );
  }
}

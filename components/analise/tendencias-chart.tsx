'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface TendenciasData {
  dados: Array<{
    mes: string;
    valor: number;
  }>;
  mediaMovel: Array<{
    mes: string;
    valor: number;
  }>;
  estatisticas: {
    media: number;
    desvioPadrao: number;
    maximo: {
      mes: string;
      valor: number;
    };
    minimo: {
      mes: string;
      valor: number;
    };
    tendencia: 'crescente' | 'decrescente' | 'estavel';
  };
}

interface TendenciasChartProps {
  dados: TendenciasData | null;
  loading: boolean;
}

export function TendenciasChart({ dados, loading }: TendenciasChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Temporal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            Carregando tendências...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dados) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Temporal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-destructive">
            Erro ao carregar tendências
          </div>
        </CardContent>
      </Card>
    );
  }

  const { estatisticas } = dados;

  // Combinar dados para o gráfico
  const chartData = dados.dados.map((d, index) => ({
    mes: d.mes,
    gastos: d.valor,
    mediaMovel: dados.mediaMovel[index]?.valor || null,
  }));

  const renderTendenciaIcon = () => {
    switch (estatisticas.tendencia) {
      case 'crescente':
        return <TrendingUp className="h-5 w-5 text-red-500" />;
      case 'decrescente':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderTendenciaText = () => {
    switch (estatisticas.tendencia) {
      case 'crescente':
        return <span className="text-red-600">Crescente</span>;
      case 'decrescente':
        return <span className="text-green-600">Decrescente</span>;
      default:
        return <span className="text-gray-600">Estável</span>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Temporal (Últimos 12 Meses)</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Média</div>
            <div className="text-2xl font-bold">{formatCurrency(estatisticas.media)}</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Tendência</div>
            <div className="text-2xl font-bold flex items-center justify-center gap-2">
              {renderTendenciaIcon()}
              {renderTendenciaText()}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Maior</div>
            <div className="text-lg font-bold">{formatCurrency(estatisticas.maximo.valor)}</div>
            <div className="text-xs text-muted-foreground">{estatisticas.maximo.mes}</div>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Menor</div>
            <div className="text-lg font-bold">{formatCurrency(estatisticas.minimo.valor)}</div>
            <div className="text-xs text-muted-foreground">{estatisticas.minimo.mes}</div>
          </div>
        </div>

        {/* Gráfico de Linha */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
            />
            <Legend />
            <ReferenceLine
              y={estatisticas.media}
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              label={{ value: 'Média', position: 'right', fill: '#6B7280' }}
            />
            <Line
              type="monotone"
              dataKey="gastos"
              name="Gastos Mensais"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="mediaMovel"
              name="Média Móvel (3m)"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Insights */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="text-sm space-y-2">
            <p>
              <strong>Análise:</strong> Seus gastos estão em tendência{' '}
              {renderTendenciaText()}.
            </p>
            <p>
              O mês com maior gasto foi <strong>{estatisticas.maximo.mes}</strong> com{' '}
              <strong>{formatCurrency(estatisticas.maximo.valor)}</strong>, enquanto o menor foi{' '}
              <strong>{estatisticas.minimo.mes}</strong> com{' '}
              <strong>{formatCurrency(estatisticas.minimo.valor)}</strong>.
            </p>
            {estatisticas.desvioPadrao > estatisticas.media * 0.3 && (
              <p className="text-amber-600">
                ⚠️ Seus gastos têm alta variação (desvio padrão:{' '}
                {formatCurrency(estatisticas.desvioPadrao)}). Considere criar um budget mais
                realista.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

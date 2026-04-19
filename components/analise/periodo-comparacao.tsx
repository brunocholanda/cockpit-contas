'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparacaoData {
  periodo1: {
    start: Date;
    end: Date;
    total: number;
    transacoes: number;
    categorias: Array<{
      nome: string;
      valor: number;
      percentual: number;
    }>;
  };
  periodo2: {
    start: Date;
    end: Date;
    total: number;
    transacoes: number;
    categorias: Array<{
      nome: string;
      valor: number;
      percentual: number;
    }>;
  };
  variacao: {
    valor: number;
    percentual: number;
    aumentos: Array<{
      nome: string;
      variacao: number;
      variacaoPercentual: number;
    }>;
    reducoes: Array<{
      nome: string;
      variacao: number;
      variacaoPercentual: number;
    }>;
  };
}

interface PeriodoComparacaoProps {
  dados: ComparacaoData | null;
  loading: boolean;
}

export function PeriodoComparacao({ dados, loading }: PeriodoComparacaoProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Períodos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Carregando dados de comparação...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dados) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Períodos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-destructive">
            Erro ao carregar dados de comparação
          </div>
        </CardContent>
      </Card>
    );
  }

  const { periodo1, periodo2, variacao } = dados;

  const formatarData = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  const renderVariacaoIcon = () => {
    if (variacao.percentual > 5) {
      return <TrendingUp className="h-5 w-5 text-red-500" />;
    } else if (variacao.percentual < -5) {
      return <TrendingDown className="h-5 w-5 text-green-500" />;
    } else {
      return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderVariacaoText = () => {
    const isAumento = variacao.valor > 0;
    const colorClass = isAumento ? 'text-red-600' : variacao.valor < 0 ? 'text-green-600' : 'text-gray-600';

    return (
      <div className={`text-center ${colorClass}`}>
        <div className="text-3xl font-bold flex items-center justify-center gap-2">
          {renderVariacaoIcon()}
          {variacao.percentual > 0 ? '+' : ''}{variacao.percentual.toFixed(1)}%
        </div>
        <div className="text-sm mt-1">
          {formatCurrency(Math.abs(variacao.valor))} {isAumento ? 'a mais' : 'a menos'}
        </div>
      </div>
    );
  };

  // Dados para o gráfico
  const chartData = [
    {
      periodo: formatarData(periodo2.start),
      valor: periodo2.total,
    },
    {
      periodo: formatarData(periodo1.start),
      valor: periodo1.total,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Períodos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Período 1 */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                {formatarData(periodo1.start)}
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(periodo1.total)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {periodo1.transacoes} transações
              </div>
            </div>

            {/* Variação */}
            <div className="flex items-center justify-center">
              {renderVariacaoText()}
            </div>

            {/* Período 2 */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                {formatarData(periodo2.start)}
              </div>
              <div className="text-3xl font-bold">
                {formatCurrency(periodo2.total)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {periodo2.transacoes} transações
              </div>
            </div>
          </div>

          {/* Gráfico de Barras Comparativo */}
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="valor" name="Gastos" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Maiores Variações */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* Aumentos */}
            {variacao.aumentos.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  Maiores Aumentos
                </h4>
                <div className="space-y-2">
                  {variacao.aumentos.slice(0, 3).map((cat, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{cat.nome}</span>
                      <span className="font-medium text-red-600">
                        +{formatCurrency(cat.variacao)} ({cat.variacaoPercentual > 0 ? '+' : ''}{cat.variacaoPercentual.toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reduções */}
            {variacao.reducoes.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  Maiores Reduções
                </h4>
                <div className="space-y-2">
                  {variacao.reducoes.slice(0, 3).map((cat, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{cat.nome}</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(cat.variacao)} ({cat.variacaoPercentual.toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

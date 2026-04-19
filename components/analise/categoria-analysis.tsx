'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SubcategoriaModal } from './subcategoria-modal';

interface Subcategoria {
  id: string;
  nome: string;
  color: string;
  total: number;
  percentualDaCategoria: number;
  transacoes: number;
}

interface CategoriaData {
  id: string;
  nome: string;
  color: string;
  icon: string;
  total: number;
  percentualTotal: number;
  mediaMensal: number;
  transacoes: number;
  tendencia: 'crescente' | 'decrescente' | 'estavel';
  evolucao: Array<{
    mes: string;
    valor: number;
  }>;
  subcategorias: Subcategoria[];
}

interface CategoriasData {
  categorias: CategoriaData[];
  totalGeral: number;
}

interface CategoriaAnalysisProps {
  dados: CategoriasData | null;
  loading: boolean;
}

export function CategoriaAnalysis({ dados, loading }: CategoriaAnalysisProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaData | null>(null);

  const handleBarClick = (data: any) => {
    if (data && data.subcategorias && data.subcategorias.length > 0) {
      setSelectedCategoria(data);
      setModalOpen(true);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise Por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            Carregando análise de categorias...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dados || !dados.categorias) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise Por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-destructive">
            Erro ao carregar análise de categorias
          </div>
        </CardContent>
      </Card>
    );
  }

  const { categorias, totalGeral } = dados;

  // Validação adicional para evitar erros
  if (!Array.isArray(categorias) || categorias.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise Por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            Nenhuma categoria encontrada para o período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decrescente':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Top 10 para o gráfico
  const top10 = categorias.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise Por Categoria (Top 10)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gráfico de Barras Horizontais */}
        <div>
          {top10.length > 0 && (
            <p className="text-sm text-muted-foreground mb-2">
              💡 Clique nas barras para ver o detalhamento por subcategoria
            </p>
          )}
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={top10}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nome" type="category" width={90} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
              />
              <Bar
                dataKey="total"
                name="Total Gasto"
                onClick={handleBarClick}
                cursor="pointer"
              >
                {top10.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tabela Detalhada */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Categoria</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">% do Total</TableHead>
                <TableHead className="text-right">Média Mensal</TableHead>
                <TableHead className="text-right">Transações</TableHead>
                <TableHead className="text-center">Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.slice(0, 10).map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.nome}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(cat.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-muted-foreground">
                      {cat.percentualTotal.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(cat.mediaMensal)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {cat.transacoes}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      {renderTendenciaIcon(cat.tendencia)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Resumo */}
        {categorias.length > 10 && (
          <div className="text-sm text-muted-foreground text-center">
            Mostrando top 10 de {categorias.length} categorias • Total:{' '}
            <strong>{formatCurrency(totalGeral)}</strong>
          </div>
        )}

        {/* Insights */}
        {categorias.length > 0 && (
          <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
            {categorias[0] && (
              <p>
                <strong>Categoria dominante:</strong> {categorias[0].nome} representa{' '}
                {categorias[0].percentualTotal.toFixed(1)}% dos seus gastos totais.
              </p>
            )}
            {categorias.filter((c) => c.tendencia === 'crescente').length > 0 && (
              <p className="text-red-600">
                📈 <strong>{categorias.filter((c) => c.tendencia === 'crescente').length}</strong>{' '}
                categorias em tendência de crescimento
              </p>
            )}
            {categorias.filter((c) => c.tendencia === 'decrescente').length > 0 && (
              <p className="text-green-600">
                📉 <strong>{categorias.filter((c) => c.tendencia === 'decrescente').length}</strong>{' '}
                categorias em tendência de redução
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Modal de Subcategorias */}
      {selectedCategoria && (
        <SubcategoriaModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          categoriaNome={selectedCategoria.nome}
          categoriaColor={selectedCategoria.color}
          categoriaTotal={selectedCategoria.total}
          subcategorias={selectedCategoria.subcategorias}
        />
      )}
    </Card>
  );
}

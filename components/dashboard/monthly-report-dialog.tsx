'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  transactionDate: string;
  status: string;
  paymentMethod: string;
  category: {
    name: string;
    color: string;
    icon: string;
  };
}

interface CategorySummary {
  name: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}

interface MonthlyReportData {
  month: string;
  year: number;
  totalExpenses: number;
  totalTransactions: number;
  categoryBreakdown: CategorySummary[];
  transactions: Transaction[];
}

interface MonthlyReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthData: { month: number; year: number } | null;
}

export function MonthlyReportDialog({
  open,
  onOpenChange,
  monthData,
}: MonthlyReportDialogProps) {
  const [data, setData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !monthData) {
      setData(null);
      return;
    }

    const fetchMonthlyReport = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/dashboard/monthly-report?month=${monthData.month}&year=${monthData.year}`
        );

        if (!response.ok) {
          throw new Error('Erro ao buscar relatório');
        }

        const reportData = await response.json();
        setData(reportData);
      } catch (error) {
        console.error('Erro ao buscar relatório mensal:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyReport();
  }, [open, monthData]);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      PAGO: { label: 'Pago', variant: 'default' },
      PENDENTE: { label: 'Pendente', variant: 'secondary' },
      VENCIDO: { label: 'Vencido', variant: 'destructive' },
    };

    const config = variants[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Relatório Mensal - {data ? `${data.month}/${data.year}` : '...'}
          </DialogTitle>
          <DialogDescription>
            Detalhamento completo dos gastos do mês
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Resumo Geral */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total de Gastos</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(data.totalExpenses)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Total de Transações</div>
                  <div className="text-2xl font-bold">{data.totalTransactions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground">Ticket Médio</div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      data.totalTransactions > 0
                        ? data.totalExpenses / data.totalTransactions
                        : 0
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Breakdown por Categoria */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Gastos por Categoria</h3>
              <div className="space-y-2">
                {data.categoryBreakdown.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="h-4 w-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.count} {category.count === 1 ? 'transação' : 'transações'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(category.total)}</div>
                      <div className="text-sm text-muted-foreground">
                        {category.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de Transações */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">
                Todas as Transações ({data.transactions.length})
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {data.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: transaction.category.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.category.name} •{' '}
                          {formatDate(new Date(transaction.transactionDate))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(transaction.status)}
                      <div className="font-semibold text-right min-w-[100px]">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Nenhum dado disponível
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

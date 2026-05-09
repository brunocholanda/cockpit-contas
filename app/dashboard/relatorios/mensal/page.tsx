'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TrendingDown,
  TrendingUp,
  CreditCard,
  Wallet,
  Loader2,
  Calendar,
  ArrowRightLeft,
} from 'lucide-react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Categoria {
  name: string;
  color: string;
  total: number;
  percentage: number;
}

interface Transacao {
  id: string;
  description: string;
  amount: number;
  transactionDate: string;
  status: string;
  paymentMethod?: string;
  installmentNumber: number;
  totalInstallments: number;
  category: {
    name: string;
    color: string;
    icon: string;
    type?: string;
    parent?: { name: string } | null;
  };
}

interface Fatura {
  cartao: {
    id: string;
    name: string;
    brand: string;
    lastFourDigits: string;
    closingDay: number;
    dueDay: number;
    isActive: boolean;
  };
  periodo: { inicio: string; fim: string };
  total: number;
  transacoes: Transacao[];
}

interface RelatorioMensal {
  month: string;
  year: number;
  summary: {
    totalDespesas: number;
    despesasNormais: number;
    totalCredito: number;
    receitas: number;
    saldo: number;
  };
  transacoesNormais: Transacao[];
  faturas: Fatura[];
  categorias: Categoria[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  DEBITO: 'Débito',
  CREDITO: 'Crédito',
  IMPOSTO: 'Imposto',
};

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'PAGO' ? 'default' : status === 'PENDENTE' ? 'secondary' : 'destructive';
  return <Badge variant={variant}>{status}</Badge>;
}

function TransacoesTable({ transacoes }: { transacoes: Transacao[] }) {
  if (transacoes.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhuma transação no período.
      </p>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Parcelas</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transacoes.map((t) => (
          <TableRow key={t.id}>
            <TableCell className="whitespace-nowrap text-sm">
              {formatDate(t.transactionDate)}
            </TableCell>
            <TableCell>
              <div className="font-medium">{t.description}</div>
              {t.paymentMethod && (
                <div className="text-xs text-muted-foreground">
                  {PAYMENT_METHOD_LABEL[t.paymentMethod] ?? t.paymentMethod}
                </div>
              )}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                style={{ borderColor: t.category.color, color: t.category.color }}
              >
                {t.category.parent?.name && (
                  <span className="opacity-70">{t.category.parent.name} › </span>
                )}
                {t.category.name}
              </Badge>
            </TableCell>
            <TableCell>
              {t.totalInstallments > 1 && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {t.installmentNumber}/{t.totalInstallments}x
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge status={t.status} />
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(t.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function RelatorioMensalPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [data, setData] = useState<RelatorioMensal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/relatorios/mensal?month=${selectedMonth}&year=${selectedYear}`
        );
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error('Erro ao buscar relatório:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear]);

  const summary = data?.summary;
  const saldoPositivo = (summary?.saldo ?? 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatório Mensal</h1>
          <p className="text-muted-foreground">
            Custo total do mês incluindo faturas de cartão de crédito
          </p>
        </div>

        {/* Seletor de Mês / Ano */}
        <div className="flex gap-2">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(v) => setSelectedMonth(parseInt(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
              ].map((m, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !data ? (
        <p className="text-center text-muted-foreground">Erro ao carregar dados.</p>
      ) : (
        <>
          {/* ── KPI Cards ─────────────────────────────────────────────────── */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary!.totalDespesas)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Débito + Cartão de Crédito
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Débito / Pix / Outros</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary!.despesasNormais)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.transacoesNormais.filter((t) => t.category.type === 'DESPESA').length} transações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cartão de Crédito</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(summary!.totalCredito)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {data.faturas.length} fatura{data.faturas.length !== 1 ? 's' : ''} no período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
                {saldoPositivo ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${saldoPositivo ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(summary!.saldo)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Receitas: {formatCurrency(summary!.receitas)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Faturas de Cartão de Crédito ──────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Faturas de Cartão de Crédito</h2>

            {data.faturas.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <CreditCard className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma fatura de cartão de crédito em {data.month} de {data.year}.
                  </p>
                </CardContent>
              </Card>
            ) : (
              data.faturas.map((fatura) => (
                <Card key={fatura.cartao.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{fatura.cartao.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {fatura.cartao.brand} •••• {fatura.cartao.lastFourDigits}
                            {' · '}Fecha dia {fatura.cartao.closingDay}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(fatura.total)}
                        </p>
                        <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {fatura.periodo.inicio} → {fatura.periodo.fim}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <TransacoesTable transacoes={fatura.transacoes} />
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* ── Transações Normais ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Outras Transações do Mês</h2>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Débito, Pix, Imposto e Receitas — {data.month} de {data.year}
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <TransacoesTable transacoes={data.transacoesNormais} />
              </CardContent>
            </Card>
          </div>

          {/* ── Breakdown por Categoria ────────────────────────────────────── */}
          {data.categorias.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Gastos por Categoria</h2>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  {data.categorias.map((cat) => (
                    <div key={cat.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground text-xs">
                            {cat.percentage.toFixed(1)}%
                          </span>
                          <span className="font-semibold w-28 text-right">
                            {formatCurrency(cat.total)}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

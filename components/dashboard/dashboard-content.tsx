'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, AlertTriangle } from 'lucide-react';
import { MonthlyReportDialog } from './monthly-report-dialog';

interface DashboardStats {
  monthlyExpenses: number;
  previousMonthExpenses: number;
  momVariation: number;
  budget: number;
  pendingTransactions: number;
  averageMonthly: number;
  monthlyIncome: number | null;
  incomeCommitmentRate: number | null;
  criticalCategories: CriticalCategoryData[];
}

interface CriticalCategoryData {
  name: string;
  color: string;
  currentMonth: number;
  previousMonth: number;
  variation: number;
}

interface CategoryBudget {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  planned: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

interface Alert {
  type: 'budget' | 'outlier';
  severity: 'warning' | 'critical';
  category?: string;
  categoryColor?: string;
  message: string;
  details?: {
    spent?: number;
    planned?: number;
    percentageUsed?: number;
    transactionDescription?: string;
    transactionAmount?: number;
    averageAmount?: number;
  };
}

interface CategoryExpense {
  name: string;
  value: number;
  color: string;
}

interface MonthlyData {
  month: string;
  value: number;
  monthNumber: number;
  year: number;
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryExpense[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonthData, setSelectedMonthData] = useState<{ month: number; year: number } | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, categoryRes, monthlyRes, budgetsRes, alertsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/expenses-by-category'),
          fetch('/api/dashboard/monthly-trend'),
          fetch('/api/dashboard/category-budgets'),
          fetch('/api/dashboard/alerts'),
        ]);

        const statsData = await statsRes.json();
        const categoryDataResponse = await categoryRes.json();
        const monthlyDataResponse = await monthlyRes.json();
        const budgetsDataResponse = await budgetsRes.json();
        const alertsDataResponse = await alertsRes.json();

        setStats(statsData);
        setCategoryData(Array.isArray(categoryDataResponse) ? categoryDataResponse : []);
        setMonthlyData(Array.isArray(monthlyDataResponse) ? monthlyDataResponse : []);
        setCategoryBudgets(Array.isArray(budgetsDataResponse) ? budgetsDataResponse : []);
        setAlerts(Array.isArray(alertsDataResponse) ? alertsDataResponse : []);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando dados...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Erro ao carregar dados</div>
      </div>
    );
  }

  const budgetPercentage = stats.budget > 0 ? (stats.monthlyExpenses / stats.budget) * 100 : 0;
  const isOverBudget = budgetPercentage > 100;

  const handleBarClick = (data: any) => {
    if (data && data.monthNumber && data.year) {
      setSelectedMonthData({ month: data.monthNumber, year: data.year });
      setReportDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos (Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyExpenses)}</div>
            <p className="text-xs flex items-center gap-1">
              {stats.momVariation > 0 ? (
                <span className="flex items-center gap-1 text-red-600">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.momVariation.toFixed(1)}% vs mês anterior
                </span>
              ) : stats.momVariation < 0 ? (
                <span className="flex items-center gap-1 text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  {stats.momVariation.toFixed(1)}% vs mês anterior
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Igual ao mês anterior
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget do Mês</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.budget > 0 ? formatCurrency(stats.budget) : 'Não configurado'}
            </div>
            {stats.budget > 0 && (
              <p className={`text-xs ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {budgetPercentage.toFixed(0)}% utilizado
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingTransactions > 0 ? 'Requer atenção' : 'Nenhuma pendência'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comprometimento de Renda</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.incomeCommitmentRate !== null ? (
              <>
                <div className="text-2xl font-bold">{stats.incomeCommitmentRate.toFixed(1)}%</div>
                <div className="mt-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        stats.incomeCommitmentRate <= 70
                          ? 'bg-green-500'
                          : stats.incomeCommitmentRate <= 85
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(stats.incomeCommitmentRate, 100)}%` }}
                    />
                  </div>
                </div>
                <p className={`text-xs mt-1 ${
                  stats.incomeCommitmentRate <= 70
                    ? 'text-green-600'
                    : stats.incomeCommitmentRate <= 85
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {stats.incomeCommitmentRate <= 70
                    ? 'Dentro da meta saudável (≤70%)'
                    : stats.incomeCommitmentRate <= 85
                    ? 'Atenção: acima da meta'
                    : 'Crítico: muito acima da meta'}
                </p>
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground">Não configurada</div>
                <p className="text-xs text-muted-foreground mt-1">Configure sua renda mensal</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Variação por Categorias Críticas */}
      {stats.criticalCategories && stats.criticalCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variação por Categoria Crítica (MoM)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {stats.criticalCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    {category.variation !== 0 && (
                      <span className={`text-xs flex items-center gap-1 ${
                        category.variation > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {category.variation > 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3" />
                            +{category.variation.toFixed(1)}%
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3" />
                            {category.variation.toFixed(1)}%
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Mês atual:</span>
                      <span className="font-medium">{formatCurrency(category.currentMonth)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Mês anterior:</span>
                      <span>{formatCurrency(category.previousMonth)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas Inteligentes */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="h-5 w-5" />
              Alertas Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    alert.severity === 'critical'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {alert.categoryColor && (
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: alert.categoryColor }}
                        />
                      )}
                      <p
                        className={`text-sm font-medium ${
                          alert.severity === 'critical' ? 'text-red-900' : 'text-yellow-900'
                        }`}
                      >
                        {alert.message}
                      </p>
                    </div>
                    {alert.details && (
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        {alert.type === 'budget' && alert.details.spent && alert.details.planned && (
                          <p>
                            Gasto: {formatCurrency(alert.details.spent)} / Planejado:{' '}
                            {formatCurrency(alert.details.planned)}
                          </p>
                        )}
                        {alert.type === 'outlier' &&
                          alert.details.transactionDescription &&
                          alert.details.transactionAmount && (
                            <p>
                              "{alert.details.transactionDescription}" - {formatCurrency(alert.details.transactionAmount)}
                              {alert.details.averageAmount && (
                                <> (média: {formatCurrency(alert.details.averageAmount)})</>
                              )}
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orçamento por Categoria - Budget vs Real */}
      {categoryBudgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Orçamento por Categoria - Budget vs Real</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={categoryBudgets}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="categoryName" type="category" width={110} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                />
                <Legend />
                <Bar dataKey="planned" name="Planejado" fill="#94a3b8" stackId="a" />
                <Bar
                  dataKey="spent"
                  name="Executado"
                  stackId="a"
                  fill={(entry: any) => (entry.isOverBudget ? '#ef4444' : '#10b981')}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryBudgets.map((budget, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: budget.categoryColor }}
                    />
                    <span className="font-medium">{budget.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {budget.percentageUsed.toFixed(0)}% usado
                    </span>
                    <span
                      className={`font-medium ${
                        budget.isOverBudget ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {budget.isOverBudget ? '-' : '+'}
                      {formatCurrency(Math.abs(budget.remaining))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gráfico de Pizza - Gastos por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(categoryData) && categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Array.isArray(categoryData) && categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Evolução Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(monthlyData) && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Gastos"
                    fill="#8B5CF6"
                    onClick={handleBarClick}
                    cursor="pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Categorias */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Categorias (Mês Atual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.isArray(categoryData) && categoryData.length > 0 ? (
              categoryData.slice(0, 5).map((category, index) => {
                const percentage = stats?.monthlyExpenses && stats.monthlyExpenses > 0
                  ? (category.value / stats.monthlyExpenses) * 100
                  : 0;

                return (
                  <div key={index} className="flex items-center">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm font-bold">
                          {formatCurrency(category.value)}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}% do total
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                Nenhuma categoria com gastos no período
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Relatório Mensal */}
      <MonthlyReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        monthData={selectedMonthData}
      />
    </div>
  );
}

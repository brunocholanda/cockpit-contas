'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Search, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { TransactionDialog } from '@/components/transactions/transaction-dialog';
import { DeleteTransactionDialog } from '@/components/transactions/delete-transaction-dialog';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  transactionDate: string;
  type: string;
  status: string;
  paymentMethod: string;
  installmentNumber: number;
  totalInstallments: number;
  categoryId?: string;
  category: {
    name: string;
    color: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  search: string;
  mes: string;
  categoryId: string;
  paymentMethod: string;
}

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    mes: '',
    categoryId: '',
    paymentMethod: '',
  });

  // Estados para os dialogs
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };

    fetchCategories();
  }, []);

  const buildQueryString = (page: number = 1) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '50');

    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.categoryId) {
      params.append('categoryId', filters.categoryId);
    }

    if (filters.paymentMethod) {
      params.append('paymentMethod', filters.paymentMethod);
    }

    if (filters.mes) {
      // Converter mes (YYYY-MM) para startDate e endDate em UTC
      const [year, month] = filters.mes.split('-').map(Number);
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());
    }

    return params.toString();
  };

  const updateOverdueInstallments = async () => {
    try {
      await fetch('/api/transactions/update-status', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Erro ao atualizar status das parcelas:', error);
    }
  };

  const fetchTransactions = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Atualizar status de parcelas vencidas antes de buscar
      await updateOverdueInstallments();

      const queryString = buildQueryString(page);
      const response = await fetch(`/api/transactions?${queryString}`);

      if (!response.ok) {
        throw new Error('Erro ao buscar transações');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setTransactions(data.transactions || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
      });
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      setError(error instanceof Error ? error.message : 'Erro ao buscar transações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      mes: '',
      categoryId: '',
      paymentMethod: '',
    });
  };

  const hasActiveFilters = () => {
    return filters.search || filters.mes || filters.categoryId || filters.paymentMethod;
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setTransactionDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction({
      ...transaction,
      categoryId: transaction.category ? (transaction as any).categoryId : undefined,
    });
    setTransactionDialogOpen(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleTransactionSuccess = () => {
    fetchTransactions(pagination.page);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PAGO: { label: 'Pago', variant: 'default' },
      PENDENTE: { label: 'Pendente', variant: 'secondary' },
      ATRASADO: { label: 'Atrasado', variant: 'destructive' },
    };

    const config = variants[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      DEBITO: 'Débito',
      CREDITO: 'Crédito',
      IMPOSTO: 'Imposto',
    };

    return labels[method] || method;
  };

  // Gerar lista de meses (últimos 18 meses)
  const generateMonthOptions = () => {
    const months = [];
    const now = new Date();

    for (let i = 0; i < 18; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      months.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }

    return months;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">
            Histórico completo de suas transações
          </p>
        </div>
        <Button onClick={handleNewTransaction}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Busca por nome */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>

            {/* Filtro de mês */}
            <Select
              value={filters.mes || 'all'}
              onValueChange={(value) => setFilters({ ...filters, mes: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os meses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {generateMonthOptions().map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de categoria */}
            <Select
              value={filters.categoryId || 'all'}
              onValueChange={(value) => setFilters({ ...filters, categoryId: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro de tipo de pagamento */}
            <Select
              value={filters.paymentMethod || 'all'}
              onValueChange={(value) => setFilters({ ...filters, paymentMethod: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="DEBITO">Débito</SelectItem>
                <SelectItem value="CREDITO">Crédito</SelectItem>
                <SelectItem value="IMPOSTO">Imposto</SelectItem>
              </SelectContent>
            </Select>

            {/* Botão limpar filtros */}
            {hasActiveFilters() && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Transações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {hasActiveFilters() ? 'Resultados Filtrados' : 'Todas as Transações'}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {pagination.total} {pagination.total === 1 ? 'transação' : 'transações'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Carregando transações...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="text-destructive">{error}</div>
              <Button onClick={() => fetchTransactions()} variant="outline" size="sm">
                Tentar novamente
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="text-muted-foreground">Nenhuma transação encontrada</div>
              {hasActiveFilters() && (
                <Button onClick={handleClearFilters} variant="outline" size="sm">
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {formatDate(new Date(transaction.transactionDate))}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{transaction.description}</span>
                            {transaction.totalInstallments > 1 && (
                              <Badge variant="outline" className="gap-1 bg-purple-50 text-purple-700 border-purple-200">
                                {transaction.installmentNumber}/{transaction.totalInstallments}x
                              </Badge>
                            )}
                            {transaction.type === 'CARTAO_CREDITO' && (
                              <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                                Cartão
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: transaction.category.color }}
                            />
                            <span className="text-sm">
                              {(transaction.category as any).parent?.name && (
                                <span className="text-muted-foreground">
                                  {(transaction.category as any).parent.name} ›
                                </span>
                              )}
                              {transaction.category.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getPaymentMethodLabel(transaction.paymentMethod)}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                              title={
                                transaction.totalInstallments > 1
                                  ? transaction.installmentNumber === 1
                                    ? "Editar todas as parcelas"
                                    : "Apenas a primeira parcela pode ser editada"
                                  : "Editar"
                              }
                              disabled={transaction.totalInstallments > 1 && transaction.installmentNumber !== 1}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction)}
                              title={transaction.totalInstallments > 1 ? "Deletar todas as parcelas" : "Deletar"}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchTransactions(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchTransactions(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
        transaction={editingTransaction}
        categories={categories}
        onSuccess={handleTransactionSuccess}
      />

      {deletingTransaction && (
        <DeleteTransactionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          transactionId={deletingTransaction.id}
          transactionDescription={deletingTransaction.description}
          onSuccess={handleTransactionSuccess}
        />
      )}
    </div>
  );
}

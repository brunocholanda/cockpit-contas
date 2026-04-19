'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, CreditCard as CreditCardIcon, DollarSign, Loader2, Calendar } from 'lucide-react';
import { CreditCardDialog } from '@/components/credit-cards/credit-card-dialog';
import { DeleteCreditCardDialog } from '@/components/credit-cards/delete-credit-card-dialog';
import { CreditCardItem } from '@/components/credit-cards/credit-card-item';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CreditCard {
  id: string;
  name: string;
  brand: string;
  lastFourDigits: string;
  creditLimit: number;
  closingDay: number;
  dueDay: number;
  isActive: boolean;
  currentUsage: number;
  availableLimit: number;
  usagePercentage: number;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  transactionDate: string;
  status: string;
  installmentNumber: number;
  totalInstallments: number;
  category: {
    name: string;
    color: string;
    icon: string;
  };
  creditCard?: {
    id: string;
    name: string;
    brand: string;
    lastFourDigits: string;
  };
}

export default function CartoesPage() {
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');

  // Estado para o mês/ano selecionado
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Estados para os dialogs
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCard, setDeletingCard] = useState<CreditCard | null>(null);

  // Fetch credit cards
  const fetchCreditCards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('isActive', filter === 'active' ? 'true' : 'false');
      }
      params.append('month', selectedMonth.toString());
      params.append('year', selectedYear.toString());

      const response = await fetch(`/api/credit-cards?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCreditCards(data.creditCards || []);
      }
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch credit card transactions
  const fetchCreditCardTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await fetch('/api/transactions?page=1&limit=200');
      if (response.ok) {
        const data = await response.json();

        // Pegar primeiro e último dia do mês selecionado
        const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
        const lastDay = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

        // Filtrar apenas transações de cartão de crédito do mês selecionado
        const creditCardTransactions = (data.transactions || []).filter(
          (t: Transaction) => {
            if (!t.creditCard) return false;
            const transactionDate = new Date(t.transactionDate);
            return transactionDate >= firstDay && transactionDate <= lastDay;
          }
        );
        setTransactions(creditCardTransactions);
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchCreditCards();
    fetchCreditCardTransactions();
  }, [filter, selectedMonth, selectedYear]);

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card);
    setCardDialogOpen(true);
  };

  const handleDelete = (card: CreditCard) => {
    setDeletingCard(card);
    setDeleteDialogOpen(true);
  };

  const handleViewInvoices = (card: CreditCard) => {
    // TODO: Implementar visualização de faturas
    console.log('Ver faturas do cartão:', card.id);
  };

  const handleSuccess = () => {
    fetchCreditCards();
    fetchCreditCardTransactions();
    setEditingCard(null);
    setDeletingCard(null);
  };

  // Calcular estatísticas
  const activeCards = creditCards.filter((c) => c.isActive);
  const totalLimit = activeCards.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalUsed = activeCards.reduce((sum, c) => sum + c.currentUsage, 0);
  const totalAvailable = totalLimit - totalUsed;
  const averageUsage = activeCards.length > 0 ? (totalUsed / totalLimit) * 100 : 0;

  // Verificar se está visualizando o mês atual
  const isCurrentMonth = selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  // Nome do mês por extenso
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const selectedMonthName = monthNames[selectedMonth - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito</h1>
          <p className="text-muted-foreground">
            Gerencie seus cartões e acompanhe suas faturas
          </p>
        </div>
        <Button onClick={() => setCardDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cartão
        </Button>
      </div>

      {/* Indicador de Período */}
      {!isCurrentMonth && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Visualizando: {selectedMonthName} de {selectedYear}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedMonth(now.getMonth() + 1);
                setSelectedYear(now.getFullYear());
              }}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              Voltar ao mês atual
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartões Ativos</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCards.length}</div>
            <p className="text-xs text-muted-foreground">
              {creditCards.length - activeCards.length} inativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limite Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLimit)}</div>
            <p className="text-xs text-muted-foreground">Soma de todos os cartões</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isCurrentMonth ? 'Total Usado' : `Usado em ${selectedMonthName}`}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUsed)}</div>
            <p className="text-xs text-muted-foreground">
              {averageUsage.toFixed(1)}% do limite
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponível</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAvailable)}</div>
            <p className="text-xs text-muted-foreground">Limite restante</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Meus Cartões</h2>
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Credit Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : creditCards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CreditCardIcon className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Nenhum cartão encontrado</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Comece adicionando seus cartões de crédito para gerenciar faturas.
            </p>
            <Button onClick={() => setCardDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Cartão
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {creditCards.map((card) => (
            <CreditCardItem
              key={card.id}
              card={card}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewInvoices={handleViewInvoices}
            />
          ))}
        </div>
      )}

      {/* Credit Card Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Transações de Cartão de Crédito</h2>

          {/* Seletor de Mês/Ano */}
          <div className="flex gap-2 items-center">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Janeiro</SelectItem>
                <SelectItem value="2">Fevereiro</SelectItem>
                <SelectItem value="3">Março</SelectItem>
                <SelectItem value="4">Abril</SelectItem>
                <SelectItem value="5">Maio</SelectItem>
                <SelectItem value="6">Junho</SelectItem>
                <SelectItem value="7">Julho</SelectItem>
                <SelectItem value="8">Agosto</SelectItem>
                <SelectItem value="9">Setembro</SelectItem>
                <SelectItem value="10">Outubro</SelectItem>
                <SelectItem value="11">Novembro</SelectItem>
                <SelectItem value="12">Dezembro</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loadingTransactions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCardIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Nenhuma transação encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Transações do tipo "Cartão de Crédito" aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cartão</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Parcelas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(transaction.transactionDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.description}</div>
                      </TableCell>
                      <TableCell>
                        {transaction.creditCard && (
                          <div className="text-sm">
                            <div className="font-medium">{transaction.creditCard.name}</div>
                            <div className="text-muted-foreground">
                              {transaction.creditCard.brand} •••• {transaction.creditCard.lastFourDigits}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: transaction.category.color,
                            color: transaction.category.color,
                          }}
                        >
                          {(transaction.category as any).parent?.name && (
                            <span className="opacity-70">
                              {(transaction.category as any).parent.name} ›{' '}
                            </span>
                          )}
                          {transaction.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.totalInstallments > 1 && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {transaction.installmentNumber}/{transaction.totalInstallments}x
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === 'PAGO'
                              ? 'default'
                              : transaction.status === 'PENDENTE'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <CreditCardDialog
        open={cardDialogOpen}
        onOpenChange={(open) => {
          setCardDialogOpen(open);
          if (!open) setEditingCard(null);
        }}
        card={editingCard}
        onSuccess={handleSuccess}
      />

      <DeleteCreditCardDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        card={deletingCard}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

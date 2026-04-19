'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface Category {
  id: string;
  name: string;
  color: string;
  parentId?: string | null;
  children?: Category[];
}

interface CreditCard {
  id: string;
  name: string;
  brand: string;
  lastFourDigits: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  transactionDate: string;
  status: string;
  paymentMethod: string;
  categoryId?: string;
  category?: {
    name: string;
  };
}

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  categories: Category[];
  onSuccess: () => void;
}

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  categories,
  onSuccess,
}: TransactionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
  const [availableSubcategories, setAvailableSubcategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    transactionDate: '',
    categoryId: '',
    creditCardId: '',
    type: 'NORMAL',
    status: 'PAGO',
    paymentMethod: 'DEBITO',
    isInstallment: false,
    totalInstallments: '1',
  });

  // Buscar cartões de crédito
  useEffect(() => {
    const fetchCreditCards = async () => {
      try {
        const response = await fetch('/api/credit-cards?isActive=true');
        if (response.ok) {
          const data = await response.json();
          setCreditCards(data.creditCards || []);
        }
      } catch (error) {
        console.error('Erro ao buscar cartões:', error);
      }
    };

    if (open) {
      fetchCreditCards();
    }
  }, [open]);

  // Preencher formulário quando estiver editando
  useEffect(() => {
    if (transaction) {
      // Converter data usando UTC para evitar problema de timezone
      const date = new Date(transaction.transactionDate);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      setFormData({
        description: transaction.description,
        amount: transaction.amount.toString(),
        transactionDate: formattedDate,
        categoryId: transaction.categoryId || '',
        creditCardId: (transaction as any).creditCardId || '',
        type: (transaction as any).type || 'NORMAL',
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        isInstallment: (transaction as any).totalInstallments > 1,
        totalInstallments: ((transaction as any).totalInstallments || 1).toString(),
      });

      // Encontrar a categoria pai se categoryId for uma subcategoria
      if (transaction.categoryId) {
        const selectedCategory = categories.find(c => c.id === transaction.categoryId);
        if (selectedCategory?.parentId) {
          // É uma subcategoria
          setSelectedParentCategory(selectedCategory.parentId);
          const parent = categories.find(c => c.id === selectedCategory.parentId);
          setAvailableSubcategories(parent?.children || []);
        } else if (selectedCategory?.children && selectedCategory.children.length > 0) {
          // É uma categoria pai com subcategorias
          setSelectedParentCategory(selectedCategory.id);
          setAvailableSubcategories(selectedCategory.children);
        } else {
          // Categoria sem subcategorias
          setSelectedParentCategory('');
          setAvailableSubcategories([]);
        }
      }
    } else {
      // Resetar formulário com data local
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      setFormData({
        description: '',
        amount: '',
        transactionDate: formattedDate,
        categoryId: '',
        creditCardId: '',
        type: 'NORMAL',
        status: 'PAGO',
        paymentMethod: 'DEBITO',
        isInstallment: false,
        totalInstallments: '1',
      });
      setSelectedParentCategory('');
      setAvailableSubcategories([]);
    }
  }, [transaction, open, categories]);

  // Handler para mudança de categoria principal
  const handleParentCategoryChange = (categoryId: string) => {
    setSelectedParentCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);

    if (category?.children && category.children.length > 0) {
      // Tem subcategorias
      setAvailableSubcategories(category.children);
      setFormData({ ...formData, categoryId: '' }); // Resetar subcategoria
    } else {
      // Não tem subcategorias, usar a própria categoria
      setAvailableSubcategories([]);
      setFormData({ ...formData, categoryId: categoryId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar se cartão foi selecionado quando tipo é CARTAO_CREDITO
      if (formData.type === 'CARTAO_CREDITO' && !formData.creditCardId) {
        toast({
          title: 'Erro',
          description: 'Selecione um cartão de crédito para transações do tipo Cartão de Crédito',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const url = transaction
        ? `/api/transactions/${transaction.id}`
        : '/api/transactions';

      const method = transaction ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          totalInstallments: formData.isInstallment ? parseInt(formData.totalInstallments) : 1,
          // Garantir que creditCardId seja enviado apenas quando tipo for CARTAO_CREDITO
          creditCardId: formData.type === 'CARTAO_CREDITO' ? formData.creditCardId : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar transação');
      }

      toast({
        title: transaction ? 'Transação atualizada' : 'Transação criada',
        description: transaction
          ? 'A transação foi atualizada com sucesso.'
          : 'A transação foi criada com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar transação',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transaction
              ? (transaction as any).totalInstallments > 1
                ? `Editar Transação Parcelada (${(transaction as any).totalInstallments}x)`
                : 'Editar Transação'
              : 'Nova Transação'}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? (transaction as any).totalInstallments > 1
                ? 'As alterações serão aplicadas em todas as parcelas desta compra.'
                : 'Atualize as informações da transação.'
              : 'Adicione uma nova transação ao seu histórico.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Descrição */}
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                placeholder="Ex: Compra no mercado"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            {/* Valor */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            {/* Data */}
            <div className="grid gap-2">
              <Label htmlFor="transactionDate">Data *</Label>
              <Input
                id="transactionDate"
                type="date"
                value={formData.transactionDate}
                onChange={(e) =>
                  setFormData({ ...formData, transactionDate: e.target.value })
                }
                required
              />
            </div>

            {/* Categoria Principal */}
            <div className="grid gap-2">
              <Label htmlFor="parentCategory">Categoria *</Label>
              <Select
                value={selectedParentCategory}
                onValueChange={handleParentCategoryChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(cat => !cat.parentId) // Apenas categorias principais
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategoria - aparece apenas se a categoria principal tiver subcategorias */}
            {availableSubcategories.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="subcategory">Subcategoria *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map((subcat) => (
                      <SelectItem key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tipo */}
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Transação *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    type: value,
                    // Se for cartão de crédito, forçar método de pagamento para CREDITO
                    paymentMethod: value === 'CARTAO_CREDITO' ? 'CREDITO' : formData.paymentMethod
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cartão de Crédito */}
            {formData.type === 'CARTAO_CREDITO' && (
              <div className="grid gap-2">
                <Label htmlFor="creditCard">Cartão de Crédito *</Label>
                <Select
                  value={formData.creditCardId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, creditCardId: value })
                  }
                  required={formData.type === 'CARTAO_CREDITO'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    {creditCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name} - {card.brand} •••• {card.lastFourDigits}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Método de Pagamento - Oculto se for cartão de crédito */}
            {formData.type !== 'CARTAO_CREDITO' && (
              <div className="grid gap-2">
                <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBITO">Débito</SelectItem>
                    <SelectItem value="CREDITO">Crédito</SelectItem>
                    <SelectItem value="IMPOSTO">Imposto (IOF, taxas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Compra Parcelada */}
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isInstallment"
                  checked={formData.isInstallment}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      isInstallment: checked as boolean,
                      totalInstallments: checked ? formData.totalInstallments : '1'
                    })
                  }
                  disabled={transaction && (transaction as any).totalInstallments > 1}
                />
                <Label htmlFor="isInstallment" className={transaction && (transaction as any).totalInstallments > 1 ? '' : 'cursor-pointer'}>
                  Compra Parcelada
                </Label>
              </div>
              {transaction && (transaction as any).totalInstallments > 1 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs text-blue-900 font-medium mb-1">
                    ⚠️ Atenção: Edição de Transação Parcelada
                  </p>
                  <p className="text-xs text-blue-700">
                    Esta é a parcela 1/{(transaction as any).totalInstallments}.
                    As alterações serão aplicadas em <strong>todas as {(transaction as any).totalInstallments} parcelas</strong>:
                  </p>
                  <ul className="text-xs text-blue-700 mt-1 ml-4 list-disc space-y-0.5">
                    <li>Valor: cada parcela terá o novo valor dividido</li>
                    <li>Data: calculada automaticamente para cada parcela</li>
                    <li>Descrição, categoria e outros campos serão atualizados em todas</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Número de Parcelas */}
            {formData.isInstallment && (
              <div className="grid gap-2">
                <Label htmlFor="totalInstallments">Número de Parcelas</Label>
                <Input
                  id="totalInstallments"
                  type="number"
                  min="2"
                  max="48"
                  value={formData.totalInstallments}
                  onChange={(e) =>
                    setFormData({ ...formData, totalInstallments: e.target.value })
                  }
                  disabled={transaction && (transaction as any).totalInstallments > 1}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Valor de cada parcela: {formData.amount ?
                    `R$ ${(parseFloat(formData.amount) / parseInt(formData.totalInstallments || '1')).toFixed(2)}` :
                    'R$ 0,00'}
                </p>
              </div>
            )}

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAGO">Pago</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="ATRASADO">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : transaction ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

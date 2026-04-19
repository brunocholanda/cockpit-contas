'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Loader2 } from 'lucide-react';

interface CreditCard {
  id: string;
  name: string;
  brand: string;
  lastFourDigits: string;
  creditLimit: number;
  closingDay: number;
  dueDay: number;
  isActive: boolean;
}

interface CreditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: CreditCard | null;
  onSuccess: () => void;
}

const cardBrands = [
  { value: 'VISA', label: 'Visa' },
  { value: 'MASTERCARD', label: 'Mastercard' },
  { value: 'ELO', label: 'Elo' },
  { value: 'AMEX', label: 'American Express' },
  { value: 'HIPERCARD', label: 'Hipercard' },
  { value: 'OUTRO', label: 'Outro' },
];

export function CreditCardDialog({
  open,
  onOpenChange,
  card,
  onSuccess,
}: CreditCardDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'VISA',
    lastFourDigits: '',
    creditLimit: '',
    closingDay: '',
    dueDay: '',
    isActive: true,
  });

  useEffect(() => {
    if (card) {
      setFormData({
        name: card.name,
        brand: card.brand,
        lastFourDigits: card.lastFourDigits,
        creditLimit: card.creditLimit.toString(),
        closingDay: card.closingDay.toString(),
        dueDay: card.dueDay.toString(),
        isActive: card.isActive,
      });
    } else {
      setFormData({
        name: '',
        brand: 'VISA',
        lastFourDigits: '',
        creditLimit: '',
        closingDay: '',
        dueDay: '',
        isActive: true,
      });
    }
  }, [card, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = card ? `/api/credit-cards/${card.id}` : '/api/credit-cards';
      const method = card ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar cartão');
      }

      toast({
        title: card ? 'Cartão atualizado!' : 'Cartão criado!',
        description: card
          ? 'O cartão foi atualizado com sucesso.'
          : 'O cartão foi criado com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar cartão',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {card ? 'Editar Cartão de Crédito' : 'Novo Cartão de Crédito'}
          </DialogTitle>
          <DialogDescription>
            {card
              ? 'Atualize as informações do cartão.'
              : 'Adicione um novo cartão de crédito para gerenciar suas faturas.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cartão *</Label>
            <Input
              id="name"
              placeholder="Ex: Nubank Pessoal, Itaú Corporativo..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Bandeira *</Label>
              <Select
                value={formData.brand}
                onValueChange={(value) => setFormData({ ...formData, brand: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cardBrands.map((brand) => (
                    <SelectItem key={brand.value} value={brand.value}>
                      {brand.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastFourDigits">Últimos 4 Dígitos *</Label>
              <Input
                id="lastFourDigits"
                placeholder="0000"
                maxLength={4}
                value={formData.lastFourDigits}
                onChange={(e) =>
                  setFormData({ ...formData, lastFourDigits: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creditLimit">Limite de Crédito *</Label>
            <Input
              id="creditLimit"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.creditLimit}
              onChange={(e) =>
                setFormData({ ...formData, creditLimit: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closingDay">Dia de Fechamento *</Label>
              <Input
                id="closingDay"
                type="number"
                min="1"
                max="31"
                placeholder="1-31"
                value={formData.closingDay}
                onChange={(e) =>
                  setFormData({ ...formData, closingDay: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDay">Dia de Vencimento *</Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                placeholder="1-31"
                value={formData.dueDay}
                onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                required
              />
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
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {card ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

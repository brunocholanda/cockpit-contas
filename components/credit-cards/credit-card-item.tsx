'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { CreditCard as CreditCardIcon, Pencil, Trash2, Eye } from 'lucide-react';

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

interface CreditCardItemProps {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
  onDelete: (card: CreditCard) => void;
  onViewInvoices: (card: CreditCard) => void;
}

const brandColors: Record<string, string> = {
  VISA: 'bg-blue-500',
  MASTERCARD: 'bg-orange-500',
  ELO: 'bg-yellow-500',
  AMEX: 'bg-green-500',
  HIPERCARD: 'bg-red-500',
  OUTRO: 'bg-gray-500',
};

export function CreditCardItem({
  card,
  onEdit,
  onDelete,
  onViewInvoices,
}: CreditCardItemProps) {
  const brandColor = brandColors[card.brand] || 'bg-gray-500';
  const usageColor =
    card.usagePercentage > 80
      ? 'text-red-600'
      : card.usagePercentage > 50
      ? 'text-yellow-600'
      : 'text-green-600';

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${brandColor} p-4 text-white`}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5" />
              <h3 className="font-semibold">{card.name}</h3>
            </div>
            <p className="text-sm opacity-90">
              •••• {card.lastFourDigits}
            </p>
          </div>
          <Badge variant={card.isActive ? 'default' : 'secondary'} className="bg-white/20">
            {card.isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Limite e Uso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uso atual</span>
            <span className={`font-semibold ${usageColor}`}>
              {card.usagePercentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={card.usagePercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(card.currentUsage)} usado</span>
            <span>{formatCurrency(card.availableLimit)} disponível</span>
          </div>
        </div>

        {/* Limite Total */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Limite total</span>
          <span className="text-lg font-bold">{formatCurrency(card.creditLimit)}</span>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Fechamento</p>
            <p className="text-sm font-medium">Dia {card.closingDay}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Vencimento</p>
            <p className="text-sm font-medium">Dia {card.dueDay}</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewInvoices(card)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Faturas
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(card)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(card)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CreditCard {
  id: string;
  name: string;
}

interface DeleteCreditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: CreditCard | null;
  onSuccess: () => void;
}

export function DeleteCreditCardDialog({
  open,
  onOpenChange,
  card,
  onSuccess,
}: DeleteCreditCardDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!card) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/credit-cards/${card.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar cartão');
      }

      toast({
        title: 'Cartão deletado!',
        description: 'O cartão foi removido com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar cartão',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja deletar o cartão &quot;{card?.name}&quot;?
            <br />
            <br />
            Esta ação não pode ser desfeita. Todas as faturas e lançamentos deste
            cartão também serão deletados.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deletar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

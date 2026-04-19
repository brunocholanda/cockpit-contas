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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: 'DESPESA' | 'RECEITA';
  icon: string;
  color: string;
  description?: string;
  isActive: boolean;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSuccess: () => void;
}

const iconOptions = [
  { value: 'Circle', label: '⚫ Circle' },
  { value: 'Home', label: '🏠 Home' },
  { value: 'ShoppingCart', label: '🛒 Shopping' },
  { value: 'Car', label: '🚗 Car' },
  { value: 'Utensils', label: '🍽️ Food' },
  { value: 'Plane', label: '✈️ Travel' },
  { value: 'Heart', label: '❤️ Health' },
  { value: 'GraduationCap', label: '🎓 Education' },
  { value: 'Shirt', label: '👕 Clothing' },
  { value: 'Smartphone', label: '📱 Tech' },
  { value: 'Film', label: '🎬 Entertainment' },
  { value: 'Dumbbell', label: '💪 Fitness' },
  { value: 'Briefcase', label: '💼 Work' },
  { value: 'Gift', label: '🎁 Gift' },
  { value: 'DollarSign', label: '💰 Money' },
  { value: 'TrendingUp', label: '📈 Investment' },
  { value: 'CreditCard', label: '💳 Card' },
  { value: 'Zap', label: '⚡ Utilities' },
  { value: 'Droplet', label: '💧 Water' },
  { value: 'Wifi', label: '📡 Internet' },
];

const colorOptions = [
  { value: '#EF4444', label: 'Vermelho' },
  { value: '#F97316', label: 'Laranja' },
  { value: '#F59E0B', label: 'Amarelo' },
  { value: '#10B981', label: 'Verde' },
  { value: '#06B6D4', label: 'Ciano' },
  { value: '#3B82F6', label: 'Azul' },
  { value: '#8B5CF6', label: 'Roxo' },
  { value: '#EC4899', label: 'Rosa' },
  { value: '#6B7280', label: 'Cinza' },
  { value: '#78350F', label: 'Marrom' },
];

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'DESPESA' as 'DESPESA' | 'RECEITA',
    icon: 'Circle',
    color: '#6B7280',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color,
        description: category.description || '',
        isActive: category.isActive,
      });
    } else {
      setFormData({
        name: '',
        type: 'DESPESA',
        icon: 'Circle',
        color: '#6B7280',
        description: '',
        isActive: true,
      });
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = category ? `/api/categories/${category.id}` : '/api/categories';
      const method = category ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar categoria');
      }

      toast({
        title: category ? 'Categoria atualizada!' : 'Categoria criada!',
        description: category
          ? 'A categoria foi atualizada com sucesso.'
          : 'A categoria foi criada com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar categoria',
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
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {category
              ? 'Atualize as informações da categoria.'
              : 'Crie uma nova categoria para organizar suas transações.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria *</Label>
            <Input
              id="name"
              placeholder="Ex: Alimentação, Transporte, Salário..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'DESPESA' | 'RECEITA') =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DESPESA">Despesa</SelectItem>
                <SelectItem value="RECEITA">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Ícone</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      {icon.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Informações adicionais sobre a categoria..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
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
              {category ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

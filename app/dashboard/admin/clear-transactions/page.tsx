'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClearTransactionsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleClearTransactions = async () => {
    if (!confirm('Tem certeza que deseja apagar TODAS as transações? Esta ação não pode ser desfeita!')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/transactions/clear', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ ${data.count} transações foram deletadas com sucesso!`);
        toast({
          title: 'Sucesso',
          description: `${data.count} transações foram deletadas`,
        });
      } else {
        throw new Error(data.error || 'Erro ao deletar transações');
      }
    } catch (error) {
      console.error('Erro:', error);
      setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao deletar transações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
        <p className="text-muted-foreground">
          Ferramentas administrativas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apagar Todas as Transações</CardTitle>
          <CardDescription>
            Esta ação irá deletar TODAS as suas transações permanentemente. Use com cuidado!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleClearTransactions}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Apagando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Apagar Todas as Transações
              </>
            )}
          </Button>

          {result && (
            <div className="p-4 rounded-md bg-muted">
              <p className="text-sm font-mono">{result}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

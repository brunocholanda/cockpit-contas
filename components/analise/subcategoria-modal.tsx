'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Subcategoria {
  id: string;
  nome: string;
  color: string;
  total: number;
  percentualDaCategoria: number;
  transacoes: number;
}

interface SubcategoriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoriaNome: string;
  categoriaColor: string;
  categoriaTotal: number;
  subcategorias: Subcategoria[];
}

export function SubcategoriaModal({
  open,
  onOpenChange,
  categoriaNome,
  categoriaColor,
  categoriaTotal,
  subcategorias,
}: SubcategoriaModalProps) {
  if (!subcategorias || subcategorias.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: categoriaColor }}
            />
            Detalhamento: {categoriaNome}
          </DialogTitle>
          <DialogDescription>
            Total da categoria: <strong>{formatCurrency(categoriaTotal)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Gráfico de Barras */}
          <div>
            <h3 className="text-sm font-medium mb-3">Distribuição por Subcategoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={subcategorias}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nome" type="category" width={110} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px' }}
                />
                <Bar dataKey="total" name="Total">
                  {subcategorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoriaColor} opacity={0.9 - (index * 0.1)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabela Detalhada */}
          <div>
            <h3 className="text-sm font-medium mb-3">Detalhes</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subcategoria</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">% da Categoria</TableHead>
                    <TableHead className="text-right">Transações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategorias.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.nome}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(sub.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-muted-foreground">
                          {sub.percentualDaCategoria.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {sub.transacoes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Resumo */}
          <div className="p-4 bg-muted rounded-lg text-sm">
            <p>
              <strong>Subcategoria dominante:</strong> {subcategorias[0]?.nome} representa{' '}
              {subcategorias[0]?.percentualDaCategoria.toFixed(1)}% do total de {categoriaNome}.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
  LineChart, Line, Legend,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EvolucaoItem { mes: string; valor: number; }

interface SubcategoriaPerf {
  id: string;
  nome: string;
  color: string;
  total: number;
  percentualDaCategoria: number;
  transacoes: number;
  evolucao: EvolucaoItem[];
}

export interface CategoriaEvolucaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nome: string;
  color: string;
  evolucao: EvolucaoItem[];
  mediaMensal: number;
  tendencia: 'crescente' | 'decrescente' | 'estavel';
  subcategorias?: SubcategoriaPerf[];
  meses: number;
  isSubcategoria?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildGrid(evolucao: EvolucaoItem[], meses: number) {
  const now = new Date();
  return Array.from({ length: meses }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (meses - 1 - i), 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' });
    const found = evolucao.find(e => e.mes === key);
    return {
      mes: key,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      valor: found?.valor || 0,
    };
  });
}

// ─── Custom Tooltip para o BarChart ──────────────────────────────────────────

function CustomBarTooltip({ active, payload, label, media, color }: any) {
  if (!active || !payload?.length) return null;
  const valor = payload[0]?.value || 0;
  const vsMedia = media > 0 ? ((valor - media) / media) * 100 : 0;
  return (
    <div className="bg-white border rounded-lg p-3 shadow-lg text-sm min-w-[160px]">
      <p className="font-semibold mb-2 text-foreground">{label}</p>
      <p className="text-foreground text-base font-bold">{formatCurrency(valor)}</p>
      {valor > 0 && media > 0 && (
        <p className={`text-xs mt-1 ${vsMedia >= 0 ? 'text-red-600' : 'text-green-600'}`}>
          {vsMedia >= 0 ? '▲' : '▼'} {Math.abs(vsMedia).toFixed(1)}% vs média
        </p>
      )}
    </div>
  );
}

// ─── Custom Tooltip para o StackedChart ──────────────────────────────────────

function CustomStackedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0);
  return (
    <div className="bg-white border rounded-lg p-3 shadow-lg text-sm min-w-[180px]">
      <p className="font-semibold mb-2">{label}</p>
      <p className="font-bold mb-2">{formatCurrency(total)}</p>
      {payload.map((p: any) =>
        p.value > 0 ? (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
              {p.dataKey}
            </span>
            <span>{formatCurrency(p.value)}</span>
          </div>
        ) : null
      )}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export function CategoriaEvolucaoModal({
  open,
  onOpenChange,
  nome,
  color,
  evolucao,
  mediaMensal,
  tendencia,
  subcategorias = [],
  meses,
  isSubcategoria = false,
}: CategoriaEvolucaoModalProps) {

  const grid = useMemo(() => buildGrid(evolucao, meses), [evolucao, meses]);

  // Média real (meses com valor)
  const mesesComValor = grid.filter(m => m.valor > 0);
  const media = mesesComValor.length > 0
    ? mesesComValor.reduce((s, m) => s + m.valor, 0) / mesesComValor.length
    : 0;

  const total = grid.reduce((s, m) => s + m.valor, 0);
  const maxMes = grid.reduce((max, m) => m.valor > max.valor ? m : max, grid[0] || { label: '—', valor: 0 });
  const minMes = mesesComValor.length > 0
    ? mesesComValor.reduce((min, m) => m.valor < min.valor ? m : min, mesesComValor[0])
    : { label: '—', valor: 0 };

  // Dados com média móvel de 3 meses
  const chartDataWithMM = useMemo(() => {
    return grid.map((m, i) => {
      const mm3 = i >= 2
        ? (grid[i].valor + grid[i - 1].valor + grid[i - 2].valor) / 3
        : null;
      return { ...m, mm3 };
    });
  }, [grid]);

  // Stacked data para subcategorias
  const stackedData = useMemo(() => {
    if (!subcategorias.length) return [];
    const now = new Date();
    return Array.from({ length: meses }, (_, i) => {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (meses - 1 - i), 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' });
      const row: Record<string, any> = {
        mes: key,
        label: label.charAt(0).toUpperCase() + label.slice(1),
      };
      subcategorias.forEach(sub => {
        const found = (sub.evolucao || []).find(e => e.mes === key);
        row[sub.nome] = found?.valor || 0;
      });
      return row;
    });
  }, [subcategorias, meses]);

  const TendenciaDisplay = () => {
    if (tendencia === 'crescente') return (
      <span className="flex items-center gap-1 text-red-600 font-semibold text-sm">
        <TrendingUp className="h-4 w-4" /> Crescente
      </span>
    );
    if (tendencia === 'decrescente') return (
      <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
        <TrendingDown className="h-4 w-4" /> Decrescente
      </span>
    );
    return (
      <span className="flex items-center gap-1 text-gray-500 font-semibold text-sm">
        <Minus className="h-4 w-4" /> Estável
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {nome}
            {isSubcategoria && (
              <Badge variant="outline" className="text-xs font-normal">Subcategoria</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Evolução dos últimos {meses} meses
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">

          {/* ── KPIs ────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total {meses}m</p>
              <p className="text-lg font-bold">{formatCurrency(total)}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Média/mês</p>
              <p className="text-lg font-bold">{formatCurrency(media)}</p>
            </div>
            <div className="rounded-lg border p-3 text-center bg-red-50/50">
              <p className="text-xs text-muted-foreground mb-1">Maior mês</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(maxMes.valor)}</p>
              <p className="text-xs text-muted-foreground">{maxMes.label}</p>
            </div>
            <div className="rounded-lg border p-3 text-center bg-green-50/50">
              <p className="text-xs text-muted-foreground mb-1">Menor mês</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(minMes.valor)}</p>
              <p className="text-xs text-muted-foreground">{minMes.label}</p>
            </div>
          </div>

          {/* ── Gráfico de barras principal ──────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Evolução Mensal</h3>
              <TendenciaDisplay />
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartDataWithMM} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip content={<CustomBarTooltip media={media} color={color} />} />
                <ReferenceLine
                  y={media}
                  stroke="#9CA3AF"
                  strokeDasharray="6 3"
                  label={{ value: 'Média', position: 'insideTopRight', fontSize: 11, fill: '#9CA3AF' }}
                />
                <Bar dataKey="valor" name="Gasto" radius={[4, 4, 0, 0]} maxBarSize={52}>
                  {chartDataWithMM.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.valor > media ? color : `${color}99`}
                    />
                  ))}
                </Bar>
                {meses >= 4 && (
                  <Line
                    type="monotone"
                    dataKey="mm3"
                    name="Média móvel 3m"
                    stroke="#6B7280"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    dot={false}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
            {meses >= 4 && (
              <p className="text-xs text-muted-foreground text-center mt-1">
                Barras mais intensas = acima da média · Linha cinza = média móvel 3 meses
              </p>
            )}
          </div>

          {/* ── Stacked chart por subcategoria ───────────────────────────────── */}
          {!isSubcategoria && subcategorias.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Composição por Subcategoria</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stackedData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip content={<CustomStackedTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    iconType="circle"
                    iconSize={8}
                  />
                  {subcategorias.map((sub, i) => (
                    <Bar
                      key={sub.id}
                      dataKey={sub.nome}
                      stackId="stack"
                      fill={sub.color !== color ? sub.color : `hsl(${(i * 40) % 360},60%,55%)`}
                      radius={i === subcategorias.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                      maxBarSize={52}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Tabela mês a mês ─────────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Detalhamento Mensal</h3>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs">Mês</TableHead>
                    <TableHead className="text-right text-xs">Valor</TableHead>
                    <TableHead className="text-center text-xs">Var. MoM</TableHead>
                    <TableHead className="text-center text-xs">vs Média</TableHead>
                    <TableHead className="text-right text-xs w-[90px]">Acumulado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grid.map((m, i) => {
                    const anterior = i > 0 ? grid[i - 1].valor : null;
                    const mom = anterior !== null && anterior > 0
                      ? ((m.valor - anterior) / anterior) * 100
                      : null;
                    const vsMedia = media > 0 && m.valor > 0
                      ? ((m.valor - media) / media) * 100
                      : null;
                    const acumulado = grid.slice(0, i + 1).reduce((s, x) => s + x.valor, 0);
                    const isMaior = m.valor === maxMes.valor && m.valor > 0;
                    const isMenor = mesesComValor.length > 1 && m.valor === minMes.valor && m.valor > 0;

                    return (
                      <TableRow key={m.mes} className={isMaior ? 'bg-red-50/40' : isMenor ? 'bg-green-50/40' : ''}>
                        <TableCell className="text-sm font-medium">
                          <div className="flex items-center gap-1">
                            {m.label}
                            {isMaior && <span className="text-xs text-red-500">↑ max</span>}
                            {isMenor && <span className="text-xs text-green-500">↓ min</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums font-semibold">
                          {m.valor > 0 ? formatCurrency(m.valor) : <span className="text-muted-foreground font-normal text-xs">—</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {mom === null ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <Badge
                              variant="outline"
                              className={`text-xs ${mom > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}
                            >
                              {mom > 0 ? '▲' : '▼'} {Math.abs(mom).toFixed(1)}%
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {vsMedia === null ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            <span className={`text-xs ${vsMedia > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {vsMedia > 0 ? '+' : ''}{vsMedia.toFixed(1)}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums text-muted-foreground">
                          {formatCurrency(acumulado)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

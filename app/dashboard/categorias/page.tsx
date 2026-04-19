'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Pencil, Trash2, Tags, Loader2, TrendingDown, TrendingUp,
  Minus, ChevronDown, ChevronRight, BarChart3,
} from 'lucide-react';
import { CategoryDialog } from '@/components/categories/category-dialog';
import { DeleteCategoryDialog } from '@/components/categories/delete-category-dialog';
import { CategoriaEvolucaoModal } from '@/components/categories/categoria-evolucao-modal';
import { formatCurrency } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  type: 'DESPESA' | 'RECEITA';
  icon: string;
  color: string;
  description?: string;
  isActive: boolean;
  parentId?: string | null;
  _count: { transactions: number };
}

interface SubcategoriaPerf {
  id: string;
  nome: string;
  color: string;
  total: number;
  percentualDaCategoria: number;
  transacoes: number;
  evolucao: Array<{ mes: string; valor: number }>;
}

interface CategoriaPerf {
  id: string;
  nome: string;
  color: string;
  icon: string;
  total: number;
  percentualTotal: number;
  mediaMensal: number;
  transacoes: number;
  tendencia: 'crescente' | 'decrescente' | 'estavel';
  evolucao: Array<{ mes: string; valor: number }>;
  subcategorias: SubcategoriaPerf[];
}

type FilterType = 'all' | 'DESPESA' | 'RECEITA';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildMonthGrid(
  evolucao: Array<{ mes: string; valor: number }>,
  meses: number,
): Array<{ mes: string; label: string; valor: number }> {
  const now = new Date();
  return Array.from({ length: meses }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (meses - 1 - i), 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' });
    const found = evolucao.find(e => e.mes === key);
    return { mes: key, label: label.charAt(0).toUpperCase() + label.slice(1), valor: found?.valor || 0 };
  });
}

function MiniSparkline({ data, color }: { data: Array<{ valor: number; label: string }>; color: string }) {
  const max = Math.max(...data.map(d => d.valor), 1);
  return (
    <div className="flex items-end gap-px" style={{ height: 28, width: 72 }}>
      {data.map((d, i) => (
        <div
          key={i}
          title={`${d.label}: ${formatCurrency(d.valor)}`}
          className="flex-1 rounded-sm"
          style={{
            height: d.valor > 0 ? `${Math.max((d.valor / max) * 100, 10)}%` : '3px',
            backgroundColor: d.valor > 0 ? color : '#e5e7eb',
            opacity: i === data.length - 1 ? 1 : 0.65,
          }}
        />
      ))}
    </div>
  );
}

function VariacaoBadge({ atual, anterior }: { atual: number; anterior: number }) {
  if (anterior === 0 && atual === 0) return <span className="text-muted-foreground text-xs">—</span>;
  if (anterior === 0) return <Badge variant="outline" className="text-xs bg-gray-50">Novo</Badge>;
  const pct = ((atual - anterior) / anterior) * 100;
  const isUp = pct > 0;
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold ${isUp ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}
    >
      {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
    </Badge>
  );
}

function TendenciaIcon({ tendencia }: { tendencia: string }) {
  if (tendencia === 'crescente') return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (tendencia === 'decrescente') return <TrendingDown className="h-4 w-4 text-green-500" />;
  return <Minus className="h-4 w-4 text-gray-400" />;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CategoriasPage() {
  // Gestão
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingGestao, setLoadingGestao] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('active');

  // Dialogs
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Desempenho
  const [periodoMeses, setPeriodoMeses] = useState(6);
  const [desempenho, setDesempenho] = useState<CategoriaPerf[]>([]);
  const [totalGeral, setTotalGeral] = useState(0);
  const [loadingDesempenho, setLoadingDesempenho] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Modal de evolução
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    nome: string; color: string;
    evolucao: Array<{ mes: string; valor: number }>;
    mediaMensal: number;
    tendencia: 'crescente' | 'decrescente' | 'estavel';
    subcategorias?: SubcategoriaPerf[];
    isSubcategoria?: boolean;
  } | null>(null);

  const openCategoriaModal = (cat: CategoriaPerf) => {
    setModalData({
      nome: cat.nome, color: cat.color, evolucao: cat.evolucao,
      mediaMensal: cat.mediaMensal, tendencia: cat.tendencia,
      subcategorias: cat.subcategorias, isSubcategoria: false,
    });
    setModalOpen(true);
  };

  const openSubcategoriaModal = (sub: SubcategoriaPerf, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalData({
      nome: sub.nome, color: sub.color, evolucao: sub.evolucao || [],
      mediaMensal: sub.total / periodoMeses, tendencia: 'estavel',
      isSubcategoria: true,
    });
    setModalOpen(true);
  };

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchCategories = async () => {
    setLoadingGestao(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('isActive', filterStatus === 'active' ? 'true' : 'false');
      const res = await fetch(`/api/categories?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCategories((data.categories || []).filter((c: Category) => !c.parentId));
      }
    } finally {
      setLoadingGestao(false);
    }
  };

  const fetchDesempenho = async () => {
    setLoadingDesempenho(true);
    try {
      const res = await fetch(`/api/analise/categorias?meses=${periodoMeses}`);
      if (res.ok) {
        const data = await res.json();
        setDesempenho(data.categorias || []);
        setTotalGeral(data.totalGeral || 0);
      }
    } finally {
      setLoadingDesempenho(false);
    }
  };

  useEffect(() => { fetchCategories(); }, [filterType, filterStatus]);
  useEffect(() => { fetchDesempenho(); }, [periodoMeses]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEdit = (cat: Category) => { setEditingCategory(cat); setCategoryDialogOpen(true); };
  const handleDelete = (cat: Category) => { setDeletingCategory(cat); setDeleteDialogOpen(true); };
  const handleSuccess = () => { fetchCategories(); setEditingCategory(null); setDeletingCategory(null); };

  // Stats
  const activeCategories = categories.filter(c => c.isActive);
  const expenseCategories = activeCategories.filter(c => c.type === 'DESPESA');
  const incomeCategories = activeCategories.filter(c => c.type === 'RECEITA');
  const totalUsage = categories.reduce((s, c) => s + c._count.transactions, 0);

  // Meses labels para colunas
  const now = new Date();
  const mesAtualKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const mesAnteriorDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const mesAnteriorKey = `${mesAnteriorDate.getUTCFullYear()}-${String(mesAnteriorDate.getUTCMonth() + 1).padStart(2, '0')}`;
  const mesAtualLabel = now.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' });
  const mesAnteriorLabel = mesAnteriorDate.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' });

  const getMesValor = (evolucao: Array<{ mes: string; valor: number }>, key: string) =>
    evolucao.find(e => e.mes === key)?.valor || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">Gerencie e analise seus gastos por categoria</p>
        </div>
        <Button onClick={() => setCategoryDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ativas</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCategories.length}</div>
            <p className="text-xs text-muted-foreground">{categories.length - activeCategories.length} inativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenseCategories.length}</div>
            <p className="text-xs text-muted-foreground">Categorias de saída</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incomeCategories.length}</div>
            <p className="text-xs text-muted-foreground">Categorias de entrada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso Total</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
            <p className="text-xs text-muted-foreground">Transações registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="desempenho">
        <TabsList>
          <TabsTrigger value="desempenho" className="gap-1">
            <BarChart3 className="h-4 w-4" /> Desempenho Mensal
          </TabsTrigger>
          <TabsTrigger value="gestao" className="gap-1">
            <Tags className="h-4 w-4" /> Gestão
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Desempenho ───────────────────────────────────────────────── */}
        <TabsContent value="desempenho" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Variação por Categoria</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique em uma categoria para ver o detalhamento por subcategoria
                  </p>
                </div>
                <Select
                  value={String(periodoMeses)}
                  onValueChange={v => setPeriodoMeses(Number(v))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Últimos 3 meses</SelectItem>
                    <SelectItem value="6">Últimos 6 meses</SelectItem>
                    <SelectItem value="12">Últimos 12 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loadingDesempenho ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : desempenho.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mb-3 opacity-40" />
                  <p>Nenhum dado encontrado para o período</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-xs">
                        <TableHead className="w-[220px]">Categoria</TableHead>
                        <TableHead className="w-[80px] text-center">
                          {periodoMeses} meses
                        </TableHead>
                        <TableHead className="text-right">Média/mês</TableHead>
                        <TableHead className="text-right capitalize">
                          {mesAnteriorLabel}
                        </TableHead>
                        <TableHead className="text-right capitalize">
                          {mesAtualLabel}
                        </TableHead>
                        <TableHead className="text-center">Variação</TableHead>
                        <TableHead className="text-center">Tendência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {desempenho.map(cat => {
                        const grid = buildMonthGrid(cat.evolucao, periodoMeses);
                        const anterior = getMesValor(cat.evolucao, mesAnteriorKey);
                        const atual = getMesValor(cat.evolucao, mesAtualKey);
                        const isExpanded = expandedRows.has(cat.id);
                        const hasSubs = cat.subcategorias.length > 0;

                        return (
                          <>
                            {/* Linha da categoria principal */}
                            <TableRow key={cat.id} className="font-medium">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {/* Botão expandir subcategorias */}
                                  <button
                                    className="text-muted-foreground hover:text-foreground w-4 flex-shrink-0"
                                    onClick={() => hasSubs && toggleRow(cat.id)}
                                    disabled={!hasSubs}
                                    title={hasSubs ? (isExpanded ? 'Recolher subcategorias' : 'Expandir subcategorias') : ''}
                                  >
                                    {hasSubs
                                      ? isExpanded
                                        ? <ChevronDown className="h-4 w-4" />
                                        : <ChevronRight className="h-4 w-4" />
                                      : <span className="w-4 inline-block" />
                                    }
                                  </button>
                                  {/* Nome clicável — abre modal */}
                                  <button
                                    className="flex items-center gap-2 hover:underline text-left"
                                    onClick={() => openCategoriaModal(cat)}
                                    title="Ver evolução mensal"
                                  >
                                    <div
                                      className="h-3 w-3 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="truncate">{cat.nome}</span>
                                  </button>
                                  {hasSubs && (
                                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                                      {cat.subcategorias.length}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <MiniSparkline data={grid} color={cat.color} />
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatCurrency(cat.mediaMensal)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-muted-foreground">
                                {anterior > 0 ? formatCurrency(anterior) : <span className="text-xs">—</span>}
                              </TableCell>
                              <TableCell className="text-right tabular-nums font-semibold">
                                {atual > 0 ? formatCurrency(atual) : <span className="font-normal text-xs text-muted-foreground">—</span>}
                              </TableCell>
                              <TableCell className="text-center">
                                <VariacaoBadge atual={atual} anterior={anterior} />
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <TendenciaIcon tendencia={cat.tendencia} />
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Linhas das subcategorias (quando expandido) */}
                            {isExpanded && cat.subcategorias.map(sub => {
                              const subGrid = buildMonthGrid(sub.evolucao || [], periodoMeses);
                              const subAnterior = getMesValor(sub.evolucao || [], mesAnteriorKey);
                              const subAtual = getMesValor(sub.evolucao || [], mesAtualKey);
                              const subMedia = sub.total / periodoMeses;

                              return (
                                <TableRow key={sub.id} className="bg-muted/30 text-sm">
                                  <TableCell>
                                    <div className="flex items-center gap-2 pl-10">
                                      <button
                                        className="flex items-center gap-2 hover:underline text-left"
                                        onClick={(e) => openSubcategoriaModal(sub, e)}
                                        title="Ver evolução mensal"
                                      >
                                        <div
                                          className="h-2 w-2 rounded-full flex-shrink-0"
                                          style={{ backgroundColor: sub.color }}
                                        />
                                        <span className="text-muted-foreground">{sub.nome}</span>
                                      </button>
                                      <span className="text-xs text-muted-foreground/60">
                                        {sub.percentualDaCategoria.toFixed(0)}%
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <MiniSparkline data={subGrid} color={sub.color} />
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums text-muted-foreground">
                                    {formatCurrency(subMedia)}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums text-muted-foreground">
                                    {subAnterior > 0 ? formatCurrency(subAnterior) : <span className="text-xs">—</span>}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums">
                                    {subAtual > 0 ? formatCurrency(subAtual) : <span className="text-xs text-muted-foreground">—</span>}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <VariacaoBadge atual={subAtual} anterior={subAnterior} />
                                  </TableCell>
                                  <TableCell />
                                </TableRow>
                              );
                            })}
                          </>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Rodapé */}
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                    <span>{desempenho.length} categorias • {periodoMeses} meses</span>
                    <span>
                      Total no período:{' '}
                      <strong className="text-foreground">{formatCurrency(totalGeral)}</strong>
                      {' '}· Média mensal:{' '}
                      <strong className="text-foreground">{formatCurrency(totalGeral / periodoMeses)}</strong>
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab: Gestão ───────────────────────────────────────────────────── */}
        <TabsContent value="gestao" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Lista de Categorias</CardTitle>
                <div className="flex gap-2">
                  <Select
                    value={filterType}
                    onValueChange={(v: FilterType) => setFilterType(v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="DESPESA">Despesas</SelectItem>
                      <SelectItem value="RECEITA">Receitas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterStatus}
                    onValueChange={(v: any) => setFilterStatus(v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativas</SelectItem>
                      <SelectItem value="inactive">Inativas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingGestao ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Tags className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">Nenhuma categoria encontrada</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Comece criando categorias para organizar suas transações.
                  </p>
                  <Button onClick={() => setCategoryDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Primeira Categoria
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Transações</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map(category => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={category.type === 'DESPESA' ? 'destructive' : 'default'}>
                              {category.type === 'DESPESA' ? 'Despesa' : 'Receita'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">
                            {category.description || '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{category._count.transactions}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={category.isActive ? 'default' : 'secondary'}>
                              {category.isActive ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(category)}
                                disabled={category._count.transactions > 0}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={open => { setCategoryDialogOpen(open); if (!open) setEditingCategory(null); }}
        category={editingCategory}
        onSuccess={handleSuccess}
      />
      <DeleteCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        category={deletingCategory}
        onSuccess={handleSuccess}
      />

      {modalData && (
        <CategoriaEvolucaoModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          nome={modalData.nome}
          color={modalData.color}
          evolucao={modalData.evolucao}
          mediaMensal={modalData.mediaMensal}
          tendencia={modalData.tendencia}
          subcategorias={modalData.subcategorias}
          meses={periodoMeses}
          isSubcategoria={modalData.isSubcategoria}
        />
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { PeriodoComparacao } from '@/components/analise/periodo-comparacao';
import { TendenciasChart } from '@/components/analise/tendencias-chart';
import { CategoriaAnalysis } from '@/components/analise/categoria-analysis';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function AnalisePage() {
  const [comparacaoData, setComparacaoData] = useState<any>(null);
  const [tendenciasData, setTendenciasData] = useState<any>(null);
  const [categoriasData, setCategoriasData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('12'); // meses

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar dados em paralelo
        const [comparacaoRes, tendenciasRes, categoriasRes] = await Promise.all([
          fetch('/api/analise/comparacao'),
          fetch(`/api/analise/tendencias?meses=${periodo}`),
          fetch(`/api/analise/categorias?meses=${periodo}`),
        ]);

        const [comparacao, tendencias, categorias] = await Promise.all([
          comparacaoRes.json(),
          tendenciasRes.json(),
          categoriasRes.json(),
        ]);

        setComparacaoData(comparacao);
        setTendenciasData(tendencias);
        setCategoriasData(categorias);
      } catch (error) {
        console.error('Erro ao buscar dados de análise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodo]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Análise Financeira</h2>
        <p className="text-muted-foreground">
          Insights profundos sobre seus padrões de gastos
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Período:</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Últimos 3 meses</SelectItem>
                  <SelectItem value="6">Últimos 6 meses</SelectItem>
                  <SelectItem value="12">Últimos 12 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground ml-auto">
              {loading && 'Atualizando dados...'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparação de Períodos */}
      <PeriodoComparacao dados={comparacaoData} loading={loading} />

      {/* Tendências */}
      <TendenciasChart dados={tendenciasData} loading={loading} />

      {/* Análise por Categoria */}
      <CategoriaAnalysis dados={categoriasData} loading={loading} />
    </div>
  );
}

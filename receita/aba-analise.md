# Receita: Aba de Análise - Cockpit Contas

## 🎯 Objetivo

A aba de **Análise** deve fornecer insights profundos sobre os padrões de gastos, permitindo identificar tendências, comparar períodos, e tomar decisões financeiras mais informadas. Diferente do Dashboard (visão geral rápida), a Análise oferece uma exploração detalhada e personalizável dos dados.

---

## 📊 Estrutura da Página

### Layout Principal

```
┌─────────────────────────────────────────────────────────────┐
│  ANÁLISE FINANCEIRA                                         │
├─────────────────────────────────────────────────────────────┤
│  [Filtros]                                                  │
│  ┌──────────────────┬──────────────────┬──────────────────┐ │
│  │ Período          │ Categorias       │ Forma de Pgto    │ │
│  │ [▼ Último ano]   │ [▼ Todas]        │ [▼ Todas]        │ │
│  └──────────────────┴──────────────────┴──────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SEÇÃO 1: COMPARAÇÃO DE PERÍODOS                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Este Mês vs Mês Anterior | Este Mês vs Mesmo Mês Ano │ │
│  │  Passado                                              │ │
│  │                                                         │ │
│  │  [Cards de comparação com % de variação]              │ │
│  │  [Gráfico de barras comparativo lado a lado]          │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  SEÇÃO 2: TENDÊNCIAS E PADRÕES                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Gráfico de linha - Evolução últimos 12 meses]       │ │
│  │  [Linha de tendência / média móvel]                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  SEÇÃO 3: ANÁLISE POR CATEGORIA                            │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Gráfico de barras horizontais - Top 10 categorias]  │ │
│  │  [Tabela detalhada com % do total e evolução]         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  SEÇÃO 4: ANÁLISE POR GRUPO                                │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Casa | Pet | Transporte | Alimentação | Saúde | etc  │ │
│  │  [Gráfico de pizza ou treemap por grupo]              │ │
│  │  [Comparação mensal por grupo]                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  SEÇÃO 5: MÉTODO DE PAGAMENTO                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Débito vs Crédito vs Outros                          │ │
│  │  [Gráfico de rosca com proporções]                    │ │
│  │  [Evolução mensal por método]                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  SEÇÃO 6: INSIGHTS AUTOMÁTICOS                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  💡 Categoria com maior aumento: Viagem (+45%)        │ │
│  │  📉 Categoria com maior redução: Mercado (-12%)       │ │
│  │  🔥 Mês com maior gasto: Maio/25 (R$ 46.806,60)      │ │
│  │  💚 Mês com menor gasto: Dez/25 (R$ 15.021,23)       │ │
│  │  ⚠️  Gastos acima da média: 5 categorias              │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Componentes Detalhados

### 1. Filtros Interativos

**Período:**
- Último mês
- Últimos 3 meses
- Últimos 6 meses
- Último ano
- Ano atual (2026)
- Ano anterior (2025)
- Personalizado (seletor de data início/fim)

**Categorias:**
- Todas
- Seleção múltipla de categorias específicas
- Por grupo (Casa, Pet, Transporte, etc.)

**Forma de Pagamento:**
- Todas
- Débito
- Crédito
- Dinheiro
- PIX
- Outros

**Status:**
- Todos
- Apenas pagos
- Apenas pendentes

---

### 2. Comparação de Períodos

#### Card 1: Comparação Mês a Mês
```
┌─────────────────────────────────────────┐
│ Este Mês vs Mês Anterior               │
├─────────────────────────────────────────┤
│                                         │
│  Janeiro 2026        Dezembro 2025     │
│  R$ 4.334,16         R$ 15.021,23      │
│                                         │
│  📉 -71,1%                              │
│  R$ 10.687,07 a menos                  │
│                                         │
│  [Gráfico de barras lado a lado]       │
│                                         │
│  Maiores Variações:                    │
│  • Viagem: -R$ 5.000 (-100%)           │
│  • Mercado: -R$ 1.200 (-45%)           │
│  • Empréstimo Casa: R$ 0 (igual)       │
└─────────────────────────────────────────┘
```

#### Card 2: Comparação Ano a Ano
```
┌─────────────────────────────────────────┐
│ Este Mês vs Mesmo Mês Ano Anterior     │
├─────────────────────────────────────────┤
│                                         │
│  Janeiro 2026        Janeiro 2025      │
│  R$ 4.334,16         R$ 0,00           │
│                                         │
│  📊 Não há dados do ano anterior       │
│                                         │
│  (Ou com dados)                        │
│  📈 +15,3%                             │
│  R$ 2.500,00 a mais                    │
└─────────────────────────────────────────┘
```

---

### 3. Tendências e Padrões

#### Gráfico de Linha - Evolução Temporal
```
Evolução de Gastos (Últimos 12 Meses)

R$ 50.000 ┤                  ●
          │
R$ 40.000 ┤
          │         ●
R$ 30.000 ┤   ●   ●   ● ● ● ●     ●
          │ ●   ●
R$ 20.000 ┤                   ●
          │
R$ 10.000 ┤                       ●
          │
R$     0  ┴────────────────────────────
          F M A M J J A S O N D J
          2 2 2 2 2 2 2 2 2 2 2 2
          5 5 5 5 5 5 5 5 5 5 5 6

• Linha azul: Gastos mensais
• Linha tracejada vermelha: Média móvel (3 meses)
• Linha tracejada verde: Média geral do período
```

**Métricas Associadas:**
- Média do período: R$ 24.916,15
- Desvio padrão: R$ 8.234,52
- Mês com maior gasto: Maio/25 (R$ 46.806,60)
- Mês com menor gasto: Janeiro/26 (R$ 4.334,16)
- Tendência: Estável / Crescente / Decrescente

---

### 4. Análise Por Categoria

#### Tabela Detalhada
```
┌────────────────────────────────────────────────────────────────────────────┐
│ Categoria            │ Total      │ % do Total │ Média Mensal │ Tendência │
├────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Empréstimo Casa   │ 95.000,00  │   25,9%    │   7.916,67   │    →      │
│ ✈️  Viagem           │ 66.510,34  │   18,1%    │   5.542,53   │    ↑      │
│ 🏡 Demais gastos casa│ 28.019,54  │    7,6%    │   2.334,96   │    →      │
│ 🍽️  Restaurante      │ 26.620,69  │    7,3%    │   2.218,39   │    ↓      │
│ 🔧 Manutenção Carro  │ 24.592,80  │    6,7%    │   2.049,40   │    ↑      │
│ 🛒 Mercado           │ 16.214,11  │    4,4%    │   1.351,18   │    →      │
│ 🍕 Ifood             │  9.999,68  │    2,7%    │     833,31   │    ↓      │
│ 📝 IPTU              │  9.101,60  │    2,5%    │     758,47   │    →      │
│ 🐕 Day care Farofa   │  8.630,79  │    2,4%    │     719,23   │    →      │
│ 🧹 Limpeza           │  7.050,00  │    1,9%    │     587,50   │    →      │
│ ...                  │            │            │              │           │
└────────────────────────────────────────────────────────────────────────────┘

Legenda: ↑ Crescente  ↓ Decrescente  → Estável
```

#### Gráfico de Barras Horizontais
```
Empréstimo Casa  ████████████████████████████ R$ 95.000
Viagem          ████████████████████ R$ 66.510
Demais Casa     ████████ R$ 28.019
Restaurante     ███████ R$ 26.620
Manutenção      ███████ R$ 24.592
Mercado         █████ R$ 16.214
Ifood           ███ R$ 9.999
IPTU            ███ R$ 9.101
Day care        ██ R$ 8.630
Limpeza         ██ R$ 7.050
```

---

### 5. Análise Por Grupo

#### Distribuição por Grupo
```
┌─────────────────────────────────────────┐
│ Gastos por Grupo                       │
├─────────────────────────────────────────┤
│                                         │
│        [Gráfico de Pizza]               │
│                                         │
│  🏠 Casa: 42,3% (R$ 155.233,16)        │
│  🚗 Transporte: 18,7% (R$ 68.501,65)   │
│  🍽️  Alimentação: 15,2% (R$ 55.772,92) │
│  🐕 Pet: 8,9% (R$ 32.617,18)           │
│  ✈️  Lazer: 7,4% (R$ 27.133,15)        │
│  🏥 Saúde: 5,1% (R$ 18.702,34)         │
│  📦 Outros: 2,4% (R$ 8.718,29)         │
└─────────────────────────────────────────┘
```

#### Evolução Mensal por Grupo
```
[Gráfico de área empilhada mostrando evolução de cada grupo ao longo dos meses]
```

---

### 6. Análise Por Método de Pagamento

```
┌─────────────────────────────────────────┐
│ Distribuição por Forma de Pagamento   │
├─────────────────────────────────────────┤
│                                         │
│      [Gráfico de Rosca]                 │
│                                         │
│  💳 Crédito: 62,4% (R$ 228.815,31)     │
│  💰 Débito: 35,8% (R$ 131.254,67)      │
│  💵 Dinheiro: 1,5% (R$ 5.500,00)       │
│  📱 PIX: 0,3% (R$ 1.108,71)            │
└─────────────────────────────────────────┘

Insight: Você usa crédito em 62% dos gastos.
Isso pode gerar acúmulo de fatura se não controlado.
```

---

### 7. Insights Automáticos

Sistema inteligente que analisa os dados e gera insights relevantes:

```
┌───────────────────────────────────────────────────────────┐
│ 💡 Insights do Período                                   │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  📈 MAIORES AUMENTOS                                     │
│  • Viagem aumentou 340% em relação ao mês anterior       │
│  • Restaurante teve pico incomum de R$ 4.500 em Maio     │
│                                                           │
│  📉 MAIORES REDUÇÕES                                     │
│  • Mercado reduziu 45% - economia de R$ 1.200           │
│  • Combustível caiu 28% comparado ao trimestre anterior  │
│                                                           │
│  🎯 PADRÕES IDENTIFICADOS                                │
│  • Empréstimo Casa é sempre R$ 7.916,67 (fixo)          │
│  • Dia 24 concentra 35% dos pagamentos mensais          │
│  • Sábados têm 42% mais gastos com restaurante          │
│                                                           │
│  ⚠️  ALERTAS                                             │
│  • Categoria Viagem ultrapassou R$ 60.000 no ano        │
│  • 5 categorias acima da média histórica                 │
│  • Contas pendentes: R$ 2.500 (3 transações)            │
│                                                           │
│  💰 OPORTUNIDADES                                        │
│  • Mercado teve redução - continue economizando          │
│  • 15% dos gastos são com delivery - cozinhar mais?     │
└───────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementação Técnica

### Estrutura de Arquivos

```
app/
  dashboard/
    analise/
      page.tsx                    # Página principal

components/
  analise/
    periodo-comparacao.tsx        # Componente de comparação
    tendencias-chart.tsx          # Gráfico de tendências
    categoria-analysis.tsx        # Análise por categoria
    grupo-analysis.tsx            # Análise por grupo
    pagamento-analysis.tsx        # Análise por método
    insights-auto.tsx             # Insights automáticos
    filtros-analise.tsx           # Barra de filtros

app/api/
  analise/
    comparacao/route.ts           # API comparação períodos
    tendencias/route.ts           # API dados de tendência
    categorias/route.ts           # API análise categorias
    grupos/route.ts               # API análise grupos
    pagamentos/route.ts           # API análise pagamentos
    insights/route.ts             # API insights automáticos
```

---

## 📐 APIs Necessárias

### 1. `/api/analise/comparacao`

**Parâmetros:**
- `periodo1`: Data início/fim do primeiro período
- `periodo2`: Data início/fim do segundo período
- `categorias?`: Filtro de categorias
- `metodoPagamento?`: Filtro de método

**Retorno:**
```typescript
{
  periodo1: {
    total: number,
    transacoes: number,
    categorias: Array<{
      nome: string,
      valor: number,
      percentual: number
    }>
  },
  periodo2: {
    total: number,
    transacoes: number,
    categorias: Array<{
      nome: string,
      valor: number,
      percentual: number
    }>
  },
  variacao: {
    percentual: number,
    valor: number,
    categoriasMaiorAumento: Array<{nome: string, variacao: number}>,
    categoriasMaiorReducao: Array<{nome: string, variacao: number}>
  }
}
```

---

### 2. `/api/analise/tendencias`

**Parâmetros:**
- `periodo`: Últimos N meses
- `agrupamento`: 'dia' | 'semana' | 'mes'
- `categorias?`: Filtro

**Retorno:**
```typescript
{
  dados: Array<{
    data: string,
    valor: number
  }>,
  mediaMovel: Array<{
    data: string,
    valor: number
  }>,
  estatisticas: {
    media: number,
    desvioPadrao: number,
    maximo: { data: string, valor: number },
    minimo: { data: string, valor: number },
    tendencia: 'crescente' | 'decrescente' | 'estavel'
  }
}
```

---

### 3. `/api/analise/categorias`

**Retorno:**
```typescript
{
  categorias: Array<{
    id: string,
    nome: string,
    grupo: string,
    total: number,
    percentualTotal: number,
    mediaMensal: number,
    transacoes: number,
    tendencia: 'crescente' | 'decrescente' | 'estavel',
    evolucao: Array<{
      mes: string,
      valor: number
    }>
  }>,
  totalGeral: number
}
```

---

### 4. `/api/analise/grupos`

**Retorno:**
```typescript
{
  grupos: Array<{
    nome: string,
    total: number,
    percentual: number,
    categorias: number,
    evolucaoMensal: Array<{
      mes: string,
      valor: number
    }>
  }>
}
```

---

### 5. `/api/analise/pagamentos`

**Retorno:**
```typescript
{
  metodos: Array<{
    metodo: 'DEBITO' | 'CREDITO' | 'DINHEIRO' | 'PIX',
    total: number,
    percentual: number,
    transacoes: number,
    evolucaoMensal: Array<{
      mes: string,
      valor: number
    }>
  }>
}
```

---

### 6. `/api/analise/insights`

**Retorno:**
```typescript
{
  aumentos: Array<{
    categoria: string,
    variacaoPercentual: number,
    variacaoValor: number,
    tipo: 'mensal' | 'trimestral' | 'anual'
  }>,
  reducoes: Array<{
    categoria: string,
    variacaoPercentual: number,
    variacaoValor: number,
    tipo: 'mensal' | 'trimestral' | 'anual'
  }>,
  padroes: Array<{
    descricao: string,
    tipo: 'dia' | 'categoria' | 'valor' | 'frequencia'
  }>,
  alertas: Array<{
    mensagem: string,
    severidade: 'info' | 'warning' | 'error',
    categoria?: string
  }>,
  oportunidades: Array<{
    mensagem: string,
    economiaPotencial?: number
  }>
}
```

---

## 🎨 Design e UX

### Cores para Gráficos

**Variação Positiva/Negativa:**
- Verde (#10B981): Redução de gastos (positivo)
- Vermelho (#EF4444): Aumento de gastos (negativo)
- Cinza (#6B7280): Sem variação

**Grupos de Categorias:**
- Casa: #8B5CF6 (Roxo)
- Transporte: #06B6D4 (Ciano)
- Alimentação: #84CC16 (Verde-limão)
- Pet: #F97316 (Laranja)
- Lazer: #A855F7 (Lilás)
- Saúde: #EF4444 (Vermelho)
- Outros: #64748B (Cinza)

### Responsividade

**Desktop (≥1024px):**
- Layout em 2 colunas para gráficos
- Tabelas completas
- Filtros em linha

**Tablet (768px - 1023px):**
- Layout em 1 coluna
- Gráficos responsivos
- Filtros em dropdown

**Mobile (<768px):**
- Cards empilhados
- Gráficos simplificados
- Filtros em modal

---

## 🚀 Funcionalidades Avançadas (Fase 2)

### Exportação de Relatórios
- Exportar gráficos como PNG
- Exportar dados como CSV/Excel
- Gerar PDF com análise completa

### Comparações Customizadas
- Comparar períodos específicos
- Comparar categorias específicas
- Salvar comparações favoritas

### Metas e Previsões
- Definir meta de redução por categoria
- Projeção de gastos para próximo mês
- Alertas quando próximo de ultrapassar meta

### Análise Semanal/Diária
- Visualizar padrões por dia da semana
- Identificar dias com mais gastos
- Análise de horários (se houver timestamp)

---

## ✅ Checklist de Implementação

### Fase 1 - Básico
- [ ] Estrutura da página
- [ ] Componente de filtros
- [ ] Comparação de períodos (mês a mês)
- [ ] Gráfico de tendência (linha)
- [ ] Análise por categoria (tabela + gráfico)
- [ ] API de comparação
- [ ] API de tendências
- [ ] API de categorias

### Fase 2 - Intermediário
- [ ] Análise por grupo
- [ ] Análise por método de pagamento
- [ ] Gráficos adicionais (pizza, rosca, área)
- [ ] API de grupos
- [ ] API de pagamentos
- [ ] Responsividade mobile

### Fase 3 - Avançado
- [ ] Insights automáticos
- [ ] API de insights
- [ ] Comparação ano a ano
- [ ] Média móvel no gráfico
- [ ] Detecção de padrões
- [ ] Alertas inteligentes

### Fase 4 - Premium
- [ ] Exportação de relatórios
- [ ] Comparações customizadas
- [ ] Metas por categoria
- [ ] Projeções e previsões
- [ ] Análise semanal/diária
- [ ] Dashboards personalizáveis

---

## 📝 Observações Importantes

### Performance
- Usar cache para consultas pesadas
- Implementar paginação em tabelas grandes
- Lazy loading para gráficos não visíveis
- Debounce nos filtros

### Dados
- Considerar transações de diferentes anos
- Lidar com meses sem dados
- Validar divisão por zero
- Formatar valores consistentemente

### UX
- Loading states em todos os componentes
- Estados vazios informativos
- Tooltips explicativos
- Feedback visual em ações

---

## 🎯 Prioridades de Implementação

**Alta Prioridade (MVP):**
1. Comparação mês a mês
2. Gráfico de tendência
3. Análise por categoria
4. Filtro de período

**Média Prioridade:**
1. Análise por grupo
2. Análise por método de pagamento
3. Comparação ano a ano
4. Insights básicos

**Baixa Prioridade:**
1. Insights avançados
2. Exportações
3. Análise diária/semanal
4. Previsões

---

Esta receita cobre uma aba de análise completa e escalável. Podemos começar com o MVP e evoluir gradualmente conforme necessário.

# Exemplos e Casos de Uso - Aba de Análise

## 📖 Casos de Uso Reais

### Caso 1: Identificar Por Que Maio Foi Tão Caro

**Contexto:** Usuário nota que Maio/25 teve R$ 46.806,60 (quase o dobro da média)

**Fluxo na aba Análise:**
1. Seleciona filtro "Maio 2025"
2. Visualiza comparação com Abril 2025
3. Identifica que Viagem teve R$ 15.000 a mais
4. Insight automático mostra: "Viagem aumentou 340% - Férias?"

**Resultado:** Entende que o aumento foi pontual (viagem) e não recorrente.

---

### Caso 2: Reduzir Gastos com Alimentação

**Contexto:** Usuário quer economizar no grupo Alimentação

**Fluxo na aba Análise:**
1. Filtra por grupo "Alimentação"
2. Vê distribuição: Mercado (48%), Restaurante (39%), Ifood (13%)
3. Gráfico de tendência mostra Ifood crescente (+25% últimos 3 meses)
4. Insight sugere: "15% dos gastos são delivery - cozinhar mais?"

**Resultado:** Identifica que reduzir Ifood tem maior impacto que cortar Mercado.

---

### Caso 3: Planejar Orçamento para 2026

**Contexto:** Quer criar budget realista baseado em dados

**Fluxo na aba Análise:**
1. Visualiza médias mensais dos últimos 12 meses por categoria
2. Identifica categorias fixas (Empréstimo Casa: sempre R$ 7.916,67)
3. Identifica categorias variáveis (Viagem: R$ 0 a R$ 15.000)
4. Gráfico de tendência mostra padrão sazonal

**Resultado:** Cria orçamento com base em dados reais, não estimativas.

---

### Caso 4: Avaliar Impacto de Mudança de Hábito

**Contexto:** Em Dezembro reduziu gastos com Restaurante

**Fluxo na aba Análise:**
1. Compara Dezembro vs Novembro
2. Vê redução de 60% em Restaurante (R$ 3.500 → R$ 1.400)
3. Insight mostra: "Restaurante teve maior redução - Economia de R$ 2.100"
4. Verifica se outras categorias aumentaram (compensação)

**Resultado:** Confirma que mudança foi efetiva e sustentável.

---

## 🎨 Mockups Visuais (Texto)

### Tela Inicial - Sem Filtros

```
═══════════════════════════════════════════════════════════════════
                          ANÁLISE FINANCEIRA
═══════════════════════════════════════════════════════════════════

Filtros: [▼ Últimos 12 meses] [▼ Todas categorias] [▼ Todos métodos]

───────────────────────────────────────────────────────────────────
  COMPARAÇÃO DE PERÍODOS
───────────────────────────────────────────────────────────────────

┌─────────────────────────────┐  ┌─────────────────────────────┐
│ Este Mês vs Mês Anterior    │  │ Este Mês vs Mesmo Mês 2025  │
│                             │  │                             │
│   Jan/26        Dez/25      │  │   Jan/26        Jan/25      │
│ R$ 4.334,16  R$ 15.021,23   │  │ R$ 4.334,16      N/A        │
│                             │  │                             │
│      📉 -71,1%              │  │      📊 Sem dados           │
│  R$ 10.687 a menos          │  │                             │
│                             │  │                             │
│  [Gráfico barras duplas]    │  │  [Mensagem informativa]     │
└─────────────────────────────┘  └─────────────────────────────┘

Maiores Variações (Jan 26 vs Dez 25):
• Viagem: -R$ 5.000,00 (-100%) 📉
• Restaurante: -R$ 1.800,00 (-75%) 📉
• Mercado: -R$ 600,00 (-30%) 📉
• Empréstimo Casa: R$ 0,00 (0%) →

───────────────────────────────────────────────────────────────────
  TENDÊNCIAS E PADRÕES
───────────────────────────────────────────────────────────────────

[Gráfico de Linha - Evolução Últimos 12 Meses]

R$ 50k ┤                  ●
       │
R$ 40k ┤
       │         ●
R$ 30k ┤   ● ● ●   ● ● ● ●     ●
       │ ●
R$ 20k ┤                   ●
       │
R$ 10k ┤                       ●
       │
    0  ┴────────────────────────────
       F M A M J J A S O N D J

● Gastos Mensais    - - - Média Móvel (3m)    ─ ─ Média Geral

📊 Estatísticas:
• Média: R$ 24.916,15    • Desvio: R$ 8.234,52
• Máximo: Mai/25 (R$ 46.806,60)    • Mínimo: Jan/26 (R$ 4.334,16)
• Tendência: ➡️ ESTÁVEL

───────────────────────────────────────────────────────────────────
  ANÁLISE POR CATEGORIA (Top 10)
───────────────────────────────────────────────────────────────────

Empréstimo Casa  ████████████████████████ 25,9%  R$ 95.000,00  →
Viagem          ████████████████████ 18,1%  R$ 66.510,34  ↑
Demais Casa     ████████ 7,6%  R$ 28.019,54  →
Restaurante     ███████ 7,3%  R$ 26.620,69  ↓
Manutenção      ███████ 6,7%  R$ 24.592,80  ↑
Mercado         █████ 4,4%  R$ 16.214,11  →
Ifood           ███ 2,7%  R$ 9.999,68  ↓
IPTU            ███ 2,5%  R$ 9.101,60  →
Day care        ██ 2,4%  R$ 8.630,79  →
Limpeza         ██ 1,9%  R$ 7.050,00  →

[Ver detalhes completos ▼]

───────────────────────────────────────────────────────────────────
  ANÁLISE POR GRUPO
───────────────────────────────────────────────────────────────────

        Casa 42,3%
       ╱─────────╲
      │           │    Transporte 18,7%
      │           │   ╱──────────╲
  Pet │    🏠     │  │     🚗     │
  8,9%│           │  │            │
      │           │  │            │
       ╲─────────╱    ╲──────────╱

   Alimentação 15,2%    Saúde 5,1%
   Lazer 7,4%          Outros 2,4%

Evolução Mensal por Grupo:
[Gráfico de área empilhada - Casa sempre maior base]

───────────────────────────────────────────────────────────────────
  FORMA DE PAGAMENTO
───────────────────────────────────────────────────────────────────

        62,4%
    ╱─────────╲
   │  CRÉDITO  │  35,8%
   │     💳    │ ╱──────╲
    ╲─────────╱ │ DÉBITO│
                 ╲──────╱

 Dinheiro: 1,5%    PIX: 0,3%

💡 Você usa crédito em 62% dos gastos - acompanhe a fatura!

───────────────────────────────────────────────────────────────────
  💡 INSIGHTS AUTOMÁTICOS
───────────────────────────────────────────────────────────────────

📈 MAIORES AUMENTOS:
• Viagem aumentou 340% em Maio (R$ 15.000 vs média de R$ 3.300)
• Manutenção Carro cresceu 120% no último trimestre

📉 MAIORES REDUÇÕES:
• Restaurante reduziu 60% em Dezembro - Economia de R$ 2.100
• Mercado caiu 30% em Janeiro

🎯 PADRÕES IDENTIFICADOS:
• Empréstimo Casa é sempre R$ 7.916,67 (valor fixo mensal)
• Dia 24 concentra 35% dos pagamentos mensais
• Finais de semana têm 42% mais gastos com Restaurante

⚠️  ALERTAS:
• Viagem ultrapassou R$ 60.000 no período (18% do total)
• 5 categorias estão acima da média histórica
• Janeiro teve apenas R$ 4.334 - confirme se dados completos

💰 OPORTUNIDADES DE ECONOMIA:
• Ifood cresceu 25% - reduzir para R$ 600/mês = economia de R$ 200
• 15% dos gastos são com delivery - cozinhar mais pode economizar R$ 3.000/ano
• Uber usado 8x - avaliar transporte alternativo

═══════════════════════════════════════════════════════════════════
```

---

## 🔍 Exemplos de Filtros Aplicados

### Exemplo 1: Filtro "Categoria: Viagem"

```
═══════════════════════════════════════════════════════════════════
                    ANÁLISE FINANCEIRA - VIAGEM
═══════════════════════════════════════════════════════════════════

Filtros: [Últimos 12m] [✓ Viagem] [Todos métodos]  [🗑️ Limpar filtros]

───────────────────────────────────────────────────────────────────
  RESUMO - CATEGORIA VIAGEM
───────────────────────────────────────────────────────────────────

Total Gasto: R$ 66.510,34
Transações: 20
Média por Transação: R$ 3.325,52
Média Mensal: R$ 5.542,53

Mês com Maior Gasto: Maio/25 (R$ 15.000,00)
Mês com Menor Gasto: 7 meses sem gastos

───────────────────────────────────────────────────────────────────
  EVOLUÇÃO MENSAL
───────────────────────────────────────────────────────────────────

R$ 15k ┤     ●
       │
R$ 12k ┤
       │
R$ 9k  ┤
       │
R$ 6k  ┤ ●       ●       ●         ●
       │
R$ 3k  ┤   ●
       │
    0  ┴────────────────────────────
       F M A M J J A S O N D J

💡 Insight: Gastos concentrados em 5 meses (Mar, Mai, Jun, Set, Nov)
Aparentemente gastos relacionados a férias e feriados prolongados.

───────────────────────────────────────────────────────────────────
  FORMA DE PAGAMENTO - VIAGEM
───────────────────────────────────────────────────────────────────

💳 Crédito: R$ 52.408,27 (78,8%)
💰 Débito: R$ 14.102,07 (21,2%)

═══════════════════════════════════════════════════════════════════
```

---

### Exemplo 2: Filtro "Grupo: Casa"

```
═══════════════════════════════════════════════════════────════════
                    ANÁLISE FINANCEIRA - CASA
═══════════════════════════════════════════════════════════════════

Filtros: [Últimos 12m] [Grupo: Casa ▼] [Todos métodos]

───────────────────────────────────────────────────────────────────
  RESUMO - GRUPO CASA
───────────────────────────────────────────────────────────────────

Total Gasto: R$ 155.233,16 (42,3% do total geral)
Categorias: 10
Transações: 127
Média Mensal: R$ 12.936,10

───────────────────────────────────────────────────────────────────
  CATEGORIAS DO GRUPO CASA
───────────────────────────────────────────────────────────────────

Empréstimo Casa    61,2%  R$ 95.000,00  ████████████████████████
Demais gastos      18,0%  R$ 28.019,54  ███████
IPTU                5,9%  R$  9.101,60  ██
Limpeza             4,5%  R$  7.050,00  ██
Água                2,3%  R$  3.586,60  █
Gás                 2,5%  R$  3.838,78  █
Internet            0,8%  R$  1.261,08
Manutenção Elev     0,8%  R$  1.260,00
Seguro Casa         0,4%  R$    683,82
Condomínio          1,2%  R$  1.800,00

───────────────────────────────────────────────────────────────────
  EVOLUÇÃO MENSAL - CASA
───────────────────────────────────────────────────────────────────

[Gráfico de área empilhada mostrando cada subcategoria]

💡 Insight:
• Empréstimo Casa domina 61% dos gastos do grupo
• Categorias fixas (IPTU, Condomínio, Seguros) = R$ 10.583,42/ano
• Categorias variáveis (Água, Gás, Limpeza) = R$ 14.475,38/ano

═══════════════════════════════════════════════════════════════════
```

---

## 📊 Algoritmos de Insights

### 1. Detecção de Anomalias

```typescript
// Identifica quando categoria teve variação > 50% da média
function detectarAnomalias(categoria: Categoria): Insight[] {
  const media = calcularMedia(categoria.evolucao);
  const desvioPadrao = calcularDesvioPadrao(categoria.evolucao);

  const insights: Insight[] = [];

  categoria.evolucao.forEach((mes) => {
    const variacao = (mes.valor - media) / media * 100;

    if (Math.abs(variacao) > 50) {
      insights.push({
        tipo: variacao > 0 ? 'aumento' : 'reducao',
        categoria: categoria.nome,
        mes: mes.mes,
        variacaoPercentual: variacao,
        severidade: Math.abs(variacao) > 100 ? 'alta' : 'media'
      });
    }
  });

  return insights;
}
```

---

### 2. Identificação de Padrões

```typescript
// Identifica se categoria tem valor fixo
function identificarValorFixo(categoria: Categoria): boolean {
  const valores = categoria.evolucao.map(m => m.valor);
  const valorUnico = valores.every(v => Math.abs(v - valores[0]) < 0.01);

  return valorUnico && valores.length >= 3;
}

// Identifica dia do mês mais comum para pagamentos
function identificarDiaPagamento(transacoes: Transaction[]): number {
  const diasFrequencia = new Map<number, number>();

  transacoes.forEach(t => {
    const dia = new Date(t.transactionDate).getDate();
    diasFrequencia.set(dia, (diasFrequencia.get(dia) || 0) + 1);
  });

  return Array.from(diasFrequencia.entries())
    .sort((a, b) => b[1] - a[1])[0][0];
}
```

---

### 3. Cálculo de Tendência

```typescript
// Calcula se categoria está crescente, decrescente ou estável
function calcularTendencia(evolucao: MesValor[]): 'crescente' | 'decrescente' | 'estavel' {
  if (evolucao.length < 3) return 'estavel';

  // Regressão linear simples
  const n = evolucao.length;
  const somaX = evolucao.reduce((sum, _, i) => sum + i, 0);
  const somaY = evolucao.reduce((sum, m) => sum + m.valor, 0);
  const somaXY = evolucao.reduce((sum, m, i) => sum + (i * m.valor), 0);
  const somaX2 = evolucao.reduce((sum, _, i) => sum + (i * i), 0);

  const inclinacao = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);

  if (Math.abs(inclinacao) < 100) return 'estavel';
  return inclinacao > 0 ? 'crescente' : 'decrescente';
}
```

---

## ✨ Diferenciais da Aba de Análise

### vs Dashboard
- **Dashboard:** Visão geral rápida do mês atual
- **Análise:** Exploração profunda de períodos customizados

### vs Transações
- **Transações:** Lista individual de cada lançamento
- **Análise:** Agregação e comparação de dados

### vs Relatórios
- **Relatórios:** Documentos formatados para impressão/export
- **Análise:** Interface interativa para exploração

---

## 🎯 Métricas de Sucesso

**Para considerar a aba de Análise bem-sucedida:**

1. **Usabilidade:**
   - Usuário consegue responder "Por que gastei tanto em X?" em < 2 cliques
   - Filtros são intuitivos e respondem rápido (< 1s)

2. **Insights:**
   - Pelo menos 3 insights relevantes gerados automaticamente
   - Insights ajudam a tomar decisão (não são óbvios)

3. **Performance:**
   - Página carrega em < 3s
   - Mudança de filtro atualiza em < 1s
   - Gráficos renderizam suavemente

4. **Adoção:**
   - Usuário acessa análise pelo menos 1x/semana
   - Usuário usa filtros (não fica apenas na view padrão)

---

Esta documentação complementa a receita principal com exemplos práticos e algoritmos de implementação.

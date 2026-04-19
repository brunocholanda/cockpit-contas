# Requisitos do Cockpit de Gestão de Contas Mensais

## Visão Geral

Criar um cockpit pessoal para gerenciar contas mensais da casa, substituindo a planilha Excel atual com uma aplicação web moderna, interativa e visual.

## Análise da Planilha Atual

### Estrutura Atual (Excel)

**Aba "2025"** - Contas mensais organizadas por:
- **Casa**: IPTU, Condomínio, Água, Gás, Luz, Limpeza, Internet
- **Farofa** (Pet): Day Care, Plano de Saúde
- **Transporte**: Combustível, Estacionamento, Uber, Manutenção
- **Alimentação**: Mercado, Restaurantes, Delivery
- **Saúde**: Plano de Saúde, Farmácia, Consultas
- **Lazer**: Streaming, Viagens, Entretenimento
- **Outras Despesas**: Eventuais

**Aba "Comparativo"** - Análise percentual de gastos por categoria

**Aba "Cartão de Crédito"** - Controle de gastos no cartão

**Aba "Histórico Contas"** - Dados históricos desde 2022

**Aba "Gastos Obra 2025"** - Projetos especiais

### Cálculos Presentes na Planilha
- Média mensal de gastos por conta
- Total por categoria
- Percentual de cada categoria sobre o total
- Comparativos ano a ano
- Projeções e orçamentos

---

## Requisitos Funcionais

### 1. Dashboard Principal

**Visão Geral Mensal:**
- Cartão de resumo do mês atual com:
  - Total de gastos do mês
  - Comparação com média histórica
  - Percentual de aumento/redução vs mês anterior
  - Budget restante (se configurado)

**Gráficos Principais:**
- Gráfico de pizza: Distribuição de gastos por categoria
- Gráfico de barras: Evolução mensal dos últimos 12 meses
- Gráfico de linha: Tendência de gastos totais ao longo do ano
- Gráfico de área empilhada: Composição de gastos mensais por categoria

**Alertas e Notificações:**
- Contas próximas ao vencimento (7, 15, 30 dias)
- Gastos acima da média em alguma categoria
- Budget mensal próximo do limite

### 2. Gestão de Contas Mensais

**Cadastro de Contas Fixas:**
- Nome da conta
- Categoria
- Valor fixo ou variável
- Dia de vencimento
- Forma de pagamento (débito automático, cartão, boleto)
- Descrição/observações

**Lançamento de Valores:**
- Interface mensal tipo calendário
- Lançamento rápido de valores variáveis
- Marcar conta como paga/pendente
- Anexar comprovantes (upload de arquivo)
- Histórico de valores para contas variáveis

**Contas Recorrentes:**
- Marcação de contas que se repetem mensalmente
- Auto-preenchimento com valor do mês anterior
- Sugestão de valor baseado em média histórica

### 3. Categorização de Gastos

**Categorias Principais:**
1. **Casa**
   - IPTU
   - Condomínio
   - Água
   - Gás
   - Luz
   - Internet
   - Limpeza
   - Seguro residencial
   - Reparos e manutenção

2. **Pet (Farofa)**
   - Day Care
   - Plano de saúde
   - Alimentação
   - Veterinário
   - Medicamentos

3. **Transporte**
   - Combustível
   - Estacionamento
   - Uber/99
   - Manutenção veículo
   - IPVA
   - Seguro auto
   - Multas

4. **Alimentação**
   - Mercado
   - Restaurantes
   - Delivery
   - Padaria

5. **Saúde**
   - Plano de saúde
   - Farmácia
   - Consultas
   - Exames

6. **Lazer**
   - Streaming (Netflix, Spotify, etc)
   - Cinema/Teatro
   - Viagens
   - Hobbies

7. **Educação**
   - Cursos
   - Livros
   - Assinaturas educacionais

8. **Vestuário**
   - Roupas
   - Calçados
   - Acessórios

9. **Investimentos e Poupança**
   - Aplicações
   - Previdência privada
   - Reserva de emergência

10. **Outras Despesas**
    - Presentes
    - Doações
    - Eventuais

**Subcategorias:**
- Permitir criação de subcategorias personalizadas
- Flexibilidade para reorganizar

### 4. Gestão de Cartão de Crédito

**Múltiplos Cartões:**
- Cadastro de diferentes cartões
- Limite de cada cartão
- Data de fechamento
- Data de vencimento

**Lançamentos no Cartão:**
- Vincular gastos ao cartão específico
- Parcelamento de compras
- Acompanhar limite disponível
- Avisos de fatura próxima ao vencimento

**Fatura:**
- Visualização detalhada da fatura mensal
- Agrupamento por categoria
- Comparação com faturas anteriores
- Exportação de fatura

### 5. Orçamento (Budget)

**Definição de Budget:**
- Budget mensal total
- Budget por categoria
- Budget anual
- Metas de economia

**Acompanhamento:**
- Progresso visual (barra de progresso)
- Alertas quando ultrapassar X% do budget
- Sugestões de ajuste quando acima da meta
- Comparativo budget vs realizado

### 6. Análises e Relatórios

**Análise por Categoria:**
- Gasto total por categoria no mês
- Média mensal da categoria
- Comparação ano a ano
- Tendência (aumentando/diminuindo)
- Principais itens da categoria

**Análise Temporal:**
- Gastos mensais do ano
- Comparativo com ano anterior
- Sazonalidade (identificar meses de maior/menor gasto)
- Projeção para o restante do ano

**Análise de Variabilidade:**
- Contas fixas vs variáveis
- Volatilidade de cada categoria
- Identificar gastos atípicos (outliers)

**Relatórios Personalizados:**
- Período customizável
- Filtros por categoria, forma de pagamento
- Exportação em PDF/Excel
- Gráficos interativos

### 7. Histórico e Comparativos

**Histórico de Transações:**
- Listagem completa de todas as transações
- Filtros avançados (data, categoria, valor, status)
- Busca por descrição
- Ordenação customizável

**Comparativos:**
- Mês atual vs mês anterior
- Mês atual vs mesmo mês ano anterior
- Ano atual vs ano anterior
- Média dos últimos 3, 6, 12 meses

**Timeline:**
- Visualização cronológica de gastos
- Marcos importantes (mudanças de padrão)
- Anotações/eventos especiais

### 8. Importação e Exportação de Dados

**Importação:**
- Upload de CSV da planilha atual
- Importação de extratos bancários (OFX)
- Importação de faturas de cartão
- Mapeamento inteligente de categorias

**Exportação:**
- Excel/CSV com dados completos
- PDF de relatórios
- Backup completo do banco de dados
- API para integração com outras ferramentas

### 9. Projetos Especiais

**Gestão de Projetos:**
- Criar projetos especiais (ex: "Obra 2025")
- Orçamento específico do projeto
- Acompanhamento de gastos do projeto
- Saldo disponível
- Timeline do projeto

**Categorização Híbrida:**
- Gastos que pertencem tanto a uma categoria regular quanto a um projeto
- Visualização separada

### 10. Integração com Banco de Investimentos

**Visão Consolidada:**
- Se houver integração futura com o cockpit de investimentos:
  - Patrimônio total (investimentos + disponível)
  - Capacidade de investimento (receitas - despesas)
  - Fluxo de caixa mensal
  - Projeções de patrimônio

---

## Requisitos Não Funcionais

### Segurança
- Autenticação obrigatória (email/senha)
- Criptografia de dados sensíveis
- Backup automático
- Sessões seguras
- Proteção contra SQL injection e XSS

### Performance
- Carregamento inicial < 2 segundos
- Gráficos renderizados instantaneamente
- Suporte para histórico de 10+ anos sem degradação

### Usabilidade
- Interface intuitiva e limpa
- Mobile-friendly (responsivo)
- Tema claro/escuro
- Atalhos de teclado para ações frequentes
- Feedback visual imediato

### Compatibilidade
- Funcionar em navegadores modernos (Chrome, Firefox, Safari, Edge)
- PWA (Progressive Web App) para uso offline

---

## Melhorias em Relação à Planilha

### Automação
1. **Auto-preenchimento inteligente:**
   - Detectar padrões de gastos recorrentes
   - Sugerir valores baseados em histórico

2. **Categorização automática:**
   - Machine learning para categorizar gastos importados
   - Aprendizado com correções do usuário

3. **Alertas proativos:**
   - Email/notificação de vencimentos
   - Avisos de gastos anormais
   - Lembretes de lançamentos não feitos

### Visualização
1. **Dashboards interativos:**
   - Gráficos com drill-down
   - Filtros dinâmicos
   - Comparações em tempo real

2. **Análises preditivas:**
   - Projeção de gastos futuros
   - Simulação de cenários (e se eu gastar X em Y?)
   - Tendências e padrões

### Mobilidade
1. **App mobile-friendly:**
   - Lançamento rápido de gastos no celular
   - Foto de comprovantes
   - Notificações push

### Integrações Futuras
1. **Open Banking:**
   - Importação automática de extratos bancários
   - Conciliação automática

2. **Sincronização com outros sistemas:**
   - Google Calendar para vencimentos
   - Integração com cockpit de investimentos
   - APIs de bancos e cartões

---

## Casos de Uso Principais

### Caso de Uso 1: Lançamento Mensal de Contas
**Ator:** Usuário
**Fluxo:**
1. Usuário acessa o dashboard no início do mês
2. Sistema exibe contas recorrentes com valores sugeridos
3. Usuário confirma ou ajusta valores
4. Usuário lança contas variáveis
5. Sistema atualiza gráficos e totalizadores

### Caso de Uso 2: Análise de Gastos do Mês
**Ator:** Usuário
**Fluxo:**
1. Usuário acessa aba "Análises"
2. Seleciona mês de interesse
3. Visualiza gráficos de distribuição
4. Compara com meses anteriores
5. Identifica categoria com gasto acima do normal
6. Faz drill-down na categoria para ver detalhes

### Caso de Uso 3: Planejamento de Budget
**Ator:** Usuário
**Fluxo:**
1. Usuário acessa "Budget"
2. Define meta mensal por categoria
3. Sistema calcula budget total
4. Durante o mês, sistema acompanha progresso
5. Sistema alerta quando categoria ultrapassa 80% do budget
6. No fim do mês, gera relatório de aderência ao budget

### Caso de Uso 4: Importação da Planilha Atual
**Ator:** Usuário
**Fluxo:**
1. Usuário acessa "Importar Dados"
2. Faz upload do Excel
3. Sistema detecta estrutura e sugere mapeamento
4. Usuário confirma ou ajusta mapeamento
5. Sistema importa dados e valida
6. Sistema exibe resumo de importação
7. Dados históricos ficam disponíveis no sistema

---

## Priorização (MVP)

### Essencial (MVP - Fase 1)
- Dashboard com métricas principais
- CRUD de contas mensais
- Categorização básica
- Gráficos de pizza e barras
- Histórico de transações
- Importação de CSV
- Autenticação

### Importante (Fase 2)
- Gestão de cartão de crédito
- Budget e metas
- Análises e comparativos
- Alertas de vencimento
- Tema claro/escuro

### Desejável (Fase 3)
- Projetos especiais
- Relatórios personalizados
- App mobile otimizado
- Categorização automática
- Integração com Open Banking

---

## Diferenciais

1. **Visual atraente:** Interface moderna e agradável, inspirada no cockpit de investimentos
2. **Insights automáticos:** "Você gastou 30% a mais em Alimentação este mês"
3. **Gamificação:** Metas, badges por economia, streaks de lançamentos diários
4. **Compartilhamento:** Possibilidade de compartilhar visualizações com família
5. **Flexibilidade:** Adaptável a diferentes perfis de uso (pessoa física, casal, família)

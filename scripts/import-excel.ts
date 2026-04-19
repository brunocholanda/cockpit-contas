import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

interface ExcelData {
  categories: Array<{
    name: string;
    type: string;
    color: string;
    icon: string;
    group: string;
  }>;
  transactions: Array<{
    categoryName: string;
    description: string;
    amount: number;
    date: string;
    status: string;
    paymentMethod: string;
  }>;
}

async function main() {
  console.log('🚀 Iniciando importação de dados da planilha...\n');

  // Buscar ou criar usuário
  let user = await prisma.user.findFirst();

  if (!user) {
    console.log('❌ Nenhum usuário encontrado. Por favor, crie uma conta primeiro.');
    return;
  }

  console.log(`✅ Usuário encontrado: ${user.email}\n`);

  // Executar script Python para extrair dados do Excel
  console.log('📊 Extraindo dados do Excel...');
  const pythonScript = `
import openpyxl
import json
from datetime import datetime

wb = openpyxl.load_workbook('/Users/bholanda/Desktop/cockpit-contas/Contas dos xuxus.xlsx', data_only=True)
ws = wb['2025']

# Mapeamento de categorias com cores e ícones
# Tipo sempre DESPESA (o Prisma só tem DESPESA e RECEITA)
category_mapping = {
    'IPTU': {'type': 'DESPESA', 'color': '#EF4444', 'icon': 'Home', 'group': 'Casa'},
    'Condomínio': {'type': 'DESPESA', 'color': '#8B5CF6', 'icon': 'Building2', 'group': 'Casa'},
    'Água': {'type': 'DESPESA', 'color': '#3B82F6', 'icon': 'Droplets', 'group': 'Casa'},
    'Gás': {'type': 'DESPESA', 'color': '#F59E0B', 'icon': 'Flame', 'group': 'Casa'},
    'Luz': {'type': 'DESPESA', 'color': '#FBBF24', 'icon': 'Lightbulb', 'group': 'Casa'},
    'Limpeza': {'type': 'DESPESA', 'color': '#10B981', 'icon': 'Sparkles', 'group': 'Casa'},
    'Internet': {'type': 'DESPESA', 'color': '#6366F1', 'icon': 'Wifi', 'group': 'Casa'},
    'Manutenção Elevador': {'type': 'DESPESA', 'color': '#64748B', 'icon': 'ArrowUpDown', 'group': 'Casa'},
    'Seguro Casa': {'type': 'DESPESA', 'color': '#EC4899', 'icon': 'Shield', 'group': 'Casa'},
    'Demais gastos casa': {'type': 'DESPESA', 'color': '#94A3B8', 'icon': 'Home', 'group': 'Casa'},

    'Day care Farofa': {'type': 'DESPESA', 'color': '#F97316', 'icon': 'Dog', 'group': 'Pet'},
    'Adestramento Farofa': {'type': 'DESPESA', 'color': '#FB923C', 'icon': 'Dog', 'group': 'Pet'},
    'Plano de saúde': {'type': 'DESPESA', 'color': '#F87171', 'icon': 'Heart', 'group': 'Pet'},
    'Demais gastos Farofa': {'type': 'DESPESA', 'color': '#FCA5A5', 'icon': 'Dog', 'group': 'Pet'},

    'IPVA + licenciamento': {'type': 'DESPESA', 'color': '#14B8A6', 'icon': 'Car', 'group': 'Transporte'},
    'Seguro Carro': {'type': 'DESPESA', 'color': '#06B6D4', 'icon': 'Shield', 'group': 'Transporte'},
    'Conectcar': {'type': 'DESPESA', 'color': '#22D3EE', 'icon': 'Ticket', 'group': 'Transporte'},
    'Combustível': {'type': 'DESPESA', 'color': '#0EA5E9', 'icon': 'Fuel', 'group': 'Transporte'},
    'Manutenção Carro': {'type': 'DESPESA', 'color': '#0284C7', 'icon': 'Wrench', 'group': 'Transporte'},
    'Estacionamento': {'type': 'DESPESA', 'color': '#38BDF8', 'icon': 'ParkingCircle', 'group': 'Transporte'},

    'Alimentação': {'type': 'DESPESA', 'color': '#84CC16', 'icon': 'UtensilsCrossed', 'group': 'Alimentação'},
    'Mercado': {'type': 'DESPESA', 'color': '#A3E635', 'icon': 'ShoppingCart', 'group': 'Alimentação'},
    'Restaurante': {'type': 'DESPESA', 'color': '#BEF264', 'icon': 'Coffee', 'group': 'Alimentação'},

    'Saúde': {'type': 'DESPESA', 'color': '#F43F5E', 'icon': 'Heart', 'group': 'Saúde'},
    'Farmácia': {'type': 'DESPESA', 'color': '#FB7185', 'icon': 'Pill', 'group': 'Saúde'},

    'Lazer': {'type': 'DESPESA', 'color': '#A855F7', 'icon': 'PartyPopper', 'group': 'Lazer'},
    'Viagem': {'type': 'DESPESA', 'color': '#C084FC', 'icon': 'Plane', 'group': 'Lazer'},
}

categories = []
transactions = []

# Pegar datas do cabeçalho (linha 3, colunas B-M)
dates = []
for col in range(2, 14):  # Colunas B (2) até M (13)
    cell_value = ws.cell(row=3, column=col).value
    if isinstance(cell_value, datetime):
        dates.append(cell_value)

# Processar cada linha de dados
for row_idx in range(4, 100):  # Começar da linha 4
    category_name = ws.cell(row=row_idx, column=1).value

    if not category_name or category_name.startswith('Total'):
        continue

    # Pular linhas vazias
    if category_name.strip() == '':
        continue

    # Adicionar categoria se ainda não existe
    if category_name in category_mapping and category_name not in [c['name'] for c in categories]:
        mapping = category_mapping[category_name]
        categories.append({
            'name': category_name,
            'type': mapping['type'],
            'color': mapping['color'],
            'icon': mapping['icon'],
            'group': mapping['group']
        })

    # Processar valores mensais
    for col_idx, date in enumerate(dates, start=2):
        value = ws.cell(row=row_idx, column=col_idx).value

        if value and isinstance(value, (int, float)) and value > 0:
            transactions.append({
                'categoryName': category_name,
                'description': category_name,
                'amount': float(value),
                'date': date.strftime('%Y-%m-%d'),
                'status': 'PAGO',
                'paymentMethod': 'DEBITO'
            })

# Processar aba de Cartão de Crédito
ws_cartao = wb['Cartão de Crédito']

# Pegar datas do cabeçalho (linha 4, colunas B em diante)
cartao_dates = []
for col in range(2, 18):  # Colunas B até...
    cell_value = ws_cartao.cell(row=4, column=col).value
    if isinstance(cell_value, datetime):
        cartao_dates.append(cell_value)

# Processar linhas do cartão
for row_idx in range(5, 50):
    category_name = ws_cartao.cell(row=row_idx, column=1).value

    if not category_name or category_name.strip() == '':
        continue

    # Adicionar categoria se ainda não existe
    if category_name in category_mapping and category_name not in [c['name'] for c in categories]:
        mapping = category_mapping[category_name]
        categories.append({
            'name': category_name,
            'type': mapping['type'],
            'color': mapping['color'],
            'icon': mapping['icon'],
            'group': mapping['group']
        })

    # Processar valores mensais
    for col_idx, date in enumerate(cartao_dates, start=2):
        value = ws_cartao.cell(row=row_idx, column=col_idx).value

        if value and isinstance(value, (int, float)) and value > 0:
            # Verificar se já não existe essa transação (evitar duplicatas)
            existing = False
            for t in transactions:
                if (t['categoryName'] == category_name and
                    t['date'] == date.strftime('%Y-%m-%d') and
                    abs(t['amount'] - float(value)) < 0.01):
                    existing = True
                    # Atualizar para CREDITO se veio do cartão
                    t['paymentMethod'] = 'CREDITO'
                    break

            if not existing:
                transactions.append({
                    'categoryName': category_name,
                    'description': category_name + ' (Cartão)',
                    'amount': float(value),
                    'date': date.strftime('%Y-%m-%d'),
                    'status': 'PAGO',
                    'paymentMethod': 'CREDITO'
                })

result = {
    'categories': categories,
    'transactions': transactions
}

print(json.dumps(result, ensure_ascii=False))
`;

  const excelDataJson = execSync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer
  });

  const excelData: ExcelData = JSON.parse(excelDataJson);

  console.log(`✅ Extraídos: ${excelData.categories.length} categorias, ${excelData.transactions.length} transações\n`);

  // Criar categorias
  console.log('📝 Criando categorias...');
  const categoryMap = new Map<string, string>();

  for (const cat of excelData.categories) {
    // Verificar se já existe
    let category = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name: cat.name,
      },
    });

    // Criar se não existe
    if (!category) {
      category = await prisma.category.create({
        data: {
          userId: user.id,
          name: cat.name,
          type: cat.type as any,
          color: cat.color,
          icon: cat.icon,
        },
      });
      console.log(`  ✓ ${cat.name} (${cat.type})`);
    } else {
      console.log(`  → ${cat.name} (já existe)`);
    }

    categoryMap.set(cat.name, category.id);
  }

  console.log(`\n✅ ${excelData.categories.length} categorias criadas!\n`);

  // Criar transações
  console.log('💰 Criando transações...');
  let createdCount = 0;
  let skippedCount = 0;

  for (const trans of excelData.transactions) {
    const categoryId = categoryMap.get(trans.categoryName);

    if (!categoryId) {
      console.log(`  ⚠️  Categoria não encontrada: ${trans.categoryName}`);
      skippedCount++;
      continue;
    }

    try {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          categoryId,
          description: trans.description,
          amount: trans.amount,
          transactionDate: new Date(trans.date),
          status: trans.status as any,
          paymentMethod: trans.paymentMethod as any,
        },
      });
      createdCount++;

      if (createdCount % 50 === 0) {
        console.log(`  ${createdCount} transações criadas...`);
      }
    } catch (error: any) {
      console.log(`  ⚠️  Erro ao criar transação: ${error.message}`);
      skippedCount++;
    }
  }

  console.log(`\n✅ Importação concluída!`);
  console.log(`   ${createdCount} transações criadas`);
  console.log(`   ${skippedCount} transações puladas\n`);

  // Estatísticas
  const totalTransactions = await prisma.transaction.count({ where: { userId: user.id } });
  const totalCategories = await prisma.category.count({ where: { userId: user.id } });
  const totalAmount = await prisma.transaction.aggregate({
    where: { userId: user.id },
    _sum: { amount: true },
  });

  console.log('📊 Estatísticas:');
  console.log(`   ${totalCategories} categorias no banco`);
  console.log(`   ${totalTransactions} transações no banco`);
  console.log(`   Total de gastos: R$ ${totalAmount._sum.amount?.toFixed(2) || 0}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando importação COMPLETA da planilha...\n');

  // Buscar usuário
  let user = await prisma.user.findFirst();

  if (!user) {
    console.log('❌ Nenhum usuário encontrado. Por favor, crie uma conta primeiro.');
    return;
  }

  console.log(`✅ Usuário encontrado: ${user.email}\n`);

  // LIMPAR dados antigos primeiro
  console.log('🧹 Limpando transações antigas...');
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  console.log('✅ Transações antigas removidas\n');

  // Executar script Python para extrair dados do Excel
  console.log('📊 Extraindo TODOS os dados do Excel...');
  const pythonScript = `
import openpyxl
import json
from datetime import datetime

wb = openpyxl.load_workbook('/Users/bholanda/Desktop/cockpit-contas/Contas dos xuxus.xlsx', data_only=True)

# Mapeamento COMPLETO de categorias
category_mapping = {
    # Casa
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
    'Empréstimo Casa': {'type': 'DESPESA', 'color': '#DC2626', 'icon': 'Home', 'group': 'Casa'},

    # Pet
    'Day care Farofa': {'type': 'DESPESA', 'color': '#F97316', 'icon': 'Dog', 'group': 'Pet'},
    'Adestramento Farofa': {'type': 'DESPESA', 'color': '#FB923C', 'icon': 'Dog', 'group': 'Pet'},
    'Plano de saúde': {'type': 'DESPESA', 'color': '#F87171', 'icon': 'Heart', 'group': 'Pet'},
    'Demais gastos Farofa': {'type': 'DESPESA', 'color': '#FCA5A5', 'icon': 'Dog', 'group': 'Pet'},

    # Transporte
    'IPVA + licenciamento': {'type': 'DESPESA', 'color': '#14B8A6', 'icon': 'Car', 'group': 'Transporte'},
    'Seguro Carro': {'type': 'DESPESA', 'color': '#06B6D4', 'icon': 'Shield', 'group': 'Transporte'},
    'Conectcar': {'type': 'DESPESA', 'color': '#22D3EE', 'icon': 'Ticket', 'group': 'Transporte'},
    'Combustível': {'type': 'DESPESA', 'color': '#0EA5E9', 'icon': 'Fuel', 'group': 'Transporte'},
    'Manutenção Carro': {'type': 'DESPESA', 'color': '#0284C7', 'icon': 'Wrench', 'group': 'Transporte'},
    'Uber': {'type': 'DESPESA', 'color': '#000000', 'icon': 'Car', 'group': 'Transporte'},

    # Alimentação
    'Mercado': {'type': 'DESPESA', 'color': '#A3E635', 'icon': 'ShoppingCart', 'group': 'Alimentação'},
    'Restaurante': {'type': 'DESPESA', 'color': '#BEF264', 'icon': 'Coffee', 'group': 'Alimentação'},
    'Ifood': {'type': 'DESPESA', 'color': '#EA580C', 'icon': 'UtensilsCrossed', 'group': 'Alimentação'},
    'Vinho': {'type': 'DESPESA', 'color': '#7C2D12', 'icon': 'Wine', 'group': 'Alimentação'},

    # Saúde
    'Médicos': {'type': 'DESPESA', 'color': '#DC2626', 'icon': 'Stethoscope', 'group': 'Saúde'},
    'Farmácia': {'type': 'DESPESA', 'color': '#FB7185', 'icon': 'Pill', 'group': 'Saúde'},

    # Lazer
    ' Viagem': {'type': 'DESPESA', 'color': '#C084FC', 'icon': 'Plane', 'group': 'Lazer'},
    'Lazer': {'type': 'DESPESA', 'color': '#A855F7', 'icon': 'PartyPopper', 'group': 'Lazer'},
    'Viagem': {'type': 'DESPESA', 'color': '#9333EA', 'icon': 'Plane', 'group': 'Lazer'},
    'Presentes': {'type': 'DESPESA', 'color': '#EC4899', 'icon': 'Gift', 'group': 'Lazer'},

    # Outros
    'Bebê': {'type': 'DESPESA', 'color': '#FDE047', 'icon': 'Baby', 'group': 'Outros'},
    'Outras despesas': {'type': 'DESPESA', 'color': '#9CA3AF', 'icon': 'MoreHorizontal', 'group': 'Outros'},
    'Vinhos': {'type': 'DESPESA', 'color': '#7C2D12', 'icon': 'Wine', 'group': 'Alimentação'},
}

categories = []
transactions = []

# ===== PROCESSAR ABA 2025 =====
ws = wb['2025']

# Pegar TODAS as 12 datas (colunas B-M = 2-13)
dates_2025 = []
for col in range(2, 14):  # Colunas 2 a 13 (12 meses)
    cell_value = ws.cell(row=3, column=col).value
    if isinstance(cell_value, datetime):
        dates_2025.append((col, cell_value))

print(f'Encontrados {len(dates_2025)} meses na aba 2025', file=__import__('sys').stderr)

# Processar TODAS as linhas
for row_idx in range(4, 100):
    category_name = ws.cell(row=row_idx, column=1).value

    if not category_name:
        continue

    category_name = category_name.strip()

    # Pular totalizadores
    if 'Total' in category_name or 'Gastos Totais' in category_name:
        continue

    # Adicionar categoria se mapeada
    if category_name in category_mapping and category_name not in [c['name'] for c in categories]:
        mapping = category_mapping[category_name]
        categories.append({
            'name': category_name,
            'type': mapping['type'],
            'color': mapping['color'],
            'icon': mapping['icon'],
            'group': mapping['group']
        })

    # Processar todos os meses
    for col_idx, date in dates_2025:
        value = ws.cell(row=row_idx, column=col_idx).value

        if value and isinstance(value, (int, float)) and value > 0:
            if category_name in category_mapping:
                transactions.append({
                    'categoryName': category_name,
                    'description': category_name,
                    'amount': float(value),
                    'date': date.strftime('%Y-%m-%d'),
                    'status': 'PAGO',
                    'paymentMethod': 'DEBITO',
                    'source': '2025'
                })

# ===== PROCESSAR ABA CARTÃO DE CRÉDITO =====
ws_cartao = wb['Cartão de Crédito']

# Pegar todas as datas (linha 4)
dates_cartao = []
for col in range(2, 19):  # Até coluna 18
    cell_value = ws_cartao.cell(row=4, column=col).value
    if isinstance(cell_value, datetime):
        dates_cartao.append((col, cell_value))

print(f'Encontrados {len(dates_cartao)} meses na aba Cartão', file=__import__('sys').stderr)

# Processar linhas do cartão
for row_idx in range(5, 100):
    category_name = ws_cartao.cell(row=row_idx, column=1).value

    if not category_name:
        continue

    category_name = category_name.strip()

    # Pular totalizadores
    if 'Total' in category_name or 'Check' in category_name or 'reembolso' in category_name:
        continue

    # Ajustar nomes específicos do cartão
    if category_name == 'Plano de saúde Farofa':
        category_name = 'Plano de saúde'
    elif category_name == 'Day Care Farofa':
        category_name = 'Day care Farofa'

    # Adicionar categoria se mapeada
    if category_name in category_mapping and category_name not in [c['name'] for c in categories]:
        mapping = category_mapping[category_name]
        categories.append({
            'name': category_name,
            'type': mapping['type'],
            'color': mapping['color'],
            'icon': mapping['icon'],
            'group': mapping['group']
        })

    # Processar todos os meses
    for col_idx, date in dates_cartao:
        value = ws_cartao.cell(row=row_idx, column=col_idx).value

        if value and isinstance(value, (int, float)) and value > 0:
            if category_name in category_mapping:
                date_str = date.strftime('%Y-%m-%d')

                # Verificar se é mês de 2025 (pode ser duplicata)
                year = date.year
                if year == 2025:
                    # Verificar se já existe na aba 2025
                    duplicate = False
                    for t in transactions:
                        if (t['categoryName'] == category_name and
                            t['date'] == date_str and
                            t['source'] == '2025' and
                            abs(t['amount'] - float(value)) < 0.01):
                            # É duplicata, atualizar para CREDITO
                            t['paymentMethod'] = 'CREDITO'
                            t['description'] = category_name + ' (Cartão)'
                            duplicate = True
                            break

                    if duplicate:
                        continue

                # Não é duplicata ou é de 2024/2026, adicionar
                transactions.append({
                    'categoryName': category_name,
                    'description': category_name + ' (Cartão)',
                    'amount': float(value),
                    'date': date_str,
                    'status': 'PAGO',
                    'paymentMethod': 'CREDITO',
                    'source': 'Cartão'
                })

result = {
    'categories': categories,
    'transactions': transactions
}

print(json.dumps(result, ensure_ascii=False))
`;

  const excelDataJson = execSync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, {
    encoding: 'utf-8',
    maxBuffer: 20 * 1024 * 1024, // 20MB buffer
  });

  const excelData = JSON.parse(excelDataJson);

  console.log(`✅ Extraídos: ${excelData.categories.length} categorias, ${excelData.transactions.length} transações\n`);

  // Criar categorias
  console.log('📝 Criando categorias...');
  const categoryMap = new Map<string, string>();

  for (const cat of excelData.categories) {
    let category = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name: cat.name,
      },
    });

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
      console.log(`  ✓ ${cat.name}`);
    } else {
      console.log(`  → ${cat.name} (já existe)`);
    }

    categoryMap.set(cat.name, category.id);
  }

  console.log(`\n✅ ${excelData.categories.length} categorias prontas!\n`);

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

      if (createdCount % 100 === 0) {
        console.log(`  ${createdCount} transações criadas...`);
      }
    } catch (error: any) {
      console.log(`  ⚠️  Erro: ${error.message}`);
      skippedCount++;
    }
  }

  console.log(`\n✅ Importação COMPLETA concluída!`);
  console.log(`   ${createdCount} transações criadas`);
  console.log(`   ${skippedCount} transações puladas\n`);

  // Estatísticas finais
  const totalTransactions = await prisma.transaction.count({ where: { userId: user.id } });
  const totalCategories = await prisma.category.count({ where: { userId: user.id } });
  const totalAmount = await prisma.transaction.aggregate({
    where: { userId: user.id },
    _sum: { amount: true },
  });

  console.log('📊 Estatísticas Finais:');
  console.log(`   ${totalCategories} categorias no banco`);
  console.log(`   ${totalTransactions} transações no banco`);
  console.log(`   Total de gastos: R$ ${totalAmount._sum.amount?.toFixed(2) || 0}`);
  console.log('\n✨ Dados prontos para visualização no dashboard!');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

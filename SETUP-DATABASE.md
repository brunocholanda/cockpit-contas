# Configuração do Banco de Dados

## Opção 1: Supabase (Recomendado - Grátis)

1. Acesse https://supabase.com
2. Crie uma conta (se não tiver)
3. Clique em "New Project"
4. Preencha:
   - Name: cockpit-contas
   - Database Password: [escolha uma senha forte]
   - Region: South America (São Paulo)
5. Aguarde a criação do projeto (1-2 minutos)
6. Vá em Settings > Database
7. Copie a "Connection string" em "Connection pooling"
8. Edite o arquivo `.env` e substitua a DATABASE_URL pela string copiada
9. Certifique-se de substituir `[YOUR-PASSWORD]` pela senha que você criou

## Opção 2: PostgreSQL Local

### macOS (usando Homebrew):
```bash
# Instalar PostgreSQL
brew install postgresql@15

# Iniciar o serviço
brew services start postgresql@15

# Criar o banco de dados
createdb cockpit_contas
```

### Verificar se a DATABASE_URL no .env está correta:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cockpit_contas"
```

## Próximos Passos (Após escolher uma opção)

Execute os seguintes comandos no terminal:

```bash
# 1. Gerar o Prisma Client
npx prisma generate

# 2. Criar as tabelas no banco de dados
npx prisma db push

# 3. (Opcional) Abrir o Prisma Studio para visualizar o banco
npx prisma studio
```

## Verificar se funcionou

Execute o projeto:
```bash
npm run dev
```

Acesse http://localhost:3000 e tente criar uma conta. Se conseguir registrar e fazer login, está tudo funcionando!

## Problemas Comuns

### Erro de conexão com o banco
- Verifique se a DATABASE_URL está correta no .env
- Se usando Supabase, certifique-se de substituir [YOUR-PASSWORD]
- Se usando local, certifique-se que o PostgreSQL está rodando

### Erro "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Tabelas não foram criadas
```bash
npx prisma db push --force-reset
```

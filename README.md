# RMS CargoTrack Pro - v5.5.8

Sistema de rastreamento de cargas com autenticação NextAuth.

## Setup Local

1. Instale dependências:
   ```bash
   npm install
   ```

2. Configure .env:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   GITHUB_ID="your-github-id"
   GITHUB_SECRET="your-github-secret"
   GOOGLE_ID="your-google-id"
   GOOGLE_SECRET="your-google-secret"
   ```

3. Rode migrations e inicie:
   ```bash
   npm run build
   npm start
   ```

4. (Opcional) Popular com dados de teste:
   ```bash
   npm run prisma:seed
   ```

## Deploy Railway

### Passo a passo

1. **Adicione PostgreSQL ao projeto:**
   - No Railway, clique em "New" → "Database" → "Add PostgreSQL"
   - Conecte ao seu serviço

2. **Configure variáveis de ambiente:**
   - `DATABASE_URL` → Já vem do PostgreSQL automaticamente
   - `NEXTAUTH_URL` → `https://seu-app.railway.app`
   - `NEXTAUTH_SECRET` → Gere com: `openssl rand -base64 32`
   - `GITHUB_ID` e `GITHUB_SECRET` → (opcional)
   - `GOOGLE_ID` e `GOOGLE_SECRET` → (opcional)

3. **Faça deploy:**
   - Commit e push para GitHub
   - Railway fará deploy automaticamente
   - As migrations serão aplicadas no start

4. **Verifique os logs:**
   - Procure por: "Running migration: 20241030000000_init"
   - Deve mostrar: "Database connected"

5. **(Opcional) Rode o seed:**
   ```bash
   npm run prisma:seed
   ```

## O que há de novo na v5.5.8

✅ **Migration inicial incluída** (`prisma/migrations/20241030000000_init/`)
- Cria todas as tabelas necessárias
- Shipment, User, Account, Session, VerificationToken
- Todos os índices e foreign keys

✅ **migration_lock.toml** incluído
- Garante que o Prisma reconheça as migrations

✅ **.dockerignore** configurado
- Garante que migrations sejam incluídas no build

✅ **Logs melhorados**
- Mostra quando migrations são aplicadas
- Mostra status da conexão

## Troubleshooting

### Se ainda der erro "table does not exist"

1. **Verifique se as migrations estão no repositório:**
   ```bash
   ls -la prisma/migrations/
   ```
   Deve mostrar a pasta `20241030000000_init/`

2. **Rode manualmente no Railway console:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Veja a saída completa:**
   - Deve mostrar: "Running migration: 20241030000000_init"
   - Deve mostrar: "Applied migration 20241030000000_init"

4. **Se necessário, force reset (CUIDADO: apaga dados):**
   ```bash
   npx prisma migrate reset --force
   ```

## Estrutura

```
prisma/
  migrations/
    20241030000000_init/
      migration.sql          ← SQL que cria as tabelas
    migration_lock.toml      ← Lock file do Prisma
  schema.prisma              ← Schema do banco
  seed.ts                    ← Dados iniciais
```

## v5.5.8 Changes

- ✅ Adicionada migration inicial completa
- ✅ migration_lock.toml incluído
- ✅ .dockerignore configurado
- ✅ Todas as tabelas serão criadas automaticamente

## v5.5.7 Changes

- Error boundary com mensagens detalhadas
- Logs de conexão do banco de dados
- Try/catch em todas as operações

## v5.5.6 Changes

- Movido `prisma migrate deploy` de `postbuild` para `start`

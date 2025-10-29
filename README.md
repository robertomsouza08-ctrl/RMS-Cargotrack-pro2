# RMS CargoTrack Pro - v5.5.4

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

3. Rode migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   npm run prisma:seed
   ```

4. Inicie:
   ```bash
   npm run dev
   ```

## Deploy Railway

1. Crie novo projeto no Railway
2. Adicione PostgreSQL database
3. Configure variáveis de ambiente (veja .env.example)
4. Conecte ao GitHub repo
5. Railway detectará automaticamente e fará deploy
6. Após deploy, rode via Railway CLI ou console:
   ```bash
   npx prisma migrate deploy
   npm run prisma:seed
   ```

## Estrutura

- src/app/page.tsx - Home com listagem e busca
- src/app/shipments/[id]/page.tsx - Detalhe do shipment
- src/app/components/CreateForm.tsx - Form de criação (client)
- src/app/api/auth/[...nextauth]/route.ts - NextAuth config
- src/lib/prisma.ts - Prisma client singleton
- prisma/schema.prisma - Database schema

## v5.5.4 Changes

- Reconstrução completa com estrutura correta de arquivos
- Todos os imports de prisma corrigidos
- NextAuth configurado com GitHub e Google
- Server Actions para criar e atualizar shipments
- Proteção de rotas via getServerSession

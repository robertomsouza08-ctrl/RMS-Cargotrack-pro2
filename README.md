
# RMS CargoTrack Pro — Simplificado (1 serviço)

Deploy ultra simples: 1 app Next.js com API embutida.

## Rodar local
- npm install
- npm run dev
- http://localhost:3000
- Health: http://localhost:3000/api/health

## Deploy no Railway (um serviço, sem Docker)
1) Suba este repositório no GitHub.
2) Railway > New Project > Deploy from GitHub (escolha este repo).
3) Não precisa configurar variáveis. O Nixpacks detecta Next.js e roda:
   - npm run build
   - npm start (escuta na porta $PORT que o Railway injeta)
4) A URL pública funcionará imediatamente.

## Variáveis opcionais
- NEXT_PUBLIC_BASE_URL: por padrão vazio. No Railway não é necessário, pois os fetchs usam caminhos relativos.

## Endpoints
- GET /api/health -> { status: 'ok', uptime }
- GET /api/shipments -> lista seed em memória

## Observação
Esta versão é para validação rápida. Depois podemos evoluir para Postgres/Prisma e serviços separados quando desejar.


Nota v2: adicionadas devDependencies de TypeScript e favicon para build no Railway.


Nota v3: uso de baseUrl absoluta em server components para evitar ERR_INVALID_URL atrás de proxy. Você pode definir NEXT_PUBLIC_BASE_URL opcionalmente.


Nota v4 (UI): header navy/teal/amber, cards responsivos, badges de status, página de detalhes de shipment, meta tags/icone.


## v5 (UI + DB SQLite via Prisma)
- Prisma + SQLite local (DATABASE_URL=file:./dev.db por padrão)
- Seed automático através do script `npm run prisma:seed` após migrações
- CRUD em /api/shipments

### Rodar local
- npm install
- npx prisma migrate deploy --schema prisma/schema.prisma
- npm run prisma:seed
- npm run dev

### Deploy no Railway (1 serviço)
O Nixpacks instalará devDependencies e executará o build do Next. Recomenda-se adicionar um Hook de Deploy (opcional) para aplicar migrações e seed automaticamente:
- Deploy Command (Settings > Deploy): `npx prisma migrate deploy && npm run prisma:seed && npm start`
Se preferir manter o fluxo padrão (npm run build -> npm start), rode as migrações/seed manualmente no Shell do serviço após o primeiro deploy:
- `npx prisma migrate deploy && npm run prisma:seed`

### Endpoints
- GET /api/shipments?q=texto&status=IN_TRANSIT|CHECKED_IN|DELIVERED
- POST /api/shipments { code, origin, destination, status?, eta? }
- GET /api/shipments/:id
- PATCH /api/shipments/:id { code?, origin?, destination?, status?, eta? }
- DELETE /api/shipments/:id

### Exemplos curl
```bash
# listar
curl "$URL/api/shipments"

# criar
curl -X POST "$URL/api/shipments" -H 'content-type: application/json'   -d '{"code":"CTP-100","origin":"SP","destination":"BA","status":"IN_TRANSIT","eta":"2025-11-10"}'

# atualizar
curl -X PATCH "$URL/api/shipments/ID_AQUI" -H 'content-type: application/json' -d '{"status":"DELIVERED"}'

# excluir
curl -X DELETE "$URL/api/shipments/ID_AQUI"
```


Nota v5.1: schema sem enum (status como string) para garantir compatibilidade no Railway.


Nota v5.1.1: imports ajustados para caminhos relativos e alias @ opcional no tsconfig.


Nota v5.1.2: bootstrap de ambiente adicionando default DATABASE_URL=file:./dev.db e scripts com cross-env para garantir funcionamento no Railway sem variáveis.


## v5.2 (UI refinada e identidade visual)
- Logo SVG no header (navy/teal/amber) e metadata OG/Twitter
- Paginação e ordenação (por ETA, status, createdAt)
- Estado vazio e mensagens de "Nenhum resultado"
- Edição rápida de status na página de detalhes
- API /api/shipments com suporte a limit, offset, sortBy, sortDir

### Endpoints atualizados
- GET /api/shipments?q=&status=&limit=12&offset=0&sortBy=createdAt&sortDir=desc
  - Retorna: { data: Shipment[], total: number, limit: number, offset: number }
- PATCH /api/shipments/:id { status: "IN_TRANSIT"|"CHECKED_IN"|"DELIVERED" }

### Exemplos curl
```bash
# listar com paginação
curl "$URL/api/shipments?limit=10&offset=0&sortBy=eta&sortDir=asc"

# atualizar status
curl -X PATCH "$URL/api/shipments/ID_AQUI" -H 'content-type: application/json' -d '{"status":"DELIVERED"}'
```


## v5.3 (Mapas Leaflet + Background moderno)
- Mapa interativo na página de detalhes com Leaflet + OpenStreetMap
- Pins coloridos por status (teal=IN_TRANSIT, amber=CHECKED_IN, green=DELIVERED)
- Linha tracejada conectando origem → destino
- Background moderno com containers, caminhões, navios, aviões e motos
- Schema atualizado com campos de coordenadas (originLat, originLng, destLat, destLng)
- Seeds com 20 shipments e coordenadas de cidades brasileiras

### Novos campos no Shipment
- originLat, originLng, destLat, destLng (Float, nullable)

### Deploy
```bash
# Local
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev

# Railway
# Após push, rode no Shell:
npx prisma migrate deploy && npm run prisma:seed
```

### Criar shipment com coordenadas via API
```bash
curl -X POST "$URL/api/shipments" \
  -H 'content-type: application/json' \
  -d '{
    "code": "SHIP-9999",
    "origin": "São Paulo",
    "destination": "Rio de Janeiro",
    "status": "IN_TRANSIT",
    "originLat": -23.5505,
    "originLng": -46.6333,
    "destLat": -22.9068,
    "destLng": -43.1729
  }'
```


## v5.4 (Migração para Postgres)
- Provider do Prisma atualizado para `postgresql`
- Migration de inicialização para Postgres
- Necessário definir `DATABASE_URL` (Railway Database → Add Reference)

### Railway (Passo a passo)
1. No projeto, clique em New → Database → PostgreSQL
2. No seu serviço web, abra Variables → Add Reference → selecione DATABASE_URL do Postgres
3. Deploy
4. No Shell do serviço, execute:
```
npx prisma migrate deploy
npm run prisma:seed
```

### Desenvolvimento local (Docker Postgres opcional)
```
docker run --name rms-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Observação: Em produção, `DATABASE_URL` é obrigatório; o app falha cedo se não estiver definido.


## v5.5 (NextAuth + Proteção)
- Provedores GitHub e Google habilitados
- /signin com botões para login
- API protegida para criar/editar
- UI condicional para criar/editar somente autenticado

### Variáveis
- NEXTAUTH_URL=https://SEU_DOMINIO
- NEXTAUTH_SECRET=(openssl rand -base64 32)
- GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET

### Redirect URIs
- GitHub: https://SEU_DOMINIO/api/auth/callback/github
- Google: https://SEU_DOMINIO/api/auth/callback/google


## v5.5.1 (Auth fix)
- Atualizado `nodemailer` para `^7.0.7` para compatibilidade com `next-auth@4.24.x`.
- Caso veja `npm ERR! ERESOLVE` sobre peerDependencies, rode `npm install` novamente ou limpe cache (`npm cache verify`).

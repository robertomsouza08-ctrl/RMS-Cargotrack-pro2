
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

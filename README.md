
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

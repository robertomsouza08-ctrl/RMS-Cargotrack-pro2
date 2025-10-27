
# RMS CargoTrack Pro — Final

Pronto para rodar localmente (Docker Compose) e fazer deploy no Railway.

## Rodar local (recomendado)
1. docker compose up --build
2. Testes:
   - API: http://localhost:4000/health e http://localhost:4000/shipments
   - Web: http://localhost:3000 (lista os shipments seed)

## Deploy no Railway
1. Suba este projeto no GitHub.
2. No Railway: New Project > Deploy from GitHub (este repo).
3. Adicione Postgres ao projeto (Add > Database > PostgreSQL). A `DATABASE_URL` será injetada na API.
4. Variáveis:
   - API: defina `JWT_SECRET` e (opcional) `CORS_ORIGINS` e S3_*
   - Web: defina `NEXT_PUBLIC_API_URL` para a URL pública da API (ex.: https://xxxxx.up.railway.app)
5. A API aplica migrações automaticamente em produção. O Web consome `NEXT_PUBLIC_API_URL`.
6. Testes públicos:
   - API: https://<api>.up.railway.app/health
   - Web: https://<web>.up.railway.app/

## Notas
- Mapbox é opcional para o primeiro teste.
- CORS: liberal por padrão em dev. Em prod, ajuste `CORS_ORIGINS`.
- Seeds mínimos criados automaticamente no ambiente dev (docker-compose).

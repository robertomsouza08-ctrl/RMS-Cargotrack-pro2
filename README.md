
# RMS CargoTrack Pro — Auto Deploy

Este repositório está pronto para deploy no Railway com 2 serviços: API (NestJS) e Web (Next.js), usando Dockerfiles dedicados.

## Estrutura
- apps/api: API NestJS + Prisma
- apps/web: Next.js painel web
- railway.json: descreve serviços, contextos e Dockerfiles

## Deploy (sem setup manual)
1) Suba este repositório no GitHub.
2) No Railway, clique em New Project > Deploy from GitHub e selecione o repositório.
3) O Railway criará os serviços automaticamente (api e web) lendo o railway.json.
4) Banco de dados Postgres:
   - Adicione um serviço Postgres no projeto (Add > Database > Postgres). O Railway injetará `DATABASE_URL` na API.
5) Variáveis:
   - API: defina `JWT_SECRET`, `S3_*` com seus valores. `CORS_ORIGINS` pode ser `*` em teste.
   - Web: defina `NEXT_PUBLIC_API_URL` apontando para a URL pública da API após o primeiro deploy, e `NEXT_PUBLIC_MAPBOX_TOKEN`.
6) Deploy: os builds rodarão via Docker automaticamente. A API executa `prisma migrate deploy` no start em produção e expõe `GET /health`.

## Healthcheck
- API: GET /health -> `{ status: 'ok', uptime: <segundos> }`

## Observações
- Não commit secrets. Use variáveis no Railway.
- Se precisar de domínio custom, adicione em Settings de cada serviço no Railway.


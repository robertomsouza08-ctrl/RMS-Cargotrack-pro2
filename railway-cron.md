
# ⏰ Configurar Cron no Railway

O Railway não tem cron jobs nativos, mas você pode usar serviços externos:

## Opção 1: Cron-job.org (Grátis)

1. Acesse: https://cron-job.org/
2. Crie uma conta gratuita
3. Crie um novo cron job:
   - **URL**: `https://seu-app.railway.app/api/cron/simulate-movement`
   - **Schedule**: `*/2 * * * *` (a cada 2 minutos)
   - **Request Method**: GET
   - **Headers**: 
     - `Authorization: Bearer your-secret-key`

## Opção 2: EasyCron (Grátis até 100 jobs/dia)

1. Acesse: https://www.easycron.com/
2. Crie uma conta
3. Configure o cron job com a mesma URL

## Opção 3: GitHub Actions (Grátis)

Crie `.github/workflows/simulate-movement.yml`:

```yaml
name: Simulate Movement
on:
  schedule:
    - cron: '*/2 * * * *'  # A cada 2 minutos
  workflow_dispatch:  # Permite execução manual

jobs:
  simulate:
    runs-on: ubuntu-latest
    steps:
      - name: Call API
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://seu-app.railway.app/api/cron/simulate-movement
```

Adicione o secret `CRON_SECRET` no GitHub (Settings → Secrets).

## Opção 4: Rodar localmente (desenvolvimento)

```bash
npm run simulate:movement
```

Isso roda continuamente até você pressionar Ctrl+C.

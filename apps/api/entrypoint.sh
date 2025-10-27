
#!/bin/sh
set -e

if [ "$NODE_ENV" = "production" ]; then
  npx prisma migrate deploy
else
  # Dev: ensure schema and seed
  npx prisma migrate deploy || true
  npx prisma db push
  npm run prisma:generate || true
  npm run prisma:seed || true
fi

node dist/main.js

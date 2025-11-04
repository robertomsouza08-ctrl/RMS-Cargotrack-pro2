
# 📦 Seed de Entregas de Teste

## Como usar

### 1. Popular entregas de teste

**Localmente (se tiver acesso ao terminal):**
```bash
npm run seed:deliveries
```

**No Railway (via console ou trigger manual):**
```bash
npx tsx prisma/seed-deliveries.ts
```

### 2. Limpar entregas de teste

**Localmente:**
```bash
npm run clear:deliveries
```

**No Railway:**
```bash
npx tsx prisma/clear-deliveries.ts
```

## O que será criado

### 5 entregas de teste:

1. **RMS-SP-001**: São Paulo Centro → Guarulhos Aeroporto (7 pontos)
2. **RMS-SP-002**: Santos Porto → São Paulo Vila Mariana (6 pontos)
3. **RMS-SP-003**: Campinas Centro → São Paulo Pinheiros (6 pontos)
4. **RMS-RJ-001**: Rio de Janeiro Centro → Niterói Centro (4 pontos)
5. **RMS-SP-004**: São Paulo Itaquera → São Paulo Morumbi (5 pontos)

Cada entrega terá:
- ✅ Código de rastreamento único
- ✅ Origem e destino
- ✅ Status "EM_TRANSITO"
- ✅ Dispositivo de rastreamento vinculado
- ✅ Histórico de posições GPS (pings a cada 5 minutos)

## Estrutura necessária no Prisma

Certifique-se de que seu `schema.prisma` tem estes modelos:

```prisma
model Delivery {
  id             String          @id @default(cuid())
  trackingCode   String          @unique
  origin         String?
  destination    String?
  status         String
  trackingDevice TrackingDevice?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

model TrackingDevice {
  id               String         @id @default(cuid())
  deliveryId       String         @unique
  delivery         Delivery       @relation(fields: [deliveryId], references: [id], onDelete: Cascade)
  deviceIdentifier String         @unique
  isActive         Boolean        @default(true)
  locationPings    LocationPing[]
  createdAt        DateTime       @default(now())
}

model LocationPing {
  id        String         @id @default(cuid())
  deviceId  String
  device    TrackingDevice @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  lat       Float
  lng       Float
  accuracy  Float?
  source    String?
  timestamp DateTime       @default(now())

  @@index([deviceId, timestamp])
}
```

## Verificar no banco

Após rodar o seed, você pode verificar:

```sql
-- Contar entregas
SELECT COUNT(*) FROM "Delivery" WHERE "trackingCode" LIKE 'RMS-%';

-- Ver entregas com última posição
SELECT 
  d."trackingCode",
  d."origin",
  d."destination",
  d."status",
  lp."lat",
  lp."lng",
  lp."timestamp"
FROM "Delivery" d
LEFT JOIN "TrackingDevice" td ON td."deliveryId" = d.id
LEFT JOIN LATERAL (
  SELECT * FROM "LocationPing" 
  WHERE "deviceId" = td.id 
  ORDER BY "timestamp" DESC 
  LIMIT 1
) lp ON true
WHERE d."trackingCode" LIKE 'RMS-%';
```

## Troubleshooting

### Erro: "Foreign key constraint failed"
- Certifique-se de que as relações no schema.prisma estão corretas
- Rode `npx prisma migrate dev` para aplicar mudanças

### Erro: "Unique constraint failed"
- As entregas já existem. Rode `npm run clear:deliveries` primeiro

### Entregas não aparecem na página de Tracking
- Verifique se o status é "EM_TRANSITO"
- Verifique se há pings de localização associados
- Confira os logs da API `/api/deliveries/active`

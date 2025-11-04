
# 🚚 Simulação de Movimento em Tempo Real

## 📋 O que faz

Simula o movimento das entregas em tempo real, atualizando as posições GPS automaticamente.

### Características:
- ✅ Atualiza posições a cada 10 segundos (script local) ou 2 minutos (cron)
- ✅ Movimento contínuo baseado na direção atual
- ✅ Adiciona ruído GPS (simula imprecisão real de 10-25 metros)
- ✅ Velocidade variável (simula trânsito)
- ✅ Limita histórico a 50 pings por entrega (evita crescimento infinito)
- ✅ Funciona apenas com entregas status "EM_TRANSITO"

## 🚀 Como usar

### Opção 1: Rodar localmente (desenvolvimento)

**Simulação contínua (roda até você parar):**
```bash
npm run simulate:movement
```

**Atualização única (roda 1 vez e para):**
```bash
npm run simulate:once
```

### Opção 2: Via API (produção)

**Endpoint:** `GET /api/cron/simulate-movement`

**Segurança:** Requer header de autorização:
```bash
curl -X GET \
  -H "Authorization: Bearer your-secret-key" \
  https://seu-app.railway.app/api/cron/simulate-movement
```

**Variável de ambiente necessária:**
```env
CRON_SECRET=your-secret-key
```

### Opção 3: Cron Job automático

Configure um serviço de cron externo (veja `railway-cron.md`):
- **Cron-job.org** (grátis, recomendado)
- **EasyCron** (grátis até 100 jobs/dia)
- **GitHub Actions** (grátis, requer repo público)

## 📊 Exemplo de saída

```
🚚 Iniciando simulação de movimento em tempo real...
⏱️  Atualizando posições a cada 10 segundos
🛑 Pressione Ctrl+C para parar

📍 Iteração 1 - 14:30:15
   ✅ RMS-SP-001: (-23.540123, -46.638456)
   ✅ RMS-SP-002: (-23.960789, -46.333234)
   ✅ RMS-SP-003: (-22.905678, -47.060123)
   ✅ RMS-RJ-001: (-22.906789, -43.172345)
   ✅ RMS-SP-004: (-23.540234, -46.455678)

📊 Total: 5 entregas atualizadas

📍 Iteração 2 - 14:30:25
   ✅ RMS-SP-001: (-23.539987, -46.638901)
   ...
```

## 🎯 Resultado esperado

Na página de **Tracking**:
1. As entregas se movem no mapa em tempo real
2. A linha azul (trajeto) cresce conforme a carga se move
3. A posição é atualizada automaticamente (auto-refresh a cada 10s)

## 🔧 Configurações

### Ajustar velocidade de atualização

**Script local** (`prisma/simulate-movement.ts`):
```typescript
}, 10000); // Altere para 5000 (5s) ou 30000 (30s)
```

**Cron job**:
- Altere o schedule: `*/2 * * * *` (a cada 2 min)
- Para 5 minutos: `*/5 * * * *`
- Para 1 minuto: `* * * * *`

### Ajustar velocidade de movimento

Em qualquer arquivo de simulação:
```typescript
const speed = 0.3 + Math.random() * 0.4; // 0.3-0.7
// Aumentar: 0.5 + Math.random() * 0.5 (mais rápido)
// Diminuir: 0.1 + Math.random() * 0.2 (mais lento)
```

### Ajustar ruído GPS

```typescript
newPosition = addNoise(newPosition, 15); // 15 metros
// Mais preciso: 5 metros
// Menos preciso: 30 metros
```

## 🛑 Parar simulação

**Script local:**
- Pressione `Ctrl+C` no terminal

**Cron job:**
- Pause ou delete o job no serviço de cron

**API:**
- Não precisa parar, só não chame mais o endpoint

## ⚠️ Importante

- A simulação só funciona com entregas status "EM_TRANSITO"
- O histórico é limitado a 50 pings por entrega
- Pings antigos são deletados automaticamente
- Use `source: "simulation"` para identificar dados simulados

## 🐛 Troubleshooting

### Entregas não se movem
- Verifique se há entregas com status "EM_TRANSITO"
- Rode `npm run seed:deliveries` para criar entregas de teste
- Verifique os logs do script

### Erro "deviceId not found"
- Certifique-se de que as entregas têm TrackingDevice associado
- Rode o seed novamente

### Movimento muito rápido/lento
- Ajuste a variável `speed` no código
- Ajuste o intervalo de atualização

### Cron não funciona
- Verifique se o header `Authorization` está correto
- Verifique se a variável `CRON_SECRET` está configurada
- Teste o endpoint manualmente com curl

# RevenueCat Integration Guide

## Nuvarande Status
Din iOS API-nyckel är konfigurerad: `appl_ttKXYkEBKHJdIqTkYvbLSbUSDcX`

## Hur det fungerar

### 1. SDK-initialisering
RevenueCat SDK initialiseras automatiskt i `PremiumContext.tsx` när appen startar:
- SDK konfigureras med din API-nyckel
- Användarens Supabase-ID kopplas till RevenueCat
- Lyssnar på köpändringar och synkar automatiskt med databasen

### 2. Köpflöde
När användaren köper premium:
1. Appen visar tillgängliga paket (monthly/yearly) från RevenueCat
2. RevenueCat hanterar köpet via App Store
3. Vid lyckat köp uppdateras `profiles`-tabellen i Supabase
4. Användaren får omedelbar tillgång till premium-funktioner

### 3. Entitlements
Appen letar efter en entitlement som heter **"premium"** i RevenueCat.

**VIKTIGT:** I RevenueCat Dashboard:
1. Gå till **Entitlements** → Skapa en entitlement med identifier: `premium`
2. Koppla dina produkter (monthly/annual) till denna entitlement

---

## RevenueCat Dashboard Setup

### Steg 1: Konfigurera Entitlement
1. Logga in på [RevenueCat Dashboard](https://app.revenuecat.com)
2. Gå till **Entitlements** i sidomenyn
3. Klicka **+ New Entitlement**
4. Sätt identifier till: `premium`
5. Spara

### Steg 2: Skapa Offerings
1. Gå till **Offerings** i sidomenyn
2. Skapa ett offering som heter t.ex. "default"
3. Lägg till dina paket:
   - Monthly package → koppla till din månatliga produkt
   - Annual package → koppla till din årliga produkt
4. Sätt detta offering som **Current Offering**

### Steg 3: Koppla Produkter
1. Gå till **Products** 
2. Lägg till dina App Store Connect-produkter
3. Koppla varje produkt till `premium` entitlement

---

## Webhooks (Valfritt men Rekommenderat)

Webhooks behövs för att hålla din databas synkroniserad om användare:
- Avbryter prenumeration
- Får återbetalning
- Byter enhet

### Du har två alternativ:

#### Alternativ A: Supabase Edge Function (Enklast)
Ingen egen domän behövs! Supabase tillhandahåller en URL automatiskt.

1. Skapa en Edge Function i Supabase:
```bash
supabase functions new revenuecat-webhook
```

2. I filen `supabase/functions/revenuecat-webhook/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const event = await req.json()
  const appUserId = event.app_user_id
  const eventType = event.type

  // Hantera olika event-typer
  if (['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE'].includes(eventType)) {
    await supabase.from('profiles').update({
      subscription_type: 'premium',
      subscription_expires_at: event.expiration_at_ms 
        ? new Date(event.expiration_at_ms).toISOString()
        : null
    }).eq('id', appUserId)
  }

  if (['EXPIRATION', 'CANCELLATION'].includes(eventType)) {
    await supabase.from('profiles').update({
      subscription_type: 'free',
      subscription_expires_at: null
    }).eq('id', appUserId)
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

3. Deploy:
```bash
supabase functions deploy revenuecat-webhook
```

4. Kopiera URL:en (t.ex. `https://xyz.supabase.co/functions/v1/revenuecat-webhook`)

5. I RevenueCat Dashboard → **Integrations** → **Webhooks**:
   - URL: Din Supabase Function URL
   - Authorization: Valfritt (kan lägga till secret)

#### Alternativ B: Skippa Webhooks (Fungerar Ändå)
Appen synkar redan via SDK:
- `CustomerInfoUpdateListener` triggas vid köp/ändringar
- `restorePurchases()` hämtar senaste status
- Fungerar bra för de flesta appar

---

## Test & Felsökning

### Testa i Sandbox
1. Skapa en Sandbox-testanvändare i App Store Connect
2. Logga ut från App Store på din testdevice
3. Köp i appen - du blir ombedd att logga in med testanvändaren
4. Sandbox-prenumerationer förnyas snabbt (monthly = 5 min)

### Debug-läge
SDK:n har DEBUG-logging aktiverat. Kolla konsolen för meddelanden som börjar med `[RevenueCat]`.

### Vanliga Problem

**"No offerings available"**
- Kontrollera att du har ett Current Offering i RevenueCat
- Verifiera att produkterna finns i App Store Connect och är godkända

**"API key not configured"**
- iOS-nyckeln är inställd ✓
- Android-nyckeln behöver uppdateras om du vill stödja Android

**Köp går igenom men premium aktiveras inte**
- Kontrollera att entitlement heter exakt `premium`
- Verifiera att produkterna är kopplade till entitlement

---

## Checklista innan Launch

- [x] iOS API-nyckel konfigurerad
- [ ] Android API-nyckel (om applicable)
- [ ] Entitlement "premium" skapad i RevenueCat
- [ ] Offerings konfigurerade med rätt paket
- [ ] Produkter från App Store Connect importerade
- [ ] Produkter kopplade till "premium" entitlement
- [ ] Testat i Sandbox-miljö
- [ ] (Valfritt) Webhook konfigurerad

---

## Sammanfattning

**Din app är redo att ta emot köp!** 

Det enda du behöver göra i RevenueCat Dashboard är:
1. Skapa entitlement: `premium`
2. Konfigurera offerings med dina produkter
3. Koppla produkter till entitlement

Webhooks är valfritt - appen synkar redan köp via SDK:n. Om du vill ha webhooks kan du enkelt använda en Supabase Edge Function utan att behöva en egen domän.

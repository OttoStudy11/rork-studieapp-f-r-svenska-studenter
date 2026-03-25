# RevenueCat Premium Integration - Fullständig Guide

## Snabbstart

Din iOS API-nyckel är redan konfigurerad: `appl_ttKXYkEBKHJdIqTkYvbLSbUSDcX`

### Steg 1: Konfigurera RevenueCat Dashboard

1. **Skapa Entitlement**
   - Gå till [RevenueCat Dashboard](https://app.revenuecat.com)
   - Navigera till **Products** → **Entitlements**
   - Klicka **+ New**
   - Identifier: `premium` (EXAKT denna text - känsligt för versaler)
   - Spara

2. **Skapa Offerings**
   - Gå till **Products** → **Offerings**
   - Skapa ett offering med identifier: `default`
   - Lägg till paket:
     - **Monthly Package**: Typ "Monthly", koppla till din månatliga App Store-produkt
     - **Annual Package**: Typ "Annual", koppla till din årliga App Store-produkt
   - Sätt som **Current Offering**

3. **Koppla Produkter**
   - Gå till **Products** → **Products**
   - Importera dina App Store Connect-produkter
   - Koppla varje produkt till entitlement `premium`

### Steg 2: App Store Connect Setup

1. Skapa In-App Purchases i App Store Connect:
   - **Produkt 1**: `premium_monthly` (Auto-Renewable Subscription)
   - **Produkt 2**: `premium_yearly` (Auto-Renewable Subscription)

2. Skapa en Subscription Group för dina produkter

3. Verifiera att produkterna är i status "Ready to Submit" eller "Approved"

---

## Testinstruktioner

### iOS Sandbox Testing

1. **Skapa Sandbox Tester**
   - Gå till App Store Connect → Users and Access → Sandbox → Testers
   - Skapa en ny sandbox-testare med en unik e-postadress

2. **Testa på enhet**
   - Logga ut från App Store på din testdevice (Inställningar → [Ditt namn] → Media & Purchases → Sign Out)
   - Bygg appen via Xcode till din testdevice
   - Genomför ett köp - du blir ombedd att logga in med sandbox-testaren

3. **Sandbox Prenumerationstider**
   - Månads-prenumeration förnyas var 5:e minut
   - Års-prenumeration förnyas var 1 timme
   - Max 6 förnyelser per sandbox-prenumeration

### Debug-läge

I utvecklingsläge (`__DEV__`) visas:
- Extra loggning i konsolen med prefix `[RevenueCat]`
- Debug-information i paywallen med offering/package IDs
- Detaljerade felmeddelanden

---

## Checklista före Release

### RevenueCat Dashboard
- [ ] Entitlement `premium` skapad
- [ ] Offering `default` skapad och satt som current
- [ ] Båda paketen (monthly/annual) kopplade
- [ ] Produkter korrekt mappade till entitlements
- [ ] Testat i Sandbox - köp fungerar
- [ ] Testat i Sandbox - restore fungerar

### App Store Connect
- [ ] Auto-Renewable Subscriptions skapade
- [ ] Subscription Group skapad
- [ ] Priser konfigurerade för alla regioner
- [ ] Lokaliseringar (beskrivningar på svenska)
- [ ] App Review Information ifyllt

### Appen
- [ ] API-nyckel korrekt (iOS): `appl_ttKXYkEBKHJdIqTkYvbLSbUSDcX`
- [ ] Android API-nyckel tillagd (om applicable)
- [ ] Privacy Policy URL uppdaterad från placeholder
- [ ] Terms URL uppdaterad från placeholder
- [ ] Testat offlinehantering
- [ ] Testat restore purchases

### Apple Review Requirements
- [ ] Privacy Policy länk synlig i appen
- [ ] Restore Purchases-knapp synlig och fungerande
- [ ] Prenumerationsvillkor visas (auto-renewal info)
- [ ] Priser från RevenueCat (inte hårdkodade)

---

## Placeholders att Uppdatera

### I koden (`app/premium.tsx`)

```typescript
// Linje 50-51 - Ersätt med riktiga URLs
const TERMS_URL = 'https://placeholder.example/terms';
const PRIVACY_URL = 'https://placeholder.example/privacy';
```

### För Android (`services/revenuecat.ts`)

```typescript
// Linje 14 - Lägg till din Google Play API-nyckel
const REVENUECAT_API_KEY_ANDROID = 'goog_YOUR_ANDROID_KEY_HERE';
```

### I App Store Connect
- **Privacy Policy URL**: Ersätt placeholder med riktig URL
- **Support URL**: Lägg till kontaktinfo eller support-sida

---

## Skapa Privacy Policy & Terms

### Alternativ 1: GitHub Pages (Gratis & Enkel)

1. Skapa ett nytt repo på GitHub (t.ex. `studiestugan-legal`)

2. Skapa `index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Studiestugan - Integritetspolicy</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Integritetspolicy</h1>
  <!-- Kopiera innehållet från PRIVACY_POLICY_PLACEHOLDER i premium.tsx -->
</body>
</html>
```

3. Aktivera GitHub Pages:
   - Gå till repo Settings → Pages
   - Source: Deploy from branch → main
   - Din URL blir: `https://username.github.io/studiestugan-legal/`

4. Uppdatera i koden:
```typescript
const TERMS_URL = 'https://username.github.io/studiestugan-legal/terms';
const PRIVACY_URL = 'https://username.github.io/studiestugan-legal/privacy';
```

### Alternativ 2: Notion (Ännu enklare)

1. Skapa en Notion-sida med din policy
2. Klicka "Share" → "Share to web" → Enable
3. Kopiera länken

---

## Webhooks (Valfritt men Rekommenderat)

Webhooks håller din databas synkad även när användare:
- Avbryter prenumeration via App Store
- Får återbetalning
- Byter enhet

### Supabase Edge Function Setup

1. **Skapa Edge Function**
```bash
supabase functions new revenuecat-webhook
```

2. **Implementera webhook-handler** (`supabase/functions/revenuecat-webhook/index.ts`):
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RevenueCatEvent {
  type: string;
  app_user_id: string;
  expiration_at_ms?: number;
  product_id?: string;
}

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const event: RevenueCatEvent = await req.json()
    const { type, app_user_id, expiration_at_ms } = event

    console.log('[Webhook] Received event:', type, 'for user:', app_user_id)

    const premiumEvents = [
      'INITIAL_PURCHASE',
      'RENEWAL',
      'PRODUCT_CHANGE',
      'UNCANCELLATION'
    ]

    const cancelEvents = [
      'EXPIRATION',
      'CANCELLATION',
      'BILLING_ISSUE'
    ]

    if (premiumEvents.includes(type)) {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_type: 'premium',
          subscription_expires_at: expiration_at_ms 
            ? new Date(expiration_at_ms).toISOString()
            : null
        })
        .eq('id', app_user_id)

      if (error) {
        console.error('[Webhook] Update error:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }
    }

    if (cancelEvents.includes(type)) {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_type: 'free',
          subscription_expires_at: null
        })
        .eq('id', app_user_id)

      if (error) {
        console.error('[Webhook] Update error:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
})
```

3. **Deploy**
```bash
supabase functions deploy revenuecat-webhook
```

4. **Konfigurera i RevenueCat**
   - Gå till RevenueCat Dashboard → Integrations → Webhooks
   - URL: `https://[project-ref].supabase.co/functions/v1/revenuecat-webhook`
   - Välj events: INITIAL_PURCHASE, RENEWAL, EXPIRATION, CANCELLATION, etc.

---

## Felsökning

### "No offerings available"
1. Kontrollera att du har ett **Current Offering** i RevenueCat
2. Verifiera att produkterna finns och är godkända i App Store Connect
3. Kontrollera att paketen är korrekt kopplade i RevenueCat

### "API key not configured"
1. iOS-nyckeln ska börja med `appl_`
2. Android-nyckeln ska börja med `goog_`
3. Verifiera att nyckeln är från rätt RevenueCat-projekt

### Köp går igenom men premium aktiveras inte
1. Kontrollera att entitlement heter exakt `premium` (gemener)
2. Verifiera att produkterna är kopplade till `premium` entitlement
3. Kolla RevenueCat Dashboard → Customer History för användarens köp

### Sandbox köp fungerar inte
1. Kontrollera att du testar på en riktig iOS-enhet (inte simulator)
2. Verifiera att sandbox-testaren är korrekt inloggad
3. Försök logga ut och in igen i sandbox

---

## Säkerhet

### API-nycklar
- iOS Public Key (`appl_...`) är **säker att ha i appen** - den ger endast läsåtkomst
- Dela ALDRIG RevenueCat **Secret Keys** - dessa ska endast användas server-side

### Datahantering
- Logga aldrig användar-ID eller kvitton i produktion
- Använd RevenueCats SDK för all köpvalidering (de hanterar server-side validation)

---

## Support & Resurser

- [RevenueCat Dokumentation](https://docs.revenuecat.com/)
- [Apple In-App Purchase Guide](https://developer.apple.com/in-app-purchase/)
- [RevenueCat Community](https://community.revenuecat.com/)

---

## Versionshistorik

- **v1.0.0** (2024-12): Initial implementation med full RevenueCat-integration
  - Robust error handling med exponentiell backoff
  - Offline-stöd med grace period
  - Svenska användargränssnitt
  - Apple-krävda prenumerationsvillkor
  - In-app privacy policy modal

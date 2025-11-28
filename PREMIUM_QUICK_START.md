# Premium System - Snabbguide

## ✅ Vad är klart

Din app har nu ett komplett premium-system:

- ✅ RevenueCat integration för in-app köp
- ✅ Automatisk synkronisering med Supabase
- ✅ Premium-gating på:
  - AI Chat
  - Flashcards
  - Battle-funktionen
  - Avancerad statistik
  - Lägg till fler kurser (gräns: 3 gratis)
- ✅ "Återställ köp"-funktion
- ✅ Snygg premium-sida med priser

## 💰 Priser

- **Månad:** 49 kr
- **År:** 150 kr (50% rabatt)

## 🚀 Steg för lansering

### 1. RevenueCat Setup (15 min)

1. Skapa konto på https://www.revenuecat.com/
2. Lägg till iOS app med Bundle ID: `app.rork.studieapp-for-svenska-studenter`
3. Kopiera API-nyckeln (ser ut som: `appl_XXXXXXX`)

### 2. App Store Connect (20 min)

1. Gå till https://appstoreconnect.apple.com/
2. Skapa två prenumerationer:
   - `premium_monthly` - 49 kr/månad
   - `premium_yearly` - 150 kr/år
3. Skapa prenumerationsgrupp "Premium"
4. Kopiera App-Specific Shared Secret till RevenueCat

### 3. RevenueCat Konfiguration (10 min)

1. Lägg till produkter (`premium_monthly`, `premium_yearly`)
2. Skapa entitlement: `premium`
3. Skapa default offering med båda paketen

### 4. Uppdatera koden (2 min)

Öppna `contexts/PremiumContext.tsx` rad 84:

```typescript
// Ersätt detta:
const REVENUECAT_API_KEY_IOS = 'appl_YOUR_IOS_KEY_HERE';

// Med din riktiga nyckel:
const REVENUECAT_API_KEY_IOS = 'appl_AbCdEfGhIjKlMnOp';
```

Lägg till i `app.json` under plugins:

```json
"react-native-purchases"
```

### 5. Testa (30 min)

1. Skapa sandbox-testare i App Store Connect
2. Bygg development-version: `eas build --profile development`
3. Testa på fysisk enhet
4. Verifiera:
   - ☐ Köp fungerar
   - ☐ Premium låses upp
   - ☐ "Återställ köp" fungerar
   - ☐ Status sparas i Supabase

### 6. Lansera (1 timme)

1. Bygg produktion: `eas build --profile production`
2. Ladda upp till App Store Connect
3. Lägg till skärmdumpar och beskrivning
4. Skicka in för granskning

## 🔍 Snabb felsökning

| Problem | Lösning |
|---------|---------|
| "No offerings available" | Vänta 5 min efter RevenueCat-konfiguration |
| "Purchase failed" | Använd sandbox-testare, inte riktigt Apple ID |
| "Premium inte upplåst" | Kontrollera att entitlement heter exakt `premium` |

## 📚 Fullständig guide

För detaljerad information, se: `PREMIUM_LAUNCH_GUIDE.md`

## 🎯 Checklista

- [ ] RevenueCat-konto skapat
- [ ] Produkter i App Store Connect
- [ ] Produkter i RevenueCat
- [ ] Entitlement `premium` skapad
- [ ] API-nyckel i koden
- [ ] Plugin i app.json
- [ ] Testat med sandbox
- [ ] Redo för lansering!

## 💬 Support

Om något inte fungerar:
1. Kolla loggar i konsolen (sök efter `[RevenueCat]`)
2. Läs `PREMIUM_LAUNCH_GUIDE.md` för detaljer
3. RevenueCat community: https://community.revenuecat.com/

---

**Tid för lansering:** ~1-2 timmar totalt

**Svårighetsgrad:** Medium (mest är admin-arbete, inte kod)

**När det funkar:** Automatisk betalning, automatisk förnyelse, automatisk synkronisering! 🎉

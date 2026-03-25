# Guide: Premium System - Lansering till App Store

Detta dokument innehåller allt du behöver veta för att lansera premium-funktionen i din app.

## Översikt

Din app har nu ett komplett premium-system integrerat med:
- ✅ RevenueCat för in-app köp (IAP)
- ✅ Automatisk synkronisering med Supabase-databasen
- ✅ Premium-gating för AI Chat, Flashcards, Battle-funktionen och Statistik
- ✅ "Återställ köp"-funktion
- ✅ Prisplan: 49 kr/månad eller 150 kr/år

## Steg för lansering

### 1. RevenueCat Setup

#### A. Skapa RevenueCat-konto
1. Gå till https://www.revenuecat.com/
2. Registrera dig med ditt Apple ID eller e-post
3. Skapa ett nytt projekt

#### B. Konfigurera iOS App
1. I RevenueCat Dashboard:
   - Gå till "Projects" → "Your Project" → "Apps"
   - Klicka "Add app"
   - Välj "iOS"
   - Ange Bundle ID: `app.rork.studieapp-for-svenska-studenter`
   - Ange App Name: "Studier för Svenska Studenter"

2. App Store Connect Integration:
   - Du behöver App-Specific Shared Secret från App Store Connect
   - Gå till App Store Connect → "My Apps" → Din App → "App Information"
   - Under "App-Specific Shared Secret", generera en ny secret
   - Kopiera och klistra in i RevenueCat

#### C. Skapa produkter i App Store Connect
1. Logga in på https://appstoreconnect.apple.com/
2. Gå till "My Apps" → Din App → "In-App Purchases"
3. Klicka "+" för att skapa nya produkter

**Månatlig prenumeration:**
- **Product ID:** `premium_monthly`
- **Reference Name:** "Studiestugan Pro - Månadsvis"
- **Duration:** 1 månad
- **Price:** 49 SEK
- **Subscription Group:** Skapa ny grupp "Premium"
- **Description:** "Tillgång till alla premium-funktioner"

**Årlig prenumeration:**
- **Product ID:** `premium_yearly`
- **Reference Name:** "Studiestugan Pro - Årligt"
- **Duration:** 1 år
- **Price:** 150 SEK
- **Subscription Group:** Samma som ovan ("Premium")
- **Description:** "Tillgång till alla premium-funktioner, spara 50%"

#### D. Konfigurera produkter i RevenueCat
1. I RevenueCat Dashboard:
   - Gå till "Products" → "+ New"
   - Lägg till `premium_monthly` (ska matcha Product ID från App Store Connect)
   - Lägg till `premium_yearly`

2. Skapa Entitlements:
   - Gå till "Entitlements" → "+ New"
   - Skapa en entitlement med identifier: **`premium`** (viktigt!)
   - Koppla båda produkterna till denna entitlement

3. Skapa Offerings:
   - Gå till "Offerings" → "+ New"
   - Skapa en offering (default offering)
   - Lägg till paket:
     - **Monthly Package:** Koppla till `premium_monthly`
     - **Annual Package:** Koppla till `premium_yearly`

#### E. Hämta API-nycklar
1. I RevenueCat Dashboard:
   - Gå till Settings → "API keys"
   - Kopiera "Apple App Store" API key
   - Det ser ut som: `appl_XxXxXxXxXxXxXxXxXx`

### 2. Uppdatera app-koden

Öppna filen `contexts/PremiumContext.tsx` och ersätt platshållarna:

```typescript
// Rad 84-85
const REVENUECAT_API_KEY_IOS = 'appl_XXXXXXXXXXXXXXX';  // ← Ersätt med din riktiga nyckel
const REVENUECAT_API_KEY_ANDROID = 'goog_YOUR_ANDROID_KEY_HERE';  // Om du stödjer Android
```

**Exempel:**
```typescript
const REVENUECAT_API_KEY_IOS = 'appl_AbCdEfGhIjKlMnOpQrStUvWx';
```

### 3. Uppdatera app.json

Du behöver lägga till RevenueCat plugin i `app.json`. Eftersom jag inte kunde redigera filen direkt, gör följande manuellt:

Öppna `app.json` och lägg till `"react-native-purchases"` i `plugins` arrayen:

```json
{
  "expo": {
    "plugins": [
      ["expo-router", { ... }],
      ["expo-notifications", { ... }],
      ["expo-av", { ... }],
      "react-native-purchases"  // ← Lägg till denna rad
    ]
  }
}
```

### 4. Testa i utvecklingsmiljö

#### Sandbox Testing (Rekommenderat)
1. **Skapa Sandbox testare i App Store Connect:**
   - Gå till "Users and Access" → "Sandbox Testers"
   - Skapa en eller flera testanvändare
   - Notera email och lösenord

2. **Testa på fysisk enhet:**
   - Kör `eas build --profile development --platform ios` för att bygga en development build
   - Installera på din iPhone/iPad
   - Logga UT från din riktiga Apple ID i Inställningar
   - När du försöker köpa premium kommer iOS fråga efter sandbox-inloggning
   - Använd din sandbox-testare

3. **Verifiera funktionalitet:**
   - [ ] Prenumerationserbjudanden laddas korrekt
   - [ ] Du kan köpa månadsprenumeration
   - [ ] Du kan köpa årsprenumeration
   - [ ] Premium-funktioner låses upp direkt efter köp
   - [ ] "Återställ köp" fungerar
   - [ ] Status synkroniseras med Supabase

#### Debug-loggar
Appen loggar alla RevenueCat-händelser till konsolen:
```
[RevenueCat] Initializing...
[RevenueCat] Initialized successfully
[RevenueCat] Fetching offerings...
[RevenueCat] Purchasing package: premium_monthly
[RevenueCat] Purchase successful!
[RevenueCat] Syncing with database - Has Premium: true
```

### 5. Bygga och skicka till App Store

#### A. Bygg produktionsversion
```bash
# Bygg iOS app
eas build --profile production --platform ios
```

#### B. Ladda upp till App Store Connect
1. När bygget är klart, ladda ner .ipa filen
2. Använd Transporter-appen (från Mac App Store) för att ladda upp
3. Eller använd: `eas submit --platform ios`

#### C. Konfigurera i App Store Connect
1. Gå till din app i App Store Connect
2. Under "In-App Purchases", se till att båda prenumerationerna är "Ready to Submit"
3. Gå till "Pricing and Availability"
4. Välj länder där din app ska säljas
5. Under "App Review Information", fyll i test-konto om nödvändigt

#### D. Skicka in för granskning
1. Gå till "App Store" fliken
2. Välj din version
3. Lägg till skärmdumpar, beskrivning, etc.
4. Under "App Review Information":
   - Förklara premium-funktionerna
   - Om Apple frågar om demo-konto, kan du använda sandbox-testare
5. Klicka "Submit for Review"

### 6. Efter godkännande

När din app är godkänd och live:

#### A. Övervaka försäljning
1. RevenueCat Dashboard visar realtidsdata:
   - Antal aktiva prenumeranter
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - Konverteringsrate

2. App Store Connect:
   - "Sales and Trends" för finansiell översikt

#### B. Hantera kundsupport
Vanliga frågor:

**"Jag ser inte mina köp!"**
- Använd "Återställ köp" knappen i appen
- Se till att samma Apple ID används
- RevenueCat kan ta några minuter att synkronisera

**"Hur avbryter jag?"**
- Inställningar → Apple ID → Prenumerationer
- Välj "Studiestugan Pro"
- Klicka "Avbryt prenumeration"

**"Jag blev debiterad dubbelt"**
- Detta kan hända om användaren köper på flera enheter
- RevenueCat förhindrar detta automatiskt
- Om det ändå händer, hantera refund via App Store Connect

### 7. Prissättning och strategi

Nuvarande priser:
- **Månad:** 49 kr
- **År:** 150 kr (spara 50%)

#### Framtida prisändringar
Om du vill ändra priser:
1. Gå till App Store Connect → In-App Purchases
2. Välj produkten
3. Ändra priset
4. För befintliga prenumeranter: Du kan välja att grandfathera dem (behålla gammalt pris)

#### A/B testning
RevenueCat stöder experiments:
- Testa olika priser
- Testa olika erbjudanden (7-dagars gratis trial, etc.)
- Mät konverteringsrater

### 8. Teknisk implementation - Så fungerar det

#### Flöde för köp:
```
1. Användaren klickar "KÖP PREMIUM"
2. RevenueCat hämtar offerings från App Store
3. Användaren väljer plan (månad/år)
4. iOS visar betalningsdialog
5. Användaren bekräftar med Face ID/Touch ID
6. RevenueCat tar emot kvittot
7. PremiumContext synkroniserar med Supabase
8. subscription_type sätts till 'premium'
9. Premium-funktioner låses upp omedelbart
10. Success-meddelande visas
```

#### Återställ köp:
```
1. Användaren klickar "Återställ köp"
2. RevenueCat kontaktar App Store
3. App Store returnerar alla tidigare köp för detta Apple ID
4. RevenueCat validerar aktiva prenumerationer
5. Om aktiv prenumeration hittas:
   - Synkronisera med Supabase
   - Lås upp premium
   - Visa success-meddelande
```

#### Automatisk förnyelse:
- RevenueCat överlåter webhooks från App Store
- När prenumeration förnyas automatiskt:
  - subscription_expires_at uppdateras i databasen
  - Användaren behöver inte göra något
- Om betalning misslyckas:
  - iOS skickar notis till användaren
  - RevenueCat markerar prenumeration som "expired"
  - Premium-funktioner låses automatiskt

## Premium-gated funktioner

Dessa funktioner kräver premium:

### 1. AI Chat (`/ai-chat`)
- Blurrad overlay med crown-ikon
- Text: "AI Chat är Premium"
- Knapp: "Uppgradera till Premium"

### 2. Flashcards (`/flashcards-v2/[courseId]`)
- Samma gating som AI Chat
- Visas när användare trycker på flashcard-knapp i kurs

### 3. Battle-funktionen (`/friends` → Battle)
- Gating på battle-sektionen
- Text: "Tävlingsfunktionen är Premium"

### 4. Avancerad Statistik (`/timer` → Statistik)
- Blurrad graf och statistik
- Text: "Avancerad Statistik är Premium"

### 5. Lägg till fler kurser
- När användare har 3 kurser (gratis-gräns)
- Modal: "Uppgradera för fler kurser"

## Felsökning

### Problem: "API key not configured"
**Lösning:** Du har inte ersatt placeholders i `contexts/PremiumContext.tsx`

### Problem: "No offerings available"
**Lösning:**
1. Kontrollera att produkter finns i App Store Connect
2. Verifiera att produkter är kopplade till RevenueCat
3. Kontrollera att offerings är konfigurerade i RevenueCat
4. Vänta några minuter efter konfiguration

### Problem: "Purchase failed"
**Lösning:**
1. Kontrollera internetanslutning
2. Verifiera att Apple ID fungerar
3. För sandbox: Använd sandbox-testare, inte riktigt Apple ID
4. Kontrollera att produkten är "Ready to Submit" i App Store Connect

### Problem: "Premium låser inte upp efter köp"
**Lösning:**
1. Kontrollera att entitlement heter exakt **`premium`** i RevenueCat
2. Verifiera att Supabase-anslutning fungerar
3. Kontrollera konsol-loggar: `[RevenueCat] Syncing with database`
4. Se till att `profiles` tabellen har kolumnerna `subscription_type` och `subscription_expires_at`

## Support och resurser

### RevenueCat
- Dokumentation: https://www.revenuecat.com/docs
- Support: https://community.revenuecat.com/
- Dashboard: https://app.revenuecat.com/

### Apple
- App Store Connect: https://appstoreconnect.apple.com/
- In-App Purchase Guide: https://developer.apple.com/in-app-purchase/
- Subscription Best Practices: https://developer.apple.com/app-store/subscriptions/

### React Native Purchases
- GitHub: https://github.com/RevenueCat/react-native-purchases
- API Reference: https://sdk.revenuecat.com/react-native/index.html

## Checklista innan lansering

Innan du skickar appen till App Store, kontrollera:

- [ ] RevenueCat-konto skapat
- [ ] iOS app konfigurerad i RevenueCat
- [ ] App Store Connect-integration fungerar
- [ ] Produkter skapade i App Store Connect (`premium_monthly`, `premium_yearly`)
- [ ] Produkter importerade till RevenueCat
- [ ] Entitlement `premium` skapad och kopplad
- [ ] Offerings konfigurerade
- [ ] API-nyckel tillagd i `contexts/PremiumContext.tsx`
- [ ] `react-native-purchases` plugin tillagd i `app.json`
- [ ] Testat köp med sandbox-användare
- [ ] Testat "Återställ köp"
- [ ] Verifierat att premium-funktioner låses/låses upp korrekt
- [ ] Granskat premium-sidan (`/premium`) för korrekt info
- [ ] Granskat priser (49 kr/månad, 150 kr/år)
- [ ] Provat alla premium-gated features

## Framtida förbättringar

Saker du kan lägga till senare:

### Gratis provperiod
```typescript
// I App Store Connect, lägg till trial på produkterna
// RevenueCat hanterar detta automatiskt
```

### Kampanjkoder
App Store Connect stödjer promotional offers:
- Rabattkoder
- Introduktionserbjudanden
- Win-back erbjudanden

### Analytics
Integrera mer avancerad analytics:
- Mixpanel
- Amplitude
- Google Analytics

### Push-notiser för prenumeration
Skicka påminnelser:
- "Din provperiod går snart ut"
- "Din prenumeration förnyas imorgon"
- "Välkommen tillbaka! Här är vad du har missat"

## Slutord

Ditt premium-system är nu komplett och redo för lansering! RevenueCat hanterar alla komplexa delar:
- Receipt validation
- Subscription management
- Cross-platform sync
- Webhooks
- Analytics

Du behöver bara:
1. Konfigurera produkter i App Store Connect
2. Länka till RevenueCat
3. Lägga till din API-nyckel i koden
4. Testa
5. Skicka till granskning

Lycka till med lanseringen! 🚀

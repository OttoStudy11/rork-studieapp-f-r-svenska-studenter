# Guide: Visa Priser i SEK istället för USD

## Problem
Prenumerationspriserna visas i dollar (USD) istället för svenska kronor (SEK).

## Orsak
RevenueCat SDK hämtar priser direkt från App Store/Google Play. Valutan bestäms av:
1. **App Store Connect-konfiguration** - Vilka regioner och priser som är konfigurerade
2. **Användarens Apple ID/Google-konto region** - Vilket land/region kontot är registrerat i
3. **Sandbox-testanvändare** - Vilken region sandbox-kontot är konfigurerat för

## Lösning

### 1. Konfigurera Priser i App Store Connect

#### Steg 1: Logga in på App Store Connect
1. Gå till [App Store Connect](https://appstoreconnect.apple.com)
2. Välj din app
3. Gå till **In-App Purchases** eller **Subscriptions**

#### Steg 2: Konfigurera Prenumerationer för Sverige
1. Välj din prenumeration (Monthly/Yearly)
2. Gå till **Subscription Pricing**
3. Klicka på **Add Pricing**
4. Välj **Sweden (SEK)** från listan
5. Ange priset i svenska kronor:
   - **Monthly**: 49 kr, 79 kr, eller 99 kr (välj lämpligt pris)
   - **Yearly**: 490 kr, 590 kr, eller 990 kr (spara ~17-40%)

#### Exempel Prisstruktur (Rekommenderat)
```
Monthly: 79 kr/månad
Yearly: 590 kr/år (≈49 kr/månad, spara 38%)
```

eller

```
Monthly: 99 kr/månad  
Yearly: 790 kr/år (≈66 kr/månad, spara 33%)
```

#### Steg 3: Vänta på Godkännande
- Apple granskar prisändringar
- Kan ta 24-48 timmar
- Du får ett mail när det är godkänt

### 2. Skapa Svenska Sandbox-testanvändare

#### Steg 1: Gå till Users and Access
1. I App Store Connect, gå till **Users and Access**
2. Välj **Sandbox** fliken
3. Klicka på **+** för att skapa ny testanvändare

#### Steg 2: Konfigurera Testanvändare
```
Email: test.sweden@example.com (valfri email)
Password: [Välj starkt lösenord]
First Name: Test
Last Name: Sweden
Date of Birth: [Över 18 år]
Region: Sweden 🇸🇪
```

⚠️ **VIKTIGT**: Välj **Sweden** som region!

### 3. Testa med Svensk Sandbox-användare

#### På iOS-enhet
1. **Logga ut från befintligt sandbox-konto**
   - Gå till **Inställningar** → **App Store**
   - Scrolla ner till **Sandbox Account**
   - Tryck **Sign Out** om du är inloggad

2. **Öppna din app**
   - Gå till Premium-sidan
   - Försök köpa en prenumeration

3. **Logga in med svensk sandbox-användare**
   - När popup visas, ange credentials för din svenska sandbox-användare
   - Nu ska priserna visas i SEK!

### 4. Verifiera Valuta i Appen

När du har konfigurerat allt korrekt kommer appen automatiskt att visa:
```
Månadsvis: 79 kr/månad
Årsvis: 590 kr/år (Spara 38%)
```

## Vanliga Problem och Lösningar

### Problem 1: "Priserna visas fortfarande i USD"
**Lösning:**
- Kontrollera att du är inloggad med en sandbox-användare som har region = Sweden
- Logga ut och logga in igen med rätt sandbox-användare
- Starta om appen efter byte av sandbox-användare

### Problem 2: "Inga priser visas alls"
**Lösning:**
- Vänta tills Apple har godkänt dina priser för Sverige
- Kontrollera att prenumerationerna är i status "Ready to Submit" eller "Approved"
- Se till att din app-bundle ID matchar i App Store Connect

### Problem 3: "Fel priser visas"
**Lösning:**
- RevenueCat cachar priser - kan ta upp till 24h att uppdatera
- Försök "Restore Purchases" för att tvinga en uppdatering
- Eller vänta 24h för automatisk cache-uppdatering

## Produktionsmiljö (Riktiga Användare)

När appen är live och användare har riktiga Apple ID:n:
- **Svensk användare med svenskt Apple ID** → Ser priser i SEK
- **Amerikansk användare med USA Apple ID** → Ser priser i USD
- **Tysk användare med tyskt Apple ID** → Ser priser i EUR

Detta hanteras **automatiskt av RevenueCat + App Store**.

## Viktig Information

### Apple Pricing Tiers
Apple använder fasta pris-tiers. Du kan inte ange vilket pris som helst.

**Populära tiers för Sverige:**
- Tier 1: 12 kr
- Tier 5: 49 kr
- Tier 10: 79 kr
- Tier 15: 129 kr
- Tier 20: 169 kr
- Tier 50: 490 kr
- Tier 70: 790 kr
- Tier 80: 990 kr

### Prissättningsrekommendation
Baserat på svenska studie-appar:
```
Studiestugan Free: Gratis (max 3 kurser)
Studiestugan Pro Monthly: 79-99 kr/månad
Studiestugan Pro Yearly: 590-790 kr/år (spara 30-40%)
```

## Testa att Allt Fungerar

### Checklist innan App Review
- [ ] Priser konfigurerade för Sverige i App Store Connect
- [ ] Svenskt sandbox-konto skapat och testat
- [ ] Priser visas korrekt i SEK i appen
- [ ] Köpflöde fungerar med svenskt sandbox-konto
- [ ] "Restore Purchases" fungerar
- [ ] Prenumerationstexter är korrekta (månad/år, inte month/year)

## Teknisk Information

Appen använder redan rätt implementation:
```typescript
// Detta hämtar automatiskt priser i rätt valuta
price: monthlyPkg.product.priceString  // "79 kr" för Sverige
```

RevenueCat SDK gör följande automatiskt:
1. Detekterar användarens Apple ID region
2. Hämtar rätt pris från App Store för den regionen
3. Formaterar priset med rätt valutasymbol och format
4. Returnerar `priceString` som "79 kr" (för Sverige)

**Du behöver inte ändra någon kod** - endast App Store Connect-konfiguration!

## Support

Om priserna fortfarande visas fel efter att du har följt denna guide:
1. Kontakta RevenueCat support
2. Verifiera att din RevenueCat konfiguration matchar App Store Connect
3. Kontrollera att offerings är korrekt konfigurerade i RevenueCat dashboard

## Länkar

- [App Store Connect](https://appstoreconnect.apple.com)
- [RevenueCat Dashboard](https://app.revenuecat.com)
- [Apple Subscription Pricing](https://developer.apple.com/app-store/subscriptions/pricing/)
- [RevenueCat Testing Guide](https://www.revenuecat.com/docs/test-and-launch/sandbox)

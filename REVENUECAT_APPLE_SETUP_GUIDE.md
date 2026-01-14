# RevenueCat + Apple Setup Guide

## Översikt
Denna guide hjälper dig att konfigurera RevenueCat med Apple App Store för att aktivera in-app-köp i din app.

## Status
✅ iOS API Key är redan konfigurerad: `appl_ttKXYkEBKHJdIqTkYvbLSbUSDcX`

## Steg-för-steg guide

### 1. App Store Connect - Skapa produkter

#### a) Logga in på App Store Connect
1. Gå till [App Store Connect](https://appstoreconnect.apple.com)
2. Logga in med ditt Apple Developer-konto
3. Välj din app

#### b) Skapa In-App Purchase produkter
1. Navigera till **Features** > **In-App Purchases**
2. Klicka på **+** för att skapa ny produkt
3. Välj **Auto-Renewable Subscription**

#### c) Månadsprenumeration
Skapa produkt med följande detaljer:
- **Product ID**: `premium_monthly`
- **Reference Name**: Premium Månadsvis
- **Subscription Group**: Skapa ny grupp "Premium Subscriptions"
- **Subscription Duration**: 1 Month
- **Price**: Välj önskad prisnivå (t.ex. 29 kr/månad)

För **Localization** (Swedish):
- **Subscription Display Name**: Premium Månadsvis
- **Description**: Få tillgång till alla premium-funktioner

#### d) Årsprenumeration
Skapa ytterligare en produkt:
- **Product ID**: `premium_yearly`
- **Reference Name**: Premium Årsvis
- **Subscription Group**: Samma som ovan "Premium Subscriptions"
- **Subscription Duration**: 1 Year
- **Price**: Välj önskad prisnivå (t.ex. 249 kr/år)

För **Localization** (Swedish):
- **Subscription Display Name**: Premium Årsvis
- **Description**: Få tillgång till alla premium-funktioner. Spara jämfört med månadsvis!

#### e) Godkänn produkterna
1. Fyll i all obligatorisk information
2. Klicka **Save** för varje produkt
3. Vänta på att Apple granskar produkterna (vanligtvis snabbt)

---

### 2. RevenueCat Dashboard - Konfigurera produkter

#### a) Logga in på RevenueCat
1. Gå till [RevenueCat Dashboard](https://app.revenuecat.com)
2. Välj ditt projekt

#### b) Verifiera App Store Connect integration
1. Navigera till **Project Settings** > **Apple App Store**
2. Bekräfta att din iOS app är ansluten
3. Om inte ansluten, följ RevenueCats guide för att koppla App Store Connect

#### c) Skapa Entitlement
1. Gå till **Entitlements**
2. Klicka **+ New**
3. Skapa entitlement:
   - **Identifier**: `premium` (MÅSTE matcha PREMIUM_ENTITLEMENT_ID i koden)
   - **Description**: Premium Access

#### d) Skapa produkter i RevenueCat
1. Gå till **Products**
2. Klicka **+ New**

För månadsprodukten:
- **Product Identifier**: `premium_monthly` (måste matcha App Store Connect)
- **Store**: App Store
- **Product Type**: Subscription

För årsprodukten:
- **Product Identifier**: `premium_yearly` (måste matcha App Store Connect)
- **Store**: App Store
- **Product Type**: Subscription

#### e) Skapa Offering
1. Gå till **Offerings**
2. Klicka **+ New**
3. Skapa offering:
   - **Identifier**: `default` (viktigt - appen letar efter "current offering")
   - **Description**: Standard Premium Offering
4. Markera som **Current Offering** (mycket viktigt!)

#### f) Lägg till Packages till Offering
1. Öppna din "default" offering
2. Klicka **+ Add Package**

För månadspackage:
- **Identifier**: `$rc_monthly` (eller `monthly`)
- **Product**: Välj `premium_monthly`
- **Entitlement**: Välj `premium`

För årspackage:
- **Identifier**: `$rc_annual` (eller `yearly`)
- **Product**: Välj `premium_yearly`
- **Entitlement**: Välj `premium`

---

### 3. Testa integrationen

#### a) Sandbox Testing på fysisk enhet
1. På din iPhone, gå till **Inställningar** > **App Store** > **Sandbox Account**
2. Skapa ett sandbox test-konto i App Store Connect under **Users and Access** > **Sandbox Testers**
3. Logga in med sandbox-kontot på enheten
4. Öppna appen och försök köpa premium
5. Använd sandbox-kontot för att slutföra köpet

#### b) Verifiera i RevenueCat Dashboard
1. Efter test-köpet, gå till RevenueCat Dashboard
2. Navigera till **Customers**
3. Sök efter din sandbox-användares ID
4. Verifiera att entitlement "premium" visas som aktiv

---

### 4. Felsökning

#### Problem: "Inga produkter tillgängliga"
- Kontrollera att produkterna är godkända i App Store Connect
- Verifiera att Product IDs matchar exakt mellan App Store Connect och RevenueCat
- Bekräfta att "default" offering är markerad som "Current Offering"

#### Problem: "Purchase failed"
- Kontrollera att du är inloggad med sandbox-konto på enheten
- Verifiera att App Store Connect är korrekt länkat i RevenueCat
- Kontrollera nätverksanslutning

#### Problem: "Entitlement inte aktiv efter köp"
- Verifiera att produkten är kopplad till "premium" entitlement i offering-packagesen
- Kontrollera att PREMIUM_ENTITLEMENT_ID i koden är `premium`

#### Debug-läge
Appen har debug-läge aktiverat i development. Du kan se detaljerade loggar:
```bash
# Filtrera RevenueCat-loggar
# I Xcode eller React Native logs
[RevenueCat] ...
```

---

### 5. Production Checklist

Innan release, kontrollera:

- [ ] Alla produkter är godkända i App Store Connect
- [ ] RevenueCat är korrekt konfigurerat med App Store Connect
- [ ] "default" offering är Current Offering
- [ ] Båda packages (monthly, yearly) finns i offering
- [ ] Test-köp fungerar i sandbox
- [ ] API keys är korrekta i koden
- [ ] Produktpriser är satta korrekt
- [ ] Lokalisering (svenska) är komplett
- [ ] Privacy Policy och Terms of Service är länkade

---

### 6. Kod-verifiering

Din app är redan konfigurerad med:
- ✅ iOS API Key
- ✅ Premium entitlement ID: `premium`
- ✅ Förväntade produkt IDs: `premium_monthly`, `premium_yearly`
- ✅ PremiumContext integrerad
- ✅ PremiumGate komponenter

---

### 7. Testflöde

1. **Installera appen** på fysisk enhet (simulatorn fungerar inte för IAP)
2. **Logga in** med sandbox test-konto
3. **Öppna Premium-sidan** i appen
4. **Se produkterna** - de ska visa korrekt pris
5. **Köp prenumeration** - använd sandbox-konto
6. **Verifiera access** - premium-funktioner ska låsas upp direkt
7. **Testa restore** - avinstallera och återinstallera, tryck "Återställ köp"

---

### Support

Om du stöter på problem:
1. Kontrollera RevenueCat Dashboard för felmeddelanden
2. Kolla app-loggar för detaljerad information
3. Verifiera att alla IDs matchar exakt
4. Kontakta RevenueCat support om persistent problem

---

## Snabbkommando för testning

```bash
# Starta appen i development mode
npx expo start

# Öppna på fysisk enhet via QR-kod eller tunnel
# Kontrollera att sandbox-konto är inloggat i Inställningar
```

---

## Nästa steg efter setup

1. Skapa Terms of Service och Privacy Policy
2. Lägg till länkar i premium-sidan
3. Testa thoroughly med olika scenarios
4. Förbereda App Store submission
5. Konfigurera Android (Google Play) när redo

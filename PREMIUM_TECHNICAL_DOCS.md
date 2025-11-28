# Premium System - Teknisk dokumentation

## Arkitektur

```
┌─────────────┐
│   User      │
│  (iPhone)   │
└──────┬──────┘
       │
       │ Klickar "KÖP PREMIUM"
       ▼
┌──────────────────────────┐
│  app/premium.tsx         │  ← Premium sida
│  - Visar priser          │
│  - Hämtar offerings      │
│  - Initierar köp         │
└──────┬───────────────────┘
       │
       │ purchasePackage(pkg)
       ▼
┌──────────────────────────┐
│ contexts/                │
│ PremiumContext.tsx       │  ← Huvudlogik
│                          │
│ • Initierar RevenueCat   │
│ • Hanterar köp           │
│ • Synkar med Supabase    │
│ • Exponerar isPremium    │
└──────┬───────────────────┘
       │
       ├────────────┬────────────┐
       │            │            │
       ▼            ▼            ▼
┌────────────┐ ┌─────────┐ ┌──────────┐
│ RevenueCat │ │iOS Store│ │ Supabase │
│    SDK     │ │Connect  │ │ Database │
└────────────┘ └─────────┘ └──────────┘
       │            │            │
       │            │            │
       └────────────┴────────────┘
                    │
                    ▼
              Premium aktiv!
```

## Filer och dess roller

### 1. `contexts/PremiumContext.tsx`
**Roll:** Centralt nav för premium-logik

**Funktioner:**
```typescript
// Huvudfunktioner
initializeRevenueCat()           // Initierar SDK när app startar
syncRevenueCatWithDatabase()     // Synkar status med Supabase
loadSubscriptionData()           // Läser från Supabase vid start

// Exponerade funktioner
isPremium: boolean              // true om användaren har premium
getOfferings()                  // Hämtar prenumerationsplaner
purchasePackage(pkg)            // Köper en prenumeration
restorePurchases()              // Återställer tidigare köp
```

**State:**
```typescript
subscriptionType: 'free' | 'premium'
subscriptionExpiresAt: Date | null
isLoading: boolean
isPremium: boolean  // Computed från ovan
```

**Initialisering:**
```typescript
// När användare loggar in
useEffect(() => {
  initializeRevenueCat();
}, [authUser]);

// RevenueCat konfigureras med:
Purchases.configure({ apiKey: 'appl_XXX' });
Purchases.logIn(authUser.id);  // Kopplar till user
```

**Köpflöde:**
```typescript
const purchasePackage = async (pkg: PurchasesPackage) => {
  // 1. Anropa RevenueCat
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  
  // 2. Kolla om premium blev aktivt
  const hasPremium = 
    customerInfo.entitlements.active['premium'] !== undefined;
  
  // 3. Synka med database
  if (hasPremium) {
    await syncRevenueCatWithDatabase(customerInfo);
    return true;
  }
  
  return false;
};
```

**Databas-synkronisering:**
```typescript
const syncRevenueCatWithDatabase = async (customerInfo) => {
  const hasPremium = 
    customerInfo.entitlements.active['premium'] !== undefined;
  const expirationDate = 
    customerInfo.entitlements.active['premium']?.expirationDate;
  
  // Uppdatera Supabase
  await supabase
    .from('profiles')
    .update({
      subscription_type: hasPremium ? 'premium' : 'free',
      subscription_expires_at: expirationDate || null,
    })
    .eq('id', authUser.id);
  
  // Uppdatera lokal state
  setSubscriptionType(hasPremium ? 'premium' : 'free');
  setSubscriptionExpiresAt(expirationDate ? new Date(expirationDate) : null);
};
```

### 2. `app/premium.tsx`
**Roll:** UI för att visa och köpa premium

**State:**
```typescript
const [selectedPlan, setSelectedPlan] = 
  useState<'monthly' | 'yearly'>('yearly');
const [offerings, setOfferings] = useState<any>(null);
const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
const [isPurchasing, setIsPurchasing] = useState(false);
```

**Hämta offerings:**
```typescript
useEffect(() => {
  const loadOfferings = async () => {
    const result = await getOfferings();
    setOfferings(result);
  };
  loadOfferings();
}, []);
```

**Köp-handler:**
```typescript
const handleUpgrade = async () => {
  const packages = offerings.availablePackages;
  
  // Hitta valt paket
  const selectedPackage = selectedPlan === 'monthly' 
    ? packages.find(pkg => pkg.packageType === 'MONTHLY')
    : packages.find(pkg => pkg.packageType === 'ANNUAL');
  
  // Köp
  const success = await purchasePackage(selectedPackage);
  
  if (success) {
    // Premium aktivt! UI uppdateras automatiskt
  }
};
```

**Återställ köp:**
```typescript
const handleRestorePurchases = async () => {
  const success = await restorePurchases();
  if (success) {
    router.back();  // Gå tillbaka
  }
};
```

### 3. `components/PremiumGate.tsx`
**Roll:** Blockar premium-funktioner för icke-betalande användare

**Usage:**
```typescript
import { PremiumGate } from '@/components/PremiumGate';

// Wrappa premium-innehåll
<PremiumGate feature="ai-chat">
  <AIChat />  // Visas blurrad för free users
</PremiumGate>
```

**Implementation:**
```typescript
export function PremiumGate({ feature, children }) {
  const { isPremium } = usePremium();
  
  // Premium user? Visa innehåll
  if (isPremium) {
    return <>{children}</>;
  }
  
  // Free user? Visa blur + upgrade-knapp
  return (
    <View>
      {children}  // Underliggande innehåll
      <BlurView>  // Overlay
        <Crown />
        <Text>Denna funktion kräver Premium</Text>
        <Button onPress={() => router.push('/premium')}>
          Uppgradera
        </Button>
      </BlurView>
    </View>
  );
}
```

### 4. Database Schema (Supabase)
**Tabell:** `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  subscription_type TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  -- ... andra kolumner
);
```

**Värden:**
- `subscription_type`: `'free'` eller `'premium'`
- `subscription_expires_at`: 
  - `null` för free users
  - Future date för aktiva prenumerationer
  - Past date för utgångna prenumerationer

**isPremium-logik:**
```typescript
const isPremium = useMemo(() => {
  // Måste ha subscription_type = 'premium'
  if (subscriptionType !== 'premium') return false;
  
  // Om inget utgångsdatum = lifetime premium
  if (!subscriptionExpiresAt) return true;
  
  // Annars, kolla om fortfarande aktivt
  return subscriptionExpiresAt > new Date();
}, [subscriptionType, subscriptionExpiresAt]);
```

## RevenueCat Configuration

### Products (App Store Connect)
```
premium_monthly
├─ Price: 49 SEK
├─ Duration: 1 month
└─ Auto-renewable: Yes

premium_yearly
├─ Price: 150 SEK
├─ Duration: 1 year
└─ Auto-renewable: Yes
```

### Entitlements (RevenueCat)
```
premium
├─ Identifier: "premium"  // VIKTIGT! Måste matcha kod
├─ Attached Products:
│  ├─ premium_monthly
│  └─ premium_yearly
└─ Description: "All premium features"
```

**Varför "premium"?**
Koden kollar efter detta specifika namn:
```typescript
customerInfo.entitlements.active['premium']  // ← 'premium' här
```

### Offerings (RevenueCat)
```
Default Offering
├─ Monthly Package
│  ├─ Product: premium_monthly
│  └─ Package Type: MONTHLY
└─ Annual Package
   ├─ Product: premium_yearly
   └─ Package Type: ANNUAL
```

## Användarflöden

### Scenario 1: Ny användare köper premium

```
1. User öppnar app → Loggar in
   └─> PremiumContext initieras
       └─> isPremium = false

2. User ser "Premium krävs" på AI Chat
   └─> Klickar "Uppgradera"

3. Navigerar till /premium
   └─> getOfferings() anropas
       └─> RevenueCat hämtar från App Store
           └─> offerings.availablePackages fylls

4. User väljer "150 kr/år"
   └─> Klickar "KÖP PREMIUM"

5. handleUpgrade() anropas
   └─> purchasePackage(yearlyPackage)
       └─> iOS visar betalningsdialog
           └─> User bekräftar med Face ID

6. Payment success
   └─> RevenueCat tar emot receipt
       └─> customerInfo uppdateras
           └─> entitlements.active['premium'] = {...}

7. syncRevenueCatWithDatabase(customerInfo)
   └─> Supabase UPDATE profiles SET
       subscription_type = 'premium',
       subscription_expires_at = '2025-11-28'

8. Local state uppdateras
   └─> isPremium = true

9. UI re-renders
   └─> PremiumGate släpper igenom
   └─> AI Chat är nu tillgänglig
   └─> Success toast visas
```

### Scenario 2: Användare återställer köp

```
1. User installerar app på ny enhet
   └─> Loggar in med samma konto
       └─> isPremium = false (ingen data i Supabase än)

2. User går till /premium
   └─> Scrollar ner
   └─> Klickar "Återställ köp"

3. handleRestorePurchases() anropas
   └─> restorePurchases() i PremiumContext
       └─> RevenueCat.restorePurchases()
           └─> iOS kontaktar App Store
               └─> "Hitta alla köp för detta Apple ID"

4. App Store returnerar köp-historik
   └─> RevenueCat matchar mot prenumerationer
       └─> customerInfo uppdateras med aktiv prenumeration

5. syncRevenueCatWithDatabase(customerInfo)
   └─> Supabase uppdateras
       └─> subscription_type = 'premium'

6. isPremium = true
   └─> Success toast: "Köp återställda!"
   └─> Router.back() till föregående sida
```

### Scenario 3: Automatisk förnyelse

```
Timeline: 2025-11-28 (prenumeration går ut)

23:59:59 - iOS skickar reminder-notis till user
00:00:00 - iOS försöker förnya prenumerationen
         └─> Debiterar Apple ID
         └─> Om success: Ny period börjar
         └─> iOS → App Store Server → RevenueCat Webhook

00:00:05 - RevenueCat tar emot webhook
         └─> Uppdaterar customerInfo
         └─> subscription_expires_at = '2026-11-28'

00:00:10 - Nästa gång användaren öppnar appen:
         └─> initializeRevenueCat()
         └─> Purchases.getCustomerInfo()
         └─> syncRevenueCatWithDatabase()
         └─> Supabase uppdateras automatiskt
         └─> User behöver inte göra något!
```

### Scenario 4: Betalning misslyckas

```
00:00:00 - iOS försöker förnya
         └─> Kreditkort declined
         └─> Betalning misslyckas

00:00:05 - iOS skickar notis till användaren:
         "Kan inte förnya Studiestugan Pro"

Dag 1-16 - Grace period (användaren har fortfarande access)
         └─> iOS försöker flera gånger
         └─> Användaren kan uppdatera betalningsmetod

Dag 17  - Prenumeration expired
        └─> App Store → RevenueCat Webhook
        └─> entitlements.active['premium'] = undefined

Nästa app-öppning:
        └─> syncRevenueCatWithDatabase()
        └─> subscription_type = 'free'
        └─> isPremium = false
        └─> Premium-funktioner låses automatiskt
```

## Debugging

### Console Logs
Appen loggar alla viktiga händelser:

```
[RevenueCat] Initializing...
[RevenueCat] Initialized successfully
[RevenueCat] Logged in user: abc-123-def
[RevenueCat] Fetching offerings...
[RevenueCat] Available offerings: { monthly: {...}, yearly: {...} }
[RevenueCat] Purchasing package: premium_yearly
[RevenueCat] Purchase successful!
[RevenueCat] Customer info updated: {...}
[RevenueCat] Syncing with database - Has Premium: true
[RevenueCat] Successfully synced with database
```

### Fel och lösningar

**"API key not configured"**
```
Loggas när: apiKey.includes('YOUR_')
Lösning: Ersätt placeholder med riktig nyckel i PremiumContext.tsx
```

**"No offerings available"**
```
Orsaker:
1. Produkter inte skapade i App Store Connect
2. Produkter inte importerade till RevenueCat
3. Offerings inte konfigurerade i RevenueCat
4. För tidigt efter konfiguration (cache inte uppdaterad)

Lösning: Vänta 5-10 minuter efter RevenueCat-konfiguration
```

**"Purchase completed but premium not active"**
```
Orsak: Entitlement identifier matchar inte 'premium'
Kontrollera: 
- RevenueCat Dashboard → Entitlements
- Identifier måste vara exakt "premium"
- Produkter måste vara kopplade till denna entitlement
```

**"Syncing with database failed"**
```
Orsak: Supabase-anslutning eller schema-problem
Kontrollera:
1. profiles-tabellen har kolumnerna:
   - subscription_type (TEXT)
   - subscription_expires_at (TIMESTAMPTZ)
2. RLS policies tillåter UPDATE för ägaren
3. authUser.id är valid UUID
```

## Performance

### Initialisering
- RevenueCat initieras vid app start: ~100-200ms
- Offerings hämtas när premium-sidan öppnas: ~500-1000ms
- Använder caching för att minimera nätverksanrop

### Köp
- iOS payment sheet: Varierar (Face ID bekräftelse)
- Receipt validation: ~500ms (RevenueCat servrar)
- Database sync: ~200ms (Supabase)
- Total: ~1-2 sekunder efter användarbekräftelse

### Offline beteende
- RevenueCat cachar subscription status lokalt
- isPremium fungerar offline (efter första synk)
- Köp kräver internet (iOS requirement)
- Database sync sker nästa gång app har internet

## Säkerhet

### Receipt Validation
- Hanteras automatiskt av RevenueCat
- Servrar validerar alla kvitton mot Apple
- Förhindrar piratkopiering och fake receipts

### User Identity
- RevenueCat använder Supabase user ID som customer ID
- Samma prenumeration fungerar på alla enheter med samma Apple ID
- Cross-platform support (iOS → web → Android om du aktiverar)

### API Keys
- Aldrig exponera i klientkod (redan säkert med Expo)
- RevenueCat public keys är OK i appen
- Secret keys (för webhooks) ska aldrig delas

## Framtida expansion

### Promotional Offers
```typescript
// Lägg till i offerings
const introductoryOffer = {
  identifier: '$rc_promo_3_months_50_off',
  // 3 månader för halva priset
};
```

### Win-back campaigns
```typescript
// RevenueCat Experiments
// Testa olika erbjudanden för churned users
```

### Analytics
```typescript
// Custom events
Purchases.logIn(userId);
Purchases.setAttributes({
  '$displayName': userName,
  'referrer': referrerCode,
});
```

### Multiple tiers
```typescript
// Basic tier: 29 kr
// Pro tier: 49 kr
// Ultimate tier: 79 kr

// Olika entitlements för varje tier
entitlements.active['basic']
entitlements.active['pro']
entitlements.active['ultimate']
```

## Sammanfattning

Systemet är byggt för:
- ✅ **Enkelhet:** En funktion - purchasePackage() - för att köpa
- ✅ **Tillförlitlighet:** RevenueCat hanterar alla edge cases
- ✅ **Skalbarhet:** Stödjer miljontals användare out of the box
- ✅ **Maintenance:** Automatiska förnyelser, webhook-hantering
- ✅ **Analytics:** Inbyggd tracking av MRR, churn, cohorts

När du har konfigurerat RevenueCat och lagt in API-nyckeln, fungerar allt automatiskt! 🎉

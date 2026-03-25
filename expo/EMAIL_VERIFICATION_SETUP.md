# Email Verification Setup Guide

Detta dokument förklarar hur du konfigurerar email verification för din StudieStugan-app med Supabase.

## 1. Supabase Dashboard Konfiguration

### Steg 1: Aktivera Email Confirmation

1. Gå till din Supabase Dashboard: https://supabase.com/dashboard
2. Välj ditt projekt
3. Navigera till **Authentication → Providers → Email**
4. Aktivera följande inställningar:
   - ✅ **Confirm email** - Kräver att användare bekräftar sin e-post
   - ✅ **Secure email change** - Kräver bekräftelse vid e-postbyte

### Steg 2: Konfigurera URL Configuration

1. Gå till **Authentication → URL Configuration**
2. Lägg till följande URLs:

**Site URL:**
```
exp://192.168.1.X:8081
```
(Byt ut `192.168.1.X` med din lokala IP-adress)

**Redirect URLs:** (en per rad)
```
exp://192.168.1.X:8081
rork://
rork://**
```

För produktion, lägg även till:
```
https://din-app-domän.com
https://din-app-domän.com/**
```

### Steg 3: Anpassa Email Template (valfritt)

1. Gå till **Authentication → Email Templates**
2. Välj **Confirm signup**
3. Anpassa texten på svenska:

**Subject:**
```
Bekräfta din e-postadress
```

**Body:**
```html
<h2>Välkommen till StudieStugan!</h2>
<p>Tack för att du skapade ett konto. Klicka på länken nedan för att bekräfta din e-postadress:</p>
<p><a href="{{ .ConfirmationURL }}">Bekräfta e-post</a></p>
<p>Om du inte skapade detta konto kan du ignorera detta mail.</p>
<p>Hälsningar,<br>StudieStugan-teamet</p>
```

## 2. App.json Konfiguration

Din `app.json` behöver följande konfiguration:

```json
{
  "expo": {
    "scheme": "rork",
    "plugins": [
      ["expo-router", { "origin": "https://rork.com/" }],
      ["expo-linking", { "scheme": "rork" }]
    ]
  }
}
```

**OBS:** Filen `app.json` kan inte redigeras automatiskt via Rork-verktyget. Du måste manuellt uppdatera den med konfigurationen ovan.

## 3. Hur Systemet Fungerar

### För Utveckling (Expo Go)

1. **Användaren skapar konto:**
   - Användaren fyller i email och lösenord
   - Systemet skapar kontot i Supabase
   - Om email verification är aktiverat → användaren ser "Bekräfta din e-post"-skärmen

2. **Email skickas:**
   - Supabase skickar ett mail med verifieringslänk
   - Länken innehåller access_token som query parameter

3. **Användaren klickar på länken:**
   - Länken öppnas i appen via deep linking
   - AuthContext hanterar deep link och verifierar sessionen
   - Användaren loggas in automatiskt och navigeras till onboarding

### För Produktion (Standalone App)

Deep linking fungerar automatiskt via `rork://` scheme i production builds.

## 4. Testning

### Lokal Testning (Expo Go)

1. **Hitta din lokala IP:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **Uppdatera Supabase URLs** med din IP (se Steg 2 ovan)

3. **Starta appen:**
   ```bash
   npx expo start
   ```

4. **Testa signup-flödet:**
   - Skapa ett nytt konto med en giltig e-postadress
   - Du ska se "Bekräfta din e-post"-skärmen
   - Kolla din inkorg (och spam)
   - Klicka på verifieringslänken
   - Appen ska öppnas och logga in dig automatiskt

### Felsökning

**Problem: Deep link öppnar inte appen**
- Kontrollera att IP-adressen i Supabase matchar din lokala IP
- Kontrollera att `app.json` har rätt scheme konfiguration
- Prova att starta om Expo utvecklingsservern

**Problem: Email kommer inte fram**
- Kolla spam-mappen
- Verifiera att email provider settings är korrekta i Supabase
- Testa med olika email-adresser (vissa providers blockerar test-mail)

**Problem: "Email not confirmed" efter klick**
- Vänta några sekunder efter att ha klickat på länken
- Deep linking kan ta 2-5 sekunder att processa
- Kontrollera att sessionen sparas korrekt (kolla console logs)

## 5. För Premium/RevenueCat Testing

Om du behöver testa premium-funktioner utan RevenueCat:

### Metod 1: Temporär Bypass (Development Only)

I `contexts/PremiumContext.tsx`, lägg till ett development mode:

```typescript
const IS_DEV_MODE = __DEV__ && true; // Sätt till true för testing

useEffect(() => {
  if (IS_DEV_MODE) {
    // Mocka premium status för testing
    setHasPremium(true);
    return;
  }
  // Normal RevenueCat logic...
}, []);
```

### Metod 2: Databas Override

Uppdatera direkt i Supabase:

```sql
UPDATE profiles 
SET subscription_type = 'premium' 
WHERE email = 'din-test-email@example.com';
```

**OBS:** Glöm inte att ta bort development bypass innan production release!

## 6. Production Checklist

Innan du går live:

- [ ] Email templates är anpassade på svenska
- [ ] Redirect URLs inkluderar din production domän
- [ ] Deep linking testat på både iOS och Android
- [ ] RevenueCat är korrekt konfigurerad
- [ ] Development bypasses är borttagna
- [ ] Email deliverability testad med riktiga e-postadresser
- [ ] Spam-score är acceptabel (testa med mail-tester.com)

## 7. Viktiga Säkerhetsnoteringar

1. **Aktivera RLS (Row Level Security)** på alla tabeller i Supabase
2. **Validera email-adresser** på serversidan (Supabase gör detta automatiskt)
3. **Rate-limitera** email-sändning för att undvika missbruk
4. **Loggning:** Aktivera Supabase logs för att spåra auth events

## Support

För fler frågor:
- Supabase Docs: https://supabase.com/docs/guides/auth
- Expo Linking: https://docs.expo.dev/guides/linking/
- React Native Linking: https://reactnative.dev/docs/linking

---

**Version:** 1.0  
**Senast uppdaterad:** 2026-01-09

# App Review Guide - StudyHub

## Översikt
StudyHub är en studie-app för svenska gymnasie- och universitetsstudenter med fokus på Högskoleprovet, kurser och studieplanering.

## Test-konto för App Review
- **Email**: [Du behöver skapa ett test-konto]
- **Lösenord**: [Sätt ett lösenord]

## Vad appen gör

### 1. Första användningen (FTUE - First Time User Experience)
När appen startar första gången:
1. Välkomstskärm visas
2. Användaren skapar konto eller loggar in
3. Onboarding: Välj studienivå (Gymnasium/Universitet)
4. Välj kurser/program
5. Huvudskärmen visas

### 2. Huvudfunktioner (Gratis)
- **Hem-fliken**: Översikt över studieframsteg, dagliga mål, streak
- **Kurser-fliken**: Se alla tillgängliga kurser och lektioner
- **Högskoleprovet-fliken**: Träna på Högskoleprovet-frågor (begränsad åtkomst)
- **Statistik-fliken**: Se studiestatistik och framsteg
- **Profil-fliken**: Inställningar, vänner, achievements

### 3. Premium-funktioner
Premium-abonnemang ger tillgång till:
- **Obegränsade AI-genererade Högskoleprovet-prov**
- **AI-genererade flashcards** för alla kurser
- **Avancerad statistik** och analys
- **Premium-badges och avatarer**
- **Prioriterad support**

## Hur man testar Premium-funktionen

### Steg 1: Navigera till Premium
1. Öppna appen
2. Gå till **Profil-fliken** (sista fliken)
3. Tryck på **"Premium"** eller **"Uppgradera till Premium"**
4. Du ser nu premiumskärmen med abonnemangsalternativ

### Steg 2: Se abonnemangsplaner
Du kommer att se följande abonnemang:
- **Månadsprenumeration**: [Pris]/månad
- **Årsprenumeration**: [Pris]/år (bäst värde)

Varje plan visar:
- Längd på abonnemang (1 månad / 1 år)
- Pris
- Lista över funktioner
- Automatisk förnyelse information

### Steg 3: Testa köpflödet (Sandbox)
1. Tryck på **"Start Premium"** eller **"Subscribe"**
2. iOS kommer att visa en bekräftelsedialog
3. Använd ditt **sandbox test-konto** för att slutföra köpet
4. Efter köp får du omedelbar åtkomst till Premium-funktioner

### Steg 4: Verifiera Premium-åtkomst
Efter aktivering av Premium:
1. Gå till **Högskoleprovet-fliken**
2. Tryck på **"AI-Generera Prov"** - ska nu fungera
3. Gå till en kurs och tryck på **"AI-Flashcards"** - ska nu fungera
4. I **Profil-fliken** ska du se en Premium-badge

## Prenumerationsinformation (krävs enligt Apple guidelines)

### I appen visas:
- **Titel**: StudyHub Premium
- **Längd**: 1 månad eller 12 månader (1 år)
- **Pris**: Visas tydligt för varje plan
- **Auto-förnyelse**: Information om automatisk förnyelse visas i köpflödet
- **Avbryt när som helst**: Information om uppsägning finns

### Länkar (krävs):
- **Privacy Policy**: [Du måste lägga till denna länk]
- **Terms of Use (EULA)**: [Du måste lägga till denna länk]

## Account Deletion (krävs enligt 5.1.1)
Användare kan radera sitt konto genom:
1. Gå till **Profil-fliken**
2. Gå till **Inställningar** (kugghjulsikon)
3. Scrolla ner till **"Radera konto"**
4. Bekräfta radering
5. Alla användardata raderas permanent från servern

## Teknisk information

### Betalningssystem
- Använder **RevenueCat** för hantering av IAP
- Stödjer iOS Sandbox-testning
- Automatisk synkronisering av premium-status

### Databas
- Backend: Supabase (PostgreSQL)
- All användardata lagras säkert
- GDPR-kompatibel datahantering

## Vanliga scenarier att testa

### Scenario 1: Ny användare med Premium
1. Skapa nytt konto
2. Genomför onboarding
3. Köp Premium direkt
4. Testa AI-funktioner

### Scenario 2: Gratis användare testar limitering
1. Skapa nytt konto
2. Försök generera AI-prov (ska blockeras)
3. Klicka på Premium-uppmaningar
4. Se premium-skärm

### Scenario 3: Premium-användare
1. Logga in med konto som har Premium
2. Verifiera tillgång till alla funktioner
3. Se Premium-badge i profil

## Support och kontakt
För frågor om appen, kontakta: [Din support-email]

## Viktig information för reviewers

### Sandbox-testning
- Appen är konfigurerad för iOS Sandbox IAP-testning
- Använd ett Apple Sandbox test-konto för att testa köp
- Inga riktiga betalningar kommer att göras under review

### Alla IAP-produkter är inskickade
Följande IAP-produkter ska finnas i App Store Connect:
- [Premium Monthly Subscription ID]
- [Premium Yearly Subscription ID]

Alla produkter är markerade som "Ready for Review" tillsammans med denna app-version.

---

**Version**: 1.0  
**Datum**: 2026-01-30  
**Plattform**: iOS (iPad & iPhone)

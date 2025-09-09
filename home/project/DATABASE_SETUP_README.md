# Database Setup Guide

## Rekommenderad SQL-fil att använda

**Använd: `clean-database-setup.sql`**

Denna fil är den mest uppdaterade och korrekta för din databas-struktur.

## Vad som är fel med de andra SQL-filerna

De andra SQL-filerna i projektet har följande problem:

1. **Refererar till `auth.users`** - Din databas använder bara `profiles` tabellen
2. **Inkonsekventa RLS-policies** - Olika filer har olika policies
3. **Syntax-fel** - Några filer har felaktig SQL-syntax

## Vad clean-database-setup.sql gör

✅ Aktiverar RLS på alla tabeller
✅ Skapar korrekta RLS-policies som matchar din databas-struktur  
✅ Skapar trigger för automatisk profil-skapande
✅ Lägger till index för bättre prestanda
✅ Lägger till exempel-data för study_tips och study_techniques

## Hur du använder den

1. Gå till din Supabase dashboard
2. Öppna SQL Editor
3. Kopiera innehållet från `clean-database-setup.sql`
4. Kör SQL-koden

## Filer att ignorera

Dessa filer är föråldrade och ska inte användas:
- `supabase-schema.sql`
- `complete-database-fix.sql` 
- `enable-rls-and-fix-auth.sql`
- `proper-rls-setup.sql`
- `complete-rls-setup.sql`
- `fix-all-rls-policies.sql`
- `create-profile-trigger.sql`

## Problemet med user-data som inte sparas

Om användare måste genomgå kursvalprocessen ofta beror det på att:

1. RLS-policies blockerar läsning/skrivning av profil-data
2. Profiler skapas inte automatiskt när användare registrerar sig
3. Kursval sparas inte korrekt i databasen

`clean-database-setup.sql` löser alla dessa problem.
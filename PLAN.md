# Högskoleprovet Höst 2026 · 18 oktober

## Klart i appen

- [x] Rikta HP-studieplanen mot nästa prov: **Höst 2026 · 18 oktober**
- [x] Ta bort vår 2026 som valbart mål efter att 18 april är passerat
- [x] Migrera befintliga sparade HP-planer som pekar på gammalt prov till höst 2026
- [x] Uppdatera HP-countdown-kortet så startsidan visar höstprovet

## Produktplan inför höstprovet

- [ ] Flytta alla hårdkodade HP-frågor från `expo/constants/hogskoleprovet-questions.ts` och generatorbaser från `expo/lib/hp-question-generator.ts` till Supabase
- [ ] Skapa Supabase-tabeller: `hp_exam_versions`, `hp_sections`, `hp_questions`, `hp_answers`, `hp_passages`, `hp_user_attempts`, `hp_question_stats`
- [ ] Bygg importflöde för gamla högskoleprov med metadata: år, termin, delprov, block, fråga, facit, förklaring, svårighet
- [ ] Uppdatera övningsflödena (`hogskoleprovet`, `hp-test`, `hp-practice`, `hp-ai-practice`, `hp-select-version`) att hämta frågor via Supabase med offline/cache-fallback
- [ ] Lägg till adaptiv träning: svaga delprov prioriteras automatiskt i dagens pass
- [ ] Lägg till “Höst 2026 Roadmap” i HP-studieplanen: grundfas, mängdfas, provsimulering, slutrepetition
- [ ] Lägg till resultatanalys per delprov och fråga: tid, feltyp, återkommande svaghet, rekommenderad nästa övning
- [ ] Skapa premium-hookar: lås historiska fullprov, djupanalys, adaptiv plan och obegränsad frågebank bakom premium

## Marknadsföring inför höstprovet

- [ ] Maj–juni: SEO/TikTok/Reels kring “börja plugga till HP hösten 2026” och gratis diagnosprov i appen
- [ ] Juli–augusti: kampanj “90 dagar till 1.5+” med streaks, veckomål och före/efter-resultat
- [ ] September: retargeting mot användare som gjort diagnosprov men inte köpt premium
- [ ] Sista 30 dagarna: intensiv-sprint, pushnotiser, social proof, fullprov varje helg
- [ ] Efter provet: samla resultat, be om reviews, konvertera användare till vår 2027-plan

## Supabase-frågebank: rekommenderad riktning

- [ ] Ja, flytta frågorna till Supabase stegvis istället för en big bang
- [ ] Behåll lokal fallback tills Supabase-flödet är bevisat stabilt i produktion
- [ ] Börja med ORD/MEK som pilot, därefter XYZ/KVA/NOG/DTK, sist LÄS/ELF med textpassager
- [ ] Lägg in versionshantering så samma fråga aldrig ändras historiskt efter att användare har svarat på den

# AI-genererad studieplan kopplad till schemalagda prov

## Funktioner

- **Skapa studieplan från prov**: Under varje schemalagt prov i kursvyn finns en knapp "📋 Visa studieplan" som öppnar en detaljerad dag-för-dag-plan
- **AI-genererad plan**: AI analyserar kursnamn, provtitel och antal dagar kvar och skapar en personlig studieplan med faser, dagliga uppgifter, studietekniker och Skolverket-koppling
- **Sparas automatiskt**: Planen sparas lokalt så den inte behöver genereras om varje gång man öppnar den
- **Uppdatera plan**: Knapp i headern för att generera om planen om man vill ha en ny
- **Countdown till provet**: Visuell cirkel som visar antal dagar kvar — grön (>14 dagar), gul (7–14), röd (<7)
- **Fas-översikt**: Horisontella chips som visar studieplanens faser (t.ex. Grunder → Fördjupning → Repetition)
- **Dag-för-dag-schema**: Varje dag visar tema, studieteknik med ikon, uppgifter med tidsåtgång, och Skolverket-nivå (E/C/A)
- **Dagens markering**: Dagens datum highlightas med primärfärg
- **Provdagstips**: Speciellt kort med tips inför provdagen
- **Laddningsanimation**: Roterande meddelanden som "Analyserar kursens innehåll...", "Bygger din personliga plan..." under generering

## Design

- Mörkt/ljust tema via befintligt temastöd
- Header med kursnamn, provdatum och cirkulär countdown med färggradient
- Fas-chips i horisontell scroll med kursens primärfärg
- Dagkort med avrundade hörn, skugga, och tydlig hierarki: datum → tema → teknik-badge → uppgifter → Skolverket-fokus
- Studieteknik-badges med emoji-ikoner (🍅 Pomodoro, 🧠 Feynman, 📝 Cornell, etc.)
- Betygsnivå-badges (E/C/A) med färgkodning
- Idag-highlight med vänsterkant i primärfärg
- Provet-kort med speciell design och tipslista
- Allt på svenska

## Sidor

- **Studieplan-sida** (`/study-plan/[examId]`): Ny fullskärm med header, fas-översikt, dag-för-dag-lista och provdagstips
- **Kursvyn** (befintlig): Ny knapp "📋 Visa studieplan" under varje schemalagt prov som navigerar till studieplanen
- **Layout**: Ny route registreras i appens rotlayout

# Snygga upp AI-matematiksvaren & göm tab-baren i chatten

## Ändringar

### 1. Konvertera LaTeX till läsbara matematiska tecken
- All rå LaTeX-kod som `\frac{a}{b}`, `$$`, `x^2`, `\sqrt`, `\theta` osv. omvandlas automatiskt till snygga Unicode-tecken (t.ex. `x²`, `√x`, `θ`, `a/b`)
- Inga `$$`, `\frac`, `\\` eller andra kodtecken visas i chatten längre
- Matematiska uttryck blir rena och lättlästa

### 2. Photomath-liknande steg-kort
- Varje lösningssteg visas i ett eget snyggt kort med vit/ljus bakgrund, rundade hörn och skugga
- Stegnummer visas i en färgad cirkel till vänster
- Slutsvaret visas i ett markerat kort med tydlig ram
- Hela layouten liknar Photomath med separerade sektioner

### 3. Göm tab-baren i AI-chattar
- När man öppnar Matematik AI eller Generell AI försvinner navigeringsraden längst ner
- Tab-baren syns igen direkt när man går tillbaka till väljskärmen
- Input-fältet hamnar längst ner utan att överlappa med tab-baren

### Design
- Steg-korten har ljus bakgrund (`rgba`) med subtil kant, precis som Photomath
- Matematiska uttryck visas i en lite större, tydligare font
- Bättre spacing mellan kort — renare, luftigare layout
- Svar-kortet sticker ut med accentfärg på vänster kant

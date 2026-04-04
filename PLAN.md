# Snyggare AI-svar, smooth text & bildtextextraktion

## Vad ändras

### 1. Snyggare textformatering
- AI-svaren renderas rent utan synliga `***`, `###` eller andra markdown-symboler
- Rubriker visas som fetstil med lite större text istället för fula `###`-tecken
- Fetstil (`**text**`) visas som fetstil utan att asteriskerna syns
- Bättre mellanrum — mindre "luft" mellan stycken så texten känns tätare och mer läsbar
- Tomma rader filtreras bort så det inte blir stora gap i svaren
- Punktlistor visas snyggt med runda prickar istället för `- ` tecken

### 2. Smooth textrendering
- Texten som skrivs ut av AI:n animeras mjukt med en fade-in istället för att "hoppa" fram
- ScrollView rullar smidigt nedåt när nytt innehåll dyker upp
- Övergången från "skriver..."-indikator till faktisk text blir sömlös

### 3. Bildtextextraktion (OCR)
- Fixar bilduppladdningen så att AI:n faktiskt kan läsa och extrahera text från bilder
- Bilderna skickas i rätt format (base64 med korrekt MIME-typ) till AI-agenten
- Meddelandet anpassas automatiskt: "Vad står det på bilden?" om ingen text skrivs
- Fungerar med både kamera och galleri-bilder

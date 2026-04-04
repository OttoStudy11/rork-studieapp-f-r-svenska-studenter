# Premium Math AI med bildkort, dold tab-bar & haptics

## Vad ändras

### 1. Steg-för-steg-kort fungerar även för bilder
- AI:ns instruktioner uppdateras så att den **alltid** svarar med numrerade steg (Steg 1, Steg 2…) oavsett om frågan kommer från text eller bild
- Samma snygga kort-layout som vid textfrågor visas även när en bild skickas
- Systemprompten förtydligas: "Även om du analyserar en bild, svara med steg-för-steg-format"

### 2. Tab-baren försvinner helt i chatten
- När man öppnar Matematik AI eller Generell AI döljs navigeringsbaren helt (inga ikoner i botten)
- Baren kommer tillbaka direkt när man trycker "tillbaka" till AI-väljaren
- Fixar nuvarande bugg där `position: absolute` på tab-baren gör att den syns trots försök att dölja den

### 3. Premium UI/UX-uppgradering av Math AI-chatten
- **Header**: Glasig, elegant header med subtil gradient – liknande studieplans-designen
- **Bakgrund**: Mjuk tonad bakgrund istället för platt grå
- **Steg-kort**: Mer polish – djupare skuggor, subtil vänster-rand med accentfärg, smidigare layout
- **Svar-kort**: Tydligare "SVAR"-badge med gradient-accent
- **Tom-vy**: Mer visuellt imponerande startskärm med finare ikoner och mjukare animationer
- **Inputfält**: Renare design med mjukare kanter och premium-känsla
- **Animationer**: Meddelanden glider in smidigt (fade + slide) istället för att bara dyka upp

### 4. Haptic feedback
- Lätt vibration när man trycker på "Skicka"
- Lätt vibration vid kameraknapp och bildval
- Vibration vid "tillbaka"-knapp
- Mjuk vibration när AI:ns svar har laddats klart
- Vibration på förslagskorten i tomma vyn

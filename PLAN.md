# Ta bort OTA-uppdateringsblocket från appens konfiguration

## Vad som ändras

- **Ta bort `"updates": { "enabled": false }"`** från appens inställningar (app.json)
- Detta återställer beteendet till standard — precis som det var innan OTA konfigurerades
- Varje uppdatering kräver en ny build och publicering till App Store/TestFlight, som vanligt

## Resultat
- Appen fungerar exakt som den gjorde innan OTA-konfigurationen lades till
- Inga OTA-relaterade inställningar som kan störa byggen eller uppdateringar

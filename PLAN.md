# Fixa TestFlight-problemet: Inaktivera expo-updates

## Problem
Appen har `expo-updates` installerat men utan konfiguration i app.json. Detta gör att TestFlight-byggen kan ladda gammal cachad kod istället för den nya inbäddade koden.

## Åtgärder

**1. Inaktivera expo-updates i app.json**
- Lägga till `"updates": { "enabled": false }` i app.json så att appen alltid använder den inbäddade JS-bundlen istället för att leta efter OTA-uppdateringar

**2. Uppdatera versionsnummer**
- Bumpa `buildNumber` (iOS) och `versionCode` (Android) så att den nya builden särskiljs från den gamla
- version: 1.6.2 → 1.6.3
- buildNumber: "1.6.2" → "1.6.3"  
- versionCode: 2 → 3

## Efter dessa ändringar
Du behöver göra en **helt ny EAS build** med `--clear-cache` för att säkerställa att den nya builden inte har någon gammal cache kvar. Den nya builden kommer alltid köra den inbäddade koden.
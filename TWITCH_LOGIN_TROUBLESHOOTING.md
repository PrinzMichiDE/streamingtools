# Twitch Login Troubleshooting

## Häufige Probleme und Lösungen

### 1. "Invalid Client" Fehler

**Problem:** Die Twitch-App Credentials sind falsch oder nicht gesetzt.

**Lösung:**
- Überprüfe deine `.env` Datei:
  ```env
  TWITCH_CLIENT_ID="deine-client-id"
  TWITCH_CLIENT_SECRET="dein-client-secret"
  ```
- Stelle sicher, dass die Credentials aus dem Twitch Developer Portal korrekt kopiert wurden
- Starte den Dev-Server neu nach Änderungen an der `.env` Datei

### 2. "Redirect URI Mismatch" Fehler

**Problem:** Die Redirect URI in der Twitch-App stimmt nicht überein.

**Lösung:**
- Gehe zu https://dev.twitch.tv/console/apps
- Öffne deine App
- Füge diese Redirect URI hinzu:
  - Development: `http://localhost:3000/api/auth/callback/twitch`
  - Production: `https://deine-domain.com/api/auth/callback/twitch`
- **WICHTIG:** Die URL muss exakt übereinstimmen (inklusive http/https, Port, Pfad)

### 3. Login-Button funktioniert nicht

**Problem:** Der SessionProvider fehlt oder die signIn-Funktion wird nicht korrekt aufgerufen.

**Lösung:**
- Überprüfe, ob `SessionProvider` im `layout.tsx` eingebunden ist
- Stelle sicher, dass die Login-Seite ein Client Component ist (`'use client'`)
- Überprüfe die Browser-Konsole auf Fehler

### 4. "Database Error" beim Login

**Problem:** Die Datenbank ist nicht migriert oder die Prisma-Schema ist nicht synchronisiert.

**Lösung:**
```bash
# Datenbank migrieren
npx prisma migrate dev

# Prisma Client neu generieren
npx prisma generate
```

### 5. Session wird nicht gespeichert

**Problem:** NEXTAUTH_SECRET fehlt oder ist falsch.

**Lösung:**
- Generiere ein neues Secret:
  ```bash
  openssl rand -base64 32
  ```
- Füge es zur `.env` hinzu:
  ```env
  NEXTAUTH_SECRET="dein-generiertes-secret"
  ```
- Stelle sicher, dass `NEXTAUTH_URL` korrekt gesetzt ist:
  ```env
  NEXTAUTH_URL="http://localhost:3000"
  ```

### 6. CORS-Fehler

**Problem:** Twitch blockiert die Anfrage wegen CORS.

**Lösung:**
- Überprüfe die Redirect URI in der Twitch-App
- Stelle sicher, dass die URL mit `http://localhost:3000` beginnt (für Development)
- Überprüfe die Browser-Konsole auf spezifische CORS-Fehlermeldungen

## Debugging

### Browser-Konsole überprüfen
1. Öffne die Browser-Entwicklertools (F12)
2. Gehe zum "Console" Tab
3. Versuche dich anzumelden
4. Suche nach Fehlermeldungen

### Server-Logs überprüfen
1. Schaue in das Terminal, wo `npm run dev` läuft
2. Suche nach Fehlermeldungen oder Warnungen
3. Überprüfe, ob die Auth-Route aufgerufen wird

### Network-Tab überprüfen
1. Öffne die Browser-Entwicklertools (F12)
2. Gehe zum "Network" Tab
3. Versuche dich anzumelden
4. Überprüfe die Anfrage zu `/api/auth/signin/twitch`
5. Überprüfe die Antwort von Twitch

## Test-Checkliste

- [ ] TWITCH_CLIENT_ID ist in `.env` gesetzt
- [ ] TWITCH_CLIENT_SECRET ist in `.env` gesetzt
- [ ] NEXTAUTH_SECRET ist in `.env` gesetzt
- [ ] NEXTAUTH_URL ist in `.env` gesetzt
- [ ] Redirect URI ist in Twitch Developer Portal eingetragen
- [ ] Datenbank ist migriert (`npx prisma migrate dev`)
- [ ] Prisma Client ist generiert (`npx prisma generate`)
- [ ] Dev-Server wurde nach `.env` Änderungen neu gestartet
- [ ] SessionProvider ist im Layout eingebunden
- [ ] Login-Seite ist ein Client Component

## Nützliche Links

- Twitch Developer Portal: https://dev.twitch.tv/console/apps
- NextAuth.js Dokumentation: https://next-auth.js.org/
- Twitch OAuth Dokumentation: https://dev.twitch.tv/docs/authentication/


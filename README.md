
# Documentazione API Accorciatore di URL

## Panoramica
Un semplice servizio di accorciamento URL con gestione utenti, tracciamento dei link e aggiornamenti in tempo reale tramite WebSocket.

### Autenticazione

#### POST /api/auth/register
Registra un nuovo utente.

**Corpo della richiesta:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Risposta:**
```json
{
  "message": "Utente registrato con successo"
}
```

#### POST /api/auth/login
Effettua il login e ottieni un token JWT.

**Corpo della richiesta:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Risposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "john_doe"
}
```

### Gestione URL

#### POST /api/urls
Crea un URL accorciato (richiede autenticazione).

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Corpo della richiesta:**
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "shortCode": "custom123",
  "expirationDate": "2024-12-31T23:59:59"
}
```

**Note:**
- `shortCode` è opzionale (generato casualmente se non fornito)
- `expirationDate` è opzionale (non scade mai se non fornita)

**Risposta:**
```json
{
  "id": 1,
  "originalUrl": "https://example.com/very/long/url",
  "shortCode": "custom123",
  "shortUrl": "http://localhost:8080/custom123",
  "createdAt": "2024-01-15T10:30:00",
  "expirationDate": "2024-12-31T23:59:59",
  "visitCount": 0
}
```

#### GET /api/urls
Recupera tutti gli URL dell’utente autenticato.

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Risposta:**
```json
[
  {
    "id": 1,
    "originalUrl": "https://example.com/very/long/url",
    "shortCode": "custom123",
    "shortUrl": "http://localhost:8080/custom123",
    "createdAt": "2024-01-15T10:30:00",
    "expirationDate": "2024-12-31T23:59:59",
    "visitCount": 5
  }
]
```

#### GET /api/urls/{shortCode}/stats
Ottieni statistiche dettagliate per uno specifico URL (richiede autenticazione e proprietà).

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Risposta:**
```json
{
  "shortCode": "custom123",
  "visitCount": 5,
  "visits": [
    {
      "id": 1,
      "visitDate": "2024-01-15T14:30:00",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  ]
}
```

### Reindirizzamento URL

#### GET /{shortCode}
Reindirizza all'URL originale e traccia la visita.

**Risposta:**
- HTTP 302 reindirizza all'URL originale
- HTTP 404 se il codice non è trovato o è scaduto

## WebSocket

### Connessione
Connettersi a `/ws` con token JWT come parametro nella query:
```
ws://localhost:8080/ws?token=<jwt_token>
```

### Aggiornamenti in Tempo Reale
Iscriversi a `/topic/url/{shortCode}` per ricevere aggiornamenti live sulle visite:

**Formato del messaggio:**
```json
{
  "shortCode": "custom123",
  "visitCount": 6,
  "lastVisit": {
    "visitDate": "2024-01-15T15:45:00",
    "ipAddress": "192.168.1.101",
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
  }
}
```

## Risposte di Errore

**400 Bad Request:**
```json
{
  "error": "Il codice breve esiste già"
}
```

**401 Non Autorizzato:**
```json
{
  "error": "Accesso negato"
}
```

**404 Non Trovato:**
```json
{
  "error": "URL non trovato"
}
```


# Documentazione API e Showcase Frontend

## Panoramica
Un semplice servizio di accorciamento URL con gestione utenti, tracciamento dei link e aggiornamenti in tempo reale tramite WebSocket.

Home page della dashboard:
![image](https://github.com/user-attachments/assets/0070183f-a9ad-4b52-87de-f9a855349d24)

Dettaglio di un link:
![image](https://github.com/user-attachments/assets/9f73fe21-cb6a-4c03-a2f2-18412adcbe0a)


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

#### POST /api/change-password
Cambia la password dell'utente già autenticato.

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Corpo della richiesta:**
```json
{
  "oldPassword": "nonsecure",
  "newPassword": "password123"
}
```

**Risposta:**
```json
{
  "message": "Password cambiata con successo"
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

#### PUT /api/urls/{shortCode}
Aggiorna un URL accorciato (richiede autenticazione).    

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Corpo della richiesta:**
```json
{
  "originalUrl": "https://example.com/very/long/url",
  "expirationDate": "2024-12-31T23:59:59"
}
```

**Note:**
- `shortCode` non può essere modificato
- i due valori vengono rispettivamente aggiornati solo se forniti

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
#### DELETE /api/urls/{shortCode}
Elimina un URL accorciato (richiede autenticazione).
**Header:**
```
Authorization: Bearer <jwt_token>
```
**Risposta:**
```json
{
  "message": "URL eliminato con successo"
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
Ottieni statistiche dettagliate dell'ultima settimana per uno specifico URL (richiede autenticazione e proprietà).

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

#### POST /api/urls/{shortCode}/stats/range
Ottieni statistiche dettagliate per uno specifico URL e in uno specifico lasso di tempo (richiede autenticazione e proprietà).

**Note:**
- è stata scelta una richiesta di tipo POST per inserire il range come body JSON

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Corpo della richiesta:**
```json
{
  "startDate": "2023-12-31T23:59:59",
  "endDate": "2024-12-31T23:59:59"
}
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

#### POST /api/urls/accountstats
Ottieni statistiche relativi a tutti gli URL dell'account autenticato in uno specifico lasso di tempo (richiede autenticazione).

**Note:**
- è stata scelta una richiesta di tipo POST per inserire il range come body JSON


**Header:**
```
Authorization: Bearer <jwt_token>
```

**Corpo della richiesta:**
```json
{
  "startDate": "2023-12-31T23:59:59",
  "endDate": "2024-12-31T23:59:59"
}
```

**Risposta:**
```json
{
  "visitCount": 5,
  "visitDetailedCounter": {
    "abc123": 3,
    "xyz789": 2
  },
  "visits": [
    {
      "id": 1,
      "shortCode": "abc123",
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

## Documentazione per `GlobalExceptionHandler`

Il file `GlobalExceptionHandler` gestisce le eccezioni globali dell'applicazione, fornendo risposte JSON standardizzate per ogni tipo di errore. 

### Formato Standard della Risposta JSON

Ogni risposta di errore segue il seguente formato JSON:

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Descrizione dell'errore",
  "path": "/api/urls"
}
```

#### Campi:
- **timestamp**: Data e ora in cui si è verificato l'errore.
- **status**: Codice di stato HTTP associato all'errore.
- **error**: Descrizione dello stato HTTP.
- **message**: Messaggio dettagliato dell'errore.
- **path**: Percorso dell'endpoint che ha generato l'errore.

---

### Variazioni del Formato JSON

#### 1. **Token JWT Invalido**
Quando un token JWT è invalido, scaduto o malformato, viene restituito un errore con stato `401 Unauthorized`.

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Token JWT non valido",
  "path": "/api/urls"
}
```

#### 2. **Accesso Negato**
Quando un utente tenta di accedere a una risorsa senza le autorizzazioni necessarie, viene restituito un errore con stato `403 Forbidden`.

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Accesso negato",
  "path": "/api/urls"
}
```

#### 3. **Errore Generico**
Per tutte le altre eccezioni non gestite specificamente, viene restituito un errore con stato `500 Internal Server Error`.

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Errore interno del server",
  "path": "/api/urls"
}
```

---

### Note
- Il formato della risposta è progettato per essere leggibile e facilmente interpretabile dai client.
- Ogni tipo di errore è associato a un codice di stato HTTP appropriato.
- Gli errori di validazione includono dettagli specifici per ogni campo non valido.
### Possibili miglioramenti
- Implementare rate limiting per prevenire abusi del servizio.
- Utilizzare i DTO anche per le risposte degli endpoint per garantire coerenza.
- Effettuare migliori validazioni sui DTO lato backend.
- Implementare ReCaptcha per prevenire spam nei form di registrazione e login.
- Rendere la grafica del frontend più responsive e user-friendly.

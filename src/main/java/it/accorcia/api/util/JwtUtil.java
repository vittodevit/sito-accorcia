package it.accorcia.api.util;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import it.accorcia.api.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;

/**
 * Utility class per la gestione dei token JWT (JSON Web Token).
 * Fornisce metodi per generare, validare e analizzare token JWT utilizzati per l'autenticazione.
 */
@Component
public class JwtUtil {

    /**
     * La chiave segreta utilizzata per firmare i token JWT.
     * Viene caricata dalle proprietà di configurazione dell'applicazione.
     */
    @Value("${jwt.secret}")
    private String secret;

    /**
     * Il tempo di validità del token in millisecondi.
     * Viene caricato dalle proprietà di configurazione dell'applicazione.
     */
    @Value("${jwt.expiration}")
    private Long expiration;

    /**
     * Genera una chiave crittografica basata sulla chiave segreta configurata.
     * @return la chiave crittografica per la firma e verifica dei token
     */
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    /**
     * Genera un token JWT per l'utente specificato.
     * Il token contiene il nome utente, l'ID e l'email dell'utente, oltre alla data di emissione e scadenza.
     *
     * @param user l'utente per cui generare il token
     * @return il token JWT generato
     */
    public String generateToken(User user) {
        return Jwts.builder()
            .subject(user.getUsername())
            .issuedAt(new Date())
            .claim("id", user.getId())
            .claim("email", user.getEmail())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(key(), SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Estrae il nome utente da un token JWT.
     *
     * @param token il token JWT da cui estrarre il nome utente
     * @return il nome utente contenuto nel token
     */
    public String getUsernameFromToken(String token) {
        return Jwts.parser().verifyWith((SecretKey) key()).build().parseClaimsJws(token).getBody().getSubject();
    }

    /**
     * Verifica la validità di un token JWT.
     * Controlla che il token sia ben formato, non scaduto e firmato con la chiave corretta.
     *
     * @param token il token JWT da validare
     * @return true se il token è valido, false altrimenti
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith((SecretKey) key()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

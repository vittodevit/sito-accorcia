package it.accorcia.api.util;

import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.naming.AuthenticationException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Gestore globale delle eccezioni per l'applicazione.
 * Intercetta le eccezioni lanciate dai controller e fornisce risposte di errore coerenti.
 * Questo handler centralizza la gestione degli errori, migliorando la manutenibilità del codice
 * e garantendo un formato di risposta uniforme per tutti gli errori.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Gestisce le eccezioni di tipo RuntimeException.
     * Queste eccezioni sono comunemente lanciate quando una risorsa non viene trovata
     * o quando si verificano errori di validazione.
     *
     * @param ex l'eccezione catturata
     * @param request la richiesta web che ha generato l'eccezione
     * @return una risposta con stato 400 Bad Request e dettagli sull'errore
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeException(RuntimeException ex, WebRequest request) {
        return createErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
    }

    /**
     * Gestisce le eccezioni relative ai token JWT.
     * Queste eccezioni si verificano quando un token JWT è invalido, scaduto o malformato.
     *
     * @param ex l'eccezione catturata
     * @param request la richiesta web che ha generato l'eccezione
     * @return una risposta con stato 401 Unauthorized e dettagli sull'errore
     */
    @ExceptionHandler(JwtException.class)
    public ResponseEntity<Object> handleJwtException(JwtException ex, WebRequest request) {
        return createErrorResponse(ex, HttpStatus.UNAUTHORIZED, request);
    }

    /**
     * Gestisce le eccezioni di accesso negato.
     * Queste eccezioni si verificano quando un utente tenta di accedere a una risorsa
     * per la quale non dispone delle autorizzazioni necessarie.
     *
     * @param ex l'eccezione di accesso negato catturata
     * @param request la richiesta web che ha generato l'eccezione
     * @return una risposta con stato 403 Forbidden e dettagli sull'errore
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        return createErrorResponse(ex, HttpStatus.FORBIDDEN, request);
    }

    /**
     * Gestisce tutte le altre eccezioni non gestite specificamente.
     * Fornisce un meccanismo di fallback per catturare qualsiasi eccezione imprevista.
     *
     * @param ex l'eccezione catturata
     * @param request la richiesta web che ha generato l'eccezione
     * @return una risposta con stato 500 Internal Server Error e dettagli sull'errore
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(Exception ex, WebRequest request) {
        return createErrorResponse(ex, HttpStatus.INTERNAL_SERVER_ERROR, request);
    }


    /**
     * Gestisce le eccezioni di autenticazione.
     * Questa eccezione si verifica quando un utente non riesce ad autenticarsi correttamente.
     *
     * @param ex l'eccezione di autenticazione catturata
     * @param request la richiesta web che ha generato l'eccezione
     * @return una risposta con stato 401 Unauthorized e dettagli sull'errore
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        return createErrorResponse(ex, HttpStatus.UNAUTHORIZED, request);
    }

    /**
     * Crea una risposta di errore standardizzata.
     * Include timestamp, stato HTTP, messaggio di errore e percorso della richiesta.
     *
     * @param ex l'eccezione catturata
     * @param status lo stato HTTP da restituire
     * @param request la richiesta web che ha generato l'eccezione
     * @return una risposta con lo stato specificato e dettagli sull'errore
     */
    private ResponseEntity<Object> createErrorResponse(Exception ex, HttpStatus status, WebRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", ex.getMessage());
        body.put("path", request.getDescription(false).replace("uri=", ""));

        return new ResponseEntity<>(body, status);
    }
}

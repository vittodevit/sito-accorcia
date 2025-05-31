package it.accorcia.api.util;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Interceptor per la gestione dell'autenticazione JWT durante l'handshake delle connessioni WebSocket.
 * Verifica la validità del token JWT fornito nella richiesta di connessione WebSocket.
 */
public class JwtHandshakeInterceptor implements HandshakeInterceptor {
    /**
     * Utilità per la gestione dei token JWT.
     */
    private final JwtUtil jwtUtil;

    /**
     * Costruttore che inizializza l'interceptor con l'utilità JWT necessaria.
     *
     * @param jwtUtil l'utilità per la gestione dei token JWT
     */
    public JwtHandshakeInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Metodo eseguito prima dell'handshake WebSocket.
     * Estrae e valida il token JWT dalla query della richiesta e, se valido,
     * aggiunge il nome utente agli attributi della sessione WebSocket.
     *
     * @param request la richiesta HTTP del client
     * @param response la risposta HTTP del server
     * @param wsHandler il gestore WebSocket
     * @param attributes gli attributi della sessione WebSocket
     * @return true se l'handshake può procedere, false altrimenti
     */
    @Override
    public boolean beforeHandshake(
        ServerHttpRequest request,
        ServerHttpResponse response,
        WebSocketHandler wsHandler,
        Map<String, Object> attributes
    ) {
        String token = extractTokenFromQuery(request);
        if (token != null && jwtUtil.validateToken(token)) {
            String username = jwtUtil.getUsernameFromToken(token);
            attributes.put("username", username);
            return true;
        }
        return false;
    }

    /**
     * Metodo eseguito dopo l'handshake WebSocket.
     * In questa implementazione non è necessario quindi non esegue alcuna operazione.
     */
    @Override
    public void afterHandshake(
        ServerHttpRequest request,
        ServerHttpResponse response,
        WebSocketHandler wsHandler,
        Exception exception
    ) {}

    /**
     * Estrae il token JWT dalla query della richiesta HTTP.
     *
     * @param request la richiesta HTTP da cui estrarre il token
     * @return il token JWT estratto o null se non presente
     */
    private String extractTokenFromQuery(ServerHttpRequest request) {
        String query = request.getURI().getQuery();
        if (query != null && query.contains("token=")) {
            return query.substring(query.indexOf("token=") + 6);
        }
        return null;
    }
}

package it.accorcia.api.util;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filtro di autenticazione JWT che intercetta le richieste HTTP per verificare e validare i token JWT.
 * Estende OncePerRequestFilter per garantire che il filtro venga eseguito una sola volta per richiesta.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /**
     * Utilità per la gestione dei token JWT.
     */
    private final JwtUtil jwtUtil;

    /**
     * Costruttore
     *
     * @param jwtUtil utility class per la gestione dei token JWT
     */
    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Metodo principale del filtro che processa ogni richiesta HTTP.
     * Estrae il token JWT dall'header Authorization, lo valida e imposta l'autenticazione nel contesto di sicurezza.
     *
     * @param request la richiesta HTTP in entrata
     * @param response la risposta HTTP in uscita
     * @param chain la catena di filtri da eseguire
     * @throws ServletException in caso di errori durante l'elaborazione della richiesta
     * @throws IOException in caso di errori di I/O
     */
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain chain
    ) throws ServletException, IOException {
        String token = extractToken(request);

        if (token != null && jwtUtil.validateToken(token)) {
            String username = jwtUtil.getUsernameFromToken(token);
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        chain.doFilter(request, response);
    }

    /**
     * Estrae il token JWT dall'header Authorization della richiesta HTTP.
     *
     * @param request la richiesta HTTP da cui estrarre il token
     * @return il token JWT estratto o null se non presente o non valido
     */
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}

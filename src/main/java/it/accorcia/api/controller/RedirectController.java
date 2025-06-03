package it.accorcia.api.controller;

import it.accorcia.api.model.ShortenedUrl;
import it.accorcia.api.model.UrlVisit;
import it.accorcia.api.repository.ShortenedUrlRepository;
import it.accorcia.api.repository.UrlVisitRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Map;

/**
 * Controller che gestisce il reindirizzamento dagli URL accorciati agli URL originali.
 * Si occupa anche di tracciare le visite e inviare aggiornamenti in tempo reale tramite WebSocket.
 */
@RestController
public class RedirectController {

    @Autowired
    private ShortenedUrlRepository urlRepository;

    @Autowired
    private UrlVisitRepository visitRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(
        @PathVariable
        String shortCode,
        HttpServletRequest request
    ) {
        ShortenedUrl url = urlRepository.findByShortCode(shortCode)
            .orElse(null);

        // controlla se l'URL esiste e non è scaduto
        if (url == null || url.isExpired()) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("/404"));
            // found perchè il 404 viene gestito da un template (vedi HomeController)
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }

        // traccia la visita all'URL
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        UrlVisit visit = UrlVisit.builder()
            .visitDate(java.time.LocalDateTime.now())
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .url(url)
            .build();

        visitRepository.save(visit);

        // manda aggiornamento in tempo reale tramite WebSocket su topic
        messagingTemplate.convertAndSend("/topic/url/" + shortCode, Map.of(
            "shortCode", shortCode,
            "visitCount", url.getVisitCount() + 1,
            "lastVisit", Map.of(
                "visitDate", visit.getVisitDate(),
                "ipAddress", visit.getIpAddress(),
                "userAgent", visit.getUserAgent()
            )
        ));

        // reindirizza al link originale
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(url.getOriginalUrl()));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    /**
     * Estrae l'indirizzo IP del client dalla richiesta HTTP.
     * Gestisce il caso in cui l'applicazione sia dietro un proxy o un bilanciatore di carico.
     *
     * @param request La richiesta HTTP
     * @return L'indirizzo IP del client
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For"); // rev proxy
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

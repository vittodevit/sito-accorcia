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

        if (url == null || url.isExpired()) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create("/404"));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }

        // Track visit
        String ipAddress = getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");

        UrlVisit visit = UrlVisit.builder()
            .visitDate(java.time.LocalDateTime.now())
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .url(url)
            .build();

        visitRepository.save(visit);

        // Send real-time update
        messagingTemplate.convertAndSend("/topic/url/" + shortCode, Map.of(
            "shortCode", shortCode,
            "visitCount", url.getVisitCount() + 1,
            "lastVisit", Map.of(
                "visitDate", visit.getVisitDate(),
                "ipAddress", visit.getIpAddress(),
                "userAgent", visit.getUserAgent()
            )
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(url.getOriginalUrl()));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

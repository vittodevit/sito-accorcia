package it.accorcia.api.controller;

import it.accorcia.api.dto.CreateUrlRequest;
import it.accorcia.api.model.ShortenedUrl;
import it.accorcia.api.model.UrlVisit;
import it.accorcia.api.model.User;
import it.accorcia.api.repository.ShortenedUrlRepository;
import it.accorcia.api.repository.UrlVisitRepository;
import it.accorcia.api.repository.UserRepository;
import it.accorcia.api.util.RandomStringGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/urls")
public class UrlController {

    @Value("${deployment.url}")
    private String deploymentUrl;

    @Autowired
    private ShortenedUrlRepository urlRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UrlVisitRepository visitRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<?> createShortUrl(
        @RequestBody CreateUrlRequest request,
        Authentication auth
    ) {
        User user = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String shortCode = request.getShortCode();
        if (shortCode == null || shortCode.isEmpty()) {
            shortCode = RandomStringGenerator.generateRandomString(6);
        }

        if (urlRepository.existsByShortCode(shortCode)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Short code already exists"));
        }

        ShortenedUrl url = ShortenedUrl.builder()
            .originalUrl(request.getOriginalUrl())
            .shortCode(shortCode)
            .user(user)
            .createdAt(java.time.LocalDateTime.now())
            .visits(new ArrayList<>())
            .build();

        try{
            url.setExpirationDate(request.getExpirationDate());
        }catch (Exception ignored){}

        url = urlRepository.save(url);
        return ResponseEntity.ok(createUrlResponse(url));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getUserUrls(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<ShortenedUrl> urls = urlRepository.findByUser(user);
        List<Map<String, Object>> response = urls.stream()
            .map(this::createUrlResponse)
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{shortCode}/stats")
    public ResponseEntity<?> getUrlStats(@PathVariable String shortCode, Authentication auth) {
        ShortenedUrl url = urlRepository.findByShortCode(shortCode)
            .orElseThrow(() -> new RuntimeException("URL not found"));

        if (!url.getUser().getUsername().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied"));
        }

        List<UrlVisit> visits = visitRepository.findByUrlOrderByVisitDateDesc(url);

        return ResponseEntity.ok(Map.of(
            "shortCode", shortCode,
            "visitCount", visits.size(),
            "visits", visits.stream().map(visit -> Map.of(
                "id", visit.getId(),
                "visitDate", visit.getVisitDate(),
                "ipAddress", visit.getIpAddress(),
                "userAgent", visit.getUserAgent()
            )).collect(Collectors.toList())
        ));
    }

    private Map<String, Object> createUrlResponse(ShortenedUrl url) {
        return Map.of(
            "id", url.getId(),
            "originalUrl", url.getOriginalUrl(),
            "shortCode", url.getShortCode(),
            "shortUrl", deploymentUrl + "/" + url.getShortCode(),
            "createdAt", url.getCreatedAt(),
            "expirationDate", url.getExpirationDate() != null ? url.getExpirationDate().toString() : "never",
            "visitCount", url.getVisitCount()
        );
    }
}

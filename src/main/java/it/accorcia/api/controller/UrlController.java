package it.accorcia.api.controller;

import it.accorcia.api.dto.CreateUrlRequest;
import it.accorcia.api.dto.DateRangeRequest;
import it.accorcia.api.dto.EditUrlRequest;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller che gestisce tutte le operazioni relative agli URL accorciati.
 * Fornisce endpoint per la creazione, modifica, eliminazione e visualizzazione degli URL,
 * nonché per la visualizzazione delle statistiche di visita.
 * Tutti gli endpoint richiedono l'autenticazione dell'utente.
 */
@RestController
@RequestMapping("/api/urls")
public class UrlController {

    /**
     * URL di base del deployment dell'applicazione, usato per costruire gli URL completi.
     */
    @Value("${deployment.url}")
    private String deploymentUrl;

    /**
     * Repository per l'accesso e la gestione degli URL accorciati.
     */
    @Autowired
    private ShortenedUrlRepository urlRepository;

    /**
     * Repository per l'accesso e la gestione degli utenti.
     */
    @Autowired
    private UserRepository userRepository;

    /**
     * Repository per l'accesso e la gestione delle visite agli URL.
     */
    @Autowired
    private UrlVisitRepository visitRepository;

    /**
     * Crea un nuovo URL accorciato.
     * Se non viene specificato un codice breve personalizzato, ne viene generato uno casuale.
     *
     * @param request la richiesta contenente l'URL originale, il codice breve opzionale e la data di scadenza opzionale
     * @param auth l'oggetto di autenticazione dell'utente corrente
     * @return una risposta contenente i dettagli dell'URL accorciato creato
     */
    @PostMapping
    public ResponseEntity<?> createShortUrl(
        @RequestBody
        CreateUrlRequest request,
        Authentication auth
    ) {
        User user = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        String shortCode = request.getShortCode();
        if (shortCode == null || shortCode.isEmpty()) {
            shortCode = RandomStringGenerator.generateRandomString(6);
        }

        if (urlRepository.existsByShortCode(shortCode)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Short code già esistente"));
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

    /**
     * Modifica un URL accorciato esistente.
     * L'utente può modificare solo gli URL che ha creato.
     *
     * @param shortCode il codice breve dell'URL da modificare
     * @param request la richiesta contenente i nuovi valori per l'URL originale e la data di scadenza
     * @param auth l'oggetto di autenticazione dell'utente corrente
     * @return una risposta contenente i dettagli dell'URL accorciato modificato
     */
    @PutMapping("/{shortCode}")
    public ResponseEntity<?> editShortUrl(
        @PathVariable
        String shortCode,
        @RequestBody
        EditUrlRequest request,
        Authentication auth
    ) {
        ShortenedUrl url = urlRepository.findByShortCode(shortCode)
            .orElseThrow(() -> new RuntimeException("URL non trovato"));

        if (!url.getUser().getUsername().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accesso vietato"));
        }

        url.setOriginalUrl(request.getOriginalUrl());
        url.setExpirationDate(request.getExpirationDate());

        url = urlRepository.save(url);
        return ResponseEntity.ok(createUrlResponse(url));
    }

    /**
     * Ottiene tutti gli URL accorciati creati dall'utente autenticato.
     *
     * @param auth l'oggetto di autenticazione dell'utente corrente
     * @return una lista di tutti gli URL accorciati dell'utente con i relativi dettagli
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getUserUrls(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
            .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        List<ShortenedUrl> urls = urlRepository.findByUser(user);
        List<Map<String, Object>> response = urls.stream()
            .map(this::createUrlResponse)
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * Ottiene le statistiche di visita dell'ultima settimana per un URL accorciato specifico.
     * L'utente può visualizzare solo le statistiche degli URL che ha creato.
     *
     * @param shortCode il codice breve dell'URL di cui ottenere le statistiche
     * @param auth l'oggetto di autenticazione dell'utente corrente
     * @return le statistiche di visita dell'URL nell'ultima settimana
     */
    @GetMapping("/{shortCode}/stats")
    public ResponseEntity<?> getUrlStats(
      @PathVariable
      String shortCode,
      Authentication auth
    ) {
        ShortenedUrl url = urlRepository.findByShortCode(shortCode)
            .orElseThrow(() -> new RuntimeException("URL non trovato"));

        if (!url.getUser().getUsername().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accesso vietato"));
        }

        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        LocalDateTime endDate = LocalDateTime.now();

        List<UrlVisit> visits = visitRepository.findByUrlAndVisitDateBetween(
            url,
            startDate,
            endDate
        );

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

    /**
     * Ottiene le statistiche di visita per un URL accorciato specifico in un intervallo di date personalizzato.
     * L'utente può visualizzare solo le statistiche degli URL che ha creato.
     *
     * @param shortCode il codice breve dell'URL di cui ottenere le statistiche
     * @param dateRangeRequest la richiesta contenente l'intervallo di date per cui ottenere le statistiche
     * @param auth l'oggetto di autenticazione dell'utente corrente
     * @return le statistiche di visita dell'URL nell'intervallo di date specificato
     */
    @PostMapping("/{shortCode}/stats/range")
    public ResponseEntity<?> getUrlStatsWithRange(
      @PathVariable
      String shortCode,
      @RequestBody
      DateRangeRequest dateRangeRequest,
      Authentication auth
    ) {
      ShortenedUrl url = urlRepository.findByShortCode(shortCode)
        .orElseThrow(() -> new RuntimeException("URL non trovato"));

      if (!url.getUser().getUsername().equals(auth.getName())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accesso vietato"));
      }

      List<UrlVisit> visits = visitRepository.findByUrlAndVisitDateBetween(
        url,
        dateRangeRequest.getStartDate(),
        dateRangeRequest.getEndDate()
      );

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

    /**
     * Elimina un URL accorciato esistente.
     * L'utente può eliminare solo gli URL che ha creato.
     *
     * @param shortCode il codice breve dell'URL da eliminare
     * @param auth l'oggetto di autenticazione dell'utente corrente
     * @return un messaggio di conferma dell'eliminazione
     */
    @DeleteMapping("/{shortCode}")
    public ResponseEntity<?> deleteShortUrl(
        @PathVariable
        String shortCode,
        Authentication auth
    ) {
        ShortenedUrl url = urlRepository.findByShortCode(shortCode)
            .orElseThrow(() -> new RuntimeException("URL non trovato"));

        if (!url.getUser().getUsername().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accesso vietato"));
        }

        urlRepository.delete(url);
        return ResponseEntity.ok(Map.of("message", "URL eliminato con successo"));
    }

    /**
     * Ottiene le statistiche di visita per tutti gli URL dell'utente autenticato in un intervallo di date specificato.
     *
     * @param dateRangeRequest la richiesta contenente l'intervallo di date per cui ottenere le statistiche
     * @param auth l'oggetto di autenticazione dell'utente corrente
     * @return le statistiche di visita di tutti gli URL dell'utente nell'intervallo di date specificato
     */
    @PostMapping("/accountstats")
    public ResponseEntity<?> getAccountStatsWithRange(
      @RequestBody
      DateRangeRequest dateRangeRequest,
      Authentication auth
    ) {
      User user = userRepository.findByUsername(auth.getName())
        .orElseThrow(() -> new RuntimeException("Utente non trovato"));

      List<UrlVisit> visits = visitRepository.findByUrlUserAndVisitDateBetweenOrderByVisitDateDesc(
        user,
        dateRangeRequest.getStartDate(),
        dateRangeRequest.getEndDate()
      );

      List<Map<String, Object>> visitDetailedCounter = visitRepository.countVisitsByUserAndDateRange(
          user,
          dateRangeRequest.getStartDate(),
          dateRangeRequest.getEndDate()
      );

      return ResponseEntity.ok(Map.of(
        "visitCount", visits.size(),
          "visitDetailedCounter", visitDetailedCounter.stream().collect(Collectors.toMap(
              map -> (String) map.get("shortCode"),
              map -> (Long) map.get("visitCount")
          )),
        "visits", visits.stream().map(visit -> Map.of(
          "id", visit.getId(),
          "shortCode", visit.getUrl().getShortCode(),
          "visitDate", visit.getVisitDate(),
          "ipAddress", visit.getIpAddress(),
          "userAgent", visit.getUserAgent()
        )).collect(Collectors.toList())
      ));
    }

    /**
     * Crea una mappa di risposta con i dettagli di un URL accorciato.
     *
     * @param url l'entità ShortenedUrl da convertire in risposta
     * @return una mappa contenente i dettagli dell'URL accorciato
     */
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

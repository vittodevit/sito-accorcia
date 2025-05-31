package it.accorcia.api.repository;

import it.accorcia.api.model.ShortenedUrl;
import it.accorcia.api.model.UrlVisit;
import it.accorcia.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository per l'accesso e la gestione delle entità UrlVisit nel database.
 * Fornisce metodi per cercare le visite agli URL in base a vari criteri come utente e intervallo di date.
 */
@Repository
public interface UrlVisitRepository extends JpaRepository<UrlVisit, Long> {
    /**
     * Ottiene tutte le visite per gli URL appartenenti all'utente specificato in un intervallo di date.
     * I risultati sono ordinati in ordine decrescente per data di visita (dalle più recenti alle meno recenti).
     *
     * @param urlUser l'utente proprietario degli URL
     * @param startDate la data di inizio dell'intervallo
     * @param endDate la data di fine dell'intervallo
     * @return una lista di visite che soddisfano i criteri specificati
     */
    List<UrlVisit> findByUrlUserAndVisitDateBetweenOrderByVisitDateDesc(
      User urlUser,
      LocalDateTime startDate,
      LocalDateTime endDate
    );

    /**
     * Ottiene tutte le visite per un URL specifico in un intervallo di date specificato.
     *
     * @param url l'URL accorciato di cui ottenere le visite
     * @param startDate la data di inizio dell'intervallo
     * @param endDate la data di fine dell'intervallo
     * @return una lista di visite che soddisfano i criteri specificati
     */
    List<UrlVisit> findByUrlAndVisitDateBetween(
      ShortenedUrl url,
      LocalDateTime startDate,
      LocalDateTime endDate
    );
}

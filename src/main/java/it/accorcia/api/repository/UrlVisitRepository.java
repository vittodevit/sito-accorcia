package it.accorcia.api.repository;

import it.accorcia.api.model.ShortenedUrl;
import it.accorcia.api.model.UrlVisit;
import it.accorcia.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    /**
     * Conta il numero di visite per ogni shortlink appartenente a un utente specifico
     * in un intervallo di date specificato.
     *
     * @param urlUser l'utente proprietario degli URL
     * @param startDate la data di inizio dell'intervallo
     * @param endDate la data di fine dell'intervallo
     * @return una lista di oggetti contenenti il codice breve e il conteggio delle visite
     */
    @Query("SELECT uv.url.shortCode AS shortCode, COUNT(uv) AS visitCount " +
        "FROM UrlVisit uv " +
        "WHERE uv.url.user = :urlUser " +
        "AND uv.visitDate BETWEEN :startDate AND :endDate " +
        "GROUP BY uv.url.shortCode")
    List<Map<String, Object>> countVisitsByUserAndDateRange(
        @Param("urlUser") User urlUser,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}

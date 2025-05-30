package it.accorcia.api.repository;

import it.accorcia.api.model.ShortenedUrl;
import it.accorcia.api.model.UrlVisit;
import it.accorcia.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UrlVisitRepository extends JpaRepository<UrlVisit, Long> {
    List<UrlVisit> findByUrlOrderByVisitDateDesc(ShortenedUrl url);

    /*
    Ottiene tutte le visite per:
      - URL appartenenti all'utente specificato
      - In un intervallo di date specificato
     */
    List<UrlVisit> findByUrlUserAndVisitDateBetweenOrderByVisitDateDesc(
      User urlUser,
      LocalDateTime startDate,
      LocalDateTime endDate
    );

    /*
    Ottiene tutte le visite per un URL specifico in un intervallo di date specificato
     */
    List<UrlVisit> findByUrlAndVisitDateBetween(
      ShortenedUrl url,
      LocalDateTime startDate,
      LocalDateTime endDate
    );
}

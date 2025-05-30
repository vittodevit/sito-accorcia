package it.accorcia.api.repository;

import it.accorcia.api.model.ShortenedUrl;
import it.accorcia.api.model.UrlVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UrlVisitRepository extends JpaRepository<UrlVisit, Long> {
    List<UrlVisit> findByUrlOrderByVisitDateDesc(ShortenedUrl url);
}

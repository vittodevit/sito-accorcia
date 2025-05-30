package it.accorcia.api.repository;

import it.accorcia.api.model.ShortenedUrl;
import it.accorcia.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShortenedUrlRepository extends JpaRepository<ShortenedUrl, Long> {
    Optional<ShortenedUrl> findByShortCode(String shortCode);
    List<ShortenedUrl> findByUser(User user);
    boolean existsByShortCode(String shortCode);
}
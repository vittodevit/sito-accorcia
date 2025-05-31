package it.accorcia.api.repository;

import it.accorcia.api.model.ShortenedUrl;
import it.accorcia.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository per l'accesso e la gestione delle entità ShortenedUrl nel database.
 * Fornisce metodi per cercare, salvare e verificare l'esistenza di URL accorciati.
 */
@Repository
public interface ShortenedUrlRepository extends JpaRepository<ShortenedUrl, Long> {
    /**
     * Trova un URL accorciato tramite il suo codice breve.
     *
     * @param shortCode il codice breve da cercare
     * @return un Optional contenente l'URL accorciato se trovato, altrimenti vuoto
     */
    Optional<ShortenedUrl> findByShortCode(String shortCode);

    /**
     * Trova tutti gli URL accorciati creati da un determinato utente.
     *
     * @param user l'utente di cui cercare gli URL
     * @return una lista di URL accorciati appartenenti all'utente
     */
    List<ShortenedUrl> findByUser(User user);

    /**
     * Verifica se esiste già un URL accorciato con il codice breve specificato.
     *
     * @param shortCode il codice breve da verificare
     * @return true se esiste già un URL con quel codice, false altrimenti
     */
    boolean existsByShortCode(String shortCode);
}

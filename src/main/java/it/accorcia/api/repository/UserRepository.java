package it.accorcia.api.repository;

import it.accorcia.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository per l'accesso e la gestione delle entità User nel database.
 * Fornisce metodi per cercare, salvare e verificare l'esistenza di utenti.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Trova un utente tramite il suo nome utente.
     *
     * @param username il nome utente da cercare
     * @return un Optional contenente l'utente se trovato, altrimenti vuoto
     */
    Optional<User> findByUsername(String username);

    /**
     * Verifica se esiste già un utente con il nome utente specificato.
     *
     * @param username il nome utente da verificare
     * @return true se esiste già un utente con quel nome utente, false altrimenti
     */
    boolean existsByUsername(String username);

    /**
     * Verifica se esiste già un utente con l'email specificata.
     *
     * @param email l'email da verificare
     * @return true se esiste già un utente con quell'email, false altrimenti
     */
    boolean existsByEmail(String email);
}

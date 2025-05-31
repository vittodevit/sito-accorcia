package it.accorcia.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Classe che rappresenta un utente del sistema.
 * Questa entità memorizza le informazioni dell'utente come username, email, password
 * e la lista degli URL accorciati creati dall'utente.
 */
@Entity
@Table(name = "user_info")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    /**
     * Identificatore univoco dell'utente.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nome utente univoco per l'accesso al sistema.
     */
    @Column(unique = true, nullable = false)
    private String username;

    /**
     * Indirizzo email univoco dell'utente.
     */
    @Column(unique = true, nullable = false)
    private String email;

    /**
     * Password dell'utente (memorizzata in forma criptata).
     */
    @Column(nullable = false)
    private String password;

    /**
     * Lista degli URL accorciati creati dall'utente.
     */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<ShortenedUrl> urls = new ArrayList<>();
}

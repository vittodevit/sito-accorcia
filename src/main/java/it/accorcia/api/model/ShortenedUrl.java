package it.accorcia.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Classe che rappresenta un URL accorciato nel sistema.
 * Questa entità memorizza l'URL originale, il codice breve generato,
 * le date di creazione e scadenza, l'utente proprietario e le visite ricevute.
 */
@Entity
@Table(name = "shortened_url")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShortenedUrl {
    /**
     * Identificatore univoco dell'URL accorciato.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * URL originale completo che è stato accorciato.
     */
    @Column(nullable = false)
    private String originalUrl;

    /**
     * Codice breve univoco che identifica l'URL accorciato.
     */
    @Column(unique = true, nullable = false)
    private String shortCode;

    /**
     * Data e ora di creazione dell'URL accorciato.
     */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Data e ora di scadenza dell'URL accorciato, se presente.
     * Se null, l'URL non ha scadenza.
     */
    private LocalDateTime expirationDate;

    /**
     * Utente proprietario dell'URL accorciato.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * Lista delle visite ricevute dall'URL accorciato.
     */
    @OneToMany(mappedBy = "url", cascade = CascadeType.ALL)
    private List<UrlVisit> visits = new ArrayList<>();

    /**
     * Verifica se l'URL accorciato è scaduto.
     *
     * @return true se l'URL è scaduto, false altrimenti o se non ha data di scadenza
     */
    public boolean isExpired() {
        return expirationDate != null && LocalDateTime.now().isAfter(expirationDate);
    }

    /**
     * Ottiene il numero totale di visite ricevute dall'URL accorciato.
     *
     * @return il numero di visite
     */
    public int getVisitCount() {
        return visits.size();
    }

}

package it.accorcia.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Classe che rappresenta una visita a un URL accorciato.
 * Questa entità memorizza informazioni sulla data della visita,
 * l'indirizzo IP del visitatore, lo user agent e l'URL accorciato visitato.
 */
@Entity
@Table(name = "url_visit")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlVisit {
    /**
     * Identificatore univoco della visita.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Data e ora in cui è avvenuta la visita.
     */
    @Column(nullable = false)
    private LocalDateTime visitDate;

    /**
     * Indirizzo IP del visitatore.
     */
    private String ipAddress;

    /**
     * User agent del browser o dispositivo del visitatore.
     */
    private String userAgent;

    /**
     * Riferimento all'URL accorciato che è stato visitato.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "url_id")
    private ShortenedUrl url;
}

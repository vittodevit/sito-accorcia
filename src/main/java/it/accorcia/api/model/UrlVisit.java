package it.accorcia.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "url_visit")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlVisit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime visitDate;

    private String ipAddress;
    private String userAgent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "url_id")
    private ShortenedUrl url;
}

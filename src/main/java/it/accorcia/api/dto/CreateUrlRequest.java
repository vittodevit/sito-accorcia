package it.accorcia.api.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Classe DTO (Data Transfer Object) che rappresenta una richiesta di creazione di un URL accorciato.
 * Contiene i dati necessari per creare un nuovo URL accorciato nel sistema.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateUrlRequest {
    /**
     * L'URL originale completo che deve essere accorciato.
     */
    private String originalUrl;

    /**
     * Il codice breve personalizzato richiesto dall'utente (opzionale).
     * Se non specificato, verrà generato automaticamente.
     */
    private String shortCode;

    /**
     * La data e ora di scadenza dell'URL accorciato (opzionale).
     * Se non specificata, l'URL non avrà scadenza.
     */
    private LocalDateTime expirationDate;
}

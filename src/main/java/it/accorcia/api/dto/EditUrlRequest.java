package it.accorcia.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Classe DTO (Data Transfer Object) che rappresenta una richiesta di modifica di un URL accorciato.
 * Contiene i dati che possono essere aggiornati per un URL accorciato esistente.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EditUrlRequest {
    /**
     * Il nuovo URL originale da associare all'URL accorciato.
     * Se omesso, l'URL originale non verrà modificato.
     */
    private String originalUrl;

    /**
     * La nuova data e ora di scadenza dell'URL accorciato (opzionale).
     * Se impostata a null, l'URL non avrà scadenza.
     * Se omessa, l'URL manterrà la scadenza attuale.
     */
    private LocalDateTime expirationDate;
}

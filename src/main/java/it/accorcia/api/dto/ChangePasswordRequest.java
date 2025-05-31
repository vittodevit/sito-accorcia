package it.accorcia.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Classe DTO (Data Transfer Object) che rappresenta una richiesta di cambio password.
 * Contiene i dati necessari per effettuare il cambio della password di un utente.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChangePasswordRequest {
    /**
     * La password attuale dell'utente, necessaria per verificare l'identità.
     */
    private String oldPassword;

    /**
     * La nuova password che l'utente desidera impostare.
     */
    private String newPassword;
}

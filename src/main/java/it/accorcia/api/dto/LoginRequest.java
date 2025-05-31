package it.accorcia.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Classe DTO (Data Transfer Object) che rappresenta una richiesta di login.
 * Contiene le credenziali necessarie per l'autenticazione di un utente.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    /**
     * Il nome utente utilizzato per l'autenticazione.
     */
    private String username;

    /**
     * La password utilizzata per l'autenticazione.
     */
    private String password;
}

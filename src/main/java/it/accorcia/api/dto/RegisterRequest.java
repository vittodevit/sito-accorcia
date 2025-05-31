package it.accorcia.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String username;
    private String email;
    private String password;

    // campo codice di invito per fermare registrazioni indesiderate su demo (accorcia.it)
    private String inviteCode;
}

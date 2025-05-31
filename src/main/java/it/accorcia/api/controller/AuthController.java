package it.accorcia.api.controller;

import it.accorcia.api.dto.ChangePasswordRequest;
import it.accorcia.api.dto.LoginRequest;
import it.accorcia.api.dto.RegisterRequest;
import it.accorcia.api.model.User;
import it.accorcia.api.repository.UserRepository;
import it.accorcia.api.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.naming.AuthenticationException;
import java.util.Map;

/**
 * Controller che gestisce l'autenticazione degli utenti.
 * Fornisce endpoint per la registrazione e il login degli utenti,
 * utilizzando JWT (JSON Web Token) per l'autenticazione.
 */
@RestController
@RequestMapping("/api")
public class AuthController {

    @Value("${deployment.invitecode}")
    private String inviteCode;

    /**
     * Repository per l'accesso ai dati degli utenti.
     */
    @Autowired
    private UserRepository userRepository;

    /**
     * Encoder per la codifica sicura delle password.
     */
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Utilità per la generazione e validazione dei token JWT.
     */
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Gestisce la registrazione di un nuovo utente.
     * Verifica che username ed email non siano già in uso,
     * codifica la password e salva il nuovo utente nel database.
     * -------
     * Controlla anche il codice di invito per limitare l'accesso alla registrazione.
     * (Una demo del progetto sarà hostata su un server pubblico)
     *
     * @param request Richiesta di registrazione contenente username, email e password
     * @return Risposta con esito della registrazione
     */
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(
        @RequestBody
        RegisterRequest request
    ) {

        if(!request.getInviteCode().equals(inviteCode)) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Codice di invito non valido"));
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Nome utente già esistente"));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Email già in uso"));
        }

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .build();
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Utente registrato con successo"));
    }

    /**
     * Gestisce il login di un utente esistente.
     * Verifica le credenziali dell'utente e, se valide,
     * genera un token JWT per l'autenticazione.
     *
     * @param request Richiesta di login contenente username e password
     * @return Risposta con token JWT in caso di successo
     * @throws AuthenticationException se l'utente non viene trovato
     */
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(
        @RequestBody
        LoginRequest request
    ) throws AuthenticationException {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new AuthenticationException("Credenziali non valide"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Credenziali non valide"));
        }

        String token = jwtUtil.generateToken(user);

        return ResponseEntity.ok(Map.of(
            "token", token,
            "type", "Bearer",
            "username", user.getUsername()
        ));
    }

    /**
     * Gestisce la richiesta di cambio password da parte dell'utente autenticato.
     * Verifica la vecchia password e aggiorna con la nuova password codificata.
     *
     * @param changePasswordRequest Richiesta contenente la vecchia e la nuova password
     * @param auth Autenticazione corrente dell'utente
     * @return Risposta con esito del cambio password
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
        @RequestBody
        ChangePasswordRequest changePasswordRequest,
        Authentication auth
    ) {
        User user = userRepository.findByUsername(auth.getPrincipal().toString())
            .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        if (!passwordEncoder.matches(
          changePasswordRequest.getOldPassword(),
          user.getPassword()
        )) {
            return ResponseEntity.badRequest().body(Map.of("error", "Vecchia password non valida"));
        }

        user.setPassword(passwordEncoder.encode(
          changePasswordRequest.getNewPassword()
        ));

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password cambiata con successo"));
    }
}

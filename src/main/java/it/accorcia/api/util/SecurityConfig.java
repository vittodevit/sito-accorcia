package it.accorcia.api.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configurazione di sicurezza dell'applicazione.
 * Definisce le regole di accesso alle risorse, i filtri di autenticazione e le impostazioni di sicurezza.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Utility class per la gestione dei token JWT.
     */
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * URL del dashboard di monitoraggio dell'applicazione per il pulsante "Dashboard".
     * Viene iniettato tramite la configurazione dell'applicazione.
     */
    @Value("${deployment.dashboard.url}")
    private String dashboardUrl;

    /**
     * Configura l'encoder per le password utilizzato nell'applicazione.
     * Hasha e verifica in automatico le password durante il salvataggio e verifica durante l'autenticazione.
     *
     * @return un'implementazione di PasswordEncoder che utilizza l'algoritmo BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configura la catena di filtri di sicurezza per l'applicazione.
     * Definisce quali URL sono accessibili pubblicamente e quali richiedono autenticazione,
     * disabilita la protezione CSRF e aggiunge il filtro di autenticazione JWT.
     * ----------------------------------------------------------------------------
     * Tutti gli url esplicitati in questo caso sono accessibili senza autenticazione!
     *
     * @param http il builder di configurazione della sicurezza HTTP
     * @return la catena di filtri di sicurezza configurata
     * @throws Exception se si verifica un errore durante la configurazione
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
            .cors(
            cors -> cors.configurationSource
                (
                    request ->
                    {
                        CorsConfiguration config = new CorsConfiguration();
                        config.addAllowedOrigin(dashboardUrl);
                        config.addAllowedHeader("*");
                        config.addAllowedMethod("*");
                        config.setAllowCredentials(true);
                        return config;
                    }
                )
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/**",
                    "/{shortCode}",
                    "/404",
                    "/500",
                    "/images/**",
                    "/webjars/**",
                    "/",
                    "/ws/**"
                ).permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtUtil),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}

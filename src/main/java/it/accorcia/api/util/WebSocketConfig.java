package it.accorcia.api.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configurazione WebSocket dell'applicazione.
 * Definisce gli endpoint WebSocket, i broker di messaggi e le impostazioni di sicurezza per le comunicazioni in tempo reale.
 */
@Configuration
@EnableWebSocket
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Utilità per la gestione dei token JWT, utilizzata per l'autenticazione delle connessioni WebSocket.
     */
    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Configura il broker di messaggi per la comunicazione WebSocket.
     * Definisce i prefissi per i canali di pubblicazione e sottoscrizione.
     *
     * @param config il registro di configurazione del broker di messaggi
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Registra gli endpoint STOMP per le connessioni WebSocket.
     * Configura l'endpoint principale, le origini consentite e aggiunge l'interceptor JWT per l'autenticazione.
     *
     * @param registry il registro degli endpoint STOMP
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .addInterceptors(new JwtHandshakeInterceptor(jwtUtil))
            .withSockJS();
    }
}

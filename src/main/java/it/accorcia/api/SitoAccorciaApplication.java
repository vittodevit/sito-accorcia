package it.accorcia.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principale dell'applicazione per l'accorciamento degli URL.
 * Questa classe avvia l'applicazione Spring Boot che fornisce servizi
 * per la creazione e gestione di URL accorciati.
 */
@SpringBootApplication
public class SitoAccorciaApplication {

    /**
     * Metodo principale che avvia l'applicazione Spring Boot.
     * 
     * @param args Argomenti della linea di comando
     */
    public static void main(String[] args) {
        SpringApplication.run(SitoAccorciaApplication.class, args);
    }

}

package it.accorcia.api.util;

import java.security.SecureRandom;

/**
 * Classe di utilità per la generazione di stringhe casuali.
 * Utilizzata principalmente per generare codici brevi casuali per gli URL accorciati.
 */
public class RandomStringGenerator {
    /**
     * Set di caratteri utilizzati per generare le stringhe casuali.
     * Include lettere maiuscole, minuscole e numeri.
     */
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    /**
     * Generatore di numeri casuali sicuro utilizzato per selezionare i caratteri.
     */
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Genera una stringa casuale della lunghezza specificata.
     *
     * @param length la lunghezza della stringa da generare
     * @return una stringa casuale composta da caratteri alfanumerici
     */
    public static String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int randomIndex = RANDOM.nextInt(CHARACTERS.length());
            sb.append(CHARACTERS.charAt(randomIndex));
        }
        return sb.toString();
    }
}

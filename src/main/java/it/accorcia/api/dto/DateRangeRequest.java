package it.accorcia.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Classe DTO (Data Transfer Object) che rappresenta una richiesta con un intervallo di date.
 * Utilizzata per specificare un periodo di tempo per cui ottenere statistiche o dati.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DateRangeRequest {
    /**
     * La data e ora di inizio dell'intervallo.
     */
    private LocalDateTime startDate;

    /**
     * La data e ora di fine dell'intervallo.
     */
    private LocalDateTime endDate;
}

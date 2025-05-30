package it.accorcia.api.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateUrlRequest {
    private String originalUrl;
    private String shortCode;
    private LocalDateTime expirationDate;
}
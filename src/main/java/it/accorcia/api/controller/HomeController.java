package it.accorcia.api.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller che gestisce le pagine principali dell'applicazione.
 * Si occupa di servire la pagina principale e le pagine di errore.
 */
@Controller
public class HomeController {

    /**
     * URL del dashboard di monitoraggio dell'applicazione per il pulsante "Dashboard".
     * Viene iniettato tramite la configurazione dell'applicazione.
     */
    @Value("${deployment.dashboard.url}")
    private String dashboardUrl;

    /**
     * Gestisce la richiesta per la pagina principale dell'applicazione.
     * 
     * @param model Il modello per passare dati alla vista
     * @return Il nome del template della homepage
     */
    @GetMapping("/")
    public String homepage(Model model) {
        model.addAttribute("dashUrl", dashboardUrl);
        return "homepage";
    }

    /**
     * Gestisce la richiesta per la pagina di errore 404 (Pagina non trovata).
     * 
     * @param model Il modello per passare dati alla vista
     * @return Il nome del template della pagina 404
     */
    @GetMapping("/404")
    public String notFoundPage(Model model, HttpServletResponse response) {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        model.addAttribute("dashUrl", dashboardUrl);
        return "404";
    }

    /**
     * Gestisce la richiesta per la pagina di errore 500 (Errore interno del server).
     * 
     * @param model Il modello per passare dati alla vista
     * @return Il nome del template della pagina 500
     */
    @GetMapping("/500")
    public String internalServerErrorPage(Model model, HttpServletResponse response) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        model.addAttribute("dashUrl", dashboardUrl);
        return "500";
    }
}

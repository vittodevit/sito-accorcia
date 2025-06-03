/**
 * Utility JavaScript per la gestione del tema dell'applicazione (chiaro/scuro).
 *
 * Questo script fornisce funzionalità per:
 * - Alternare tra tema chiaro e scuro
 * - Salvare la preferenza del tema nel localStorage
 * - Caricare il tema preferito all'avvio dell'applicazione
 * - Ottenere il tema corrente
 *
 * Funziona modificando l'attributo 'data-bs-theme' dell'elemento HTML root,
 * che viene utilizzato da Bootstrap per applicare gli stili del tema.
 */

/** Riferimento all'elemento HTML root del documento */
const htmlElement = document.documentElement;

/**
 * Alterna il tema dell'applicazione tra chiaro e scuro.
 * Salva la preferenza nel localStorage per mantenerla tra le sessioni.
 *
 * @returns {string} Il nuovo tema applicato ('light' o 'dark')
 */
function toggleTheme() {
  const currentTheme = htmlElement.getAttribute('data-bs-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  htmlElement.setAttribute('data-bs-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  return newTheme;
}

/**
 * Carica il tema salvato dal localStorage all'avvio dell'applicazione.
 * Se non è stato salvato alcun tema, viene utilizzato il tema predefinito (light).
 */
function loadTheme() {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    htmlElement.setAttribute('data-bs-theme', storedTheme);
  }
}

/**
 * Ottiene il tema corrente dell'applicazione.
 *
 * @returns {string} Il tema corrente ('light' o 'dark')
 */
function getCurrentTheme() {
  return htmlElement.getAttribute('data-bs-theme') || 'light';
}

// Carica il tema all'avvio dello script
loadTheme();

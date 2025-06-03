/**
 * Utility JavaScript per la gestione del tema dell'applicazione (chiaro/scuro) e
 * per il download di immagini dai canvas.
 *
 * Questo script fornisce funzionalità per:
 * - Alternare tra tema chiaro e scuro
 * - Salvare la preferenza del tema nel localStorage
 * - Caricare il tema preferito all'avvio dell'applicazione
 * - Ottenere il tema corrente
 * - Scaricare il primo canvas come immagine PNG
 *
 * Funziona modificando l'attributo 'data-bs-theme' dell'elemento HTML root,
 * che viene utilizzato da Bootstrap per applicare gli stili del tema.
 *
 * Spiegazione per il download delle immagini direttamente sulla relativa funzione.
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

/**
 * Scarica il primo canvas "pulito" (non gestito da Chart.js) come immagine PNG.
 * Questo perchè l'unico canvas non gestito da Chart.js in tutta l'applicazione
 * è quello per generare il QR code di uno shortlink.
 *
 * @param {string} shortlink - Lo shortlink da utilizzare nel nome del file scaricato.
 *
 * Soluzione parecchio vergognosa, tuttavia, nel contesto dell'applicazione ha senso.
 */
function downloadCanvasAsImage(shortlink) {
  // prendi tutti i canvas della pagina
  const canvases = document.getElementsByTagName("canvas");

  for (let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];

    // salta i canvas gestiti da Chart.js
    if (canvas.$chartjs != null) continue;

    // primo e unico canvas trovato, lo scarica come immagine
    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.download = `qr-code-accorcia-${shortlink}.png`;
    link.href = image;
    link.click();

    break;
  }
}

loadTheme();

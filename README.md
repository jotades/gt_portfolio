# Portfolio di Giovanni Tauro

Sito statico, senza framework: HTML, un foglio di stile e un JavaScript per ogni componente interattivo.

## Aprirlo in VS Code

1. **File → Apri cartella…** e scegli questa cartella.
2. Installa l’estensione consigliata **Live Server** (VS Code la propone da sola, è in `.vscode/extensions.json`).
3. Tasto destro su `index.html` → **Open with Live Server**: il sito si apre nel browser e si ricarica a ogni salvataggio.

In alternativa, da terminale: `python3 -m http.server` e poi apri <http://localhost:8000>.

## Dove sono le cose

| Percorso | Contenuto |
|---|---|
| `index.html` | Tutte le pagine. Ogni progetto è un `<main data-view="nome">`; la home è `data-view="home"`. |
| `css/site.css` | Tutti gli stili. Colori e misure di base sono le variabili in `:root` all’inizio. |
| `assets/img/` | Le immagini. Quelle con nomi leggibili vengono dal portfolio PDF; le `embedded-…` erano incorporate nella pagina. |
| `build.py` | Ricrea la versione in un file unico, in `dist/`. |

Gli script, nell’ordine in cui la pagina li carica:

| File | Cosa fa |
|---|---|
| `js/00-lang.js` | sceglie la lingua (nella `<head>`): `?lang=it/en` nell’indirizzo, poi la scelta fatta con lo switch, poi la lingua del browser |
| `js/00-i18n-it.js` | il dizionario inglese → italiano |
| `js/00-i18n.js` | traduce la pagina in italiano, anche i testi scritti dagli script, e gestisce lo switch IT / EN |
| `js/01-router.js` | navigazione tra le pagine (hash nell'indirizzo) |
| `js/02-sim.js` | RehaBalloon, simulatore del palloncino |
| `js/03-pc-proto.js` | PhiCube, prototipi (paziente e terapista) |
| `js/04-core-fig.js` | RehaBalloon, vista 3D in sezione |
| `js/05-pc-proto.js` | PhiCube, prototipi (paziente e terapista) |
| `js/06-ard-sim.js` | Arduino lesson, simulatore |
| `js/07-bk-view.js` | Blender lesson, visore del baking |
| `js/08-blend-zip.js` | Blender lesson, download del file .blend |
| `js/09-bal-sim.js` | Balancing device, simulatore |
| `js/10-sw-sim.js` | Rip@rto, volante force feedback |
| `js/11-fl-sim.js` | Unity experiments, fluido |
| `js/12-pr-demo.js` | Unity experiments, proprietà C# |
| `js/13-publications.js` | filtri e ricerca delle pubblicazioni |
| `js/14-cal.js` | Rip@rto, grafico di taratura |
| `js/15-rb.js` | Rip@rto, costruttore di strada a blocchi |
| `js/16-wb-app.js` | WashB, prototipo dell'app |
| `js/17-rd-app.js` | RED 6.3, app di sharing |
| `js/18-section-index.js` | indice delle sezioni nelle pagine progetto |
| `js/19-ot-sim.js` | OmniTrack, simulatore "caldo-freddo" |
| `js/20-cx.js` | OmniTrack, esploratore della calibrazione |
| `js/21-oa.js` | OmniTrack, OmniAnalytics |
| `js/22-od.js` | OmniTrack, dashboard operatore |
| `js/23-work.js` | home: filtri per ruolo e timeline |
| `js/24-sk.js` | Passions, gioco skateboard e snowboard |

Le parti ancora da completare sono nei `<span class="todo">…</span>` (evidenziati in blu sul sito). Quando non ce ne sono più, togli anche l’avviso “Bozza” in fondo a `index.html`.

## Le due lingue

Il sito è scritto in inglese in `index.html`. Se il browser è in italiano (o se il visitatore sceglie IT nello switch in alto), `js/00-i18n.js` sostituisce ogni testo con quello di `js/00-i18n-it.js`. La scelta resta salvata nel browser; cambiare lingua ricarica la pagina.

- **Le chiavi del dizionario** sono il testo inglese esattamente com’è in `index.html` (spazi ridotti a uno). Per paragrafi, titoli e pulsanti la chiave è tutto il loro HTML interno, tag compresi: il valore italiano deve avere gli stessi tag.
- **Se modifichi un testo inglese**, modifica anche la sua chiave nel dizionario, altrimenti quel testo resta in inglese nella versione italiana.
- **`{#}`** in una chiave vale per un numero qualunque: serve per i testi che gli script scrivono con valori che cambiano.
- Un elemento con `translate="no"` (o classe `notranslate`) non viene tradotto.
- Per vedere una lingua precisa: `index.html?lang=it` oppure `index.html?lang=en`.

## Pubblicarlo

- **GitHub Pages:** carica *il contenuto* di questa cartella (`index.html`, `css/`, `js/`, `assets/`) nel repository `jotades.github.io`. Funziona così com’è, senza build.
- **File unico** (link di claude.ai, Netlify Drop, email): `python3 build.py` crea `dist/giovanni-tauro-portfolio.html`, con stili, script e immagini dentro.

## Note

- Le demo 3D caricano three.js da cdnjs, e il font Archivo arriva da Google Fonts: serve la connessione.
- Alcuni dati restano dentro gli script (mesh delle arcate di WashB, dati della tesi per OmniTrack, il file .blend del dado): sono grandi ma non vanno toccati a mano.
- Il gioco e i filtri salvano solo preferenze e record nel `localStorage` del browser.

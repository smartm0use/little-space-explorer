# Little Space Explorer

**An interactive solar system for curious kids**

[**Explore the solar system →**](https://smartm0use.github.io/little-space-explorer/)

A browser-based 3D atlas with **55 celestial bodies**, detailed planetary maps,
orbit controls, zoom, moons, asteroids, comets and a real-time simulation clock.
Built with Three.js and WebGL; no build step, account or API key is required.
The current interface and educational descriptions are in **Italian**.

[![Explore Earth in Little Space Explorer](web/anteprima-terra.png)](https://smartm0use.github.io/little-space-explorer/)

## Quick start

Open the [live website](https://smartm0use.github.io/little-space-explorer/), or
run locally with Python 3:

```bash
python3 avvia_browser.py
```

Drag to orbit, scroll to zoom, and right-drag to pan. Select a destination to
follow it. Choose **Terra → Dettaglio alto → Avvicina alla superficie** for a
close-up of Earth's real continents. All runtime assets are included locally.

## GitHub Pages

The `.github/workflows/pages.yml` workflow checks JavaScript syntax, runs the
simulation tests, and deploys `web/` to GitHub Pages on every push to `main`.
In repository settings, Pages must use **GitHub Actions** as its source.

## Guida in italiano

## Atlante interattivo nel browser

Dalla cartella del progetto esegui:

```bash
python3 avvia_browser.py
```

Si apre il browser su un indirizzo locale. Lascia il terminale aperto durante
l'esplorazione; Ctrl+C ferma il server. La porta è scelta automaticamente.
Non aprire direttamente `web/index.html` con `file://`: i moduli JavaScript
richiedono il server HTTP locale.

In alternativa, per un indirizzo fisso:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 --directory web
```

Poi apri http://127.0.0.1:8765.

### Controlli

- Trascina con il tasto sinistro per ruotare; rotella per lo zoom.
- Tasto destro e trascinamento per spostare l'inquadratura.
- Su touchscreen: un dito per ruotare, due dita per zoom e spostamento.
- Clicca un corpo o scegli una destinazione per avvicinarti e seguirlo.
- “Avvicina alla superficie” porta il corpo selezionato in primo piano.
- “Vista generale” riporta all'intero sistema.
- “Sistema esterno · fino a Sedna” allarga la vista agli oggetti più lontani.
- Pausa, velocità e interruttori gestiscono animazione, orbite, nomi, lune e detriti.
- I nomi delle lune compaiono quando si esplora il loro pianeta o una sua luna.
- Su mobile puoi nascondere i controlli per liberare la vista.

### Velocità e dettaglio

Il selettore avanza a scatti: **1×, 2×, 3×, 5×, 10×**, e così via fino a
un anno simulato al secondo. I pulsanti −/+ avanzano di uno scatto; tre
scorciatoie portano al tempo reale, a un giorno/s e a un anno/s.

- **1× (tempo reale · 1 s/s)**: un secondo simulato per secondo effettivo.
- **2× (2 s/s)** e **3× (3 s/s)**: doppio e triplo del tempo reale.
- **86.400× (1 g/s)**: un giorno simulato al secondo, valore iniziale.
- **31.557.600× (365,25 g/s)**: un anno giuliano simulato al secondo.

Pianeti, lune e rotazioni modellate condividono lo stesso fattore. Il tempo
dipende dall'orologio reale, non dagli FPS, e recupera il tempo trascorso quando
si torna da una scheda in background; la pausa lo congela. A 1× i moti orbitali
sono quasi impercettibili. Alle velocità elevate i moti più rapidi possono
apparire fermi o invertiti per effetto del campionamento dei fotogrammi.

**Bilanciato** usa mappe 2K. **Alto** usa una mappa della Terra 4K e una mesh
più fine per il corpo selezionato. La risoluzione elevata viene caricata solo
quando richiesta. Continenti e coste della Terra sono reali, da una mappa
basata su NASA Blue Marble; non è una simulazione del meteo attuale.

### Contenuto e scelte illustrative

**55 corpi esplorabili**: Sole, otto pianeti, 30 lune e 16 piccoli corpi.
Sono inclusi gli anelli dei quattro giganti, di Haumea e di Quaoar, la fascia
degli asteroidi e la fascia di Kuiper.

I 16 corpi aggiuntivi sono:

- Pianeti nani riconosciuti: **Cerere, Plutone, Haumea, Makemake, Eris**.
- Oggetti transnettuniani / candidati pianeti nani: **Quaoar, Orcus, Gonggong,
  Sedna**.
- Asteroidi: **Vesta, Pallade, Igea, Psiche, Bennu**.
- Comete: **Halley, 67P / Churyumov–Gerasimenko**, con code illustrative.

Le lune rappresentate sono una selezione, non tutti i satelliti conosciuti:

| Pianeta | Lune incluse |
| --- | --- |
| Terra | Luna |
| Marte | Fobos, Deimos |
| Giove | Io, Europa, Ganimede, Callisto |
| Saturno | Mimas, Encelado, Teti, Dione, Rea, Titano |
| Urano | Miranda, Ariel, Umbriel, Titania, Oberon |
| Nettuno | Proteo, Tritone |
| Plutone | Caronte, Stige, Notte, Cerbero, Idra |
| Eris | Disnomia |
| Haumea | Namaka, Hiʻiaka |
| Quaoar | Weywot |
| Orcus | Vanth |

Mercurio e Venere non hanno lune. Dimensioni e distanze sono compresse;
orbite planetarie circolari e orbite dei piccoli corpi ellittiche illustrative.
Inclinazioni, eccentricità e assi sono semplificati; le fasi iniziali non sono
effemeridi della data corrente. I periodi medi di rivoluzione e rotazione
modellati sono espressi in giorni terrestri; per le piccole lune di Plutone
con rotazione complessa, la rotazione non è modellata. Non si simulano
perturbazioni gravitazionali, eclissi o baricentri. Le fasce di detriti sono
rappresentative, non cataloghi di singoli oggetti.

Il Sole è l'unica stella esplorabile del sistema solare. Una scheda spiega
le distanze di Proxima Centauri e Sirio. Lo sfondo stellato è decorativo.

Sole, pianeti principali e Luna usano mappe di **Solar System Scope / INOVE**,
basate su dati NASA, con licenza **CC BY 4.0**. Gli altri corpi hanno superfici
procedurali illustrative, indicate nelle schede. Attribuzioni, fonti e limiti
sono in `web/credits.html` e `web/assets/textures/CREDITS.md`.

La versione navigabile usa **Three.js 0.170.0 / WebGL**, con dipendenze locali
in `web/vendor/` e licenza in `web/vendor/THREE-LICENSE.txt`. Non richiede npm,
ManimGX o una connessione Internet per l'utilizzo. Occorrono Python 3 e un
browser moderno con WebGL.

### File della versione web

- `web/index.html`, `web/style.css`, `web/atlas.css`: interfaccia.
- `web/app.js`: rendering, selezione, camera e materiali.
- `web/catalog.js`: corpi aggiuntivi, periodi e associazioni delle mappe.
- `web/simulation.mjs`: orologio, velocità e calcolo delle orbite.
- `web/assets/textures/`: mappe locali con attribuzioni.
- `web/anteprima.png`, `web/anteprima-terra.png`: viste di esempio.

Test dell'orologio e delle orbite, senza dipendenze esterne (Node.js):

```bash
node --test tests/simulation.test.mjs
```

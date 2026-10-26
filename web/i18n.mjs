export const LANGUAGE_KEY = 'little-space-explorer.language';

export function resolveLanguage(saved, browserLanguage = 'en') {
  if (saved === 'en' || saved === 'it') return saved;
  return /^it(?:-|$)/i.test(browserLanguage) ? 'it' : 'en';
}

function savedLanguage() {
  try { return globalThis.localStorage?.getItem(LANGUAGE_KEY); } catch { return null; }
}
let language = resolveLanguage(savedLanguage(), globalThis.navigator?.language);
export const getLanguage = () => language;
export const locale = () => language === 'it' ? 'it-IT' : 'en-US';

// Each entry contains English (the fallback) and Italian.
export const messages = {
  language: ['Language', 'Lingua'],
  universe: ['Interactive three-dimensional solar system', 'Sistema solare tridimensionale interattivo'],
  controls: ['Exploration controls', 'Controlli di esplorazione'],
  showControls: ['Show controls', 'Mostra controlli'],
  hideControls: ['Hide controls', 'Nascondi controlli'],
  explore: ['EXPLORE', 'ESPLORA'],
  destination: ['Destination', 'Destinazione'],
  overview: ['Overview', 'Vista d’insieme'],
  outer: ['Outer solar system · out to Sedna', 'Sistema esterno · fino a Sedna'],
  home: ['↗ Overview', '↗ Vista generale'],
  pause: ['Ⅱ Pause', 'Ⅱ Pausa'],
  resume: ['▶ Resume', '▶ Riprendi'],
  surface: ['◎ Take a closer look', '◎ Avvicina alla superficie'],
  time: ['Time speed', 'Scorrimento del tempo'],
  slower: ['Previous speed', 'Velocità precedente'],
  faster: ['Next speed', 'Velocità successiva'],
  realtime: ['1× Real time', '1× Reale'],
  daySpeed: ['1 day/s', '1 g/s'],
  yearSpeed: ['1 year/s', '1 anno/s'],
  timeNote: ['The same factor applies to planets, moons and rotation. At high speeds, fast motion may appear frozen or reversed.', 'Stesso fattore per pianeti, lune e rotazioni. A velocità elevate i moti rapidi possono sembrare fermi o invertiti.'],
  realNote: ['Real time: orbital motion is almost imperceptible.', 'Tempo reale: i moti orbitali sono quasi impercettibili.'],
  elapsed: ['Elapsed simulation time', 'Tempo simulato trascorso'],
  dayUnit: ['d', 'g'],
  detail: ['Graphics detail', 'Dettaglio grafico'],
  standard: ['Balanced · 2K maps', 'Bilanciato · mappe 2K'],
  high: ['High · 4K Earth and finer surfaces', 'Alto · Terra 4K e superfici più fini'],
  orbits: ['Orbits', 'Orbite'],
  names: ['Names', 'Nomi'],
  moons: ['Moons', 'Lune'],
  debris: ['Debris belts', 'Fasce di detriti'],
  minor: ['Dwarf planets and small bodies', 'Pianeti nani e piccoli corpi'],
  neighborhood: ['Our cosmic neighborhood', 'Il nostro vicinato cosmico'],
  introduction: ['Choose a body to follow it up close. Explore the five recognized dwarf planets, large trans-Neptunian objects, asteroids and famous comets.', 'Seleziona un corpo per seguirlo da vicino. Il catalogo include i cinque pianeti nani riconosciuti, grandi oggetti transnettuniani, asteroidi e comete note.'],
  asteroidBelt: ['Asteroid belt', 'Fascia degli asteroidi'],
  asteroidLocation: ['between Mars and Jupiter', 'tra Marte e Giove'],
  kuiperBelt: ['Kuiper belt', 'Fascia di Kuiper'],
  kuiperLocation: ['beyond Neptune', 'oltre Nettuno'],
  otherStars: ['What about other stars?', 'E le altre stelle?'],
  starsText: ['The Sun is the only star in our solar system. Proxima Centauri is about 4.25 light-years away; Sirius about 8.6. They are far beyond Pluto and do not orbit the Sun. The starry background is decorative, not a sky map.', 'Il Sole è l’unica stella del sistema solare. Proxima Centauri dista circa 4,25 anni luce; Sirio circa 8,6. Sono immensamente più lontane di Plutone e non orbitano attorno al Sole. Lo sfondo stellato è decorativo, non una mappa del cielo.'],
  creditsLink: ['Maps, sources and model limitations ↗', 'Mappe, fonti e limiti del modello ↗'],
  gestureHelp: ['Drag to orbit · Scroll / pinch to zoom · Right-drag / two fingers to pan', 'Trascina per ruotare · Rotella / pizzica per zoom · Tasto destro / due dita per spostarti'],
  modelNote: ['Spatial scales are adapted; positions are illustrative. 1× = one simulated second per second; real mean periods, not ephemerides.', 'Scale spaziali adattate, posizioni illustrative. 1× = 1 secondo simulato al secondo; periodi medi reali, senza effemeridi.'],
  loading: ['Preparing your universe…', 'Preparazione dell’universo…'],
  webglError: ['WebGL is unavailable. Open this page in a browser with graphics acceleration enabled.', 'WebGL non disponibile. Apri questa pagina in un browser con accelerazione grafica attiva.'],
  mapError: ['A map is unavailable: using an illustrative surface. Reload to try again.', 'Una mappa non è disponibile: uso la superficie illustrativa. Ricarica per riprovare.'],
  orbitAround: ['Orbit around {name}', 'Orbita attorno a {name}'],
  retrograde: [' · retrograde', ' · retrograda'],
  solarStar: ['Star of the solar system', 'Stella del sistema solare'],
  rotation: [' · Rotation: {period}', ' · Rotazione: {period}'],
  noRotation: [' · Rotation not modeled', ' · Rotazione non modellata'],
  mapSource: ['Map: Solar System Scope / INOVE, NASA data · CC BY 4.0. Adjusted colors.', 'Mappa: Solar System Scope / INOVE, dati NASA · CC BY 4.0. Colori adattati.'],
  procedural: ['Illustrative surface and shape: not a photographic map.', 'Superficie e forma illustrative: non una mappa fotografica.'],
  moonDescription: ['{name}, a natural satellite of {parent}. Real orbital period: {period} Earth days.', '{name}, satellite naturale di {parent}. Periodo orbitale reale: {period} giorni terrestri.'],
  moonRetrograde: [' Retrograde orbit: it moves in the opposite direction to Neptune’s rotation.', ' Orbita retrograda: si muove in senso opposto alla rotazione di Nettuno.'],
  moonScale: [' Its size and distance from the surface are exaggerated in this view.', ' Dimensione e distanza dalla superficie sono amplificate in questa vista.'],
  back: ['← Back to Little Space Explorer', '← Torna a Little Space Explorer'],
  creditsTitle: ['Maps, sources and model limitations', 'Mappe, fonti e limiti del modello'],
};

export function t(key, values = {}) {
  const text = messages[key]?.[language === 'it' ? 1 : 0] ?? messages[key]?.[0] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
}

const englishNames = {
  Sole: 'Sun', Mercurio: 'Mercury', Venere: 'Venus', Terra: 'Earth', Marte: 'Mars',
  Giove: 'Jupiter', Saturno: 'Saturn', Urano: 'Uranus', Nettuno: 'Neptune',
  Luna: 'Moon', Fobos: 'Phobos', Ganimede: 'Ganymede', Encelado: 'Enceladus',
  Teti: 'Tethys', Rea: 'Rhea', Titano: 'Titan', Proteo: 'Proteus', Tritone: 'Triton',
  Cerere: 'Ceres', Plutone: 'Pluto', Pallade: 'Pallas', Igea: 'Hygiea', Psiche: 'Psyche',
  Caronte: 'Charon', Stige: 'Styx', Notte: 'Nix', Cerbero: 'Kerberos', Idra: 'Hydra', Disnomia: 'Dysnomia',
  Pianeti: 'Planets', Lune: 'Moons', Stelle: 'Stars', 'Pianeti nani': 'Dwarf planets',
  'Oggetti transnettuniani': 'Trans-Neptunian objects', Asteroidi: 'Asteroids', Comete: 'Comets',
  'Fascia degli asteroidi': 'Asteroid belt', 'Fascia di Kuiper': 'Kuiper belt',
};
export const displayName = name => language === 'it' ? name : englishNames[name] ?? name;

export const englishDescriptions = {
  Sole: 'The only star in our solar system. Its gravity governs the orbits of planets, moons and small bodies. The rotation shown uses a mean equatorial period: the Sun does not rotate as a rigid body.',
  Mercurio: 'The planet closest to the Sun. It has a rocky, cratered surface and no moons.',
  Venere: 'A rocky world wrapped in a thick atmosphere. It has no moons.',
  Terra: 'Our home planet, with continents, oceans and polar ice from a geographical map based on NASA Blue Marble. Choose High detail and take a closer look to explore the coastlines. The Moon is its only natural satellite.',
  Marte: 'The red planet, with two small, irregular moons: Phobos and Deimos.',
  Giove: 'The largest gas giant. Its four Galilean moons—Io, Europa, Ganymede and Callisto—and a faint ring are shown here.',
  Saturno: 'Its rings are made mostly of ice. Explore six of its major moons, including Titan and Enceladus.',
  Urano: 'An ice giant with a strongly tilted rotation axis. Five major moons and its thin rings are shown.',
  Nettuno: 'The outermost planet. This view includes Triton, its large retrograde moon, and Proteus, along with faint rings.',
  Cerere: 'The largest object in the asteroid belt and the only dwarf planet in the inner solar system. The Dawn spacecraft observed craters and bright salt deposits.',
  Plutone: 'A dwarf planet in the Kuiper belt, explored by New Horizons in 2015. It has nitrogen ice, water-ice mountains and five moons. The surface here is illustrative, not a New Horizons map.',
  Haumea: 'A very elongated dwarf planet that rotates in about four hours. It has a ring and two moons: Hiʻiaka and Namaka.',
  Makemake: 'A very cold dwarf planet beyond Neptune, with frozen methane on its surface. It also has a small known moon, nicknamed MK2, not represented in this selection.',
  Eris: 'Similar in size to Pluto, but more massive. Its orbit is strongly inclined. Its moon Dysnomia allows astronomers to measure its mass.',
  Quaoar: 'A large Kuiper belt object and dwarf-planet candidate. It has a moon, Weywot, and a ring system surprisingly far from its surface.',
  Orcus: 'A trans-Neptunian object in a 3:2 resonance with Neptune, like Pluto. It is a dwarf-planet candidate; its moon is called Vanth.',
  Gonggong: 'One of the largest known trans-Neptunian objects, with a reddish surface. It is a dwarf-planet candidate and has a moon, Xiangliu, not represented here.',
  Sedna: 'A remote world whose real, extremely elongated orbit takes over 11,000 years to complete. It is a detached object and dwarf-planet candidate. Its orbit is heavily compressed here to make it explorable.',
  Vesta: 'One of the largest asteroids, visited by the Dawn spacecraft. It has a basaltic crust and an enormous impact basin near its south pole.',
  Pallade: 'One of the largest main-belt asteroids. Its orbit is much more inclined than those of most planets.',
  Igea: 'A large, dark, roughly spherical asteroid in the outer part of the main asteroid belt.',
  Psiche: 'A metal-rich asteroid and the destination of NASA’s Psyche mission. It may hold clues to the formation of planetary cores.',
  Bennu: 'A small near-Earth asteroid. OSIRIS-REx returned samples of its surface to Earth in 2023. It is greatly enlarged in this scene.',
  Halley: 'The famous periodic comet returns roughly every 76 years and follows a retrograde orbit. Its illustrative tail points away from the Sun and becomes more visible nearby.',
  '67P / Churyumov–Gerasimenko': 'The comet studied by Rosetta and the Philae lander. Its real nucleus has two lobes; here it has a simplified shape, without a topographical reconstruction.',
};

export function bodyDescription(body) {
  if (body.parent) return t('moonDescription', {
    name: displayName(body.name), parent: displayName(body.parent.name),
    period: Math.abs(body.period).toLocaleString(locale()),
  }) + (body.period < 0 ? t('moonRetrograde') : '') + t('moonScale');
  return language === 'it' ? body.description : englishDescriptions[body.name] ?? body.description;
}

export function applyTranslations(root = document) {
  document.documentElement.lang = language;
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
  for (const el of root.querySelectorAll('[data-language]')) el.hidden = el.dataset.language !== language;
  for (const el of root.querySelectorAll('.language-select')) el.value = language;
}

export function setLanguage(value, persist = true) {
  language = resolveLanguage(value);
  if (persist) { try { globalThis.localStorage?.setItem(LANGUAGE_KEY, language); } catch { /* Storage may be blocked. */ } }
  if (typeof document !== 'undefined') {
    applyTranslations();
    window.dispatchEvent(new Event('app-languagechange'));
  }
}

export function initLanguageUI() {
  applyTranslations();
  for (const el of document.querySelectorAll('.language-select')) el.addEventListener('change', () => setLanguage(el.value));
  window.addEventListener('storage', event => {
    if (event.key === LANGUAGE_KEY || event.key === null) setLanguage(resolveLanguage(savedLanguage(), navigator.language), false);
  });
}

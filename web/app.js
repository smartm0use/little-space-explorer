import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { surfaces, rotations, minorBodies, extraMoons } from './catalog.js';
import { DAY, SPEEDS, speedLabel, SimulationClock, orbitalAngle, orbitPoint } from './simulation.mjs';

const $ = (id) => document.getElementById(id);
$('panel-toggle').addEventListener('click', () => {
  const panel = $('explore-panel'); panel.hidden = !panel.hidden;
  $('panel-toggle').setAttribute('aria-expanded', String(!panel.hidden));
  $('panel-toggle').textContent = panel.hidden ? 'Mostra controlli' : 'Nascondi controlli';
});
matchMedia('(max-width: 700px)').addEventListener('change', event => {
  if (!event.matches) {
    $('explore-panel').hidden = false;
    $('panel-toggle').setAttribute('aria-expanded', 'true');
    $('panel-toggle').textContent = 'Nascondi controlli';
  }
});
const scene = new THREE.Scene();
scene.background = new THREE.Color('#030711');
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.025, 1600);
camera.position.set(0, 48, 68);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch (error) {
  $('status').textContent = 'WebGL non disponibile. Apri questa pagina in un browser con accelerazione grafica attiva.';
  throw error;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
$('universe').appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.minDistance = 0.4;
controls.maxDistance = 260;
controls.enablePan = true;
scene.add(new THREE.AmbientLight(0xc7dcff, 1.1));
const sunlight = new THREE.PointLight(0xffe9cc, 130, 0, 1);
scene.add(sunlight);

// Deterministic procedural textures and debris: no external image services.
let seed = 6821;
function random() { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; }
const TAU = Math.PI * 2;
const orbitGroup = new THREE.Group();
const debrisGroup = new THREE.Group();
scene.add(orbitGroup, debrisGroup);
const records = [], pickable = [], labelRecords = [];
let elapsedDays = 0, paused = false, selected = null, transition = null;
const previousTarget = new THREE.Vector3();
const simulation = new SimulationClock(performance.now(), DAY);
const textureLoader = new THREE.TextureLoader();
const textureCache = new Map();
let textureFailure = false;

function loadMap(file) {
  if (!textureCache.has(file)) {
    textureCache.set(file, textureLoader.loadAsync(`./assets/textures/${file}`).then(map => {
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      return map;
    }).catch(() => {
      textureFailure = true;
      $('status').textContent = 'Una mappa non è disponibile: uso la superficie illustrativa. Ricarica per riprovare.';
      return null;
    }));
  }
  return textureCache.get(file);
}

async function applySurface(body) {
  if (!surfaces[body.name]) return;
  const request = Symbol(); body.mapRequest = request;
  const file = `${body.name === 'Terra' && $('detail').value === 'high' ? '4k' : '2k'}_${surfaces[body.name]}.jpg`;
  const map = await loadMap(file);
  if (!map || body.mapRequest !== request) return;
  if (body.mesh.material.map?.isCanvasTexture) body.mesh.material.map.dispose();
  body.mesh.material.map = map;
  body.mesh.material.needsUpdate = true;
}

function texture(color, kind) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color; ctx.fillRect(0, 0, 512, 256);
  if (kind === 'gas') {
    for (let y = 0; y < 256; y += 3) {
      ctx.fillStyle = `rgba(${random() > .5 ? '255,235,205' : '65,34,25'},${random() * .24})`;
      ctx.fillRect(0, y, 512, 3 + random() * 10);
    }
  } else if (kind === 'earth') {
    // A blue placeholder until the geographical map loads; no invented land.
  } else {
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = `rgba(${random() > .5 ? '255,240,215' : '40,25,20'},${random() * .16})`;
      ctx.beginPath(); ctx.arc(random() * 512, random() * 256, 1 + random() * 6, 0, TAU); ctx.fill();
    }
  }
  const result = new THREE.CanvasTexture(canvas);
  result.colorSpace = THREE.SRGBColorSpace;
  return result;
}

function addLabel(text, object, type = '') {
  const el = document.createElement('div');
  el.className = `label ${type}`; el.textContent = text;
  $('labels').appendChild(el);
  const entry = { el, object, type };
  labelRecords.push(entry);
  return entry;
}

function orbit(radius, color, parent = orbitGroup, inclination = 0, eccentricity = 0, node = 0) {
  const points = Array.from({ length: 192 }, (_, i) => {
    const a = i / 192 * TAU;
    return new THREE.Vector3(...orbitPoint(a, radius, eccentricity, inclination, node));
  });
  const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: .24 }));
  parent.add(line); return line;
}

function ring(parent, inner, outer, color, opacity, tilt = .35) {
  const mesh = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 120),
    new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity, depthWrite: false }));
  mesh.rotation.x = Math.PI / 2 + tilt; parent.add(mesh);
}

function makeBody({ name, radius, color, distance = 0, period = 1, kind = 'rock', parent = null, description, moons = [], category = parent ? 'Lune' : 'Pianeti', rotationPeriod = parent ? period : rotations[name] ?? null, inclination = 0, eccentricity = 0, shape = [1, 1, 1] }) {
  const anchor = new THREE.Group();
  (parent ? parent.anchor : scene).add(anchor);
  const material = name === 'Sole'
    ? new THREE.MeshBasicMaterial({ map: texture(color, 'rock') })
    : new THREE.MeshStandardMaterial({ map: texture(color, kind), roughness: .95, metalness: 0 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 40, 24), material);
  const spinAxis = new THREE.Group();
  spinAxis.rotation.z = name === 'Terra' ? 23.44 * Math.PI / 180 : name === 'Marte' ? .44 : 0;
  spinAxis.add(mesh); anchor.add(spinAxis); mesh.scale.fromArray(shape);
  const record = { name, radius, distance, period, anchor, mesh, spinAxis, parent, description, moons, category, rotationPeriod, eccentricity, inclination: inclination * Math.PI / 180, node: random() * TAU, phase: random() * TAU };
  mesh.userData.body = record; records.push(record); pickable.push(mesh);
  record.minor = !['Pianeti', 'Lune', 'Stelle'].includes(category);
  record.label = addLabel(name, anchor, parent ? 'moon' : record.minor ? 'minor' : '');
  record.label.body = record;
  if (distance) record.orbit = orbit(distance, color, parent ? parent.anchor : orbitGroup, record.inclination, eccentricity, record.node);
  if (record.minor) record.orbit.material.opacity = .085;
  applySurface(record);
  return record;
}

const sun = makeBody({ name: 'Sole', category: 'Stelle', radius: 1.6, color: '#ffbf45', description: 'L’unica stella del sistema solare. La sua gravità governa le orbite dei pianeti, delle lune e dei piccoli corpi. La rotazione mostrata usa un periodo equatoriale medio: il Sole non ruota come un corpo rigido.' });
const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 128;
const gc = glowCanvas.getContext('2d'), gradient = gc.createRadialGradient(64, 64, 12, 64, 64, 64);
gradient.addColorStop(0, '#ffd877aa'); gradient.addColorStop(.35, '#ffae4033'); gradient.addColorStop(1, '#ff9c0000');
gc.fillStyle = gradient; gc.fillRect(0, 0, 128, 128);
const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
glow.scale.set(9, 9, 1); sun.anchor.add(glow);

// Orbital periods in Earth days. Radii and distances are illustrative scene units.
const planetData = [
  ['Mercurio', .18, '#aaa29a', 3, 87.97, 'rock', 'Il pianeta più vicino al Sole. Superficie rocciosa e craterizzata; non ha lune.'],
  ['Venere', .31, '#d3b579', 4.4, 224.7, 'gas', 'Un mondo roccioso avvolto da una densa atmosfera. Non ha lune.'],
  ['Terra', .34, '#246bbe', 6, 365.25, 'earth', 'Il nostro pianeta, con continenti, oceani e calotte polari da una mappa geografica basata su NASA Blue Marble. Seleziona Dettaglio alto e avvicinati per distinguere le coste. La Luna è il suo unico satellite naturale.'],
  ['Marte', .25, '#bd6345', 7.7, 686.98, 'rock', 'Il pianeta rosso, con due piccole lune irregolari: Fobos e Deimos.'],
  ['Giove', .85, '#c5a382', 11.6, 4332.59, 'gas', 'Il gigante gassoso più grande. Qui sono mostrate le quattro lune galileiane: Io, Europa, Ganimede e Callisto, e un tenue anello.'],
  ['Saturno', .71, '#d9c69a', 16, 10759, 'gas', 'I suoi anelli sono fatti soprattutto di ghiaccio. Qui puoi esplorare sei delle sue lune principali, tra cui Titano ed Encelado.'],
  ['Urano', .48, '#88cdd4', 20.3, 30687, 'gas', 'Un gigante ghiacciato con asse di rotazione fortemente inclinato. Sono mostrate cinque lune principali e i sottili anelli.'],
  ['Nettuno', .46, '#3d65ce', 24, 60190, 'gas', 'Il pianeta più esterno. Qui compaiono Tritone, la grande luna con orbita retrograda, e Proteo, oltre ai deboli anelli.'],
];
const planets = planetData.map(([name, radius, color, distance, period, kind, description]) => makeBody({ name, radius, color, distance, period, kind, description }));
const smallBodies = minorBodies.map(data => makeBody(data));
const byName = Object.fromEntries(records.map(r => [r.name, r]));
const moonData = {
  Terra: [['Luna', .095, .73, 27.32, '#b8b8b2']],
  Marte: [['Fobos', .044, .46, .319, '#918377'], ['Deimos', .032, .65, 1.263, '#a89d8c']],
  Giove: [['Io', .09, 1.18, 1.769, '#d5bc69'], ['Europa', .08, 1.48, 3.551, '#d3c9ad'], ['Ganimede', .13, 1.85, 7.155, '#a89d8d'], ['Callisto', .115, 2.25, 16.689, '#877c70']],
  Saturno: [['Mimas', .038, 1.49, .942, '#b2afa8'], ['Encelado', .052, 1.70, 1.37, '#e0e7e6'], ['Teti', .065, 1.92, 1.888, '#c8c8bd'], ['Dione', .07, 2.14, 2.737, '#b2b1a9'], ['Rea', .085, 2.39, 4.518, '#b5b0a3'], ['Titano', .135, 2.72, 15.945, '#d2a45a']],
  Urano: [['Miranda', .04, .80, 1.413, '#b6b7b1'], ['Ariel', .06, 1.04, 2.52, '#c5c7c2'], ['Umbriel', .06, 1.27, 4.144, '#777b7c'], ['Titania', .08, 1.51, 8.706, '#aaa6a0'], ['Oberon', .076, 1.78, 13.463, '#948b82']],
  Nettuno: [['Proteo', .047, .78, 1.122, '#8f999e'], ['Tritone', .10, 1.14, -5.877, '#c7c0bc']],
  ...extraMoons,
};
for (const [planet, list] of Object.entries(moonData)) {
  const parent = byName[planet];
  for (const [name, radius, distance, period, color] of list) {
    const moon = makeBody({ name, radius, distance, period, color, parent,
      description: `${name}, satellite naturale di ${planet}. Periodo orbitale reale: ${Math.abs(period).toLocaleString('it-IT')} giorni terrestri.${period < 0 ? ' Orbita retrograda: si muove in senso opposto alla rotazione di Nettuno.' : ''} Dimensione e distanza dalla superficie sono amplificate in questa vista.` });
    parent.moons.push(moon);
    if (['Stige', 'Notte', 'Cerbero', 'Idra'].includes(name)) moon.rotationPeriod = null;
    if (['Fobos', 'Deimos', 'Proteo'].includes(name)) moon.mesh.scale.set(1.3, .8, 1);
  }
}
ring(byName.Giove.anchor, .97, 1.09, '#c9bfa7', .13, .05);
for (const [a, b, opacity] of [[.94, 1.06, .48], [1.08, 1.25, .78], [1.30, 1.41, .53]]) ring(byName.Saturno.anchor, a, b, '#cbb991', opacity);
ring(byName.Urano.anchor, .64, .68, '#9fb7b8', .55, 1.35);
ring(byName.Nettuno.anchor, .61, .65, '#8d9bac', .28, .45);
ring(byName.Haumea.anchor, .34, .37, '#bfb7a6', .40, .2);
ring(byName.Quaoar.anchor, .42, .44, '#b7aa99', .35, .4);

// A subtle atmospheric rim, leaving the geographical texture readable.
const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(.347, 48, 32), new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: 'varying vec3 n; varying vec3 p; void main(){ n=normalize(normalMatrix*normal); vec4 v=modelViewMatrix*vec4(position,1.0); p=v.xyz; gl_Position=projectionMatrix*v; }',
  fragmentShader: 'varying vec3 n; varying vec3 p; void main(){ float rim=pow(1.0-max(dot(normalize(n),normalize(-p)),0.0),3.0); gl_FragColor=vec4(0.18,0.48,0.9,rim*0.45); }',
}));
byName.Terra.anchor.add(atmosphere);

for (const comet of smallBodies.filter(b => b.category === 'Comete')) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(180 * 3);
  for (let i = 0; i < 180; i++) {
    const length = random() * 3;
    positions.set([(random() - .5) * length * .18, (random() - .5) * length * .18, length], i * 3);
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  comet.tail = new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#8fbace', size: .025, transparent: true, opacity: .5, depthWrite: false }));
  comet.anchor.add(comet.tail);
}

function belt(inner, outer, count, color, size, thickness, name) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(inner * inner + random() * (outer * outer - inner * inner)), a = random() * TAU;
    points.set([r * Math.cos(a), (random() - .5) * thickness, r * Math.sin(a)], i * 3);
  }
  const cloud = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(points, 3)),
    new THREE.PointsMaterial({ color, size, sizeAttenuation: true, transparent: true, opacity: .65, depthWrite: false }));
  debrisGroup.add(cloud);
  const marker = new THREE.Object3D(); marker.position.set(-inner * .75, .15, inner * .65); debrisGroup.add(marker);
  addLabel(name, marker, 'belt');
  return cloud;
}
const asteroidBelt = belt(8.8, 10.2, 2400, '#baa68c', .037, .40, 'Fascia degli asteroidi');
const kuiperBelt = belt(27.5, 35, 5200, '#78a7be', .055, 1.1, 'Fascia di Kuiper');
const starPositions = new Float32Array(2500 * 3);
for (let i = 0; i < 2500; i++) {
  const a = random() * TAU, y = random() * 2 - 1, r = 350 + random() * 200;
  starPositions.set([r * Math.sqrt(1 - y * y) * Math.cos(a), r * y, r * Math.sqrt(1 - y * y) * Math.sin(a)], i * 3);
}
scene.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(starPositions, 3)),
  new THREE.PointsMaterial({ color: '#b4c8e3', size: .65, transparent: true, opacity: .8, depthWrite: false })));

const destination = $('destination');
function option(body, target) { const el = document.createElement('option'); el.value = body.name; el.textContent = body.name; target.appendChild(el); }
option(sun, destination);
for (const planet of planets) {
  const group = document.createElement('optgroup'); group.label = planet.name;
  option(planet, group); planet.moons.forEach(moon => option(moon, group)); destination.appendChild(group);
}
for (const category of [...new Set(smallBodies.map(b => b.category))]) {
  const group = document.createElement('optgroup'); group.label = category;
  for (const body of smallBodies.filter(b => b.category === category)) {
    option(body, group);
    for (const moon of body.moons) {
      option(moon, group); group.lastChild.textContent = `↳ ${moon.name} (${body.name})`;
    }
  }
  destination.appendChild(group);
}
function focus(body, closeup = false, outer = false) {
  selected = body;
  for (const small of smallBodies) small.orbit.material.opacity = small === body || small === body?.parent ? .45 : .085;
  destination.value = body ? body.name : outer ? 'outer' : 'overview';
  const target = body ? body.anchor.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3();
  previousTarget.copy(target);
  const distance = body ? (closeup ? body.radius * 4.5 : Math.max(body.radius * 8, body.moons.length ? body.moons.at(-1).distance * 3.1 : body.radius * 11)) : outer ? 180 : 83;
  const direction = new THREE.Vector3(.3, .58, 1).normalize();
  transition = { start: performance.now(), from: camera.position.clone(), targetFrom: controls.target.clone(), offset: direction.multiplyScalar(distance) };
  controls.minDistance = body ? Math.max(body.radius * 1.6, .12) : .4;
  $('info').replaceChildren();
  const heading = document.createElement('h2'); heading.textContent = body?.name || 'Il nostro vicinato cosmico';
  const description = document.createElement('p');
  description.textContent = body ? body.description : 'Seleziona un pianeta per seguirlo da vicino. La fascia degli asteroidi contiene soprattutto corpi rocciosi; la fascia di Kuiper è una vasta regione di piccoli corpi ghiacciati oltre Nettuno. Le particelle sono rappresentative, non un catalogo di oggetti reali.';
  $('info').append(heading, description);
  $('surface').disabled = !body;
  if (body) {
    const facts = document.createElement('div'); facts.className = 'facts';
    const days = n => `${Math.abs(n).toLocaleString('it-IT', { maximumFractionDigits: 3 })} g`;
    const period = body.distance ? `${body.parent ? 'Orbita attorno a ' + body.parent.name : 'Orbita attorno al Sole'}: ${days(body.period)}${body.period < 0 ? ' · retrograda' : ''}` : 'Stella del sistema solare';
    facts.textContent = `${body.category} · ${period}${body.rotationPeriod ? ' · Rotazione: ' + days(body.rotationPeriod) : ' · Rotazione non modellata'}`;
    const source = document.createElement('p'); source.className = 'map-source';
    source.textContent = surfaces[body.name] ? 'Mappa: Solar System Scope / INOVE, dati NASA · CC BY 4.0. Colori adattati.' : 'Superficie e forma illustrative: non una mappa fotografica.';
    $('info').append(facts, source);
  }
  if ((body?.minor || body?.parent?.minor) && !$('minor').checked) { $('minor').checked = true; updateMinorVisibility(); }
  if (body?.parent && !$('moons').checked) { $('moons').checked = true; updateMoonVisibility(); }
  updateDetail();
}
destination.addEventListener('change', () => focus(records.find(r => r.name === destination.value) || null, false, destination.value === 'outer'));
$('home').addEventListener('click', () => focus(null));
$('surface').addEventListener('click', () => { if (selected) focus(selected, true); });
$('pause').addEventListener('click', () => {
  paused = !paused; simulation.setPaused(paused, performance.now());
  $('pause').textContent = paused ? '▶ Riprendi' : 'Ⅱ Pausa'; $('pause').setAttribute('aria-pressed', String(paused));
});
function setSpeed(index) {
  index = Math.max(0, Math.min(SPEEDS.length - 1, index));
  $('speed').value = String(index);
  simulation.setRate(SPEEDS[index], performance.now());
  $('speed-value').textContent = speedLabel(SPEEDS[index]);
  $('speed').setAttribute('aria-valuetext', speedLabel(SPEEDS[index]));
  $('slower').disabled = index === 0; $('faster').disabled = index === SPEEDS.length - 1;
  $('time-note').textContent = index === 0 ? 'Tempo reale: i moti orbitali sono quasi impercettibili.' : 'Stesso fattore per pianeti, lune e rotazioni. A velocità elevate i moti rapidi possono sembrare fermi o invertiti.';
}
$('speed').addEventListener('input', () => setSpeed(Number($('speed').value)));
$('slower').addEventListener('click', () => setSpeed(Number($('speed').value) - 1));
$('faster').addEventListener('click', () => setSpeed(Number($('speed').value) + 1));
$('realtime').addEventListener('click', () => setSpeed(0));
$('day-speed').addEventListener('click', () => setSpeed(SPEEDS.indexOf(DAY)));
$('year-speed').addEventListener('click', () => setSpeed(SPEEDS.length - 1));
setSpeed(Number($('speed').value));
function updateDetail() {
  const high = $('detail').value === 'high';
  renderer.setPixelRatio(Math.min(devicePixelRatio, high ? 2 : 1.5));
  for (const body of records) {
    const segments = high && body === selected ? 96 : 40;
    if (body.mesh.geometry.parameters.widthSegments !== segments) {
      body.mesh.geometry.dispose(); body.mesh.geometry = new THREE.SphereGeometry(body.radius, segments, segments * .6 | 0);
    }
  }
  applySurface(byName.Terra);
}
$('detail').addEventListener('change', updateDetail);
$('orbits').addEventListener('change', () => { orbitGroup.visible = $('orbits').checked; updateMoonVisibility(); });
$('debris').addEventListener('change', () => { debrisGroup.visible = $('debris').checked; });
function updateMoonVisibility() {
  for (const r of records.filter(r => r.parent)) { r.anchor.visible = $('moons').checked; r.orbit.visible = $('moons').checked && $('orbits').checked; }
  if (!$('moons').checked && selected?.parent) focus(selected.parent);
}
$('moons').addEventListener('change', updateMoonVisibility);
function updateMinorVisibility() {
  for (const body of smallBodies) {
    body.anchor.visible = $('minor').checked;
    body.orbit.visible = $('minor').checked;
  }
  if (!$('minor').checked && (selected?.minor || selected?.parent?.minor)) focus(null);
}
$('minor').addEventListener('change', updateMinorVisibility);
controls.addEventListener('start', () => { transition = null; });
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
let pointerStart = null;
renderer.domElement.addEventListener('pointerdown', e => { pointerStart = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!pointerStart || e.button !== 0 || Math.hypot(e.clientX - pointerStart[0], e.clientY - pointerStart[1]) > 5) return;
  pointer.set(e.clientX / innerWidth * 2 - 1, 1 - e.clientY / innerHeight * 2);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pickable.filter(m => {
    const b = m.userData.body;
    return (!b.parent || $('moons').checked) && (!(b.minor || b.parent?.minor) || $('minor').checked);
  }))[0];
  if (hit) focus(hit.object.userData.body);
});
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

const world = new THREE.Vector3(), projected = new THREE.Vector3();
let lastTimeDisplay = 0;
function frame(now) {
  requestAnimationFrame(frame);
  elapsedDays = simulation.tick(now);
  for (const r of records) {
    if (r.distance) {
      const a = orbitalAngle(elapsedDays, r.period, r.phase);
      r.anchor.position.fromArray(orbitPoint(a, r.distance, r.eccentricity, r.inclination, r.node));
    }
    if (r.rotationPeriod) r.mesh.rotation.y = -orbitalAngle(elapsedDays, r.rotationPeriod, r.name === 'Terra' ? -1.7 : r.phase);
    if (r.tail) {
      r.tail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), r.anchor.position.clone().normalize());
      r.tail.material.opacity = Math.min(.65, 3 / r.anchor.position.length());
    }
  }
  asteroidBelt.rotation.y = orbitalAngle(elapsedDays, 1680);
  kuiperBelt.rotation.y = orbitalAngle(elapsedDays, 95000);
  if (now - lastTimeDisplay > 250) {
    const total = Math.floor(simulation.seconds), pad = n => String(n).padStart(2, '0');
    $('elapsed').textContent = `+ ${Math.floor(total / DAY).toLocaleString('it-IT')} g · ${pad(Math.floor(total / 3600) % 24)}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
    lastTimeDisplay = now;
  }
  scene.updateMatrixWorld(true);
  const target = selected ? selected.anchor.getWorldPosition(world) : world.set(0, 0, 0);
  if (transition) {
    const t = Math.min((now - transition.start) / 1250, 1), ease = t * t * (3 - 2 * t);
    camera.position.lerpVectors(transition.from, projected.copy(target).add(transition.offset), ease);
    controls.target.lerpVectors(transition.targetFrom, target, ease);
    if (t === 1) transition = null;
  } else if (selected) {
    const delta = projected.copy(target).sub(previousTarget);
    camera.position.add(delta); controls.target.add(delta);
  }
  previousTarget.copy(target);
  controls.update();
  camera.updateMatrixWorld();
  const occupied = [];
  const focusVector = selected ? selected.anchor.getWorldPosition(new THREE.Vector3()).sub(camera.position) : null;
  const sightline = new THREE.Vector3();
  const priority = label => label.body === selected ? 0 : label.body?.parent === selected || (selected?.parent && label.body?.parent === selected.parent) ? 1 : label.body?.category === 'Pianeti' || label.body === sun ? 2 : 3;
  for (const label of [...labelRecords].sort((a, b) => priority(a) - priority(b))) {
    const isMoon = label.type === 'moon';
    const show = $('names').checked && (label.type !== 'belt' || debrisGroup.visible) &&
      (!(label.body?.minor || label.body?.parent?.minor) || $('minor').checked) &&
      (!isMoon || ($('moons').checked && (selected === label.body || selected === label.body.parent || selected?.parent === label.body.parent)));
    label.object.getWorldPosition(world); projected.copy(world).project(camera);
    let visible = show && projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.1 && Math.abs(projected.y) < 1.1;
    if (visible && selected && label.body !== selected) {
      sightline.copy(world).sub(camera.position);
      const distance = sightline.length(); sightline.normalize();
      const along = focusVector.dot(sightline);
      const radius = selected.radius * Math.min(...selected.mesh.scale.toArray());
      if (along > 0 && along < distance && focusVector.lengthSq() - along * along < radius * radius) visible = false;
    }
    label.el.hidden = !visible;
    if (visible) {
      const offset = label.body ? Math.min(label.body === selected ? innerHeight * .45 : 45, label.body.radius / camera.position.distanceTo(world) * innerHeight * 1.1) + 7 : 0;
      const x = (projected.x * .5 + .5) * innerWidth + 9, y = (-projected.y * .5 + .5) * innerHeight - offset;
      label.width ??= label.el.offsetWidth;
      const box = { x, y, w: label.width + 8, h: 18 };
      visible = !occupied.some(b => x < b.x + b.w && x + box.w > b.x && y < b.y + b.h && y + box.h > b.y);
      label.el.hidden = !visible;
      if (visible) { occupied.push(box); label.el.style.transform = `translate(${x}px,${y}px)`; }
    }
  }
  renderer.render(scene, camera);
}
if (!textureFailure) $('status').textContent = '';
requestAnimationFrame(frame);

// Periodi medi in giorni terrestri; rotazione siderale, con segno retrogrado.
// Le distanze, le dimensioni e alcune eccentricità sono adattate alla scena.
export const surfaces = {
  Sole: 'sun', Mercurio: 'mercury', Venere: 'venus_atmosphere',
  Terra: 'earth_daymap', Luna: 'moon', Marte: 'mars', Giove: 'jupiter',
  Saturno: 'saturn', Urano: 'uranus', Nettuno: 'neptune',
};

export const rotations = {
  Sole: 25.38, Mercurio: 58.646, Venere: -243.025, Terra: .99726968,
  Marte: 1.025957, Giove: .41354, Saturno: .444, Urano: -.71833,
  Nettuno: .67125,
};

export const minorBodies = [
  { name: 'Cerere', category: 'Pianeti nani', radius: .13, color: '#a6a59b', distance: 9.35, period: 1682, rotationPeriod: .3781, eccentricity: .076, inclination: 10.6,
    description: 'Il più grande corpo della fascia degli asteroidi e il solo pianeta nano del sistema solare interno. La sonda Dawn ha osservato crateri e depositi brillanti di sali.' },
  { name: 'Plutone', category: 'Pianeti nani', radius: .23, color: '#bd9c87', distance: 29.4, period: 90560, rotationPeriod: -6.387, eccentricity: .16, inclination: 17.2,
    description: 'Un pianeta nano della fascia di Kuiper, esplorato da New Horizons nel 2015. Possiede ghiacci di azoto, montagne di ghiaccio d’acqua e cinque lune. La superficie qui è illustrativa, non la mappa di New Horizons.' },
  { name: 'Haumea', category: 'Pianeti nani', radius: .19, color: '#d0ceca', distance: 31.3, period: 103774, rotationPeriod: .1631, eccentricity: .12, inclination: 28.2, shape: [1.5, .7, .85],
    description: 'Un pianeta nano molto allungato, con una rotazione di circa quattro ore, un anello e due lune: Hiʻiaka e Namaka.' },
  { name: 'Makemake', category: 'Pianeti nani', radius: .19, color: '#b58671', distance: 33.5, period: 112897, rotationPeriod: .9375, eccentricity: .10, inclination: 29,
    description: 'Un pianeta nano freddissimo oltre Nettuno, con metano ghiacciato sulla superficie. È nota anche una piccola luna, soprannominata MK2, non rappresentata in questa selezione.' },
  { name: 'Eris', category: 'Pianeti nani', radius: .225, color: '#dddcd5', distance: 40, period: 203830, rotationPeriod: 15.786, eccentricity: .22, inclination: 44,
    description: 'Simile a Plutone per dimensioni, ma più massiccio. La sua orbita è molto inclinata. La luna Disnomia permette di misurarne la massa.' },
  { name: 'Quaoar', category: 'Oggetti transnettuniani', radius: .15, color: '#a97f6f', distance: 32.1, period: 104160, rotationPeriod: .7367, eccentricity: .04, inclination: 8,
    description: 'Un grande oggetto della fascia di Kuiper e candidato pianeta nano. Ha una luna, Weywot, e un sistema di anelli sorprendentemente lontano dalla superficie.' },
  { name: 'Orcus', category: 'Oggetti transnettuniani', radius: .13, color: '#b6b2a9', distance: 28.5, period: 89695, rotationPeriod: .434, eccentricity: .14, inclination: 20.6,
    description: 'Un oggetto transnettuniano in risonanza 3:2 con Nettuno, come Plutone. È un candidato pianeta nano; la sua luna si chiama Vanth.' },
  { name: 'Gonggong', category: 'Oggetti transnettuniani', radius: .17, color: '#ac7765', distance: 43, period: 202200, rotationPeriod: .933, eccentricity: .25, inclination: 30.7,
    description: 'Uno dei maggiori oggetti transnettuniani conosciuti, dalla superficie rossastra. È un candidato pianeta nano e possiede la luna Xiangliu, non rappresentata qui.' },
  { name: 'Sedna', category: 'Oggetti transnettuniani', radius: .14, color: '#ab6956', distance: 55, period: 4160000, rotationPeriod: .428, eccentricity: .30, inclination: 11.9,
    description: 'Un mondo remoto con un’orbita reale estremamente allungata, percorsa in oltre 11.000 anni. È un oggetto distaccato e candidato pianeta nano. Qui l’orbita è fortemente compressa per poterla esplorare.' },
  { name: 'Vesta', category: 'Asteroidi', radius: .10, color: '#aca196', distance: 8.9, period: 1325.9, rotationPeriod: .2226, eccentricity: .089, inclination: 7.1, shape: [1.15, .9, 1],
    description: 'Uno dei maggiori asteroidi, visitato dalla sonda Dawn. Ha una crosta basaltica e un enorme bacino d’impatto vicino al polo sud.' },
  { name: 'Pallade', category: 'Asteroidi', radius: .095, color: '#9c9b92', distance: 9.6, period: 1686, rotationPeriod: .3256, eccentricity: .14, inclination: 34.8, shape: [1.15, .9, 1],
    description: 'Uno dei più grandi asteroidi della fascia principale. La sua orbita è molto più inclinata di quella della maggior parte dei pianeti.' },
  { name: 'Igea', category: 'Asteroidi', radius: .085, color: '#797d79', distance: 10, period: 2033.8, rotationPeriod: .5755, eccentricity: .11, inclination: 3.8,
    description: 'Un grande asteroide scuro, approssimativamente sferico, nella parte esterna della fascia principale.' },
  { name: 'Psiche', category: 'Asteroidi', radius: .075, color: '#a79886', distance: 9.8, period: 1825.9, rotationPeriod: .1748, eccentricity: .13, inclination: 3.1, shape: [1.3, .8, 1],
    description: 'Un asteroide ricco di metalli, destinazione della missione NASA Psyche. Potrebbe conservare indizi sulla formazione dei nuclei planetari.' },
  { name: 'Bennu', category: 'Asteroidi', radius: .045, color: '#7e7970', distance: 6.5, period: 436.65, rotationPeriod: .179, eccentricity: .20, inclination: 6, shape: [1, .85, 1],
    description: 'Un piccolo asteroide vicino alla Terra. OSIRIS-REx ha riportato a Terra campioni della sua superficie nel 2023. In questa scena è fortemente ingrandito.' },
  { name: 'Halley', category: 'Comete', radius: .065, color: '#79756e', distance: 14, period: -27510, rotationPeriod: 2.2, eccentricity: .82, inclination: 18, shape: [1.7, .7, .8],
    description: 'La celebre cometa periodica ritorna ogni circa 76 anni e orbita in senso retrogrado. La coda illustrativa punta lontano dal Sole e diventa più evidente nelle sue vicinanze.' },
  { name: '67P / Churyumov–Gerasimenko', category: 'Comete', radius: .055, color: '#8c8578', distance: 8.4, period: 2352, rotationPeriod: .517, eccentricity: .55, inclination: 7, shape: [1.4, .8, .9],
    description: 'La cometa studiata da Rosetta e dal lander Philae. Il nucleo reale ha due lobi: qui è rappresentato da una forma semplificata, senza ricostruzione topografica.' },
];

export const extraMoons = {
  Plutone: [['Caronte', .115, .58, 6.387, '#b6aca3'], ['Stige', .025, .82, 20.162, '#bab5ac'], ['Notte', .035, 1.02, 24.855, '#c1bbb1'], ['Cerbero', .025, 1.22, 32.168, '#a9a49a'], ['Idra', .037, 1.42, 38.202, '#c6c1b5']],
  Eris: [['Disnomia', .055, .68, 15.786, '#9e9993']],
  Haumea: [['Namaka', .035, .58, 18.278, '#bdbdb5'], ['Hiʻiaka', .048, .86, 49.462, '#d1d0c6']],
  Quaoar: [['Weywot', .028, .70, 12.438, '#b4a99c']],
  Orcus: [['Vanth', .058, .55, 9.54, '#aa998a']],
};

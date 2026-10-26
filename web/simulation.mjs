export const DAY = 86400;
export const SPEEDS = [1, 2, 3, 5, 10, 30, 60, 300, 600, 1800, 3600, 21600, 43200, DAY, 3 * DAY, 7 * DAY, 12 * DAY, 30 * DAY, 90 * DAY, 365.25 * DAY];
export function speedLabel(rate, language = 'en') {
  const italian = language === 'it';
  const number = new Intl.NumberFormat(italian ? 'it-IT' : 'en-US', { maximumFractionDigits: 2 });
  const unit = rate < 60 ? `${number.format(rate)} s/s` : rate < 3600 ? `${number.format(rate / 60)} min/s` : rate < DAY ? `${number.format(rate / 3600)} h/s` : `${number.format(rate / DAY)} ${italian ? 'g/s' : 'd/s'}`;
  return `${number.format(rate)}× (${rate === 1 ? (italian ? 'tempo reale · ' : 'real time · ') : ''}${unit})`;
}

// Wall-clock delta, not frame counts: 1× stays real-time even on a slow GPU.
export class SimulationClock {
  constructor(now = 0, rate = 1) { this.last = now; this.rate = rate; this.seconds = 0; this.paused = false; }
  tick(now) {
    if (!this.paused) this.seconds += Math.max(0, now - this.last) / 1000 * this.rate;
    this.last = Math.max(this.last, now);
    return this.seconds / DAY;
  }
  setRate(rate, now) { this.tick(now); this.rate = rate; }
  setPaused(paused, now) { this.tick(now); this.paused = paused; }
}

export function orbitalAngle(days, period, phase = 0) {
  return phase + (days % Math.abs(period)) / period * Math.PI * 2;
}

// Kepler ellipse in the XZ plane, rotated by illustrative inclination/node.
export function orbitPoint(angle, distance, eccentricity = 0, inclination = 0, node = 0) {
  let E = angle % (Math.PI * 2);
  const M = E;
  for (let i = 0; i < 10; i++) E -= (E - eccentricity * Math.sin(E) - M) / (1 - eccentricity * Math.cos(E));
  const x = distance * (Math.cos(E) - eccentricity);
  const z = distance * Math.sqrt(1 - eccentricity ** 2) * Math.sin(E);
  const y = z * Math.sin(inclination);
  const flatZ = z * Math.cos(inclination);
  return [x * Math.cos(node) - flatZ * Math.sin(node), y, x * Math.sin(node) + flatZ * Math.cos(node)];
}

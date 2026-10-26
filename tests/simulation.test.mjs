import test from 'node:test';
import assert from 'node:assert/strict';
import { DAY, SPEEDS, speedLabel, SimulationClock, orbitalAngle, orbitPoint } from '../web/simulation.mjs';

const near = (a, b, tolerance = 1e-9) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);

test('1× follows elapsed real time, independently of frame rate and long gaps', () => {
  const slow = new SimulationClock(0), fast = new SimulationClock(0);
  slow.tick(60000);
  for (let now = 20; now <= 60000; now += 20) fast.tick(now);
  near(slow.seconds, 60); near(fast.seconds, 60);
  slow.tick(3600000); near(slow.seconds, 3600);
});

test('speed changes account for old and new rates at the exact boundary', () => {
  const clock = new SimulationClock(0);
  clock.setRate(2, 1000);
  clock.setRate(3, 2000);
  clock.tick(3000);
  near(clock.seconds, 6);
  clock.setRate(DAY, 3000);
  near(clock.tick(4000), 1 + 6 / DAY);
});

test('pause freezes time, including speed changes, and resume has no jump', () => {
  const clock = new SimulationClock(0, 2);
  clock.setPaused(true, 1000); clock.setRate(DAY, 2000); clock.tick(50000);
  near(clock.seconds, 2);
  clock.setPaused(false, 60000); clock.tick(61000);
  near(clock.seconds, DAY + 2);
});

test('an old animation timestamp cannot move the clock backwards or add time twice', () => {
  const clock = new SimulationClock(1000);
  clock.tick(900); clock.tick(1100);
  near(clock.seconds, .1);
});

test('selector includes 1×, 2×, 3× and unambiguous conversion labels', () => {
  assert.deepEqual(SPEEDS.slice(0, 3), [1, 2, 3]);
  assert.match(speedLabel(1), /tempo reale/);
  assert.match(speedLabel(2), /2×.*2 s\/s/);
  assert.match(speedLabel(DAY), /86\.400×.*1 g\/s/);
  assert.ok(SPEEDS.every((value, index) => index === 0 || value > SPEEDS[index - 1]));
});

test('planets and moons use their physical periods without a separate moon factor', () => {
  near(orbitalAngle(365.25 / 4, 365.25), Math.PI / 2);
  near(orbitalAngle(27.32 / 4, 27.32), Math.PI / 2);
  near(orbitalAngle(5.877 / 4, -5.877), -Math.PI / 2);
});

test('Kepler orbit stays finite, closes and has the expected perihelion/aphelion', () => {
  near(Math.hypot(...orbitPoint(0, 14, .82, .3, .6)), 14 * (1 - .82));
  near(Math.hypot(...orbitPoint(Math.PI, 14, .82, .3, .6)), 14 * (1 + .82));
  const first = orbitPoint(.7, 14, .82, .3, .6), next = orbitPoint(.7 + Math.PI * 2, 14, .82, .3, .6);
  first.forEach((value, i) => near(value, next[i]));
  for (let angle = -7; angle <= 7; angle += .1) assert.ok(orbitPoint(angle, 14, .82).every(Number.isFinite));
});

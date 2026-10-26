import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { minorBodies } from '../web/catalog.js';
import { resolveLanguage, messages, setLanguage, displayName, bodyDescription, englishDescriptions, t } from '../web/i18n.mjs';

test.afterEach(() => setLanguage('en', false));

test('English is the fallback; the primary Italian browser language selects Italian', () => {
  for (const language of ['en', 'en-GB', 'fr-FR', 'de-DE', undefined, '']) assert.equal(resolveLanguage(null, language), 'en');
  for (const language of ['it', 'it-IT', 'it-CH', 'IT-it']) assert.equal(resolveLanguage(null, language), 'it');
});

test('a valid manual preference overrides browser detection; invalid preferences are ignored', () => {
  assert.equal(resolveLanguage('en', 'it-IT'), 'en');
  assert.equal(resolveLanguage('it', 'en-US'), 'it');
  assert.equal(resolveLanguage('fr', 'it-IT'), 'it');
  assert.equal(resolveLanguage('invalid', 'fr-FR'), 'en');
});

test('all static translation keys have nonempty English and Italian messages', () => {
  for (const [key, translations] of Object.entries(messages)) {
    assert.equal(translations.length, 2, key);
    assert.ok(translations.every(text => typeof text === 'string' && text.trim()), key);
  }
  for (const file of ['index.html', 'credits.html']) {
    const html = readFileSync(new URL(`../web/${file}`, import.meta.url), 'utf8');
    for (const match of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) assert.ok(messages[match[1]], `Missing ${match[1]}`);
  }
});

test('planet, moon, belt and category names switch without changing catalog identifiers', () => {
  setLanguage('en', false);
  for (const [id, name] of [['Terra', 'Earth'], ['Caronte', 'Charon'], ['Notte', 'Nix'], ['Pianeti nani', 'Dwarf planets'], ['Fascia di Kuiper', 'Kuiper belt']]) assert.equal(displayName(id), name);
  setLanguage('it', false); assert.equal(displayName('Terra'), 'Terra');
});

test('every non-moon body has an English description and Italian descriptions remain available', () => {
  const planets = ['Sole', 'Mercurio', 'Venere', 'Terra', 'Marte', 'Giove', 'Saturno', 'Urano', 'Nettuno'];
  for (const name of [...planets, ...minorBodies.map(body => body.name)]) assert.ok(englishDescriptions[name]?.length > 30, name);
  for (const body of minorBodies) {
    setLanguage('en', false); assert.equal(bodyDescription(body), englishDescriptions[body.name]);
    setLanguage('it', false); assert.equal(bodyDescription(body), body.description);
  }
});

test('moon descriptions translate names, periods and retrograde explanations', () => {
  const moon = { name: 'Tritone', parent: { name: 'Nettuno' }, period: -5.877 };
  setLanguage('en', false);
  assert.match(bodyDescription(moon), /Triton, a natural satellite of Neptune/);
  assert.match(bodyDescription(moon), /5\.877 Earth days/);
  assert.match(bodyDescription(moon), /Retrograde/);
  setLanguage('it', false);
  assert.match(bodyDescription(moon), /Tritone, satellite naturale di Nettuno/);
  assert.match(bodyDescription(moon), /5,877 giorni terrestri/);
  assert.match(t('rotation', { period: '1 g' }), /Rotazione: 1 g/);
});

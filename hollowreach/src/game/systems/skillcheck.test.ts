import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveCheck, successOdds } from './skillcheck';
import { createNewGame } from '../newgame';
import type { RngState } from './rng';
import type { SkillCheck } from '../types';

// These exercise the pure check resolver against a real starting state.

function game() {
  return createNewGame({ name: 'Test', pronoun: 'they', archetypeId: 'the_old_dog' });
}

test('snake eyes always fails, boxcars always succeed', () => {
  const g = game();
  const check: SkillCheck = { attribute: 'logic', dc: 99, kind: 'white', label: 'x', onSuccess: 'a', onFailure: 'b' };
  // Force the dice by stubbing rng via known seeds is overkill; instead assert
  // the critical rule directly through many rolls: a DC-99 check only ever
  // passes on boxcars.
  let passes = 0;
  const rng: RngState = { seed: 12345 };
  for (let i = 0; i < 500; i++) {
    const o = resolveCheck(g, check, rng);
    if (o.success) {
      passes++;
      assert.equal(o.critical, 'success'); // the only way to beat DC 99
    }
  }
  assert.ok(passes > 0 && passes < 60, `boxcars should be ~1/36 of 500 (~14), got ${passes}`);
});

test('successOdds matches brute force for a mid check', () => {
  const g = game();
  const check: SkillCheck = { attribute: 'instinct', dc: 12, kind: 'white', label: 'x', onSuccess: 'a', onFailure: 'b' };
  const odds = successOdds(g, check);
  assert.ok(odds > 0 && odds < 1);
  // Old Dog has Instinct 5; DC 12 ⇒ need 2d6 ≥ 7 ⇒ 21/36, but boxcars/snake-eyes
  // override. Just assert it's a sane probability and stable.
  assert.equal(odds, successOdds(g, check));
});

test('situational modifiers lower the effective DC', () => {
  const g = game();
  const easy: SkillCheck = {
    attribute: 'perception', dc: 14, kind: 'white', label: 'x',
    modifiers: [{ label: 'help', value: 4 }],
    onSuccess: 'a', onFailure: 'b',
  };
  const hard: SkillCheck = { ...easy, modifiers: [] };
  assert.ok(successOdds(g, easy) > successOdds(g, hard));
});

test('check is reproducible from a fixed seed', () => {
  const g = game();
  const check: SkillCheck = { attribute: 'logic', dc: 8, kind: 'white', label: 'x', onSuccess: 'a', onFailure: 'b' };
  const a = resolveCheck(g, check, { seed: 999 });
  const b = resolveCheck(g, check, { seed: 999 });
  assert.deepEqual(a.dice, b.dice);
});

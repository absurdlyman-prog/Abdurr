import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNewGame } from '../../newgame';
import { Content } from '../../content';
import { applyEffects } from '../dialogue/effects';
import { theoryStatuses, contradictionStatuses, resolveContradiction, commitTheory } from './CaseBoard';

// End-to-end-ish deduction test: learn clues, reconcile a contradiction into a
// deduced clue, then confirm the resulting theory becomes available and can be
// committed with the right ending tag.

function game() {
  return createNewGame({ name: 'Test', pronoun: 'they', archetypeId: 'the_clerk' });
}

test('reconciling a contradiction mints a deduced clue and unlocks a theory', () => {
  const g = game();
  const def = Content.case('drowned_clerk')!;

  // No theory is available with zero clues.
  assert.ok(theoryStatuses(g, def).every((t) => !t.available));

  // Learn the two halves of the dry-drowning contradiction.
  applyEffects(g, [
    { op: 'learnClue', key: 'clue_wet_lungs' },
    { op: 'learnClue', key: 'clue_no_wound' },
  ]);

  const contra = contradictionStatuses(g, def).find((c) => c.id === 'contra_dry_drowning')!;
  assert.equal(contra.active, true);
  assert.equal(contra.resolved, false);

  // Reconcile it → mints clue_moved_body.
  const ok = resolveContradiction(g, def, 'contra_dry_drowning');
  assert.equal(ok, true);
  assert.ok(g.knownClues.includes('clue_moved_body'));

  // The Syndicate theory needs ledger + moved_body; add the ledger.
  applyEffects(g, [{ op: 'learnClue', key: 'clue_ledger_paid' }]);
  const syndicate = theoryStatuses(g, def).find((t) => t.theory.id === 'theory_syndicate')!;
  assert.equal(syndicate.available, true);
  assert.equal(syndicate.shaky, false);

  // Commit it; the case closes with the right ending tag.
  assert.equal(commitTheory(g, def, 'theory_syndicate'), true);
  assert.equal(g.cases['drowned_clerk'].closed, true);
  assert.equal(g.flags['drowned_clerk__ending'], 'syndicate');
});

test('a theory contradicted by held evidence is marked shaky', () => {
  const g = game();
  const def = Content.case('drowned_clerk')!;
  applyEffects(g, [
    { op: 'learnClue', key: 'clue_wet_lungs' },
    { op: 'learnClue', key: 'clue_widow_debt' },
    { op: 'learnClue', key: 'clue_no_wound' },
  ]);
  resolveContradiction(g, def, 'contra_dry_drowning'); // now we know the body was moved
  // "He Let Go" (accident) is weakened by clue_moved_body.
  const accident = theoryStatuses(g, def).find((t) => t.theory.id === 'theory_accident')!;
  assert.equal(accident.available, true);
  assert.equal(accident.shaky, true);
});

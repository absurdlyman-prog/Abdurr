# The HOLLOWREACH World Bible

> Everything below is original to this project.

## The city

**Hollowreach** is a decaying post-industrial port-metropolis built across a
silting river delta where it meets a cold northern sea. For two centuries it was
the empire's second mouth — everything that entered the country by water passed
through its locks, was counted in its ledgers, and was carried on the backs of
its dockworkers. Then the harbour began to die: the river dumped its silt faster
than the city could dredge it, the deepwater berths shallowed, the great shipping
cartel collapsed under its own debt, and in the winter of '71 a storm-surge broke
the lower seawall and never fully gave the streets back.

What remains is a city of **three water-marks**: the line the tide reaches now,
the line the flood reached in '71, and the line the old prosperity reached and
fell from. People in Hollowreach measure their lives against all three.

## Historical timeline

| Year (local reckoning) | Event |
| --- | --- |
| **−210** | Founding of the first lock and customs-house at the river mouth. |
| **−140 to −60** | The "Counting Century." Hollowreach becomes the empire's clearing port; the **Harbour Guild** forms to organize (and monopolize) dock labour. |
| **−40** | The gasworks are built; the city is the first in the region to light its streets. Public light becomes a civic religion — *"a lit street is a safe street."* |
| **−12** | Peak prosperity. The Spindles district — mills and crane-towers — employs a third of the city. |
| **0 (the Reckoning)** | The shipping cartel collapses overnight on falsified manifests. Thousands of dockers laid off in a season. The Guild survives but never recovers its grip. |
| **+14** | The river's silting passes the point of economic dredging. Deepwater traffic begins routing elsewhere. |
| **+29** | The public gasworks, bankrupt, is sold to a private consortium that becomes the **Lantern Syndicate**. Light stops being a right and starts being a meter. |
| **+38 (the year '71 by old calendar)** | The Great Surge. The lower seawall fails; the **Drowned Quarter** is permanently half-flooded. The **Drowned Quarter Mutual** is born out of the bailing-lines. |
| **+41** | The municipal–corporate **Reclamation Office** is chartered to "reclaim" the flooded districts — i.e. to pump, survey, and re-sell them. |
| **+44 (now)** | The present. The Civil Watch has not crossed into the Drowned Quarter in three years. A clerk named Tomas Kessler is found dead on the dawn quay. |

## The districts (and the map)

The city descends, physically and socially, from the dry gentry heights in the
north to the drowned streets at the river mouth in the south. The four districts
the opening case takes place across:

```
        N  (dry, lit, gentry — beyond the current build)
        │
   ┌────┴─────────────┐
   │  GASLIGHT ROWS    │  merchant class · Lantern Syndicate
   │  neon over wet     │  "a different city after dark"
   │  cobbles           │
   └────┬──────────────┘
        │  (rows_night)
   ┌────┴──────────────┐
   │   THE SPINDLES     │  labour class · Harbour Guild
   │  dead crane-towers │  rust, salt, night barges
   │  & gutted mills    │
   └────┬──────────────┘
        │  (spindle_yard)
   ┌────┴──────────────┐
   │  THE DROWNED       │  the drowned · Drowned Quarter Mutual
   │  QUARTER           │  plank walkways over black water
   │  ┌─ Dawn Quay ──┐  │  (quay_dawn — where the body lies)
   │  └─ Mutual Hall ┘  │  (mutual_hall)
   └────────────────────┘
        S  (the river mouth, the sea, the tide)
```

| District | Class | Faction | Feel |
| --- | --- | --- | --- |
| **The Drowned Quarter** | the drowned | Drowned Quarter Mutual | First floors given to the tide; light rationed; mutual aid the only law. |
| **The Spindles** | labour | Harbour Guild | Forests of dead cranes; men who remember the whistles; night-barge work, on and off the books. |
| **The Gaslight Rows** | merchant | Lantern Syndicate | Neon reflections that look better than what they reflect; the only dry awnings in the rain. |
| *(North heights — gentry)* | gentry | Reclamation Office patrons | Dry basements, paid for by pumping someone else's home into the sea. (Designed; not in the slice.) |

## The factions

Detailed profiles live in `content/world/factions.json`; in brief:

- **The Harbour Guild** — *"The tide pays its debts. So will you."* A proud,
  bankrupt dockworkers' guild that still controls who unloads what — and who
  disappears under the quay. Old loyalty, older grudges.
- **The Reclamation Office** — *"Drain it, map it, sell it."* The
  municipal-corporate hybrid evicting the flooded districts one survey-stamp at a
  time, in the bloodless dialect of permits.
- **The Lantern Syndicate** — *"Light is a service. Darkness is negotiable."* The
  cartel that bought the failing gasworks and meters every lit street. Keeps the
  merchant rows blazing and the Drowned Quarter dark — unless you can pay.
- **The Drowned Quarter Mutual** — *"We bail each other out. No one else will."* A
  mutual-aid network grown from the flood years: the soup line, the unlicensed
  clinic, and a quiet ledger of every favour owed. Idealistic, exhausted, one bad
  winter from becoming something harder.
- **The Civil Watch** — *"Order, on paper."* Under-paid, half-bought police
  stretched across a city that stopped believing in them. You are, nominally, one
  of them.

**Reputation spillover** is encoded: helping the Guild nudges its ally (the
Mutual) up and its rivals (the Reclamation Office, the Syndicate) down. You cannot
serve the Quarter and the Syndicate both.

## Economic system

Hollowreach runs on three overlapping economies the player can read and exploit:

1. **The wage economy** — what's left of dock labour, controlled by the Guild's
   cargo chits. Scarce and shrinking.
2. **The light economy** — the Syndicate meters illumination by the street. Light
   is literally a class marker; a lit window in the Drowned Quarter is evidence
   that *someone is paying in secret* — which is the financial spine of the
   opening case.
3. **The favour economy** — the Mutual's ledger of debts owed. Down here a
   punched ration card or a bailed-out neighbour is more spendable than coin. The
   victim drowned (financially) in this economy before he drowned in the harbour.

## Cultural systems

- **The Drowned God.** Quarter folklore says the '71 flood didn't only take
  houses — it took something owed worship, and left a hunger in the water that
  keeps people's memories when they go under. Whether it's "true" is beside the
  point: people act on it, bail for it, and kill for it, so to a detective the
  belief *is* evidence. (Internalizable as the thought **The Drowned God**.)
- **Three water-marks.** Social shorthand: people describe others by which mark
  they live above — *"a second-mark family"* means flood-survivors, *"first-mark"*
  means the truly drowned.
- **Light as virtue.** A century of *"a lit street is a safe street"* propaganda
  means darkness carries moral weight in Hollowreach; the Syndicate weaponizes it.

## The protagonist's hook

You are an amnesiac who woke on the quay beside the body, carrying a Watch badge,
a waterlogged notebook in your own frightened hand, and — if your Perception is
sharp enough to find it — a brass lighter engraved **V.K.** Your hands know the
strike-wheel before your mind agrees. One of the five solution-paths to the case
accuses *you*. Finding out who drowned the clerk and finding out who you were
before the water are, it turns out, the same investigation.

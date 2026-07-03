// HUSHWATER — story data: skills, speakers, thoughts, scenes, dialogue graph.
// Text conventions: *italic*, **bold**. Line = {sp, text, req?}.
// sp: 'nar' | 'you' | 'sk:<skill>' | speaker id.

export const SKILLS = {
  logic: {
    name: 'LOGIC', color: '#7cc4ff',
    desc: 'The cold arithmetic of the world. Sees the machine under the fog.',
  },
  perception: {
    name: 'PERCEPTION', color: '#ffd36e',
    desc: 'Salt-crust, scratch-marks, the tremor in a liar’s lip. Nothing hides.',
  },
  empathy: {
    name: 'EMPATHY', color: '#ff9ddd',
    desc: 'Other people’s weather. You get rained on by hearts that aren’t yours.',
  },
  deep: {
    name: 'THE DEEP', color: '#b79cff',
    desc: 'The dream under the water. It speaks to lamps, mirrors, and the Hush.',
  },
  volition: {
    name: 'VOLITION', color: '#8fe8b7',
    desc: 'The hand that keeps you in one piece. The quiet, stubborn *no*.',
  },
  authority: {
    name: 'AUTHORITY', color: '#ff8a5c',
    desc: 'The voice that makes rooms go quiet. Costs something every time.',
  },
  hunger: {
    name: 'HUNGER', color: '#e0c25c',
    desc: 'Appetite, thirst, warmth, oblivion. It only ever wants *one more*.',
  },
};

export const ARCHETYPES = [
  {
    id: 'thinker', name: 'THE ARITHMETICIAN',
    epithet: 'A mind like a lighthouse: one bright beam, darkness everywhere else.',
    skills: { logic: 5, perception: 4, empathy: 2, deep: 2, volition: 3, authority: 2, hunger: 2 },
    hp: 4, spirit: 5,
  },
  {
    id: 'wound', name: 'THE OPEN WOUND',
    epithet: 'You feel everything. The town will walk through you like weather.',
    skills: { logic: 2, perception: 3, empathy: 5, deep: 5, volition: 2, authority: 1, hunger: 2 },
    hp: 3, spirit: 6,
  },
  {
    id: 'fist', name: 'THE HARBOUR FIST',
    epithet: 'Bones like bollards. You hold; the rope frays first.',
    skills: { logic: 2, perception: 2, empathy: 2, deep: 1, volition: 5, authority: 5, hunger: 3 },
    hp: 6, spirit: 3,
  },
];

export const SPEAKERS = {
  nar: { name: '', color: '#c9c4b4', seed: 0 },
  you: { name: 'YOU', color: '#e8e2cf', seed: 11 },
  reflection: { name: 'THE REFLECTION', color: '#9fb8c9', seed: 23 },
  lamp: { name: 'THE ANCIENT LAMP', color: '#ffd9a0', seed: 31 },
  maren: { name: 'MAREN VASK', color: '#d98f66', seed: 47 },
  pip: { name: 'PIP', color: '#a8d8a0', seed: 59 },
  aulis: { name: 'AULIS, BELLKEEPER', color: '#8fa8d9', seed: 71 },
  hush: { name: 'THE HUSH', color: '#cfcfd6', seed: 83 },
};

export const THOUGHTS = {
  coatfits: {
    name: 'The Coat Fits',
    quote: '“Whoever you were, *you* are the one standing here.”',
    effect: '+1 VOLITION, +1 max SPIRIT',
    apply(s) { s.skills.volition += 1; s.spiritMax += 1; s.spirit = Math.min(s.spirit + 1, s.spiritMax); },
  },
  lampargument: {
    name: 'The Lamp Argument',
    quote: '“The sea keeps no books. Someone has to choose what the light means.”',
    effect: '+1 LOGIC',
    apply(s) { s.skills.logic += 1; },
  },
  inventory: {
    name: 'Pip’s Inventory of Lost Things',
    quote: '“A spoon. A door key. A photograph of nobody. Somebody loved all of it.”',
    effect: '+1 EMPATHY',
    apply(s) { s.skills.empathy += 1; },
  },
  saltineverything: {
    name: 'Salt In Everything',
    quote: '“You reached into the nothing and the nothing reached back, politely.”',
    effect: '+2 THE DEEP, −1 max SPIRIT',
    apply(s) { s.skills.deep += 2; s.spiritMax = Math.max(1, s.spiritMax - 1); s.spirit = Math.min(s.spirit, s.spiritMax); },
  },
};

// Scene palettes drive the canvas painter. Colors: sky top, sky bottom, fog, water, accent.
export const SCENES = {
  void:   { top: '#050308', bot: '#0d0716', fog: '#1a1030', water: null, accent: '#b79cff', rain: 0, motes: 26, fogAmt: 0.5, beam: false },
  lamp:   { top: '#101b22', bot: '#22333a', fog: '#31434a', water: null, accent: '#ffd9a0', rain: 0, motes: 40, fogAmt: 0.35, beam: false, ray: true },
  stair:  { top: '#0b1210', bot: '#17231e', fog: '#22322b', water: null, accent: '#9fb8c9', rain: 0, motes: 18, fogAmt: 0.45, beam: false },
  quay:   { top: '#3a2f2a', bot: '#6e5140', fog: '#8a7563', water: '#2e3438', accent: '#d98f66', rain: 1, motes: 20, fogAmt: 0.6, beam: false, tower: true },
  church: { top: '#0d1a26', bot: '#1c3444', fog: '#28495c', water: '#152530', accent: '#8fa8d9', rain: 0, motes: 34, fogAmt: 0.5, beam: false, ray: true },
  hush:   { top: '#3c3c44', bot: '#7d7d86', fog: '#a8a8b0', water: null, accent: '#cfcfd6', rain: 0, motes: 46, fogAmt: 0.85, beam: false, drift: true },
  dawn:   { top: '#472f3a', bot: '#a06a4e', fog: '#c99a76', water: '#3a3f45', accent: '#ffd36e', rain: 0, motes: 30, fogAmt: 0.5, beam: false, tower: true },
  light:  { top: '#402d3d', bot: '#b07a52', fog: '#d9ac82', water: '#434a52', accent: '#ffe9b0', rain: 0, motes: 44, fogAmt: 0.4, beam: true, tower: true },
};

export const START = 'v1';

const T = (s) => s; // template helper for readability

export const NODES = {

  /* ---------------- PROLOGUE ---------------- */

  v1: {
    scene: 'void',
    lines: [
      { sp: 'sk:deep', text: T('There is a sound the world makes when it forgets itself. Not silence — silence is a thing, and this is the *absence* of a thing. You have been floating in it for some time. It is warm. It asks for nothing.') },
      { sp: 'sk:deep', text: T('You could stay. Plenty do.') },
      { sp: 'sk:volition', text: T('Get up.') },
      { sp: 'sk:deep', text: T('Rude.') },
      { sp: 'sk:volition', text: T('There is a floor under you. That means there is a world. Where there is a world, there is work. **Get up.**') },
    ],
    choices: [
      { label: 'Open your eyes.', goto: 'arch' },
      { label: 'Stay in the dark. It’s warm here.', goto: 'v2', once: true },
    ],
  },

  v2: {
    scene: 'void',
    lines: [
      { sp: 'sk:deep', text: T('*Yes.* Sink. The dark holds you the way water holds a drowned bell — completely, and without judgement.') },
      { sp: 'nar', text: T('For one long minute, nothing. It is, honestly, wonderful. Then something in your chest — small, stubborn, unimpressed — clears its throat.') },
      { sp: 'sk:volition', text: T('Done? Good. The dark doesn’t love you. The dark doesn’t *anything* you. Up.') },
    ],
    choices: [
      { label: 'Fine. Open your eyes.', goto: 'arch' },
    ],
  },

  arch: {
    scene: 'void',
    lines: [
      { sp: 'nar', text: T('Before the light comes, the question. It arrives without words, the way cold arrives: **who is it that rises?**') },
    ],
    choices: [
      { label: 'THE ARITHMETICIAN', sub: 'Logic · Perception. A mind like a lighthouse: one bright beam, darkness everywhere else.', goto: 'wake', do(s) { s.applyArchetype('thinker'); } },
      { label: 'THE OPEN WOUND', sub: 'Empathy · The Deep. You feel everything. The town will walk through you like weather.', goto: 'wake', do(s) { s.applyArchetype('wound'); } },
      { label: 'THE HARBOUR FIST', sub: 'Volition · Authority. Bones like bollards. You hold; the rope frays first.', goto: 'wake', do(s) { s.applyArchetype('fist'); } },
    ],
  },

  /* ---------------- THE LAMP ROOM ---------------- */

  wake: {
    scene: 'lamp',
    lines: [
      { sp: 'nar', text: T('Grey light. A round room with a wall of salt-bleared glass, and in its centre, on a brass pillar, an enormous dead lamp — a lighthouse lamp, its lens dull as a shark’s eye. Gulls somewhere. The floor tilts, or you do.') },
      { sp: 'nar', text: T('You are lying on bare boards under a heavy oilskin coat that is not, as far as you know, yours. As far as you know is not far. Your name, your face, your reasons — the shelf is bare.') },
      { sp: 'sk:hunger', text: T('Inventory of the body: mouth like a tide-pool, skull hosting a small regatta. We require *breakfast*, or failing that, whatever was in that green bottle by the wall.'), req: (s) => s.skills.hunger >= 3 },
      { sp: 'sk:perception', text: T('The lamp’s storm-shutter is drawn. The lever that draws it wears fresh scratches — bright metal in old paint. Someone pulled it hard, and recently.'), req: (s) => s.skills.perception >= 4 },
      { sp: 'sk:logic', text: T('A lighthouse exists to do exactly one thing. This one is not doing it. Begin there.') },
    ],
    lines2: [
      { sp: 'nar', text: T('The lamp room again. The dead lens watches you like something waiting for its cue.') },
    ],
    choices: [
      { label: 'Examine the great lamp.', goto: 'lamp1' },
      { label: 'Search the coat you woke under.', goto: 'coat1' },
      { label: 'Look out through the glass.', goto: 'window1', once: true },
      { label: 'Take the stairs down.', goto: 'mirror', if: (s) => s.flags.sawLamp || s.flags.sawCoat },
    ],
  },

  lamp1: {
    scene: 'lamp',
    lines: [
      { sp: 'nar', text: T('Up close the lamp is a cathedral of brass and prisms, taller than you. Its wick chamber is cold. The storm-shutter — an iron curtain meant for hurricanes — is drawn fully across the lens, which is like finding a man with his own hands over his own eyes.') },
      { sp: 'sk:deep', text: T('It’s not asleep. Old machines don’t sleep, they *grieve*. This one is mid-eulogy. Listen — under the gull-noise — the filament is still saying something.'), req: (s) => s.skills.deep >= 4 },
    ],
    choices: [
      { label: '[THE DEEP] Put your ear to the cold glass. Listen to the filament.', check: { id: 'ck_lamp', skill: 'deep', dc: 8, pass: 'lampP', fail: 'lampF' } },
      { label: 'Try the shutter lever.', goto: 'lever1', once: true },
      { label: 'Step away.', goto: 'wake', do(s) { s.flags.sawLamp = true; } },
    ],
  },

  lampP: {
    scene: 'lamp',
    lines: [
      { sp: 'nar', text: T('Glass against your cheek. Cold. Then — not sound exactly. Warmth arriving in words, the way light would talk if light were very old and very tired.') },
      { sp: 'lamp', text: T('SEVENTY-ONE YEARS I BURNED. STORMS I HAVE OUTSTARED. AND THEN A HAND CAME — A HAND THAT KNEW THE WEIGHT OF MY LEVER, KNEW IT LIKE ITS OWN WRIST — AND DREW THE CURTAIN ACROSS MY EYE.') },
      { sp: 'lamp', text: T('IT WAS NOT DONE IN MADNESS. THE HAND WAS *STEADY*. THAT IS THE PART I KEEP RETURNING TO, IN THE DARK. THE HAND WAS STEADY.') },
      { sp: 'sk:logic', text: T('A hand that knew the lever’s weight. Not a stranger, then. The keeper darkened his own lamp — deliberately, calmly. File that. It will cut something open later.') },
      { sp: 'sk:deep', text: T('Ask it nothing else. Grief this size, you don’t poke at. You just witness it.') },
    ],
    choices: [
      { label: 'Step back from the lens.', goto: 'wake', do(s) { s.flags.sawLamp = true; s.flags.lampHeard = true; } },
    ],
  },

  lampF: {
    scene: 'lamp',
    lines: [
      { sp: 'nar', text: T('Glass against your cheek. Cold. Nothing. Just your own pulse, loud and stupid, and the sudden crawling certainty that you are a grown adult pressing your face to a lamp, hoping it will talk.') },
      { sp: 'sk:volition', text: T('It might have. It didn’t. Don’t spiral about it — the world declines to be magical roughly forty times a day.') },
    ],
    choices: [
      { label: 'Step back, with what remains of your dignity.', goto: 'wake', do(s) { s.flags.sawLamp = true; s.damage('spirit', 1, 'The lamp said nothing.'); } },
    ],
  },

  lever1: {
    scene: 'lamp',
    lines: [
      { sp: 'nar', text: T('You put your hand on the shutter lever. And here is the horrible thing: your fingers settle into the grip without being told. The lever’s weight, its half-inch of slack before the catch — your body *remembers* it, the way a body remembers stairs in its childhood home.') },
      { sp: 'sk:volition', text: T('Steady. A fact is not a verdict.') },
      { sp: 'sk:deep', text: T('Your hand has been here before, sailor. Your hand knows this machine like its own wrist. Where was *the rest of you*?') },
    ],
    choices: [
      { label: 'Take your hand off the lever.', goto: 'wake', do(s) { s.flags.sawLamp = true; s.flags.leverKnown = true; } },
    ],
  },

  coat1: {
    scene: 'lamp',
    lines: [
      { sp: 'nar', text: T('The coat is keeper’s issue: oilskin, wool-lined, heavy as a guilty conscience. Inside the collar, a leather name-tag. The name has been scratched out — not worn out, *scratched*, in deliberate strokes, by someone with a blade and an opinion.') },
      { sp: 'nar', text: T('In the left pocket: a heavy brass key, cathedral-cold. You take it.') },
      { sp: 'sk:hunger', text: T('Right pocket. *Right pocket.* — A flask. Empty. Bone, ash, betrayal. Somebody drank our future.'), req: (s) => s.skills.hunger >= 3 },
      { sp: 'sk:empathy', text: T('Someone scratched their own name out of their own coat. That’s not covering tracks — you’d just burn the tag. That’s *punishment*. Someone stopped being able to bear their own name.'), req: (s) => s.skills.empathy >= 4 },
    ],
    choices: [
      { label: '[PERCEPTION] Go through it again, seam by seam.', check: { id: 'ck_coat', skill: 'perception', dc: 7, pass: 'coatP', fail: 'coatF' } },
      { label: 'Put the coat on. It’s cold.', goto: 'wake', do(s) { s.flags.sawCoat = true; s.flags.hasKey = true; s.flags.wearCoat = true; } },
    ],
  },

  coatP: {
    scene: 'lamp',
    lines: [
      { sp: 'nar', text: T('Seam by seam. And there — sewn into the lining like a splinter under skin — a torn corner of paper. Logbook stock. Four words and a half survive, in a tight, careful hand:') },
      { sp: 'nar', text: T('*“…so they would turn back. God forgive the arith—”*') },
      { sp: 'sk:logic', text: T('*So they would turn back.* The darkness had a purpose, and the purpose was to make someone turn around. A dark lighthouse as a message. Keep this scrap. It is the corner of the whole picture.') },
    ],
    choices: [
      { label: 'Pocket the scrap and put the coat on.', goto: 'wake', do(s) { s.flags.sawCoat = true; s.flags.hasKey = true; s.flags.wearCoat = true; s.flags.scrapFound = true; } },
    ],
  },

  coatF: {
    scene: 'lamp',
    lines: [
      { sp: 'nar', text: T('Wool, salt, sand in the seams, a button hanging by a thread. If the coat is keeping secrets, it keeps them better than you find them.') },
    ],
    choices: [
      { label: 'Put the coat on anyway. It’s cold.', goto: 'wake', do(s) { s.flags.sawCoat = true; s.flags.hasKey = true; s.flags.wearCoat = true; } },
    ],
  },

  window1: {
    scene: 'lamp',
    lines: [
      { sp: 'nar', text: T('You wipe a porthole in the salt-scum. Below: a grey harbour town, roofs like wet slate scales, smoke rising thin and undecided. On the rocks at the harbour mouth — a ship. Was a ship. The sea is taking it apart with the patience of a good accountant. A ferry, by the bones of it.') },
      { sp: 'nar', text: T('And beyond the strait, where the horizon should be, there is… nothing. Not fog, not haze. A standing wall of grey **nothing**, soft-edged, tall as weather. Looking at it feels like forgetting a word.') },
      { sp: 'sk:deep', text: T('The Hush. You know its name the way you know your heartbeat — no memory required. It has been eating the horizon for a year, and the horizon has not once complained.') },
      { sp: 'sk:empathy', text: T('There are small figures on the quay standing very still, facing the wreck. Nobody stands like that around old news. The grief down there is *fresh*.'), req: (s) => s.skills.empathy >= 3 },
    ],
    choices: [
      { label: 'Enough. Face the room again.', goto: 'wake', do(s) { s.flags.sawWreck = true; } },
    ],
  },

  /* ---------------- THE STAIR & MIRROR ---------------- */

  mirror: {
    scene: 'stair',
    lines: [
      { sp: 'nar', text: T('The stairs corkscrew down through the tower’s cold gullet. On the first landing, bolted to the wall, a shaving mirror — fogged with condensation, waiting like an appointment.') },
      { sp: 'sk:deep', text: T('You could pass it. People pass mirrors all the time. Cowards, mostly.') },
    ],
    choices: [
      { label: 'Wipe the mirror.', goto: 'mirror2', once: true },
      { label: 'Leave the mirror be. Keep descending.', goto: 'quay' },
    ],
  },

  mirror2: {
    scene: 'stair',
    lines: [
      { sp: 'nar', text: T('Your palm squeals across the glass. A face. Weathered, salt-cured, eyes set deep as pilings — a face like a dock that has taken a hundred winters and asked for nothing. It is a stranger. It is also, unhelpfully, you.') },
      { sp: 'reflection', text: T('…Well. Look who finally came downstairs.') },
      { sp: 'sk:volition', text: T('The reflection’s mouth moved half a beat after yours didn’t. Noted, and *not* dwelt upon.') },
    ],
    choices: [
      { label: '“Do I know you?”', goto: 'mirror3', once: true },
      { label: '[AUTHORITY] “State your name. Now.”', goto: 'mirror4', once: true },
      { label: '[VOLITION] Hold your own gaze. Do not look away first.', check: { id: 'ck_mirror', skill: 'volition', dc: 9, red: true, pass: 'mirrorP', fail: 'mirrorF' } },
      { label: 'Walk away from the glass.', goto: 'quay' },
    ],
  },

  mirror3: {
    scene: 'stair',
    lines: [
      { sp: 'reflection', text: T('Knew. Past tense, sailor. You knew me the way you knew the tides — by heart, without thinking. Then you put the heart somewhere and forgot the somewhere.') },
      { sp: 'reflection', text: T('Ask me what you’re really asking. Ask me if you did it.') },
      { sp: 'sk:empathy', text: T('It — you — *wants* to be asked. There is something under that weathered face straining like a dog at a fence.') },
    ],
    choices: [
      { label: '“Did I do it?”', goto: 'mirror5', once: true },
      { label: '[VOLITION] Hold your own gaze. Do not look away first.', check: { id: 'ck_mirror', skill: 'volition', dc: 9, red: true, pass: 'mirrorP', fail: 'mirrorF' } },
      { label: 'Walk away from the glass.', goto: 'quay' },
    ],
  },

  mirror4: {
    scene: 'stair',
    lines: [
      { sp: 'reflection', text: T('*Ha.* There’s the harbour voice. You used to stop dock brawls with that voice.') },
      { sp: 'reflection', text: T('My name is scratched out, officer. Same blade as yours. You want a name, go earn one — there’s a whole town of people down there who know your face better than you do.') },
      { sp: 'sk:authority', text: T('It mocked you, but note: it *answered*. Even your own ghost snaps to when you use the voice. Good. We are not entirely furniture yet.') },
    ],
    choices: [
      { label: '“Did I do it?”', goto: 'mirror5', once: true },
      { label: '[VOLITION] Hold your own gaze. Do not look away first.', check: { id: 'ck_mirror', skill: 'volition', dc: 9, red: true, pass: 'mirrorP', fail: 'mirrorF' } },
      { label: 'Enough of this. Descend.', goto: 'quay' },
    ],
  },

  mirror5: {
    scene: 'stair',
    lines: [
      { sp: 'nar', text: T('The reflection holds very still. Water ticks somewhere down the stairwell, counting.') },
      { sp: 'reflection', text: T('I remember the lever. I remember it was heavy, and then it wasn’t. Everything before and after is — grey. You want a verdict, sailor, and all I’ve got is a *weight*.') },
      { sp: 'sk:logic', text: T('Even the inside witness only has the lever. Conclusion: the answer isn’t in here. It’s down there, in the town, in other people’s memories of you. Go be investigated by yourself.') },
    ],
    choices: [
      { label: 'Descend to the quay.', goto: 'quay' },
    ],
  },

  mirrorP: {
    scene: 'stair',
    lines: [
      { sp: 'nar', text: T('You look at the stranger and the stranger looks back and neither of you blinks, and somewhere in the middle of that held breath the glass stops being a border. It’s just you. It was always just you — salt-cured, scratched-out, *present*.') },
      { sp: 'sk:volition', text: T('Whoever you were — whatever the lever weighed — **you are the one standing here now.** The past doesn’t get to wear your boots. Take the coat. Take the face. Go down and meet the consequences like they’re yours, because they are.') },
      { sp: 'nar', text: T('*Thought gained: **The Coat Fits.***') },
    ],
    choices: [
      { label: 'Descend to the quay, wearing your own face.', goto: 'quay', do(s) { s.gainThought('coatfits'); s.flags.selfHeld = true; } },
    ],
  },

  mirrorF: {
    scene: 'stair',
    lines: [
      { sp: 'nar', text: T('You hold the gaze. You hold it. You —') },
      { sp: 'nar', text: T('The reflection looks away first.') },
      { sp: 'nar', text: T('That should not be possible. The back of your neck understands this before you do and tries, independently, to leave.') },
      { sp: 'sk:deep', text: T('Somewhere behind the glass, your own face is standing in a stairwell it refuses to look at. Don’t knock. Some doors are mirrors and some mirrors are doors and you have just heard one *lock*.') },
    ],
    choices: [
      { label: 'Get down the stairs. Quickly.', goto: 'quay', do(s) { s.damage('spirit', 2, 'The reflection looked away first.'); } },
    ],
  },

  /* ---------------- THE QUAY ---------------- */

  quay: {
    scene: 'quay',
    lines: [
      { sp: 'nar', text: T('The tower door gives onto wind. Hushwater: a town built of wet slate and rope, folded around its harbour like a hand around a match. Ash-grey water slaps the quay stones. Out on the rocks, the wreck grinds and grieves. And beyond it all, patient as arithmetic, the grey wall of the Hush stands where the world used to keep its horizon.') },
      { sp: 'nar', text: T('A woman is waiting for you at the foot of the tower. Storm-coat, harbourmaster’s braid, a face that has fired people. She looks at you the way you’d look at a ledger that doesn’t add up.') },
      { sp: 'maren', text: T('So it *lives*. Three days the tower’s been shut, and out you stroll —' ) },
      { sp: 'maren', text: T('— wearing his coat.'), req: (s) => s.flags.wearCoat },
      { sp: 'sk:perception', text: T('Her eyes went to the coat first, your face second. The coat means more to her than you do. And her right hand hasn’t left her pocket. Something in there she’s deciding about.'), req: (s) => s.skills.perception >= 4 },
    ],
    lines2: [
      { sp: 'nar', text: T('The quay. Wind, rope-creak, the wreck grinding on its rocks. Maren Vask watches the water and, sideways, you.') },
    ],
    choices: [
      { label: '“Whose coat?”', goto: 'qCoat', once: true },
      { label: '“What happened here?”', goto: 'qWreck', once: true },
      { label: '[AUTHORITY] “Lower the tone. I’m the one asking questions.”', check: { id: 'ck_maren', skill: 'authority', dc: 9, pass: 'qAuthP', fail: 'qAuthF' }, if: (s) => !s.flags.marenDone },
      { label: '[EMPATHY] “You lost someone on that ship.”', goto: 'qEmp', if: (s) => s.skills.empathy >= 3 && s.flags.knowWreck, once: true },
      { label: 'Go to the child on the tideline.', goto: 'pip', if: (s) => s.flags.knowWreck },
      { label: 'Head for the drowned church.', goto: 'church', if: (s) => s.flags.churchLead },
      { label: 'Walk toward the grey wall. Toward the Hush.', goto: 'hush', if: (s) => s.flags.knowWreck },
      { label: 'It’s time. Call the town together.', goto: 'dawn', if: (s) => s.flags.pageRead || s.flags.isKeeper },
    ],
  },

  qCoat: {
    scene: 'quay',
    lines: [
      { sp: 'maren', text: T('Erasmus Kell’s. Keeper of that lamp for eleven years, and the most reliable man on this coast, which around here is like being the tallest wave. Three nights ago the light went out. Nobody’s seen Kell since.') },
      { sp: 'maren', text: T('Then this morning the tower door’s still barred from the inside, and now here *you* are, in his coat, with his key, and a face like a wiped slate. You see my problem.') },
      { sp: 'sk:logic', text: T('Barred from the inside. Whoever darkened the lamp did not leave afterward. There was one person in that tower, and you woke up as him. The syllogism is not your friend.') },
      { sp: 'sk:empathy', text: T('She says *Kell* the way you’d say the name of a bridge that collapsed. She didn’t just rely on him. She liked him.') },
    ],
    choices: [
      { label: 'Continue.', goto: 'quay', do(s) { s.flags.knowName = true; } },
    ],
  },

  qWreck: {
    scene: 'quay',
    lines: [
      { sp: 'maren', text: T('The ferry *Gilded Moth*, out of Cape Vore, last port before the Hush ate the cape. Forty-one souls aboard — the whole of Vore that chose to run rather than be… unremembered. They came up the coast in the dark, counting on our lamp to thread the strait.') },
      { sp: 'maren', text: T('The lamp was dark. They found the rocks instead. Nine drowned. Six missing. The rest we pulled out of water cold enough to stop clocks.') },
      { sp: 'nar', text: T('She recites the numbers the way people do when they’ve promised themselves not to feel them today. Nine. Six. Forty-one.') },
      { sp: 'sk:logic', text: T('Hold on. Run the chart in your head. The rocks lie *outside* the strait — seaward. The lamp-lit channel, the “safe” passage, threads *inward*… toward where the Hush now stands. A dark lamp turns ships away from the strait. A lit lamp would have led the Moth **into the grey**. The geometry is trying to tell you something and it is not pleasant.'), req: (s) => s.skills.logic >= 4 },
    ],
    choices: [
      { label: 'Continue.', goto: 'quay', do(s) { s.flags.knowWreck = true; if (s.skills.logic >= 4) s.flags.arithmeticSeed = true; } },
    ],
  },

  qAuthP: {
    scene: 'quay',
    lines: [
      { sp: 'nar', text: T('You put the harbour voice on — the one that stops dock brawls — and something extraordinary happens: Maren Vask’s spine answers before her pride can object. Old reflex. She *knows* this voice.') },
      { sp: 'maren', text: T('…Huh. There he is. You used to talk to the pilots like that, when they came in cocky through the narrows.') },
      { sp: 'maren', text: T('Fine. Straight dealing, then. I don’t think you’re a thief, and I can’t prove you’re Kell. But old Aulis down at the drowned church — the keeper went to him three nights ago, *before* the light died. If anyone holds the shape of what happened, it’s the bellman. Go. And come back with something I can tell forty-one families.') },
    ],
    choices: [
      { label: 'Continue.', goto: 'quay', do(s) { s.flags.marenRespect = true; s.flags.marenDone = true; s.flags.churchLead = true; s.flags.knowWreck = true; } },
    ],
  },

  qAuthF: {
    scene: 'quay',
    lines: [
      { sp: 'nar', text: T('You put the voice on. It comes out damp. Somewhere between your chest and the wind it loses its badge, and what arrives at Maren Vask is a tired stranger doing an impression of command.') },
      { sp: 'maren', text: T('*Asking* questions. You’ll be answering them soon enough — when the families are done burying, they’ll come asking whose hand was on that lamp. For your sake I hope the answer’s ready. Talk to Aulis at the drowned church if you want a head start. The keeper went to him before the light died.') },
      { sp: 'sk:volition', text: T('Stung? Good. Sting is information. She still gave you the lead — take the lead and leave the pride here, it’s heavy.') },
    ],
    choices: [
      { label: 'Continue.', goto: 'quay', do(s) { s.flags.marenDone = true; s.flags.churchLead = true; s.flags.knowWreck = true; } },
    ],
  },

  qEmp: {
    scene: 'quay',
    lines: [
      { sp: 'nar', text: T('You say it quietly, so the wind can pretend it didn’t carry it. Her jaw does something small and catastrophic.') },
      { sp: 'maren', text: T('My brother. Deckhand on the Moth. He’s… “missing.” Which is harbour for *the sea hasn’t finished confessing.*') },
      { sp: 'maren', text: T('You want to know the worst of it? If the lamp had been lit, I’d have watched it guide him in. And these days, with the strait gone grey… I lie awake doing navigation I don’t want to do.') },
      { sp: 'sk:empathy', text: T('She’s done the geometry too. She knows what lit would have meant. She hates knowing it. That is why she hasn’t hanged you already — some cellar-level part of her suspects the dark lamp was the kinder instrument.') },
    ],
    choices: [
      { label: '“I’ll find out what happened. All of it.”', goto: 'quay', do(s) { s.flags.marenSoft = true; s.flags.churchLead = true; } },
    ],
  },

  /* ---------------- PIP, ON THE TIDELINE ---------------- */

  pip: {
    scene: 'quay',
    lines: [
      { sp: 'nar', text: T('Down where the quay gives up and becomes shingle, a child is working the tideline with the seriousness of a customs officer. Eight, maybe nine. Beside her, arranged on a plank with museum precision: a spoon, a door key, a hairbrush, a photograph gone entirely grey.') },
      { sp: 'pip', text: T('You can look but don’t touch. They’re not mine. I’m just keeping them till somebody remembers them.') },
      { sp: 'sk:empathy', text: T('Not *finds* them. Remembers them. Mind the difference — it’s the size of the whole grey wall out there.') },
    ],
    lines2: [
      { sp: 'nar', text: T('Pip is still at her post on the tideline, curating the sea’s lost property.') },
    ],
    choices: [
      { label: '“What are they, all these things?”', goto: 'pipObj', once: true },
      { label: '“What does the Hush sound like, up close?”', goto: 'pipDeep', once: true, if: (s) => s.skills.deep >= 3 },
      { label: 'Ask about her family.', goto: 'pipMa', once: true },
      { label: 'Back to the quay.', goto: 'quay' },
    ],
  },

  pipObj: {
    scene: 'quay',
    lines: [
      { sp: 'pip', text: T('They wash out of the Hush. Stuff from the eaten places — Cape Vore, the fishing towns, all the grey. The sea spits things back out but the *rememberings* don’t come with them. See this photograph? There’s people in it. Look how there’s nobody in it.') },
      { sp: 'nar', text: T('She holds it up. The photograph is a perfect exposure of an empty parlour. Chairs angled companionably toward one another around the absence of a family.') },
      { sp: 'pip', text: T('Somebody loved all of it. The spoon too. You don’t keep a spoon that long unless it’s somebody’s.') },
      { sp: 'sk:deep', text: T('The child is running an archive of the unremembered at the edge of the world, alone, with a plank. Whole religions have been founded on less.') },
    ],
    choices: [
      { label: 'Continue.', goto: 'pip', do(s) { s.flags.sawInventory = true; } },
    ],
  },

  pipDeep: {
    scene: 'quay',
    lines: [
      { sp: 'nar', text: T('She stops sorting. Looks at you with sudden respect, one professional to another.') },
      { sp: 'pip', text: T('Nobody asks that. Everybody asks *is it coming here* — It sounds like a room after the clock stops. You know how you don’t hear a clock till it quits? It’s that, but for *everything*. You get right up close and you can hear all the sounds not being made.') },
      { sp: 'sk:deep', text: T('All the sounds not being made. This child has stood closer to it than anyone in this town and come back with better field notes than any of them. Believe every word.') },
    ],
    choices: [
      { label: 'Continue.', goto: 'pip' },
    ],
  },

  pipMa: {
    scene: 'quay',
    lines: [
      { sp: 'nar', text: T('The sorting stops. Her hands go flat and quiet on the plank, like two small animals playing dead.') },
      { sp: 'pip', text: T('Da’s on the boats. Ma stayed at Cape Vore. She was going to come on the next ferry, after she sold the house. The next ferry was the Moth, only she wasn’t on it. And Cape Vore’s grey now, so.') },
      { sp: 'pip', text: T('Here’s the thing though. I’ve been trying to remember her face and it’s — it does the thing the photograph does. There’s a *shape* where she goes. I know she’s in the shape. I just can’t see in it anymore.') },
      { sp: 'sk:empathy', text: T('Careful. This is a load-bearing wall in this child. Whatever you say next, say it like you’re handling someone else’s mother. You are.') },
    ],
    choices: [
      { label: '[EMPATHY] Find the words for the shape.', check: { id: 'ck_pip', skill: 'empathy', dc: 8, pass: 'pipP', fail: 'pipF' } },
      { label: 'Say nothing. Help her sort instead.', goto: 'pip', do(s) { s.flags.pipQuiet = true; } },
    ],
  },

  pipP: {
    scene: 'quay',
    lines: [
      { sp: 'you', text: T('“You can’t lose her face, because it isn’t kept there. It’s kept in how you sort things gently, and how you guard other people’s spoons. The Hush can eat a picture. It can’t eat *how she made you.* You’re the photograph now. And you’re not grey at all.”') },
      { sp: 'nar', text: T('Pip looks at her plank of orphaned belongings for a long time. Then she nods, once, the way harbourmasters nod, and adds a small stone to the collection.') },
      { sp: 'pip', text: T('That one’s for her. So there’s a *thing*, for the shape. — You talk like the keeper used to, you know. He was alright.') },
      { sp: 'nar', text: T('*Thought gained: **Pip’s Inventory of Lost Things.***') },
    ],
    choices: [
      { label: 'Continue.', goto: 'pip', do(s) { s.flags.pipFriend = true; s.gainThought('inventory'); } },
    ],
  },

  pipF: {
    scene: 'quay',
    lines: [
      { sp: 'nar', text: T('You reach for the words and come back with driftwood. Something about memory, and shapes, and it all coming right — you hear it leaving your mouth and want to arrest it.') },
      { sp: 'pip', text: T('…Yeah. Everybody says that one.') },
      { sp: 'nar', text: T('She goes back to sorting. The audience is over. You have been, with perfect politeness, filed under *everybody*.') },
      { sp: 'sk:volition', text: T('You tried with a whole heart and a poor vocabulary. It happens. Don’t make her comfort *you* about it — leave the guilt on the shingle and do better with the living.') },
    ],
    choices: [
      { label: 'Continue.', goto: 'pip', do(s) { s.damage('spirit', 1, 'Filed under everybody.'); } },
    ],
  },

  /* ---------------- THE DROWNED CHURCH ---------------- */

  church: {
    scene: 'church',
    lines: [
      { sp: 'nar', text: T('The church lost its argument with the sea a generation ago. Now the nave stands knee-deep at low tide, pews rotted to ribs, and green light falls through drowned windows onto water that holds the ceiling upside down. It is the most beautiful ruin you have ever failed to remember.') },
      { sp: 'nar', text: T('At the far end, on a dry island of altar steps, an old man swings a hand-bell with terrible patience. One note. Silence. One note. He has done this, the calluses say, for years.') },
      { sp: 'aulis', text: T('Wet boots. Heavy coat. Heavier conscience, by the sound of the stride. Come in, come in — the sea makes room for everyone eventually.') },
    ],
    lines2: [
      { sp: 'nar', text: T('The drowned nave. Green light, upside-down ceiling, and Aulis with his bell, keeping time for the dead.') },
    ],
    choices: [
      { label: '“Why ring a bell for the dead? The dead don’t hear.”', goto: 'chBell', once: true },
      { label: '“The keeper came to you, before the light died. Tell me.”', goto: 'chKeep', once: true },
      { label: '[LOGIC] “The sea keeps no books. Drop the providence — chance is chance.”', check: { id: 'ck_debate', skill: 'logic', dc: 9, pass: 'chDbP', fail: 'chDbF' }, if: (s) => s.flags.heardBooks },
      { label: '“The page, Aulis. The keeper’s page. Give it to me.”', goto: 'chPageGate', if: (s) => s.flags.knowPage, once: true },
      { label: 'Back to the quay.', goto: 'quay' },
    ],
  },

  chBell: {
    scene: 'church',
    lines: [
      { sp: 'aulis', text: T('Quite right. The dead don’t hear. The bell isn’t *for* them — it’s for the living, so we don’t get used to the quiet. The moment forty-one souls become a quiet you’ve gotten used to, you’re halfway to being Hush yourself, and you didn’t even have to walk there.') },
      { sp: 'aulis', text: T('That’s all the grey wall is, friend. The universe getting used to things. I ring so this town stays *unaccustomed*.') },
      { sp: 'sk:deep', text: T('One old man with a hand-bell, holding the line against entropy by refusing to find grief boring. Write it down somewhere the Hush can’t reach.') },
      { sp: 'sk:logic', text: T('Sentimental. Also — note — operationally identical to what a lighthouse does. A repeated signal against a darkness. This town has two keepers, and one of them is still at his post.') },
    ],
    choices: [
      { label: 'Continue.', goto: 'church' },
    ],
  },

  chKeep: {
    scene: 'church',
    lines: [
      { sp: 'aulis', text: T('Three nights ago. In he comes at black tide, wet to the ribs, and sits where you’re standing, and asks me — not hello, not bless me — he asks: *“Aulis. Can a man trade one wrong for a larger right, and stay a man?”*') },
      { sp: 'aulis', text: T('I told him what I tell everyone: the sea keeps its books, and it doesn’t show us the ledger, so do the kind thing in front of you and let providence do the sums. He laughed. Terrible sound. Said the kind thing in front of him and the kind thing *behind the fog* weren’t the same kind, and one of them had forty-one souls on it.') },
      { sp: 'aulis', text: T('Then he left me a page from his log. Folded thrice, like a man folding his own hands. “For whoever comes asking,” he said, “after.”') },
      { sp: 'sk:perception', text: T('His thumb is worrying the bell handle — he’s read the page. Whatever’s on it has been ringing in him for three days along with everything else.'), req: (s) => s.skills.perception >= 4 },
    ],
    choices: [
      { label: 'Continue.', goto: 'church', do(s) { s.flags.knowPage = true; s.flags.heardBooks = true; } },
    ],
  },

  chDbP: {
    scene: 'church',
    lines: [
      { sp: 'you', text: T('“The sea keeps no books, Aulis. There’s no ledger in the water — there’s water. A wave doesn’t weigh a soul, it weighs *nothing*, that’s the whole horror and the whole mercy of it. Providence didn’t choose the rocks. A man did — a man alone in a tower with two bad numbers, doing the sums the sea refused to do. You handed the ledger back to the one being in this story who actually had to hold the pen.”') },
      { sp: 'nar', text: T('The bell stops. For the first time since you entered, real silence — and in it, the old man looks his age, then older, then merely honest.') },
      { sp: 'aulis', text: T('…Eleven years I gave him book-keeping when the man needed a *co-signer*. You’re right. God help me, that’s the sermon I should have preached to the fog. If the sea keeps no books, then the choosing was his. And the loneliness of it — that was mine to share, and I sent him up the tower with a proverb.') },
      { sp: 'nar', text: T('*Thought gained: **The Lamp Argument.***') },
    ],
    choices: [
      { label: 'Continue.', goto: 'church', do(s) { s.gainThought('lampargument'); s.flags.aulisMoved = true; } },
    ],
  },

  chDbF: {
    scene: 'church',
    lines: [
      { sp: 'nar', text: T('You go at providence with both hands and find it is made of water. Every grip you try, the old man has forty years of drowned parishioners to answer it with.') },
      { sp: 'aulis', text: T('Chance, you say. Friend, I have buried chance. I have rung this bell for storms that took the cruel and spared the kind, and for storms that did the opposite, and the only pattern I ever found was that *somebody has to ring afterward*. Call it books, call it chance — the bell doesn’t care and neither do the drowned. You’re arguing about the name of the water while you’re standing in it.') },
      { sp: 'sk:logic', text: T('…He’s not rigorous. He’s just *right at a different altitude.* Disengage. We’ll get him next epistemology.') },
    ],
    choices: [
      { label: 'Concede the point, for now.', goto: 'church', do(s) { s.damage('spirit', 1, 'Out-argued by a bellman.'); } },
    ],
  },

  chPageGate: {
    scene: 'church',
    lines: [
      { sp: 'aulis', text: T('And there it is. “Whoever comes asking, after.” — He meant it for hands that would carry it *to* the town, friend, not away from it. So before I hand a man his own confession, tell me: who vouches for you?') },
      { sp: 'sk:volition', text: T('A fair toll. What have you built in this town since you woke — anything? Anyone?') },
    ],
    choices: [
      { label: '“Maren Vask deals with me straight.”', goto: 'chPage', if: (s) => s.flags.marenRespect || s.flags.marenSoft },
      { label: '“Ask Pip. Keeper of the unremembered. She’ll vouch.”', goto: 'chPage', if: (s) => s.flags.pipFriend },
      { label: '[EMPATHY] “Nobody vouches for me, Aulis. That’s the point. I might BE the man on that page — and I’d rather be damned by the truth than acquitted by the fog.”', check: { id: 'ck_page', skill: 'empathy', dc: 8, pass: 'chPage', fail: 'chPageF' } },
    ],
  },

  chPageF: {
    scene: 'church',
    lines: [
      { sp: 'aulis', text: T('Hm. Pretty words, and I nearly believe them — but *nearly* has drowned better men than you. Come back when someone in this town will put their name next to yours. That’s not cruelty, friend. That’s the whole technology of a town.') },
      { sp: 'sk:logic', text: T('He wants a voucher. Maren respects strength or honesty; the child respects being taken seriously. Both are still available to you. Go earn one.') },
    ],
    choices: [
      { label: 'Back to the quay.', goto: 'quay' },
    ],
  },

  chPage: {
    scene: 'church',
    lines: [
      { sp: 'nar', text: T('The old man takes a folded page from inside his coat — kept, you notice, against his chest, where you’d keep a burn. He opens it flat on the altar rail with both hands, an act with liturgy in it, and steps back so the drowned light can do the reading.') },
      { sp: 'nar', text: T('The hand is tight, careful, and does not shake:') },
      { sp: 'nar', text: T('*“The Moth sails tonight. Forty-one aboard — all that’s left of Vore. The strait is Hush now; the charts lie; no one has told the water. If I burn the lamp, I light their road INTO the grey — all forty-one, unmade, and no one left to even miss them. If I dark the lamp, they turn from the strait and find the rocks. The rocks will take some. The rocks will LEAVE some.”*') },
      { sp: 'nar', text: T('*“There is no third lamp. God forgive the arithmetic. I choose the rocks. — E.K.”*') },
      { sp: 'sk:logic', text: T('Nine drowned, six missing — and twenty-six alive. Alive because a man did an obscene subtraction in the dark and paid for it with everything he had left, starting with his name. The math *held*. Whether math like that is ever allowed to hold — that’s the part no lamp can light.') },
      { sp: 'sk:empathy', text: T('Feel the sentence he couldn’t write: *and I cannot watch.* That’s why the scratched-out name. That’s why the barred door. He sentenced the Moth to the rocks and himself to the dark, one lever, both at once.') },
      { sp: 'sk:deep', text: T('Notice what your hands are doing, sailor. Your right hand has curled around a lever that isn’t there. It has been carrying the weight this whole time.') },
      { sp: 'aulis', text: T('The town gathers at dawn, at the quay, to bury its nine and to demand its answer. Someone must stand up with this page and be its voice. I’m a bell, friend. I can toll it. I can’t *speak* it.') },
    ],
    choices: [
      { label: 'Take the page. Its weight is familiar.', goto: 'quay', do(s) { s.flags.pageRead = true; } },
    ],
  },

  /* ---------------- THE HUSH WALL ---------------- */

  hush: {
    scene: 'hush',
    lines: [
      { sp: 'nar', text: T('The street to the old cape walks with you for a while, then loses its nerve. Cobbles, then shingle, then a hundred yards of world that has gone… approximate. And then the wall.') },
      { sp: 'nar', text: T('It is not fog. Fog is water and glare and eddies — weather with intentions. This is a standing surface of grey **nothing**, soft as moth-wing, tall as regret, running left and right past the ends of seeing. Where it touches the shingle there is no boundary line. There is shingle, and then there is *having-never-been-shingle*.') },
      { sp: 'nar', text: T('Up close, Pip was exact: you can hear all the sounds not being made.') },
      { sp: 'sk:volition', text: T('Rules of engagement: we look, we speak if spoken to, we keep our boots where the world still agrees on boots.') },
      { sp: 'hush', text: T('you came back'), req: (s) => s.skills.deep >= 4 || s.flags.pageRead },
      { sp: 'sk:deep', text: T('…It talks like erased tape. And it said *back*.'), req: (s) => s.skills.deep >= 4 || s.flags.pageRead },
    ],
    lines2: [
      { sp: 'nar', text: T('The wall again. Grey, patient, adding nothing, subtracting everything. It notices you the way a scale notices weight.') },
    ],
    choices: [
      { label: '“What are you?”', goto: 'huWhat', once: true },
      { label: '“Give them back. The cape, the faces, all of it.”', goto: 'huBack', once: true },
      { label: '[THE DEEP] Reach into it.', check: { id: 'ck_reach', skill: 'deep', dc: 10, red: true, pass: 'huP', fail: 'huF' } },
      { label: 'Step back from the edge. Return to town.', goto: 'quay' },
    ],
  },

  huWhat: {
    scene: 'hush',
    lines: [
      { sp: 'hush', text: T('i am the end of rehearsal. you practice forgetting all your lives — the childhood house, the second language, the third face of your mother — and you call the practice *time* and forgive it. i am only the performance. i am what you were always doing, done.') },
      { sp: 'hush', text: T('you mourn what i take. but what i take cannot mourn. no orphan grieves inside me. no keeper counts inside me. i am mercy, delivered at the only speed mercy truly comes: all at once, and forever.') },
      { sp: 'sk:logic', text: T('Elegant. And fraudulent. Mercy requires a recipient — it erases the sufferer *and the relief*. A cure that deletes the patient has a zero in its denominator; it isn’t infinite kindness, it’s undefined.') },
      { sp: 'sk:empathy', text: T('Pip’s stone. Maren’s arithmetic at 4 a.m. Aulis’s bell. The mourning it calls a disease — that’s the only place the drowned still live. It isn’t offering to end suffering. It’s offering to end *mattering*.') },
    ],
    choices: [
      { label: 'Continue.', goto: 'hush' },
    ],
  },

  huBack: {
    scene: 'hush',
    lines: [
      { sp: 'hush', text: T('back. — you stand on a beach demanding the tide be sorry. there is no vault, keeper. no warehouse of kept capes. what i touch is not stored. it is *settled*. ask the bellman: even his god only forgives. forgiveness still remembers. i do the finished version.') },
      { sp: 'hush', text: T('but you — you carry a room i have not entered. three nights ago it opened its door to me over the water, wide, lit, forty-one lanterns walking in — and then the door went dark and the room turned me away. i do not often get to be *refused*. it was. interesting.') },
      { sp: 'sk:deep', text: T('It’s talking about the lamp. The lit lamp was a **door** — and the dark was somebody shutting it. From the far side of the strait, the keeper’s choice looked like the world itself declining to be eaten. You are standing before the thing your lever refused, and it *remembers being refused*. That’s not nothing, sailor. By its own account, that’s the only remembering it does.') },
    ],
    choices: [
      { label: 'Continue.', goto: 'hush', do(s) { s.flags.hushRefused = true; } },
    ],
  },

  huP: {
    scene: 'hush',
    lines: [
      { sp: 'nar', text: T('You put your hand into the grey.') },
      { sp: 'nar', text: T('No cold. No pressure. Your hand simply becomes a rumour, and then — because THE DEEP holds the rest of you like a lamp holds a flame — the rumour comes *back*, and it comes back carrying:') },
      { sp: 'nar', text: T('A lamp room at black tide. Rain on the glass like flung gravel. Your own two hands on the shutter lever — **your** hands, the scar, the crooked knuckle, no doubt left anywhere — and the lever’s weight, and the half-inch of slack, and a voice — yours — saying the arithmetic out loud to nobody: *twenty-six is more than zero. twenty-six is more than zero.* And then the dark, arriving like a verdict you passed on yourself.') },
      { sp: 'nar', text: T('You are Erasmus Kell. You were always Erasmus Kell. The forgetting wasn’t the Hush’s work. It was *yours* — the only door you had left to shut.') },
      { sp: 'sk:deep', text: T('There it is. You didn’t lose your name, keeper. You *scratched it out* — coat, mirror, mind, all three, same blade. And it didn’t take. Because twenty-six people are warm this morning, and warmth is a kind of signature.') },
      { sp: 'nar', text: T('*Thought gained: **Salt In Everything.***') },
    ],
    choices: [
      { label: 'Withdraw your hand. Carry it all back to town.', goto: 'quay', do(s) { s.flags.isKeeper = true; s.gainThought('saltineverything'); s.addInsight(2); } },
    ],
  },

  huF: {
    scene: 'hush',
    lines: [
      { sp: 'nar', text: T('You put your hand into the grey.') },
      { sp: 'nar', text: T('And the grey, politely, takes something. No pain — that’s the obscenity of it. A transaction completes somewhere upstream of your heart, and your hand comes back whole, and you stand there trying to notice what is missing, which is like trying to hear the clock that already stopped.') },
      { sp: 'nar', text: T('Later you will check the coat’s collar and find the name-tag isn’t scratched anymore. It is *blank*. Leather smooth as a new oar. There is nothing under the scratches now, and there never was, and you will not be able to prove to yourself that there ever was.') },
      { sp: 'hush', text: T('a taste. no charge.') },
      { sp: 'sk:volition', text: T('**Out.** We are leaving with the rest of us. It has shown you its whole sales pitch now — the peace is real and the price is *you*. Boots. Town. Go.') },
    ],
    choices: [
      { label: 'Walk back to the world.', goto: 'quay', do(s) { s.flags.lostName = true; s.damage('spirit', 2, 'The Hush took a taste.'); } },
    ],
  },

  /* ---------------- DAWN ASSEMBLY / ENDINGS ---------------- */

  dawn: {
    scene: 'dawn',
    lines: [
      { sp: 'nar', text: T('Dawn comes up the colour of an old scar. The town gathers on the quay — all of it: oilskins and black shawls, the twenty-six survivors of the Gilded Moth wrapped in borrowed blankets, Maren Vask with her braid squared, Pip on a bollard with her plank of unremembered things, Aulis at the back, bell in hand, silent for once. Nine coffins in a row like a broken jetty.') },
      { sp: 'nar', text: T('Above everyone, the dead tower. Below everyone, the patient water. Beyond, the grey wall, close enough this morning to be a member of the congregation.') },
      { sp: 'maren', text: T('Enough waiting. Tower man. You stand where the light should be. Tell them what you know.') },
      { sp: 'sk:volition', text: T('This is the hour, then. Whatever you say next, forty-one families and one grey wall are listening. Stand like the tower. Speak like the lamp.') },
      { sp: 'sk:hunger', text: T('For the record: we could still just run. Boats right there. — No? Fine. It was important that the option be *catalogued*.'), req: (s) => s.skills.hunger >= 3 },
    ],
    choices: [
      { label: '“I am Erasmus Kell. I darkened the lamp. Hear the whole of it.”', goto: 'endConfess', if: (s) => s.flags.isKeeper || s.flags.pageRead },
      { label: '[VOLITION] Say nothing. Climb the tower. Relight the lamp.', check: { id: 'ck_relight', skill: 'volition', dc: 10, red: true, pass: 'endLight', fail: 'endGutter', bonus: (s) => (s.flags.pipFriend ? 1 : 0) + ((s.flags.marenRespect || s.flags.marenSoft) ? 1 : 0) } },
      { label: 'Walk past them all, down the shingle, into the Hush.', goto: 'endHush' },
      { label: '“The sea keeps its books. Ask the sea.” Turn and go.', goto: 'endSilence' },
    ],
  },

  endConfess: {
    scene: 'dawn',
    ending: 'THE ARITHMETIC, SPOKEN',
    lines: [
      { sp: 'nar', text: T('You stand where the light should be, and you give them the dark instead — all of it. The strait gone grey and no one telling the water. The charts that lied. The two roads: forty-one souls unmade beyond the wall, or the rocks, which would take some and *leave* some. The lever. The steady hand. The arithmetic, spoken aloud at last, over nine coffins, in front of twenty-six people who are alive because of it and will never forgive it, and should not have to.') },
      { sp: 'nar', text: T('No one shouts. That’s the terrible mercy of harbour towns: they have buried too many to waste a dawn on shouting. A woman from the Moth spits at your boots. A man from the Moth — grey-faced, borrowed blanket — crosses the stones and stands beside you, facing the crowd, and says nothing, which says it.') },
      { sp: 'maren', text: T('Twenty-six alive. Nine coffins. Six the sea still owes us. — I’d have lit it. God help me, I’d have lit it and waved him in. — The town will decide what it decides, Kell. But it’ll decide about a *man*, not a mystery. That’s more than the fog ever gave us.') },
      { sp: 'aulis', text: T('The bell now. Nine strokes for the drowned. One more, I think — for the keeper who died in that tower three nights ago, whatever the man in his coat does next.') },
      { sp: 'nar', text: T('Aulis rings. Nine, and one. Pip adds a small stone to her plank — you see her mouth the inventory as she does it: *this one’s for the keeper.* The Hush stands at the harbour mouth all through it, and takes nothing, because every stroke of the bell is a thing being deliberately, publicly **kept**.') },
      { sp: 'sk:volition', text: T('You chose the rocks twice: once with the lever, once with your name. The first cost nine lives. The second is the only repayment the nine can still be paid — to be *answered for*, out loud, by a man wearing his own face.') },
    ],
    choices: [],
  },

  endLight: {
    scene: 'light',
    ending: 'THE SECOND KEEPING',
    lines: [
      { sp: 'nar', text: T('You don’t give them words. Words are for the trial the living will hold either way. You walk through the crowd — it parts the way water parts, resenting it — and you climb the tower, all one hundred and eleven stairs, past the mirror (which watches, and this time does not blink), into the lamp room, to the lever your hand has never once forgotten.') },
      { sp: 'nar', text: T('The strait is grey and the charts still lie — a lit lamp can no longer promise safe water. You know that. So you do the second-hardest thing a keeper can do with a lamp: you light it anyway, not as a road, but as a **bell**. Wick. Spark. The half-inch of slack, the catch, the shutter drawn *back* —') },
      { sp: 'lamp', text: T('OH.') },
      { sp: 'lamp', text: T('THERE YOU ARE.') },
      { sp: 'nar', text: T('Light. Real, revolving, seventy-one-year-old light, swinging its gold arm over the coffins and the survivors, over Pip’s plank of unremembered things, over Maren’s upturned unbelieving face, out across the water — and against the grey wall itself, which does something no one alive has seen it do.') },
      { sp: 'nar', text: T('It steps back. One yard. Perhaps two. The width, say, of one remembered name.') },
      { sp: 'hush', text: T('refused. again.') },
      { sp: 'nar', text: T('Below, thin and clear across the morning, a hand-bell starts to answer the lamp, stroke for sweep. And a town that gathered to demand an answer finds it has been given one after all — not *who is to blame*, but the older question, the lighthouse question: **is anyone still keeping us?** Yes. Burning steadily. Overhead.') },
      { sp: 'sk:volition', text: T('The arithmetic will still need speaking someday; lit lamps don’t pardon dark ones. But you have written the first line of the answer in the only ink the Hush respects. Keep it burning, keeper. Keep it burning.') },
    ],
    choices: [],
  },

  endGutter: {
    scene: 'dawn',
    ending: 'A SMALL, KEPT FLAME',
    lines: [
      { sp: 'nar', text: T('You climb. You spark the wick. And the great lamp — seventy-one years old, three days cold, salt in its every joint — gutters, gasps, and goes out in your hands. Some machines die of grief after all. You stand in the lamp room holding a dead match over a dead flame while below you an entire town watches the tower fail to mean anything.') },
      { sp: 'nar', text: T('The stairs down are longer than the stairs up. That’s not physics. That’s just true.') },
      { sp: 'nar', text: T('At the bottom, the crowd has not moved. Nobody spits. Nobody speaks. Then Pip climbs down off her bollard, crosses the whole width of the silence with her plank under one arm, and puts her free hand in yours — matter-of-factly, the way you’d secure a mooring line.') },
      { sp: 'pip', text: T('It didn’t light. So what. The trying was a *thing*. I’m keeping it.') },
      { sp: 'nar', text: T('And she takes a small white stone from her pocket and adds it to the plank, and the sea says nothing, and the grey wall takes nothing, because the smallest keeping still counts as kept.') },
      { sp: 'sk:empathy', text: T('One witness who files your failure under *worth remembering* outweighs a hundred who saw it. You climbed. It’s catalogued. Now stay — stay and be tried, stay and shovel, stay and mean it. Towns are rebuilt out of exactly this.') },
    ],
    choices: [],
  },

  endHush: {
    scene: 'hush',
    ending: 'THE FINISHED VERSION',
    lines: [
      { sp: 'nar', text: T('You walk past Maren, whose mouth opens and — for the first time in the town’s memory — finds nothing in stock. Past the coffins. Past Aulis, who does not try to stop you but begins, softly, to ring: not a mourning stroke. A *tolling*. He knows a departure when he sees one. Past Pip —') },
      { sp: 'nar', text: T('— who holds up, wordlessly, the grey photograph of nobody. A question. You have no answer that survives being spoken, so you touch the plank once, gently, cataloguing yourself, and go on down the shingle.') },
      { sp: 'nar', text: T('The wall does not welcome you. Welcoming is a memory-thing. It simply… makes room, the way still water makes room, and you walk in the way tired men walk into the sea: without ceremony, without slowing.') },
      { sp: 'hush', text: T('here. — the lever, first. its weight, its half-inch of slack. gone. — the twenty-six warm strangers. gone. — the child’s stone. — the bell. — the coat. — the name under the scratches, which you kept after all, keeper, right at the bottom, like a coin sewn in a hem. gone.') },
      { sp: 'sk:deep', text: T('*last one out. it has been — it was — there was a word. there was a lamp in it, and it meant* —') },
      { sp: 'nar', text: T('Grey.') },
      { sp: 'nar', text: T('On the tideline, later, the sea returns an oilskin coat, wool-lined, heavy. A child sorts it, curates it, sets it at the end of the plank. There’s a shape where somebody goes. She knows he’s in the shape. That is one more keeping than you left yourself — and it is, in the end, the only part of you the grey never gets.') },
    ],
    choices: [],
  },

  endSilence: {
    scene: 'dawn',
    ending: 'THE SEA KEEPS ITS BOOKS',
    lines: [
      { sp: 'nar', text: T('“The sea keeps its books,” you tell them. “Ask the sea.” And you turn, and you walk — not into the grey, nothing so honest — just *away*, up the coast road, the direction with the fewest questions in it.') },
      { sp: 'nar', text: T('No one follows. That’s the thing about towns: they only chase what belongs to them.') },
      { sp: 'nar', text: T('You get far enough that the bell is a rumour and the tower is a splinter on the sky. The coat keeps the wind off. The road keeps going. And every night after, in inn rooms and hay barns and the backs of carts, the same freight arrives with the dark: a lever’s weight your hand won’t stop rehearsing, nine coffins like a broken jetty, a child’s voice saying *everybody says that one.*') },
      { sp: 'aulis', text: T('*— somewhere behind you, faint, a hand-bell, ringing so a town stays unaccustomed. It does not stop when you stop hearing it.*') },
      { sp: 'sk:deep', text: T('Here is the joke the grey wall would enjoy, if it enjoyed: the Hush erases and at least calls it mercy. You kept every memory intact and simply declined to *stand next to them*. There’s a word for a lamp that works and isn’t lit. There’s a word for a keeper who leaves. You have become a small, walking Hush, sailor — one man wide, one conscience deep, going up the coast road under a perfectly good sky.') },
      { sp: 'sk:volition', text: T('…The road runs both ways. It will run both ways tomorrow, too. I’ll keep saying it. It’s what I’m for.') },
    ],
    choices: [],
  },

  /* ---------------- DEATHS ---------------- */

  deathSpirit: {
    scene: 'hush',
    ending: 'COME APART QUIETLY',
    lines: [
      { sp: 'nar', text: T('It isn’t dramatic. That’s what nobody tells you about the end of a self: it happens at the volume of dust settling. One grief too many is set down on the pile, and the pile, without fuss, without even the courtesy of a sound, lets go of its shape.') },
      { sp: 'sk:volition', text: T('*— get up. there is a floor under you. that means there is a — there is a —*') },
      { sp: 'nar', text: T('Somewhere a bell rings for someone. It has always been ringing. You just got used to it — and the moment a sorrow becomes a quiet you’re used to, the grey doesn’t need to walk to you at all. You go to it. You were going to it all morning.') },
      { sp: 'nar', text: T('The town finds an oilskin coat folded on the quay stones, neat as an apology. The tower stays dark. The question stays asked.') },
    ],
    choices: [],
  },

  deathBody: {
    scene: 'quay',
    ending: 'THE WATER IS PATIENT',
    lines: [
      { sp: 'nar', text: T('The body has been filing complaints since the lamp room — the cold, the hunger, the salt in every seam of you — and you have been marking them *read later*. The body, it turns out, keeps its books too. It forecloses on the quay stones, in the wind, with the grey wall watching like a creditor.') },
      { sp: 'nar', text: T('The last thing you see is the dead tower, upside down in the harbour water, which is how the drowned church has seen the world for a generation and it never once complained.') },
      { sp: 'nar', text: T('Maren has you buried with the nine. It seems fitting, she says, arithmetic-wise. Aulis rings ten.') },
    ],
    choices: [],
  },
};

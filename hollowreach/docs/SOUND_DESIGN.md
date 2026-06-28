# Sound Design

Target: a **haunting, unforgettable** atmosphere — sparse, low, water-logged,
with light that hums and rooms that breathe. Implemented generatively in
`engine/audio/AudioDirector.ts` (WebAudio, no audio files).

## Adaptive layers

| Layer | What it is | How it adapts |
| --- | --- | --- |
| **Drone** | Two detuned sine oscillators at the theme's sub-frequency | The city's tinnitus; constant, swaps pitch per district. |
| **Pad** | A slow, low-pass-filtered chord (triangle+sine voices) that swells in staggered | Chord/cutoff swap per district theme; filter eases over ~1.5s on transition. |
| **Ambience** | Brown-noise buffer through a per-location filter | `water` (low-pass), `wind` (band-pass), `street` (high-pass), `room` (muffled). |
| **Stingers** | Short bell/interval motifs | Fired by gameplay events. |

## District themes

| Theme | Root | Chord | Character |
| --- | --- | --- | --- |
| `drowned_quarter_theme` | A (110) | min7 (0,3,7,10) | Cold, grieving water. |
| `spindles_theme` | G (98) | sus (0,5,7) | Hollow, industrial, windswept. |
| `rows_theme` | B (123) | maj7 (0,4,7,11) | Neon-bright, false warmth. |
| `menu_theme` | F (87) | min (0,3,7) | Still, expectant dread. |

## Stinger cues

`clue_found` (rising bell), `theme_rise` (low swell on key beats),
`check_success` / `check_fail` (resolved vs. unresolved interval), `level_up`.
Authored content fires them via the `playStinger` effect or the toast→audio
bridge in `App.tsx`.

## Emotional transitions

Themes don't hard-cut: drone pitch and pad filter glide, and the new pad swells in
voice-by-voice over a couple of seconds, so moving from the drowned water of the
Quarter to the neon of the Rows *modulates* rather than jumps. Tension moments
(closing a case, a red check) layer a `theme_rise` swell over the bed.

## Mix & accessibility

Three gain stages — **master / music / sfx** — driven by Settings sliders and
applied with short `setTargetAtTime` ramps (no clicks). The context starts muted
until the first user gesture (autoplay policy); the title screen prompts for it.
Reduced-motion does not silence audio, but a future "reduced-audio" toggle would
duck the ambience layer.

## Voice-acting framework (designed)

The line schema already separates `speaker`/`speakerId`/`emotion`, which is the
hook for VO: a future pass attaches an audio clip id per line keyed by
`dialogueId#nodeId#lineIndex#emotion`, played through the sfx bus with subtitles
always on. The generative score is designed to sit *under* dialogue at a ducked
level, so VO and music coexist without a separate stem mix.

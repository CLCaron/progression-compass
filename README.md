# Progression Compass

Progression Compass is a guitar-friendly songwriting companion. Enter the chords you found by ear, hear several grounded ways forward, choose an emotional direction, and reveal theory only when it helps.

> Do not remove control. Remove the burden of understanding it before it becomes relevant.

## Technology

React 19, strict TypeScript, Vite, modern CSS, Vitest, Web Audio, and browser localStorage. There is no backend, account, paid API, environment variable, or music-theory dependency. The small internal theory engine makes its evidence deterministic and testable.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL Vite prints. Other checks:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Deploy to Vercel

Import this folder's GitHub repository in Vercel. Vercel detects Vite automatically; use `npm run build` and `dist` if asked. `vercel.json` keeps shared URLs working as a single-page app. Every push to the production branch will deploy automatically after the GitHub integration is connected.

## Project structure

- `src/app` — the one-screen React workflow and UI state.
- `src/components` — suggestion and guitar-shape presentation.
- `src/core/theory` — parsing, pitch classes, key ranking, Roman numerals, and voice-leading evidence.
- `src/core/suggestions` — candidate routes, intent weights, and evidence-based ranking.
- `src/core/guitar` — structured standard-tuning voicings, tab, and accessible descriptions.
- `src/core/context` — high-E fret input and note conversion.
- `src/core/serialization` — versioned local data validation and compact shared URLs.
- `src/platform` — replaceable browser storage, clipboard, and audio adapters.
- `src/test` — theory, recommendation, guitar, context, and serialization regression tests.

## How the engine works

Chord parsing keeps the entered symbol separate from normalized root, quality, extensions, bass, and pitch classes. The analyzer scores major and natural-minor centers from chord membership, tonic placement, dominant motion, and common borrowed movement. It deliberately keeps several plausible readings and uses labels—not fake percentages.

Recommendations begin with curated songwriting routes, then score them against the selected tonal reading, emotional direction, common tones, ringing-high-E preference, and optional top note. Every card carries structured evidence; copy and emotion never become the source of musical truth. This MVP targets common songwriting harmony, not exhaustive jazz or chromatic analysis.

Guitar voicings are data objects containing six standard-tuning fret values from low E to high E. `null` means muted and `0` means open. Visual diagrams, text tab, accessible descriptions, exact-shape audio, and pedal-tone detection all consume that same data. Common major, minor, and dominant-seventh chords combine curated open shapes with movable CAGED E- and A-form shapes.

The chord finder reverses that relationship: a six-string shape such as `320033` becomes sounding notes and ranked chord candidates. It understands muted strings, inversions, doubled notes, and common chord extensions. Choosing a result preserves the exact entered shape in progression history and local saves.

“Guitar Paths” ranks complete voicing sequences three ways: connected movement rewards small hand shifts and common tones; expressive movement rewards a deliberate register change; comfortable movement favors approachable shapes without forcing the hand to remain in one position. Each route can be heard, viewed as progression tab, and applied to the progression.

The Song Map separates reusable section definitions from their appearances in the arrangement. A repeated verse or chorus can stay linked, become an independent variation, or start fresh. Section-aware starters translate roles such as chorus, bridge, and outro into different recommendation intentions while leaving every result editable.

## Context ladder

Suggestions appear with chords alone. Emotional intent is one tap. When the selected E and Am shapes actually preserve an open high E, the app asks whether that matters. Only “I move that note” reveals the fret strip. Style remains behind “Refine suggestions,” while the active Song Map section supplies structural context automatically.

## Saving and sharing

Saves use a validated `{ version: 3, songs: [...] }` envelope and include section definitions, arrangement order, selected voicings, and custom shapes. Version 1 and 2 saves migrate into a single editable section; invalid or corrupt browser data returns an empty safe state. Sharing currently stays intentionally compact and exports the active section’s chords and selected key, for example `?v=1&chords=E%2CAm&key=A-minor`.

## Where to add new musical rules

- Chord symbols and tone formulas: `src/core/theory/chords.ts`
- Key detection and Roman numerals: `src/core/theory/analysis.ts`
- Borrowed-chord and voice-leading evidence: `src/core/theory/analysis.ts`
- Candidate routes, explanation templates, and ranking weights: `src/core/suggestions/engine.ts`
- Progression pattern data: add `src/data/progressionPatterns` and consume it in the suggestion engine.
- Guitar shapes: `src/core/guitar/voicings.ts`
- Top-note and future context rules: `src/core/context`
- Browser persistence, clipboard, and sound: `src/platform`

## Mobile portability

All musical and data logic is plain TypeScript with no React, DOM, storage, or audio access. A future Capacitor shell can reuse the Vite build and replace only the adapters in `src/platform`: native preferences/files for storage, native share/clipboard integrations, and a lifecycle-aware audio implementation. Mobile audio should explicitly handle interruption, silent mode, route changes, and app backgrounding.

## Current limitations and roadmap

The first release covers common major/minor/dominant-seventh songwriting chords in standard tuning with open and movable E/A-form shapes. Extensions currently need a curated shape. It does not attempt exhaustive jazz notation, alternate tunings, rhythmic notation, a full fretboard, recording, transcription, or cloud sync. Missing guitar shapes do not block harmonic analysis.

Possible later work: installable PWA behavior; Capacitor packaging and store releases; capo, left-handed and user-created shapes; alternate tunings; MIDI input/export and DAW export; bass lines, rhythm and melody harmonization; microphone recognition and rough-idea recording; cloud accounts, collaboration, native share sheets, offline mobile storage, haptics, richer sounds, and larger genre/section pattern libraries.

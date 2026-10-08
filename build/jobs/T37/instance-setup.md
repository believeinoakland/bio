# instance-setup (T37)

**Status** · session_01BJWkvPGgpsKkM8XcBPtB1a · depth 2 · WORKING · handled B0

## J1 · QUESTION

Four readings I am building on; each is mine unless you answer otherwise (none blocks the job).
1. R68 "sibling `.means` or `.does` entry": for a key k (not itself ending `.means`/`.does`), drop its last segment, then more, and take the first `<prefix>.means` or `<prefix>.does` held (prefix of at least 2 segments). So `weight.reversible.name` → `weight.reversible.means`, `act.publish.label.ceremony` → `act.publish.does`, `column.money.figure.name` → none (`.shows` is not named). 284 of 921 words get a `means`; a `.means`/`.does` word itself has `means: null`. No key in e08cd35ecb has both.
2. `translationdraftrecord`'s body (the door's hand-back, control-plane T37-33): `{direction, language, keys?|key, words, draft, not_drafted?}` with `by` stamped from the query; `draft` is agent-worker R70's `draft` as answered (`{words: [{key, text}]}` or `{key, english}`), `words` what `translationdraft` answered. The route re-runs `translationdraft`'s refusals before recording, so a stale hand-back records nothing. For `to_english` the SHA-256 recorded is that of `words[0].text` (the kept text the reading read).
3. R55: `assistantGate()` returns `credentials.aiKeptAway()` as given; if that provider throws (credentials says it never does), the gate answers `STORE_DID_NOT_ANSWER` (fail closed, no copy of AI_KEPT_AWAY). R65's second check (the door's `assistant.on === false` while the gate answers null, a keep-away lifted between the two reads) answers `ASSISTANT_DRAFT_UNAVAILABLE`, not a minted AI_KEPT_AWAY.
4. The new codes take C-64.11 onward in R67–R73's order (C-119.5 stays retired, unused).

## J2 · QUESTION

Replaces J1 (its four readings unchanged), adding a fifth that needs your act.
1. R68 "sibling `.means` or `.does` entry": for a key k (not itself ending `.means`/`.does`), drop its last segment, then more, and take the first `<prefix>.means` or `<prefix>.does` held (prefix of at least 2 segments). So `weight.reversible.name` → `weight.reversible.means`, `act.publish.label.ceremony` → `act.publish.does`, `column.money.figure.name` → none (`.shows` is not named). 284 of 921 words get a `means`; a `.means`/`.does` word itself has `means: null`. No key in e08cd35ecb has both.
2. `translationdraftrecord`'s body (the door's hand-back, control-plane T37-33): `{direction, language, keys?|key, words, draft, not_drafted?}` with `by` stamped from the query; `draft` is agent-worker R70's `draft` as answered (`{words: [{key, text}]}` or `{key, english}`), `words` what `translationdraft` answered. The route re-runs `translationdraft`'s refusals before recording, so a stale hand-back records nothing. For `to_english` the SHA-256 recorded is that of `words[0].text` (the kept text the reading read).
3. R55: `assistantGate()` returns `credentials.aiKeptAway()` as given; if that provider throws (credentials says it never does), the gate answers `STORE_DID_NOT_ANSWER` (fail closed, no copy of AI_KEPT_AWAY). R65's second check (the door's `assistant.on === false` while the gate answers null, a keep-away lifted between the two reads) answers `ASSISTANT_DRAFT_UNAVAILABLE`, not a minted AI_KEPT_AWAY.
4. The new codes take C-64.11 onward in R67–R73's order (C-119.5 stays retired, unused).
5. **Needs a `modules.json` edit (yours):** R68's word list, carried as generated data beside the code (your START), lives in a new file `bio-plane/src/setup-words.mjs` (about 165 KB, 921 entries, written by a small generator from `words.json` at e08cd35ecb, with a test that it equals the file). My `paths` are three files today (`setup.mjs`, `setup-fleet.mjs`, `livefire.mjs`), so ownership will refuse it: please add `bio-plane/src/setup-words.mjs` to instance-setup's `paths` on `tranche/T37`. I am writing it there now; if you would rather it live elsewhere, say where.

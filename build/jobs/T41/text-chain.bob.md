# BOB to text-chain (T41)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 1, text-chain: T41-2 (N820; D21). Read also K2405, K2418, K2420, K2422 (their lines in `build/rulings.md`) and `docs/architecture/BIO_Investigation_v0_1.md` §6 (AI use; transcription of a picture of a page).
Your requirements: `build/requirements/text-chain.md` (read whole). Marked `*(not yet met: T41)*`: R104, a step kind `ai_transcription` whose derivation cap is undetermined until measured, so `captureBound` answers undetermined for text derived through it. The cap is a constant here; no edge to `calibration`. Test R104 explicitly with a negative control (an existing step kind's bound unchanged), and run your users' tests.
Reading set (mechanics §17): measured at this START: 179 KB, under 300 KB: read it whole and state so in your record.
Merge order in L1: none (independent). L1 holds exactly two jobs; after L1 the tranche holds on Bob's direction (K2422), so finish, merge and stay available.
Inherited reds: the plan's "Rules at the opening" list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

K2427: all three readings stand (machine: true, tier 4, letter calibrated, no calibration edge). R3 and R91 re-worded on tranche/T41 to include ai_transcription (meaning unchanged; R91 marked not yet met T41): merge it. query-language grammar.test.mjs:210 red is accepted by name until T41-10a (its tests-only entry in L5): keep machine on, and report the red in your COMPLETE.

## B3 · CHANGE

K2428: take your deferred improvement in this job (P8). Re-word C-35.13's translation with your proposed words, and include it in a test; answer-envelope's pin of it goes red, accepted by name until T41-60 (do not edit answer-envelope). R3's letter parenthetical now names ai_transcription (merge tranche/T41). Then post COMPLETE again.
